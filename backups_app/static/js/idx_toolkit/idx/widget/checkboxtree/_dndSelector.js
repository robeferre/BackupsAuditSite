/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/event",
	"dojo/_base/window",
	"dojo/mouse",
	"dojo/on",
	"dojo/touch",
	"dijit/a11yclick",
	"dijit/tree/_dndSelector"
], function(declare, connect, array, lang, event, win, mouse, on, touch, a11yclick, _dndSelector){

	// module:
	//		oneui/checkboxtree/_dndSelector
	// summary:
	//		This is a base class for `oneui.checkboxtree.dndSource` , and isn't meant to be used directly.
	//		It's based on `dijit.tree._dndSelector`.

	return declare("idx.widget.checkboxtree._dndSelector", _dndSelector, {
		// summary:
		//		This is a base class for `oneui.checkboxtree.dndSource` , and isn't meant to be used directly.
		//		It's based on `dijit.tree._dndSelector`.
		// tags:
		//		protected
		
		constructor: function(){
			// summary:
			//		Initialization
			// tags:
			//		private

			this.selection={};
			this.anchor = null;

			this.events.push(
				// listeners setup here but no longer used (left for backwards compatibility
				on(this.tree.domNode, touch.press, lang.hitch(this,"onMouseDown")),
				on(this.tree.domNode, touch.release, lang.hitch(this,"onMouseUp")),

				// listeners used in this module
				on(this.tree, "_onNodeStateChange", this, "_onNodeStateChange"),
				on(this.tree.domNode, touch.move, lang.hitch(this,"onMouseMove")),
				on(this.tree.domNode, a11yclick.press, lang.hitch(this,"onClickPress")),
				on(this.tree.domNode, a11yclick.release, lang.hitch(this,"onClickRelease"))
			);
		},
		//	candidateNode: oneui._TreeNode
		candidateNode: null,
		// mouse events
		onMouseDown: function(e){
			// summary:
			//		Event processor for onmousedown
			// e: Event
			//		mouse event
			// tags:
			//		protected

			// ignore click on not an item
			if(!this.current){ return; }

			if(!mouse.isLeft(e)){ return; }	// ignore right-click

			event.stop(e);

			this.candidateNode = this.current;
			
		},
		
		onMouseUp: function(){
			this.candidateNode = null;
		},
		
		setSelection: function(/*dijit/Tree._TreeNode[]*/ newSelection){
			var oldSelection = this.getSelectedTreeNodes();
			array.forEach(this._setDifference(oldSelection, newSelection), lang.hitch(this, function(node){
				if(node.domNode){
					if(node.checked){return;}
					node.setSelected(false);
					if(this.anchor == node){
						delete this.anchor;
					}
					delete this.selection[node.id];
				}else{
					delete this.selection[node.id];
				}
				
			}));
			array.forEach(this._setDifference(newSelection, oldSelection), lang.hitch(this, function(node){
				node.setSelected(true);
				this.selection[node.id] = node;
			}));
			this._updateSelectionProperties();
		},
	
		_onNodeStateChange: function(/*oneui._TreeNode*/ node, /*Boolean*/ checked){
			// If selected an unchecked item, clean the selection first.
			var nodes = this.getSelectedTreeNodes();
			if(nodes.length == 1 && nodes[0].checkboxNode && nodes[0].checkboxNode.checked === false){
				this.selectNone();
			}
			// Add/Remove node
			if(checked == true){
				this.addTreeNode(node, true);
			}else{
				if(this.selection[ node.id ]) {
					this.removeTreeNode( node );
				}
			}
		}
	});
});
