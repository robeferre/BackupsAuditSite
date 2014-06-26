/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/**
 * @name idx.containers
 * @class Extension module for ensuring "_idxStyleChildren" from "idx.widgets" is called
 *        whenever "addChild" or "removeChild" method is called on a container.  This is
 *        automatically included with "idx.ext" module.
 */
define(["dojo/_base/lang","idx/main","dijit/_Container","dijit/_WidgetBase","idx/widgets"],
	function(dLang,iMain,dContainer) {
	var iContainers = dLang.getObject("containers", true, iMain);
	
	// get the combo button prototype
	var baseProto  = dContainer.prototype;
    
	// 
	// Get the base functions so we can call them from our overrides
	//
	var baseAddChild  = baseProto.addChild;
	var baseRemoveChild = baseProto.removeChild;
	
    baseProto.addChild = function(child,index) {
    	if (baseAddChild) baseAddChild.call(this, child, index);
    	if (this._started) {
    		this._idxStyleChildren();
    	}
    };
    
    baseProto.removeChild = function(child) {
    	if (baseRemoveChild) baseRemoveChild.call(this, child);
    	if (typeof child == "number") {
    		child = this.getChildren()[child];
    	}
    	if (this._started) {
    		this._idxStyleChildren();
    	}
    };    
    
    return iContainers;
});