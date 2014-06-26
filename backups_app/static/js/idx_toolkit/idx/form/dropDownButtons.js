/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/lang","idx/main","dojo/dom-class","dijit/form/DropDownButton"],
	   function(dLang,				// (dojo/_base/lang)
		        iMain,				// (idx)
		        dDomClass,			// (dojo/dom-class) for (dDomclass.add/remove)
		        dDropDownButton) 	// (dijit/form/DropDownButton)
{
	/**
	 * @name idx.form.dropDownButtons
	 * @class Extension to dijit.form.DropDownButton to add the "idxDropDownOpen" CSS class whenever
	 *        the DropDownButton is opened.  This allows for alternate styling on the widget when it is
	 *        has its drop-down in the open state.  This is included with "idx.ext".
	 */
	var iDropDownButtons = dLang.getObject("form.dropDownButtons", true, iMain);
	
	// get the dropDown button prototype
    var dropDownProto  = dDropDownButton.prototype;
    
	// 
	// Get the base functions so we can call them from our overrides
	//
	var baseDropDownOpen  = dropDownProto.openDropDown;
	var baseDropDownClose = dropDownProto.closeDropDown;
	
	/**
	 * Overrides dijit.form.Button.buildRendering to respect CSS options.
	 */
	if (baseDropDownOpen) {
		dropDownProto.openDropDown = function() {
			var result = baseDropDownOpen.apply(this, arguments);
			if (this._opened) dDomClass.add(this.domNode, "idxDropDownOpen");
			return result;
		};
	};
	
	if (baseDropDownClose) {
		dropDownProto.closeDropDown = function(focus) {
			var result = baseDropDownClose.apply(this, arguments);
			dDomClass.remove(this.domNode, "idxDropDownOpen");
			return result;
		};
	}	
	
	return iDropDownButtons;
});