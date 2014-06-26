/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/**
 * @name idx.tooltips
 * @deprecated
 * @class <b>Deprecated:</b> This module provided fixes for BiDi for Dojo 1.6, but is no longer needed in
 *        Dojo 1.7 and beyond.  This module was previously included by idx/ext, but if
 *        you depended on it directly you can now remove the dependency since the defect
 *        was fixed in Dojo 1.7.
 */
define(["dojo/_base/lang","idx/main","dojo/_base/kernel","dijit/Tooltip","./util"],
	   function(dLang,iMain,dKernel,dTooltip,iUtil) {
	var iTooltips = dLang.getObject("tooltips", true, iMain);
	dKernel.deprecated("idx.tooltips","idx.tooltips deprecated. The idx/tooltips module is no longer needed since Dojo 1.7");
	
//	var dMasterTooltip = dTooltip._MasterTooltip;	
//  var masterProto = dMasterTooltip.prototype;
//    
//    if ((dKernel.version.major == 1) && (dKernel.version.minor < 7)) {
//		console.log("****************");
//    	console.log("****** Replacing dijit._MasterTooltip.show function for pre-1.7 Dojo");
//		console.log("****************");
//		
//		var origShow = masterProto.show;
//		
//   	masterProto.show = function(innerHTML, aroundNode, pos, rtl) {
//			if(this.aroundNode && this.aroundNode === aroundNode){
//				return;
//			}
//    		origShow.call(this, innerHTML, aroundNode, pos, rtl);
//    		
//			if (iUtil.isFF || (iUtil.isIE < 8)) {
//				var s = this.domNode.style;
//				var l = dKernel._isBodyLtr();
//				s[l ? "right" : "left"] = "auto";
//			}
//   	};
//    	    	
//  }
	
    return iTooltips;
});