/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2013 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
 define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dijit/_BidiSupport"
], function(declare, array){
	return declare("idx.bidi.form.CheckBoxSelect", [], {
		
		_getMenuItemForOption: function(/*dijit.form.__SelectOption*/ option){
			var item = this.inherited(arguments);
			item.set("textDir", this.textDir);
			return item;
		},
		
		_setTextDirAttr: function(textDir){
			if(textDir &&((this.textDir != textDir) || !this._created)){
				this._set("textDir", textDir);
				this.applyTextDir(this.compLabelNode, this.label);
				array.forEach(this._getChildren(), function(childNode){
					childNode.set("textDir", textDir);
				}, this);
			}
		},
		
		_setLabelAttr: function(/*String*/ content){			
			this.inherited(arguments);			
			if(this.textDir === "auto"){
				this.applyTextDir(this.compLabelNode, this.label);
			}
		}
	});
});