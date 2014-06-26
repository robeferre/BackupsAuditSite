/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang", 
	"dojo/aspect",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/on",
	"dojo/touch",
	"dojo/query",
	"./OverlayComboBoxMenu",
	"dojo/text!../../mobileTemplates/ComboBox.html"
], function(declare, lang, aspect, domClass, domStyle, domAttr, on, touch, query, OverlayComboBoxMenu, template){
	
	return declare(null, {
		/**
		 * 
		 */
		baseClass: "idxMobileComboBox",
		/**
		 * 
		 */
		oneuiBaseClass: "dijitTextBox dijitComboBox",
		/**
		 * 
		 */
		templateString: template,
		/**
		 * 
		 * Set the dropDownClass to OverlayComboBoxMenu and create dropDown widget
		 * before the function _startSearch in _AutoCompleteMixin.js
		 * 
		 */
		dropDownClass: OverlayComboBoxMenu,
		/**
		 * 
		 * @param {Object} scope
		 * @param {Object} bShow
		 */
		showHintMessage: function( scope, bShow ){
			var nodeList = query(".dijitPlaceHolder", scope.domNode);
			if ( nodeList.length >0){
				var node = nodeList[0];
				domStyle.set(node, "display", bShow ? "": "none");
			}
		},

		/**
		 * 
		 */
		postCreate: function(scope){
			var self = this;
			if (scope.inputNode){
				touch.press(scope.inputNode, function(){
					if (scope.dropDown) {
						scope.dropDown.hide();
					}
					self.showHintMessage(scope, false);
				});
				
			}
			domAttr.set(scope.focusNode, "readonly", "readonly");
			scope.own(
				on(scope._buttonNode, touch.press, lang.hitch(scope,"_onDropDownMouseDown") ),
				on(scope.focusNode, touch.press, function(){
					domAttr.remove(scope.focusNode, "readonly");
					
				}),
				on(scope.focusNode, "focus", function(){
					self.showHintMessage(scope, false);
				}),
				on(scope.focusNode, "blur",function(){
					domAttr.set(scope.focusNode, "readonly", "readonly");
					if ( !scope.focusNode.value ){
						self.showHintMessage(scope, true);
					}
				})
			);

			aspect.after(scope, "onSearch", lang.hitch(scope, "_openResultList"), true);
		},
		/**
		 * 
		 * @param {Object} message
		 */
		displayMessage: function(scope, message){
			if(message){
				scope.validationMessage.innerHTML = message;
			}
		},
		/**
		 * 
		 */
		closeDropDown: function(scope){
			domClass.remove(scope.helpContainer, "dijitHidden");
			domClass.remove(scope.validationContainer, "dijitHidden");
		},
		
		/**
		 * Set the flag inProcessInput when user input on mobile
		 */
		onInput: function(){
			this.inProcessInput = true;
			this.inherited(arguments);
		},
		/**
		 * 
		 */
		loadDropDown: function(scope){
			scope.inProcessInput = false;
			scope._startSearch(scope.focusNode.value);
		}, 
		/**
		 * 
		 */
		openDropDown: function(scope){
			//
			//	Do not show anything
			//
			
			if ( scope.inProcessInput )
				return;
			domClass.add(scope.helpContainer, "dijitHidden");
			domClass.add(scope.validationContainer, "dijitHidden");
			scope.dropDown.show(scope.dropDown.containerNode, ['above-centered','below-centered','after','before']);
		},
		/**
		 * @param {Object} scope
		 * @param {Object} helpText
		 */
		_setHelpAttr: function(scope, helpText){
			scope._set("help", helpText);
			if(scope.helpContainer){
				domStyle.set(scope.helpContainer, "display", helpText ? "block": "none");
				scope.helpMessage.innerHTML = helpText;
			}
		}
	});
});