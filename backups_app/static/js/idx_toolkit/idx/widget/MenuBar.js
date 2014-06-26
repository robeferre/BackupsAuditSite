/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
        "dojo/_base/lang",
		"dijit/MenuBar",
    	"./_MenuOpenOnHoverMixin",
    	"idx/widgets"],
		function(declare,
				 lang,
				 MenuBar,
         _MenuOpenOnHoverMixin){
	var oneuiRoot = lang.getObject("idx.oneui", true); // for backward compatibility with IDX 1.2
	
	/**
	 * Creates an idx.widget.MenuBar
	 * @name idx.widget.MenuBar
	 * @class The MenuBar widget provides a menu bar with open-on-hover behaviour.
	 * It is a simple extension of dijit.MenuBar that makes it
	 * permanently active so that its drop down and cascade menus are always
	 * activated by mouse hover, without the need for the menu bar to
	 * be clicked on first.
	 * @augments dijit.MenuBar
	 * @augments idx.widget._MenuOpenOnHoverMixin
	 * @borrows idx.widget._MenuOpenOnHoverMixin#openOnHover as this.openOnHover
	 * @example &lt;div data-dojo-type="idx.widget.MenuBar"&gt;
  &lt;div data-dojo-type="dijit.PopupMenuBarItem"&gt;
    &lt;span&gt;Edit&lt;/span&gt;
    &lt;div data-dojo-type="idx.widget.Menu"&gt;
      &lt;div data-dojo-type="dijit.MenuItem" onclick="..."&gt;Cut&lt;/div&gt;
      &lt;div data-dojo-type="dijit.MenuItem" onclick="..."&gt;Copy&lt;/div&gt;
      &lt;div data-dojo-type="dijit.MenuItem" onclick="..."&gt;Paste&lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;
	 */
	return oneuiRoot.MenuBar = declare("idx.widget.MenuBar", [MenuBar, _MenuOpenOnHoverMixin], 
	/** @lends idx.widget.MenuBar.prototype */
	{
		/**
		 * Provide an IDX base class to distinguish from Dijit MenuBar in CSS selectors.
		 */
		idxBaseClass: "idxMenuBar"
	});
	
});
