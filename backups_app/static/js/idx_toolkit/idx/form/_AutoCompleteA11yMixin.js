/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare" // declare
],function(declare){
	return declare("idx.form._AutoCompleteA11yMixin",[],{
		_showResultList: function(){
			var temp = this.domNode;
			this.domNode = this.oneuiBaseNode;
			this.inherited(arguments);
			this.domNode = temp;
		},
		
		closeDropDown: function(){
			var temp = this.domNode;
			this.domNode = this.oneuiBaseNode;
			this.inherited(arguments);
			this.domNode = temp;
		},
		
		_announceOption: function(){
			this.inherited(arguments);
			this.focusNode.removeAttribute("aria-activedescendant");
		}
	});
});
