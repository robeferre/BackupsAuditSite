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
	"dijit/Viewport",
	"dijit/form/Button",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/layout/_LayoutWidget",
	"dijit/layout/ContentPane",
	"dijit/layout/BorderContainer",
	"dijit/Dialog", 
	"dijit/layout/TabContainer", 
	"dijit/TitlePane", 
	
	"dojox/fx",
	"dojox/fx/flip",
	"dojox/html/_base",
	
	"idx/layout/_FlipCardUtils",
	"idx/layout/FlipCardItem",
	
	"dojo/text!./templates/GridContainer.html",
	
	"dojo/i18n!./nls/FlipCardGridContainer"
	
], function(kernel, array, declare, htmlUtil, connect, event, lang, winUtil, baseJson, has, 
		xhrUtil, NodeList, baseFx, coreFx, easingUtil,
		dom, domAttr, domClass, domStyle, domConstruct, domGeom, i18n, keys, topic, on, windowLib, 
		ready, cache, text, query, mouse, touch, cookie, json, hash,
		filterUtil, locale, ItemFileWriteStore, Memory, DataStore,
		registry, wai, manager, baseFocus, a11y, focus, _WidgetBase, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, 
		Viewport, Button, 
		_Contained, _Container, _LayoutWidget, ContentPane, BorderContainer, Dialog, TabContainer, TitlePane, 
		dojoxFx, flip, dojoxHtmlUtil, 
		_FlipCardUtils, FlipCardItem,
		gridTemplate
	){
	
	
	kernel.experimental("idx/layout/FlipCardGridContainer");
	
	
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
	
	
	
	var _AutoScroll = declare("idx/layout/_AutoScroll", [], {
		interval: 3,
		recursiveTimer: 10,
		marginMouse: 50,
	
		constructor: function(){
			this.resizeHandler = connect.connect(winUtil.global,"onresize", this, function(){
				this.getViewport();
			});
			ready(lang.hitch(this, "init"));
		},
	
		init: function(){
			this._html = (has("webkit"))? winUtil.body() : winUtil.body().parentNode;
			this.getViewport();
		},
	
		getViewport:function(){
			var d = winUtil.doc, dd = d.documentElement, w = window, b = winUtil.body();
			if(has("mozilla")){
				this._v = { 'w': dd.clientWidth, 'h': w.innerHeight };	// Object
			}
			else if(!has("opera") && w.innerWidth){
				this._v = { 'w': w.innerWidth, 'h': w.innerHeight };		// Object
			}
			else if(!has("opera") && dd && dd.clientWidth){
				this._v = { 'w': dd.clientWidth, 'h': dd.clientHeight };	// Object
			}
			else if(b.clientWidth){
				this._v = { 'w': b.clientWidth, 'h': b.clientHeight };	// Object
			}
		},
	
		setAutoScrollNode: function(/*Node*/node){
			this._node = node;
		},
	
		setAutoScrollMaxPage: function(){
			this._yMax = this._html.scrollHeight;
			this._xMax = this._html.scrollWidth;
		},
	
		checkAutoScroll: function(/*Event*/e){
			if(this._autoScrollActive){
				this.stopAutoScroll();
			}
			this._y = e.pageY;
			this._x = e.pageX;
			if(e.clientX < this.marginMouse){
				this._autoScrollActive = true;
				this._autoScrollLeft(e);
			}
			else if(e.clientX > this._v.w - this.marginMouse){
				this._autoScrollActive = true;
				this._autoScrollRight(e);
			}
			if(e.clientY < this.marginMouse){
				this._autoScrollActive = true;
				this._autoScrollUp(e);
				
			}
			else if(e.clientY > this._v.h - this.marginMouse){
				this._autoScrollActive = true;
				this._autoScrollDown();
			}
		},
	
		_autoScrollDown: function(){
			if(this._timer){
				clearTimeout(this._timer);
			}
			if(this._autoScrollActive && this._y + this.marginMouse < this._yMax){
				this._html.scrollTop += this.interval;
				this._node.style.top = (parseInt(this._node.style.top) + this.interval) + "px";
				this._y += this.interval;
				this._timer = setTimeout(lang.hitch(this, "_autoScrollDown"), this.recursiveTimer);
			}
		},
	
		_autoScrollUp: function(){
			if(this._timer){
				clearTimeout(this._timer);
			}
			if(this._autoScrollActive && this._y - this.marginMouse > 0){
				this._html.scrollTop -= this.interval;
				this._node.style.top = (parseInt(this._node.style.top) - this.interval) + "px";
				this._y -= this.interval;
				this._timer = setTimeout(lang.hitch(this, "_autoScrollUp"),this.recursiveTimer);
			}
		},
	
		_autoScrollRight: function(){
			if(this._timer){
				clearTimeout(this._timer);
			}
			if(this._autoScrollActive && this._x + this.marginMouse < this._xMax){
				this._html.scrollLeft += this.interval;
				this._node.style.left = (parseInt(this._node.style.left) + this.interval) + "px";
				this._x += this.interval;
				this._timer = setTimeout(lang.hitch(this, "_autoScrollRight"), this.recursiveTimer);
			}
		},
	
		_autoScrollLeft: function(/*Event*/e){
			if(this._timer){
				clearTimeout(this._timer);
			}
			if(this._autoScrollActive && this._x - this.marginMouse > 0){
				this._html.scrollLeft -= this.interval;
				this._node.style.left = (parseInt(this._node.style.left) - this.interval) + "px";
				this._x -= this.interval;
				this._timer = setTimeout(lang.hitch(this, "_autoScrollLeft"),this.recursiveTimer);
			}
		},
	
		stopAutoScroll: function(){
			if(this._timer){
				clearTimeout(this._timer);
			}
			this._autoScrollActive = false;
		},
	
		destroy: function(){
			connect.disconnect(this.resizeHandler);
		}
	});
	
	_AutoScroll.autoScroll = null;
	_AutoScroll.autoScroll = new _AutoScroll();
	
	
	
	var _Moveable = declare("idx/layout/_Moveable", [], {
		handle: null,
		skip: true,
		dragDistance: has("mobile") ? 0 : 3,
		
		constructor: function(/*Object*/params, /*DOMNode*/node){
			this.node = dom.byId(node);
			
			this.d = this.node.ownerDocument;
			
			if(!params){ params = {}; }
			this.handle = params.handle ? dom.byId(params.handle) : null;
			if(!this.handle){ this.handle = this.node; }
			this.skip = params.skip;
			this.events = [
				connect.connect(this.handle, touch.press, this, "onMouseDown")
			];
			if(_AutoScroll.autoScroll){
				this.autoScroll = _AutoScroll.autoScroll;
			}
			
		},
		
		isFormElement: function(/*DOMEvent*/ e){
			var t = e.target;
			if(t.nodeType == 3 /*TEXT_NODE*/){
				t = t.parentNode;
			}
			return " a button textarea input select option ".indexOf(" " + t.tagName.toLowerCase() + " ") >= 0;	// Boolean
		},
		
		onMouseDown: function(/*DOMEvent*/e){
			if(this._isDragging){ return;}
			if(has("mobile")){
				//TODO
			}else{
				var isLeftButton = (e.which || e.button) == 1;
				if(!isLeftButton){
					return;
				}
			}
			
			if(this.skip && this.isFormElement(e)){ return; }
			if(this.autoScroll){
				this.autoScroll.setAutoScrollNode(this.node);
				this.autoScroll.setAutoScrollMaxPage();
			}
			this.events.push(connect.connect(this.d, touch.release, this, "onMouseUp"));
			this.events.push(connect.connect(this.d, touch.move, this, "onFirstMove"));
			this._selectStart = connect.connect(winUtil.body(), "onselectstart", event.stop);
			this._firstX = e.touches ? e.touches[0].clientX : e.clientX;
			this._firstY = e.touches ? e.touches[0].clientY : e.clientY;
			event.stop(e);
		},
		
		onFirstMove: function(/*DOMEvent*/e){
			event.stop(e);
			var clientX = e.touches ? e.touches[0].clientX : e.clientX;
			var clientY = e.touches ? e.touches[0].clientY : e.clientY;
			var d = (this._firstX - clientX) * (this._firstX - clientX)
					+ (this._firstY - clientY) * (this._firstY - clientY);
			if(d > this.dragDistance * this.dragDistance){
				this._isDragging = true;
				connect.disconnect(this.events.pop());
				domStyle.set(this.node, "width", domGeom.getContentBox(this.node).w + "px");
				this.initOffsetDrag(e);
				this.events.push(connect.connect(this.d, touch.move, this, "onMove"));
			}
		},
		
		initOffsetDrag: function(/*DOMEvent*/e){
			this.offsetDrag = { 
				'l': (e.touches ? e.touches[0].pageX : e.pageX), 
				't': (e.touches ? e.touches[0].pageY : e.pageY) 
			};
			var s = this.node.style;
			var position = domGeom.position(this.node, true);
			this.offsetDrag.l = position.x - this.offsetDrag.l;
			this.offsetDrag.t = position.y - this.offsetDrag.t;
			var coords = {
				'x': position.x,
				'y': position.y
			};
			this.size = {
				'w': position.w,
				'h': position.h
			};
			// method to catch
			this.onDragStart(this.node, coords, this.size);
		},
		
		onMove: function(/*DOMEvent*/e){
			event.stop(e);
			// hack to avoid too many calls to onMove in IE8 causing sometimes slowness
			if(has("ie") == 8 && new Date() - this.date < 20){
				return;
			}
			if(this.autoScroll){
				this.autoScroll.checkAutoScroll(e);
			}
			var coords = {
				'x': this.offsetDrag.l + (e.touches ? e.touches[0].pageX : e.pageX),
				'y': this.offsetDrag.t + (e.touches ? e.touches[0].pageY : e.pageY)
			};
			var s = this.node.style;
			s.left = coords.x + "px";
			s.top = coords.y + "px";
			
			// method to catch
			this.onDrag(this.node, coords, this.size, {'x':e.pageX, 'y':e.pageY});
			if(has("ie") == 8){
				this.date = new Date();
			}
		},
		
		onMouseUp: function(/*DOMEvent*/e){
			if (this._isDragging){
				event.stop(e);
				this._isDragging = false;
				if(this.autoScroll){
					this.autoScroll.stopAutoScroll();
				}
				delete this.onMove;
				this.onDragEnd(this.node);
				this.node.focus();
			}
			connect.disconnect(this.events.pop());
			connect.disconnect(this.events.pop());
		},
		
		onDragStart: function(/*DOMNode*/node, /*Object*/coords, /*Object*/size){
			// tags:
			//		callback
		},
		
		onDragEnd: function(/*DOMNode*/node){
			// tags:
			//		callback
		},
		
		onDrag: function(/*DOMNode*/node, /*Object*/coords, /*Object*/size, /*Object*/mousePosition){
			// tags:
			//		callback
		},
	
		destroy: function(){
			array.forEach(this.events, connect.disconnect);
			this.events = this.node = null;
		}
	});
	
	
	var _AreaManager = declare("idx/layout/_AreaManager", [], {
		autoRefresh: true,
		areaClass: "dojoxDndArea",
		dragHandleClass: "dojoxDragHandle",
	
		constructor: function(){
			this._areaList = [];
			this.resizeHandler = connect.connect(winUtil.global,"onresize", this, function(){
				this._dropMode.updateAreas(this._areaList);
			});
			
			this._oldIndexArea = this._currentIndexArea = this._oldDropIndex = this._currentDropIndex = this._sourceIndexArea = this._sourceDropIndex = -1;
		},
	
		init: function(){
			this.registerByClass();
		},
	
		registerByNode: function(/*DOMNode*/area, /*Boolean*/notInitAreas){
			var index = this._getIndexArea(area);
			if(area && index == -1){
				var acceptType = area.getAttribute("accept");
				var accept = (acceptType) ? acceptType.split(/\s*,\s*/) : ["text"];
				var obj = {
					'node': area,
					'items': [],
					'coords': {},
					'margin': null,
					'accept': accept,
					'initItems': false
				};
				array.forEach(this._getChildren(area), function(item){
					this._setMarginArea(obj, item);
					obj.items.push(this._addMoveableItem(item));
				}, this);
				this._areaList = this._dropMode.addArea(this._areaList, obj);
				if(!notInitAreas){
					this._dropMode.updateAreas(this._areaList);
				}
				connect.publish("/dojox/mdnd/manager/register",[area]);
			}
		},
	
		registerByClass: function(){
			query('.'+this.areaClass).forEach(function(area){
				this.registerByNode(area, true);
			}, this);
			this._dropMode.updateAreas(this._areaList);
		},
	
		unregister: function(/*DOMNode*/area){
			var index = this._getIndexArea(area);
			if(index != -1){
				array.forEach(this._areaList[index].items, function(item){
					this._deleteMoveableItem(item);
				}, this);
				this._areaList.splice(index,1);
				// refresh target area
				this._dropMode.updateAreas(this._areaList);
				return true; // Boolean
			}
			return false; // Boolean
		},
	
		_addMoveableItem: function(/*DOMNode*/node){
			node.setAttribute("tabIndex", "0");
			var handle = this._searchDragHandle(node);
			var moveable = new _Moveable({ 'handle': handle, 'skip': true }, node);
			// add a css style :
			domClass.add(handle || node, "dragHandle");
			var type = node.getAttribute("dndType");
			var item = {
				'item': moveable,
				'type': type ? type.split(/\s*,\s*/) : ["text"],
				'handlers': [connect.connect(moveable, "onDragStart", this, "onDragStart")]
			}
			// connect to the uninitialize method of dijit._Widget to delete a moveable before a destruct
			if(registry && registry.byNode){
				var widget = registry.byNode(node);
				if(widget){
					item.type = widget.dndType ? widget.dndType.split(/\s*,\s*/) : ["text"];
					item.handlers.push(
						connect.connect(widget, "uninitialize", this, function(){
							this.removeDragItem(node.parentNode, moveable.node);
						})
					);
				}
			}
			return item; // Object
		},
	
		_deleteMoveableItem: function(/*Object*/ objItem){
			array.forEach(objItem.handlers, function(handler){
				connect.disconnect(handler);
			});
			var node = objItem.item.node,
				handle = this._searchDragHandle(node);
			domClass.remove(handle || node, "dragHandle");
			objItem.item.destroy();
		},
	
		_getIndexArea: function(/*DOMNode*/area){
			if(area){
				for(var i = 0; i < this._areaList.length; i++){
					if(this._areaList[i].node === area){
						return i;	// Integer
					}
				}
			}
			return -1;	// Integer
		},
	
		_searchDragHandle: function(/*DOMNode*/node){
			if(node){
				var cssArray = this.dragHandleClass.split(' '),
					length = cssArray.length,
					queryCss = "";
				array.forEach(cssArray, function(css, i){
					queryCss += "." + css;
					if(i != length - 1){
						queryCss += ", ";
					}
				});
				return query(queryCss, node)[0]; // DomNode
			}
		},
	
		addDragItem: function(/*DOMNode*/area, /*DOMNode*/node, /*Integer*/index, /*Boolean*/notCheckParent){
			var add = true;
			if(!notCheckParent){
				add = area && node && (node.parentNode === null || (node.parentNode && node.parentNode.nodeType !== 1));
			}
			if(add){
				var indexArea = this._getIndexArea(area);
				if(indexArea !== -1){
					var item = this._addMoveableItem(node),
						items = this._areaList[indexArea].items;
					if(0 <= index && index < items.length){
						var firstListChild = items.slice(0, index),
							lastListChild = items.slice(index, items.length);
						firstListChild[firstListChild.length] = item;
						this._areaList[indexArea].items = firstListChild.concat(lastListChild);
						area.insertBefore(node, items[index].item.node);
					}
					else{
						this._areaList[indexArea].items.push(item);
						area.appendChild(node);
					}
					this._setMarginArea(this._areaList[indexArea], node);
					this._areaList[indexArea].initItems = false;
					return true;	// Boolean
				}
			}
			return false;	// Boolean
		},
	
		removeDragItem: function(/*DOMNode*/area, /*DOMNode*/node){
			var index = this._getIndexArea(area);
			if(area && index !== -1){
				var items = this._areaList[index].items;
				for(var j = 0; j < items.length; j++){
					if(items[j].item.node === node){
						this._deleteMoveableItem(items[j]);
						// delete item of the array
						items.splice(j, 1);
						return area.removeChild(node); // Object
					}
				}
			}
			return null;
		},
	
		_getChildren: function(/*DOMNode*/area){
			var children = [];
			array.forEach(area.childNodes, function(child){
				// delete \n
				if(child.nodeType == 1){
					if(registry && registry.byNode){
						var widget = registry.byNode(child);
						if(widget){
							if(!widget.dragRestriction){
								children.push(child);
							}
						}
						else{
							children.push(child);
						}
					}
					else{
						children.push(child);
					}
				}
			});
			return children;	//Array
		},
	
		_setMarginArea: function(/*Object*/area,/*DOMNode*/node){
			if(area && area.margin === null && node){
				area.margin = domGeom.getMarginExtents(node);
			}
		},
	
		findCurrentIndexArea: function(/*Object*/coords, /*Object*/size){
			this._oldIndexArea = this._currentIndexArea;
			this._currentIndexArea = this._dropMode.getTargetArea(this._areaList, coords, this._currentIndexArea);
			if(this._currentIndexArea != this._oldIndexArea){
				if(this._oldIndexArea != -1){
					this.onDragExit(coords, size);
				}
				if(this._currentIndexArea != -1){
					this.onDragEnter(coords, size);
				}
			}
			return this._currentIndexArea;	//Integer
		},
	
		_isAccepted: function(/*Array*/ type, /*Array*/ accept){
			this._accept = false;
			for(var i = 0; i < accept.length; ++i){
				for(var j = 0; j < type.length;++j){
					if(type[j] == accept[i]){
						this._accept = true;
						break;
					}
				}
			}
		},
	
		onDragStart: function(/*DOMNode*/node, /*Object*/coords, /*Object*/size){
			if(this.autoRefresh){
				this._dropMode.updateAreas(this._areaList);
			}
	
			// Create the cover :
			var _html = (has("webkit")) ? winUtil.body() : winUtil.body().parentNode;
			if(!this._cover){
				this._cover = domConstruct.create('div', {
					'class': "dndCover"
				});
				this._cover2 = lang.clone(this._cover);
				domClass.add(this._cover2, "dndCover2");
			}
			var h = _html.scrollHeight+"px";
			this._cover.style.height = this._cover2.style.height = h;
			winUtil.body().appendChild(this._cover);
			winUtil.body().appendChild(this._cover2);
			
			this._dragStartHandler = connect.connect(node.ownerDocument, "ondragstart", event, "stop");
			// to know the source
			this._sourceIndexArea = this._lastValidIndexArea = this._currentIndexArea = this._getIndexArea(node.parentNode);
			// delete the dragItem into the source area
			var sourceArea = this._areaList[this._sourceIndexArea];
			var children = sourceArea.items;
			for(var i = 0; i < children.length; i++){
				if(children[i].item.node == node){
					this._dragItem = children[i];
					this._dragItem.handlers.push(connect.connect(this._dragItem.item, "onDrag", this, "onDrag"));
					this._dragItem.handlers.push(connect.connect(this._dragItem.item, "onDragEnd", this, "onDrop"));
					children.splice(i,1);
					this._currentDropIndex = this._sourceDropIndex = i;
					break;
				}
			}
			var nodeRef = null;
			if(this._sourceDropIndex !== sourceArea.items.length){
				nodeRef = sourceArea.items[this._sourceDropIndex].item.node;
			}
			// IE7 OPTIMIZATION
			if(has("ie")> 7){
				// connect these events on the cover
				this._eventsIE7 = [
					connect.connect(this._cover, touch.over, event, "stop"),
					connect.connect(this._cover, touch.out, event, "stop"),
					connect.connect(this._cover, touch.enter, event, "stop"),
					connect.connect(this._cover, touch.leave, event, "stop")
				];
			}
	
			var s = node.style;
			s.left = coords.x+"px";
			s.top = coords.y+"px";
			// attach the node to the cover
			if(s.position == "relative" || s.position == ""){
				s.position = "absolute"; // enforcing the absolute mode
			}
			this._cover.appendChild(node);
	
			this._dropIndicator.place(sourceArea.node, nodeRef, size);
			// add a style to place the _dragNode in foreground
			domClass.add(node, "dragNode");
			// A dragged node is always draggable in this source area.
			this._accept = true;
			connect.publish("/dojox/mdnd/drag/start",[node, sourceArea, this._sourceDropIndex]);
		},
	
		onDragEnter: function(/*Object*/coords, /*Object*/size){
			if(this._currentIndexArea === this._sourceIndexArea){
				this._accept = true;
			}
			else{
				this._isAccepted(this._dragItem.type, this._areaList[this._currentIndexArea].accept);
			}
		},
	
		onDragExit: function(/*Object*/coords, /*Object*/size){
			this._accept = false;
		},
	
		onDrag: function(/*DOMNode*/node, /*Object*/coords, /*Object*/size, /*Object*/mousePosition){
			var coordinates = this._dropMode.getDragPoint(coords, size, mousePosition);
			this.findCurrentIndexArea(coordinates, size);
			if(this._currentIndexArea !== -1 && this._accept){
				this.placeDropIndicator(coordinates, size);
			}
		},
	
		placeDropIndicator: function(/*Object*/coords, /*Object*/size){
			this._oldDropIndex = this._currentDropIndex;
			// calculate all children marker (see VerticalDropMode.initItems())
			var area = this._areaList[this._currentIndexArea];
			if(!area.initItems){
				this._dropMode.initItems(area);
			}
			//get the index where the drop has to be placed.
			this._currentDropIndex = this._dropMode.getDropIndex(area, coords);
			if(!(this._currentIndexArea === this._oldIndexArea && this._oldDropIndex === this._currentDropIndex)){
				this._placeDropIndicator(size);
			}
			return this._currentDropIndex;	//Integer
		},
	
		_placeDropIndicator: function(/*Object*/size){
			var oldArea = this._areaList[this._lastValidIndexArea];
			var currentArea = this._areaList[this._currentIndexArea];
			//refresh the previous area after moving out the drop indicator
			this._dropMode.refreshItems(oldArea, this._oldDropIndex, size, false);
			// place dropIndicator
			var node = null;
			if(this._currentDropIndex != -1){
				node = currentArea.items[this._currentDropIndex].item.node;
			}
			this._dropIndicator.place(currentArea.node, node);
			this._lastValidIndexArea = this._currentIndexArea;
			//refresh the current area after placing the drop indicator
			this._dropMode.refreshItems(currentArea, this._currentDropIndex, size, true);
		},
	
		onDropCancel: function(){
			if(!this._accept){
				var index = this._getIndexArea(this._dropIndicator.node.parentNode);
				if(index != -1){
					this._currentIndexArea = index;
				}
				else{
					// case if the dropIndicator is in the area which has been unregistered during the drag.
					// chose by default the first area.
					this._currentIndexArea = 0;
				}
			}
		},
	
		onDrop: function(/*DOMNode*/node){
			this.onDropCancel();
			var targetArea = this._areaList[this._currentIndexArea];
			domClass.remove(node, "dragNode");
			var style = node.style;
			style.position = "relative";
			style.left = "0";
			style.top = "0";
			if(domClass.contains(node, "layoutFloating")){
				//TODO
			}else{
				style.width = "auto";
			}
			
			if(targetArea.node == this._dropIndicator.node.parentNode){
				targetArea.node.insertBefore(node, this._dropIndicator.node);
			}
			else{
				// case if the dropIndicator is in the area which has been unregistered during the drag.
				targetArea.node.appendChild(node);
				this._currentDropIndex = targetArea.items.length;
			}
			// add child into the new target area.
			var indexChild = this._currentDropIndex;
			if(indexChild == -1){
				indexChild = targetArea.items.length;
			}
			var children = targetArea.items;
			var firstListArea = children.slice(0, indexChild);
			var lastListArea = children.slice(indexChild, children.length);
			firstListArea[firstListArea.length] = this._dragItem;
			targetArea.items = firstListArea.concat(lastListArea);
	
			this._setMarginArea(targetArea, node);
			array.forEach(this._areaList, function(obj){
				obj.initItems = false;
			});
			// disconnect onDrop handler
			connect.disconnect(this._dragItem.handlers.pop());
			connect.disconnect(this._dragItem.handlers.pop());
			this._resetAfterDrop();
			// remove the cover
			if(this._cover){
				winUtil.body().removeChild(this._cover);
				winUtil.body().removeChild(this._cover2);
			}
			connect.publish("/dojox/mdnd/drop",[node, targetArea, indexChild]);
		},
	
		_resetAfterDrop: function(){
			this._accept = false;
			this._dragItem = null;
			this._currentDropIndex = -1;
			this._currentIndexArea = -1;
			this._oldDropIndex = -1;
			this._sourceIndexArea = -1;
			this._sourceDropIndex = -1;
			this._dropIndicator.remove();
			if(this._dragStartHandler){
				connect.disconnect(this._dragStartHandler);
			}
			if(has("ie") > 7){
				array.forEach(this._eventsIE7, connect.disconnect);
			}
		},
	
		destroy: function(){
			while(this._areaList.length > 0){
				if(!this.unregister(this._areaList[0].node)){
					throw new Error("Error while destroying AreaManager");
				}
			}
			connect.disconnect(this.resizeHandler);
			this._dropIndicator.destroy();
			this._dropMode.destroy();
			if(_AutoScroll.autoScroll.autoScroll){
				_AutoScroll.autoScroll.destroy();
			}
			if(this.refreshListener){
				connect.unsubscribe(this.refreshListener);
			}
			// destroy the cover
			if(this._cover){
				domConstruct.destroy(this._cover);
				domConstruct.destroy(this._cover2);
				delete this._cover;
				delete this._cover2;
			}
		}
	});
	if(_Widget){
		lang.extend(_Widget, {
			dndType : "text"
		});
	}

	_AreaManager._areaManager = null;
	_AreaManager.areaManager = function(){
		if(!_AreaManager._areaManager){
			_AreaManager._areaManager = new _AreaManager();
		}
		return _AreaManager._areaManager;
	};
	
	
	var _DropIndicator = declare("idx/layout/_DropIndicator", [], {
		node : null,
		constructor: function(){
			var dropIndicator = document.createElement("div");
			var subDropIndicator = document.createElement("div");
			dropIndicator.appendChild(subDropIndicator);
			domClass.add(dropIndicator, "dropIndicator");
			this.node = dropIndicator;
		},
		
		place: function(/*Node*/area, /*Node*/nodeRef, /*Object*/size){
			if(size){
				this.node.style.height = size.h + "px";
			}
			try{
				if(nodeRef){
					area.insertBefore(this.node, nodeRef);
				}
				else{
					// empty target area or last node => appendChild
					area.appendChild(this.node);
				}
				return this.node;	// DOMNode
			}catch(e){
				return null;
			}
		},
		
		remove: function(){
			if(this.node){
				//FIX : IE6 problem
				this.node.style.height = "";
				if(this.node.parentNode){
					this.node.parentNode.removeChild(this.node);
				}
			}
		},
		 
		destroy: function(){
			if(this.node){
				if(this.node.parentNode){
					this.node.parentNode.removeChild(this.node);
				}
				domConstruct.destroy(this.node);
				delete this.node;
			}
		}
	});

	_AreaManager.areaManager()._dropIndicator = new _DropIndicator();
	
	
	
	var _OverDropMode = declare("idx/layout/_OverDropMode", [], {
		_oldXPoint: null,
		_oldYPoint: null,
		_oldBehaviour: "up",
	
		constructor: function(){
			this._dragHandler = [
				connect.connect(_AreaManager.areaManager(), "onDragEnter", function(coords, size){
					var m = _AreaManager.areaManager();
					if(m._oldIndexArea == -1){
						m._oldIndexArea = m._lastValidIndexArea;
					}
				})
			];
	
		},
	
		addArea: function(/*Array*/areas, /*Object*/object){
			var length = areas.length,
				position = domGeom.position(object.node, true);
			object.coords = {'x':position.x, 'y':position.y};
			if(length == 0){
				areas.push(object);
			}
			else{
				var x = object.coords.x;
				for(var i = 0; i < length; i++){
					if(x < areas[i].coords.x){
						for(var j = length-1; j >= i; j--)
							areas[j + 1] = areas[j];
						areas[i] = object;
						break;
					}
				}
				if(i == length){
					areas.push(object);
				}
			}
			return areas;	// Array
		},
	
		updateAreas: function(/*Array*/areaList){
			var length = areaList.length;
			for(var i = 0; i < length; i++){
				this._updateArea(areaList[i]);
			}
		},
	
		_updateArea : function(/*Object*/area){
			var position = domGeom.position(area.node, true);
			area.coords.x = position.x;
			area.coords.x2 = position.x + position.w;
			area.coords.y = position.y;
		},
	
		initItems: function(/*Object*/area){
			array.forEach(area.items, function(obj){
				//get the vertical middle of the item
				var node = obj.item.node;
				var position = domGeom.position(node, true);
				var y = position.y + position.h/2;
				obj.y = y;
			});
			area.initItems = true;
		},
	
		refreshItems: function(/*Object*/area, /*Integer*/indexItem, /*Object*/size, /*Boolean*/added){
			if(indexItem == -1){
				return;
			}
			else if(area && size && size.h){
				var height = size.h;
				if(area.margin){
					height += area.margin.t;
				}
				var length = area.items.length;
				for(var i = indexItem; i < length; i++){
					var item = area.items[i];
					if(added){
						item.y += height;
					}
					else{
						item.y -= height;
					}
				}
			}
		},
	
		getDragPoint: function(/*Object*/coords, /*Object*/size, /*Object*/mousePosition){
			return {			// Object
				'x': mousePosition.x,
				'y': mousePosition.y
				}
		},
	
	
		getTargetArea: function(/*Array*/areaList, /*Object*/ coords, /*integer*/currentIndexArea ){
			var index = 0;
			var x = coords.x;
			var y = coords.y;
			var end = areaList.length;
			var start = 0, direction = "right", compute = false;
			if(currentIndexArea == -1 || arguments.length < 3){
				compute = true;
			}
			else{
				if(this._checkInterval(areaList, currentIndexArea, x, y)){
					index = currentIndexArea;
				}
				else{
					if(this._oldXPoint < x){
						start = currentIndexArea + 1;
					}
					else{
						start = currentIndexArea - 1;
						end = 0;
						direction = "left";
					}
					compute = true;
				}
			}
			if(compute){
				if(direction === "right"){
					for(var i = start; i < end; i++){
						if(this._checkInterval(areaList, i, x, y)){
							index = i;
							break;
						}
					}
					if(i == end){
						index = -1;
					}
				}
				else{
					for(var i = start; i >= end; i--){
						if(this._checkInterval(areaList, i, x, y)){
							index = i;
							break;
						}
					}
					if(i == end-1){
						index = -1;
					}
				}
			}
			this._oldXPoint = x;
			return index; // Integer
		},
	
		_checkInterval: function(/*Array*/areaList, /*Integer*/index, /*Coord*/x, /*Coord*/y){
			var area = areaList[index];
			var node = area.node;
			var coords = area.coords;
			var startX = coords.x;
			var endX = coords.x2;
			var startY = coords.y;
			var endY = startY + node.offsetHeight;
			if(startX <= x && x <= endX && startY <= y && y <= endY){
				return true;
			}
			return false; // Boolean
		},
	
		getDropIndex: function(/*Object*/ targetArea, /*Object*/ coords){
			var length = targetArea.items.length;
			var coordinates = targetArea.coords;
			var y = coords.y;
			if(length > 0){
				for(var i = 0; i < length; i++){
					if(y < targetArea.items[i].y){
						return i;	// integer
					}
					else{
						if(i == length-1){
							return -1; // integer
						}
					}
				}
			}
			return -1;	//integer
		},
	
		destroy: function(){
			array.forEach(this._dragHandler, connect.disconnect);
		}
	});
	
	_AreaManager.areaManager()._dropMode = new _OverDropMode();
	
	
	var _ContainerContentPane = declare("idx/layout/_ContainerContentPane", ContentPane, {
		
	});
	
	//header title stuff
	var _ContentHeader = declare("idx/layout/_ContentHeader",[ContentPane],{
            
        adjustPaths: false,
		cleanContent: false,
		renderStyles: false,
		executeScripts: true,
		scriptHasHooks: false,
		
		_setFocusAttr: "domNode",
	
		ioMethod: xhrUtil.get,
	
		ioArgs: {},
		
		postCreate: function(){
		    this.inherited(arguments);
		    
		},
		
		startup: function(){
		    this.inherited(arguments);
		    
		    domClass.add(this.domNode, "headerContainer");
		    // this.own(on(this.domNode, "keydown", lang.hitch(this, "_onKey")));
		    
		    //a11y
		    domAttr.set(this.domNode, {
				tabIndex: -1
			});
		},
		
		_getFocusItems: function(){
            var elems = a11y._getTabNavigable(this.domNode);
            this._firstFocusItem = elems.lowest || elems.first || this.domNode;
            this._lastFocusItem = elems.last || elems.highest || this._firstFocusItem;
        },
        
        _onKey: function(/*Event*/ evt){
            if(evt.keyCode == keys.TAB){
                this._getFocusItems(this.domNode);
                var node = evt.target;
                if(this._firstFocusItem == this._lastFocusItem){
                    evt.stopPropagation();
                    evt.preventDefault();
                }else if(node == this._firstFocusItem && evt.shiftKey){
                    focus.focus(this._lastFocusItem);
                    evt.stopPropagation();
                    evt.preventDefault();
                }else if(node == this._lastFocusItem && !evt.shiftKey){
                    focus.focus(this._firstFocusItem);
                    evt.stopPropagation();
                    evt.preventDefault();
                }
            }
        },
        
        destroy: function(){
        	//TODO
        	
            this.inherited(arguments);
        },
	
		onExecError: function(/*Event*/ e){
		},
	
		_setContent: function(cont){
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
		}
        
    }); 
	
	
	
	// bottom dock container stuff
	var _DockNode = declare("idx/layout/_DockNode",[_WidgetBase, _TemplatedMixin],{
		title: "",
		paneRef: null,
		gridRef: null,
		dockNodeContainer: null,
	
		templateString:
			'<li class="dojoxDockNode fpDockNode">'+
				'<span data-dojo-attach-point="restoreNode" class="dojoxDockRestoreButton fpDockRestoreButton" data-dojo-attach-event="onclick: restore"></span>'+
				'<span class="dojoxDockTitleNode fpDockTitleNode" data-dojo-attach-point="titleNode">${title}</span>'+
			'</li>',
			
		postCreate: function(){
			this.inherited(arguments);
			
			this.own(on(this.domNode, touch.press, lang.hitch(this, "restore")));
			//a11y
			this.own(on(this.domNode, "keydown", lang.hitch(this, function(evt){
				if(evt.keyCode == keys.ENTER){
					this.restore(evt);
				}
			})));
		},
		
		startup: function(){
			this.inherited(arguments);
			
			//hover event
			if(this.gridRef.dockBehavior == "collapsed"){
				//a11y to keep dock visible when 
				this.own(on(this.domNode, "focus", lang.hitch(this, function(e){
					domClass.add(this.dockNodeContainer.domNode, "dockContainerHovered");
				})));
				this.own(on(this.domNode, "blur", lang.hitch(this, function(e){
					domClass.remove(this.dockNodeContainer.domNode, "dockContainerHovered");
				})));
			}else if(this.gridRef.dockBehavior == "fixed"){
				//TODO
			}else{
				//TODO
			}
			
			//a11y
		    domAttr.set(this.domNode, {
				tabIndex: 0
			});
		},
	
		restore: function(e){
			// this.paneRef.show();
			// this.paneRef.bringToTop();
			// this.destroy();
			if(!this.gridRef){return;}
			if(domClass.contains(this.gridRef.domNode, "gridContainerMaximum")){
				if(this.gridRef.maxItemSwitchMode == "stable"){
					alert(this.paneRef._nlsResources.stackCardNotify + ": '" + this.title + "'");
				}else if(this.gridRef.maxItemSwitchMode == "tab"){
					if(this.gridRef.currentMaxItemName && this.gridRef.childItemMaps[this.gridRef.currentMaxItemName]){
						var cGItem = this.gridRef.childItemMaps[this.gridRef.currentMaxItemName];
						
						var gridCSS3FlagReserved = this.gridRef.css3AnimationDisabled;
						this.gridRef.toggleCSS3Animation(true);
						
						var cGItemCSS3FlagReserved = cGItem.css3AnimationDisabled;
						cGItem.toggleCSS3Animation(true);
						cGItem.toggle_max(e);
						// this.gridRef.stackCardItem(cGItem, true);
						cGItem.toggleCSS3Animation(cGItemCSS3FlagReserved);
						
						if(this.paneRef){
							var refCSS3FlagReserved = this.paneRef.css3AnimationDisabled;
							this.paneRef.toggleCSS3Animation(true);
							// this.gridRef.unStackCardItem(this.paneRef, true);
							this.paneRef.toggle_to_normal(e);
							this.paneRef.toggle_max(e);
							this.paneRef.toggleCSS3Animation(refCSS3FlagReserved);
						}
						
						this.gridRef.toggleCSS3Animation(gridCSS3FlagReserved);
					}
				}else{
					//TODO
				}
			}else{
				this.gridRef.unStackCardItem(this.paneRef);
			}
		}
	});
	
	var _Dock = declare("idx/layout/_Dock",[_WidgetBase, _TemplatedMixin, _CssStateMixin],{
	
		templateString: '<div class="dojoxDock fpDock"><ul data-dojo-attach-point="containerNode" class="dojoxDockList fpDockList"></ul></div>',
		_docked: [],
		_inPositioning: false,
		autoPosition: false,
		
		gridRef:null,
		
		baseClass: "dockContainer",
		
		addNode: function(paneRef, gridRef){
			var div = domConstruct.create('li', null, this.containerNode),
				node = new _DockNode({
					title: paneRef.title,
					paneRef: paneRef,
					gridRef: gridRef,
					dockNodeContainer: this
				}, div)
			;
			node.startup();
			return node;
		},
		
		removeNode: function(dNode, paneRef, gridRef){
			if(dNode){
				if(dNode.destroy){
					dNode.destroy();
				}else{
					domConstruct.destroy(dNode);
				}
			}
		},
	
		startup: function(){
			// if (this.id == "dojoxGlobalFloatingDock" || this.isFixedDock) {
				// this.own(
					// on(window, "resize", lang.hitch(this, "_positionDock")),
					// on(window, "scroll", lang.hitch(this, "_positionDock"))
				// );
				// if(has("ie")){
					// this.own(
						// on(this.domNode, "resize", lang.hitch(this, "_positionDock"))
					// );
				// }
			// }
			this._positionDock(null);
			this.inherited(arguments);
			
			// this._trackMouseState(this.domNode, "dockContainer");
			
			//hover event
			if(this.gridRef.dockBehavior == "collapsed"){
				this.own(on(this.domNode, mouse.enter, lang.hitch(this, function(e){
					domClass.add(this.domNode, "dockContainerHovered");
				})));
				this.own(on(this.domNode, mouse.leave, lang.hitch(this, function(e){
					domClass.remove(this.domNode, "dockContainerHovered");
				})));
				//a11y
				this.own(on(this.domNode, "focus", lang.hitch(this, function(e){
					domClass.add(this.domNode, "dockContainerHovered");
				})));
				this.own(on(this.domNode, "blur", lang.hitch(this, function(e){
					domClass.remove(this.domNode, "dockContainerHovered");
				})));
			}else if(this.gridRef.dockBehavior == "fixed"){
				domClass.add(this.domNode, "dockContainerFixed");
			}else{
				//TODO
			}
			
			// domClass.add(this.domNode, "dojoxDndArea");
			// domAttr.set(this.domNode, "accept", "Portlet,ContentPane");
			// this.gridRef._dragManager.registerByNode(this.domNode);
			
			//a11y
		    domAttr.set(this.domNode, {
				tabIndex: 0
			});
		},
		
		_positionDock: function(/* Event? */e){
			if(!this._inPositioning){
				if(this.autoPosition == "south"){
					// setTimeout(lang.hitch(this, function() {
						// this._inPositiononing = true;
						// var viewport = windowLib.getBox();
						// var s = this.domNode.style;
						// s.left = viewport.l + "px";
						// s.width = (viewport.w-2) + "px";
						// s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight + "px";
						// this._inPositioning = false;
					// }), 125);
				}
			}
		}
	});
	

	
	var _GridContainerLite = declare("idx/layout/_GridContainerLite", [_LayoutWidget, _TemplatedMixin], {
		autoRefresh: true,
		templateString: gridTemplate,
		dragHandleClass: "dojoxDragHandle",
		nbZones: 1,
		doLayout: true,
		isAutoOrganized: true,
		acceptTypes: ["Portlet", "ContentPane"],
		colWidths: "",
		editDisabled: false,

		constructor: function(/*Object*/props, /*DOMNode*/node){
			this.acceptTypes = (props || {}).acceptTypes || ["Portlet", "ContentPane", "text"];
			this._disabled = true;
		},

		postCreate: function(){
			this.inherited(arguments);
			this._grid = [];

			this._createCells();

			this.subscribe("/dojox/mdnd/drop", "resizeChildAfterDrop");
			this.subscribe("/dojox/mdnd/drag/start", "resizeChildAfterDragStart");

			this._dragManager = _AreaManager.areaManager();
			this._dragManager.autoRefresh = this.autoRefresh;

			this._dragManager.dragHandleClass = this.dragHandleClass;

			if(this.doLayout){
				this._border = {
					h: has("ie") ? domGeom.getBorderExtents(this.gridContainerTable).h : 0,
					w: (has("ie") == 6) ? 1 : 0
				};
			}else{
				domStyle.set(this.domNode, "overflowY", "hidden");
				domStyle.set(this.gridContainerTable, "height", "auto");
			}
		},

		startup: function(){
			if(this._started){ return; }

			if(this.isAutoOrganized){
				this._organizeChildren();
			}
			else{
				//this._organizeChildrenManually();
			}
			array.forEach(this.getChildren(), function(child){
			  child.startup();
			});

			if(this._isShown()){
				this.enableDnd();
			}
			this.inherited(arguments);
		},

		resizeChildAfterDrop: function(/*Node*/node, /*Object*/targetArea, /*Integer*/indexChild){
			if(this._disabled){
				return false;
			}
			if(registry.getEnclosingWidget(targetArea.node) == this){
				var widget = registry.byNode(node);
				if(widget.resize && lang.isFunction(widget.resize)){
					widget.resize();
				}

				widget.set("column", parseInt(domAttr.get(node.parentNode, "columnIndex")));
				var position = 0, posNode = node;
				while(posNode.previousSibling){
					position++;
					posNode = posNode.previousSibling;
				}
				widget.set("position", position);
				posNode = node;
				while(posNode.nextSibling){
					posNode = posNode.nextSibling;
					var nextWidget = registry.byNode(posNode);
					nextWidget.set("position", position);
				}

				if(this.doLayout){
					var domNodeHeight = this._contentBox.h,
						divHeight = domGeom.getContentBox(this.gridContainerDiv).h;
					if(divHeight >= domNodeHeight){
						domStyle.set(this.gridContainerTable, "height",
								(domNodeHeight - this._border.h) + "px");
					}
				}
				return true;
			}
			return false;
		},

		resizeChildAfterDragStart: function(/*Node*/node, /*Object*/sourceArea, /*Integer*/indexChild){
			if(this._disabled){
				return false;
			}
			if(registry.getEnclosingWidget(sourceArea.node) == this){
				this._draggedNode = node;
				if(this.doLayout){
					domGeom.setMarginBox(this.gridContainerTable, {
						h: domGeom.getContentBox(this.gridContainerDiv).h - this._border.h
					});
				}
				return true;
			}
			return false;
		},

		getChildren: function(){

			var children = new NodeList();
			array.forEach(this._grid, function(dropZone){
				query("> [widgetId]", dropZone.node).map(registry.byNode).forEach(function(item){
				  children.push(item);
				});
			});
			return children;	// Array
		},

		_isShown: function(){
			if("open" in this){		// for TitlePane, etc.
				return this.open;		// Boolean
			}
			else{
				var node = this.domNode;
				return (node.style.display != 'none') && (node.style.visibility != 'hidden') && !domClass.contains(node, "dijitHidden"); // Boolean
			}
		},

		layout: function(){
			if(this.doLayout){
				// old layout logic
				// var contentBox = this._contentBox;
				// domGeom.setMarginBox(this.gridContainerTable, {
					// h: contentBox.h - this._border.h
				// });
				// domGeom.setContentSize(this.domNode, {
					// w: contentBox.w - this._border.w
				// });
				
				// new layout logic
				var divGeom = domGeom.getContentBox(this.gridContainerDiv);
				if(divGeom.h < this._contentBox.h){
					domGeom.setMarginBox(this.gridContainerTable, {
						h: divGeom.h - this._border.h
					});
					domGeom.setContentSize(this.domNode, {
						w: divGeom.w - this._border.w
					});
				}
			}
			array.forEach(this.getChildren(), function(widget){
				if(widget.resize && lang.isFunction(widget.resize)){
					widget.resize();
				}
			});
		},

		onShow: function(){
			if(this._disabled){
				this.enableDnd();
			}
		},

		onHide: function(){
			if(!this._disabled){
				this.disableDnd();
			}
		},

		_createCells: function(){
			if(this.nbZones === 0){ this.nbZones = 1; }
			var accept = this.acceptTypes.join(","),
				i = 0;

			var widths = this._computeColWidth();

			while(i < this.nbZones){
				this._grid.push({
					node: domConstruct.create("div", {
						'class': "gridContainerZone fpGridContainerZone",
						accept: accept,
						id: this.id + "_dz" + i,
						columnIndex: i,
						style: {
							'width': widths[i] + "%"
						}
					}, this.gridNode)
				});
				i++;
			}
		},

		_getZonesAttr: function(){
			return query(".gridContainerZone",  this.containerNode);
		},

		enableDnd: function(){
			if(this.editDisabled){return;}
			var m = this._dragManager;
			array.forEach(this._grid, function(dropZone){
				m.registerByNode(dropZone.node);
			});
			m._dropMode.updateAreas(m._areaList);
			this._disabled = false;
		},

		disableDnd: function(){
			if(this.editDisabled){return;}
			var m = this._dragManager;
			array.forEach(this._grid, function(dropZone){
				m.unregister(dropZone.node);
			});
			m._dropMode.updateAreas(m._areaList);
			this._disabled = true;
		},

		_organizeChildren: function(){
			// var children = _GridContainerLite.superclass.getChildren.call(this);
			var children = this.getChildren();
			var numZones = this.nbZones,
				numPerZone = Math.floor(children.length / numZones),
				mod = children.length % numZones,
				i = 0;
			for(var z = 0; z < numZones; z++){
				for(var r = 0; r < numPerZone; r++){
					this._insertChild(children[i], z);
					i++;
				}
				if(mod > 0){
					try{
						this._insertChild(children[i], z);
						i++;
					}
					catch(e){
						console.error("Unable to insert child in GridContainer", e);
					}
					mod--;
				}
				else if(numPerZone === 0){
					break;	// Optimization
				}
			}
		},

		_organizeChildrenManually: function (){
			// var children = _GridContainerLite.superclass.getChildren.call(this);
			var children = this.getChildren();
			var	length = children.length,
				child;
			for(var i = 0; i < length; i++){
				child = children[i];
				try{
					this._insertChild(child, child.column - 1);
				}
				catch(e){
					console.error("Unable to insert child in GridContainer", e);
				}
			}
		},
		
		_insertChild: function(/*Widget*/child, /*Integer*/column, /*Integer?*/p){
			var zone = this._grid[column].node,
				length = zone.childNodes.length,
				position = p;
			if(typeof position === "undefined" || position > length){
				position = length;
			}
			//position re-caculation
			var childPosArray = [];
			array.forEach(zone.childNodes, function(node){
				var cWidget = registry.byNode(node);
				var pos = cWidget.get("position");
				if(pos < -1 || pos == undefined){
					pos = position;
				}
				childPosArray.push(pos);
			});
			childPosArray.push(position);
			childPosArray.sort();
			p = array.indexOf(childPosArray, position);
			
			if(this._disabled){
				domConstruct.place(child.domNode, zone, p);
				domAttr.set(child.domNode, "tabIndex", "0");
			}
			else{
				if(!child.dragRestriction){
					this._dragManager.addDragItem(zone, child.domNode, p, true);
				}
				else{
					domConstruct.place(child.domNode, zone, p);
					domAttr.set(child.domNode, "tabIndex", "0");
				}
			}
			child.set("column", column);
			child.set("position", position);
			return child; // Widget
		},

		removeChild: function(/*Widget*/ widget){
			if(this._disabled){
				this.inherited(arguments);
			}
			else{
				if(widget.domNode){
					this._dragManager.removeDragItem(widget.domNode.parentNode, widget.domNode);
				}
			}
		},

		addChild: function(/*Object*/child, /*Integer?*/column, /*Integer?*/p){
			child.domNode.id = child.id;
			_GridContainerLite.superclass.addChild.call(this, child, 0);
			if(column < 0 || column === undefined){ column = 0; }
			if(p <= 0){ p = 0; }
			try{
				return this._insertChild(child, column, p);
			}
			catch(e){
				console.error("Unable to insert child in GridContainer", e);
			}
			return null; 	// Widget
		},

		_setColWidthsAttr: function(value){
			this.colWidths = lang.isString(value) ? value.split(",") : (lang.isArray(value) ? value : [value]);

			if(this._started){
				this._updateColumnsWidth();
			}
		},

		_updateColumnsWidth: function(/*Object*/ manager){
			var length = this._grid.length;

			var widths = this._computeColWidth();

			// Set the widths of each node
			for (var i = 0; i < length; i++){
				this._grid[i].node.style.width = widths[i] + "%";
			}
		},

		_computeColWidth: function(){
			var origWidths = this.colWidths || [];
			var widths = [];
			var colWidth;
			var widthSum = 0;
			var i;

			// Calculate the widths of each column.
			for(i = 0; i < this.nbZones; i++){
				if(widths.length < origWidths.length){
					widthSum += origWidths[i] * 1;
					widths.push(origWidths[i]);
				}else{
					if(!colWidth){
						colWidth = (100 - widthSum)/(this.nbZones - i);

						if(colWidth < 0){
							colWidth = 100 / this.nbZones;
						}
					}
					widths.push(colWidth);
					widthSum += colWidth * 1;
				}
			}

			if(widthSum > 100){
				var divisor = 100 / widthSum;
				for(i = 0; i < widths.length; i++){
					widths[i] *= divisor;
				}
			}
			return widths;
		},

		_selectFocus: function(/*Event*/event){
			if(this._disabled){ return; }
			var key = event.keyCode,
				k = keys,
				zone = null,
				cFocus = baseFocus.getFocus(),
				focusNode = cFocus.node,
				m = this._dragManager,
				found,
				i,
				j,
				r,
				children,
				area,
				widget;
			if(focusNode == this.containerNode){
				area = this.gridNode.childNodes;
				switch(key){
					case k.DOWN_ARROW:
					case k.RIGHT_ARROW:
						found = false;
						for(i = 0; i < area.length; i++){
							children = area[i].childNodes;
							for(j = 0; j < children.length; j++){
								zone = children[j];
								if(zone !== null && zone.style.display != "none"){
									focus.focus(zone);
									events.stop(event);
									found = true;
									break;
								}
							}
							if(found){ break };
						}
						break;
					case k.UP_ARROW:
					case k.LEFT_ARROW:
						area = this.gridNode.childNodes;
						found = false;
						for(i = area.length-1; i >= 0 ; i--){
							children = area[i].childNodes;
							for(j = children.length; j >= 0; j--){
								zone = children[j];
								if(zone !== null && zone.style.display != "none"){
									focus.focus(zone);
									events.stop(event);
									found = true;
									break;
								}
							}
							if(found){ break };
						}
					break;
				}
			}else{
				if(focusNode && (focusNode.parentNode.parentNode == this.gridNode)){
					var child = (key == k.UP_ARROW || key == k.LEFT_ARROW) ? "lastChild" : "firstChild";
					var pos = (key == k.UP_ARROW || key == k.LEFT_ARROW) ? "previousSibling" : "nextSibling";
					switch(key){
						case k.UP_ARROW:
						case k.DOWN_ARROW:
							events.stop(event);
							found = false;
							var focusTemp = focusNode;
							while(!found){
								children = focusTemp.parentNode.childNodes;
								var num = 0;
								for(i = 0; i < children.length; i++){
									if(children[i].style.display != "none"){ num++; }
									if(num > 1){ break; }
								}
								if(num == 1){ return; }
								if(focusTemp[pos] === null){
									zone = focusTemp.parentNode[child];
								}
								else{
									zone = focusTemp[pos];
								}
								if(zone.style.display === "none"){
									focusTemp = zone;
								}
								else{
									found = true;
								}
							}
							if(event.shiftKey){
								var parent = focusNode.parentNode;
								for(i = 0; i < this.gridNode.childNodes.length; i++){
									if(parent == this.gridNode.childNodes[i]){
										break;
									}
								}
								children = this.gridNode.childNodes[i].childNodes;
								for(j = 0; j < children.length; j++){
									if(zone == children[j]){
										break;
									}
								}
								if(has("mozilla") || has("webkit")){ i--; }

								widget = registry.byNode(focusNode);
								if(!widget.dragRestriction){
									r = m.removeDragItem(parent, focusNode);
									this.addChild(widget, i, j);
									domAttr.set(focusNode, "tabIndex", "0");
									focus.focus(focusNode);
								}
								else{
									topic.publish("/dojox/layout/gridContainer/moveRestriction", this);
								}
							}
							else{
								focus.focus(zone);
							}
						break;
						case k.RIGHT_ARROW:
						case k.LEFT_ARROW:
							events.stop(event);
							if(event.shiftKey){
								var z = 0;
								if(focusNode.parentNode[pos] === null){
									if(has("ie") && key == k.LEFT_ARROW){
										z = this.gridNode.childNodes.length-1;
									}
								}
								else if(focusNode.parentNode[pos].nodeType == 3){
									z = this.gridNode.childNodes.length - 2;
								}
								else{
									for(i = 0; i < this.gridNode.childNodes.length; i++){
										if(focusNode.parentNode[pos] == this.gridNode.childNodes[i]){
											break;
										}
										z++;
									}
									if(has("mozilla") || has("webkit")){ z--; }
								}
								widget = registry.byNode(focusNode);
								var _dndType = focusNode.getAttribute("dndtype");
								if(_dndType === null){
									//check if it's a dijit object
									if(widget && widget.dndType){
										_dndType = widget.dndType.split(/\s*,\s*/);
									}
									else{
										_dndType = ["text"];
									}
								}
								else{
									_dndType = _dndType.split(/\s*,\s*/);
								}
								var accept = false;
								for(i = 0; i < this.acceptTypes.length; i++){
									for(j = 0; j < _dndType.length; j++){
										if(_dndType[j] == this.acceptTypes[i]){
											accept = true;
											break;
										}
									}
								}
								if(accept && !widget.dragRestriction){
									var parentSource = focusNode.parentNode,
										place = 0;
									if(k.LEFT_ARROW == key){
										var t = z;
										if(has("mozilla") || has("webkit")){ t = z + 1; }
										place = this.gridNode.childNodes[t].childNodes.length;
									}
									// delete of manager :
									r = m.removeDragItem(parentSource, focusNode);
									this.addChild(widget, z, place);
									domAttr.set(r, "tabIndex", "0");
									focus.focus(r);
								}
								else{
									topic.publish("/dojox/layout/gridContainer/moveRestriction", this);
								}
							}
							else{
								var node = focusNode.parentNode;
								while(zone === null){
									if(node[pos] !== null && node[pos].nodeType !== 3){
										node = node[pos];
									}
									else{
										if(pos === "previousSibling"){
											node = node.parentNode.childNodes[node.parentNode.childNodes.length-1];
										}
										else{
											node = node.parentNode.childNodes[has("ie") ? 0 : 1];
										}
									}
									zone = node[child];
									if(zone && zone.style.display == "none"){
										// check that all elements are not hidden
										children = zone.parentNode.childNodes;
										var childToSelect = null;
										if(pos == "previousSibling"){
											for(i = children.length-1; i >= 0; i--){
												if(children[i].style.display != "none"){
													childToSelect = children[i];
													break;
												}
											}
										}
										else{
											for(i = 0; i < children.length; i++){
												if(children[i].style.display != "none"){
													childToSelect = children[i];
													break;
												}
											}
										}
										if(!childToSelect){
											focusNode = zone;
											node = focusNode.parentNode;
											zone = null;
										}
										else{
											zone = childToSelect;
										}
									}
								}
								focus.focus(zone);
							}
						break;
					}
				}
			}
		},

		destroy: function(){
			var m = this._dragManager;
			array.forEach(this._grid, function(dropZone){
				m.unregister(dropZone.node);
			});
			this.inherited(arguments);
		}
	});
	
	
	
	// module:
	//		idx/layout/FlipCardGridContainer
	// summary:
	//		A grid layout container, which includes flip card widget in it

	/**
	* @name idx.layout.FlipCardGridContainer
	* @class A grid layout container, which includes flip card widget in it
	* @augments idx.layout._GridContainerLite
	*/ 
		
	return declare("idx/layout/FlipCardGridContainer", [_GridContainerLite], {
		/**@lends idx.layout.FlipCardGridContainer*/ 
		// summary:
		//		A grid layout container, which includes flip card widget in it
		//
		//		Example:
		// |	new FlipCardGridContainer({nbZones: 3,minColWidth: 100,minChildWidth: 100,isAutoOrganized: true})
		//
		//		Example:
		// |	<div data-dojo-type='idx.layout.FlipCardGridContainer' data-dojo-props='nbZones: 3,minColWidth: 100,minChildWidth: 100,isAutoOrganized: true'>
		//			<div data-dojo-type='idx.layout.FlipCardItem' data-dojo-props='maxable:true,flipable:true'></div>
		//			<div data-dojo-type='idx.layout.FlipCardItem' data-dojo-props='maxable:false,flipable:true'></div>
		//			<div data-dojo-type='idx.layout.FlipCardItem' data-dojo-props='maxable:true,flipable:false'></div>
		//		</div>
		
		
		// hasResizableColumns: Boolean
		//		whether the grid container can be resized in column way 
		hasResizableColumns: false,
		
		// liveResizeColumns: Boolean
		//		the column take resize effect in real time.
		liveResizeColumns : false,
		
		// dockVisible: Boolean
        //      the dock container will not be hided even when in a maximum mode.
		dockVisible: false,
		
		// dockVisible: Boolean
        //      the dock container will not be hided even when in a maximum mode.
		dockBehavior: "collapsed", // "collapsed", "fixed"
		
		// minColWidth: Integer
		//		the minimal column width of the grid layout in px.
		minColWidth: 50,
		
		// minChildWidth: Integer
		//		the minimal card widget width in px.
		minChildWidth: 50,
		
		// nbZones: Integer
		//      the number of grid column container
		nbZones: 3,
		
		// mode: String
		//		Location to add/remove columns, must be set to 'left' or 'right' (default).
		mode: "right",
		
		// isRightFixed: Boolean
		//		Define if the last right column is fixed.
		//		Used when you add or remove columns by calling setColumns method.
		isRightFixed: false,
		
		// isLeftFixed: Boolean
		//		Define if the last left column is fixed.
		//		Used when you add or remove columns by calling setColumns method.
		isLeftFixed: false,
		
		// layoutMode: String
		//		The alignment of card widgets inside the grid layout.
		layoutMode: "relative", //absolute, floating
		
		// dragHandleClass: Array
		//		CSS class enabling a drag handle on a child.
		dragHandleClass:"dndBarNode",
		
		// defaultCardItemWidth & Height: Integer
        //      Card item default width & height inside grid container.
		defaultCardItemWidth: 300,
		defaultCardItemHeight: 280,
		
		// showContentHeader: Boolean
		//		Whether to show content header
		showContentHeader: false,
		
		containerType: "grid",
		
		containerId: "",
		containerName: "",
		containerTitle: "",
		
		
		maxItemSwitchMode: "stable", //"stable", "tab" 
		
		//card items
		// items: [],
		
		//card item relations
		// relations: {},
		
		//flip card container ref
		// rootContainer: {},
		
		animationDuration: 1000,
		css3AnimationDisabled: false,
		
		// baseClass: "gridContainer flippableGridContainer",
		
		/** @ignore */
		postMixInProperties: function(){
			this.inherited(arguments);
			
			this._nlsResources = i18n.getLocalization("idx/layout", "FlipCardGridContainer");
			
			this.stackedCardItems = {};
			this.childItemMaps = {};
			this.headerParams = this.headerParams || {};
			
			this.items = this.items || [];
			this.relations = this.relations || {};
		},
		
		/** @ignore */
		postCreate: function(){
			this.inherited(arguments);
			
			domClass.add(this.domNode, "centerGridContainer");
			if(_supportCSS3Animation){
				domClass.add(this.domNode, "css3Animations");
			}
			
			this.animationDurationHeritage = this.animationDuration;
		},

		/** @ignore */
		startup: function(){
			if(this._started){ return; }
			
			//add card items
			array.forEach(this.items, function(cItem){
				lang.mixin(cItem.props, {
					rootContainer: this.rootContainer,
					dndType: "Portlet",
					css3AnimationDisabled: this.rootContainer?this.rootContainer.css3AnimationDisabled_card:false,
					flipCardModel: this.rootContainer?this.rootContainer.model:"edit"
				});
				
				this.addCardItem(cItem);
			}, this);
			
			
			this.inherited(arguments);
			
			if(this.hasResizableColumns){
				for(var i = 0; i < this._grid.length - 1; i++){
					this._createGrip(i);
				}
				// If widget has a container parent, grips will be placed
				// by method onShow.
				if(!this.getParent()){
					ready(lang.hitch(this, "_placeGrips"));
				}
				//fixed for CSS3 display
				this.onShow();
			}
			
			//switch layout mode
			if(this.layoutMode != "relative"){
				this.changeLayoutMode(this.layoutMode);
				
				//TODO
			}
			
			
			//title node
			if(!this.headerContainer){
                this.headerContainer = new _ContentHeader(lang.mixin({}, {
	                	preload:true
	                }, this.headerParams), 
                	domConstruct.create("div", {}, this.domNode, "first")
                );
                if(this.headerContainer){
                    this.headerContainer.startup();
                }
            }
            
            this.toggleContentHeader(this.showContentHeader);
            
			//dock node
			if(!this.dockContainer){
				this.dockContainer = new _Dock({
					id: this.id + "_dock",
					autoPosition: "south",
					gridRef: this
				}, domConstruct.create("div", {}, this.domNode));
				domClass.add(this.dockContainer.domNode, "dockContainer");
				if(this.dockContainer){
					this.dockContainer.startup();
				}
				this.toggleDockContainer(false);
			}
			
			//handle css3 animation flag
			this.toggleCSS3Animation(this.css3AnimationDisabled);
			
			//card relationships
			if(this.relations && !_FlipCardUtils.isObjectEmpty(this.relations)){
				for(var relItemName in this.relations){
					var targets = this.relations[relItemName];
					if(targets && targets.length > 0){
						var sourceWidget = this.childItemMaps[relItemName];
						
						var targetWidgets = [];
						array.forEach(targets, function(relTargetItemName){
							targetWidgets.push(this.childItemMaps[relTargetItemName]);
						}, this);
						
						this.own(on(this.childItemMaps[relItemName].domNode, touch.press, lang.hitch(this, function(tWidgets, evt){
							this.buildCardItemRelations(tWidgets, evt);
						}, targetWidgets)));
						//a11y
						this.own(on(this.childItemMaps[relItemName].domNode, "keydown", lang.hitch(this, function(tWidgets, evt){
							if(evt.keyCode == keys.ENTER){
								this.buildCardItemRelations(tWidgets, evt);
							}
						}, targetWidgets)));
						
						this.own(on(winUtil.body(), touch.press, lang.hitch(this, function(sWidget, cWidgets, evt){
							this.clearCardItemRelations(sWidget, cWidgets, evt);
						}, sourceWidget, this.childItemMaps)));
						//a11y
						this.own(on(winUtil.body(), "keydown", lang.hitch(this, function(sWidget, cWidgets, evt){
							if(evt.keyCode == keys.ENTER || evt.keyCode == keys.ESCAPE){
								this.clearCardItemRelations(sWidget, cWidgets, evt);
							}
						}, sourceWidget, this.childItemMaps)));
					}
				}
			}
			
			// this.own(on(this.domNode, "keydown", lang.hitch(this, "_onKey")));
		},
		
		buildCardItemRelations: function(tWidgets, evt){
			array.forEach(tWidgets, function(tw){
				domClass.add(tw.domNode, "relationshipFigure");
			}, this);
		},
		
		clearCardItemRelations: function(sWidget, cWidgets, evt){
			if(dom.isDescendant(evt.target, sWidget.domNode)){
				return;
			}
			for(var cwKey in cWidgets){
				domClass.remove(cWidgets[cwKey].domNode, "relationshipFigure");
			}
		},
		
		toggleContentHeader: function(forceShow){
			if(forceShow !== undefined){
				this.showContentHeader = forceShow ? true : false;
			}else{
				this.showContentHeader = !this.showContentHeader;
			}
			
			if(this.showContentHeader){
				domClass.add(this.headerContainer.domNode, "headerContainerVisible");
                domClass.add(this.domNode, "gridHeaderVisible");
			}else{
				domClass.remove(this.headerContainer.domNode, "headerContainerVisible");
                domClass.remove(this.domNode, "gridHeaderVisible");
			}
		},
		
		getGridContentSize: function(){
			return domGeom.position(this.gridContainerDiv);
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
		
        _getFocusItems: function(){
            // summary:
            //      Finds focusable items in grid container,
            //      and sets this._firstFocusItem and this._lastFocusItem
            // tags:
            //      protected

            var elems = a11y._getTabNavigable(this.domNode);
            this._firstFocusItem = elems.lowest || elems.first || this.domNode;
            this._lastFocusItem = elems.last || elems.highest || this._firstFocusItem;
        },
		
		_onKey: function(/*Event*/ evt){
            // summary:
            //      Handles the keyboard events for accessibility reasons
            // tags:
            //      private

            if(evt.keyCode == keys.TAB){
                this._getFocusItems(this.domNode);
                var node = evt.target;
                if(this._firstFocusItem == this._lastFocusItem){
                    // don't move focus anywhere, but don't allow browser to move focus off of the grid container either
                    evt.stopPropagation();
                    evt.preventDefault();
                }else if(node == this._firstFocusItem && evt.shiftKey){
                    // if we are shift-tabbing from first focusable item in the grid container, send focus to last item
                    focus.focus(this._lastFocusItem);
                    evt.stopPropagation();
                    evt.preventDefault();
                }else if(node == this._lastFocusItem && !evt.shiftKey){
                    // if we are tabbing from last focusable item in the grid container, send focus to first item
                    focus.focus(this._firstFocusItem);
                    evt.stopPropagation();
                    evt.preventDefault();
                }
            }
        },
        
        // getChildren: function(){
			// this.inherited(arguments);
		// },
		
		reOrganizeChildren: function(){
		    this.disableDnd();
		    this._organizeChildren();
		    this.enableDnd();
		},
		
		/**
		 * play the animation for card hidden.
		 * @param {Object} sourceItem
		 * @param {Object} destItem
		 */
		playStackAnimation: function(sourceItem, destItem){
			// var stackAnimNode = domConstruct.create("div", {
				// className: "stackAnimationNode"
			// }, this.domNode);
			var stackAnimNode = lang.clone(sourceItem.domNode);
			domClass.add(stackAnimNode, "stackAnimationNode css3FakeAnimationsDisabled");
			// domClass.remove(stackAnimNode, "css3Animations");
			this.domNode.appendChild(stackAnimNode);
			
			//source
			var sGeom = domGeom.position(sourceItem.domNode);
			domStyle.set(stackAnimNode, {
				left: sGeom.x + "px",
				top: sGeom.y + "px",
				width: sGeom.w + "px",
				height: sGeom.h + "px"
			});
			
			//dest
			var dGeom = domGeom.position(destItem.domNode);
			var gGeom = domGeom.position(this.domNode);
			if(dGeom.w <= 0 || dGeom.h <= 0){
				domStyle.set(stackAnimNode, {
					left: (gGeom.x+100) + "px",
					top: (gGeom.y+gGeom.h-20) + "px",
					width: "1px",
					height: "1px"
				});
			}else{
				domStyle.set(stackAnimNode, {
					left: (dGeom.x+100) + "px",
					top: (dGeom.y+10) + "px",
					width: "1px",
					height: "1px"
				});
			}
			
			domClass.add(stackAnimNode, "stackAnimationNodeEnd");
			domClass.add(stackAnimNode, "css3FakeAnimations");
			
			setTimeout(function(){
				domConstruct.destroy(stackAnimNode);
			}, 1000);
		},
		
		/**
		 * play the animation for card un-hide.
		 * @param {Object} sourceItem
		 * @param {Object} destItem
		 */
		playUnStackAnimation: function(sourceItem, destItem){
			//make invisible
			domClass.add(sourceItem.domNode, "portletItemInvisible");
			
			var stackAnimNode = lang.clone(sourceItem.domNode);
			domClass.add(stackAnimNode, "stackAnimationNode css3FakeAnimationsDisabled");
			// domClass.remove(stackAnimNode, "css3Animations");
			this.domNode.appendChild(stackAnimNode);
			
			//source
			var sGeom = domGeom.position(destItem.domNode);
			domStyle.set(stackAnimNode, {
				left: (sGeom.x+100) + "px",
				top: (sGeom.y+sGeom.h-20) + "px",
				width: "1px",
				height: "1px"
			});
			
			//dest
			var dGeom = domGeom.position(sourceItem.domNode);
			domStyle.set(stackAnimNode, {
				left: dGeom.x + "px",
				top: dGeom.y + "px",
				width: dGeom.w + "px",
				height: dGeom.h + "px"
			});
			
			domClass.add(stackAnimNode, "unStackAnimationNodeEnd");
			domClass.add(stackAnimNode, "css3FakeAnimations");
			
			setTimeout(function(){
				domConstruct.destroy(stackAnimNode);
				//make visible
				domClass.remove(sourceItem.domNode, "portletItemInvisible");
			}, 1000);
		},
		
		/**
		 * hide card item.
		 * @param {Object} cItem
		 * @param {Boolean} noAnim
		 */
		stackCardItem: function(cItem, noAnim){
			if(this.stackedCardItems[cItem.itemName]){return;}
			if(!noAnim && _supportCSS3Animation && !this.css3AnimationDisabled){
				this.playStackAnimation(cItem, this.dockContainer);
			}
			cItem.stackItem && cItem.stackItem();
			var dockItem = this.addToDockContainer(cItem);
			this.stackedCardItems[cItem.itemName] = {origin:cItem, dock:dockItem};
			this.toggleDockContainer(true);
			domClass.add(this.domNode, "gridContainerStacked");
		},
		
		/**
		 * un-hide card item.
		 * @param {Object} cItem
		 * @param {Boolean} noAnim
		 */
		unStackCardItem: function(cItem, noAnim){
			cItem.unStackItem && cItem.unStackItem();
			if(!noAnim && _supportCSS3Animation && !this.css3AnimationDisabled){
				this.playUnStackAnimation(cItem, this.dockContainer);
			}
			this.removeStackedCardItem(cItem.itemName);
		},
		
		removeStackedCardItem: function(itemName){
			if(this.stackedCardItems && this.stackedCardItems[itemName]){
				var dockItem = this.stackedCardItems[itemName].dock;
				var originItem = this.stackedCardItems[itemName].origin;
				this.removeFromDockContainer(dockItem, originItem);
				delete this.stackedCardItems[itemName];
				if(_FlipCardUtils.isObjectEmpty(this.stackedCardItems)){
					this.toggleDockContainer(false);
					domClass.remove(this.domNode, "gridContainerStacked");
				}
			}
		},
		
		/**
		 * clear the hidden bar of the grid container.
		 */
		clearStackedItem: function(){
			for(var key in this.stackedCardItems){
				var cItem = this.stackedCardItems[key];
				if(cItem.origin){
					cItem.origin.unStackItem && cItem.origin.unStackItem();
				}
			}
			this.stackedCardItems = {};
			this.clearDockContainer();
			this.toggleDockContainer(false);
			domClass.remove(this.domNode, "gridContainerStacked");
		},
		
		toggleDockContainer: function(forceShowHide, ignoreDockVisible){
			if(forceShowHide !== undefined){
				this.dockContainerDisplayed = forceShowHide ? true : false;
			}else{
				this.dockContainerDisplayed = !this.dockContainerDisplayed;
			}
			if(this.dockVisible && !ignoreDockVisible){
				this.dockContainerDisplayed = true;
			}
			domClass.toggle(this.dockContainer.domNode, "dockContainerVisible", this.dockContainerDisplayed);
		},
		
		addToDockContainer: function(widget, container){
			container = container || this.dockContainer;
			if(!container){return;}
			if(!widget.title){
				widget.title = widget.mainContent.title || widget.itemName;
			}
			var dockItem = container.addNode(widget, this);
			domClass.add(dockItem.domNode, "dockItem");
			
			return dockItem;
		},
		
		removeFromDockContainer: function(dockItem, widget, container){
			container = container || this.dockContainer;
			if(!container){return;}
			
			container.removeNode(dockItem, widget, this);
		},
		
		clearDockContainer: function(container){
			container = container || this.dockContainer;
			if(container){
				container.destroyDescendants();
				// domConstruct.empty(container);
			}
		},
		
		/**
		 * flip all the cards inside the grid container.
		 */
		processFlips: function(e){
			//Stub for manually handle flips inside container
			var childPItemWidgets = this.getChildren();
			array.forEach(childPItemWidgets, function(card){
				card.processFlip(e);
			}, this);
		},
		
		/**
		 * switch layout mode, from default to absolute, floating.....
		 */
		changeLayoutMode: function(mode){
			var childPItemWidgets = this.getChildren();
			if(mode == "absolute"){
				this.disableDnd();
				array.forEach(childPItemWidgets, function(card){
					domClass.add(card.domNode, "layoutAbsolute");
					//set card item style
                    domStyle.set(card.domNode, {
                        width: this.defaultCardItemWidth + "px",
                        height: this.defaultCardItemHeight + "px"
                    });
					var mov = new _Moveable({},card.domNode);
					this.own(on(card.domNode, touch.press, lang.hitch(this, function(evt){
						this._changeFlipCardItemZIndex(card, childPItemWidgets);
						evt && event.stop(evt);
					})));
					//a11y
					this.own(on(card.domNode, "keydown", lang.hitch(this, function(evt){
						if(evt.keyCode == keys.ENTER){
							this._changeFlipCardItemZIndex(card, childPItemWidgets);
							evt && event.stop(evt);
						}
					})));
				}, this);
				domClass.add(this.gridNode, "layoutAbsolute");
				domClass.add(this.gridContainerTable, "layoutAbsolute");
			}else if(mode == "floating"){
				this.disableDnd();
				//card
				array.forEach(childPItemWidgets, function(card){
					domClass.add(card.domNode, "layoutFloating");
					//set card item style
                    domStyle.set(card.domNode, {
                        width: this.defaultCardItemWidth + "px",
                        height: this.defaultCardItemHeight + "px"
                    });
					this._insertChild(card, 0);
				}, this);
				array.forEach(childPItemWidgets, function(card){
				  	card.startup();
				}, this);
				//column
				var zone = this._grid[0].node;
				array.forEach(this._grid, function(dropZone, index){
					if(index == 0){
						domClass.add(dropZone.node, "layoutFloating");
					}else{
						domClass.add(dropZone.node, "dijitHidden");
					}
				});
				//grid container
				domClass.add(this.gridNode, "layoutFloating");
				domClass.add(this.gridContainerTable, "layoutFloating");
				
				//enable dnd at last
				this.enableDnd();
			}else if(mode == "relative"){
				array.forEach(childPItemWidgets, function(card){
					domClass.remove(card.domNode, "layoutAbsolute layoutFloating");
				}, this);
				domClass.remove(this.gridNode, "layoutAbsolute layoutFloating");
				domClass.remove(this.gridContainerTable, "layoutAbsolute layoutFloating");
				this.enableDnd();
				//TODO
			}
			this.layoutMode = mode || "relative";
			// this._set("layoutMode", mode);
		},
		
		/**
		 * push the card widget to the front.
		 * @param {Object} card
		 * @param {Array} cardItems
		 * @private
		 */
		_changeFlipCardItemZIndex: function(card, cardItems){
			cardItems = cardItems || this.getChildren();
			var maxZIndex = 1 + Math.max.apply(null, array.map(cardItems, function(cItem){
				return domStyle.get(cItem.domNode, "zIndex");
			}));
			domStyle.set(card.domNode, {
				zIndex: maxZIndex
			});
		},

		resizeChildAfterDrop : function(/*Node*/node, /*Object*/targetArea, /*Integer*/indexChild){
			if(this.inherited(arguments)){
				this._placeGrips();
			}
		},
		
		addChild: function(/*Object*/child, /*Integer?*/column, /*Integer?*/p){
			this.inherited(arguments);
			if(child.itemName){
				this.childItemMaps[child.itemName] = child;
			}
			return child;
		},
		removeChild: function(/*Widget*/ widget){
			this.inherited(arguments);
			if(widget && widget.itemName){
				if(widget.destroyRecursive){
					widget.destroyRecursive();
				}
				delete this.childItemMaps[widget.itemName];
			}
		},
		
		addCardItem: function(/*Object*/item){
			if(!item){return}
			
			//generate card name (GUID)
			if(!item.name){
				item.name = _FlipCardUtils.generateGUID();
			}
			if(this.childItemMaps[item.name]){
				//item exist
				return;
			}
			
			var portletItemProps = lang.mixin({
				gridContainer: this
			}, {
				itemName: item.name,
				// toggleable: false,
				closable: false,
				dndType: "Portlet",
				initItemStatus: "normal"
			}, item.props);
			var portletItem = new FlipCardItem(portletItemProps); 
			
			var childCardItem = null;
			if(item.itemPosition && item.itemPosition.column){
				childCardItem = this.addChild(portletItem, item.itemPosition.column, item.itemPosition.p);
			}else{
				childCardItem = this.addChild(portletItem);
			}
			
			if(this.layoutMode == "floating" || this.layoutMode == "absolute"){
				if(item.itemGeomProps){
					domGeom.setMarginBox(childCardItem.domNode, item.itemGeomProps);
				}
			}
			
			return childCardItem;
		},
		updateCardItem: function(/*Object*/item){
			if(!item || !item.name){return}
			if(!this.childItemMaps[item.name]){
				//item does not exist
				return;
			}
			
			var cardWidget = this.childItemMaps[item.name];
			
			//update card data
			if(item.props.minable !== undefined){
				cardWidget.set("minable", item.props.minable);
			}
			if(item.props.maxable !== undefined){
				cardWidget.set("maxable", item.props.maxable);
			}
			if(item.props.stackable !== undefined){
				cardWidget.set("stackable", item.props.stackable);
			}
			if(item.props.closable !== undefined){
				cardWidget.set("closable", item.props.closable);
			}
			if(item.props.cardFlipAction !== undefined){
				cardWidget.set("cardFlipAction", item.props.cardFlipAction);
			}
			
			
			//for main content
			if(item.props.main_props && cardWidget.mainContent){
				if(item.props.main_props.title !== undefined){
					cardWidget.mainContent.set("title", item.props.main_props.title);
				}
				if(item.props.main_props.content !== undefined){
					cardWidget.mainContent.set("content", item.props.main_props.content);
				}
				if(item.props.main_props.href !== undefined){
					cardWidget.mainContent.set("href", item.props.main_props.href);
				}
			}
			
			//for detail content
			if(item.props.detail_props && cardWidget.detailContent){
				if(item.props.detail_props.title !== undefined){
					cardWidget.detailContent.set("title", item.props.detail_props.title);
				}
				if(item.props.detail_props.content !== undefined){
					cardWidget.detailContent.set("content", item.props.detail_props.content);
				}
				if(item.props.detail_props.href !== undefined){
					cardWidget.detailContent.set("href", item.props.detail_props.href);
				}
			}
			
			//for main & detail settings
			//TODO
			
		},
		removeCardItem: function(/*String*/itemName){
			if(!itemName){return}
			if(!this.childItemMaps[itemName]){
				//item does not exist
				return;
			}
			
			var widget = this.childItemMaps[itemName];
			if(widget){
				this.removeChild(widget);
			}
			
			if(this.stackedCardItems && this.stackedCardItems[itemName]){
				this.removeStackedCardItem(itemName);
			}
			
		},

		onShow: function(){
			this.inherited(arguments);
			this._placeGrips();
		},

		_createGrip: function(/*Integer*/ index){
			var dropZone = this._grid[index],
				grip = domConstruct.create("div", { 'class': "gridContainerGrip fpGridContainerGrip" }, this.domNode);
			dropZone.grip = grip;
			dropZone.gripHandler = [
				this.connect(grip, touch.over, function(e){
					var gridContainerGripShow = false;
					for(var i = 0; i < this._grid.length - 1; i++){
						if(domClass.contains(this._grid[i].grip, "gridContainerGripShow")){
							gridContainerGripShow = true;
							break;
						}
					}
					if(!gridContainerGripShow){
						domClass.replace(e.target, "gridContainerGripShow", "gridContainerGrip");
					}
				})[0],
				this.connect(grip, touch.out, function(e){
					if(!this._isResized){
						domClass.replace(e.target, "gridContainerGrip", "gridContainerGripShow");
					}
				})[0],
				this.connect(grip, touch.press, "_resizeColumnOn")[0],
				this.connect(grip, "ondblclick", "_onGripDbClick")[0]
			];
		},

		_placeGrips: function(){
			var gripWidth, height, left = 0, grip;
			//var scroll = this.domNode.style.overflowY;

			array.forEach(this._grid, function(dropZone){
				if(dropZone.grip){
					grip = dropZone.grip;
					if(!gripWidth){
						gripWidth = grip.offsetWidth / 2;
					}

					left += domGeom.getMarginBox(dropZone.node).w;

					domStyle.set(grip, "left", (left - gripWidth) + "px");
					if(!height){
						height = domGeom.getContentBox(this.gridNode).h;
					}
					if(height > 0){
						domStyle.set(grip, "height", height + "px");
					}
				}
			}, this);
		},

		_onGripDbClick: function(){
			this._updateColumnsWidth(this._dragManager);
			this.resize();
		},

		_resizeColumnOn: function(/*Event*/e){
			this._activeGrip = e.target;
			this._initX = e.pageX;
			e.preventDefault();

			winUtil.body().style.cursor = "ew-resize";

			this._isResized = true;

			var tabSize = [];
			var grid;
			var i;

			for(i = 0; i < this._grid.length; i++){
				tabSize[i] = domGeom.getContentBox(this._grid[i].node).w;
			}

			this._oldTabSize = tabSize;

			for(i = 0; i < this._grid.length; i++){
				grid = this._grid[i];
				if(this._activeGrip == grid.grip){
					this._currentColumn = grid.node;
					this._currentColumnWidth = tabSize[i];
					this._nextColumn = this._grid[i + 1].node;
					this._nextColumnWidth = tabSize[i + 1];
				}
				grid.node.style.width = tabSize[i] + "px";
			}

			// calculate the minWidh of all children for current and next column
			var calculateChildMinWidth = function(childNodes, minChild){
				var width = 0;
				var childMinWidth = 0;

				array.forEach(childNodes, function(child){
					if(child.nodeType == 1){
						var objectStyle = domStyle.getComputedStyle(child);
						var minWidth = (has("ie")) ? minChild : parseInt(objectStyle.minWidth);

						childMinWidth = minWidth +
									parseInt(objectStyle.marginLeft) +
									parseInt(objectStyle.marginRight);

						if(width < childMinWidth){
							width = childMinWidth;
						}
					}
				});
				return width;
			};
			var currentColumnMinWidth = calculateChildMinWidth(this._currentColumn.childNodes, this.minChildWidth);

			var nextColumnMinWidth = calculateChildMinWidth(this._nextColumn.childNodes, this.minChildWidth);

			var minPix = Math.round((domGeom.getMarginBox(this.gridContainerTable).w * this.minColWidth) / 100);

			this._currentMinCol = currentColumnMinWidth;
			this._nextMinCol = nextColumnMinWidth;

			if(minPix > this._currentMinCol){
				this._currentMinCol = minPix;
			}
			if(minPix > this._nextMinCol){
				this._nextMinCol = minPix;
			}
			this._connectResizeColumnMove = connect.connect(winUtil.doc, touch.move, this, "_resizeColumnMove");
			this._connectOnGripMouseUp = connect.connect(winUtil.doc, touch.release, this, "_onGripMouseUp");
		},

		_onGripMouseUp: function(){
			winUtil.body().style.cursor = "default";

			connect.disconnect(this._connectResizeColumnMove);
			connect.disconnect(this._connectOnGripMouseUp);

			this._connectOnGripMouseUp = this._connectResizeColumnMove = null;

			if(this._activeGrip){
				domClass.replace(this._activeGrip, "gridContainerGrip", "gridContainerGripShow");
			}

			this._isResized = false;
		},

		_resizeColumnMove: function(/*Event*/e){
			e.preventDefault();
			if(!this._connectResizeColumnOff){
				connect.disconnect(this._connectOnGripMouseUp);
				this._connectOnGripMouseUp = null;
				this._connectResizeColumnOff = connect.connect(winUtil.doc, touch.release, this, "_resizeColumnOff");
			}

			var d = e.pageX - this._initX;
			if(d == 0){ return; }

			if(!(this._currentColumnWidth + d < this._currentMinCol ||
					this._nextColumnWidth - d < this._nextMinCol)){

				this._currentColumnWidth += d;
				this._nextColumnWidth -= d;
				this._initX = e.pageX;
				this._activeGrip.style.left = parseInt(this._activeGrip.style.left) + d + "px";

				if(this.liveResizeColumns){
					this._currentColumn.style["width"] = this._currentColumnWidth + "px";
					this._nextColumn.style["width"] = this._nextColumnWidth + "px";
					this.resize();
				}
			}
		},

		_resizeColumnOff: function(/*Event*/e){
			winUtil.body().style.cursor = "default";

			connect.disconnect(this._connectResizeColumnMove);
			connect.disconnect(this._connectResizeColumnOff);

			this._connectResizeColumnOff = this._connectResizeColumnMove = null;

			if(!this.liveResizeColumns){
				this._currentColumn.style["width"] = this._currentColumnWidth + "px";
				this._nextColumn.style["width"] = this._nextColumnWidth + "px";
				//this.resize();
			}

			var tabSize = [],
				testSize = [],
				tabWidth = this.gridContainerTable.clientWidth,
				node,
				update = false,
				i;

			for(i = 0; i < this._grid.length; i++){
				node = this._grid[i].node;
				if(has("ie")){
					tabSize[i] = domGeom.getMarginBox(node).w;
					testSize[i] = domGeom.getContentBox(node).w;
				}
				else{
					tabSize[i] = domGeom.getContentBox(node).w;
					testSize = tabSize;
				}
			}

			for(i = 0; i < testSize.length; i++){
				if(testSize[i] != this._oldTabSize[i]){
					update = true;
					break;
				}
			}

			if(update){
				var mul = has("ie") ? 100 : 10000;
				for(i = 0; i < this._grid.length; i++){
					this._grid[i].node.style.width = Math.round((100 * mul * tabSize[i]) / tabWidth) / mul + "%";
				}
				this.resize();
			}

			if(this._activeGrip){
				domClass.replace(this._activeGrip, "gridContainerGrip", "gridContainerGripShow");
			}

			this._isResized = false;
		},

		setColumns: function(/*Integer*/nbColumns){
			var z, j;
			if(nbColumns > 0){
				var length = this._grid.length,
					delta = length - nbColumns;
				if(delta > 0){
					var count = [], zone, start, end, nbChildren;
					// Check if right or left columns are fixed
					// Columns are not taken in account and can't be deleted
					if(this.mode == "right"){
						end = (this.isLeftFixed && length > 0) ? 1 : 0;
						start = (this.isRightFixed) ? length - 2 : length - 1
						for(z = start; z >= end; z--){
							nbChildren = 0;
							zone = this._grid[z].node;
							for(j = 0; j < zone.childNodes.length; j++){
								if(zone.childNodes[j].nodeType == 1 && !(zone.childNodes[j].id == "")){
									nbChildren++;
									break;
								}
							}
							if(nbChildren == 0){ count[count.length] = z; }
							if(count.length >= delta){
								this._deleteColumn(count);
								break;
							}
						}
						if(count.length < delta){
							connect.publish("/dojox/layout/gridContainer/noEmptyColumn", [this]);
						}
					}
					else{ // mode = "left"
						start = (this.isLeftFixed && length > 0) ? 1 : 0;
						end = (this.isRightFixed) ? length - 1 : length;
						for(z = start; z < end; z++){
							nbChildren = 0;
							zone = this._grid[z].node;
							for(j = 0; j < zone.childNodes.length; j++){
								if(zone.childNodes[j].nodeType == 1 && !(zone.childNodes[j].id == "")){
									nbChildren++;
									break;
								}
							}
							if(nbChildren == 0){ count[count.length] = z; }
							if(count.length >= delta){
								this._deleteColumn(count);
								break;
							}
						}
						if(count.length < delta){
							//Not enough empty columns
							connect.publish("/dojox/layout/gridContainer/noEmptyColumn", [this]);
						}
					}
				}
				else{
					if(delta < 0){ this._addColumn(Math.abs(delta)); }
				}
				if(this.hasResizableColumns){ this._placeGrips(); }
			}
		},

		_addColumn: function(/*Integer*/nbColumns){
			var grid = this._grid,
				dropZone,
				node,
				index,
				length,
				isRightMode = (this.mode == "right"),
				accept = this.acceptTypes.join(","),
				m = this._dragManager;

			//Add a grip to the last column
			if(this.hasResizableColumns && ((!this.isRightFixed && isRightMode)
				|| (this.isLeftFixed && !isRightMode && this.nbZones == 1) )){
				this._createGrip(grid.length - 1);
			}

			for(var i = 0; i < nbColumns; i++){
				// Fix CODEX defect #53025 :
				//		Apply acceptType attribute on each new column.
				node = domConstruct.create("div", {
					'class': "gridContainerZone dojoxDndArea fpGridContainerZone" ,
					'accept': accept,
					columnIndex: i,
					'id': this.id + "_dz" + this.nbZones
				});

				length = grid.length;

				if(isRightMode){
					if(this.isRightFixed){
						index = length - 1;
						grid.splice(index, 0, {
							'node': grid[index].node.parentNode.insertBefore(node, grid[index].node)
						});
					}
					else{
						index = length;
						grid.push({ 'node': this.gridNode.appendChild(node) });
					}
				}
				else{
					if(this.isLeftFixed){
						index = (length == 1) ? 0 : 1;
						this._grid.splice(1, 0, {
							'node': this._grid[index].node.parentNode.appendChild(node, this._grid[index].node)
						});
						index = 1;
					}
					else{
						index = length - this.nbZones;
						this._grid.splice(index, 0, {
							'node': grid[index].node.parentNode.insertBefore(node, grid[index].node)
						});
					}
				}
				if(this.hasResizableColumns){
					//Add a grip to resize columns
					if((!isRightMode && this.nbZones != 1) ||
							(!isRightMode && this.nbZones == 1 && !this.isLeftFixed) ||
								(isRightMode && i < nbColumns-1) ||
									(isRightMode && i == nbColumns-1 && this.isRightFixed)){
						this._createGrip(index);
					}
				}
				// register tnbZoneshe new area into the areaManager
				m.registerByNode(grid[index].node);
				this.nbZones++;
			}
			this._updateColumnsWidth(m);
		},

		_deleteColumn: function(/*Array*/indices){
			var child, grid, index,
				nbDelZones = 0,
				length = indices.length,
				m = this._dragManager;
			for(var i = 0; i < length; i++){
				index = (this.mode == "right") ? indices[i] : indices[i] - nbDelZones;
				grid = this._grid[index];

				if(this.hasResizableColumns && grid.grip){
					array.forEach(grid.gripHandler, function(handler){
						connect.disconnect(handler);
					});
					domConstruct.destroy(this.domNode.removeChild(grid.grip));
					grid.grip = null;
				}

				m.unregister(grid.node);
				domConstruct.destroy(this.gridNode.removeChild(grid.node));
				this._grid.splice(index, 1);
				this.nbZones--;
				nbDelZones++;
			}

			// last grip
			var lastGrid = this._grid[this.nbZones-1];
			if(lastGrid.grip){
				array.forEach(lastGrid.gripHandler, connect.disconnect);
				domConstruct.destroy(this.domNode.removeChild(lastGrid.grip));
				lastGrid.grip = null;
			}

			this._updateColumnsWidth(m);
		},

		_updateColumnsWidth: function(/*Object*/ manager){
			this.inherited(arguments);
			manager._dropMode.updateAreas(manager._areaList);
		},

		destroy: function(){
			connect.unsubscribe(this._dropHandler);
			
			//TODO
            
			this.inherited(arguments);
		},
		
		getMetadata_Items: function(context){
			this.metadata_items = {};
			
			//card item positions
			if(this.childItemMaps && !_FlipCardUtils.isObjectEmpty(this.childItemMaps)){
				for(var itemName in this.childItemMaps){
					var cardWidget = this.childItemMaps[itemName];
					this.metadata_items[itemName] = this.getCardItemPos(cardWidget);
				}
			}
			
			if(context){
				return baseJson.toJson(this.metadata_items);
			}else{
				return this.metadata_items;
			}
		},
		
		getMetadata: function(context){
			this.metadata = {
				id: this.containerId,
				name: this.containerName,
				title: this.containerTitle,
				type: this.containerType,
				relations: this.relations,
				props:{
					hasResizableColumns: this.hasResizableColumns,
					liveResizeColumns : this.liveResizeColumns,
					dockVisible: this.dockVisible,
					dockBehavior: this.dockBehavior,
					minColWidth: this.minColWidth,
					minChildWidth: this.minChildWidth,
					nbZones: this.nbZones,
					mode: this.mode,
					isRightFixed: this.isRightFixed,
					isLeftFixed: this.isLeftFixed,
					layoutMode: this.layoutMode,
					dragHandleClass:this.dragHandleClass,
					defaultCardItemWidth: this.defaultCardItemWidth,
					defaultCardItemHeight: this.defaultCardItemHeight,
					showContentHeader: this.showContentHeader,
					containerType: this.containerType,
					editDisabled: this.editDisabled,
					maxItemSwitchMode: this.maxItemSwitchMode,
					animationDuration: this.animationDuration,
					css3AnimationDisabled: this.css3AnimationDisabled,
					//positions are saved, no need to re-organize
					isAutoOrganized: false
				}
			};
			
			//header
			if(this.headerParams && !_FlipCardUtils.isObjectEmpty(this.headerParams)){
				this.metadata.props.headerParams = this.headerParams;
				var headerHref = this.headerContainer.get("href");
				if(headerHref){
					this.metadata.props.headerParams.href = headerHref;
				}else{
					this.metadata.props.headerParams.content = this.headerContainer.get("content");
				}
			}
			
			//card item positions
			if(this.childItemMaps && !_FlipCardUtils.isObjectEmpty(this.childItemMaps)){
				this.metadata.items = [];
				for(var itemName in this.childItemMaps){
					var cardWidget = this.childItemMaps[itemName];
					var cardItemMetadata = cardWidget.getMetadata();
					
					lang.mixin(cardItemMetadata, this.getCardItemPos(cardWidget));
					
					this.metadata.items.push(cardItemMetadata);
				}
			}
			
			if(context){
				return baseJson.toJson(this.metadata);
			}else{
				return this.metadata;
			}
		},
		
		getCardItemPos: function(cardWidget){
			var itemPos = {};
			
			//get the new position info after dnd
			itemPos.itemGeomProps = domGeom.getMarginBox(cardWidget.domNode);
			if(this.layoutMode == "absolute" || this.layoutMode == "floating"){
				//TODO
			}else{
				itemPos.itemPosition = {
					column: cardWidget.get("column"), 
					p: this.getItemPosIndex(cardWidget)
				}
			}
			
			return itemPos;
		},
		
		getItemPosIndex: function(item){
			var node = item.domNode, position = 0;
			while(node.previousSibling){
				position++;
				node = node.previousSibling;
			}
			item.set("p", position);
			return position;
		}
		
	});
	
});