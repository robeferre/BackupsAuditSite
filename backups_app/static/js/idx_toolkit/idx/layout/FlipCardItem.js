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
	"dojo/data/util/filter", 
	"dojo/date/locale",
	"dojo/data/ItemFileWriteStore",
	"dojo/store/Memory",
	"dojo/store/DataStore",
	
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
	"dijit/_KeyNavMixin",
	"dijit/_KeyNavContainer",
	"dijit/Viewport",
	"dijit/form/Button",
	"dijit/form/DropDownButton",
	"dijit/form/ComboButton",
	"dijit/form/ToggleButton",
	"dijit/CheckedMenuItem",
	"dijit/PopupMenuItem",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/layout/_LayoutWidget",
	"dijit/layout/ContentPane",
	"dijit/Dialog", 
	"dijit/TitlePane", 
	"dijit/Menu", 
	"dijit/MenuItem", 
	"dijit/MenuSeparator", 
	"dijit/MenuBar", 
	"dijit/MenuBarItem", 
	"dijit/PopupMenuBarItem", 	
	
	"dojox/fx",
	"dojox/fx/flip",
	"dojox/html/_base",
	
	"idx/widget/ModalDialog",
	"idx/layout/_FlipCardUtils",
	
	"dojo/i18n!./nls/FlipCardItem"
	
], function(kernel, array, declare, htmlUtil, connect, event, lang, winUtil, baseJson, has, 
		xhrUtil, NodeList, baseFx, coreFx, easingUtil,
		dom, domAttr, domClass, domStyle, domConstruct, domGeom, i18n, keys, topic, on, windowLib, 
		ready, cache, text, query, mouse, touch, cookie, json, hash,
		filterUtil, locale, ItemFileWriteStore, Memory, DataStore,
		registry, wai, manager, baseFocus, a11y, focus, 
		_WidgetBase, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, _KeyNavMixin, _KeyNavContainer,
		Viewport, Button, DropDownButton, ComboButton, ToggleButton,  CheckedMenuItem, PopupMenuItem, 
		_Contained, _Container, _LayoutWidget, ContentPane, Dialog, TitlePane, 
		Menu, MenuItem, MenuSeparator,  MenuBar, MenuBarItem, PopupMenuBarItem,
		dojoxFx, flip, dojoxHtmlUtil, ModalDialog, _FlipCardUtils
	){
		
		
	kernel.experimental("idx/layout/FlipCardItem");
	
	//css3 support detector(program once)
	if(!window.supportCSS3AnimationDetected){
		var supports = (function() {
			var div = document.createElement('div');
			return function(prop) {
			 	vendors = 'Khtml O Moz Webkit'.split(' '), len = vendors.length;
				if ( prop in div.style)
					return true;
				if ('-ms-' + prop in div.style)
					return true;
				prop = prop.replace(/^[a-z]/, function(val) {
					return val.toUpperCase();
				});
				while (len--) {
					if (vendors[len] + prop in div.style) {
						return true;
					}
				}
				return false;
			};
		})();
		_supportCSS3Animation = supports('transform') && supports('transition') && supports('perspective') && supports('animation');
	}
	window.supportCSS3AnimationDetected = true;
	
	
	//platform detector(program once)
	(function(){
		if(window.platformDetected){return;}
		
		var themeMap = {
			"Holodark":"holodark",
			"Android 3":"holodark",
			"Android 4":"holodark",
			"Android":"android",
			"BlackBerry":"blackberry",
			"BB10":"blackberry",
			"iPhone":"iphone",
			"iPad":"ipad",
			"MSIE 10":"windows",
			"WindowsPhone":"windows",
			"Custom":"custom"
		}
		var dua = navigator.userAgent;
		var platform = ""; //"tablet", "phone", "mobile", ......
		if(dua.match(/(iPhone|iPod|iPad|Android|Holodark|BlackBerry|BB10|WindowsPhone)/)){
			platform += "mobile||";
			if((dua.indexOf("iPod")>=0) || (dua.indexOf("iPhone")>=0) || (dua.indexOf("WindowsPhone")>=0)){
				platform += "phone||";
			} else if (dua.indexOf("iPad")>=0) {
				platform += "tablet||";
			}
			for(var key in themeMap){
				if(dua.indexOf(key) > -1){
					var theme = themeMap[key];
					platform += theme + "||";
					// dm.currentTheme = theme;
				}
			}
		}else{
			platform += "desktop||";
		}
		
		//For IE10
		if (dua.match(/IEMobile\/10\.0/)) {
			var msViewportStyle = document.createElement("style");
			msViewportStyle.appendChild(document.createTextNode("@-ms-viewport{width:auto!important}"));
			document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
		}

		has.add("desktop",(platform.indexOf("desktop")>-1));
		has.add("mobile",(platform.indexOf("mobile")>-1));
		has.add("phone",(platform.indexOf("phone")>-1));
		has.add("tablet",(platform.indexOf("tablet")>-1));
		
		//document class
		var pOriginArray = platform.split("||"), pArray = [];
		for(var i = 0; i < pOriginArray.length; i++){
			if(pOriginArray[i]){
				pArray.push(pOriginArray[i] + "Platform");
			}
		}
		document.documentElement.className += " " + pArray.join(" ");
		
		window.platformDetected = true;
	})();
	
	
	
	var _Button = declare("idx/layout/_Button", [Button], {
		postCreate: function(){
			this.inherited(arguments);
			
			domStyle.set(this.valueNode, "display", "none");
		}
	});
	
	
	var _MenuItem = declare("idx/layout/_MenuItem", [MenuItem], {
		//TODO
	});
	var _PopupMenuItem = declare("idx/layout/_PopupMenuItem", [PopupMenuItem], {
		//TODO
	});
	var _Menu = declare("idx/layout/_Menu", [Menu], {
		//TODO
	});
	
	
	var _MenuBarItem = declare("idx/layout/_MenuBarItem", [MenuBarItem], {
		postCreate: function(){
			this.inherited(arguments);
			
			this.itemClass = this.itemClass||"defaultIconNode";
			
			domClass.add(this.domNode, "portletAction portletMenuBarAction");
			
			if(this.itemType == "icon"){
				domConstruct.empty(this.containerNode);
				this.iconNode = domConstruct.create("div",{
					className: "portletActionIconNode " + this.itemClass,
					title: this.label || this.title || "Action",
					src:"",
					waiRole: "presentation"
				}, this.containerNode);
			}
		},
		
		itemClass: "defaultIconNode",
		_setItemClassAttr: function(itemClass){
			if(this.iconNode){
				domClass.replace(this.iconNode, itemClass, this.itemClass);
			}
			this.itemClass = itemClass;
		}
	});
	var _PopupMenuBarItem = declare("idx/layout/_PopupMenuBarItem", [PopupMenuBarItem], {
		//TODO
	});
	var _MenuBar = declare("idx/layout/_MenuBar", [MenuBar], {
		onItemClick: function(/*dijit/_WidgetBase*/ item, /*Event*/ evt){
			this.inherited(arguments);
			evt && event.stop(evt);
		}
	});
	
	
	var _ResizeHelper = dojo.declare("idx/layout/_ResizeHelper", [_Widget], {
		show: function(){
			domStyle.set(this.domNode, "display", "");
		},
		
		hide: function(){
			domStyle.set(this.domNode, "display", "none");
		},
		
		resize: function(/* Object */dim){
			domGeom.setMarginBox(this.domNode, dim);
		}
	});
	var _ResizeHandle = declare("idx/layout/_ResizeHandle", [_Widget, _TemplatedMixin], {
		targetId: "",
		targetContainer: null,
		resizeAxis: "xy",
		activeResize: false,
		activeResizeClass: "dojoxResizeHandleClone fpResizeHandleClone",
		animateSizing: true,
		animateMethod: "chain",
		animateDuration: 225,
		minHeight: 30,
		minWidth: 50,
		constrainMax: false,
		maxHeight:0,
		maxWidth:0,
		fixedAspect: false,
		intermediateChanges: false,
	
		startTopic: "/dojo/resize/start",
		endTopic:"/dojo/resize/stop",
	
		templateString: '<div dojoAttachPoint="resizeHandle" class="dojoxResizeHandle fpResizeHandle"><div></div></div>',
		
		postCreate: function(){
			this.connect(this.resizeHandle, touch.press, "_beginSizing");
			if(!this.activeResize){
				this._resizeHelper = manager.byId('dojoxGlobalResizeHelper');
				if(!this._resizeHelper){
					this._resizeHelper = new _ResizeHelper({
							id: 'dojoxGlobalResizeHelper'
					}).placeAt(winUtil.body());
					domClass.add(this._resizeHelper.domNode, this.activeResizeClass);
				}
			}else{ this.animateSizing = false; }
	
			if(!this.minSize){
				this.minSize = { w: this.minWidth, h: this.minHeight };
			}
			
			if(this.constrainMax){
				this.maxSize = { w: this.maxWidth, h: this.maxHeight }
			}
			
			this._resizeX = this._resizeY = false;
			var addClass = lang.partial(domClass.add, this.resizeHandle);
			switch(this.resizeAxis.toLowerCase()){
				case "xy" :
					this._resizeX = this._resizeY = true;
					addClass("dojoxResizeNW fpResizeNW");
					break;
				case "x" :
					this._resizeX = true;
					addClass("dojoxResizeW fpResizeW");
					break;
				case "y" :
					this._resizeY = true;
					addClass("dojoxResizeN fpResizeN");
					break;
			}
		},
		
		_beginSizing: function(/*Event*/ e){
			if(this._isSizing){ return; }
	
			connect.publish(this.startTopic, [ this ]);
			this.targetWidget = manager.byId(this.targetId);
	
			this.targetDomNode = this.targetWidget ? this.targetWidget.domNode : dom.byId(this.targetId);
			if(this.targetContainer){ this.targetDomNode = this.targetContainer; }
			if(!this.targetDomNode){ return; }
	
			if(!this.activeResize){
				var c = domGeom.position(this.targetDomNode, true);
				this._resizeHelper.resize({l: c.x, t: c.y, w: c.w, h: c.h});
				this._resizeHelper.show();
				if(!this.isLeftToRight()){
					this._resizeHelper.startPosition = {l: c.x, t: c.y};
				}
			}
	
			this._isSizing = true;
			this.startPoint  = { x:e.clientX, y:e.clientY };
	
			var style = domStyle.getComputedStyle(this.targetDomNode), 
				borderModel = domGeom.boxModel==='border-model',
				padborder = borderModel?{w:0,h:0}:domGeom.getPadBorderExtents(this.targetDomNode, style),
				margin = domGeom.getMarginExtents(this.targetDomNode, style),
				mb;
			mb = this.startSize = { 
					// w: domStyle.get(this.targetDomNode, 'width', style), 
					// h: domStyle.get(this.targetDomNode, 'height', style),
					// fix issue when import dojox.css3.fx
					w: domStyle.get(this.targetDomNode, 'width'), 
					h: domStyle.get(this.targetDomNode, 'height'),
					pbw: padborder.w, pbh: padborder.h,
					mw: margin.w, mh: margin.h};
			if(!this.isLeftToRight() && domStyle.get(this.targetDomNode, "position") == "absolute"){
				var p = domGeom.position(this.targetDomNode, true);
				this.startPosition = {l: p.x, t: p.y};
			}
			
			this._pconnects = [
				connect.connect(winUtil.doc, touch.move, this, "_updateSizing"),
				connect.connect(winUtil.doc, touch.release, this, "_endSizing")
			];
			
			event.stop(e);
		},
		
		_updateSizing: function(/*Event*/ e){
			if(this.activeResize){
				this._changeSizing(e);
			}else{
				var tmp = this._getNewCoords(e, 'border', this._resizeHelper.startPosition);
				if(tmp === false){ return; }
				this._resizeHelper.resize(tmp);
			}
			e.preventDefault();
		},
	
		_getNewCoords: function(/* Event */ e, /* String */ box, /* Object */startPosition){
			try{
				if(!e.clientX  || !e.clientY){ return false; }
			}catch(e){
				return false;
			}
			this._activeResizeLastEvent = e;
	
			var dx = (this.isLeftToRight()?1:-1) * (this.startPoint.x - e.clientX),
				dy = this.startPoint.y - e.clientY,
				newW = this.startSize.w - (this._resizeX ? dx : 0),
				newH = this.startSize.h - (this._resizeY ? dy : 0),
				r = this._checkConstraints(newW, newH)
			;
			
			startPosition = (startPosition || this.startPosition);
			if(startPosition && this._resizeX){
				r.l = startPosition.l + dx;
				if(r.w != newW){
					r.l += (newW - r.w);
				}
				r.t = startPosition.t;
			}
	
			switch(box){
				case 'margin':
					r.w += this.startSize.mw;
					r.h += this.startSize.mh;
				case "border":
					r.w += this.startSize.pbw;
					r.h += this.startSize.pbh;
					break;
			}
	
			return r; // Object
		},
		
		_checkConstraints: function(newW, newH){
			if(this.minSize){
				var tm = this.minSize;
				if(newW < tm.w){
					newW = tm.w;
				}
				if(newH < tm.h){
					newH = tm.h;
				}
			}
			
			if(this.constrainMax && this.maxSize){
				var ms = this.maxSize;
				if(newW > ms.w){
					newW = ms.w;
				}
				if(newH > ms.h){
					newH = ms.h;
				}
			}
			
			if(this.fixedAspect){
				var w = this.startSize.w, h = this.startSize.h,
					delta = w * newH - h * newW;
				if(delta<0){
					newW = newH * w / h;
				}else if(delta>0){
					newH = newW * h / w;
				}
			}
			
			return { w: newW, h: newH }; // Object
		},
			
		_changeSizing: function(/*Event*/ e){
			var isWidget = this.targetWidget && lang.isFunction(this.targetWidget.resize),
				tmp = this._getNewCoords(e, isWidget && 'margin');
			if(tmp === false){ return; }
	
			if(isWidget){
				this.targetWidget.resize(tmp);
			}else{
				if(this.animateSizing){
					var anim = coreFx[this.animateMethod]([
						baseFx.animateProperty({
							node: this.targetDomNode,
							properties: {
								width: { start: this.startSize.w, end: tmp.w }
							},
							duration: this.animateDuration
						}),
						baseFx.animateProperty({
							node: this.targetDomNode,
							properties: {
								height: { start: this.startSize.h, end: tmp.h }
							},
							duration: this.animateDuration
						})
					]);
					anim.play();
				}else{
					domStyle.set(this.targetDomNode,{
						width: tmp.w + "px",
						height: tmp.h + "px"
					});
				}
			}
			this.targetSize = tmp;
			if(this.intermediateChanges){
				this.onResize(e);
			}
		},
	
		_endSizing: function(/*Event*/ e){
			array.forEach(this._pconnects, connect.disconnect);
			var pub = lang.partial(connect.publish, this.endTopic, [ this ]);
			if(!this.activeResize){
				this._resizeHelper.hide();
				this._changeSizing(e);
				setTimeout(pub, this.animateDuration + 15);
			}else{
				pub();
			}
			this._isSizing = false;
			this.onResize(e);
		},
		
		_getTargetSizeAttr: function(){
			return this.targetSize;
		},
		
		_setTargetSizeAttr: function(size){
			this.targetSize = size;
		},
		
		onResize: function(e){
		    //adjust portletItemContent
			var portletItemWidget = this.getParent();
			if(portletItemWidget){
			    if(portletItemWidget.itemContentScroll){
			        portletItemWidget.resizeContent(this.targetSize);
			    }
			}
			
			//adjust gridContainer
			var gridContainer = portletItemWidget.gridContainer;
			if(gridContainer){
				if(gridContainer.layoutMode == "relative"){
					gridContainer.columnResizedWidth = 0;
					gridContainer.columnPreservedWidth = 0;
					var gridGeom = domGeom.position(gridContainer.domNode);
					if(portletItemWidget){
						for(i = 0; i < gridContainer._grid.length; i++){
							var column = gridContainer._grid[i];
							if(portletItemWidget.domNode.parentNode == column.node){
								column.columnWidthPercentage = (this.targetSize.w+20)*100/gridGeom.w;
								column.columnResized = true;
								gridContainer.columnResizedWidth = column.columnWidthPercentage;
							}else{
								var columnGeom = domGeom.position(column.node);
								column.columnWidthPercentage = columnGeom.w*100/gridGeom.w;
								column.columnResized = false;
								gridContainer.columnPreservedWidth += column.columnWidthPercentage;
							}
						}
						for(i = 0; i < gridContainer._grid.length; i++){
							var column = gridContainer._grid[i];
							if(column.columnResized){
								domStyle.set(column.node, {
									width: column.columnWidthPercentage + "%"
								});
							}else{
								domStyle.set(column.node, {
									width: (100-gridContainer.columnResizedWidth)*column.columnWidthPercentage/gridContainer.columnPreservedWidth + "%"
								});
							}
							array.forEach(column.node.childNodes, function(itemNode){
								domStyle.set(itemNode, {
									width: "auto"
								});
							}, this);
						}
						
						gridContainer.resize();
					}
				}else if(gridContainer.layoutMode == "absolute"){
					//TODO
				}else if(gridContainer.layoutMode == "floating"){
					//TODO
				}else{
					//TODO
				}
			}
			
		}
	});
	
	
	var _PortletSettings = declare("idx/layout/_PortletSettings", [ContentPane], {
		portletIconClass: "dojoxPortletSettingsIcon fpPortletSettingsIcon",
		portletIconHoverClass: "dojoxPortletSettingsIconHover fpPortletSettingsIconHover",
	
		postCreate: function(){
			this.inherited(arguments);
			
			this._displayed = false;
			
			domStyle.set(this.domNode, "display", "none");
			domClass.add(this.domNode, "dojoxPortletSettingsContainer fpPortletSettingsContainer");
	
			domClass.remove(this.domNode, "dijitContentPane");
		},
	
		_setPortletAttr: function(portlet){
			this.portlet = portlet;
		},
	
		toggle: function(){
			var n = this.domNode;
			if(domStyle.get(n, "display") == "none"){
				domStyle.set(n,{
					"display": "block",
					"height": "1px",
					"width": "auto"
				});
				dojoxFx.wipeIn({
					node: n,
					onEnd: lang.hitch(this, function(){
						this._displayed = true;
					})
				}).play();
			}else{
				dojoxFx.wipeOut({
					node: n,
					onEnd: lang.hitch(this, function(){
						domStyle.set(n,{"display": "none", "height": "", "width":""});
						this._displayed = false;
					})
				}).play();
			}
		}
	});
	
	var _PortletDialogSettings = declare("idx/layout/_PortletDialogSettings", [_PortletSettings], {
		dimensions: null,

		constructor: function(props, node){
			this.dimensions = props.dimensions || [300, 200];
		},

		toggle: function(){
			if(!this.dialog){
				this.dialog = new ModalDialog({
					type: "information",
					text: this.title || "Settings",
					info: this.get("content") || this.domNode.innerHTML.toString(),
					parentWidget: this
				});

				winUtil.body().appendChild(this.dialog.domNode);

				// Move this widget inside the dialog
				// this.dialog.containerNode.appendChild(this.domNode);

				domStyle.set(this.dialog.domNode,{
					"width" : this.dimensions[0] + "px",
					"height" : this.dimensions[1] + "px"
				});
				// domStyle.set(this.domNode, "display", "");
			}
			if(this.dialog.open){
				this.dialog.hide();
			}else{
				this.dialog.show(this.domNode);
			}
		}
	});
	
	var _Portlet = declare("idx/layout/_Portlet", [TitlePane, _Container], {
		
		resizeChildren: true,
		_parents: null,
		_size: null,
		dragRestriction : false,
		
		//contentpane for script
		adjustPaths: false,
		cleanContent: false,
		renderStyles: false,
		executeScripts: true,
		scriptHasHooks: false,
		ioMethod: xhrUtil.get,
		ioArgs: {},
		
		preventCache: true,
		preload: true,
		
		destroySettingsWidget: true,
		
		titleHeight: 16,
		//only false is allowed
		closable: false,
		
		defaultCntActLabel: "Default Label",
		defaultCntActType: "text",
		defaultCntActClass: "contentActionIconNode",
		
		defaultContentSettingsId: "__contentSettings__",
		
		onExecError: function(/*Event*/ e){
		},
	
		_setContent: function(cont){
			this.destroySettingsWidget = false;
			var setter = this._contentSetter;
			if(! (setter && setter instanceof dojoxHtmlUtil._ContentSetter)) {
				setter = this._contentSetter = new dojoxHtmlUtil._ContentSetter({
					node: this.containerNode,
					_onError: lang.hitch(this, this._onError),
					onContentError: lang.hitch(this, function(e){
						var errMess = this.onContentError(e);
						try{
							this.containerNode.innerHTML = errMess;
						}catch(e){
							console.error('Fatal '+this.id+' could not change content due to '+e.message, e);
						}
					})
				});
			};
	
			this._contentSetterParams = {
				adjustPaths: Boolean(this.adjustPaths && (this.href||this.referencePath)),
				referencePath: this.href || this.referencePath,
				renderStyles: this.renderStyles,
				executeScripts: this.executeScripts,
				scriptHasHooks: this.scriptHasHooks,
				scriptHookReplacement: "dijit.byId('"+this.id+"')"
			};
	
			this.inherited("_setContent", arguments);
		},

		buildRendering: function(){
			this.inherited(arguments);
			domStyle.set(this.domNode, "visibility", "hidden");
		},

		postCreate: function(){
			this.inherited(arguments);
			
			this.commonContentActionMap = {};
			this.settingsActionMap = {};
			
			this.contentActions = this.contentActions || [];
			
			// Add the portlet classes
			domClass.add(this.domNode, "dojoxPortlet portletItemContent fpPortlet");
			domClass.remove(this.arrowNode, "dijitArrowNode");
			domClass.add(this.arrowNode, "dojoxPortletIcon dojoxArrowDown fpPortletIcon fpArrowDown");
			domClass.add(this.titleBarNode, "dojoxPortletTitle fpPortletTitle css3Animations");
			if(_supportCSS3Animation){
				domClass.add(this.titleBarNode, "css3Animations");
			}
			domClass.add(this.titleNode, "dojoxPortletTextNode fpPortletTextNode");
			domClass.add(this.focusNode, "dojoxPortletTitleFocusNode dojoxPortletTitleFocus fpPortletTitleFocusNode fpPortletTitleFocus");
			domClass.add(this.hideNode, "dojoxPortletContentOuter fpPortletContentOuter");

			domClass.add(this.domNode, "dojoxPortlet-" + (!this.dragRestriction ? "movable" : "nonmovable"));
			domClass.add(this.domNode, "fpPortlet-" + (!this.dragRestriction ? "movable" : "nonmovable"));
			
			var _this = this;
			if(this.resizeChildren){

				this.subscribe("/dnd/drop", function(){_this._updateSize();});

				this.subscribe("/Portlet/sizechange", function(widget){_this.onSizeChange(widget);});
				this.connect(window, "onresize", function(){_this._updateSize();});

				var doSelectSubscribe = lang.hitch(this, function(id, lastId){
					var widget = registry.byId(id);
					if(widget.selectChild){
						var s = this.subscribe(id + "-selectChild", function(child){
							var n = _this.domNode.parentNode;

							while(n){
								if(n == child.domNode){

									// Only fire this once, as the widget is now visible
									// at least once, so child measurements should be accurate.
									_this.unsubscribe(s);
									_this._updateSize();
									break;
								}
								n = n.parentNode;
							}
						});

						var child = registry.byId(lastId);
						if(widget && child){
							_this._parents.push({parent: widget, child: child});
						}
					}
				});
				var lastId;
				this._parents = [];

				for(var p = this.domNode.parentNode; p != null; p = p.parentNode){
					var id = p.getAttribute ? p.getAttribute("widgetId") : null;
					if(id){
						doSelectSubscribe(id, lastId);
						lastId = id;
					}
				}
			}

            domStyle.set(this.titleBarNode, "height", this.titleHeight + "px");
            
			if(this.titleHidden){
				domStyle.set(this.titleNode, "display", "none");
				domStyle.set(this.hideNode, "background", "none");
			}
			
			this.connect(this.titleBarNode, touch.press, function(evt){
				if (domClass.contains(evt.target, "dojoxPortletIcon")) {
					event.stop(evt);
					return false;
				}
				return true;
			});
			//a11y
			this.connect(this.titleBarNode, "onkeydown", function(evt){
				if(evt.keyCode == keys.ENTER){
					if (domClass.contains(evt.target, "dojoxPortletIcon")) {
						event.stop(evt);
						return false;
					}
					return true;
				}
			});
			
			//title focus bar back for card actions
			this.focusNodeBack = domConstruct.create("div", {
				className: "dojoxPortletTitleFocusNode dojoxPortletTitleFocusBack fpPortletTitleFocusNode fpPortletTitleFocusBack"
			}, this.focusNode, "after");

			this.connect(this._wipeOut, "onEnd", function(){_this._publish();});
			this.connect(this._wipeIn, "onEnd", function(){_this._publish();});

			if(this.closable){
				this.addContentAction({id:"close",type:"icon",actionClass:"idxCloseIcon"});
			}
			
			//settings action
			if(this.settingsAction){
				this.addContentSettings(this.settingsAction);
			}
		},
		
		addContentSettings: function(settings){
			if(this._settingsWidget){
				console.log(this.contentType + " Content Settings Widget Already Exist!");
				return;
			}
			if(settings && settings.type){
				var type = settings.type || "normal";
				var settingsWidget = (type == "normal" ? _PortletSettings : _PortletDialogSettings);
				var settingsWidgetInstance = new settingsWidget({
					title: settings.title || "",
					content: settings.content || ""
				});
				this.addChild(settingsWidgetInstance);
				
				this.settingsActionMap = {
					item: settings,
					widget: settingsWidgetInstance
				}
			}
		},
		
		removeContentSettings: function(){
			if(this._settingsWidget){
				this._settingsWidget.destroyRecursive();
				this._settingsWidget = null;
				this.removeContentAction(this.defaultContentSettingsId);
				this.settingsActionMap = null;
			}
		},

		_placeSettingsWidgets: function(){
			array.forEach(this.getChildren(), lang.hitch(this, function(child){
				if(child.portletIconClass && child.toggle && !child.get("portlet")){
					this.addContentAction({id:this.defaultContentSettingsId,type:"icon",actionClass:child.portletIconClass}, 
						{handler:lang.hitch(child, "toggle")}
					);
					domConstruct.place(child.domNode, this.containerNode, "before");
					child.set("portlet", this);
					this._settingsWidget = child;
				}
			}));
		},
		
		adjustContentActionsPosition: function(){
			//adjust content actions' position
			if(this.parentPortletItem.leftCardActionPos){
				domClass.add(this.contentActionBar.domNode, "flipCardActionBarAdjust");
				domStyle.set(this.contentActionBar.domNode, "marginLeft", (this.parentPortletItem.leftCardActionPos-10)+"px");
			}
		},
		
		clearContentActions: function(){
			for(var cActId in this.commonContentActionMap){
				this.removeContentAction(cActId);
			}
		},
		
		addContentActions: function(contentActions, args){
			if(contentActions && contentActions.length){
				array.forEach(contentActions, function(contentAction){
					var contentActionArgs = args;
					if(args && args[contentAction.id]){
						contentActionArgs = args[contentAction.id];
					}
					this.addContentAction(contentAction, contentActionArgs);
				}, this);
				this.adjustContentActionsPosition();
			}
		},
		
		addContentAction: function(contentAction, args){
			if(this.contentActionBar && contentAction && contentAction.id){
				var cActId = contentAction.id;
				if(this.commonContentActionMap[cActId]){
					console.log(cActId + " Content Action already exist!");
					return;
				}
				
				if(contentAction.children && contentAction.children.length){
					var rootMenu = new _Menu({});
					array.forEach(contentAction.children, function(item){
						var menuItem = new _MenuItem({
							label:item.label
						});
						
						this.own(on(menuItem, touch.press, lang.hitch(this, function(it, evt){
							this.handleContentActions && this.handleContentActions(it, evt);
							evt && event.stop(evt);
						}, item)));
						//a11y
						this.own(on(menuItem, "keydown", lang.hitch(this, function(it, evt){
							if(evt.keyCode == keys.ENTER){
								this.handleContentActions && this.handleContentActions(it, evt);
								evt && event.stop(evt);
							}
						}, item)));
						
						rootMenu.addChild(menuItem);
					}, this);
					this[cActId + "ContentBtn"] = new _PopupMenuBarItem({
						label: contentAction.label,
						itemType: contentAction.type || this.defaultCntActType,
						itemClass: contentAction.actionClass,
						popup: rootMenu
					});
					
				}else{
					this[cActId + "ContentBtn"] = new _MenuBarItem({
						label: contentAction.label || this.defaultCntActLabel,
						itemType: contentAction.type || this.defaultCntActType,
						itemClass: contentAction.actionClass ||this.defaultCntActClass
					});
					if(args && args.handler && lang.isFunction(args.handler)){
						this.own(on(this[cActId + "ContentBtn"], touch.press, args.handler));
						//a11y
						this.own(on(this[cActId + "ContentBtn"], "keydown", lang.hitch(this, function(evt){
							if(evt.keyCode == keys.ENTER){
								args.handler.apply(this, arguments);
							}
						})));
					}else{
						this.own(on(this[cActId + "ContentBtn"], touch.press, lang.hitch(this, function(ca, evt){
							this.handleContentActions && this.handleContentActions(ca, evt);
							evt && event.stop(evt);
						}, contentAction)));
						//a11y
						this.own(on(this[cActId + "ContentBtn"], "keydown", lang.hitch(this, function(ca, evt){
							if(evt.keyCode == keys.ENTER){
								this.handleContentActions && this.handleContentActions(ca, evt);
								evt && event.stop(evt);
							}
						}, contentAction)));
					}
				}
				
				domClass.add(this[cActId + "ContentBtn"].domNode, "portletAction portletContentAction");
				this.contentActionBar.addChild(this[cActId + "ContentBtn"]);
				this.commonContentActionMap[cActId] = {
					item: contentAction,
					widget: this[cActId + "ContentBtn"]
				}
				
				if(args && args.forceAdjustPos){
					this.adjustContentActionsPosition();
				}
				
				return this[cActId + "ContentBtn"];
			}
		},
		
		updateContentAction: function(contentAction){
			if(contentAction.id && this.commonContentActionMap[contentAction.id]){
				var caItem = this.commonContentActionMap[contentAction.id];
				var caWidget = caItem.widget;
				var caNode = caWidget.domNode;
				//do update things
				if(contentAction.label){
					caWidget.set("label", contentAction.label);
				}
				if(contentAction.actionClass){
					caWidget.set("itemClass", contentAction.actionClass);
				}
				//TODO
			}
		},
		
		removeContentAction: function(cActId){
			if(cActId){
				//for map
				if(this.commonContentActionMap[cActId]){
					var cActionWidget = this.commonContentActionMap[cActId].widget;
					cActionWidget.destroy && cActionWidget.destroy();
					delete this.commonContentActionMap[cActId];
				}
				
				// no need adjust position for content right now
				// this.adjustContentActionsPosition();
			}
		},
		
		//content action default function for user to connect
		handleContentActions: function(item, e){
			if(item.pressHandler && lang.isFunction(item.pressHandler)){
				item.pressHandler.apply(this, arguments);
			}
			//TODO
			
			this.handle_content_action_stub(item, e);
		},
		
		handle_content_action_stub: function(item, e){
			//stub function to bind with
		},
		
		handleParentFlip: function(e){
			if(!this.parentPortletItem){
				this.parentPortletItem = this.getParent();
			}
			this.parentPortletItem.handle_flip(e);
			
			this.handle_parent_flip_action(this, {flipActType:this.contentType}, e);
		},
		
		handle_parent_flip_action: function(){
			//stub function
		},
		
		buildContentActionBar: function(){
			if(!this.parentPortletItem){
				this.parentPortletItem = this.getParent();
			}
			
			//always build action for content action 
			this.contentActionBar = new _MenuBar({
				//TODO
			}).placeAt(this.focusNodeBack);
			domClass.add(this.contentActionBar.domNode, "flipCardActionBar");
			
			if(this.contentActions.length){
				//for parent card configs
				if(this.parentPortletItem.flipToDetailAction && this.contentType == "main"){
					this.addContentAction({id:"flipToDetail",type:"icon",label:"Card Flip To Detail Content",actionClass:"flipToDetailIcon"},
						{handler:lang.hitch(this, this.handleParentFlip)});
				}
				if(this.parentPortletItem.flipToMainAction && this.contentType == "detail"){
					this.addContentAction({id:"flipToMain",type:"icon",label:"Card Flip To Main Content",actionClass:"flipToMainIcon"},
						{handler:lang.hitch(this, this.handleParentFlip)});
				}
		
				array.forEach(this.contentActions, function(contentAction){
					var cActId = contentAction.id;
					if(cActId){
						this.addContentAction(contentAction);
					}
				}, this);
				
				this.contentActionBar.startup();
				
				this.adjustContentActionsPosition();
			}
		},

		startup: function(){
			if(this._started){return;}
			
			//action bar and actions
			this.buildContentActionBar();
			
			var children = this.getChildren();
			this._placeSettingsWidgets();

			// Start up the children
			array.forEach(children, function(child){
				try{
					if(!child.started && !child._started){
						child.startup()
					}
				}
				catch(e){
					console.log(this.id + ":" + this.declaredClass, e);
				}
			});

			this.inherited(arguments);
			
			//this._updateSize();
			domStyle.set(this.domNode, "visibility", "visible");
			
			//portlet communication 
			this.parentContainer = this.getParent();
			if(this.parentContainer){
				this.topicHead = (this.parentContainer.rootContainer ? (this.parentContainer.rootContainer.get("flipCardModelId") + "_") : "rootId_")
					 + (this.parentContainer.gridContainer ? this.parentContainer.gridContainer.get("containerId") : "containerId");
				this.topicId = this.parentContainer.get("itemName") + "_" + this.contentType;
				this.topicHandler = topic.subscribe(this.topicHead + "_" + this.topicId, lang.hitch(this, this.topicHandlerStub));
			}
			
			this._started = true;
			
			//a11y
			domAttr.set(this.domNode, {
				tabIndex: -1
			});
		},
		
		switchCardSkin: function(skin){
			if(!this.parentPortletItem){
				this.parentPortletItem = this.getParent();
			}
			domClass.toggle(this.parentPortletItem.domNode, skin || "defaultSkin");
		},
		
		topicHandlerStub: function(data){
			//TODO 
			this.topicProcess(data.data);
		},
		topicProcess: function(data){
			//Stub function
		},
		
		topicPublisherStub: function(data, cardId, contentType){
			topic.publish(this.topicHead + "_" + cardId + "_" + (contentType||"main"), { data: data });
		},
		
		
		// addContentIconAction: function(action){
			// if(!this.parentPortletItem){
				// this.parentPortletItem = this.getParent();
			// }
			// var customizedActionNode = this._createIcon(action.normalClass || "fcCustomActionNode", 
					// action.hoverClass || "fcCustomActionNodeHover", lang.hitch(this, action.pressHandler), action.title);
			// domClass.add(customizedActionNode, "portletAction portletContentAction");
			// return customizedActionNode;
		// },
		_createIcon: function(clazz, hoverClazz, fn, desc){

			var icon = domConstruct.create("div",{
				"class": "dojoxPortletIcon fpPortletIcon " + clazz,
				"title": desc || "Action",
				"waiRole": "presentation"
			});
			domConstruct.place(icon, this.focusNodeBack);

			//this.connect(icon, "onclick", fn);
			this.own(on(icon, touch.press, lang.hitch(this, function(evt){
				fn.call();
				evt && event.stop(evt);
			})));
			//a11y
			this.own(on(icon, "keydown", lang.hitch(this, function(evt){
				if(evt.keyCode == keys.ENTER){
					fn.call();
					evt && event.stop(evt);
				}
			})));

			if(hoverClazz){
				this.connect(icon, touch.over, function(){
					domClass.add(icon, hoverClazz);
				});
				this.connect(icon, touch.out, function(){
					domClass.remove(icon, hoverClazz);
				});
			}
			return icon;
		},
		
		refreshCard: function(){
			if(this.content){
				this.set("content", this.get("content"));
			}else if(this.href){
				this.refresh();
			}
		},
		
		onClose: function(evt){
			domStyle.set(this.domNode, "display", "none");
		},
		
		getContentSize: function(){
			if(!this.parentPortletItem){
				this.parentPortletItem = this.getParent();
			}
			
			var parentSize = this.parentPortletItem.getContentSize();
			var contentSize = lang.clone(parentSize);
			contentSize.w = parentSize.w - 20;
			contentSize.h = parentSize.h - this.titleHeight - 20;
			
			return contentSize;
		},
		
		updateContentSize: function(){
			this._updateSize();
		},

		onSizeChange: function(widget){
			if(widget == this){
				return;
			}
			this._updateSize();
		},

		_updateSize: function(){
			if(!this.open || !this._started || !this.resizeChildren){
				return;
			}

			if(this._timer){
				clearTimeout(this._timer);
			}
			this._timer = setTimeout(lang.hitch(this, function(){
				var size ={
					w: domStyle.get(this.domNode, "width"),
					h: domStyle.get(this.domNode, "height")
				};

				for(var i = 0; i < this._parents.length; i++){
					var p = this._parents[i];
					var sel = p.parent.selectedChildWidget
					if(sel && sel != p.child){
						return;
					}
				}

				if(this._size){
					if(this._size.w == size.w && this._size.h == size.h){
						return;
					}
				}
				this._size = size;

				var fns = ["resize", "layout"];
				this._timer = null;
				var kids = this.getChildren();

				array.forEach(kids, function(child){
					for(var i = 0; i < fns.length; i++){
						if(lang.isFunction(child[fns[i]])){
							try{
								child[fns[i]]();
							} catch(e){
								console.log(e);
							}
							break;
						}
					}
				});
				this.onUpdateSize();
			}), 100);
		},

		onUpdateSize: function(){
		},

		_publish: function(){
			topic.publish("/Portlet/sizechange",[this]);
		},

		_onTitleClick: function(evt){
			if(evt.target == this.arrowNode){
				this.inherited(arguments);
			}
		},

		addChild: function(child){
			this._size = null;
			this.inherited(arguments);

			if(this._started){
				this._placeSettingsWidgets();
				this._updateSize();
			}
			if(this._started && !child.started && !child._started){
				child.startup();
			}
		},
		
		getMetadata: function(context){
			this.metadata = {
				titleHeight: this.titleHeight,
				title: this.title,
				preload: this.preload
			};
			
			var href = this.get("href");
			if(href){
				this.metadata.href = href;
			}else{
				this.metadata.content = this.get("content");
			}
			
			if(this.commonContentActionMap && !_FlipCardUtils.isObjectEmpty(this.commonContentActionMap)){
				this.metadata.contentActions = [];
				for(var cActId in this.commonContentActionMap){
					var contentActionMap = this.commonContentActionMap[cActId];
					this.metadata.contentActions.push(contentActionMap.item);
				}
			}
			
			if(this.settingsActionMap && this.settingsActionMap.item){
				this.metadata.settingsAction = this.settingsActionMap.item;
				var settingsHref = this.settingsActionMap.widget.get("href");
				if(settingsHref){
					this.metadata.settingsAction.href = settingsHref;
				}else{
					this.metadata.settingsAction.content = this.settingsActionMap.widget.get("content");
				}
			}
			
			if(context){
				return baseJson.toJson(this.metadata);
			}else{
				return this.metadata;
			}
		},

		destroyDescendants: function(/*Boolean*/ preserveDom){
			this.inherited(arguments);
			if(this._settingsWidget && this.destroySettingsWidget){
				this._settingsWidget.destroyRecursive(preserveDom);
			}
		},

		destroy: function(){
			if(this._timer){
				clearTimeout(this._timer);
			}
			this.inherited(arguments);
		},

		_setCss: function(){
			this.inherited(arguments);
			domStyle.set(this.arrowNode, "display", this.toggleable ? "":"none");
		}
	});
	
	
	
	// module:
	//		idx/layout/FlipCardItem
	// summary:
	//		A resizable, flippable, range-bound container with customizable actions

	/**
	* @name idx.layout.FlipCardItem
	* @class A resizable, flippable, range-bound container with customizable actions
	* @augments dijit.layout.ContentPane
	* @augments dijit._CssStateMixin
	*/ 
	
	
	return declare("idx/layout/FlipCardItem", [ContentPane, _CssStateMixin], {
		/**@lends idx.layout.FlipCardItem*/ 
		// summary:
		//		A validating, serializable, range-bound date text box with a drop down calendar
		//
		//		Example:
		// |	new FlipCardItem({maxable: true,flipable:true})
		//
		//		Example:
		// |	<div data-dojo-type='idx.layout.FlipCardItem' data-dojo-props='maxable:true,flipable:true'></div>
		
		
		// flipable: Boolean
		//		whether the card widget can be flipped 
		flipable: true,
		
		// flipToDetailAction: Boolean
		//		whether to have the flip action item in the card's action bar of main content
		flipToDetailAction: false,
		
		// flipToMainAction: Boolean
		//		whether to have the flip action item in the card's action bar of detail content
		flipToMainAction: true,
		
		
		// cardFlipAction: Boolean
		//		whether to have a flip button on both side of the card
		cardFlipAction: false,
		
		// itemResizable: Boolean
		//		whether the card widget can be resized 
		itemResizable: true,
		
		// settingsAct: Boolean
		//		whether the card widget can have actions
		settingsAct: true,
		
		// minable: Boolean
		//		whether the card widget can be minimized 
		minable: true,
		
		// maxable: Boolean
		//		whether the card widget can be maximized 
		maxable: false,
		
		// stackable: Boolean
		//		whether the card widget can be hided 
		stackable: false,
		
		// closable: Boolean
		//		whether the card widget can be closed / deleted 
		closable: false,
		
		// actionsInMainSide: Boolean
		//		whether the card actions located in main side 
		actionsInMainSide: false,
		
		// flipCardModel: String
        //      card model, sync with the flip card container, "view" will disable the settings 
		flipCardModel: "edit",
		
		// initItemStatus: String
        //      card initial status 
		initItemStatus: "normal", //"max", "min", "normal", "stacked"
		
		// itemContentScroll: Boolean
        //      whether to have the scrollbar for card content
		itemContentScroll: false,
		
		// initItemHeight: Integer / String
        //      Card Item initial height in px.
		initItemHeight: 280,
		
		// initItemWidth: Integer
        //      Card Item initial height in px.
        initItemWidth: "auto",
        
        itemName: "",
        
        actionLeftInitPos: 5,
        actionRightInitPos: 5,
        actionDefaultWidth: 25,
        
        
        animationDuration: 1000,
        css3AnimationDisabled: false,
        
        // tabIndex: -1,
        
		/** @ignore */
		postMixInProperties: function(){
			this.inherited(arguments);
			
			this._nlsResources = i18n.getLocalization("idx/layout", "FlipCardItem");
		},
		
		/** @ignore */
		postCreate: function(){
			this.inherited(arguments);
			
			this.commonActionMap = {};
			
			this.itemMode = "main", //"main", "detail"
			this.itemStatus = "normal", //"max", "min", "normal", "stacked"
			
			this.itemName = this.itemName || _FlipCardUtils.generateGUID();
			
			this.actionDisplayed = false;
			this.actionDisplayedInMain = false;
			
			this.animationDurationHeritage = this.animationDuration;
			
			//main and detail portlet content
            domClass.add(this.domNode, "portletItem");
            if(_supportCSS3Animation){
                domClass.add(this.domNode, "css3Animations");
            }
            
            domAttr.set(this.domNode, "itemName", this.itemName);
            
            //initial flip side status
            domClass.add(this.domNode, "portletItemMainContent");
		},
		
		/**
		 * show the actions.
		 * @param {Boolean} show
		 */
		displayActions: function(show, e){
			
			if(show === undefined){
				this.actionDisplayed = !this.actionDisplayed;
			}else{
				this.actionDisplayed = show;
			}
			if(this.itemMode == "main"){
				this.actionDisplayedInMain = this.actionDisplayed;
			}
			
			// domClass.toggle(this[this.itemMode+"Content"].titleBarNode, "settings", this.actionDisplayed);
			if(this.mainContent){
				domClass.toggle(this["mainContent"].titleBarNode, "settings", this.actionDisplayed);
			}
			if(this.detailContent){
				domClass.toggle(this["detailContent"].titleBarNode, "settings", this.actionDisplayed);
			}
			
			for(var actionId in this.commonActionMap){
				var aItem = this.commonActionMap[actionId];
				domClass.toggle(aItem.widget.domNode, "actionsDetail", this.actionDisplayed);
				
				if(domClass.contains(aItem.widget.domNode, "actionsMain")){
					domClass.toggle(aItem.widget.domNode, "mainActDetail", this.actionDisplayed);
				}
			}
			
			//transform animation extra effect
			domClass.add(this.domNode, "contentTitleAnimating");
			setTimeout(lang.hitch(this, function(){
				if(this && this.domNode){
					domClass.remove(this.domNode, "contentTitleAnimating");
				}
			}),this.animationDuration);
			
			e && event.stop(e);
		},
		
		startup: function(){
			if(this._started){return;}
			
			this.inherited(arguments);
			
			//set initial size of the card item
			domStyle.set(this.domNode, {
			    width: (typeof this.initItemWidth != 'number') ? this.initItemWidth : (this.initItemWidth + "px"),
			    height: (typeof this.initItemHeight != 'number') ? this.initItemHeight : (this.initItemHeight + "px")
			});
			
			//create maximum node
			if(this.settingsAct){
				if(this.actionsInMainSide){
					//TODO
				}else{
					this.addCardAction({id:"settings",name:"settings",title:"Settings Action"}, {fixed:true,extraClass:"actionsMain"});
					this.addCardAction({id:"settingsDetail",name:"settingsDetail",title:"Detail Settings Action"}, {fixed:true});
				}
			}
			
			this.closable && this.addCardAction({id: "close",name: "close",title: "close"}, {extraClass:(this.actionsInMainSide?"actionsMain":"")});
			
			if(this.gridContainer || (this.getParent() && this.getParent().declaredClass == "idx/layout/FlipCardGridContainer")){
				this.maxable && this.addCardAction({id:"max",name:"max",title:"Max"}, {extraClass:(this.actionsInMainSide?"actionsMain":"")});
				this.stackable && this.addCardAction({id:"stack",name:"stack",title:"Stack"}, {extraClass:(this.actionsInMainSide?"actionsMain":"")});
				
				//dnd handler
				this.dndNode = domConstruct.create("div", {
					className: "dndBarNode"
				}, this.domNode);
			}
			
			this.minable && this.addCardAction({id:"min",name:"min",title:"Minimize"}, {extraClass:(this.actionsInMainSide?"actionsMain":"")});
			
			if(this.flipable && this.cardFlipAction){
				this.addCardAction({id:"flipAction",name:"flipAction",title:"Card Flip Action"},{extraClass:"portletItemFlipNode"}, {extraClass:(this.actionsInMainSide?"actionsMain":"")});
			}
			
			this.adjustActionsPosition();
			
			
			var mainProps = lang.mixin({}, {
				contentType: "main",
				toggleable: false,
				closable: false
			}, this.main_props);
			var mainContent = new _Portlet(mainProps);
			domClass.add(mainContent.domNode, "mainContent");
			
			//create a default detail content anyway
			var detailProps = lang.mixin({}, {
				contentType: "detail",
				toggleable: false,
				closable: false
			}, this.detail_props);
			var detailContent = new _Portlet(detailProps);
			domClass.add(detailContent.domNode, "detailContent");
			
			if(_supportCSS3Animation){
				domClass.add(mainContent.domNode, "css3Animations");
				domClass.add(detailContent.domNode, "css3Animations");
			}else{
				domStyle.set(detailContent.domNode, "display", "none");
			}
			
			this.addChild(mainContent);
			this.mainContent = mainContent;
			this.addChild(detailContent);
			this.detailContent = detailContent;
			
			//content scrollbar
			if(this.itemContentScroll){
			    array.forEach(["mainContent","detailContent"], function(content, index){
			    	if(this[content]){
			    		domStyle.set(this[content].hideNode, {
	                        overflowY: "auto"
	                    });
			    	}
                }, this);
			}
			
			
			//resizer
			if(this.itemResizable){
				this.resizer = new _ResizeHandle({
					targetContainer: this.containerNode,
					activeResize: true,
					resizeAxis: "xy"
				});
				this.own(on(this.resizer, "resize", lang.hitch(this, function(evt){
					this.onResizeHandleEnd(evt, this.resizer.get("targetSize"));
				})));
				domClass.add(this.resizer.domNode, "contentResizer");
				if(_supportCSS3Animation){
					domClass.add(this.resizer.domNode, "css3Animations");
				}
				this.addChild(this.resizer);
			}
			
			
			//handle css3 animation flag
			this.toggleCSS3Animation(this.css3AnimationDisabled);
			
			// this.displayActions(false);
			
			//toggle init status
			setTimeout(lang.hitch(this, function(){
			    if(this.initItemStatus != "normal"){
                    if(this.initItemStatus == "min"){
                        this.toggle_min();
                    }else if(this.initItemStatus == "max"){
                        var containerGeom = this.getStableContainerSize();
                        var itemGeom = this.getStableCardItemSize();
                        this.toggle_max(null, {itemGeom: itemGeom, containerGeom: containerGeom});
                    }else if(this.initItemStatus == "stacked"){
                        this.toggle_stack();
                    }
                }
			}));
			
			this._started = true;
			
			Viewport.on("resize", lang.hitch(this, this.flipCardSizeAdapter));
			
            //a11y
            domAttr.set(this.domNode, {
				tabIndex: -1
			});
			// console.log(this.domNode.tabIndex);
		},
		
		flipCardSizeAdapter: function(){
			//TODO
		},
		
		getStableContainerSize: function(){
			if(this.gridContainer){
				var gridGeom = domGeom.position(this.gridContainer.gridContainerDiv);
				if(this.rootContainer){
					gridGeom = domGeom.position(this.rootContainer.containerNode.domNode);
				}
	            if(this.gridContainer.showContentHeader){
	            	gridGeom.h = parseInt(gridGeom.h * 0.88);
	            }
	            var containerGeom = {
                    w: gridGeom.w,
                    h: gridGeom.h
                }
	            return containerGeom;
			}else{
				return domGeom.position(this.domNode);
			}
		},
		
		getStableCardItemSize: function(){
			if(this.gridContainer){
				var containerGeom = this.getStableContainerSize();
				var itemGeom = {
                    w: ((containerGeom.w-15)/this.gridContainer.nbZones - 20),
                    h: this.initItemHeight
                }
                return itemGeom;
			}else{
				return domGeom.position(this.domNode);
			}
		},
		
		toggleCSS3Animation: function(forceDisable){
			if(forceDisable !== undefined){
				this.css3AnimationDisabled = forceDisable ? true : false;
			}else{
				this.css3AnimationDisabled = !this.css3AnimationDisabled;
			}
			
			if(this.css3AnimationDisabled){
				domClass.add(this.domNode, "css3AnimationsDisabled");
				this.animationDuration = 1;
			}else{
				domClass.remove(this.domNode, "css3AnimationsDisabled");
				this.animationDuration = this.animationDurationHeritage;
			}
		},
		
		
		_adjustExistingNode: function(side, hasFixed, count){
			var adjustProcessed = false;
			//adjust existing nodes
			if(hasFixed){
				//TODO
			}else{
				if(count>0){
					if(this.cardActionsAdjusted[side]){
						for(var actId in this.cardActionsAdjusted[side]){
							var adjustInfo = this.cardActionsAdjusted[side][actId];
							if(adjustInfo){
								if(side == "left"){
									domStyle.set(adjustInfo.node, {
										left: (adjustInfo.pos+this.actionDefaultWidth) + "px",
										right: "auto"
									});
								}else{
									domStyle.set(adjustInfo.node, {
										left: "auto",
										right: (adjustInfo.pos+this.actionDefaultWidth) + "px"
									});
								}
								adjustProcessed = true;
							}
						}
					}
				}else{
					//TODO non-fixed node
				}
			}
			return adjustProcessed;
		},
		adjustActionsPosition: function(){
			var leftCount = 0, rightCount = 0,
				leftPos = this.actionLeftInitPos, rightPos = this.actionRightInitPos,
				hasLeftFixed = false, hasRightFixed = false;
			this.cardActionsAdjusted = {};
			
			for(var actionId in this.commonActionMap){
				var aItem = this.commonActionMap[actionId];
				var aWidget = aItem.widget;
				var aNode = aWidget.domNode;
				if(aWidget.left){//left side
					if(aWidget.fixed){
						if(!this.cardActionsAdjusted["left_fixed"]){
							this.cardActionsAdjusted["left_fixed"] = {};
						}
						
						var adjustProcessed = this._adjustExistingNode("left", hasLeftFixed, leftCount);
						if(adjustProcessed){
							leftPos += this.actionDefaultWidth;
						}
						
						//adjust current node
						domStyle.set(aNode, {
							left: this.actionLeftInitPos + "px",
							right: "auto"
						});
						hasLeftFixed = true;
						
						//record adjusted nodes
						this.cardActionsAdjusted["left_fixed"][actionId] = {
							pos:this.actionLeftInitPos,
							node:aNode
						};
					}else{
						if(!this.cardActionsAdjusted["left"]){
							this.cardActionsAdjusted["left"] = {};
						}
						if(hasLeftFixed){
							leftPos = this.actionLeftInitPos + this.actionDefaultWidth;
						}else{
							leftPos = this.actionLeftInitPos;
						}
						leftPos += this.actionDefaultWidth*(leftCount++);
						domStyle.set(aNode, {
							left: leftPos + "px",
							right: "auto"
						});
						
						//record adjusted nodes
						this.cardActionsAdjusted["left"][actionId] = {
							pos:leftPos,
							node:aNode
						};
					}
				}else{//right side
					if(aWidget.fixed){
						if(!this.cardActionsAdjusted["right_fixed"]){
							this.cardActionsAdjusted["right_fixed"] = {};
						}
						
						var adjustProcessed = this._adjustExistingNode("right", hasRightFixed, rightCount);
						if(adjustProcessed){
							rightPos += this.actionDefaultWidth;
						}
						
						//adjust current node
						domStyle.set(aNode, {
							left: "auto",
							right: this.actionRightInitPos + "px"
						});
						hasRightFixed = true;
						
						//record adjusted nodes
						this.cardActionsAdjusted["right_fixed"][actionId] = {
							pos:this.actionRightInitPos,
							node:aNode
						};
					}else{
						if(!this.cardActionsAdjusted["right"]){
							this.cardActionsAdjusted["right"] = {};
						}
						
						if(hasRightFixed){
							rightPos = this.actionRightInitPos + this.actionDefaultWidth;
						}else{
							rightPos = this.actionRightInitPos;
						}
						rightPos += this.actionDefaultWidth*(rightCount++);
						domStyle.set(aNode, {
							left: "auto",
							right: rightPos + "px"
						});
						
						//record adjusted nodes
						this.cardActionsAdjusted["right"][actionId] = {
							pos:rightPos,
							node:aNode
						};
					}
				}
			}
			if(hasLeftFixed || leftCount>0){
				this.leftCardActionPos = leftPos + this.actionDefaultWidth;
			}else{
				this.leftCardActionPos = this.actionLeftInitPos;
			}
			if(hasRightFixed || rightCount>0){
				this.rightCardActionPos = rightPos + this.actionDefaultWidth;
			}else{
				this.rightCardActionPos = this.actionRightInitPos;
			}
			
			if(this.mainContent){
				this.mainContent.adjustContentActionsPosition();
			}
			if(this.detailContent){
				this.detailContent.adjustContentActionsPosition();
			}
		},
		
		
		clearCardActions: function(){
			for(var actId in this.commonActionMap){
				if(actId == "settings" || actId == "settingsDetail"){
					//TODO for special action
				}else{
					this.removeCardAction(actId);
				}
			}
		},
		/*
		 * publish card action manipulate APIa
		 */
		addCardActions: function(actionItems, args){
			if(actionItems && actionItems.length){
				array.forEach(actionItems, function(actionItem){
					var actionItemArgs = args;
					if(args && args[actionItem.id]){
						actionItemArgs = args[actionItem.id];
					}
					this.addCardAction(actionItem, actionItemArgs);
				}, this);
				this.adjustActionsPosition()
			}
		},
		
		addCardAction: function(actionItem, args){
			if(actionItem && actionItem.id){
				var actId = actionItem.id;
				if(this.commonActionMap[actId]){
					console.log(actId + " ard Action Already Exist!")
					return;
				}
				
				this[actId + "Btn"] = new _Button({
					label: actionItem["title"],
					showLabel: false,
					title: actionItem["title"] || actionItem["name"] || this._nlsResources[actId + "ActionTitle"] || this._nlsResources["defaultActionTitle"],
					iconClass: "actionIcon " + actId + "Icon"
				}).placeAt(this.domNode);
				this[actId + "Node"] = this[actId + "Btn"].domNode;
				domClass.add(this[actId + "Node"], "portletItemNode_"+actId + " portletAction portletItemAction " + ((args&&args.extraClass)?args.extraClass:""));
				if(this.actionDisplayed){
					domClass.add(this[actId + "Node"], "actionsDetail");
				}
				
				if(this["handle_" + actId]){
					this.own(on(this[actId + "Btn"], touch.press, lang.hitch(this, this["handle_" + actId])));
					//a11y
					this.own(on(this[actId + "Btn"], "keydown", lang.hitch(this, function(actId, evt){
						if(evt.keyCode == keys.ENTER){
							this["handle_" + actId](evt);
						}
					}, actId)));
				}else{
					this.own(on(this[actId + "Btn"], touch.press, lang.hitch(this, this["handle_action"], actionItem)));
					//a11y
					this.own(on(this[actId + "Btn"], "keydown", lang.hitch(this, function(actionItem, evt){
						if(evt.keyCode == keys.ENTER){
							this["handle_action"](actionItem, evt);
						}
					}, actionItem)));
				}
				if(args && args.left){
					this[actId + "Btn"].left = true;
				}
				if(args && args.fixed){
					this[actId + "Btn"].fixed = true;
				}
				this.commonActionMap[actId] = {
					item: actionItem,
					widget: this[actId + "Btn"]
				}
				
				if(args && args.forceAdjustPos){
					this.adjustActionsPosition();
				}
				
				return this[actId + "Btn"];
			}
		},
		
		handle_action: function(actionItem, e){
			//TODO default action things
			if(actionItem.pressHandler && lang.isFunction(actionItem.pressHandler)){
				actionItem.pressHandler.apply(this, arguments);
			}
			
			this.handle_action_stub(actionItem, e);
		},
		
		handle_action_stub: function(actionItem, e){
			//stub function
		},
		
		updateCardAction: function(actionItem){
			if(actionItem.id && this.commonActionMap[actionItem.id]){
				var aItem = this.commonActionMap[actionItem.id];
				var aWidget = aItem.widget;
				var aNode = aWidget.domNode;
				//do update things
				if(actionItem.label){
					aWidget.set("label", actionItem.label);
				}
				if(actionItem.iconClass){
					aWidget.set("iconClass", "actionIcon " + actionItem.iconClass);
				}
				//TODO
				
			}
		},
		
		removeCardAction: function(actionId){
			if(actionId){
				//for map
				if(this.commonActionMap[actionId]){
					var actionWidget = this.commonActionMap[actionId].widget;
					actionWidget.destroy && actionWidget.destroy();
					delete this.commonActionMap[actionId];
				}
				
				this.adjustActionsPosition();
			}
		},
		
		
		_setMinableAttr: function(minable){
			this._handleNativeActionSet("min", minable);
		},
		_setMaxableAttr: function(maxable){
			this._handleNativeActionSet("max", maxable);
		},
		_setStackableAttr: function(stackable){
			this._handleNativeActionSet("stack", stackable);
		},
		_setClosableAttr: function(closable){
			this._handleNativeActionSet("close", closable);
		},
		_setCardFlipActionAttr: function(cardFlipAction){
			this._handleNativeActionSet("flipAction", cardFlipAction);
		},
				
		
		_handleNativeActionSet: function(actionName, actionOn){
			if(!this.commonActionMap || !actionName){return}
			if(actionOn){
				if(this.commonActionMap[actionName]){
					//TODO
				}else{
					this.addCardAction({id: actionName,name: actionName,title: actionName})
				}
			}else{
				if(this.commonActionMap[actionName]){
					this.removeCardAction(actionName);
				}else{
					//TODO
				}
			}
			
			this._set(actionName, actionOn);
		},
		
		handle_close: function(e){
			if(this.itemStatus == "normal"){
				//for parent grid
				var parentGrid = this.gridContainer || this.getParent();
				if(parentGrid){
					parentGrid.removeChild(this);
				}
				this.destroyRecursive && this.destroyRecursive();
			}else{
				console.log(this._nlsResources.statusIssueMessage);
			}
			
			this.handle_close_completed_stub(this);
		},
		
		handle_close_completed_stub: function(cardItem){
			//stub function
		},
		
		//stub function to connect to
		handle_flipAction: function(e){
			this.handle_flip(e);
		},
		
		onResizeHandleEnd: function(e){
			//Stub function 
		},
		
		resizeContent: function(containerSize){
		    array.forEach(["mainContent","detailContent"], function(content, index){
                if(this[content] && this[content].hideNode){
                    var adjustHeight = containerSize.h - this[content].titleHeight;
                    domStyle.set(this[content].hideNode, {
                        "height": (adjustHeight-8) + "px"
                    });
                }
            }, this);
		},
		
		resize: function(){
		    this.inherited(arguments);
		    
		    //window resize when in item max mode, should be aligned
		    if(arguments.length <= 0 && this.itemStatus == "max" && this.rootContainer){
		    	var containerGeom = this.getStableContainerSize();
                containerGeom.w = containerGeom.w;
                containerGeom.h = containerGeom.h;
                //do resize for max card item
                this.resize({w: containerGeom.w-10, h: containerGeom.h-10});
                if(this.itemContentScroll){
                    this.resizeContent({w: containerGeom.w-10, h: containerGeom.h-30});
                }
		    }
		},
		
		getContentSize: function(){
			var width = domStyle.get(this.domNode, "width"),
				height = domStyle.get(this.domNode, "height");
				
			if((typeof width == "number") && (typeof height == "number")){
				return {w: width, h: height};
			}else{
				return domGeom.position(this.domNode);
			}
		},
		
		/**
         * toggle the hidden status.
         */
        toggle_stack: function(e){
            this.handle_stack(e);
        },
		
		/**
		 * handle the hidden action.
		 */
		handle_stack: function(e){
			var parentGrid = this.gridContainer || this.getParent();
			if(!parentGrid || !parentGrid.domNode){
				return;
			}
			if(this.itemStatus == "normal"){
				if(this.stackable && parentGrid.dockContainer){
					parentGrid.stackCardItem(this);
				}
			}else if(this.itemStatus == "stacked"){
			    if(this.stackable && parentGrid.dockContainer){
                    parentGrid.unStackCardItem(this);
                }
            }else{
                console.log(this._nlsResources.statusIssueMessage);
			}
			e && event.stop(e);
			
			this.handle_stack_completed_stub(this);
		},
		
		handle_stack_completed_stub: function(cardItem){
			//stub function
		},
		
		/**
		 * hide the card widget.
		 */		
		stackItem: function(pItem){
			pItem = pItem || this;
			domClass.add(pItem.domNode, "portletItemDisappear");
			this.displayActions(false);
			
			pItem.previousItemStatus = pItem.itemStatus;
			this.itemStatus = "stacked";
		},
		
		/**
		 * show the card widget when in hidden.
		 */
		unStackItem: function(pItem){
			pItem = pItem || this;
			domClass.remove(pItem.domNode, "portletItemDisappear");
			
			this.itemStatus = pItem.previousItemStatus || "normal";
		},
		
		handle_settings: function(e){
			this.handle_sts(e);
		},
		handle_settingsDetail: function(e){
			this.handle_sts(e);
		},
		
		handle_sts: function(e){
			if(this.itemStatus == "min"){
				this.handle_min(e);
			}else{
				this.displayActions(undefined, e);
			}
		},
		
		/**
         * toggle maximum status of the card
         */
        toggle_max: function(e, props){
            this.handle_max(e, props);
        },
		
		handle_max: function(e, props){
			var parentGrid = this.gridContainer || this.getParent();
			if(parentGrid && parentGrid.domNode){
				//append CSS3 animation for max/min resize
				if(_supportCSS3Animation){
					clearTimeout(this.clearResizeCSS3Anim);
					domClass.add(parentGrid.domNode, "css3AnimationsForResize");
					this.clearResizeCSS3Anim = setTimeout(lang.hitch(this, function(){
						if(parentGrid && parentGrid.domNode){
							domClass.remove(parentGrid.domNode, "css3AnimationsForResize");
							// this.resize("current");
						}
					}), this.animationDuration);
				}
				
				if(this.itemStatus == "normal"){
				    if(domClass.contains(parentGrid.domNode, "gridContainerMaximum")){
                        console.log(this._nlsResources.gridMaximumStatus);
                        return;
                    }
                    //record stacked item
                    parentGrid.stackedItemKeys = [];
                    for(var itemId in parentGrid.stackedCardItems){
                        parentGrid.stackedItemKeys.push(itemId);
                    }
                    
                    if(props && props.itemGeom){
                        this.itemGeom = props.itemGeom;
                    }else{
                    	this.itemGeom = {
                    		w: domStyle.get(this.domNode, "width"),
                    		h: domStyle.get(this.domNode, "height")
                    	}
                        // this.itemGeom = domGeom.position(this.domNode);
                    }
					// console.log(this.itemGeom);
					parentGrid.disableDnd();
					domClass.add(parentGrid.domNode, "gridContainerMaximum");
					//hide dock container when max
					parentGrid.toggleDockContainer(false);
					query("> .fpGridContainerZone", parentGrid.gridNode).forEach(lang.hitch(this, function(tdNode, index){
						if(this.column!=index){
							domClass.add(tdNode, "gridColumnDisappear");
						}else{
							domClass.add(tdNode, "gridColumnMaximum");
						}
						query("> .portletItem", tdNode).forEach(lang.hitch(this, function(portletNode){
							var portletItemWidget = registry.byNode(portletNode);
							if(portletItemWidget != this){
								//add to minimum dock bar
								if(portletItemWidget.stackable && parentGrid.dockContainer){
									parentGrid.stackCardItem(portletItemWidget, true);
								}
							}
						}));
					}));
					var gridGeom;
					if(props && props.containerGeom){
					    gridGeom = props.containerGeom;
					    gridGeom.w = gridGeom.w;
					    gridGeom.h = gridGeom.h;
					}else{
					    gridGeom = parentGrid.getGridContentSize();
					}
					this.resize({w: gridGeom.w-10, h: gridGeom.h-10});
					// console.log(gridGeom);
					if(this.itemContentScroll){
                        this.resizeContent({w: gridGeom.w-10, h: gridGeom.h-30});
                    }
					
					// domStyle.set(this.domNode, {
						// width: "99%",
						// height: "93%"
					// });
					
					if(parentGrid.layoutMode == "absolute"){
						domStyle.set(this.domNode, {
							left: 0 + "px",
							top: 0 + "px"
						});
					}
					
					domClass.add(this.domNode, "portletItemMaximum");
					
					//title bar 
					// this.displayActions(false);
					
					parentGrid.currentMaxItemName = this.itemName;
					this.itemStatus = "max";
				}else if(this.itemStatus == "max"){
					query("> .fpGridContainerZone", parentGrid.gridNode).forEach(lang.hitch(this, function(tdNode, index){
						if(this.column!=index){
							domClass.remove(tdNode, "gridColumnDisappear");
						}else{
							domClass.remove(tdNode, "gridColumnMaximum");
						}
						query("> .portletItem", tdNode).forEach(lang.hitch(this, function(portletNode){
							var portletItemWidget = registry.byNode(portletNode);
							if(portletItemWidget != this){
								//clear minimum dock bar, remain stacked items before
								if(portletItemWidget.stackable && parentGrid.dockContainer){
									if(array.indexOf(parentGrid.stackedItemKeys, portletItemWidget.id)==-1){
										parentGrid.unStackCardItem(portletItemWidget, true);
									}
								}
							}
						}));
					}));
					
					domClass.remove(parentGrid.domNode, "gridContainerMaximum");
					//show dock container when max to normal
					if(parentGrid.stackedItemKeys && parentGrid.stackedItemKeys.length){
						parentGrid.toggleDockContainer(true);
					}
					
					domClass.remove(this.domNode, "portletItemMaximum");
					// domGeom.setMarginBox(this.domNode, this.itemGeom);
					domStyle.set(this.domNode, {
						width: (typeof this.itemGeom.w != 'number') ? this.itemGeom.w : (this.itemGeom.w + "px"),
						height: (typeof this.itemGeom.h != 'number') ? this.itemGeom.h : (this.itemGeom.h + "px")
					});
					
					//notice not to call resize, will cause wrong normal size
					// this.resize();
					
					if(this.itemContentScroll){
                        this.resizeContent({w: this.itemGeom.w, h: this.itemGeom.h});
                    }
					
					if(parentGrid.layoutMode == "absolute"){
						domStyle.set(this.domNode, {
							left: (typeof this.itemGeom.x != 'number') ? this.itemGeom.x : (this.itemGeom.x + "px"),
							top: (typeof this.itemGeom.y != 'number') ? this.itemGeom.y : (this.itemGeom.y + "px")
						});
					}
					
					parentGrid.enableDnd();
					
					parentGrid.currentMaxItemName = "";
					this.itemStatus = "normal";
				}else{
					console.log(this._nlsResources.statusIssueMessage);
				}
			}
			e && event.stop(e);
			
			setTimeout(lang.hitch(this, function(){
				this.handle_max_completed_stub(this);
			}),this.animationDuration);
		},
		
		handle_max_completed_stub: function(cardItem){
			//stub function
		},
		
		/**
         * toggle minimum status of the card
         */
        toggle_min: function(e){
            this.handle_min(e);
        },
		
		handle_min: function(e){
			var parentGrid = this.gridContainer || this.getParent();
			
			if(_supportCSS3Animation){
				clearTimeout(this.clearResizeCSS3Anim);
				domClass.add(this.domNode, "css3AnimationsForResize");
				this.clearResizeCSS3Anim = setTimeout(lang.hitch(this, function(){
					if(this && this.domNode){
						domClass.remove(this.domNode, "css3AnimationsForResize");
					}
					// this.resize("current");
				}), this.animationDuration);
			}
			
			if(parentGrid){
				parentGrid.disableDnd();
			}
			
			if(this.itemStatus == "normal"){
				domClass.add(this.domNode, "portletItemMinimum");
				this.displayActions(false);
				this.itemStatus = "min";
			}else if(this.itemStatus == "min"){
				domClass.remove(this.domNode, "portletItemMinimum");
				this.itemStatus = "normal";
			}else{
                console.log(this._nlsResources.statusIssueMessage);
            }
			
			if(parentGrid){
				parentGrid.enableDnd();
			}
			
			e && event.stop(e);
			
			setTimeout(lang.hitch(this, function(){
				this.handle_min_completed_stub(this);
			}),this.animationDuration);
		},
		
		handle_min_completed_stub: function(cardItem){
			//stub function
		},
		
		
		toggle_to_normal: function(e){
			// this.toggleCSS3Animation(true);
			switch(this.itemStatus){
				case "max":
					this.toggle_max(e);
					break;
				case "min":
					this.toggle_min(e);
					break;
				case "stacked":
					this.toggle_stack(e);
					break;
				case "normal":
					//TODO
					break;
			}
		},
		
		refreshCardContent: function(cardContentWidget){
		    if(cardContentWidget && !cardContentWidget.isLoaded){
		        cardContentWidget.refreshCard();
		    }
		},
		
		/**
         * flip the card widget.
         */
        processFlip: function(e){
            //Stub for manually handle flip
            this.handle_flip(e);
        },
		
		handle_flip: function(e){
			if(!this.flipable){return;}
			if(this.animating){
				//|| (e && e.target && !dom.isDescendant(e.target, this[this.itemMode+"Content"].titleBarNode))){
				return;
			}
			this.animating = true;
			if(_supportCSS3Animation){ //css3 supported
				clearTimeout(this.clearFlipCSS3Anim);
				domClass.add(this.domNode, "css3AnimationsFlipping");
				this.clearFlipCSS3Anim = setTimeout(lang.hitch(this, function(){
					if(this && this.domNode){
						domClass.remove(this.domNode, "css3AnimationsFlipping");
					}
				}), this.animationDuration);
				if(this.itemMode == "main"){
					domClass.add(this.domNode, "portletItemFlip");
					this.resizer && domClass.add(this.resizer.domNode, "contentResizerFlip");
					
					if(this.detailContent){
						this.refreshCardContent(this.detailContent);
					}
					
					this.animating = false;
					this.itemMode = "detail";
					domClass.remove(this.domNode, "portletItemMainContent");
					domClass.add(this.domNode, "portletItemDetailContent");
					this.displayActions(false);
				}else if(this.itemMode == "detail"){
					domClass.remove(this.domNode, "portletItemFlip");
					this.resizer && domClass.remove(this.resizer.domNode, "contentResizerFlip");
					
					
					this.animating = false;
					this.itemMode = "main";
					domClass.remove(this.domNode, "portletItemDetailContent");
					domClass.add(this.domNode, "portletItemMainContent");
					this.displayActions(this.actionDisplayedInMain);
				}
			}else{
				if(this.mainContent){
					domStyle.set(this.mainContent.domNode, "display", "none");
				}
				if(this.detailContent){
					domStyle.set(this.detailContent.domNode, "display", "none");
				}
				
				if(this.itemMode == "main"){
					var anim = flip["flip"]({ 
						node: this.domNode,
						dir: "right",
						depth: .5,
						duration: this.animationDuration
					});
					connect.connect(anim, "onEnd", this, function(){ 
						if(this.mainContent){
							domStyle.set(this.mainContent.domNode, "display", "none");
						}
						if(this.detailContent){
							domStyle.set(this.detailContent.domNode, "display", "");
							this.refreshCardContent(this.detailContent);
						}
						
						this.itemMode = "detail";
						domClass.remove(this.domNode, "portletItemMainContent");
						domClass.add(this.domNode, "portletItemDetailContent");
						this.animating = false;
						this.displayActions(false);
					});
					anim.play();
				}else if(this.itemMode == "detail"){
					var anim = flip["flip"]({ 
						node: this.domNode,
						dir: "left",
						depth: .5,
						duration: this.animationDuration
					});
					connect.connect(anim, "onEnd", this, function(){ 
						if(this.mainContent){
							domStyle.set(this.mainContent.domNode, "display", "");
						}
						if(this.detailContent){
							domStyle.set(this.detailContent.domNode, "display", "none");
						}
						
						this.itemMode = "main";
						domClass.remove(this.domNode, "portletItemDetailContent");
						domClass.add(this.domNode, "portletItemMainContent");
						this.animating = false;
						this.displayActions(this.actionDisplayedInMain);
					});
					anim.play();
				}
			}
			e && event.stop(e);
			
			setTimeout(lang.hitch(this, function(){
				this.handle_flip_completed_stub(this);
			}),this.animationDuration);
		},
		
		handle_flip_completed_stub: function(cardItem){
			//stub function
		},
		
		getMetadata: function(context){
			this.metadata = {
				name: this.itemName,
				props: {
					flipable: this.flipable,
					flipToDetailAction: this.flipToDetailAction,
					flipToMainAction: this.flipToMainAction,
					cardFlipAction: this.cardFlipAction,
					itemResizable: this.itemResizable,
					settingsAct: this.settingsAct,
					minable: this.minable,
					maxable: this.maxable,
					stackable: this.stackable,
					closable: this.closable,
					flipCardModel: this.flipCardModel,
					initItemStatus: this.initItemStatus,
					itemContentScroll: this.itemContentScroll,
					initItemHeight: this.initItemHeight,
			        initItemWidth: this.initItemWidth
				}
			};
			
			if(this.mainContent){
				this.metadata.props.main_props = this.mainContent.getMetadata();
			}
			
			if(this.detailContent){
				this.metadata.props.detail_props = this.detailContent.getMetadata();
			}
			
			if(context){
				return baseJson.toJson(this.metadata);
			}else{
				return this.metadata;
			}
		}
		
	});
	
});