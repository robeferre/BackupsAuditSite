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
	
	"dojox/html/_base",
	
	"idx/layout/_FlipCardUtils",
	
	"dojo/text!./templates/NavigationPane.html",
	"dojo/text!./templates/_FlipCardNavBase.html",
	"dojo/i18n!./nls/_FlipCardNavBase"
	
], function(kernel, array, declare, htmlUtil, connect, event, lang, winUtil, baseJson, has, 
		xhrUtil, NodeList, baseFx, coreFx, easingUtil,
		dom, domAttr, domClass, domStyle, domConstruct, domGeom, i18n, keys, topic, on, windowLib, 
		ready, cache, text, query, mouse, touch, cookie, json, hash,
		filterUtil, locale, ItemFileWriteStore, Memory, DataStore,
		registry, wai, manager, baseFocus, a11y, focus, _WidgetBase, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, 
		Viewport, Button, _Contained, _Container, _LayoutWidget, ContentPane, BorderContainer, 
		dojoxHtmlUtil, _FlipCardUtils,
		navTemplate, template
	){
	
	
	kernel.experimental("idx/layout/_FlipCardNavBase");
	
	
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
	
	var _doLater = function(/*anything*/conditional,/*Object ?*/context, /* Number ? */interval){
		// example:
		//	| setTimeout(function(){
		//	| 		if(dojox.timing.doLater(app.ready)){return;}
		//	| 		console.log("Code is ready! anonymous.function SUCCESS")
		//	| 	},700);

		if(conditional){ return false; }  // Boolean
		var callback = _doLater.caller,
			args = _doLater.caller.arguments;
		interval = interval || 100;
		context = context || dojo.global;
		
		setTimeout(function(){
			callback.apply(context, args);
		},interval);
		return true; // Boolean
	};
	
	
	
	var _ContentPane = declare("idx/layout/_ContentPane", ContentPane, {
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
            
            // this.own(on(this.domNode, "keydown", lang.hitch(this, "_onKey")));
            
            //a11y
            domAttr.set(this.domNode, {
				tabIndex: -1
			});
        },
        
        _getFocusItems: function(){
            // summary:
            //      Finds focusable items in pane container,
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
    
    
	
	
	var _ExpandoPane = declare("idx/layout/_ExpandoPane", [ContentPane, _TemplatedMixin, _Contained, _Container], {
		attributeMap: lang.delegate(ContentPane.prototype.attributeMap, {
			title: { node: "titleNode", type: "innerHTML" }
		}),
		templateString: navTemplate,
		easeOut: "baseFx._DefaultEasing",
		easeIn: "baseFx._DefaultEasing",
		duration: 420,
		startExpanded: true,
		previewOpacity: 0.75,
		previewOnDblClick: false,
		tabIndex: "0",
		_setTabIndexAttr: "iconNode",
		baseClass: "dijitExpandoPane",
		miniModeHeight: "50%",
		
		postCreate: function(){
			this.inherited(arguments);
			this._animConnects = [];
			this._isHorizontal = true;
			
			if(lang.isString(this.easeOut)){
				this.easeOut = lang.getObject(this.easeOut);
			}
			if(lang.isString(this.easeIn)){
				this.easeIn = lang.getObject(this.easeIn);
			}
		
			var thisClass = "", rtl = !this.isLeftToRight();
			if(this.region){
				switch(this.region){
					case "trailing" :
					case "right" :
						thisClass = rtl ? "Left" : "Right";
						this._needsPosition = "left";
						break;
					case "leading" :
					case "left" :
						thisClass = rtl ? "Right" : "Left";
						break;
					case "top" :
						thisClass = "Top";
						break;
					case "bottom" :
						this._needsPosition = "top";
						thisClass = "Bottom";
						break;
				}
				domClass.add(this.domNode, "dojoxExpando" + thisClass);
				domClass.add(this.iconNode, "dojoxExpandoIcon" + thisClass);
				this._isHorizontal = /top|bottom/.test(this.region);
			}
			domStyle.set(this.domNode, {
				overflow: "hidden",
				padding:0
			});
			
			this.connect(this.domNode, "ondblclick", this.previewOnDblClick ? "preview" : "toggle");
			this.iconNode.setAttribute("aria-controls", this.id);
			if(this.previewOnDblClick){
				this.connect(this.getParent(), "_layoutChildren", lang.hitch(this, function(){
					this._isonlypreview = false;
				}));
			}
			
			
			this.own(on(this.iconPersistenceNode, touch.press, lang.hitch(this, function(evt){
				this.togglePersistence();
			})));
			//a11y
			this.own(on(this.iconPersistenceNode, "keydown", lang.hitch(this, function(evt){
				if(evt.keyCode == keys.ENTER){
					this.togglePersistence();
				}
			})));
			
			//a11y
			this.domNode.setAttribute("role", "tabpanel");
		},
		
		togglePersistence: function(force){
			this.persistence = force || !this.persistence;
			domClass.toggle(this.iconPersistenceNode, "persistence", force);
		},
		
		_startupSizes: function(){
			this._container = this.getParent();
			this._titleHeight = domGeom.getMarginBox(this.titleWrapper).h;
			this._closedSize = 0;
			
			if(this.splitter){
				var myid = this.id;
				array.forEach(registry.toArray(), function(w){
					if(w && w.child && w.child.id == myid){
						this.connect(w,"_stopDrag","_afterResize");
					}
				}, this);
			}
			
			this._currentSize = domGeom.getContentBox(this.domNode);	// TODO: can compute this from passed in value to resize(), see _LayoutWidget for example
			this._showSize = this._currentSize[(this._isHorizontal ? "h" : "w")];
			if(has("phone")){
				this._showSize = 200;
			}
			this._setupAnims();
	
			if(this.startExpanded){
				this._showing = true;
			}else{
				this._showing = false;
				this._hideWrapper();
				this._hideAnim.gotoPercent(99,true);
			}
			
			this.domNode.setAttribute("aria-expanded", this._showing);
			this._hasSizes = true;
		},
		
		_afterResize: function(e){
			var tmp = this._currentSize;						// the old size
			this._currentSize = domGeom.getMarginBox(this.domNode);	// the new size
			var n = this._currentSize[(this._isHorizontal ? "h" : "w")];
			if(n > this._titleHeight){
				if(!this._showing){
					this._showing = !this._showing;
					this._showEnd();
				}
				this._showSize = n;
				this._setupAnims();
			}else{
				this._showSize = tmp[(this._isHorizontal ? "h" : "w")];
				this._showing = false;
				this._hideWrapper();
				this._hideAnim.gotoPercent(89,true);
			}
		},
		
		_setupAnims: function(){
			array.forEach(this._animConnects, connect.disconnect);
			
			var _common = {
					node:this.domNode,
					duration:this.duration
				},
				isHorizontal = this._isHorizontal,
				showProps = {},
				showSize = this._showSize,
				hideSize = this._closedSize,
				hideProps = {},
				dimension = isHorizontal ? "height" : "width",
				also = this._needsPosition
			;
	
			showProps[dimension] = {
				end: showSize
			};
			hideProps[dimension] = {
				end: hideSize
			};
			
			if(also){
				showProps[also] = {
					end: function(n){
						var c = parseInt(n.style[also], 10);
						return c - showSize + hideSize; 
					}
				}
				hideProps[also] = {
					end: function(n){
						var c = parseInt(n.style[also], 10);
						return c + showSize - hideSize;
					}
				}
			}
			
			this._showAnim = baseFx.animateProperty(lang.mixin(_common,{
				easing:this.easeIn,
				properties: showProps
			}));
			this._hideAnim = baseFx.animateProperty(lang.mixin(_common,{
				easing:this.easeOut,
				properties: hideProps
			}));
	
			this._animConnects = [
				connect.connect(this._showAnim, "onEnd", this, "_showEnd"),
				connect.connect(this._hideAnim, "onEnd", this, "_hideEnd")
			];
		},
		
		preview: function(){
			if(!this._showing){
				// this._isonlypreview = !this._isonlypreview;
				this._isonlypreview = true;
			}
			this.toggle();
		},
	
		toggle: function(){
			if(this.persistence && this._showing){return;}
			if(this._showing){
				this._hideWrapper();
				this._showAnim && this._showAnim.stop();
				this._hideAnim.play();
			}else{
				this._hideAnim && this._hideAnim.stop();
				this._showAnim.play();
			}
			this._showing = !this._showing;
			this.domNode.setAttribute("aria-expanded", this._showing);
		},
		
		_hideWrapper: function(){
			//TODO
		},
		
		_showEnd: function(){
			if(!this._isonlypreview){
				setTimeout(lang.hitch(this._container, "layout"), 15);
			}else{
				this._previewShowing = true;
				this.resize();
			}
		},
		
		_hideEnd: function(){
			if(!this._isonlypreview){
				setTimeout(lang.hitch(this._container, "layout"), 25);
			}else{
				this._previewShowing = false;
				setTimeout(lang.hitch(this._container, "layout"), 25);
			}
			this._isonlypreview = false;
		},
		
		resize: function(/*Object?*/newSize){
			if(!this._hasSizes){ this._startupSizes(newSize); }
			
			//keep mini mode
			domStyle.set(this.domNode, "top", this._isMiniMode?this.miniModeHeight:0);
			
			var currentSize = domGeom.getMarginBox(this.domNode);
			this._contentBox = {
				w: newSize && "w" in newSize ? newSize.w : currentSize.w,
				h: (newSize && "h" in newSize ? newSize.h : currentSize.h) - this._titleHeight
			};
			domStyle.set(this.containerNode, "height", this._contentBox.h + "px");
	
			if(newSize){
				domGeom.setMarginBox(this.domNode, newSize);
			}
	
			this._layoutChildren();
			this._setupAnims();
		},
		
		_trap: function(/*Event*/ e){
			event.stop(e);
		},
		
		setPreviewMode: function(preview, mini){
			this._isonlypreview = preview || false;
			this._isMiniMode = mini || false;
			domStyle.set(this.domNode, "top", this._isMiniMode?this.miniModeHeight:0);
		}
		
	});
	
	
	
	//stub dijit border container
	var _BorderContainer = declare("idx/layout/_BorderContainer", [BorderContainer], {
		//TODO
	});
	
	
	
	
	// module:
	//		idx/layout/_FlipCardNavBase
	// summary:
	//		navigation base for different navigator types

	/**
	* @name idx.layout._FlipCardNavBase
	* @class navigation base for different navigator types
	* @augments dijit._Widget
	* @augments dijit._TemplatedMixin
	* @augments dijit._WidgetsInTemplateMixin
	* @augments dijit._CssStateMixin
	*/ 
	
	return declare("idx/layout/_FlipCardNavBase", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin], {
		/**@lends idx.layout._FlipCardNavBase*/ 
		// summary:
		//		navigation base for different navigator types
		//
		
		templateString: template,
		
		baseClass: "idxFlipCardNavBase",
		
		
		// idProperty: String
		//		Indicates the property to use as the identity property. The values of this
		//		property should be unique.
		idProperty: "id",
		
		// labelAttr: String
		//		Get label from the model using this attribute
		labelAttr: "name",
		
		// labelType: [const] String
		//		Specifies how to interpret the labelAttr in the data store items.
		//		Can be "html" or "text".
		labelType: "text",
		
		// childrenAttrs: String[]
		//		One or more attribute names (attributes in the store item) that specify that item's children
		childrenAttr: "children",
		
		// typeAttr: String[]
		//		type attribute
		typeAttr: "type",
		
		// pressHandlerAttr: String[]
		//		press handler function name
		pressHandlerAttr: "pressHandler",
		
		// cssStateNodes: {
			// "navBar": "idxFlipCardNavBar"
		// },
		
		// navList: [],
		
		// doInitNavItem: Boolean
        //      whether to setup an init nav item.
		doInitNavItem: true,
		
		// customContent: String | reference
        //      the content that user want to import.
		customContent: "",
		
		// customDistribute: Function
        //      override the event distribute way of navigator.
		customDistribute: null,
		
		// navBarDisplayed: Boolean
		//		current nav bar display status.
		navBarDisplayed: true,
		
		// toggleNavBarAction: Boolean
		//		toggle to show the nav bar.
		toggleNavBarAction: false,
		
		// toggleNavBarOnHover: Boolean
		//		toggle to show the nav bar when mouse hover, only for desktop device.
		toggleNavBarOnHover: true,
		
		// navBarWidth: Integer
		//		width of the navigator.
		navBarWidth: 38,
		
		// navBarExtendedWidth: Integer
		//		toggle to extend the nav bar width in px.
		navBarExtendedWidth: 200,
		
		// navActionHeight: Integer
		//		action node height (px)
		navActionHeight: 30,
		
		animationDuration: 300,
		css3AnimationDisabled: false,
		
		defaultNavToggleMethod: "preview", //toggle, preview
		
		/** @ignore */
		postMixInProperties: function(){
			this.inherited(arguments);
			
			this._nlsResources = i18n.getLocalization("idx/layout", "_FlipCardNavBase");
			this.navTitle = this.navTitle || this._nlsResources.FlipCardNavBaseTitle;
			
			this.navBarWidth = this.navBarWidth || 38;
			this.defaultNavToggleMethod = this.defaultNavToggleMethod || "toggle";
			
			this.navActionNodes = {};
			this.navActionCtnHeight = 0;
			
			this.navListNodes = {};
			this.navAllNodes = {};
			this.expandoContentPanes = {};
			this.currentNavigationItem = {};
			this.currentExpandoItem = {};
			this.previousItem = {};
			
			//navigation items' store, should be handle per navigation type
			this.navListData = [];
			this.navListStore = null;
		},

		/** @ignore */
		postCreate: function(){
			this.inherited(arguments);
			
			this.animationDurationHeritage = this.animationDuration;
			this.applyAnimationDuration();
			//TODO
		},
		
		/** @ignore */
		startup: function(){
			if(this._started){ return; }
			
			this.inherited(arguments);
			
			this.initNavAll();
		},
		
		initNavAll: function(){
			this.initNavActions();
			
			this.initNavigation();
			
			this.initNavItem();
			
			this.initContent();
			
			//handle css3 animation flag
			this.toggleCSS3Animation(this.css3AnimationDisabled);
			
			// this.own(on(this.navBar, "keydown", lang.hitch(this, "_onKey")));
		},
		
		_getFocusItems: function(){
            // summary:
            //      Finds focusable items in grid container,
            //      and sets this._firstFocusItem and this._lastFocusItem
            // tags:
            //      protected

            var elems = a11y._getTabNavigable(this.navBar);
            this._firstFocusItem = elems.lowest || elems.first || this.navBar;
            this._lastFocusItem = elems.last || elems.highest || this._firstFocusItem;
        },
        
        _onKey: function(/*Event*/ evt){
            // summary:
            //      Handles the keyboard events for accessibility reasons
            // tags:
            //      private

            if(evt.keyCode == keys.TAB){
                this._getFocusItems(this.navBar);
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
		
		/** @ignore */
		_cssMouseEvent: function(node, clazz, evt, forceClose){
			if(this.disabled || this.readOnly || !evt || !evt.type){
				return;
			}
			if(forceClose){
				hover(false);
				active(false);
				focused(false);
				return;
			}

			function hover(isHovering){
				domClass.toggle(node, clazz + "Hover", isHovering);
			}

			function active(isActive){
				domClass.toggle(node, clazz + "Active", isActive);
			}

			function focused(isFocused){
				domClass.toggle(node, clazz + "Focused", isFocused);
			}

			switch(evt.type){
				case "mouseover":
				case "MSPointerOver":
					hover(true);
					break;
				case "mouseout":
				case "MSPointerOut":
					hover(false);
					active(false);
					break;
				case "mousedown":
				case "touchstart":
				case "MSPointerDown":
				case "keydown":
					active(true);
					break;
				case "mouseup":
				case "MSPointerUp":
				case "dojotouchend":
				case "keyup":
					active(false);
					break;
				case "focus":
				case "focusin":
					focused(true);
					break;
				case "blur":
				case "focusout":
					focused(false);
					break;
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
			
			this.applyAnimationDuration();
		},
		
		applyAnimationDuration: function(){
			this.expandoNode.duration = this.animationDuration;
		},
		
		toggleNavBarExtend: function(forceShowHide){
			if(forceShowHide !== undefined){
				this.navBarExtended = forceShowHide ? true : false;
			}else{
				this.navBarExtended = !this.navBarExtended;
			}
			domClass.toggle(this.navBar, "idxFlipCardNavBarExtended", this.navBarExtended);
			domStyle.set(this.navBar, {
				width: (this.navBarExtended ? this.navBarExtendedWidth : this.navBarWidth) + "px"
			});
			//for pluggable ui's content
			domStyle.set(this.contentNode, {
				left: (this.navBarExtended ? this.navBarExtendedWidth : this.navBarWidth) + "px"
			});
			
			// domClass[this.navBarExtended?"add":"remove"](this.domNode, "FlipCardContainerNoScroll");
		},
		
		initNavActions: function(){
			if(this.toggleNavBarAction){
				var toggleNavBarActNode = this.buildNavActionItem({
					id:"toggleNavBarAction", name:"toggleNavBarAction", //name: "toggle_action", title:"Toggle Action", 
					iconClass:"toggleNavBarActionIcon",  descClass:"toggleNavBarActionDesc"
				});
				this.own(on(toggleNavBarActNode, touch.press, lang.hitch(this, function(evt){
					this.toggleNavBarExtend();
				})));
				if(this.toggleNavBarOnHover){
					this.own(on(toggleNavBarActNode, touch.enter, lang.hitch(this, function(evt){
						this.toggleNavBarExtend(true);
					})));
				}
				
				//a11y
				this.own(on(toggleNavBarActNode, "keydown", lang.hitch(this, function(evt){
					if(evt.keyCode == keys.ENTER){
						this.toggleNavBarExtend();
					}
				})));
			}
		},
		
		buildNavActionItem: function(item, refNode, position){
			var itemId = item[this.idProperty];
			if(!itemId){return}
			
			var parentNode = this.navBarActions;
			var itemNode = domConstruct.create("li", {
				className: "navAction " + (item.itemClass || ""),
				tabIndex: 0
			});
			domStyle.set(itemNode, {
				height: this.navActionHeight + "px"
			});
			if(refNode){
				domConstruct.place(itemNode, refNode, position||"before");
			}else{
				domConstruct.place(itemNode, parentNode);
			}
			
			itemNode.setAttribute("aria-controls", this.expandoNode.id);
			
			var descNode = domConstruct.create("span", {
				innerHTML: item[this.labelAttr] || "",
				className: "navActionDesc " + (item.descClass || "")
			}, itemNode);
			
			var iconContainerNode = domConstruct.create("span", {
				className: "navActionIconContainer " + (item.containerClass || "")
			}, itemNode);
			var iconNode = domConstruct.create("div", {
				title: item[this.labelAttr] || item[this.idProperty] || "",
				className: "navActionIcon " + (item.iconClass || "defaultNavActionIcon")
			}, iconContainerNode);
			//a11y
			var a11yNode = domConstruct.create("div", {
				innerHTML: "->",
				className: "navActionIcon_a11y"
			}, iconNode);
			
			this.navActionNodes[itemId] = itemNode;
			this.navActionCtnHeight += this.navActionHeight;
			
			return itemNode;
		},
		
		buildRootNavItem: function(item, refNode, position){
			var itemId = this.navListModel.getIdentity(item);
			
			var parentNode = (item[this.typeAttr] == "settings") ? this.navBarBottom : this.navBarTop;
			var itemNode = domConstruct.create("li", {
				className: "navItem " + (item.itemClass || ""),
				tabIndex: 0
			});
			if(refNode){
				domConstruct.place(itemNode, refNode, position||"before");
			}else{
				domConstruct.place(itemNode, parentNode);
			}
			itemNode.setAttribute("role", "tab");
			
			var iconContainerNode = domConstruct.create("span", {
				className: "navItemIconContainer " + (item.containerClass || "")
			}, itemNode);
			var iconNode = domConstruct.create("img", {
				src: item.icon,
				title: item[this.labelAttr] || "",
				className: "navItemIcon " + (item.iconClass || "defaultNavItemIcon")
			}, iconContainerNode);
			
			iconNode.setAttribute("alt", itemId);
			
			var descNode = domConstruct.create("span", {
				innerHTML: item[this.labelAttr] || "",
				title: item[this.labelAttr] || "",
				className: "navItemDesc " + (item.descClass || "")
			}, itemNode);
			
			this._trackMouseState(itemNode, "navItem");
			
			this.navListNodes[itemId] = itemNode;
			
			return itemNode;
		},
		
		/** @ignore */
		buildNavList: function(item){
			if(item[this.childrenAttr]){
				this.navListData = this.navListData.concat(item[this.childrenAttr]);
				array.forEach(item[this.childrenAttr], function(dItem){
					this.buildNavList(dItem);
				}, this);
			}
		},
		
		buildNavListData: function(navList){
			this.navListData = [];
			navList = navList || this.navList;
			var navListClone = lang.clone(navList);
			this.navListData = this.navListData.concat(navListClone);
			//build all nav page id store
			array.forEach(navListClone, function(item){
				if(item[this.childrenAttr]){
					this.navListData = this.navListData.concat(item[this.childrenAttr]);
					array.forEach(item[this.childrenAttr], function(dItem){
						this.buildNavList(dItem);
					}, this);
				}
				item.rootLevel = true;
			}, this);
			
			return this.navListData;
		},
		
		/** @ignore */
		initNavigation: function(){
			//nav bar position
			domStyle.set(this.navBarTop, {
				top: this.navActionCtnHeight + "px"
			})
		},
		
		handleNavSelectionExtra: function(model){
		    if(this.selectedNavItemId){
		    	for(var id in this.navListNodes){
					domClass.remove(this.navListNodes[id], "navItemSelected");
				}
		    	if(this.navListNodes[this.selectedNavItemId]){
		    		domClass.add(this.navListNodes[this.selectedNavItemId], "navItemSelected");
		    	}
                //navigation bar
                var selectedNavItem = (model||this.navListModel)["getItem"](this.selectedNavItemId);
                if(selectedNavItem){
                    if(selectedNavItem[this.childrenAttr]){
                        domClass.toggle(this.navBar, "navExpandoSelected", this.expandoNode._showing);
                    }else{
                        domClass.remove(this.navBar, "navExpandoSelected");
                        domClass.add(this.navBar, "navSelected");
                    }
                }
		    }
		},
		
		initNavItem: function(){
			if(_doLater(!_FlipCardUtils.isObjectEmpty(this.navListNodes), this, 300)){return;}
			
			//TODO common initialization
			//nav nodes selection
			for(var navId in this.navListNodes){
				var navNode = this.navListNodes[navId];
				this.own(on(navNode, touch.press, lang.hitch(this, function(node, nId, evt){
					// this._cssMouseEvent(this.navBar, "idxFlipCardNavBar", evt, true);
					this.selectedNavItemId = nId;
					this.handleNavSelectionExtra();
				}, navNode, navId)));
				//a11y
				this.own(on(navNode, "keydown", lang.hitch(this, function(node, nId, evt){
					if(evt.keyCode == keys.ENTER){
						this.selectedNavItemId = nId;
						this.handleNavSelectionExtra();
					}
				}, navNode, navId)));
			}
			
			this.toggleNavBarDisplay(this.navBarDisplayed);
		},
		
		
		handleNavigationDistributeById: function(itemId, e, args){
			var navRootItem = {};
			navRootItem[this.idProperty] = this.selectedNavItemId;
			
		    var currentItem = ((args&&args.model)||this.navListModel)["getItem"](itemId || this.initItemId, navRootItem);
		    this.handleNavigationDistribute(currentItem, e);
        },
		
		handleNavigationDistribute: function(item, e, args){
		    if(item){
    		    if(this.customDistribute && lang.isFunction(this.customDistribute)){
    		        this.customDistribute.apply(this, arguments);
    		        //remember to call these setting in custom method
    		        // (!item[this.childrenAttr]) && (this.currentNavigationItem = item);
                    // this.handleNavSelectionExtra();
    		    }else{
    		        this.handleNavigationDstrProcess(item, e, args);
    		    }
		    }
		    this.toggleNavBarExtend(false);
		},
		
		handleNavigationDstrProcessById: function(itemId, e, args){
			var navRootItem = {};
			navRootItem[this.idProperty] = this.selectedNavItemId;
			
		    var currentItem = ((args&&args.model)||this.navListModel)["getItem"](itemId || this.initItemId, navRootItem);
            this.handleNavigationDstrProcess(currentItem, e);
		},
		
		handleNavigationDstrProcess: function(item, e, args){
		    if(item){
                if(this.navListModel.isRootLevelItem(item) && item[this.childrenAttr]){
            		if(args && args.customExpandoHandler && lang.isFunction(args.customExpandoHandler)){
                        args.customExpandoHandler.apply(this, arguments);
                    }else{
                        this.handleNavigationExpando(item, e);
                    }
                    this.handleExpandoAction(item, e, {node:this.expandoNode});
                }else{
                    if(this.expandoNode && this.expandoNode._showing && item[this.typeAttr] != "separator"){
                        this.expandoNode[this.defaultNavToggleMethod]();
                    }
                }
                
                if(item[this.typeAttr] == "nav"){
                    if(args && args.customNavHandler && lang.isFunction(args.customNavHandler)){
                        args.customNavHandler.apply(this, arguments);
                    }else{
                        if(item[this.pressHandlerAttr] && lang.isFunction(item[this.pressHandlerAttr])){
                            item[this.pressHandlerAttr].apply(this, arguments);
                        }
                    }
                    this.handleNavAction(item, e);
                }else if(item[this.typeAttr] == "settings"){
                    if(args && args.customSettingsHandler && lang.isFunction(args.customSettingsHandler)){
                        args.customSettingsHandler.apply(this, arguments);
                    }else{
                        if(item[this.pressHandlerAttr] && lang.isFunction(item[this.pressHandlerAttr])){
                            item[this.pressHandlerAttr].apply(this, arguments);
                        }
                    }
                    this.handleSettingsAction(item, e);
                }else if(item[this.typeAttr] == "separator"){
                	this.handleSeparatorAction(item, e);
                }
                
                if(this.navListModel.isRootLevelItem(item)){
                	if(item[this.childrenAttr]){
                		//TODO
                	}else{
                		this.currentNavigationItem = item;
                	}
                }else{
                	if(item[this.typeAttr] == "separator"){
                		//TODO
                	}else{
                		this.currentNavigationItem = item;
                	}
                }
            }else{
                console.log(this.navTitle);
            }
            this.toggleNavBarExtend(false);
		},
		
		//for expando
		handleExpandoAction: function(item, e, args){
			//TODO
			this.handleExpandoAction_stub(item, e, args);
		},
		//stub function to be connected
		handleExpandoAction_stub: function(item, e, args){
			//TODO
		},
		
		
		//for actions
		handleNavAction: function(item, e){
			//TODO
			
			this.handleNavAction_stub(item, e);
			this.handleAllAction_stub(item, e);
		},
		//stub function to be connected
		handleNavAction_stub: function(item, e){
			//TODO
		},
		handleSettingsAction: function(item, e){
			//TODO
			
			this.handleSettingsAction_stub(item, e);
			this.handleAllAction_stub(item, e);
		},
		//stub function to be connected
		handleSettingsAction_stub: function(item, e){
			//TODO
		},
		//stub function to be connected
		handleAllAction_stub: function(item, e){
			//TODO
		},
		
		
		handleSeparatorAction: function(item, e){
			//TODO
			this.handleSeparatorAction_stub(item, e);
		},
		handleSeparatorAction_stub: function(){
			//TODO
		},
		
		
		
		_getCurrentNavItemAttr: function(){
		    return this.currentNavigationItem;
		},
		
		_setCurrentNavItemAttr: function(item){
            this.currentNavigationItem = item;
        },
        
        /** @ignore */
		toggleNavBarDisplay: function(forceShow){
			if(forceShow !== undefined){
				this.navBarDisplayed = forceShow ? true : false;
			}else{
				this.navBarDisplayed = !this.navBarDisplayed;
			}
			
			this.toggleNavBarExtend(false);
			if(this.navBarDisplayed){
				domStyle.set(this.navBar, "width", this.navBarWidth+"px");
				domStyle.set(this.contentNode, "left", this.navBarWidth+"px");
				
				var contentWidth = parseInt(domStyle.get(this.contentNode, "width"));
				if(typeof contentWidth == "number"){
					domStyle.set(this.contentNode, "width", (contentWidth-this.navBarWidth) +"px");
				}
			}else{
				domStyle.set(this.navBar, "width", "0px");
				domStyle.set(this.contentNode, "left", "0px");
				
				var contentWidth = parseInt(domStyle.get(this.contentNode, "width"));
				if(typeof parseInt(contentWidth) == "number"){
					domStyle.set(this.contentNode, "width", (contentWidth+this.navBarWidth) +"px");
				}
			}
			
			if(this.expandoNode._showing){
				this.expandoNode[this.defaultNavToggleMethod]();
			}
		},
		
		/** @ignore */
		handleNavigationExpando: function(item, e){
			//for mobile platform
			var isSettings = (item[this.typeAttr] == "settings");
			if(has("phone")){
				this.expandoNode.setPreviewMode(true, isSettings);
			}else{
				this.expandoNode.setPreviewMode(isSettings, isSettings);
			}
			if(this.currentExpandoItem[this.idProperty] == item[this.idProperty]){
				this.expandoNode[this.defaultNavToggleMethod]();
			}else{
				this.currentExpandoItem = item;
				if(this.expandoNode._showing){
					this.expandoNode[this.defaultNavToggleMethod]();
				}
				for(var ecPaneId in this.expandoContentPanes){
					var ecPane = this.expandoContentPanes[ecPaneId];
					domStyle.set(ecPane.domNode, "display", "none");
				}
				if(this.expandoContentPanes[item[this.idProperty]]){
					domStyle.set(this.expandoContentPanes[item[this.idProperty]].domNode, "display", "");
					this.expandoNode.set("title", item[this.labelAttr]);
					this.expandoNode[this.defaultNavToggleMethod]();
				}
			}
		},
		
		initContent: function(){
			if(this.customContent){
				this.containerNode.set("content", this.customContent);
			}
        },
		
		destroy: function(){
			//TODO
			
            this.inherited(arguments);
        }
	
	});
});