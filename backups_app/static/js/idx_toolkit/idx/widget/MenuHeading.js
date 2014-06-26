/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare", 
        "dojo/_base/lang",
		"dijit/MenuSeparator",
		"dojo/text!./templates/MenuHeading.html"],
		function(declare,
				 lang,
				 MenuSeparator,
				 template){
	var oneuiRoot = lang.getObject("idx.oneui", true); // for backward compatibility with IDX 1.2

	/**
	 * Creates a new idx.widget.MenuHeading
	 * @name idx.widget.MenuHeading
	 * @class The MenuHeading widget provides a non-selectable, full-width menu entry
	 * suitable for labelling groups of menu items. It is a simple extension of 
	 * dijit.MenuSeparator that allows the item to contain HTML markup instead of just
	 * being a simple horizontal line.
	 * @augments dijit.MenuSeparator
	 * @example &lt;div data-dojo-type="idx.widget.Menu"&gt;
  &lt;div data-dojo-type="idx.widget.MenuHeading"
       data-dojo-props="column:'0',<span class="highlitCode">label:'Column #0'</span>"&gt;
  &lt;/div&gt;
    ...
&lt;/div&gt;
	 */
	return oneuiRoot.MenuHeading = declare("idx.widget.MenuHeading", [MenuSeparator], 
	/** @lends idx.widget.MenuHeading.prototype */
	{
		/**
		 * The text and markup to display in the item.
		 * @type string
		 */		
		label: '',
		
		/**
		 * Standard Dojo setter config for handling the 'label' property via calls to 
		 * set().
		 * @constant
		 * @type Object
		 */
		_setLabelAttr: { node: "containerNode", type: "innerHTML" },

		/**
	 	 * The template HTML for the widget.
		 * @constant
		 * @type string
		 * @private
		 * @default Loaded from idx/widget/templates/MenuHeading.html.
		 */
		templateString: template,
		
		/**
	 	 * The base CSS class name for the widget.
		 * @constant
		 * @type string
		 * @private
		 * @default "oneuiMenuHeading".
		 */
		baseClass: "oneuiMenuHeading"
	});
});
