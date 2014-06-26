/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/lang",
        "idx/main",
        "dojo/dom",
        "dojo/dom-attr",
        "dojo/_base/window",
        "./util",
        "idx/app/A11yPrologue"], 
        function(dLang,iMain,dDom,dDomAttr,dWindow,iUtil,iA11yPrologue) {
    /**
 	 * @name idx.a11y
 	 * @namespace Provides functions to support A11y landmarks working in concert with idx.app.A11yPrologue.
 	 * @see idx.app.A11yPrologue
 	 */
	var iA11y = dLang.getObject("a11y", true, iMain);
	
    iA11y._mainNode = null;
    iA11y._navigationNode = null;
    iA11y._bannerNode = null;
    iA11y._a11yStatementURL = "";
    
    /**
     * @private
     * @function
     * @name idx.a11y._getPrologue
     * @description Gets the prologue (if any)
     * @return The first A11yPrologue for the page or null if none.
     */
    iA11y._getPrologue = function() {
		var b = dWindow.body();
		var ap = iUtil.getChildWidget(b, false, iA11yPrologue);
		return ap;
    };
    
    /**
     * @function
     * @public
     * @name idx.a11y.setA11yStatementURL
     * @description Finds the idx.app.A11yPrologue for the page and if it exists, sets the accessibility statement URL for it.
     * @param {String} url The url for the applications accessibility statement.
     */
    iA11y.setA11yStatementURL = function(url) {
    	var ap = iA11y._getPrologue();
    	if (!ap) return;
    	ap.set("a11yStatementURL", url);
    };
    
    /**
     * @function
     * @public
     * @name idx.a11y.getA11yStatementURL
     * @description Returns the accessibility statement URL set via idx.a11y.setA11yStatementURL.  If the URL has been set
     *              directly in the A11yPrologue widget for the current page then this method will not reflect that.
     * @return {String} The url for the applications accessibility statement.
     */
    iA11y.getA11yStatementURL = function() {
    	return iA11y._a11yStatementURL;
    };
    
    /**
     * @function
     * @public
     * @name idx.a11y.isMainAreaRegistered
     * @description Checks if a node is currently registered as the "main content" landmark with idx.a11y.
     * @return {Boolean} Returns true if a node is currently registered otherwise false.
     * @see idx.a11y.registerMainArea
     */
    iA11y.isMainAreaRegistered = function() {
    	return iA11y._mainNode != null;
    };
    
    /**
     * @function
     * @public
     * @name idx.a11y.isNavigationAreaRegistered
     * @description Checks if a node is currently registered as the "navigation" landmark with idx.a11y.
     * @return {Boolean} Returns true if a node is currently registered otherwise false.
     * @see idx.a11y.registerNavigationArea
     */
    iA11y.isNavigationAreaRegistered = function() {
    	return iA11y._navigationNode != null;
    };
    
    /**
     * @function
     * @public
     * @name idx.a11y.isBannerAreaRegistered
     * @description Checks if a node is currently registered as the "banner" landmark with idx.a11y.
     * @return {Boolean} Returns true if a node is currently registered otherwise false.
     * @see idx.a11y.registerNavigationArea
     */
    iA11y.isBannerAreaRegistered = function() {
    	return iA11y._bannerNode != null;
    };
    
    /**
     * @function
     * @private
     * @name idx.a11y._register
     * @description Internal method for registering a landmark.
     * @param {Node|String} nodeOrID The node or ID of the node to register.
     * @param {Node} currentNode The currently registered node.
     * @param {String} attrName The attribute to set on A11yPrologue
     * @param {String} roleName The role name to assign to the node.
     */
    iA11y._register = function(nodeOrID, currentNode, attrName, roleName) {
    	// get the node
    	var node = nodeOrID;
    	if (iUtil.typeOfObject(nodeOrID) == "string") {
    		node = dojo.byId(nodeOrID);
    		if (!node) {
				throw new Error("Could not find node for ID: " + nodeID);    			
    		}
    	}
    	
    	// unregister the current node
    	iA11y._unregister(node, currentNode, attrName, roleName);
    	
    	// set the wairole and role on the node
    	dojo.attr(node, {wairole: roleName, role: roleName});
    	
    	// look for the prologue
    	var ap = iA11y._getPrologue();
    	
    	// if no prologue then we are done
		if (!ap) return node;
		
		// clear the node with the prologue
		ap.set(attrName, nodeOrID);
		
		// return the node
		return node;
    };
    
	/**
     * @function
     * @private
     * @name idx.a11y._unregister
     * @description Internal method for unregistering a landmark.
     * @param {Node|String} nodeOrID The node or ID of the node to register.
     * @param {Node} currentNode The currently registered node.
     * @param {String} attrName The attribute to set on A11yPrologue
     * @param {String} roleName The role name to assign to the node.
	 */
	iA11y._unregister = function(nodeOrID, currentNode, attrName, roleName) {
		// initialize the result
		var result = currentNode;
		
		// get the node
    	var node = nodeOrID;
    	if (iUtil.typeOfObject(nodeOrID) == "string") {
    		node = dDom.byId(nodeOrID);
    		if (!node) {
				throw new Error("Could not find node for ID: " + nodeID);    			
    		}
    	}
    	
    	// check if the node matches the currently registered node
    	if (node == currentNode) {
    		// check to see if the roles are still as we last left them
    		var currentRole = dDomAttr.get(node, "wairole");
    		if (currentRole == roleName) dDomAttr.remove(node, "wairole");
    		currentRole = dojo.attr(node, "role");
    		if (currentRole == roleName) dDomAttr.remove(node, "role");
    		
    		// set the result to null to unregister
    		result = null;
    	} 
    	
    	// attempt to unregister with the prologue
		var ap = iA11y._getPrologue();
		
		// if no prologue then we are done
		if (!ap) return result;
		
		// get the current node registered with the prologue
		var current = ap.get(attrName);
		if (iUtil.typeOfObject(current) == "string") {
			current = dDom.byId(current);
		}
		
		// if not changed, clear the node with prologue
		if (current == node) ap.set(attrName, "");
		
		// return the result
		return result;
	};

	/**
     * @function
     * @public
     * @name idx.a11y.registerMainArea
     * @description Registers the "main contact" landmark and passes it on to the idx.app.A11yPrologue if it exists.
     *              Any previously registered node is unregistered.
     * @param {Node|String} nodeOrID The node or ID of the node to register.
	 */
	iA11y.registerMainArea = function(nodeOrID) {
    	iA11y._mainNode = iA11y._register(nodeOrID, iA11y._mainNode, "mainNode", "main");
	};

	/**
     * @function
     * @public
     * @name idx.a11y.unregisterMainArea
     * @description Unregisters the "main contact" landmark without registering a new node.
     * @param {Node|String} nodeOrID The node or ID of the node to unregister.
	 */
	iA11y.unregisterMainArea = function(nodeOrID) {
		iA11y._mainNode = iA11y._unregister(nodeOrID, iA11y._mainNode, "mainNode", "main");
	};

	/**
     * @function
     * @public
     * @name idx.a11y.registerBannerArea
     * @description Registers the "banner" landmark and passes it on to the idx.app.A11yPrologue if it exists.
     *              Any previously registered node is unregistered.
     * @param {Node|String} nodeOrID The node or ID of the node to register.
	 */
	iA11y.registerBannerArea = function(nodeOrID) {
    	iA11y._bannerNode = iA11y._register(nodeOrID, iA11y._bannerNode, "bannerNode", "banner");
	};

	/**
     * @function
     * @public
     * @name idx.a11y.unregisterBannerArea
     * @description Unregisters the "banner" landmark without registering a new node.
     * @param {Node|String} nodeOrID The node or ID of the node to unregister.
	 */
	iA11y.unregisterBannerArea = function(nodeOrID) {
		iA11y._bannerNode = iA11y._unregister(nodeOrID, iA11y._bannerNode, "bannerNode", "banner");
	};

	/**
     * @function
     * @public
     * @name idx.a11y.registerNavigationArea
     * @description Registers the "navigation" landmark and passes it on to the idx.app.A11yPrologue if it exists.
     *              Any previously registered node is unregistered.
     * @param {Node|String} nodeOrID The node or ID of the node to register.
	 */
	iA11y.registerNavigationArea = function(nodeOrID) {
    	iA11y._navigationNode = iA11y._register(nodeOrID, iA11y._navigationNode, "navigationNode", "navigation");
	};

	/**
     * @function
     * @public
     * @name idx.a11y.unregisterNavigationArea
     * @description Unregisters the "navigation" landmark without registering a new node.
     * @param {Node|String} nodeOrID The node or ID of the node to unregister.
	 */
	iA11y.unregisterNavigationArea = function(nodeOrID) {
		iA11y._navigationNode = iA11y._unregister(nodeOrID, iA11y._navigationNode, "navigationNode", "navigation");
	};

	/**
     * @function
     * @public
     * @name idx.a11y.registerShortcut
     * @description Registers a keyboard shortcut and adds it to the prologue if one exists.
     * @param {Node|String} target The target node or anchor string of the keyboard shortcut.
     * @param {String} description The description of the shortcut to use in the prologue.
     * @param {String} accessKey The access key for activating the shortcut.
     * @return {String} The shortcut ID to use for unregistering the shortcut.
	 */
	iA11y.registerShortcut = function(target, description, accessKey) {
		var ap = iA11y._getPrologue();
		if (!ap) return;
		return ap.addShortcut(target, description, accessKey);
	};

	/**
     * @function
     * @public
     * @name idx.a11y.unregisterShortcut
     * @description Unregisters a previously registered shortcut identified by the specified shortcut ID.
     * @param {Node|String} shortcutID The ID of the shortcut to unregister.
	 */
	iA11y.unregisterShortcut = function(shortcutID) {
		var ap = iA11y._getPrologue();
		if (!ap) return;
		return ap.removeShortcut(shortcutID);
	};

	return iA11y;
});