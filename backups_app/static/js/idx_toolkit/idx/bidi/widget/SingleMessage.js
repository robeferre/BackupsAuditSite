/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2013 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
 define([
	"dojo/_base/declare",
	"dojo/_base/sniff",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dijit/_BidiSupport"
], function(declare, has, lang, domAttr){
	return declare("idx.bidi.widget.SingleMessage", [], {
		
		_setTextDirAttr: function(/*String*/ textDir){
				if(!this._created || this.textDir != textDir){
					this._set("textDir", textDir);
					this._enforceTitleDirection();
					this.applyTextDir(this.descriptionNode, this.descriptionNode.innerHTML);
			}
		},
		
		_enforceTitleDirection: function(){
			if (this.titleNode.firstChild) {
				this.applyTextDir(this.titleNode.firstChild, this.titleNode.firstChild.innerHTML);
			}
		},
		
		_setDescriptionAttr: function(value){
			this._set("description", value);
			domAttr.set(this.descriptionNode, "innerHTML", value);
			this.applyTextDir(this.descriptionNode, this.descriptionNode.innerHTML);
		}
	});
});