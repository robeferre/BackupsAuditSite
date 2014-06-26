/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2013 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
 define([
	"dojo/_base/declare",
	"dojo/_base/sniff", // has("ie") 
	"dojo/_base/lang",
	"dojo/query",
	"dojo/dom-class",
	"dojo/fx",
	"dijit/_BidiSupport"
], function(declare, has, lang, query, domClass, fx){
	return declare("idx.bidi.widget.Toaster", [], {
		
		_setTextDirAttr: function(/*String*/ textDir){
				if(!this._created || this.textDir != textDir){
					this._set("textDir", textDir);
					var myToaster = this;
					query(".information").forEach(function(node, index, nodelist){
						// for each node in the array returned by query,
		            	// execute the following code
						myToaster.applyTextDir(node, has("ie") ? node.outerText : node.textContent);
		        	});				
			}
		},
		
		add: function (message) {
	        	domClass.remove(this.toasterNode, "dijitHidden");
	       		var msgNode = this._displayMsg(message);
	        	this.applyTextDir(msgNode, has("ie") ? msgNode.outerText : msgNode.textContent);
	       		fx.wipeIn({node:msgNode, onEnd: lang.hitch(this, "_onMessageDisplayed", msgNode)}).play();
	    	}		
	});
});