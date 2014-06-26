/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
        "dojo/_base/fx",
        "dojo/_base/window",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dijit/_WidgetBase"],
        function(declare,
        		 _fx,
        		 _win,
        		 domClass,
        		 domConstruct,
        		 WidgetBase){

	/**
	 * Creates a new "Launch" pane
	 * @name idx.mobile.Launch
	 * @class The Launch widget is a pane to display during application initialisation.
	 * <p>
	 * The launch pane creates its markup and displays immediately, covering the whole
	 * viewport. When the application has prepared its UI and is ready to start, it
	 * should call the global hide() method on the Launch object that this module returns.
	 * If an application needs to reshow the launch pane, the show() method can be 
	 * called, although this is not usually necessary.
	 * </p>
	 * <p>
	 * NB this module should be required FIRST in order to display as soon as possible.
	 * </p>
	 * @augments dijit._WidgetBase
	 */
	var cls = declare("idx.mobile.Launch", [WidgetBase], {
		baseClass: "mblIdxLaunch",
		
		_timer: null,

		buildRendering: function(){
			this.inherited(arguments);
			
			domClass.add(this.domNode, "mblIdxLaunch");
			this._logoNode = domConstruct.create("div", { className: "mblIdxIbmLogo" }, this.domNode );
			domConstruct.place(this.domNode, _win.body(), "first");
			
			this._loadingNode = domConstruct.create("div", { className: "mblIdxLoading" }, this.domNode );
			this._loadingMessageNode = domConstruct.create("p", { className: "mblIdxLoadingMessage" }, this._loadingNode);

			this.resize();
		},
		
		/**
		 * Show the launch pane. It is not usually necessary for an application to call
		 * this method, as the launch pane shows automatically during module load and 
		 * is usually only required once.
		 */
		show: function(){
			if(this._timer){
				clearTimeout(this._timer);
				this._timer = null;
			}
			
			this._loadingNode.style.opacity = 0;
			this.domNode.style.opacity = 1;
			this.domNode.style.display = "block";
			
			var me = this;
			this._timer = setTimeout(function(){
				_fx.fadeIn({ node: me._loadingNode, duration: 500 }).play();
				
				require(["dojox/mobile/ProgressIndicator",
				         "dojo/i18n"],
				         function(ProgressIndicator,
				        		  i18n){
					if(!me._pi){
						me._pi = new ProgressIndicator({ size: 38, startSpinning: false, removeOnStop: false, "class": "mblIdxLoadingIndicatorBlack" });
						me._loadingNode.appendChild(me._pi.domNode);
						me.resize();
					}
						
					var nls = i18n.getLocalization("idx.mobile", "Launch");
					me._loadingMessageNode.innerHTML = nls.loadingMessage; 
				});
			}, 2000);
		},

		/**
		 * Hide the launch pane. This method should be called when the application is
		 * has prepared its UI and is ready to start. The launch pane hides and also
		 * destroys all its resources unless 'keepavailable' is true.
		 */
		hide: function(keepavailable){
			if(this._timer){
				clearTimeout(this._timer);
				this._timer = null;
			}

			var me = this;
			_fx.fadeOut({ node: this.domNode, duration: 200, onEnd: function(){
				if(!me._destroyed){
					me.domNode.style.display = "none";
					me._loadingNode.style.opacity = 0;
					if(!keepavailable){
						me.destroy();
					}
				}
			} }).play();
		},
		
		resize: function(){
			// insulate the logo and loading animation positions against changes to
			// the body size such as those done during dojox.mobile initialisation
			var half = ((_win.global.innerHeight || _win.doc.documentElement.clientHeight) / 2) + "px";
			this._logoNode.style.top = half;
			this._loadingMessageNode.style.top = half;
			
			if(this._pi){
				this._pi.domNode.style.top = half;
			}

			this.inherited(arguments);
		}
	}),
	obj = new cls();
	
	// show immediately, and show body if hidden
	obj.show();
	_win.body().style.visibility = "visible";
	
	// start loading of the components we'll need later if still showing
	require(["dojox/mobile/ProgressIndicator",
	         "dojo/i18n",
	         "dojo/i18n!idx/mobile/nls/Launch"]);	
	
	return obj;
});