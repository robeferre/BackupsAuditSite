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
	"dojo/request",
	"dojo/request/xhr",
	
	"dojo/date/locale",
	"dojo/data/util/filter", 
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
	"dijit/Dialog", 
	"dijit/layout/TabContainer", 
	"dijit/TitlePane", 
	
	"dojox/fx",
	"dojox/fx/flip",
	"dojox/html/_base",
	
	"idx/widget/ModalDialog",
	
	"idx/layout/_FlipCardUtils",
	"idx/layout/FlipCardNavigator",
	"idx/layout/FlipCardNavDynamic",
	"idx/layout/FlipCardGridContainer",
	"idx/layout/FlipCardItem",
	
	"dojo/text!./templates/FlipCardContainer.html",
	"dojo/i18n!./nls/FlipCardContainer"
	
], function(kernel, array, declare, htmlUtil, connect, event, lang, winUtil, baseJson, has, 
		xhrUtil, NodeList, baseFx, coreFx, easingUtil,
		dom, domAttr, domClass, domStyle, domConstruct, domGeom, i18n, keys, topic, on, windowLib, 
		ready, cache, text, query, mouse, touch, cookie, json, hash, request, xhr,
		locale, filterUtil, ItemFileWriteStore, Memory, DataStore,
		registry, wai, manager, baseFocus, a11y, focus, 
		_WidgetBase, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, 
		Viewport, Button, Menu, MenuItem, CheckedMenuItem, PopupMenuItem, MenuSeparator,
		_Contained, _Container, _LayoutWidget, ContentPane, BorderContainer, Dialog, TabContainer, TitlePane, 
		dojoxFx, flip, dojoxHtmlUtil,
		ModalDialog,
		_FlipCardUtils, FlipCardNavigator, FlipCardNavDynamic, FlipCardGridContainer, FlipCardItem, 
		template
	){
	
	
	kernel.experimental("idx/layout/FlipCardContainer");
	
	
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
	
	
	
	
	var _FCContainerHeader = declare("idx/layout/_FCContainerHeader", [_WidgetBase, _Container, _Contained], {
		
		// label: String
		//		A title text of the heading. If the label is not specified, the
		//		innerHTML of the node is used as a label.
		label: "",

		// iconBase: String
		//		The default icon path for child items.
		iconBase: "",

		// tag: String
		//		A name of HTML tag to create as domNode.
		tag: "h1",
		
		// baseClass: String
		//		The name of the CSS class of this widget.	
		baseClass: "idxFlipCardHeader",
		
		templateString: "",
		
		// rootContainer: Object
		//		flip card container reference.
		rootContainer: null,
		
		postMixInProperties: function(){
			this.inherited(arguments);
			//TODO
		},

		buildRendering: function(){
			if(!this.templateString){ // true if this widget is not templated
				// Create root node if it wasn't created by _TemplatedMixin
				this.domNode = this.containerNode = this.srcNodeRef || winUtil.doc.createElement(this.tag);
			}
			this.inherited(arguments);
			
			if(!this.templateString){ // true if this widget is not templated
				if(!this.label){
					array.forEach(this.domNode.childNodes, function(n){
						if(n.nodeType == 3){
							var v = lang.trim(n.nodeValue);
							if(v){
								this.label = v;
								this.labelNode = domConstruct.create("span", {innerHTML:v}, n, "replace");
							}
						}
					}, this);
				}
				if(!this.labelNode){
					this.labelNode = domConstruct.create("span", null, this.domNode);
				}
				this.labelNode.className = "idxFlipCardHeaderSpanTitle";
				this.labelDivNode = domConstruct.create("div", {
					className: "idxFlipCardHeaderTitle",
					innerHTML: this.labelNode.innerHTML
				}, this.domNode);
			}

			if(this.labelDivNode){
				domAttr.set(this.labelDivNode, "role", "heading"); //a11y
				domAttr.set(this.labelDivNode, "aria-level", "1");
			}

			dom.setSelectable(this.domNode, false);
		},
		
		/** @ignore */
		postCreate: function(){
			this.inherited(arguments);
			
			//add detail actions for header
			this.navToggleButton = new Button({
				label: "<-",
				showLabel: false,
				baseClass: "dijitButton idxButtonCompact idxFlipCardHeaderButton",
				iconClass: "navToggleIcon"
			});
			this.addChild(this.navToggleButton);
			
			this.own(on(this.navToggleButton, touch.press, lang.hitch(this, function(evt){
				if(this.rootContainer && this.rootContainer.navigationWidget){
					this.rootContainer.navigationWidget.toggleNavBarDisplay();
				}
			})));
			//a11y
			this.own(on(this.navToggleButton, "keydown", lang.hitch(this, function(evt){
				if(evt.keyCode == keys.ENTER){
					if(this.rootContainer && this.rootContainer.navigationWidget){
						this.rootContainer.navigationWidget.toggleNavBarDisplay();
					}
				}
			})));
		},

		startup: function(){
			if(this._started){ return; }
			var parent = this.getParent && this.getParent();
			if(!parent || !parent.resize){ // top level widget
				var _this = this;
				_this.defer(function(){ // necessary to render correctly
					_this.resize();
				});
			}
			this.inherited(arguments);
			
			//a11y
			domAttr.set(this.domNode, {
				tabIndex: -1
			});
		},

		resize: function(){
			if(this.labelNode){
				// find the rightmost left button (B), and leftmost right button (C)
				// +-----------------------------+
				// | |A| |B|             |C| |D| |
				// +-----------------------------+
				var leftBtn, rightBtn;
				var children = this.containerNode.childNodes;
				for(var i = children.length - 1; i >= 0; i--){
					var c = children[i];
					if(c.nodeType === 1 && domStyle.get(c, "display") !== "none"){
						if(!rightBtn && domStyle.get(c, "float") === "right"){
							rightBtn = c;
						}
						if(!leftBtn && domStyle.get(c, "float") === "left"){
							leftBtn = c;
						}
					}
				}

				if(!this.labelNodeLen && this.label){
					this.labelNode.style.display = "inline";
					this.labelNodeLen = this.labelNode.offsetWidth;
					this.labelNode.style.display = "";
				}

				var bw = this.domNode.offsetWidth; // bar width
				var rw = rightBtn ? bw - rightBtn.offsetLeft + 5 : 0; // rightBtn width
				var lw = leftBtn ? leftBtn.offsetLeft + leftBtn.offsetWidth + 5 : 0; // leftBtn width
				var tw = this.labelNodeLen || 0; // title width
				domClass[bw - Math.max(rw,lw)*2 > tw ? "add" : "remove"](this.domNode, "mblHeadingCenterTitle");
			}
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},
		
		_setLabelAttr: function(/*String*/label){
			this._set("label", label);
			this.labelNode.innerHTML = this.labelDivNode.innerHTML = this._cv ? this._cv(label) : label;
		}
	});
	
	
	var _ContainerContentPane = declare("idx/layout/_ContainerContentPane", ContentPane, {
		adjustPaths: false,
		cleanContent: false,
		renderStyles: false,
		executeScripts: true,
		scriptHasHooks: false,
		
		_setFocusAttr: "domNode",
	
		ioMethod: xhrUtil.get,
		
		containerType: "pane",
		
		containerId: "",
		containerName: "",
		containerTitle: "",
	
		ioArgs: {},
		
		animationDuration: 1000,
		css3AnimationDisabled: false,
		
		postCreate: function(){
		    this.inherited(arguments);
		    
		    this.animationDurationHeritage = this.animationDuration;
		},
		
		startup: function(){
		    this.inherited(arguments);
		    
		    //handle css3 animation flag
			this.toggleCSS3Animation(this.css3AnimationDisabled);
		    
		    // this.own(on(this.domNode, "keydown", lang.hitch(this, "_onKey")));
		    
		    //a11y
		    domAttr.set(this.domNode, {
				tabIndex: -1
			});
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
        
        getMetadata_Items: function(context){
			this.metadata_items = {};
			
			//TODO analysis the content and get more info
			
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
				props:{
					executeScripts: this.executeScripts,
					scriptHasHooks: this.scriptHasHooks
				}
			};
			
			var href = this.get("href");
			if(href){
				this.metadata.props.href = href;
			}else{
				this.metadata.props.content = this.get("content");
			}
			
			
			if(context){
				return baseJson.toJson(this.metadata);
			}else{
				return this.metadata;
			}
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
	
	
	
	// module:
	//		idx/layout/FlipCardContainer
	// summary:
	//		navigation bar for different page content, each page can be an FlipCardGridContainer or a contentPane

	/**
	* @name idx.layout.FlipCardContainer
	* @class navigation bar for different page content, each page can be an FlipCardGridContainer or a contentPane
	* @augments dijit._Widget
	* @augments dijit._TemplatedMixin
	* @augments dijit._WidgetsInTemplateMixin
	* @augments dijit._CssStateMixin
	*/ 
	
	return declare("idx/layout/FlipCardContainer", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin], {
		/**@lends idx.layout.FlipCardContainer*/ 
		// summary:
		//		navigation bar for different page content, each page can be an FlipCardGridContainer or a contentPane
		//
		//		Example:
		// |	new FlipCardContainer({navList: navigationParams, contentContainerList: contentContainerListParams})
		//
		//		Example:
		// |	<div data-dojo-type='idx.layout.FlipCardContainer' data-dojo-props='navList: navigationParams, contentContainerList: contentContainerListParams'></div>
		
		templateString: template,
		
		baseClass: "idxFlipCardContainer",
		
		// model: String
		//		if equals to view, it will disable the dnd feature.
		model: "edit", //"view", "edit"
		
		// flipCardModelId: String
		//		the key to save the current card layout, e.g. the key to cookie or localStorage/globalStorage.
		flipCardModelId: null,
		
		// includeHeader: Boolean
		//		whether to have header for flip card container.
		includeHeader: false,
		
		// fcContainerTitleHeight: Integer
		//		flip card container's header height.
		fcContainerHeaderHeight: 45,
		
		// navType: String
		//		navigation type.
		navType: "static", //static, dynamic
		
		// fcContainerNavBarWidth: Integer
		//		width of flip card's navigator.
		fcContainerNavBarWidth: 38,
		
		// fcContainerNavBarDisplayed: Boolean
		//		whether to have nav bar displayed.
		fcContainerNavBarDisplayed: true,
		
		// fcCntNavBarToggleAction: Boolean
		//		whether to have nav bar displayed.
		fcCntNavBarToggleAction: false,
		
		defaultCntContainerType: "pane", //pane, grid
		
		// navList: [],
		// contentContainerList: {},
		
		// ignoreInitHash: Boolean
		//		whether to ignore the url hash for initialization.
		ignoreInitHash: false,
		
		// idProperty: String
		//		Indicates the property to use as the identity property. The values of this
		//		property should be unique.
		idProperty: "id",
		
		lazyLoading: false,
		
		//flip card container ref
		// rootContainer: null,
		
		defaultServerPath: "FlipCardSaveData.php",
		defaultFileName: "flipcard_default_metadata.json",
		
		defaultDownloadPath: "FlipCardDownload.php",
		defaultDownloadName: "flipcard_download_metadata.json",
		
		css3AnimationDisabled_nav: false,
		css3AnimationDisabled_container: false,
		css3AnimationDisabled_card: false,
		
		animationDuration: 1000,
		css3AnimationDisabled: false,
		
		/** @ignore */
		postMixInProperties: function(){
			this.inherited(arguments);
			
			this._nlsResources = i18n.getLocalization("idx/layout", "FlipCardContainer");
			this.title = this.title || this._nlsResources.FlipCardContainerTitle;
			this.defaultPageCnt = this.defaultPageCnt || this._nlsResources.DefaultPageContent;
			
			this.navType = this.navType || "static";
			this.defaultCntContainerType = this.defaultCntContainerType || "pane";
			
			this.idProperty = this.idProperty || "id";
			
			if(has("mobile")){
				this.includeHeader = true;
			}
			
			this.navigationWidget = null;
			
			this.fcContentItems = {};
			this.fcContentContainers = {};
			
			this.flipCardModelId = this.flipCardModelId || "flipCardModel_" + this.id;
		},

		/** @ignore */
		postCreate: function(){
			this.inherited(arguments);
			
			this.initFCContainer();
			
			this.animationDurationHeritage = this.animationDuration;
		},
		
		initFCContainer: function(){
			this.initNavigationWidget();
			
			if(this.includeHeader){
				this.initHeader();
			}
			
			if(this.contentContainerList){
				this.initContentContainerItems();
				this.initCenterContent();
			}
		},
		
		/** @ignore */
		initHeader: function(){
			this.flipCardHeader = new _FCContainerHeader({
				label: this.title,
				rootContainer: this
			}).placeAt(this.domNode, "first");
			
			this.flipCardHeader.startup();
		},
		
		/** @ignore */
		startup: function(){
			if(this._started){ return; }
			
			this.inherited(arguments);
			
			this.flipCardSizeAdapter();
			
			Viewport.on("resize", lang.hitch(this, this.flipCardSizeAdapter));
			//handle css3 animation flag
			// this.toggleCSS3Animation(this.css3AnimationDisabled);
			this.own(on(this.domNode, "keydown", lang.hitch(this, "_onKey")));
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
			
			this.toggleCSS3Animation_nav(this.css3AnimationDisabled);
			this.toggleCSS3Animation_container(this.css3AnimationDisabled);
			this.toggleCSS3Animation_card(this.css3AnimationDisabled);
		},
		
		toggleCSS3Animation_nav: function(forceDisable){
			if(forceDisable !== undefined){
				this.css3AnimationDisabled_nav = forceDisable ? true : false;
			}else{
				this.css3AnimationDisabled_nav = !this.css3AnimationDisabled_nav;
			}
			
			if(this.navigationWidget){
				this.navigationWidget.toggleCSS3Animation(this.css3AnimationDisabled_nav);
			}
		},
		toggleCSS3Animation_container: function(forceDisable){
			if(forceDisable !== undefined){
				this.css3AnimationDisabled_container = forceDisable ? true : false;
			}else{
				this.css3AnimationDisabled_container = !this.css3AnimationDisabled_container;
			}
			
			if(this.fcContentContainers && !_FlipCardUtils.isObjectEmpty(this.fcContentContainers)){
				for(var gKey in this.fcContentContainers){
					var gWidget = this.fcContentContainers[gKey];
					gWidget.toggleCSS3Animation(this.css3AnimationDisabled_container);
				}
			}
		},
		toggleCSS3Animation_card: function(forceDisable){
			if(forceDisable !== undefined){
				this.css3AnimationDisabled_card = forceDisable ? true : false;
			}else{
				this.css3AnimationDisabled_card = !this.css3AnimationDisabled_card;
			}
			
			if(this.fcContentContainers && !_FlipCardUtils.isObjectEmpty(this.fcContentContainers)){
				for(var gKey in this.fcContentContainers){
					var gWidget = this.fcContentContainers[gKey];
					if(gWidget.childItemMaps && !_FlipCardUtils.isObjectEmpty(gWidget.childItemMaps)){
						for(var itemName in gWidget.childItemMaps){
							var cardWidget = gWidget.childItemMaps[itemName];
							cardWidget.toggleCSS3Animation(this.css3AnimationDisabled_card);
						}
					}
				}
			}
		},
		
		toggleCSS3Animation_nav: function(forceDisable){
			if(forceDisable !== undefined){
				this.css3AnimationDisabled_nav = forceDisable ? true : false;
			}else{
				this.css3AnimationDisabled_nav = !this.css3AnimationDisabled_nav;
			}
			
			if(this.navigationWidget){
				this.navigationWidget.toggleCSS3Animation(this.css3AnimationDisabled_nav);
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
            
            var fcCSS3FlagReserved_nav = this.css3AnimationDisabled_nav;
            var fcCSS3FlagReserved_container = this.css3AnimationDisabled_container;
            var fcCSS3FlagReserved_card = this.css3AnimationDisabled_card;
            var fcCSS3FlagReserved = this.css3AnimationDisabled;
			this.toggleCSS3Animation(true);
			
			// console.log(evt.target);

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
            
            //roll back CSS3
            this.toggleCSS3Animation(fcCSS3FlagReserved);
			this.toggleCSS3Animation_nav(fcCSS3FlagReserved_nav);
			this.toggleCSS3Animation_container(fcCSS3FlagReserved_nav);
			this.toggleCSS3Animation_card(fcCSS3FlagReserved_nav);
        },
		
		/** @ignore */
		flipCardSizeAdapter: function(e){
		    if(this.navigationWidget){
		        this.viewport = _FlipCardUtils.getPageViewPort(winUtil.doc);
                if(this.includeHeader){
                    //TODO
                    domStyle.set(this.navigationWidget.domNode, "top", this.fcContainerHeaderHeight+"px");
                    domStyle.set(this.navigationWidget.domNode, "height", (this.viewport.h-this.fcContainerHeaderHeight) + "px");
                    domStyle.set(this.contentNode, "width", (this.viewport.w-this.fcContainerNavBarWidth)+"px");
                }else{
                    domStyle.set(this.contentNode, "width", (this.viewport.w-this.fcContainerNavBarWidth)+"px");
                }
		    }
		},
		
		
		/** @ignore */
		initNavigationWidget: function(){
			if(this.navList){
				if(this.navType == "dynamic"){
					this.navigationWidget = new FlipCardNavDynamic({
					    navList: this.navList,
					    idProperty: this.idProperty,
					    customDistribute: lang.hitch(this, this.customDistribute),
					    doInitNavItem: false,
					    navBarDisplayed: this.fcContainerNavBarDisplayed,
					    navBarWidth: this.fcContainerNavBarWidth,
					    toggleNavBarAction: this.fcCntNavBarToggleAction,
					    css3AnimationDisabled: this.css3AnimationDisabled_nav,
					    rootContainer: this
					}).placeAt(this.domNode, "first");
				}else{
					this.navigationWidget = new FlipCardNavigator({
					    navList: this.navList,
					    idProperty: this.idProperty,
					    customDistribute: lang.hitch(this, this.customDistribute),
					    doInitNavItem: false,
					    navBarDisplayed: this.fcContainerNavBarDisplayed,
					    navBarWidth: this.fcContainerNavBarWidth,
					    toggleNavBarAction: this.fcCntNavBarToggleAction,
					    css3AnimationDisabled: this.css3AnimationDisabled_nav,
					    rootContainer: this
					}).placeAt(this.domNode, "first");
				}
				
				this.navigationWidget.startup();
				
				this.contentNode = this.navigationWidget.contentNode;
				this.borderNode = this.navigationWidget.borderNode;
				this.containerNode = this.navigationWidget.containerNode;
			}
		},
		
		/** @ignore */
		initContentContainerItems: function(){
			if(_supportCSS3Animation){
				domClass.add(this.containerNode.domNode, "css3Animations");
			}
			
			if(this.lazyLoading){
				//TODO
			}else{
				for(var key in this.contentContainerList){
					var item = this.contentContainerList[key];
					
					if(item.type == "pane"){
						var paneContainer = this.addCntContainer(key, item, "pane");
						this.containerNode.addChild(paneContainer);
					}else{ //default is type="grid"
						if(has("phone")){
							item.props.nbZones = 1;
							item.props.editDisabled = true;
						}
						
						var gridContainer = this.addCntContainer(key, item, "grid");
						
						this.containerNode.addChild(gridContainer);
					}
				}
			}
			
			//setup default page for nav item which does not have a page
			var navListDataClone = lang.clone(this.navigationWidget.buildNavListData());
			array.forEach(navListDataClone, function(navItem){
				if(navItem[this.idProperty] && !this.fcContentContainers[navItem[this.idProperty]]){
					if(navItem[this.navigationWidget.typeAttr] == "settings"){
						//TODO
					}else if(navItem[this.navigationWidget.typeAttr] == "separator"){
						//TODO
					}else{
						if(this.lazyLoading){
							//TODO
						}else{
							this.buildDefaultCntContainer(navItem[this.idProperty], {}, this.defaultCntContainerType);
						}
					}
				}
			}, this);
		},
		
		removeCntContainer: function(key){
			if(!key || !this.fcContentContainers){return}
			if(this.fcContentContainers[key] && this.fcContentContainers[key].destroyRecursive){
				this.fcContentContainers[key].destroyRecursive();
				delete this.fcContentContainers[key];
			}
		},
		
		addCntContainer: function(key, item, cntType, forceOverride){
			if(!key || !this.fcContentContainers){return}
			if(this.fcContentContainers[key]){
				if(forceOverride){
					this.removeCntContainer(key);
				}else{
					return;
				}
			}
			
			var cntContainer = null;
			cntType = cntType || this.defaultCntContainerType;
			if(cntType == "grid"){
				var gridProps = lang.mixin({}, {
					containerId: key,
					containerName: item.name,
					containerTitle: item.title,
					containerType: "grid",
					items: item.items,
					relations: item.relations,
					rootContainer: this,
					nbZones: 3,
					minColWidth: 50,
					minChildWidth: 50,
					isAutoOrganized: true,
					hasResizableColumns: false,
					liveResizeColumns: false,
					css3AnimationDisabled: this.css3AnimationDisabled_container,
					// dragHandleClass:"dojoxPortletTitle",
					acceptTypes: ["Portlet", "ContentPane"],
					editDisabled: (this.model == "view")
				}, item.props);
				cntContainer = new FlipCardGridContainer(gridProps);
				
				if(!_supportCSS3Animation){
					domStyle.set(cntContainer.domNode, "display", "none");
				}else{
					domClass.add(cntContainer.domNode, "centerGridFlipOut");
				}
			}else{ //default is "pane"
				var paneProps = lang.mixin({}, {
					containerId: key,
					containerName: item.name,
					containerTitle: item.title,
					containerType: "pane",
					rootContainer: this,
					css3AnimationDisabled: this.css3AnimationDisabled_container,
					executeScripts: true,
					scriptHasHooks: true
				}, item.props);
				cntContainer = new _ContainerContentPane(paneProps);
				domClass.add(cntContainer.domNode, "centerPaneContainer centerGridContainer");
				if(_supportCSS3Animation){
					domClass.add(cntContainer.domNode, "css3Animations");
				}
				
				if(!_supportCSS3Animation){
					domStyle.set(cntContainer.domNode, "display", "none");
				}else{
					domClass.add(cntContainer.domNode, "centerGridFlipOut");
				}
			}
			
			this.fcContentItems[key] = item;
			
			return this.fcContentContainers[key] = cntContainer;
		},
		
		buildDefaultCntContainer: function(key, props, cntType, forceOverride){
			var cntContainer = null;
			cntType = cntType || this.defaultCntContainerType;
			
			if(cntType == "grid"){
				cntContainer = this.addCntContainer(key, {props: lang.mixin({}, {
					nbZones: 2,
					editDisabled: false,
					showContentHeader:true,
					headerParams: {
						content: this.defaultPageCnt
					}
				}, props)}, "grid", forceOverride);
			}else{ //default is "pane"
				cntContainer = this.addCntContainer(key, {props: lang.mixin({}, {
					content: this.defaultPageCnt
				}, props)}, "pane", forceOverride);
			}
			
			this.containerNode.addChild(cntContainer);
			if(cntContainer.resize){
				cntContainer.resize();
			}
			return cntContainer;
		},
		
		
		addNavigationItem: function(navItemProps, cntItemProps){
			if(this.navigationWidget && this.navigationWidget.navListModel){
				if(lang.isObject(navItemProps)){
					this.navigationWidget.navListModel.addItem(
						navItemProps.item,
						navItemProps.parent,
						navItemProps.insertIndex,
						navItemProps.before,
						navItemProps.rootNavItem
					);
					
					var key = this.navigationWidget.navListModel.getIdentity(navItemProps.item);
					if(key){
						if(lang.isObject(cntItemProps) && !_FlipCardUtils.isObjectEmpty(cntItemProps)){
							this.buildDefaultCntContainer(key, cntItemProps.props, cntItemProps.cntType, cntItemProps.forceOverride);
						}else{
							this.buildDefaultCntContainer(key, {}, this.defaultCntContainerType);
						}
					}
				}
			}
		},
		removeNavigationItem: function(itemProps){
			if(lang.isObject(itemProps)){
				if(itemProps.itemId){
					this.removeCntContainer(itemProps.itemId);
					if(this.navigationWidget && this.navigationWidget.navListModel){
						this.navigationWidget.navListModel.deleteItem(
							itemProps.itemId,
							itemProps.parent,
							itemProps.rootNavItem
						);
					}
				}
			}
		},
		
		/** @ignore */
		initCenterContent: function(){
			topic.subscribe("/dojo/hashchange", lang.hitch(this, function(changedHash){
				this.locateHash(changedHash);
			}));
			
			this.initExecItemId = this.navigationWidget.initItemId;
            if(!this.ignoreInitHash){
                this.initExecItemId = hash() || this.navigationWidget.initItemId;
            }
			
			this.locateHash(this.initExecItemId, true);
		},
		
		/**
		 * locate the page by hash value.
		 * @param {String} changedHash
		 */
		locateHash: function(changedHash, isInit){
			var navRootItem = {};
			navRootItem[this.idProperty] = this.navigationWidget.selectedNavItemId;
		    var currentNavItem = this.navigationWidget.navListModel.getItem(changedHash || this.navigationWidget.initItemId, navRootItem);
			
			//for init handler: second level item
			if(isInit && !currentNavItem){
				//assume sync currently
				this.navigationWidget.navListModel.getRootChildren(lang.hitch(this, function(items){
					for(var i = 0; i < items.length; i++){
						navRootItem[this.idProperty] = items[i][this.idProperty];
						currentNavItem = this.navigationWidget.navListModel.getItem(changedHash || this.navigationWidget.initItemId, navRootItem);
						if(currentNavItem){
							break;
						}
					}
				}), lang.hitch(this, function(error){
					console.log(error);
				}), true);
			}
			
			//check for currentNavItem
			if(!currentNavItem){
				console.log(this._nlsResources.noSuchPage);
				return;
			}
			if(currentNavItem[this.navigationWidget.typeAttr] == "settings" && !currentNavItem[this.navigationWidget.childrenAttr]){
				console.log(this._nlsResources.settingsPage);
				// return;
			}
			this.navigationWidget.handleNavigationDstrProcess(currentNavItem, null, {
			    // customExpandoHandler: this.customExpandoHandler,
			    customNavHandler: lang.hitch(this, this.customNavHandler),
			    customSettingsHandler: lang.hitch(this, this.customSettingsHandler)
			});
			
			if(isInit && this.navigationWidget.navListNodes[currentNavItem[this.idProperty]]){
			    this.navigationWidget.selectedNavItemId = currentNavItem[this.idProperty];
			    this.navigationWidget.handleNavSelectionExtra();
			}
		},
		
		/*
		 * main distribute customization
		 */
		customDistribute: function(item, e){
		    if(this.navigationWidget.navListModel.isRootLevelItem(item) 
		    		&& item[this.navigationWidget.childrenAttr]){
		        this.navigationWidget.handleNavigationDstrProcess(item, e);
		    }else{
		        if(item && item[this.navigationWidget.typeAttr] == "settings"){
		            this.customSettingsHandler(item, e);
		        }else{
		            hash(item[this.idProperty]);
		        }
		    }
		},
		
		
		/*
		 * special distribute customization
		 */
		customExpandoHandler: function(item, e){
		    //TODO
		},
		
		customNavHandler: function(item, e){
		    var crntItem = this.navigationWidget.get("currentNavItem");
            if(crntItem && crntItem[this.idProperty] == item[this.idProperty]){
                return;
            }else{
                this.handleNavigation(item, e);
            }
		},
		
		customSettingsHandler: function(item, e){
		    var crntItem = this.navigationWidget.get("currentNavItem");
		    if(this.fcContentContainers[item[this.idProperty]] && crntItem && crntItem[this.idProperty] != item[this.idProperty]){
		        this.handleNavigation(item, e);
		    }else{
		        if(item[this.navigationWidget.pressHandlerAttr] && lang.isFunction(item[this.navigationWidget.pressHandlerAttr])){
                    item[this.navigationWidget.pressHandlerAttr].apply(this, arguments);
                }
                if(this.navigationWidget.expandoNode && this.navigationWidget.expandoNode._showing){
                    this.navigationWidget.expandoNode.toggle();
                }
                this.navigationWidget.handleSettingsAction(item, e);
		    }
		},
		
		
		/** @ignore */
		handleNavigation: function(item, e){
			if(this.animating){return;}
			if(!item){return;}
			this.animating = true;
			if(this.navigationWidget.expandoNode._showing){
				this.navigationWidget.expandoNode.toggle();
			}
			
			//handle lazy loading stuff
			if(this.lazyLoading){
				//page not exist
				if(!(this.fcContentContainers && this.fcContentContainers[item[this.idProperty]])){
					var key = item[this.idProperty];
					var cntItem = this.contentContainerList[key];
					
					if(cntItem){ // content pane exist
						if(cntItem.type == "pane"){
							cntItem.props.preload = true;
							var paneContainer = this.addCntContainer(key, cntItem, "pane");
							this.containerNode.addChild(paneContainer);
						}else{ //default is type="grid"
							if(has("phone")){
								cntItem.props.nbZones = 1;
								cntItem.props.editDisabled = true;
							}
							var gridContainer = this.addCntContainer(key, cntItem, "grid");
							this.containerNode.addChild(gridContainer);
						}
					}else{ // build default pane
						if(this.lazyLoading){
							this.buildDefaultCntContainer(key, {}, this.defaultCntContainerType);
						}else{
							//TODO
						}
					}
				}else{
					//TODO
				}
			}else{
				//page not exist
				if(!(this.fcContentContainers && this.fcContentContainers[item[this.idProperty]])){
					return;
				}
			}
			
			
			//page not exist
			if(! (this.fcContentContainers && this.fcContentContainers[item[this.idProperty]])){
				return;
			}
			
			
			// current item to be flip away
			var crntItem = this.navigationWidget.get("currentNavItem");
			
			//page flip out
			if(!_supportCSS3Animation){
			    //TODO
			}else{
				if(!_FlipCardUtils.isObjectEmpty(crntItem)){
				    var crntGrid = this.fcContentContainers[crntItem[this.idProperty]];
				    if(crntGrid){
				        var currentGCNode = crntGrid.domNode;
                        domClass.add(currentGCNode, "centerGridFlipOutLeft");
                        setTimeout(lang.hitch(this, function(){
                            domClass.add(currentGCNode, "centerGridFlipDisabled");
                            setTimeout(lang.hitch(this, function(){
                                domClass.remove(currentGCNode, "centerGridFlipDisabled");
                            }),this.animationDuration);
                            domClass.remove(currentGCNode, "centerGridFlipOutLeft");
                        }),this.animationDuration);
				    }
				}
			}
			
			//handler when flip out finish
			clearTimeout(this.hideContentPaneTimer);
			this.hideContentPaneTimer = setTimeout(lang.hitch(this, function(gItem, gContainer){
	                this.hideContentPane(gItem, gContainer);
	            }, 
	            this.fcContentItems[crntItem[this.idProperty]], 
	            this.fcContentContainers[crntItem[this.idProperty]]
	        ), this.animationDuration);
			
			
			//hide all content
			for(var gItemId in this.fcContentContainers){
				var gridItemWidget = this.fcContentContainers[gItemId];
				if(gridItemWidget){
				    if(!_supportCSS3Animation){
                        domStyle.set(gridItemWidget.domNode, "display", "none");
                    }else{
                        domClass.remove(gridItemWidget.domNode, "centerGridFlipIn");
                    }
				}
			}
			
			
			// new current item to be flip in
			this.navigationWidget.set("currentNavItem", item);
			
			//page flip in
			if(this.fcContentContainers[item[this.idProperty]]){
				if(!_supportCSS3Animation){
					var anim = flip["flipCube"]({ 
						node: this.containerNode.domNode,
						dir: "right",
						depth: .5,
						duration: this.animationDuration
					});
					connect.connect(anim, "onEnd", this, function(){ 
						domStyle.set(this.fcContentContainers[item[this.idProperty]].domNode, "display", "");
						this.animating = false;
					});
					anim.play();
					e && event.stop(e);
				}else{
					domClass.add(this.fcContentContainers[item[this.idProperty]].domNode, "centerGridFlipIn");
					this.animating = false;
				}
				this.fcContentContainers[item[this.idProperty]].startup();
				this.borderNode.startup();
				
				this.currentCntContainer = this.fcContentContainers[item[this.idProperty]];
			}
			
			//handler when flip in finish
			clearTimeout(this.showContentPaneTimer);
			this.showContentPaneTimer = setTimeout(lang.hitch(this, function(gItem, gContainer){
	                this.showContentPane(gItem, gContainer);
	            }, 
	            this.fcContentItems[item[this.idProperty]],
	            this.fcContentContainers[item[this.idProperty]]
	        ), this.animationDuration);
            
		},
		
		hideContentPane: function(gItem, gContainer){
			//TODO
			
			this.onContentHide(gItem, gContainer);
		},
		//stub function to connect to
		onContentHide: function(gItem, gContainer){
			//TODO
		},
		
		
		showContentPane: function(gItem, gContainer){
			//TODO
			
			this.onContentShow(gItem, gContainer);
		},
		//stub function to connect to
		onContentShow: function(gItem, gContainer){
			//TODO
		},
		
		/**
		 * flip all the cards in current page.
		 */
		processFlipForCurrentPage: function(e){
			//Stub for flip current page
			if(this.currentCntContainer && this.currentCntContainer.processFlips){
				this.currentCntContainer.processFlips(e);
			}
		},
		
		saveMetadataAs: function(fileName){
			fileName = fileName || this.defaultDownloadName;
			
			xhr.post(this.defaultServerPath, {
				// handleAs: "json",
				sync: false,
				data: {
					filename: fileName, 
					data: this.getMetadata(true)
				}
			}).then(lang.hitch(this, function(data){
				window.open(this.defaultDownloadPath + "?filename="+fileName);
			}), lang.hitch(this, function(error){
				console.log(error);
			}));
		},
		
		loadMetadataAs: function(metadata){
			var fccData = baseJson.fromJson(metadata);
			this.buildFlipCardContainer(fccData);
		},
		
		
		saveMetadata: function(fileName){
			fileName = fileName || this.defaultFileName;
			
			xhr.post(this.defaultServerPath, {
				// handleAs: "json",
				sync: true,
				data: {
					filename: fileName, 
					data: this.getMetadata(true)
				}
			}).then(lang.hitch(this, function(data){
				alert(this._nlsResources.savedSuccessfully);
			}), lang.hitch(this, function(error){
				console.log(error);
			}));
			
		},
		
		loadMetadata: function(fileName){
			fileName = fileName || this.defaultFileName;
			
			xhr.get(fileName, {
				// handleAs: "json",
				sync: true
			}).then(lang.hitch(this, function(data){
				var fccData = baseJson.fromJson(data);
				this.buildFlipCardContainer(fccData);
				console.log(this._nlsResources.loadedSuccessfully);
			}), lang.hitch(this, function(error){
				console.log(error);
			}));
		},
		
		buildFlipCardContainer: function(fccData){
			if(fccData){
				var preserverNode = this.domNode.parentNode;
				//destroy
				// this.destroyRecursive();
				this.destroyDescendants();
				//build 
				lang.mixin(this, fccData);
				this.initFCContainer();
				this.startup();
				// this = new FlipCardContainer(fccData, preserverNode);
				// this.startup();
			}
		},
		/**
		 * get the flip card container's metadata.
		 */
		getMetadata: function(context){
			this.metadata = {
				includeHeader: this.includeHeader,
				fcContainerHeaderHeight: this.fcContainerHeaderHeight,
				fcContainerNavBarWidth: this.fcContainerNavBarWidth,
				fcContainerNavBarDisplayed: this.fcContainerNavBarDisplayed,
				fcCntNavBarToggleAction: this.fcCntNavBarToggleAction,
				ignoreInitHash: this.ignoreInitHash,
				flipCardModelId: this.flipCardModelId,
				navType: this.navType,
				title: this.title,
				initItemId: this.initItemId,
				defaultCntContainerType: this.defaultCntContainerType,
				model: this.model
			};
			
			this.metadata.navList = this.navigationWidget.getMetadata();
			
			if(this.fcContentContainers && !_FlipCardUtils.isObjectEmpty(this.fcContentContainers)){
				this.metadata.contentContainerList = {};
				for(var gKey in this.fcContentContainers){
					var gWidget = this.fcContentContainers[gKey];
					this.metadata.contentContainerList[gKey] = gWidget.getMetadata();
				}
			}
			
			if(context){
				return baseJson.toJson(this.metadata);
			}else{
				return this.metadata;
			}
		},
		
		
		
		/**
		 * clear the saved layout of the flip card container.
		 */
		clearFlipCard: function(){
			if(localStorage){
				localStorage.removeItem(this.flipCardModelId);
			}else{
				cookie(this.flipCardModelId, null, {expires: -1});
			}
			alert(this._nlsResources.savedLayoutCleared);
		},
		/**
		 * save the layout of the flip card container.
		 */
		saveFlipCard: function(){
			var saveContent = this.getMetadata(true);
			this.storage(this.flipCardModelId, saveContent);
			alert(this._nlsResources.savedSuccessfully);
		},
		/**
		 * persistence support.
		 * @param {String} key
		 * @param {Object} value
		 */
		storage: function(key, value){
			if(value){
				if(localStorage){
					localStorage.setItem(key, value);
				}else{
					cookie(key, value, {expires: 999 });
				}
			}else{
				if(localStorage){
					return localStorage.getItem(key);
				}else{
					return cookie(key);
				}
			}
		},
		
		destroy: function(){
            //TODO            
            this.inherited(arguments);
        },
        
        
        destroyDescendants: function(){
        	if(this.flipCardHeader){
        		this.flipCardHeader.destroy();
        		this.flipCardHeader = null;
        	}
        	if(this.navigationWidget){
        		this.navigationWidget.destroy();
        		this.navigationWidget = null;
        	}
        	if(this.fcContentContainers && !_FlipCardUtils.isObjectEmpty(this.fcContentContainers)){
        		for(var gKey in this.fcContentContainers){
					var gWidget = this.fcContentContainers[gKey];
					gWidget.destroy();
					delete this.fcContentContainers[gKey];
				}
				this.fcContentContainers = {};
        	}
        	this._started = false;
        	
        	this.inherited(arguments);
        }
	
	});
});