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
	return declare("idx.bidi.form.CheckBoxList", [], {
		
		propagateTextDir: function(textDir){
			array.forEach(this.getChildren(), function(childNode){
				this.applyTextDir(childNode.labelNode, childNode.labelNode.innerHTML);
			}, this);
		},
		
		onAfterAddOptionItem: function(item, option){
			this.applyTextDir(item.labelNode, item.labelNode.innerHTML);
			this.inherited(arguments); 
		},
		
		_setTextDirAttr: function(textDir){
			if(textDir &&((this.textDir != textDir) || !this._created)){
				this._set("textDir", textDir);
				this.applyTextDir(this.compLabelNode, this.label);
				this.propagateTextDir(textDir);
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