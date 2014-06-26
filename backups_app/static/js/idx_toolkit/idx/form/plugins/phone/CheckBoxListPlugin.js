/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-construct",
	"dojo/touch",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"idx/form/_CssStateMixin",
	"idx/form/_InputListItemMixin",
	"idx/form/_CheckBoxListItem",
	"idx/form/CheckBox",
	"dojox/mobile/scrollable",
	"dojo/text!../../mobileTemplates/CheckBoxList.html"
], function(declare, lang, array, domClass, domStyle, domConstruct, touch, _Widget, _TemplatedMixin, _CssStateMixin, _InputListItemMixin, _CheckBoxListItem, CheckBox, Scrollable, template){

	/**
	 * Not Extend _InputListItemMixin for mobile plugin
	 */
	var MobileCheckBoxListItem = declare([_Widget, _CssStateMixin, _TemplatedMixin, _InputListItemMixin],{
		/**
		 * 
		 * @param {Object} option
		 */
		templateString: "<div class='dijitReset ${baseClass}'><label for='${_inputId}' dojoAttachPoint='labelNode'></label><div class='dijitInline' dojoAttachPoint='stateNode'></div></div>",
		
		baseClass: "idxCheckBoxListItem",
		
		oneuiBaseClass: "",
		
				
		postMixInProperties: function(){
			this.focusNode = new CheckBox({
				id: this._inputId,
				checked: this.option.selected || this.option.checked,
				targetPlatform: this.targetPlatform
			});
			
			this.inherited(arguments);
		},
		
		// disabled: boolean
		//		Whether or not this widget is disabled
		disabled: false,
	
		// readOnly: boolean
		//		Whether or not this widget is readOnly
		readOnly: false,
	
		postCreate: function(){
			domConstruct.place(this.focusNode.domNode, this.domNode, "first");
			//Merge the click function call to the whole DomNode
			var self = this;
			//Clear the click event on checkbox widget

			this.inherited(arguments);
		},

		/**
		 * This function is called in _InputListMixin in function _updateSelection
		 * Do Nothing in Mobile
		 */
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

				
		_setCheckedAttr: function(/*Boolean*/ checked){
			// summary:
			//		Hook so attr('checked', bool) works.
			//		Sets the class and state for the check box.
			domClass.toggle(this.domNode, "dijitCheckedMenuItemChecked", checked);
			this.domNode.setAttribute("aria-checked", checked);
			this._set("checked", checked);
		}
	});
	
	/**
	 * 
	 */
	return declare(null,
	{
		baseClass: "idxMobileCheckBoxList",
		/**
		 * 
		 */
		templateString: template,
		/**
		 * 
		 */
		startup:function(scope){
			scope.scrollable = new Scrollable();
			scope.oneuiBaseNode.style.overflow = "hidden";
			scope.scrollable.init({
				domNode: scope.oneuiBaseNode,
				containerNode: scope.containerNode,
				height: scope.containerNode.clientHeight + 'px'
			});
			
			scope.scrollable.scrollTo({x:0, y:0});
		},
		/**
		 * 
		 */
		destroy: function(){
			if ( this.scrollable){
				this.scrollable.cleanup();
				this.scrollable.destroy();
			}
		},
		/**
		 * 
		 * @param {Object} dojox.form.__SelectOption option
		 */
		_addOptionItem: function(scope, /* dojox.form.__SelectOption */ option){

			var localid = scope.id + "_CheckItem" + array.indexOf(scope.options, option);
			var item = new MobileCheckBoxListItem({
				_inputId: localid,
				option: option,
				disabled: option.disabled || scope.disabled || false,
				readOnly: option.readOnly || scope.readOnly || false,
				parent: scope,
				targetPlatform: scope.targetPlatform
			});
			
			domClass.toggle(item.domNode, "dijitInline", !(scope.groupAlignment == "vertical"));
			scope.addChild(item);
			scope.checkBoxListItems.push(item);

		}
	});
	
});