/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/kernel", // kernel.isAsync
	"dojo/_base/array", // array.forEach array.indexOf array.map
	"dojo/_base/declare", // declare
	"dojo/_base/html", // Deferred
	"dojo/_base/connect",
	"dojo/_base/event", // event.stop
	"dojo/_base/lang", // lang.mixin lang.hitch
	"dojo/_base/window",
	"dojo/_base/json",
	"dojo/_base/sniff",
	"dojo/_base/xhr",
	"dojo/_base/NodeList",
	"dojo/_base/fx",
	"dojo/fx",
	"dojo/fx/easing", 
	"dojo/dom", // attr.set
	"dojo/dom-attr", // attr.set
	"dojo/dom-class", // domClass.add domClass.contains
	"dojo/dom-style", // domStyle.set
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/i18n", // i18n.getLocalization
	"dojo/keys",
	"dojo/topic", // topic.publish()
	"dojo/on",
	"dojo/window",
	"dojo/ready",
	"dojo/cache",
	"dojo/text",
	"dojo/query",
	"dojo/mouse",
	"dojo/touch",
	"dojo/cookie", 
	"dojo/json",
	"dojo/hash",
	"dojo/aspect",
	"dojo/when",
	"dojo/request",
	"dojo/request/xhr",
	"dojo/date/locale",
	
	"dojo/data/ItemFileReadStore",
	"dojo/data/ItemFileWriteStore",
	"dojo/data/util/filter", 
	"dojo/store/Memory",
	"dojo/store/JsonRest",
	"dojo/store/DataStore",
	"dojo/store/Observable",
	'dojo/store/util/QueryResults',
	'dojo/store/util/SimpleQueryEngine',
	
	"dijit/registry",
	"dijit/_base/wai",
	"dijit/_base/manager",	// manager.defaultDuration
	"dijit/_base/focus", // dijit.getFocus()
	"dijit/a11y",
	"dijit/focus",
	"dijit/_WidgetBase",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/_CssStateMixin",
	"dijit/Viewport",
	"dijit/form/Button",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/layout/_LayoutWidget",
	"dijit/layout/ContentPane",
	"dijit/layout/BorderContainer",
	
	"gridx/allModules",
	"gridx/Grid",
	"gridx/core/model/cache/Sync",
	"gridx/core/model/cache/Async",
	
	"idx/layout/_FlipCardUtils",
	"idx/layout/FlipCardNavModule",
	"idx/layout/FlipCardStoreModel",
	"idx/layout/_FlipCardNavBase",
	
	"dojo/i18n!./nls/FlipCardNavDynamic"
	
], function(kernel, array, declare, htmlUtil, connect, event, lang, winUtil, baseJson, has, 
		xhrUtil, NodeList, baseFx, coreFx, easingUtil,
		dom, domAttr, domClass, domStyle, domConstruct, domGeom, i18n, keys, topic, on, windowLib, 
		ready, cache, text, query, mouse, touch, cookie, JSON, hash, aspect, when, request, xhr, locale, 
		ItemFileReadStore, ItemFileWriteStore, 
		filterUtil, Memory, JsonRest, DataStore, Observable, QueryResults, SimpleQueryEngine,
		registry, wai, manager, baseFocus, a11y, focus, 
		_WidgetBase, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, 
		Viewport, Button, _Contained, _Container, _LayoutWidget, ContentPane, BorderContainer,
		allModules, Grid, Sync, Async,
		_FlipCardUtils, FlipCardNavModule, FlipCardStoreModel, _FlipCardNavBase
	){
	
	
	kernel.experimental("idx/layout/FlipCardNavDynamic");
	
	
	
	// module:
	//		idx/layout/FlipCardNavDynamic
	// summary:
	//		navigation bar for different page content, each page can be an FlipCardGridContainer or a contentPane

	/**
	* @name idx.layout.FlipCardNavDynamic
	* @class navigation bar for different page content, each page can be an FlipCardGridContainer or a contentPane
	* @augments dijit._Widget
	* @augments dijit._TemplatedMixin
	* @augments dijit._WidgetsInTemplateMixin
	* @augments dijit._CssStateMixin
	*/ 
	
	return declare("idx/layout/FlipCardNavDynamic", [_FlipCardNavBase], {
		/**@lends idx.layout.FlipCardNavDynamic*/ 
		// summary:
		//		navigation bar for different page content, each page can be an FlipCardGridContainer or a contentPane
		//
		//		Example:
		// |	new FlipCardNavDynamic({navList: navigationParams})
		//
		//		Example:
		// |	<div data-dojo-type='idx.layout.FlipCardNavDynamic' data-dojo-props='navList: navigationParams'></div>
		
		baseClass: "idxFlipCardNavBase idxFlipCardNavDynamic",
		
		// cssStateNodes: {
			// "navBar": "idxFlipCardNavBar"
		// },
		
		// labelAttr: String
		//		Get label from the model using this attribute
		labelAttr: "title",
		
		// query: Object
		//		Specifies datastore query to return the root item or top items for the tree.
		//		e.g. {id: "earth"}
		query: null,
		
		/** @ignore */
		postMixInProperties: function(){
			this.inherited(arguments);
			
			this._nlsResources = i18n.getLocalization("idx/layout", "FlipCardNavDynamic");
			this.navTitle = this.navTitle || this._nlsResources.FlipCardNavDynamicTitle;
			
			this.subGridxNavs = {};
			
			this._buildNavModel();
		},
		
		_buildNavModel: function(){
			var store = null;
			if(this.navList instanceof ItemFileReadStore || this.navList instanceof ItemFileWriteStore){
				store = new FlipCardStoreModel._DataStore({store:this.navList});
			}else if(this.navList instanceof Memory || this.navList instanceof DataStore){
				store = this.navList;
			}else{
				if(lang.isObject(this.navList)){
					this.idProperty = this.navList.idProperty || this.idProperty;
					this.navList = lang.clone(this.navList.items);
				}else if(lang.isString(this.navList)){
					xhr.post(this.navList, {
						// handleAs: "json",
						sync: true,
						data: { query: ""}
					}).then(lang.hitch(this, function(data){
						var navData = baseJson.fromJson(data);
						this.idProperty = navData.idProperty || this.idProperty;
						this.navList = navData.items;
					}), lang.hitch(this, function(error){
						console.log(error);
					}));
				}else{
					//TODO
				}
				//build store
				store = new Memory({
					idProperty: this.idProperty,
					data: this.navList
				});
			} 
			
			
			// Create the model
			this.navListModel = new FlipCardStoreModel({
				idProperty: this.idProperty,
				labelAttr: this.labelAttr, 
				childrenAttr: this.childrenAttr,
				typeAttr: this.typeAttr,
				store: store, 
				query: this.query
			});
			
			this.own(
				aspect.after(this.navListModel, "onChange", lang.hitch(this, "_onItemChange"), true),
				aspect.after(this.navListModel, "onChildrenChange", lang.hitch(this, "_onItemChildrenChange"), true),
				aspect.after(this.navListModel, "onInsert", lang.hitch(this, "_onItemInsert"), true),
				aspect.after(this.navListModel, "onUpdate", lang.hitch(this, "_onItemUpdate"), true),
				aspect.after(this.navListModel, "onDelete", lang.hitch(this, "_onItemDelete"), true),
				aspect.after(this.navListModel, "onGridUpdate", lang.hitch(this, "_onGridItemUpdate"), true)
			);
			
			this.navListStore = this.navListModel.store;
				
		},

		/** @ignore */
		postCreate: function(){
			
			this.inherited(arguments);
			//TODO
		},
		
		/** @ignore */
		startup: function(){
			
			this.inherited(arguments);
			//TODO
		},
		
		
		/** @ignore */
		initNavigation: function(){
			this.inherited(arguments);
				
			this.navListModel.getRootChildren(lang.hitch(this, function(items){
				array.forEach(items, function(item){
					var itemId = this.navListModel.getIdentity(item);
					var itemLabel = this.navListModel.getLabel(item);
					
					var itemNode = this.buildRootNavItem(item);
					
					if(this.navListModel.hasChildren(item)){
						this.navListModel.getChildren(item, lang.hitch(this, function(cItems){
							if(cItems.length > 0){
								var ecPane = new ContentPane({
									style: "display:none"
								}).placeAt(this.expandoNode.containerNode);
								domClass.add(ecPane.domNode, "expandoContentPane flipCardMenuContainer");
								
								var gridNavStore = new Memory({
							        data: cItems
							    });
							    gridNavStore.hasChildren = lang.hitch(this, function(id, item){
									return item && item[this.childrenAttr] && item[this.childrenAttr].length;
								});
								gridNavStore.getChildren = lang.hitch(this, function(item, options){
									return QueryResults(SimpleQueryEngine(options.query, options)(item[this.childrenAttr]));
								});
							    gridNavLayout = [
									{id: this.idProperty, name: this.idProperty, field: this.idProperty},
									{id: this.labelAttr, name: this.labelAttr, field: this.labelAttr},
									{id: this.typeAttr, name: this.typeAttr, field: this.typeAttr},
									{id: this.childrenAttr, name: this.childrenAttr, field: this.childrenAttr},
									{id: this.pressHandlerAttr, name: this.pressHandlerAttr, field: this.pressHandlerAttr}
								];
								var gridxNav = new Grid({
									cacheClass: "gridx/core/model/cache/Sync",
									store: gridNavStore,
									structure: gridNavLayout,
									// touch: true,
									// bodyRowHoverEffect: false,
									headerHidden: true,
									
									modules: [
										"gridx/modules/CellWidget",
										"gridx/modules/Filter",
										// "gridx/modules/filter/QuickFilter",
										// "gridx/modules/TouchVScroller",
										{
											moduleClass: "gridx/modules/HiddenColumns",
											init: [this.idProperty, this.typeAttr, this.childrenAttr, this.pressHandlerAttr]
										},
										{
											moduleClass: "idx/layout/FlipCardNavModule",
											rootNavName: itemLabel
										}
									]
								});
								
								gridxNav.connect(gridxNav.body, 'onCheckCustomRow', lang.hitch(this, function(row, output){
									var rowData = row.data();
									if(rowData[this.typeAttr] == "separator"){
										output[row[this.idProperty]] = true;
									}
								}));
								gridxNav.connect(gridxNav.body, 'onBuildCustomRow', lang.hitch(this, function(row, output){
									var rowData = row.data();
									output[row[this.idProperty]] = "<div class='gridxCell' colid='" + this.labelAttr + "'>" + rowData[this.labelAttr] + "</div>";
								}));
								
								gridxNav.placeAt(ecPane.containerNode);
								gridxNav.startup();
								
								aspect.after(ecPane, "resize", lang.hitch(this, function(changedSize){
									gridxNav.body.refresh();
									gridxNav.resize();
								}), true);
								
								var onNavItemSelected = function(evt){
									var cell = gridxNav.cell(evt.rowId, evt.columnId, true);
									if(evt.columnId == "__nextLevelButton__"){
										// cell.node().blur();
										return;
									}
									var gridNavItem = cell.row.data();
									var navItemId = gridNavItem[this.idProperty];
									gridNavItem = gridxNav.model.byId(navItemId).item;
									
									this.handleNavigationDistribute(gridNavItem, evt);
									
									// var cellData = cell.data();
									// var isRowSelected = cell.row.isSelected();
									// var headerName = cell.column.name();
								}
								
								if(gridxNav.touch){
									gridxNav.connect(gridxNav, "onCellTouchStart", lang.hitch(this, onNavItemSelected));
								}
								gridxNav.connect(gridxNav, "onCellMouseDown", lang.hitch(this, onNavItemSelected));
								gridxNav.connect(gridxNav, "onCellKeyDown", lang.hitch(this, function(evt){
									if(evt.keyCode == keys.ENTER){
										onNavItemSelected.apply(this, arguments);
									}
								}));
								
								//build sub model
								// gridxNav.model.when();
								this.navListModel.subStoresAndModels[itemId] = {store:gridxNav.store, model:gridxNav.model, parentId:itemId};
								//build sub nav nodes
								this.subGridxNavs[itemId] = {container: ecPane, nav:gridxNav};
								
								var cItemId = this.navListModel.getIdentity(cItems[0]);
								if(!this.initItemId){
									this.initItemId = cItemId;
								}
								
								this.expandoContentPanes[itemId] = ecPane;
							}
						}));
					}else{
						if(!this.initItemId){
							this.initItemId = itemId;
						}
					}
					
					this.own(on(itemNode, touch.press, lang.hitch(this, function(itemId, evt){
						this.handleNavigationDistributeById(itemId, evt);
					}, itemId)));
					//a11y
					this.own(on(itemNode, "keydown", lang.hitch(this, function(itemId, evt){
						if(evt.keyCode == keys.ENTER){
							this.handleNavigationDistributeById(itemId, evt);
						}
					}, itemId)));
					
					if(!this.selectedNavItemId){
                        this.selectedNavItemId = itemId;
                    }
					
					// this.borderNode.startup(); 
				}, this);
			}));
		},
		
		
		/** @ignore */
		initNavItem: function(){
			this.inherited(arguments);
			
			if(this.doInitNavItem){
			    this.handleNavigationDstrProcessById(this.initItemId);
			    this.handleNavSelectionExtra();
			}
		},
		
		
		initContent: function(){
			this.inherited(arguments);
			
		    //TODO
      	},
      
		
		_onItemChange: function(/*Item*/ item){
			// summary:
			//		Processes notification of a change to an item's scalar values like label
			
			var itemId = this.navListModel.getIdentity(item);
			if(!itemId){return;}
			
			// var model = this.model,
				// identity = model.getIdentity(item),
				// nodes = this._itemNodesMap[identity];
			// if(nodes){
				// var label = this.getLabel(item),
					// tooltip = this.getTooltip(item);
				// array.forEach(nodes, function(node){
					// node.set({
						// item: item, // theoretically could be new JS Object representing same item
						// label: label,
						// tooltip: tooltip
					// });
					// node._updateItemClasses(item);
				// });
			// }
		},
		
		_onItemChildrenChange: function(/*dojo/data/Item*/ parent, /*dojo/data/Item[]*/ newChildrenList){
			// summary:
			//		Processes notification of a change to an item's children
			
			console.log(parent);
			console.log(newChildrenList);
			
			
			// var model = this.model,
				// identity = model.getIdentity(parent),
				// parentNodes = this._itemNodesMap[identity];
			// if(parentNodes){
				// array.forEach(parentNodes, function(parentNode){
					// parentNode.setChildItems(newChildrenList);
				// });
			// }
		},
		
		_onGridItemUpdate: function(/*Item*/ item, /*dojo/data/Item[]*/ args){
			if(args.type){
				if(args.type == "insert"){
					if(args.rootNavItem){
						var rId = this.navListModel.getIdentity(args.rootNavItem);
						// var subModel = this.navListModel.subStoresAndModels[rId];
						var gridxStub = this.subGridxNavs[rId];
						
						//TODO add more UI process
						gridxStub.nav.body.refresh();
					}
				}else if(args.type == "delete"){
					var rId = this.navListModel.getIdentity(args.rootNavItem);
					var gridxStub = this.subGridxNavs[rId];
					if(gridxStub.container && gridxStub.container.destroyRecursive){
						gridxStub.container.destroyRecursive();
					}
					delete this.subGridxNavs[rId];
				}else if(args.type == "deleteItem"){
					//TODO
				}else if(args.type == "updateItem"){
					//TODO
				}
			}
			
			
		},
		
		_onItemInsert: function(/*Item*/ item, /*dojo/data/Item[]*/ refItem){
			// summary:
			//		Processes notification of a change to an item's children
			
			var itemId = this.navListModel.getIdentity(item);
			if(!itemId){return;}
			var targetNode = this.navListNodes[itemId], refNode;
			
			if(refItem){
				var refItemId = this.navListModel.getIdentity(refItem);
				refNode = this.navListNodes[refItemId];
			}
			
			var itemNode = this.buildRootNavItem(item, refNode);
			this.own(on(itemNode, touch.press, lang.hitch(this, function(itemId, evt){
				this.handleNavigationDistributeById(itemId, evt);
			}, itemId)));
			//a11y
			this.own(on(itemNode, "keydown", lang.hitch(this, function(itemId, evt){
				if(evt.keyCode == keys.ENTER){
					this.handleNavigationDistributeById(itemId, evt);
				}
			}, itemId)));
			
			
			this.own(on(itemNode, touch.press, lang.hitch(this, function(node, nId, evt){
				this.selectedNavItemId = nId;
				this.handleNavSelectionExtra();
			}, itemNode, itemId)));
			//a11y
			this.own(on(itemNode, "keydown", lang.hitch(this, function(node, nId, evt){
				if(evt.keyCode == keys.ENTER){
					this.selectedNavItemId = nId;
					this.handleNavSelectionExtra();
				}
			}, itemNode, itemId)));
		},
		
		_onItemUpdate: function(/*Item*/ item){
			// summary:
			//		Processes notification of a change to an item's children
			
			var itemId = this.navListModel.getIdentity(item);
			if(!itemId){return;}
			item = this.navListModel.getItem(itemId);
			if(!item){return;}
			
			var targetNode = this.navListNodes[itemId];
			
			if(targetNode){
				//for icon node
				if(item.iconClass || item.icon){
					var tNode = query(".navItemIcon", targetNode)[0];
					
					if(item.iconClass){
						domClass.remove(tNode);
						domClass.add(tNode, "navItemIcon " + item.iconClass);
					}
					if(item.icon){
						domAttr.set(tNode, "src", item.icon);
					}
					if(item[this.labelAttr]){
						domAttr.set(tNode, "title", item[this.labelAttr]);
					}
				}
				//for desc node
				if(item.descClass || item[this.labelAttr]){
					var tNode = query(".navItemDesc", targetNode)[0];
					
					if(item.descClass){
						domClass.remove(tNode);
						domClass.add(tNode, "navItemDesc " + item.descClass);
					}
					if(item[this.labelAttr]){
						domAttr.set(tNode, "innerHTML", item[this.labelAttr]);
					}
				}
			}
		},
		
		_onItemDelete: function(/*id*/ itemId, refItem){
			// summary:
			//		Processes notification of a deletion of an item.
			//		Not called from new dojo.store interface but there's cleanup code in setChildItems() instead.

			console.log(itemId);
			
			if(!itemId){return;}
			var targetNode = this.navListNodes[itemId];
			
			if(targetNode){
				//for icon node
				domConstruct.destroy(targetNode);
			}else{
				//TODO
			}
			// var model = this.model,
				// identity = model.getIdentity(item),
				// nodes = this._itemNodesMap[identity];
			// if(nodes){
				// array.forEach(nodes, function(node){
					// // Remove node from set of selected nodes (if it's selected)
					// this.dndController.removeTreeNode(node);
					// var parent = node.getParent();
					// if(parent){
						// // if node has not already been orphaned from a _onSetItem(parent, "children", ..) call...
						// parent.removeChild(node);
					// }
					// node.destroyRecursive();
				// }, this);
				// delete this._itemNodesMap[identity];
			// }
		},
		
		
		destroy: function(){
			//TODO
			
			this.inherited(arguments);
		},
		
		getMetadata: function(context){
			this.metadata = {
				id: this.idProperty,
				items: []
			}
			
			//assume sync currently
			this.navListModel.getRootChildren(lang.hitch(this, function(items){
				this.metadata = {
					id: this.idProperty,
					items: items
				}
			}), lang.hitch(this, function(error){
				console.log(error);
			}), true);
			
			if(context){
				return baseJson.toJson(this.metadata);
			}else{
				return this.metadata;
			}
		}
	
	});
});