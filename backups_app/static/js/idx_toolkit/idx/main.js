/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
 
define(["require","dojo/_base/lang","dojo/_base/kernel","dojo/_base/window","dojo/dom-class"], 
	   function(dRequire,dLang,dKernel,dWindow,dDomClass) {
  /**
   * @name idx.main
   * @namespace This serves as the main module for the "idx" package when using "packages" in the "dojo config".
   *            This module's only action is to apply a CSS class to the body tag that identifies the Dojo version
   *            being utilized on the page. 
   */
	var iMain = dLang.getObject("idx", true);
	
	var applyDojoVersionClass = function() {
		var bodyNode = dWindow.body();
		var versionClass = "idx_dojo_" + dKernel.version.major + "_" + dKernel.version.minor;
		dDomClass.add(bodyNode, versionClass);		
	};
	
	var majorVersion = dKernel.version.major;
	var minorVersion = dKernel.version.minor;
	if ((majorVersion < 2) && (minorVersion < 7)) {
		// for dojo 1.6 we need to use "addOnLoad" to ensure the body exists first
		dojo.addOnLoad(applyDojoVersionClass);
	} else {
		// for dojo 1.7 or later we rely on the "dojo/domReady!" dependency
		dRequire(["dojo/domReady!"],applyDojoVersionClass);
	}
	
	return iMain;
});