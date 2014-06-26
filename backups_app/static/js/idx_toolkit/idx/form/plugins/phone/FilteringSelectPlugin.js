/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/touch",
	"dojo/dom-style",
	"./ComboBoxPlugin"
], function(declare, touch, domStyle, ComboBoxPlugin) {
	return declare(ComboBoxPlugin, {
		/**
		 * 
		 */
		baseClass: "idxMobileFilteringSelect",
		
		/**
		 * 
		 * @param {Object} helpText
		 */
		_setHelpAttr: function(scope, helpText){
			scope._set("help", helpText);
			if(scope.helpContainer){
				domStyle.set(scope.helpContainer, "display", helpText ? "block": "none");
				scope.helpMessage.innerHTML = helpText;
			}
		},
		/**
		 * As the _HasDropDown can trigger the setBlurValue
		 * FilteringSelect does not use the _HasDropDown feature
		 * Need to handle the condition when use delete the value in MappedTextBox
		 * Defect 11724
		 */
		_onBlur: function(scope){

			if ( !!scope.item && scope.item.name !== scope.getDisplayedValue() ){
				scope.item = undefined;
			}
			scope.validate(scope.focused);
		}
	});	
	
});
