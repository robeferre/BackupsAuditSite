/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
		"dojo/_base/declare",
		"dijit/_Widget",
		"dijit/_TemplatedMixin",
		"dojo/dom-attr",
		"../string" ], 
		function(dDeclare,
			     dWidget,
			   	 dTemplatedMixin,
			     dDomAttr,
			     iString){

/**
 * @name idx.widget.DeferredIFrame
 * @class An widget that creates an iFrame that initially points at "blank.html" page, but 
 *        updates to specified "href" parameter upon startup.  This is used to avoid having
 *        the browser (Internet Explorer) process the JavaScript in the loaded source prior
 *        to the iframe being placed at its proper position in the document.
 * @augments dijit._Widget
 * @augments dijit._TemplatedMixin
 */
return dDeclare("idx.widget.DeferredIFrame", [ dWidget, dTemplatedMixin ],
/** @lends idx.widget.DeferredIFrame# */
{
	/**
	 * The template string for this widget.
	 * @default "&lt;iframe&gt;&lt;/iframe&gt;"
	 * @type String
	 */
	templateString: "<iframe></iframe>",

	/**
	 * The URL to use for the "src" of the iframe.
	 * @default ""
	 * @type String
	 */
	href: "",
	
	/**
	 * Overridden to handle setting the "src" attribute on the DOM node for this
	 * widget to the "href" attribute assuming it is non-empty and non-null.
	 * If empty string or null then the "src" attribute is removed.
	 */
	startup: function() {
		if (iString.nullTrim(this.href)) dDomAttr.set(this.domNode, "src", this.href);
		else domAttr.remove(this.domNode, "src");
		this.inherited("startup", arguments);
		this._started = true;
	},
	
	/**
	 * Handler for setting the "href" attribute of the widget to ensure the "src"
	 * attribute of the iframe is updated or removed accordingly.
	 * @param value The new value for the href.
	 */
	_setHrefAttr: function(value) {
		this.href = value;
		if (this._started) {
			if (iString.nullTrim(this.href)) dDomAttr.set(this.domNode, "src", this.href);
			else domAttr.remove(this.domNode, "src");			
		}
	}
});

});
