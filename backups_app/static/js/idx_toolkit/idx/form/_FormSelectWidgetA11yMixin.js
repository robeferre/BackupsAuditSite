/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/array", // array.filter array.forEach array.map array.some
	"dojo/_base/declare" // declare
],function(array, declare){
	return declare("idx.form._FormSelectWidgetA11yMixin",[],{
		_updateSelection: function(){
			this.inherited(arguments);
			array.forEach(this._getChildren(), function(child){
				child.domNode.removeAttribute("aria-selected");
			}, this);
		}
	});
});
