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
	return declare("idx.bidi.form.Link", [], {
		
		_setTextDirAttr: function(textDir){
			if(textDir &&((this.textDir != textDir) || !this._created)){
				this._set("textDir", textDir);
				this.applyTextDir(this.linkNode, this.linkNode.innerHTML);				
			}
		},
		_setLabelAttr: function(/*String*/ content){			
			this.linkNode.innerHTML = content;
			if(this.textDir === "auto"){
				this.applyTextDir(this.linkNode, content);
			}
		}
	});
});