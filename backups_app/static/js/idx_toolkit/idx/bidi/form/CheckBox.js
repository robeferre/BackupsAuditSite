/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2013 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
 define([
	"dojo/_base/declare",
	"dijit/_BidiSupport"
], function(declare){
	return declare("idx.bidi.form.CheckBox", [], {
		
		_setTextDirAttr: function(/*String*/ textDir){
			if(!this._created || this.textDir != textDir){
				this._set("textDir", textDir);
				this.applyTextDir(this.compLabelNode, this.label);
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