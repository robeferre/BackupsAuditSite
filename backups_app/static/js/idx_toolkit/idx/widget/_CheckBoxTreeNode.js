/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/on",
	"dojo/mouse",
	"dojo/keys",
	"dijit/registry",
	"dojo/text!./templates/_CheckBoxTreeNode.html",
	"dijit/Tree"
], function(declare, array, domStyle, domClass, on, mouse, keys, registry, template){
	
	// module:
	//		oneui/_CheckBoxTreeNode
	// summary:
	//		Single node within a CheckBoxTree. This class is used internally
	//		by CheckBoxTree and should not be accessed directly.
	
	return declare("idx.widget._CheckBoxTreeNode", [dijit._TreeNode], {
		// summary:
		//		Single node within a CheckBoxTree. This class is used internally
		//		by CheckBoxTree and should not be accessed directly.
		// tags:
		//		private
		
		templateString: template,
		
		_stateLabels: {
			"False": '&#9633;',
			"True": '&#8730;',
			"Mixed": '&#9632;'
		},
		/**
		 * 
		 */
		states: [false, "mixed", true],
		/**
		 * The current state of the TriStateCheckBox
		 * @type Integer
		 * @private
		 */
		_currentState: 0,
		//true, false or 'mixed'
		checked : false,
		hasMixState: false, 
		// lastState: Boolean|String
		//		Last check state of the item
		lastState: false,
		
		// For hover effect for tree node, and focus effect for label
		cssStateNodes: {
			labelNode: "dijitTreeLabel"
		},
		/**
		 * 
		 * @param {Object} bKeyPress: is this event is triggered by keyboard or mouse 
		 */
		handleCheckBoxClick: function( bKeyPress ){
			this._currentState = (this._currentState + 1) %  this.states.length;
			if ( this._currentState == 1 && !this.hasMixState )
				this._currentState = (this._currentState + 1) %  this.states.length;
			
			var oldState = this._currentState;
			this._currentState = oldState;
			
			var checked = this.states[this._currentState];

			this.updateState(checked);
			
			this.tree.onNodeStateChange(this, checked);
			
			// call dnd selected item
			if ( this.tree && this.tree.dndController)
				this.tree.dndController._onNodeStateChange(this, checked);

			this.tree.focusNode(this);
			//
			// Space key do not need to change the Hover state
			//
			if ( !bKeyPress ){
				domClass.remove(this.checkboxNode, "idxOneuiTriStateCheckBoxCheckedHover");
				domClass.remove(this.checkboxNode, "idxOneuiTriStateCheckBoxHover");
				domClass.remove(this.checkboxNode, "idxOneuiTriStateCheckBoxMixedHover");
				if(checked === true){
					domClass.add(this.checkboxNode, "idxOneuiTriStateCheckBoxCheckedHover");
				}else if (checked === false){
					domClass.add(this.checkboxNode, "idxOneuiTriStateCheckBoxHover");
				}
				else if ( checked === 'mixed'){
					domClass.add(this.checkboxNode, "idxOneuiTriStateCheckBoxMixedHover");
				}
			}
			
		},
		
		postCreate: function(){

			this.set("lastState", false);
			this.connect(this.focusNode, "onkeydown", "_labelKeyDownHandler");
					
			// add event handler to checkboxNode
			// replace of the TriStateCheckBox widget
			var self = this;
			on(this.checkboxNode, mouse.enter, function(event){
				var value = self.getChecked(); 
				if(value === true){
					domClass.add(this, "idxOneuiTriStateCheckBoxCheckedHover");
				}else if (value === false){
					domClass.add(this, "idxOneuiTriStateCheckBoxHover");
				}
				else if ( value === 'mixed'){
					domClass.add(this, "idxOneuiTriStateCheckBoxMixedHover");
				}
			});
			on(this.checkboxNode, mouse.leave, function(event){
				domClass.remove(this, "idxOneuiTriStateCheckBoxCheckedHover");
				domClass.remove(this, "idxOneuiTriStateCheckBoxHover");
				domClass.remove(this, "idxOneuiTriStateCheckBoxMixedHover");
			});
			
		},
		
		updateState: function(/*Boolean|String*/ value){
			// Update the check state for the current node, parent nodes and
			// children nodes.
			if(value == undefined){
				value = this.getChecked();
			}
			else
				this.setChecked(value);
			
			this.set("lastState", value);
			this.updateChildren();
			this.updateParent();
			this.setSelected(value);
			
		},
		
		updateChildren: function(){

			// summmary:
			//		Deal with children
			var children = this.getChildren();
			if(children && children.length > 0){
				if(this.checked == true){
					//Select all children
					array.forEach(children, function(child, idx){
						child.setChecked(true);
						child.updateChildren();
					});
				}else if(this.checked == false){
					//Deselect all children
					array.forEach(children, function(child, idx){
						child.setChecked(false);
						child.updateChildren();
					});
				}else{
					// Resume all children state
					array.forEach(children, function(child, idx){
						var lastState =  child.get("lastState");
						child.setChecked(lastState);
						child.updateChildren();
					});
				}
			}else{
				var self = this;
				// Update the item status in this.tree._itemStatus map
				function updateChildrenStatus(item){
					self.tree.model.getChildren(item, function(items){
						// Loop the items
						for(var i = 0; i < items.length; i++){
							self.tree._itemStatus[self.tree.model.getIdentity(items[i])] = self.checked;
							updateChildrenStatus(items[i]);
						}
					});
				}
				updateChildrenStatus(self.item);
			}
			
		},
		
		updateParent: function(){
			// summary:
			//		Deal with parent node
			var parentNodes = this.tree.getNodesByItem(this.getParent() ? this.getParent().item : null);
			if(parentNodes && parentNodes[0]){
				var parentNode = parentNodes[0];
				parentNode.update();
				parentNode.updateParent();
			}else{
				return;
			}
		},
		/**
		 * Calculate the state of current node according to the children state
		 */
		update: function(){
			// summary:
			//		Update the state of the node according to its' children's states
			var siblings = this.getChildren();
			var checked = 0;
			var mixed = 0;
			for(var i = 0; i < siblings.length; i++){
				var isChecked = siblings[i].getChecked();
				siblings[i].set("lastState", isChecked);
				switch(isChecked){
					case true: checked++;
						break;
					case "mixed": mixed++;
						break;
				}
			}
			this.hasMixState = false;
			if(checked > 0 && checked == siblings.length){
				this.setChecked(true);
			}else if(checked == 0 && mixed == 0){
				this.setChecked(false);
			}else{
				this.hasMixState = true;
				this.setChecked("mixed");
			}
			this.set("lastState", this.checked );
		},
		/**
		 * Public function to get the Checked state of a CheckBoxTreeNode 
		 */
		getChecked: function(){
			return this.checked;
		},
		/**
		 * update the current node checked state and style change
		 * not change parent and children node state
		 * @param {Object} Boolean|String value
		 */
		setChecked: function(/*Boolean|String*/ value){
			var oldValue = this.checked;
			this.checked = value;
			domClass.remove(this.checkboxNode, "idxOneuiTriStateCheckBoxChecked");
			domClass.remove(this.checkboxNode, "idxOneuiTriStateCheckBoxMixed"); 
			this.focusNode.setAttribute("aria-checked", value);
			if(value === true){
				this._currentState = 2;
				domClass.add(this.checkboxNode, "idxOneuiTriStateCheckBoxChecked");
			}else if (value === false){
				this._currentState = 0;
			}
			else if ( value === 'mixed'){
				this._currentState = 1;
				domClass.add(this.checkboxNode, "idxOneuiTriStateCheckBoxMixed");
			}
			this.tree._itemStatus[this.tree.model.getIdentity(this.item)] = value;
			// update state for the HC Mode
			var stateValueStr = value ? (value == "mixed" ? "Mixed" : "True") : "False";
			this.stateLabelNode.innerHTML = this._stateLabels[stateValueStr];
			
			//
			// Add here for DND drag drop back defect 11616
			//
			if (oldValue != value){
				this.tree._onNodeStateChange(this, value);
			} 
		},
		
		setSelected: function(/*Boolean*/ selected){
			// summary:
			//		A Tree has a (single) currently selected node.
			//		Mark that this node is/isn't that currently selected node.
			// description
			//		In particular, setting a node as selected involves setting tabIndex
			//		so that when user tabs to the tree, focus will go to that node (only).
			//this.focusNode.setAttribute("aria-selected", selected);
		},
		
		getParent: function(){
			// summary:
			// Returns the parent widget of this widget.
			return (this.domNode&&this.domNode.parentNode) ? registry.getEnclosingWidget(this.domNode.parentNode) : null;
		}, 
		
		_labelKeyDownHandler: function(/*Event*/ evt){
			// summary:
			//		Handler key press on the label node.
			var dk = keys;
			if(evt.keyCode == dk.SPACE || evt.keyCode == dk.ENTER ){
				this.handleCheckBoxClick( true );				
			}
		}
	});
});