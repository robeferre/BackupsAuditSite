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
	"dojo/when",
	"dojo/request",
	"dojo/request/xhr",
	"dojo/date/locale",
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
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/CheckedMenuItem",
	"dijit/PopupMenuItem",
	"dijit/MenuSeparator",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/layout/_LayoutWidget",
	"dijit/layout/ContentPane",
	"dijit/layout/BorderContainer",
	
	"idx/layout/_FlipCardUtils",
	"idx/layout/_FlipCardNavBase",
	
	"dojo/i18n!./nls/FlipCardNavigator"
	
], function(kernel, array, declare, htmlUtil, connect, event, lang, winUtil, baseJson, has, 
		xhrUtil, NodeList, baseFx, coreFx, easingUtil,
		dom, domAttr, domClass, domStyle, domConstruct, domGeom, i18n, keys, topic, on, windowLib, 
		ready, cache, text, query, mouse, touch, cookie, json, hash, when, request, xhr, 
		locale, filterUtil, Memory, JsonRest, DataStore, Observable, QueryResults, SimpleQueryEngine,
		registry, wai, manager, baseFocus, a11y, focus, _WidgetBase, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, 
		Viewport, Button, Menu, MenuItem, CheckedMenuItem, PopupMenuItem, MenuSeparator,
		_Contained, _Container, _LayoutWidget, ContentPane, BorderContainer,
		_FlipCardUtils, _FlipCardNavBase
	){
	
	
	kernel.experimental("idx/layout/FlipCardNavigator");
	
	
	
	var _FCStoreModel = declare("idx/layout/_FCStoreModel", null, {
		
		store: null,
		idProperty: "id",
		labelAttr: "title",  //usually "name" as default
		labelType: "text",
		childrenAttr: "children",
		typeAttr: "type",
		
		constructor: function(/* Object */ args){
			lang.mixin(this, args);
			
			this.childrenAttr = this.childrenAttr || "children";
			
			if(!this.store){
				this.store = new Memory({
					data: []
				});
			}
			
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
			
		},

		destroy: function(){
			this.store = null;
		},
		
		hasChildren: function(/*id or item Object*/item){
			return this.store.hasChildren(item);
		},
		
		getRootChildren: function(/*function(items)*/ onComplete, /*function*/ onError, forceLoad){
			var res;
			when(res = this.store.query(),
				lang.hitch(this, function(items){
					onComplete(items);
				}),
				onError
			);
		},
		
		getChildren: function(/*id or item Object*/item, /*function(items)*/ onComplete, /*function*/ onError, forceLoad){
			if(!item){
				onComplete([]);
			}else{
				if(lang.isObject(item) || lang.isString(item)){
					if(lang.isString(item)){
						item = this.store.get(item);
					}else{
						var id = this.store.getIdentity(item);
						item = this.store.get(id);
					}
		
					var res = this.store.getChildren(item);
		
					when(res, onComplete, onError);
				}else{
					onComplete([]);
				}
			}
		},
		
		treePath: function(/*id or item Object*/item){
			var path = [];
			//TODO
			return path;
		},
		
		getItem: function(id){
			if(id){
				return this.store.get(id);
			}else{
				return null;
			}
		},
		
		isRootLevelItem: function(/* item or id */ item){
			if(lang.isObject(item) || lang.isString(item)){
				if(lang.isString(item)){
					item = this.store.get(item);
				}else{
					var id = this.store.getIdentity(item);
					item = this.store.get(id);
				}
				if(item.rootLevel){
					return true;
				}
			}
			return false;	// Boolean
		},

		isItem: function(/*===== something =====*/){
			return true;	// Boolean
		},

		getIdentity: function(/* item */ item){
			return this.store.getIdentity(item);	// Object
		},

		getLabel: function(/*dojo/data/Item*/ item){
			// summary:
			//		Get the label for an item
			return item[this.labelAttr];	// String
		}
		
	});
	
	
	
	//Menu stub
	var _Menu = declare("idx/layout/_Menu", [Menu], {
		//TODO
		postCreate: function(){
			this.inherited(arguments);
			
			domClass.add(this.domNode, "flipCardNavigationMenu");
		}
	});
	
	var _MenuItem = declare("idx/layout/_MenuItem", [MenuItem], {
		postCreate: function(){
			this.inherited(arguments);
			
			domClass.add(this.domNode, "flipCardNavigationMenuItem");
		}
	});
	
	var _ActionMenuItem = declare("idx/layout/_ActionMenuItem", [_MenuItem], {
		postCreate: function(){
			this.inherited(arguments);
			
			domClass.add(this.domNode, "flipCardActionMenuItem");
		}
	});
	
	var _PopupMenuItem = declare("idx/layout/_PopupMenuItem", [PopupMenuItem], {
		_openPopup: function(/*Object*/ params, /*Boolean*/ focus){
			var popup = this.popup;
			
			var menu = this.getParent();
			if(!menu){return;}
			
			if(menu && menu.menuContainer){
				if(!this.popupContentMenu){
					menu.menuContainer.addChild(this.popup);
					domClass.add(this.popup.domNode, "popupContentMenu slideOut");
					domStyle.set(this.popup.domNode, "display", "");
					
					this.popupContentMenu = this.popup;
					this.popupContentMenu.addChild(new _ActionMenuItem({
						label:"< Back", 
						onClick: lang.hitch(this, function(evt){
							domClass.remove(menu.domNode, "slideOut");
							domClass.add(this.popupContentMenu.domNode, "slideOut");
						})
					}), 0);
				}
				domClass.add(menu.domNode, "slideOut");
				domClass.remove(this.popupContentMenu.domNode, "slideOut");
			}
		},

		_closePopup: function(){
			//TODO
		}
	});
	
	
	
	var _MenuExpander = declare("idx/layout/_MenuExpander", [_MenuItem], 
	{
		iconClass:"dijitTreeExpando dijitTreeExpandoOpened", //dijitTreeExpandoClosed
		label: '',
		
		postCreate: function(){
			this.inherited(arguments);
			
			domClass.add(this.domNode, "fcNavExpanderMenuItem");
		}
	});
	
	
	
	var _MenuHeading = declare("idx/layout/_MenuHeading", [MenuSeparator], 
	{
		label: '',
		
		templateString: '<tr class="dijitReset oneuiMenuHeading" role="presentation" tabindex="-1">' + 
			'<td class="dijitReset oneuiMenuHeadingLabel" colspan="4" data-dojo-attach-point="containerNode"></td>' +
			'</tr>',
		
		_setLabelAttr: { node: "containerNode", type: "innerHTML" },
		
		baseClass: "oneuiMenuHeading"
	});
	
	
	
	// module:
	//		idx/layout/FlipCardNavigator
	// summary:
	//		navigation bar for different page content, each page can be an FlipCardGridContainer or a contentPane

	/**
	* @name idx.layout.FlipCardNavigator
	* @class navigation bar for different page content, each page can be an FlipCardGridContainer or a contentPane
	* @augments dijit._Widget
	* @augments dijit._TemplatedMixin
	* @augments dijit._WidgetsInTemplateMixin
	* @augments dijit._CssStateMixin
	*/ 
	
	return declare("idx/layout/FlipCardNavigator", [_FlipCardNavBase], {
		/**@lends idx.layout.FlipCardNavigator*/ 
		// summary:
		//		navigation bar for different page content, each page can be an FlipCardGridContainer or a contentPane
		//
		//		Example:
		// |	new FlipCardNavigator({navList: navigationParams})
		//
		//		Example:
		// |	<div data-dojo-type='idx.layout.FlipCardNavigator' data-dojo-props='navList: navigationParams'></div>
		
		baseClass: "idxFlipCardNavBase idxFlipCardNavigator",
		
		// cssStateNodes: {
			// "navBar": "idxFlipCardNavBar"
		// },
		
		// labelAttr: String
		//		Get label from the model using this attribute
		labelAttr: "title",
		
		/** @ignore */
		postMixInProperties: function(){
			this.inherited(arguments);
			
			this._nlsResources = i18n.getLocalization("idx/layout", "FlipCardNavigator");
			this.navTitle = this.navTitle || this._nlsResources.FlipCardNavigatorTitle;
			
			this._buildNavModel();
		},
		
		_buildNavModel: function(){
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
			var navListDataClone = lang.clone(this.buildNavListData());
			var store = new Memory({data: navListDataClone});
			
			// Create the model
			this.navListModel = new _FCStoreModel({
				idProperty: this.idProperty,
				labelAttr: this.labelAttr, 
				childrenAttr: this.childrenAttr,
				typeAttr: this.typeAttr,
				store: store, 
				query: this.query
			});	
			
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
		
		toggleExpanderMenuItems: function(menuItem, widget, forceHide){
			if(forceHide !== undefined){
				widget.refExpanderMenuItemsHided = forceHide ? true : false;
			}else{
				widget.refExpanderMenuItemsHided = !widget.refExpanderMenuItemsHided;
			}
			
			//toggle menu item
			domClass.toggle(widget.iconNode, "dijitTreeExpandoClosed", widget.refExpanderMenuItemsHided);
			domClass.toggle(widget.iconNode, "dijitTreeExpandoOpened", !widget.refExpanderMenuItemsHided);
			
			//toggle expandRefs
			if(menuItem.expandRef && menuItem.expandRef.length > 0){
				array.forEach(menuItem.expandRef, function(itemId){
					var targetNode = this.navAllNodes[itemId];
					if(targetNode){
						domClass.toggle(targetNode, "menuItemHidden", widget.refExpanderMenuItemsHided);
					}
				}, this);
			}
		},
		
		/** @ignore */
		buildNavigationMenuItem: function(menuItem, menu, menuContainer){
			if(menuItem[this.typeAttr] == "nav" || menuItem[this.typeAttr] == "settings"){
				if(menuItem[this.childrenAttr] && menuItem[this.childrenAttr].length > 0){
					var itemSubMenu = new _Menu({parentMenu:menu, menuContainer: menuContainer});
					array.forEach(menuItem[this.childrenAttr], function(subMenuItem){
						this.buildNavigationMenuItem(subMenuItem, itemSubMenu, menuContainer);
					}, this);
					
					var popupMenuItem = new _PopupMenuItem({label:menuItem[this.labelAttr], popup:itemSubMenu})
					menu.addChild(popupMenuItem);
					
					this.navAllNodes[menuItem[this.idProperty]] = popupMenuItem.domNode;
					
				}else if(menuItem.expandRef){
					var detailMenuExpander = new _MenuExpander({label: menuItem[this.labelAttr]});
					menu.addChild(detailMenuExpander);
					if(menuItem.handleNav){
						this.own(on(detailMenuExpander.iconNode.parentNode, touch.press, lang.hitch(this, function(evt){
							event.stop(evt);
						    this.toggleExpanderMenuItems(menuItem, detailMenuExpander);
						})));
						//a11y
						this.own(on(detailMenuExpander.iconNode.parentNode, "keydown", lang.hitch(this, function(evt){
							if(evt.keyCode == keys.ENTER){
								event.stop(evt);
						    	this.toggleExpanderMenuItems(menuItem, detailMenuExpander);
							}
						})));
						
						this.own(on(detailMenuExpander, touch.press, lang.hitch(this, function(evt){
						    this.handleNavigationDistributeById(menuItem[this.idProperty], evt);
						})));
						//a11y
						this.own(on(detailMenuExpander, "keydown", lang.hitch(this, function(evt){
							if(evt.keyCode == keys.ENTER){
								this.handleNavigationDistributeById(menuItem[this.idProperty], evt);
							}
						})));
					}else{
						this.own(on(detailMenuExpander, touch.press, lang.hitch(this, function(evt){
						    this.toggleExpanderMenuItems(menuItem, detailMenuExpander);
						})));
						//a11y
						this.own(on(detailMenuExpander, "keydown", lang.hitch(this, function(evt){
							if(evt.keyCode == keys.ENTER){
								this.toggleExpanderMenuItems(menuItem, detailMenuExpander);
							}
						})));
					}
					
					this.navAllNodes[menuItem[this.idProperty]] = detailMenuExpander.domNode;
					
				}else{
					var detailMenuItem = new _MenuItem({label: menuItem[this.labelAttr]});
					menu.addChild(detailMenuItem);
					this.own(on(detailMenuItem, touch.press, lang.hitch(this, function(evt){
					    this.handleNavigationDistributeById(menuItem[this.idProperty], evt);
					})));
					//a11y
					this.own(on(detailMenuItem, "keydown", lang.hitch(this, function(evt){
						if(evt.keyCode == keys.ENTER){
							this.handleNavigationDistributeById(menuItem[this.idProperty], evt);
						}
					})));
					
					this.navAllNodes[menuItem[this.idProperty]] = detailMenuItem.domNode;
					
				}
			}else if(menuItem[this.typeAttr] == "separator"){
				var menuHeading = new _MenuHeading({label: menuItem[this.labelAttr]});
				menu.addChild(menuHeading);
				
				this.navAllNodes[menuItem[this.idProperty]] = menuHeading.domNode;
				
			}
		},
		
		/** @ignore */
		initNavigation: function(){
			this.inherited(arguments);
			
			if(this.navList){
				array.forEach(this.navList, function(item){
					var itemNode = this.buildRootNavItem(item);
					
					if(item[this.childrenAttr]){
						var ecPane = new ContentPane({
							style: "display:none"
						}).placeAt(this.expandoNode.containerNode);
						domClass.add(ecPane.domNode, "expandoContentPane flipCardMenuContainer");
						
						var itemMenu = new _Menu({
							menuContainer: ecPane
						}).placeAt(ecPane.containerNode);
						array.forEach(item[this.childrenAttr], function(mItem){
							this.buildNavigationMenuItem(mItem, itemMenu, ecPane);
							if(!this.initItemId){
								this.initItemId = mItem[this.idProperty];
							}
						}, this);
						this.expandoContentPanes[item[this.idProperty]] = ecPane;
					}else{
						if(!this.initItemId){
							this.initItemId = item[this.idProperty];
						}
					}
					
					this.own(on(itemNode, touch.press, lang.hitch(this, function(item, evt){
						this.handleNavigationDistribute(item, evt);
					}, item)));
					//a11y
					this.own(on(itemNode, "keydown", lang.hitch(this, function(item, evt){
						if(evt.keyCode == keys.ENTER){
							this.handleNavigationDistribute(item, evt);
						}
					}, item)));
					
					if(!this.selectedNavItemId){
                        this.selectedNavItemId = item[this.idProperty];
                    }
                    
                    this.navAllNodes[item[this.idProperty]] = itemNode;
					
					// this.borderNode.startup();
				}, this);
				
			}
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
       
		getMetadata: function(context){
			this.metadata = {
				id: this.idProperty,
				items: this.navList
			}
			if(context){
				return baseJson.toJson(this.metadata);
			}else{
				return this.metadata;
			}
		}
	
	});
});