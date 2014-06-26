/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/dom-attr",
	"dojo/text!../../mobileTemplates/TriStateCheckBox.html"
], function(declare, domAttr, template){
	return declare(null, 
	/**@lends idx.form.TriStateCheckBox.prototype*/
	{
		baseClass: "idxMobileTriStateCheckBox",
		
		
		templateString: template,
		/**
		 * 
		 */
		postCreate: function(scope){
			scope._event = {
				"input" : "onChange"
			}

			domAttr.set(scope.stateLabelNode, 'innerHTML', scope._stateLabels[scope._stateType]);
		},
		
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
