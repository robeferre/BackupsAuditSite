/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/**
 * @name idx.trees
 * @class Provides "labelType" attribute support on dijit/tree/TreeStoreModel which can be
 *        set to "html" or "text" (defaults to "text").  This allows trees to use markup in 
 *        their tree node labels.  This was also added to dijit/tree/ObjectStoreModel for
 *        Dojo 1.9 as part of the fix to work item 9500; however, this excluded the 
 *        TreeStoreModel according to the comments and was not available for Dojo 1.8 or earlier.
 */
define(["dojo/_base/lang","idx/main","dojo/dom","dojo/dom-construct","dijit/Tree","dijit/tree/TreeStoreModel","dijit/tree/ObjectStoreModel"],
		function (dLang,iMain,dDom,dDomConstruct,dTree,dTreeStoreModel,dObjectStoreModel) {
	var iTrees = dLang.getObject("trees", true, iMain);
	
	// get the tree prototype
	var baseProto = dTree.prototype;
    
	dLang.extend(dTree._TreeNode, {
		_setLabelAttr: function(value) {
			this.label = value;
			if (("labelType" in this.tree.model) && (this.tree.model.labelType == "html")) {
				var html = (value) ? value : "";
				this.labelNode.innerHTML = html;
			} else {
				var text = document.createTextNode((value) ? value : "");
				dDomConstruct.place(text, this.labelNode, "only");
			}
		}
	});
	
	dLang.extend(dTreeStoreModel, {
		labelType: "text"
	});

	dLang.extend(dObjectStoreModel, {
		labelType: "text"
	});
	
	
	return iTrees;
});


