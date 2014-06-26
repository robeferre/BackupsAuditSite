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
	"idx/form/_RadioButtonSetItem",
	"dojox/mobile/scrollable",
	"dojo/text!../../mobileTemplates/RadioButtonSet.html"
], function(declare, lang, array, domClass, _RadioButtonSetItem, Scrollable, template){

	return declare(null, 
	/**@lends idx.form.RadioButtonSet.prototype*/
	{
		baseClass: "idxMobileRadioButtonSet",
		/**
		 * 
		 */
		templateString: template,
		/**
		 * 
		 */
		_errorIconWidth: 45,
		/**
		 * 
		 */
		startup: function(scope){
			
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
		_addOptionItem: function(scope,/* dojox.form.__SelectOption */ option){
			var item = new _RadioButtonSetItem({
				_inputId: scope.id + "_RadioItem" + array.indexOf(scope.options, option),
				option: option,
				name: scope.name,
				disabled: option.disabled || scope.disabled || false,
				readOnly: option.readOnly || scope.readOnly || false,
				parent: scope
			});
			
			domClass.toggle(item.domNode, "dijitInline", !(scope.groupAlignment == "vertical"));
			scope.addChild(item);
			scope.radioButtonSetItems.push(item);
			if(option.selected){
				scope.lastFocusedChild = item;
			}

		},
		/**
		 * 
		 */
		destroy: function(){
			if ( this.scrollable){
				this.scrollable.cleanup();
				this.scrollable.destroy();
			}
				
		}
	});

});
