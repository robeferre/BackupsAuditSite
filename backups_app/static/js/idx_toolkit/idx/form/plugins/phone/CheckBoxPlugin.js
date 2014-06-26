/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/has",
	"dojo/_base/lang",
	"dojo/text!../../mobileTemplates/CheckBox.html"
], function(declare, has, lang,  template){
	
	return declare(null, 
	{
		// summary:
		// 		One UI version CheckBox
				
		templateString: template,
		/**
		 * 
		 */
		baseClass: "idxMobileCheckBox",
		
		/**
		 * 
		 */
		_setDisabledAttr: function(){
			this.inherited(arguments);
			this._refreshState();
		},
		/**
		 * Remove the HoverHelpTooltip message show in Mobile
		 */
		/**
		 * 
		 * @param {Object} message
		 */
		displayMessage: function(scope, message){
			if(message){
				scope.validationMessage.innerHTML = message;
			}
		}
	});
});