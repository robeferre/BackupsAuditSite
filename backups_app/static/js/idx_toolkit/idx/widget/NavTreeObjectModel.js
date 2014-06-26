/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",						// dDeclare
        "dojo/_base/lang",							// dLang
        "dojo/_base/kernel",						// dKernel
		"dojo/string",								// dString
		"dijit/Tree",								// dTree
		"./ForestObjectStoreModel",				// dObjectStoreModel
		"../string",								// iString
		"../util"],									// iUtil
		function(dDeclare,					// (dojo/_base/declare)
				 dLang,						// (dojo/_base/lang)
				 dKernel,					// (dojo/_beae/kernel)
				 dString,					// (dojo/string)
				 dTree,						// (dijit/Tree)
			  	 iForestObjectStoreModel,	// (idx/widget/ForestObjectStoreModel)
			  	 iString,					// (../string)
			  	 iUtil)						// (../util)
{
		/**
 		 * @name idx.widget.NavTreeObjectModel
 		 * @class Provides an expanded version of dijit/tree/ObjectStoreModel to support the additional features of idx.widget.NavTree.
 		 * @augments dijit/tree/ObjectStoreModel
 		 */
		return dDeclare("idx.widget.NavTreeObjectModel",[iForestObjectStoreModel], 
			/** @lends idx.widget.NavTreeObjectModel# */
		{
			/**
			 * The attribute used to classify the tree nodes into different types to
			 * lookup different default behaviors for nodes of that type. 
			 */
			typeAttr: "type",

			/**
			 * The attribute to check per-item to see if it is selectable.
			 * 
			 * Order of precedence is:
			 *  - Value from selectabilityMap (when present)
			 *  - Value of selectableAttr for item (when available)
			 *  - Value of typeSelectabilityMap (when present)
			 *  - defaultSelectability
			 */
			selectableAttr: "selectable",

			/**
			 * @private
			 */
			_setSelectableAttr: function(value) {
				if (value == this.selectableAttr) return;
				this.selectableAttr = value;
				this.onSelectabilityChanged();
			},
			
			/**
			 * The associative array/map of item IDs to their selectability (true or false).
			 * Items not in this map have their selectability determined by the "selectableAttr"
			 * (per item) or the "defaultSelectability" attribute for the model.
			 * Example:
			 *  { "item1": true, "item2": false}
			 *  
			 * Order of precedence is:
			 *  - Value from selectabilityMap (when present)
			 *  - Value of selectableAttr for item (when available)
			 *  - Value of typeSelectabilityMap (when present)
			 *  - defaultSelectability
			 */
			selectabilityMap: null,
			
			/**
			 * @private
			 */
			_setSelectabilityMapAttr: function(value) {
				if (value === this.selectabilityMap) return;
				this.selectabilityMap = value;
				this.onSelectabilityChanged();
			},
			
			/**
			 * The associative array/map of item types (obtained via the optional "typeAttr") to 
			 * the selectability for items of that type (true or false).  For items of types not
			 * found in this map have their selectability determined by the "defaultSelectability"
			 * attribute for the model.
			 * Example:
			 *  { "typeA": true, "typeB": false}
			 * 
			 * Order of precedence is:
			 *  - Value from selectabilityMap (when present)
			 *  - Value of selectableAttr for item (when available)
			 *  - Value of typeSelectabilityMap (when present)
			 *  - defaultSelectability
			 */
			typeSelectabilityMap: null,
			
			/**
			 * @private
			 */
			_setTypeSelectabilityMapAttr: function(value) {
				if (value === this.typeSelectabilityMap) return;
				this.typeSelectabilityMap = value;
				this.onSelectabilityChanged();
			},
			
			/**
			 * Used to determine the default selectability of nodes if the item is not found in the
			 * selectability map or the item or this model does not have a defined 
			 * "selectableAttr" or its type is not in the type selectabliltiy map.  The possible 
			 * values are:
			 *   "all" - All node are selectable by default.
			 *   "none" - No nodes are selectable default (per-node exceptions required)
			 *   "leaves" - Only nodes for which "mayHaveChildren()" is false are selectable
			 */
			defaultSelectability: "leaves",

			/**
			 * @private
			 */
			_setDefaultSelectabilityAttr: function(value) {
				if (value == this.defaultSelectability) return;
				this.defaultSelectability = value;
				this.onSelectabilityChanged();
			},
			
			/**
			 * The associative array/map of item IDs to their branching status (true or false).
			 * Items not in this map have their branching status determined by the "brancingAttr"
			 * (per item) or the "defaultBranching" attribute for the model.
			 * Example:
			 *  { "item1": true, "item2": false}
			 *  
			 * Order of precedence is:
			 *  - Value from branchingMap (when present)
			 *  - Value of typeBranchingMap (when present)
			 *  - Value from branchingAttr as interpreted by branchingAttrMode
			 */
			branchingMap: null,
			
			/**
			 * @private
			 */
			_setBranchingMapAttr: function(value) {
				if (value === this.branchingMap) return;
				this.branchingMap = value;
				this.onBranchingChanged();
			},
			
			/**
			 * The associative array/map of item types (obtained via the optional "typeAttr") to 
			 * the branching status for items of that type (true or false).  For items of types not
			 * found in this map have their branching status determined by the "defaultBranching"
			 * attribute for the model.
			 * Example:
			 *  { "typeA": true, "typeB": false}
			 * 
			 * Order of precedence is:
			 *  - Value from branchingMap (when present)
			 *  - Value of typeBranchingMap (when present)
			 *  - Value from branchingAttr as interpreted by branchingAttrMode
			 */
			typeBranchingMap: null,
			
			/**
			 * @private
			 */
			_setTypeBranchingMapAttr: function(value) {
				if (value === this.typeBranchingMap) return;
				this.typeBranchingMap = value;
				this.onBranchingChanged();
			},
			
			/**
			 * The attribute used to help determine if an item can potentially have children according
			 * to the "mayHaveChildren()" function.  The presence of the attribute is interpreted 
			 * according to the branchingMode assigned to the model.
			 *  
			 * Order of precedence is:
			 *  - Value from branchingMap (when present)
			 *  - Value of typeBranchingMap (when present)
			 *  - Value from branchingAttr as interpreted by branchingAttrMode
			 *  
			 * @default "branch" 
			 */
			branchingAttr: "children",

			/**
			 * @private
			 */
			_setBranchingAttrAttr: function(value) {
				if (value == this.branchingAttr) return;
				this.branchingAttr = value;
				this.onBranchingChanged();
			},

			/**
			 * Used to determine whether or not an item may have children in conjunction with the
			 * branchingAttr.  If the item is not found in the branchingMap or the item or its type 
			 * is not in the typeBranchingMap then this attribute is used to interpret the value of
			 * associated with the branchingAttr value.  The possible modes are:
			 * 
			 *   "always" - Regardless of value, all items are considered to be possible parents.
			 *   "never" - Regardless of value, no items (except root) are considered to be possible parents.
			 *   "present" - The mere presence of the branchingAttr in the child indicates possible children.
			 *   "absent" - The absence of the branchingAttr in the child indicates possible children.
			 *   "length" - A value that is a non-empty array or non-empty string indicates possible children.
			 *   "branch" - A value that is not zero, false, null or undefined indicates possible children.
			 *   "leaf" - A value that is not zero, false, null or undefined indicates NO possible children
			 *   "function" - The branchingAttr is a function that should be called.
			 *   
			 * @default "present"
			 */
			branchingAttrMode: "present",

			/**
			 * @private
			 */
			_setBranchingAttrModeAttr: function(value) {
				if (value == this.branchingAttrMode) return;
				this.branchingAttrMode = value;
				this.onBranchingChanged();
			},
			
			/**
			 * The attribute to check per-item to see if a badge label should be 
			 * displayed.  The value of the attribute may be a number or a string 
			 * that is parseable to cause it to be directly displayed.  If the
			 * string is not parseable as a number the NavTree may either display it
			 * literally or use it as a basis for a resource lookup key to obtain the
			 * text to display. 
			 */
			badgeLabelAttr: "badgeLabel",
			
			/**
			 * @private
			 */
			_setBadgeLabelAttrAttr: function(value) {
				if (value == this.badgeLabelAttr) return;
				this.badgeLabelAttr = value;
				this.onBadgesChanged();
			},
			
			/**
			 * How to interpret the text of the badge label.  By default this assumes
			 * "html", but it can be set to "text" to force a text interpretation.
			 * The default for this differs from "labelType" which is added to TreeStoreModel
			 * from idx/trees module.  This is becuase badges historically assumed HTML and 
			 * it was later discovered that tree labels forced plain text. Now both are 
			 * configurable for NavTree, but have different default values for historical reasons.
			 * 
			 * @default "html"
			 *  
			 */
			badgeLabelType: "html",
			
			/**
			 * The attribute to check per-item to see if a badge icon should be 
			 * displayed.  The value of the attribute is used by the NavTree to lookup
			 * an "icon class" in its "badgeIconMap".
			 */
			badgeIconTypeAttr: "badgeIconType",
			
			/**
			 * @private
			 */
			_setBadgeIconTypeAttrAttr: function(value) {
				if (value == this.badgeIconTypeAttr) return;
				this.badgeIconTypeAttr = value;
				this.onBadgesChanged();
			},
			
			/**
			 * The associative array/map of item IDs to their badge values.  The badge 
			 * values may take one of the following forms:
			 *  -- an integer numeric value (used as a badge label without resource lookup)
			 *  -- a string representing an integer value (used as a badge label without resource lookup)
			 *  -- an alpha-numeric string (either display literally or used as a resource lookup key)
			 *  -- an object of the form:
			 *  	{label: *badgeLabel*, iconType: *iconType*}
			 *     Where *badgeLabel* is either an integer, numeric string or alpha-numeric string (as above)
			 *     and *iconType* is a string indicating a key for the NavTree to lookup in its badgeIconMap.
			 *     
			 * Items not in this map have their badge value determined by the "badgeLabelAttr" 
			 * and/or "badgeIconTypeAttr" (per item).
			 * 
			 * Example:
			 *  { "item1": 10, "item2": "warning", "item3": "info"}
			 */
			badgeMap: null,
			
			/**
			 * @private
			 */
			_setBadgeMapAttr: function(value) {
				if (value === this.badgeMap) return;
				this.badgeMap = value;
				this.onBadgesChanged();
			},
			
			/**
			 * Overriden to always return true for the fabricated root node and to otherwise return true or false
			 * depending on the branching settings for this model.
			 * 
 			 * Order of precedence is:
			 *  - Value from branchingMap (when present)
			 *  - Value of typeBranchingMap (when present)
			 *  - Value from branchingAttr as interpreted by branchingAttrMode
			 */
			mayHaveChildren: function(item) {
				if (item === this.root) return true;
				if (this.store.hasChildren && dLang.isFunction(this.store.hasChildren)) {
					var hasChildren = this.store.hasChildren(item);
					return hasChildren;
				}
				var itemID = this.store.getIdentity(item);
				if (itemID && this.branchingMap && (itemID in this.branchingMap)) {
					return (this.branchingMap[itemID] ? true : false);
				}
				var itemType = this.getItemType(item);
				if (itemType && this.typeBranchingMap && (itemType in this.typeBranchingMap)) {
					return (this.typeBranchingMap[itemType] ? true : false);
				}
				
				// check if no branching attribute
				if (!this.branchingAttr) return this.inherited(arguments);
				var branchingAttrMode = this.branchingAttrMode ? this.branchingAttrMode : "present";
				var value = undefined;
				
				// switch on the branching attribute mode
				switch (this.branchingAttrMode) {
				case "always":
					return true;
				case "never":
					return false;
				case "present":
					return (this.branchingAttr in item);
				case "absent":
					return (! (this.branchingAttr in item));
				case "length":
				{
					value =(this.branchingAttr in item) ? item[this.branchingAttr] : null; 
					return ("length" in value) ? (value.length > 0) : false;
				}
				case "branch":
					return (item[this.branchingAttr] ? true : false);
				case "leaf":
					return (item[this.branchingAttr] ? false : true);
				default:
					return this.inherited(arguments);
				}
			},
			
			/**
			 * Returns the type of the item.
			 */
			getItemType: function(/*dojo.data.Item*/ item) {
				if (item == this.root) return null;
				if (!iString.nullTrim(this.typeAttr)) return null;
				if (! (this.typeAttr in item)) return null;
				return item[this.typeAttr];
			},
			
			/**
			 * Function to determine if a node is selectable.
			 */
			isSelectable: function(/*dojo.data.Item*/ item) {
				if (item == this.root) return false;
				
				// check if we have a selectability map
				if (this.selectabilityMap) {
					// get the ID
					var id = this.store.getIdentity(item);
					
					// if the item appears in the map, then use the value for the item
					if (id && (id in this.selectabilityMap)) {
						return this.selectabilityMap[id];
					}
				}
				
				// check if we have a selectableAttr defined
				if (iString.nullTrim(this.selectableAttr)) {
					// if we do then check if the item has that attribute
					if (this.selectableAttr in item) {
						return item[this.selectableAttr];
					}
				}

				// check if we have a type selectability map
				if (this.typeSelectabilityMap) {
					// get the type of the item
					var itemType = this.getItemType(item);
					
					if ((itemType) && (itemType in this.typeSelectabilityMap)) {
						// if we have a type and it appears in our map, then return the value
						return this.typeSelectabilityMap[itemType];
					}
				}
				
				// use the default selectability
				switch (this.defaultSelectability) {
				case "all":
					return true;
				case "none":
					return false;
				case "leaves":
					return (! this.mayHaveChildren(item));
				default: 
					return true;
				}
			},
			
			/**
			 * Gets the badge for the specified item or returns null if no badge is associated
			 * with the specified item.  If the return value is not null it takes the form of:
			 * {
			 * 	label: *badgeLabel*,
			 *  iconType: *badgeIconType*
			 * }
			 * 
			 * Where *badgeLabel* and *badgeIconType* are as follows:
			 * 
			 * *badgeLabel*: Either an integer/numeric value indicating a literal badge
			 * value or a string that the NavTree may use to create a resource lookup key to obtain
			 * the displayable text or may be null to indicate no label.
			 * 
			 * *badgeIconType*: Either null to indicate no icon or a string to be used as a key in the
			 * badgeIconMap of the NavTree to lookup an iconClass to associate with the type.
			 * 
			 */
			getBadge: function(/*dojo.data.Item*/ item) {
				if (item == this.root) return null;
				
				var badgeValue = {label: null, iconType: null};
				// check if we have a selectability map
				if (this.badgeMap) {
					var id = this.store.getIdentity(item);
					
					// if the item appears in the magp, then use the value for the item
					if (id && (id in this.badgeMap)) {
						var badge = this.badgeMap[id];
						if (! badge) return null;
						var badgeType = iUtil.typeOfObject(badge);
						
						switch (badgeType) {
						case "number":
							badgeValue.label = badge;
							return badgeValue;
							
						case "string":
							badgeValue.label = this._normalizeBadgeLabel(badge);
							return badgeValue;
							
						case "object":
							if ((!badge.label)&&(!badge.iconType)) return null;
							if (badge.label) {
								badgeValue.label = this._normalizeBadgeLabel(badge.label);
							}
							if (badge.iconType) {
								badgeValue.iconType = badge.iconType;
							}
							return badgeValue;
						}
					}
				}
				
				// check if we have a badgeLabelAttr defined
				if (iString.nullTrim(this.badgeLabelAttr)) {
					// if we do then check if the item has that attribute
					if (this.badgeLabelAttr in item) {
						var val = item[this.badgeLabelAttr];
						badgeValue.label = this._normalizeBadgeLabel(val);
					}
				}
				
				// check if we have a badgeIconTypeAttr defined
				if (iString.nullTrim(this.badgeIconTypeAttr)) {
					// if we do then check if the item has that attribute
					if (this.badgeIconTypeAttr in item) {
						badgeValue.iconType = item[this.badgeIconTypeAttr];
					}
				}

				// if no label and icon type then return null
				if ((!badgeValue.label)&&(!badgeValue.iconType)) return null;

				// otherwise return the badge value
				return badgeValue;
			},
			
			/**
			 * Normalizes the badge label as a number or a string.
			 */
			_normalizeBadgeLabel: function(label) {
				var labelType = iUtil.typeOfObject(label);
				switch (labelType) {
				case "number":
					return label;
				case "string":
					if (label.match(/^\s*(\+|-)?\d+\s*$/)) {
						return Number(dString.trim(label));
					} else {
						return label;
					}
				default:
					return "" + label;
				}
			},
			
			/**
			 * Call this method when the badgeLabelAttr, badgeIconTypeAttr, or badgeMap is changed.
			 */
			onBadgesChanged: function() {

			},
			
			/**
			 * Call this method when the selectabilityMap or typeSelectbailityMap is changed.
			 */
			onSelectabilityChanged: function() {

			},
			

			/**
			 * Callback method for when branchingMap, typeBranchingMap, branchingAttr or branchingAttrMode is changed.
			 * 
			 */
			onBranchingChanged: function() {	
				
			},
			
			
			/**
			 * Returns a snapshot object that contains all the attributes and values of the specified
			 * item so that it is simplified from the data store interface.
			 * 
			 * @param item The item to be normalized.
			 */
			normalizeItem: function(item) {
				return item;
			}			
		
		});
});
	