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
	"dojo/_base/html",
	"dojo/query",
	"dojox/string/BidiComplex",
	"dijit/_BidiSupport"
], function(declare, has, lang, html, query, bidiComplex){
	return declare("idx.bidi.widget.PersonCard", [], {
		
		render: function(prop, value){
			this.inherited(arguments);
			if (prop != "sametime.awareness") {
				var type = prop.split(".")[0];
				var className = "." + this.baseClass + type.charAt(0).toUpperCase() + type.substring(1);
				var element = query(className, this.containerNode)[0];
				if (prop == "photo") {
					this.applyTextDir(element, element.alt);
				}
				else if (prop == "email.internet") {
					element.firstChild.innerHTML = bidiComplex.createDisplayString(element.firstChild.innerHTML, "EMAIL");
				}
				else {
					var value = element.innerHTML;
					var direction = this.getTextDir(value);
					element.innerHTML = "";
					html.create("span", {"dir": direction, innerHTML: value}, element);
				}
			}		
		},
	
		_setTextDirAttr: function(/*String*/ textDir){
			if(!this._created || this.textDir != textDir){
				this._set("textDir", textDir);
				this._setValueAttr(this.value);
			}
		}
	});
});