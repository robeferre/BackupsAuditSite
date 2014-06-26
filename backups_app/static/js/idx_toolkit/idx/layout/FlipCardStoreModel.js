define([
	"dojo/_base/array", // array.filter array.forEach array.indexOf array.some
	"dojo/aspect", // aspect.before, aspect.after
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // lang.hitch
	"dojo/when",
	"dojo/store/Memory",
	"dojo/store/JsonRest",
	"dojo/store/DataStore",
	"dojo/store/Observable",
	'dojo/store/util/QueryResults',
	'dojo/store/util/SimpleQueryEngine',
	"idx/layout/_FlipCardUtils"
], function(array, aspect, declare, lang, when, Memory, JsonRest, DataStore, Observable,
		QueryResults, SimpleQueryEngine, _FlipCardUtils){
			
	
	//data store to transform dojo.data.xxx		
	var _DataStore = declare("idx/layout/_DataStore", [DataStore], {
		_objectConverter: function(callback){
			var store = this.store;
			var idProperty = this.idProperty;
			function convert(item){
				if(!item || !item[idProperty]){
					return {};
				}
				var object = {};
				var attributes = store.getAttributes(item);
				for(var i = 0; i < attributes.length; i++){
					var attribute = attributes[i];
					var values = store.getValues(item, attribute);
					if(values.length > 1){
						for(var j = 0; j < values.length; j++){
							var value = values[j];
							if(typeof value == 'object' && store.isItem(value)){
								values[j] = convert(value);
							}
						}
						value = values;
					}else{
						var value = store.getValue(item, attribute);
						if(typeof value == 'object' && store.isItem(value)){
							value = convert(value);
						}
					}
					object[attributes[i]] = value;
				}
				if(!(idProperty in object) && store.getIdentity){
					object[idProperty] = store.getIdentity(item);
				}
				return object;
			}
			return function(item){
				return callback(convert(item));
			};
		}
	});

	// module:
	//		idx/layout/FlipCardModelStore

	var FlipCardStoreModel = declare("idx/layout/FlipCardStoreModel", null, {
		// summary:
		//		Implements dijit/tree/model connecting dijit/Tree to a dojo/store/api/Store that implements
		//		getChildren().
		//
		//		If getChildren() returns an array with an observe() method, then it will be leveraged to reflect
		//		store updates to the tree.   So, this class will work best when:
		//
		//			1. the store implements dojo/store/Observable
		//			2. getChildren() is implemented as a query to the server (i.e. it calls store.query())
		//
		//		Drag and Drop: To support drag and drop, besides implementing getChildren()
		//		and dojo/store/Observable, the store must support the parent option to put().
		//		And in order to have child elements ordered according to how the user dropped them,
		//		put() must support the before option.

		// store: dojo/store/api/Store
		//		Underlying store
		store: null,

		// idProperty: String
		//		Indicates the property to use as the identity property. The values of this
		//		property should be unique.
		idProperty: "id",
		
		// labelAttr: String
		//		Get label from the model using this attribute
		labelAttr: "title",  //usually "name" as default
		
		// labelType: [const] String
		//		Specifies how to interpret the labelAttr in the data store items.
		//		Can be "html" or "text".
		labelType: "text",
		
		// childrenAttrs: String[]
		//		One or more attribute names (attributes in the store item) that specify that item's children
		childrenAttr: "children",
		
		// typeAttr: String[]
		//		type attribute name
		typeAttr: "type",

		// root: [readonly] Object
		//		Pointer to the root item from the dojo/store/api/Store (read only, not a parameter)
		root: null,

		// query: anything
		//		Specifies datastore query to return the root item for the tree.
		//		Must only return a single item.   Alternately can just pass in pointer
		//		to root item.
		// example:
		//	|	{id:'ROOT'}
		query: null,
		
		
		
		defaultRootId: "_____root_id_____",
		defaultRootLabel: "_____root_label_____",
		// defaultRootChildren: [],
		
		
		constructor: function(/* Object */ args){
			// summary:
			//		Passed the arguments listed above (store, etc)
			// tags:
			//		private

			lang.mixin(this, args);
			
			this.childrenAttr = this.childrenAttr || "children";
			
			this.defaultRootChildren = this.defaultRootChildren || [],
			
			// map from id to array of children
			// this.childrenCache = {};
			
			// map from id to sub stores and models
			this.subStoresAndModels = {};
			
			//build store
			if(!this.store){
				this.store = new Memory({
					data: []
				});
			}
			
			this.store.refreshData = lang.hitch(this, function(item){
				this.store.setData(this.store.data);
			});
			this.store.hasChildren = lang.hitch(this, function(item){
				if(!item){return false}
				if(lang.isObject(item) || lang.isString(item)){
					if(lang.isString(item)){
						item = this.store.get(item);
					}else{
						var id = this.store.getIdentity(item);
						item = this.store.get(id);
					}
					return item && item[this.childrenAttr] && item[this.childrenAttr].length;
				}
				return false;
			});
			this.store.getChildren = lang.hitch(this, function(item, options){
				if(!item){return false}
				if(lang.isObject(item) || lang.isString(item)){
					if(lang.isString(item)){
						item = this.store.get(item);
					}else{
						var id = this.store.getIdentity(item);
						item = this.store.get(id);
					}
					if(item && item[this.childrenAttr]){
						var query = null;
						if(options && options.query){
							query = options.query;
						}
						return QueryResults(SimpleQueryEngine(query, options)(item[this.childrenAttr]));
					}else{
						return [];
					}
				}
				return [];
			});
			
			//adjust the index of the store (memory)
			/*
			aspect.around(this.store, "put", lang.hitch(this, function(originalPut){
				return lang.hitch(this, function(obj, options){
					if(options && options.parent && options.parent[this.childrenAttr]){
						var results = originalPut.call(this.store, obj, options);
						var adjustStoreIndex = function(args){
							if(args.store.index && lang.isObject(args.store.index)){
								args.store.index[args.obj[args.idProperty]] = args.insertIndex;
								for(var j in args.store.index){
									if(j != args.obj[args.idProperty] && args.store.index[j] >= args.insertIndex){
										args.store.index[j]++;
									}
								}
							}
						};
						if(typeof options.insertIndex == "number"){
							adjustStoreIndex({store:this.store, idProperty:this.idProperty, obj:obj, insertIndex:options.insertIndex});
						}else if(options.before){
							insertIndex = array.indexOf(options.parent[this.childrenAttr], options.before);
							adjustStoreIndex({store:this.store, idProperty:this.idProperty, obj:obj, insertIndex:options.insertIndex});
						}else{
							//TODO
						}
						return results;
					}else{
						return originalPut.call(this.store, obj, options);
					}
				})
			}));
			*/
			this.store = new Observable(this.store);
			
			
			//mock root 
			if(!this.root && !this.query){
				this.root = {root: true};
				this.root[this.idProperty] = args.rootId || this.defaultRootId;
				this.root[this.labelAttr] = args.rootLabel || this.defaultRootLabel;
				this.root[this.childrenAttr] = args.rootChildren || this.defaultRootChildren;
			}else if(this.query && lang.isObject(this.query)){
				this.getRoot(function(root){console.log("Root Ready!")});
			}
		},

		destroy: function(){
			// TODO: should cancel any in-progress processing of getRoot(), getChildren()
			this.root = null;
			this.store = null;
		},
		
		
		// =======================================================================
		// Methods for traversing hierarchy

		getRoot: function(onComplete, onError, forceLoad){
			// summary:
			//		Calls onComplete with the root item for the tree, possibly a fabricated item.
			//		Calls onError on error.
			if(this.root && !forceLoad){
				onComplete(this.root);
			}else{
				var res;
				when(res = this.store.query(this.query),
					lang.hitch(this, function(items){
						//console.log("queried root: ", res);
						if(items.length != 1){
							throw new Error("idx/layout/FlipCardModelStore: root query returned " + items.length +
								" items, but must return exactly one");
						}
						this.root = items[0];

						// Setup listener to detect if root item changes
						if(res.observe){
							res.observe(lang.hitch(this, function(obj){
								// Presumably removedFrom == insertedInto == 1, and this call indicates item has changed.
								//console.log("root changed: ", obj);
								this.onChange(obj);
							}), true);	// true to listen for updates to obj
						}
						
						onComplete(this.root);
					}),
					onError
				);
			}
		},
		
		hasChildren: function(/*id or item Object*/item, rootNavItem){
			if(!item){
				return false;
			}else if(item == this.root){
				return this.root && this.root[this.childrenAttr] && this.root[this.childrenAttr].length;
			}else{
				if(lang.isObject(item) || lang.isString(item)){
					if(lang.isString(item)){
						item = this.store.get(item);
					}else{
						var id = this.store.getIdentity(item);
						item = this.store.get(id);
					}
					if(!item){
						if(rootNavItem){
							var rootNavId = this.store.getIdentity(rootNavItem);
							var subModel = this.subStoresAndModels[rootNavId];
							if(subModel){
								var itemId = subModel.store.getIdentity(item);
								return subModel.model.hasChildren(itemId);
							}
						}
						return false;
					}else{
						return this.store.hasChildren(item);
					}
				}else{
					return false;
				}
			}
		},
		
		getRootChildren: function(/*function(items)*/ onComplete, /*function*/ onError, forceLoad){
			if(this.root && this.root[this.childrenAttr] && this.root[this.childrenAttr].length && !forceLoad){
				// already loaded, just return
				onComplete(this.root[this.childrenAttr]);
			}else{
				var res;
				when(res = this.store.query(),
					lang.hitch(this, function(items){
						this.root[this.childrenAttr] = items;

						if(res.observe){
							res.observe(lang.hitch(this, function(obj, removedFrom, insertedInto){
								this.onChange(obj, removedFrom, insertedInto);
							}), true);	// true to listen for updates to obj
						}
						
						onComplete(items);
					}),
					onError
				);
			}
		},

		getChildren: function(/*id or item Object*/item, /*function(items)*/ onComplete, /*function*/ onError, forceLoad, rootNavItem){
			// summary:
			//		Calls onComplete() with array of child items of given parent item.
			// item:
			//		Item from the dojo/store
			if(!item){
				onComplete([]);
			}else if(item == this.root){
				return this.getRootChildren(onComplete, onError, forceLoad);
			}else{
				if(lang.isObject(item) || lang.isString(item)){
					if(lang.isString(item)){
						item = this.store.get(item);
					}else{
						var id = this.store.getIdentity(item);
						item = this.store.get(id);
					}
					
					if(!item){
						if(rootNavItem){
							var rootNavId = this.store.getIdentity(rootNavItem);
							var subModel = this.subStoresAndModels[rootNavId];
							if(subModel){
								var itemId = subModel.store.getIdentity(item);
								when(subModel.model.children(itemId), onComplete, onError);
							}
						}
						// User callback
						when([], onComplete, onError);
					}else{
						var res = this.store.getChildren(item);
		
						// Setup listener in case children list changes, or the item(s) in the children list are
						// updated in some way.
						if(res.observe){
							res.observe(lang.hitch(this, function(obj, removedFrom, insertedInto){
								//console.log("observe on children of ", id, ": ", obj, removedFrom, insertedInto);
			
								// If removedFrom == insertedInto, this call indicates that the item has changed.
								// Even if removedFrom != insertedInto, the item may have changed.
								this.onChange(obj, removedFrom, insertedInto);
			
								if(removedFrom != insertedInto){
									// Indicates an item was added, removed, or re-parented.  The children[] array (returned from
									// res.then(...)) has already been updated (like a live collection), so just use it.
									when(res, lang.hitch(this, "onChildrenChange", item));
								}
							}), true);	// true means to notify on item changes
						}
						
						// User callback
						when(res, onComplete, onError);
					}
					
				}else{
					onComplete([]);
				}
			}
		},
		
		treePath: function(/*id or item Object*/item, rootNavItem){
			var path = [];
			if(!item){
				//TODO
			}else{
				if(lang.isObject(item) || lang.isString(item)){
					if(lang.isString(item)){
						item = this.store.get(item);
					}else{
						var id = this.store.getIdentity(item);
						item = this.store.get(id);
					}
					
					if(!item){
						if(rootNavItem){
							var rootNavId = this.store.getIdentity(rootNavItem);
							var subModel = this.subStoresAndModels[rootNavId];
							if(subModel){
								var itemId = subModel.store.getIdentity(item);
								var subPath = subModel.model.treePath(itemId);
								if(subPath && subPath.length){
									path.concat(subPath);
								}
							}
						}
					}else{
						var id = this.store.getIdentity(item);
						path.unshift(id);
					}
				}else{
					//TODO
				}
			}
			return path.unshift(this.getRootIdentity());
		},
		
		getItem: function(id, rootNavItem){
			if(id){
				if(id == this.defaultRootId){
					return this.root;
				}else{
					var item = this.store.get(id);
					if(!item){
						if(rootNavItem){
							var rootNavId = this.store.getIdentity(rootNavItem);
							var subModel = this.subStoresAndModels[rootNavId];
							if(subModel){
								item = subModel.model.byId(id);
								if(item){
									return item.item;
								}
								return null;
							}
						}
						return null;
					}else{
						return item;
					}
				}
			}else{
				return null;
			}
		},

		// =======================================================================
		// Inspecting items

		isItem: function(/* item */ item){
			if(this.store.getIdentity(item)){
				return true;
			}
			return false;	// Boolean
		},
		
		isRootLevelItem: function(/* item or id */ item){
			if(lang.isObject(item) || lang.isString(item)){
				if(lang.isString(item)){
					item = this.store.get(item);
				}else{
					var id = this.store.getIdentity(item);
					item = this.store.get(id);
				}
				if(item){
					return true;
				}
			}
			return false;	// Boolean
		},

		getIdentity: function(/* item */ item){
			return this.store.getIdentity(item);	// Object
		},
		
		getRootIdentity: function(){
			return this.store.getIdentity(this.root);	// Object
		},

		getLabel: function(/*dojo/data/Item*/ item){
			// summary:
			//		Get the label for an item
			return item[this.labelAttr];	// String
		},
		
		// =======================================================================
		// Write interface, for DnD

		addItem: function(/*item Object*/item, /*Item*/ parent, /*int?*/ insertIndex, /*Item*/ before, /*Left Nav Bar Item*/rootNavItem){
			if(!item){return;}
			var id = this.store.getIdentity(item);
			if(id){
				var iItem = this.store.get(id);
				if(iItem && this.store.getIdentity(iItem)){
					//exist in root nav
					return;
				}else{
					if(rootNavItem){
						var id = this.store.getIdentity(rootNavItem);
						var subModel = this.subStoresAndModels[id];
						if(subModel){
							var cId = subModel.store.getIdentity(item);
							var cItem = subModel.model.byId(cId);
							if(cItem && cItem.item){
								//exist in sub grid
								return;
							}
						}
					}
				}
			}
			
			this.updateItem(item, null, parent||this.root, insertIndex, before, rootNavItem);
		},
		
		updateItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem,
					/*int?*/ insertIndex, /*Item*/ before, /*Left Nav Bar Item*/rootNavItem){
			// summary:
			//		Move or copy an item from one parent item to another.
			//		Used in drag & drop
			
			if(!childItem){return;}
			
			if(oldParentItem){
				this.getChildren(oldParentItem, lang.hitch(this, function(items){
					var oldParentChildren = [];
					if(items && items.length){
						oldParentChildren = [].concat(items), // concat to make copy
							index = array.indexOf(oldParentChildren, childItem);
						oldParentChildren.splice(index, 1);
						
						oldParentItem[this.childrenAttr] = oldParentChildren;
					}
						
					var cdId = this.store.getIdentity(childItem);
					var delItem = this.store.get(cdId);
					if(cdId && delItem){
						var subModel = this.subStoresAndModels[cdId];
						if(subModel){
							delete this.subStoresAndModels[cdId];
							this.onGridUpdate(delItem, {
								type: "delete",
								rootNavItem: delItem
							});
						}
						
						this.store.remove(cdId);
						// this.store.refreshData();
						this.onDelete(cdId, oldParentChildren[index]);
					}else{
						var pId = this.store.getIdentity(oldParentItem);
						var pItem = this.store.get(pId);
						var subModel = this.subStoresAndModels[pId];
						if(pItem && subModel){
							var cId = subModel.store.getIdentity(childItem);
							var cItem = subModel.model.byId(cId);
							if(cItem && cItem.item){
								subModel.store.remove(cId);
								this.onGridUpdate(cItem.item, {
									type: "deleteItem",
									rootNavItem: pItem
								});
							}
						}else{
							if(rootNavItem){
								var rId = this.store.getIdentity(rootNavItem);
								var rItem = this.store.get(rId);
								var subModel = this.subStoresAndModels[rId];
								if(subModel){
									var ppId = subModel.store.getIdentity(oldParentItem);
									var ppmItem = subModel.model.byId(ppId);
									ppmItem = ppmItem || oldParentItem;
									var ccId = subModel.store.getIdentity(childItem);
									var ccItem = subModel.model.byId(ccId);
									if(ccItem && ccItem.item){
										subModel.store.remove(ccId);
										this.onGridUpdate(ccItem.item, {
											type: "deleteItem",
											ref: ppmItem.item,
											rootNavItem: rItem
										});
									}
								}
							}
						}
					}
				}), lang.hitch(this, function(items){
					//TODO ERROR
				}), true);
			}

			// modify target item's children attribute to include this item
			if(newParentItem){
				this.getChildren(newParentItem, lang.hitch(this, function(items){
					var newParentChildren = [];
					if(items && items.length){
						var newParentChildren = [].concat(items);
						if(typeof insertIndex == "number" && insertIndex > -1){
							newParentChildren.splice(insertIndex, 0, childItem);
						}else if(before){
							var bId = this.store.getIdentity(before);
							var beforeItem = this.store.get(bId);
							insertIndex = array.indexOf(newParentChildren, beforeItem);
							newParentChildren.splice(insertIndex, 0, childItem);
						}else{
							newParentChildren.push(childItem);
						}
						
						newParentItem[this.childrenAttr] = newParentChildren;
					}
					
					if(newParentItem == this.root){
						//TODO record the insert index
						var ciId = this.store.put(childItem, {
							overwrite: true,
							parent: newParentItem,
							insertIndex: insertIndex,
							before: before
						});
						
						var insertedItem = childItem;
						if(ciId){
							insertedItem = this.store.get(ciId);
						}
						
						this.onInsert(insertedItem, newParentChildren[insertIndex+1]);
					}else{
						var pId = this.store.getIdentity(newParentItem);
						var pItem = this.store.get(pId);
						var subModel = this.subStoresAndModels[pId];
						if(pItem && subModel){
							subModel.store.setData(newParentChildren);
							subModel.model.clearCache();
							// var rId = this.store.getIdentity(rootNavItem);
							// var rItem = this.store.get(rId);
							// this.onGridUpdate(newParentChildren, {
								// type: "insert",
								// rootNavItem: rItem
							// });
						}else{
							if(rootNavItem){
								var rId = this.store.getIdentity(rootNavItem);
								var rItem = this.store.get(rId);
								var subModel = this.subStoresAndModels[rId];
								if(subModel){
									var ppId = subModel.store.getIdentity(newParentItem);
									var ppmItem = subModel.model.byId(ppId);
									if(ppmItem && ppmItem.item){
										var ppItem = ppmItem.item;
										// subModel.store.add(childItem, {parent:ppItem});
										//refresh instead of store add
										var newGridChildren = [].concat(ppItem[this.childrenAttr]);
										if(typeof insertIndex == "number" && insertIndex > -1){
											newGridChildren.splice(insertIndex, 0, childItem);
										}else if(before){
											var bId = subModel.store.getIdentity(before);
											var beforeItem = subModel.store.get(bId);
											insertIndex = array.indexOf(newGridChildren, beforeItem);
											newGridChildren.splice(insertIndex, 0, childItem);
										}else{
											newGridChildren.push(childItem);
										}
										
										ppItem[this.childrenAttr] = newGridChildren;
										subModel.model.clearCache();
										
										this.onGridUpdate(childItem, {
											type: "insert",
											ref: newGridChildren[insertIndex+1], 
											rootNavItem: rItem
										});
									}
									
								}
							}
						}
					}
				}), lang.hitch(this, function(items){
					//TODO ERROR
				}), true);
			}
			
			//just update
			if(!oldParentItem && !newParentItem){
				if(rootNavItem){
					var rId = this.store.getIdentity(rootNavItem);
					var rItem = this.store.get(rId);
					var subModel = this.subStoresAndModels[rId];
					if(subModel){
						var ccId = subModel.store.getIdentity(childItem);
						var ccItem = subModel.model.byId(ccId);
						if(ccItem && ccItem.item){
							subModel.store.put(childItem);
							
							var newCCItem = subModel.model.byId(ccId);
							this.onGridUpdate(newCCItem.item, {
								type: "updateItem",
								rootNavItem: rItem
							});
						}
					}
				}else{
					var cId = this.store.getIdentity(childItem);
					var cItem = this.store.get(cId);
					if(cItem){
						this.store.put(childItem, {
							overwrite: true
						});
						
						this.getRootChildren(lang.hitch(this, function(items){
							var cuId = this.store.getIdentity(childItem);
							var updateedItem = this.store.get(cuId);
							this.onUpdate(childItem);
						}), lang.hitch(this, function(items){
							//TODO ERROR
						}), true);
					}
				}
			}
		},
		
		deleteItem: function(/*id string*/itemId, /*Item*/parent, /*Left Nav Bar Item*/rootNavItem){
			var item = null;
			if(!itemId){
				return;
			}else{
				item = this.store.get(itemId);
				if(item && this.store.getIdentity(item)){
					//TODO item exist
				}else{
					if(rootNavItem){
						var id = this.store.getIdentity(rootNavItem);
						var subModel = this.subStoresAndModels[id];
						if(subModel){
							var cItem = subModel.model.byId(itemId);
							if(cItem && cItem.item){
								//item with same id exist, return 
								item = cItem.item;
							}
						}
					}
				}
				if(item && this.store.getIdentity(item)){
					//TODO item exist
				}else{
					return;
				}
				if(!item){return;}
				this.updateItem(item, parent||this.root, null, null, null, rootNavItem);
			}
		},


		onChange: function(/*dojo/data/Item*/ /*===== item =====*/){
			// summary:
			//		Callback whenever an item has changed, so that Tree
			//		can update the label, icon, etc.   Note that changes
			//		to an item's children or parent(s) will trigger an
			//		onChildrenChange() so you can ignore those changes here.
			// tags:
			//		callback
		},

		onChildrenChange: function(/*===== parent, newChildrenList =====*/){
			// summary:
			//		Callback to do notifications about new, updated, or deleted items.
			// parent: dojo/data/Item
			// newChildrenList: Object[]
			//		Items from the store
			// tags:
			//		callback
		},
		
		onGridUpdate: function(/*dojo/data/Item*/ /*===== item =====*/ /*dojo/data/Item*/ /*===== ref item =====*/){
			// summary:
			//		Callback when an item has been added.
			// tags:
			//		callback
		},
		
		onInsert: function(/*dojo/data/Item*/ /*===== item =====*/ /*dojo/data/Item*/ /*===== ref item =====*/){
			// summary:
			//		Callback when an item has been added.
			// tags:
			//		callback
		},
		
		onUpdate: function(/*dojo/data/Item*/ /*===== item =====*/){
			// summary:
			//		Callback when an item has been added.
			// tags:
			//		callback
		},

		onDelete: function(/*dojo/data/Item*/ /*===== item =====*//*dojo/data/Item*/ /*===== ref item =====*/){
			// summary:
			//		Callback when an item has been deleted.
			//		Actually we have no way of knowing this with the new dojo.store API,
			//		so this method is never called (but it's left here since Tree connects
			//		to it).
			// tags:
			//		callback
		}
	});
	
	FlipCardStoreModel._DataStore = _DataStore;
	
	return FlipCardStoreModel;
});
