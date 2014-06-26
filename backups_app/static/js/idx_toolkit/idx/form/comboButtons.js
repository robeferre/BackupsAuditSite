/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/lang","idx/main","dojo/dom-attr","dojo/dom-class","dijit/form/ComboButton","../widgets"],
		function(dLang,			// (dojo/_base/lang)
				 iMain,			// (idx)
				 dDomAttr,		// (dojo/dom-attr) for (dDomAttr.set)
				 dDomClass,		// (dojo/dom-class) for (dDomClass.add/remove)
				 dComboButton) 	// (dijit/form/ComboButton)
{
	/**
	 * @name idx.form.comboButtons
	 * @class Extension to dijit.form.ComboButton to add the "idxDropDownOpen" CSS class whenever
	 *        the ComboButton is opened to allow for alternate styling when the ComboButton is in the 
	 *        open state.  This also adds proper tab stops in ComboButtons for keyboard navigation.
	 *        This is included with "idx.ext".
	 */
	var iComboButtons = dLang.getObject("form.comboButtons", true, iMain);
	
	// get the combo button prototype
    var comboProto  = dComboButton.prototype;
    
	// 
	// Get the base functions so we can call them from our overrides
	//
	var baseComboOpen  = comboProto.openDropDown;
	var baseComboClose = comboProto.closeDropDown;
	
	/**
	 * Overrides dijit.form.Button.buildRendering to respect CSS options.
	 */
	if (baseComboOpen) {
		comboProto.openDropDown = function() {
			var result = baseComboOpen.apply(this, arguments);
			if (this._opened) dDomClass.add(this.domNode, "idxDropDownOpen");
			return result;
		};
	};
	
	if (baseComboClose) {
		comboProto.closeDropDown = function(focus) {
			var result = baseComboClose.apply(this, arguments);
			dDomClass.remove(this.domNode, "idxDropDownOpen");
			return result;
		};
	};
	
	var afterBuildRendering = comboProto.idxAfterBuildRendering;
	comboProto.idxAfterBuildRendering = function() {
		if (afterBuildRendering) {
			afterBuildRendering.call(this);
		}
		if (this.titleNode) {
			dDomAttr.set(this.titleNode, "tabindex", ((this.tabIndex) ? (""+this.tabIndex) : "0"));
		}
		if (this._buttonNode) {
			dDomAttr.set(this._buttonNode, "tabindex", ((this.tabIndex) ? (""+this.tabIndex) : "0"));
		}		
	};
	return iComboButtons;
});	
