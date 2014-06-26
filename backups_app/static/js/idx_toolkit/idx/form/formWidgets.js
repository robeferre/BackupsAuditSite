/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/lang","idx/main","dojo/dom-attr","dijit/form/_FormWidget","../string"],
		function(dLang,			// (dojo/_base/lang)
				 iMain,			// (idx)
				 dDomAttr,		// (dojo/dom-attr) for (dDomAttr.set)
				 dFormWidget,	// (dijit/form/_FormWidget)
				 iString) 		// (../string)
{
	var iFormWidgets = dLang.getObject("form.formWidgets", iMain);
	
	/**
	 * @name idx.form.formWidgets
	 * @class Extension to dijit.form._FormWidget to add support for an "accessKey" attribute that gets
	 *        set on the INPUT node if it is also the "focus node".  This allows for keyboard shortcuts
	 *        to be created for form widgets (e.g.: global search fields).
	 */
dojo.extend(dFormWidget, /** @lends idx.form.formWidgets# */ {	
	/**
	 * The desired access key for this form widget. 
	 */
	accessKey: "",
	
	/**
	 * If the focus node is the INPUT node, then set its access key.
	 * @function
	 * @private
	 */
	_setAccessKeyAttr: function(accessKey) {
		this.accessKey = accessKey;
		if (iString.nullTrim(accessKey)) {
			if ((this.focusNode) && (this.focusNode.tagName == "INPUT")) {
				dDomAttr.set(this.focusNode, "accessKey", accessKey);
			}
		}
	}
});

	return iFormWidgets;
});
