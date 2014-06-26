/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dijit/_Widget",
	"dijit/_CssStateMixin",
	"dijit/_TemplatedMixin",
	"idx/form/_InputListItemMixin",
	"dijit/form/CheckBox"
], function(declare, domConstruct, _Widget, _CssStateMixin, _TemplatedMixin, _InputListItemMixin, CheckBox){
	//	module:
	//		idx/form/_CheckBoxListItem
	//	summary:
	//		An internal used list item for CheckBoxList.
	
	return declare("idx.form._CheckBoxListItem", [_Widget, _CssStateMixin, _TemplatedMixin, _InputListItemMixin], {
		//	summary:
		//		An internal used list item for CheckBoxList.
		
		templateString: "<div class='dijitReset ${baseClass}'><label for='${_inputId}' dojoAttachPoint='labelNode'></label></div>",
		
		baseClass: "idxCheckBoxListItem",
		
		postMixInProperties: function(){
			this.focusNode = new CheckBox({
				id: this._inputId
			});
			this.inherited(arguments);
		},
		
		postCreate: function(){
			domConstruct.place(this.focusNode.domNode, this.domNode, "first");
			this.inherited(arguments);
		},
		
		_changeBox: function(){
			// summary:
			//		Called to force the select to match the state of the check box
			//		(only on click of the checkbox)	 Radio-based calls _setValueAttr
			//		instead.
			if(this.get("disabled") || this.get("readOnly")){ return; }
			this.option.selected = !!this.focusNode.get("checked");
			this.parent.set("value",  this.parent.getValueFromOpts(this.option));
			this.parent.focusChild(this);
		},
		destroy: function(){
			this.focusNode.destroy();
			this.inherited(arguments);
		}
	});
});