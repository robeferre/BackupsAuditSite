/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",						// dDeclare
        "dojo/_base/lang",							// dLang
        "dojo/_base/kernel",						// dKernel
        "dojo/when",								// dWhen
		"dojo/string",								// dString
		"dijit/Tree",								// dTree
		"dijit/tree/ObjectStoreModel",				// dObjectStoreModel
		"../string",								// iString
		"../util"],									// iUtil
		function(dDeclare,			// (dojo/_base/declare)
				 dLang,				// (dojo/_base/lang)
				 dKernel,			// (dojo/_base/kernel)
				 dWhen,				// (dojo/when)
				 dString,			// (dojo/string)
				 dTree,				// (dijit/Tree)
			  	 dObjectStoreModel,	// (dijit/tree/ObjectStoreModel
			  	 iString,			// (../string)
			  	 iUtil)				// (../util)
{
		/**
 		 * @name idx.widget.NavTreeObjectModel
 		 * @class Provides an expanded version of dijit/tree/ObjectStoreModel to support the additional features of idx.widget.NavTree.
 		 * @augments dijit/tree/ObjectStoreModel
 		 */
		return dDeclare("idx.widget.ForestObjectStoreModel",[dObjectStoreModel], 
			/** @lends idx.widget.NavTreeObjectModel# */
		{
			/**
			 * ID of fabricated root item to simulate ForestStoreModel behavior.
			 * 
			 * @default "|_-_-$root$-_-_|"
			 */
			rootId: "|_-_-$root$-_-_|",

			/** 
			 * Label of fabricated root item to simulate ForestStoreModel behavior.
			 */
			rootLabel: "ROOT",

			/**
			 * Specifies the set of children of the root item so that more than one item
			 * can be returned by the query (unlike ObjectStoreModel).
			 */
			query: null,
						
			/**
			 * Constructor that internally creates the fabricated root item. 
			 */
			constructor: function(params) {
				this.root = {};
				
				var idAttr = (params.store && params.store.idProperty) ? params.store.idProperty : "id";
				var labelAttr = (params.labelAttr) ? params.labelAttr : this.labelAttr;
				
				// assume "params" is already mixed in from the base class constructor
				this.root[idAttr] = this.rootId;
				this.root["root"] = true;
				this.root[labelAttr] = this.rootLabel;				
			},

			/**
			 * Overridden to specially handle the root item with the default query.
			 */
			getChildren: function(/*Object*/ parentItem, /*function(items)*/ onComplete, /*function*/ onError){
				if (parentItem === this.root) {
					var id = this.rootId;
					
					if(this.childrenCache[id]){
						dWhen(this.childrenCache[id], onComplete, onError);
						return;
					}

					var res = this.childrenCache[id] = this.store.query(this.query);
					
					// User callback
					dWhen(res, onComplete, onError);

					// Setup listener in case children list changes, or the item(s) in the children list are
					// updated in some way.
					if(res.observe){
						res.observe(dLang.hitch(this, function(obj, removedFrom, insertedInto){
							//console.log("observe on children of ", id, ": ", obj, removedFrom, insertedInto);

							// If removedFrom == insertedInto, this call indicates that the item has changed.
							// Even if removedFrom != insertedInto, the item may have changed.
							this.onChange(obj);

							if(removedFrom != insertedInto){
								// Indicates an item was added, removed, or re-parented.  The children[] array (returned from
								// res.then(...)) has already been updated (like a live collection), so just use it.
								dWhen(res, dLang.hitch(this, "onChildrenChange", parentItem));
							}
						}), true);	// true means to notify on item changes
					}
										
				} else {
					return this.inherited(arguments);
				}
				
			},
			
			/**
			 * Overridden to specially handle the fabricated root node.
			 */
			fetchItemByIdentity: function(/* object */ keywordArgs){
				if(keywordArgs.identity == this.rootId){
					var scope = keywordArgs.scope || dKernel.global;
					if(keywordArgs.onItem){
						keywordArgs.onItem.call(scope, this.root);
					}
					
				} else {
					this.store.get(keywordArgs.identity).then(
							dLang.hitch(keywordArgs.scope, keywordArgs.onItem),
							dLang.hitch(keywordArgs.scope, keywordArgs.onError)
					);
				}
			},

			/**
			 * Overridden to specially handle the fabricated root node.
			 */
			getIdentity: function(/* item */ item){
				return (item === this.root) ? this.rootId : this.inherited(arguments);
			},

			/**
			 * Overridden to specially handle the fabricated root node.
			 */
			getLabel: function(/*dojo/data/Item*/ item){
				return	(item === this.root) ? this.rootLabel : this.inherited(arguments);
			},			
			
			/**
			 * Overridden to handle special case of parent being fabricated root node.  Keep in mind 
			 * that if the specified parent is the fabricated root element that the element should 
			 * match the "query" specified for this model in order to become a true child upon refresh.
			 * If it does not match the specified query then the "child" will be created, but will not show.
			 * This method triggers a call to "onNewRootItem" which may be overridden to change the parameters
			 * of the new item to force it to match the query (e.g.: it may set "root=true").
			 */
			newItem: function(/* dijit/tree/dndSource.__Item */ args, /*Item*/ parent, /*int?*/ insertIndex, /*Item?*/ before){
				if(parent === this.root){
					// creating children of "root" is tricky because the child needs to match the query
					// in order to truly be a child of the root element.  					
					this.onNewRootItem(args);

					// the store knows nothing of the fabricated root element, so it cannot create children of it.
					var res = this.store.put(args);
					
					// we may need to invalidate the childrenCache -- we will see
					//dWhen(res, dLang.hitch(this, function() {
					//	var res2 = this.childrenCache[this.rootId] = this.store.query(this.query);
					//
					//	// fire onChildrenChange
					//	dWhen(res2, dLang.hitch(this, "onChildrenChange", parent);
					//});
										
					return res;
					
				}else{
					return this.inherited(arguments);
				}
			},

			/**
			 * Attach to or override this function to force the parameters for a child of the root
			 * node to match the query for children of the root node.  This can be implemented by
			 * doing something as simple as adding a flag that as "root=true".
			 */
			onNewRootItem: function(/* dijit/tree/dndSource.__Item */ /*===== args =====*/){
				
			},

			/**
			 * Overridden to handle cases where the old or new parent is the fabricated root node.
			 * This will trigger calls to either "onLeaveRoot" or "onAddToRoot" which are responsible
			 * for modifying existing items to match the query specified for this instance's root children.
			 */
			pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, 
								/*Boolean*/ bCopy, /*int?*/ insertIndex, /*Item?*/ before){
				if(oldParentItem === this.root){
					if(!bCopy){
						// It's onLeaveRoot()'s responsibility to modify the item so it no longer matches
						// this.query... thus triggering an onChildrenChange() event to notify the Tree
						// that this element is no longer a child of the root node
						this.onLeaveRoot(childItem);
					}
				}								
								
				if(newParentItem === this.root){
					// It's onAddToRoot()'s responsibility to modify the item so it matches
					// this.query... thus triggering an onChildrenChange() event to notify the Tree
					// that this element is now a child of the root node
					this.onAddToRoot(childItem);
				}
				
				// call the base method, but substitute "null" for the root node where appropriate
				return this.inherited(arguments, [childItem,
					oldParentItem === this.root ? null : oldParentItem,
					newParentItem === this.root ? null : newParentItem,
					bCopy,
					insertIndex,
					before
				]);				
				
			},
			
		// =======================================================================
		// Handling for top level children

		/**
		 * Called when item added to root of tree; user must override this method
		 * to modify the item so that it matches the query for top level items.  Unlike
		 * ForestStoreModel, ForestObjectStoreModel calls this function to modify the 
		 * object before the parent is actually changed in the store so that a single 
		 * "put" can be used to save both changes.
		 */
		onAddToRoot: function(/* item */ item){
			
		},

		/**
		 * Called when item removed from root of tree; user must override this method
		 * to modify the item so it doesn't match the query for top level items.  This method
		 * is called before the "put" operation that saves the change of parent so that the
		 * change to the attributes and parent can be done in the same "put" operation.
		 */
		onLeaveRoot: function(/* item */ item){
			
		},

		// =======================================================================
		// Events from data store

		_requeryTop: function(){
			// reruns the query for the children of the root node,
			// sending out an onSet notification if those children have changed
			var id = this.rootId;
			
			var oldChildren = this.childrenCache[id];
			if (!oldChildren) oldChildren = [];
			dWhen(oldChildren, dLang.hitch(this, function() {
				
				var newChildren = this.store.query(this.query);

				dWhen(newChildren, dLang.hitch(this, function() {
					this.childrenCache[id] = newChildren;
					
					// If the list of children or the order of children has changed...
					if(oldChildren.length != newChildren.length ||
						array.some(oldChildren, function(item, idx){ return newChildren[idx] != item;})) {
							this.onChildrenChange(this.root, newChildren);
					}
				}));
			}));
		}	
	});
});
	