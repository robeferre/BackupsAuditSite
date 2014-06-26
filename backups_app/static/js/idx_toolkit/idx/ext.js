/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2011, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/**
 * @name idx.ext
 * @class This module is a placeholder to automatically require all "extension" modules
 *        from IDX.  Extensions modules typically perform prototype modification of the
 *        Dojo modules to either work around known defects (often with respect to BiDi or
 *        a11y) or to add features or additional styling capabilities to the base dojo 
 *        widgets.
 */
define(["dojo/_base/lang",
        "idx/main",
        "./widgets",
        "./containers",
        "./trees",
        "./form/formWidgets",
        "./form/buttons",
        "./form/comboButtons",
        "./form/dropDownButtons",
        "./grid/treeGrids",
        "dijit/_base/manager"],  // temporarily resolves parser issue with dijit.byId
        function(dLang,iMain) {
	return dLang.getObject("ext", true, iMain);
});
