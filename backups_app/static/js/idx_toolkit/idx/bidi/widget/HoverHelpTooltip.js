/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2013 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
 define([
	"dojo/_base/declare",
	"dojo/_base/sniff", // has("ie") 
	"dojo/_base/array", // array.forEach
	"dijit/_BidiSupport"
], function(declare, has, array){
	return declare("idx.bidi.widget.HoverHelpTooltip", [], {
		
		_setTextDirAttr: function(/*String*/ textDir){
				if(!this._created || this.textDir != textDir){
					this._set("textDir", textDir);
					this.propagateTextDir(this.containerNode);		
			}
		},
		
		propagateTextDir: function(/*Object*/node){            
            this.applyTextDir(node, has("ie") ? node.outerText : node.textContent);
            array.forEach(node.children, function(child){
                this.propagateTextDir(child);
            }, this);
        }
	});
});