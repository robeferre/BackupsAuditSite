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
	return declare("idx.bidi.app.Banner", [], {
		
		_setTextDirAttr: function(/*String*/ textDir){
				if(!this._created || this.textDir != textDir){
					this._set("textDir", textDir);
					this.actionsButton._set("textDir", textDir);
					this._updateActionsButtonDisplay();
			}
		}
	});
});