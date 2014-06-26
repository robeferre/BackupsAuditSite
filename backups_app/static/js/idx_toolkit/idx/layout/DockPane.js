define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/window",
	"dojo/_base/html",
	"dojo/_base/event",
	"dojo/_base/connect",
	"dojo/keys",
	"dijit/registry",
	"idx/html",
	"idx/util",
	"idx/layout/TitlePane",
	"idx/layout/_Dockable"
], function(dojo_declare, dojo_lang, dojo_array, dojo_window, dojo_html, dojo_event, dojo_connect, dojo_keys, dijit_registry, idx_html, idx_util, idx_layout_TitlePane, idx_layout__Dockable){
/**
 * @name idx.layout.DockPane
 * @class Simple dockable widget based on TitlePane
 * @augments idx.layout.TitlePane
 * @augments idx.layout._Dockable
 */
return dojo_declare("idx.layout.DockPane", [idx_layout_TitlePane, idx_layout__Dockable],
/**@lends idx.layout.DockPane#*/
{
	doLayout: true,
	hideIcon: true,

	/**
	 * Changes opacity with mouse scrolling
	 * @type Boolean
	 * @default false
	 */
	scrollOpacity: false,

	/**
	 * Sets "dragNode" and sets up CSS classes.
	 * @private as part of widget life cycle
	 */
	buildRendering: function() {
		this.inherited(arguments);
		this.dragNode = this.titleBarNode;
		dojo_html.addClass(this.titleBarNode, "idxDockPaneTitle");
		dojo_html.addClass(this.hideNode, "idxDockPaneContentOuter");
		dojo_html.addClass(this.focusNode, "idxDockPaneTitleFocus");
	},

	/**
	 * Sets up an event handler for "scrollOpacity".
	 * @private as part of widget life cycle
	 */
	startup: function() {
		this.inherited(arguments);
		
		// TODO: support dynamically changing scrollOpacity property?
		if (this.scrollOpacity) {
			this._scrollConnect = this.connect(this.titleBarNode, idx_util.isMozilla ? "DOMMouseScroll" : "onmousewheel", dojo_lang.hitch(this, "_onWheel"));	
		}
	},

	/**
	 * Updates properties and CSS styles based on docked region.
	 * @param {String} region
	 */
	onDock: function(region) {
		if (region == "top" || region == "bottom") {
			this.set("toggleable", false);
			this.set("doLayout", true);
			if (!this.open) {
				this.toggle();
			}
			this._setDockedStyle();
		}
		// remove hover styling from title bar
		dojo.removeClass(this.titleBarNode, "dijitTitlePaneTitleHover");
	},

	/**
	 * Sets up CSS styles when docked.
	 * @private
	 */
	_setDockedStyle: function() {
		var dim = dojo_html.contentBox(this.domNode.parentNode);
		var titleHeight = dojo_html.marginBox(this.titleBarNode).h;
		var contentHeight = dim.h - titleHeight - 3;	// -3 for margin and border
		dojo_html.marginBox(this.hideNode, {h: contentHeight});
		dojo_html.style(this.hideNode, "overflow", "auto");
	},

	/**
	 * Updates CSS styles when being docked.
	 */
	resize: function() {
		this.inherited(arguments);
		if (this.dockArea == "top" || this.dockArea == "bottom") {
			this._setDockedStyle();
		}
		
		// hack to fix IE7 document mode
		if (idx_util.isIE === 7) {
			dojo_html.marginBox(this.titleBarNode, {w: dojo_html.contentBox(this.domNode).w});
		}
	},

	/**
	 * Resets CSS styles for being undocked.
	 * @private
	 */
	_resetDockedStyle: function() {
		dojo_html.style(this.hideNode, "height", "auto");
	},

	/**
	 * Updates properties and CSS styles for being undocked.
	 * @param {String} region
	 */
	onUndock: function(region) {
		this.inherited(arguments);
		this._resetDockedStyle();
		this.set("toggleable", true);
		this.set("doLayout", false);
		this.set("open", true);
		dojo_html.style(this.domNode, "height", "");
	},

	/**
	 * Initializes docked state.
	 * @private
	 */
	_onShow: function() {
		this.inherited(arguments);
		this.onDock(this.dockArea);
	},
	
	// override dijit.TitlePane._onTitleClick
	_onTitleClick: function(evt) {
		// do nothing
		dojo_event.stop(evt);
	},
	
	// override idx.layout._Dockable._onMouseUp
	/**
	 * When not dragged, perform original toggling behavior of TitlePane
	 * @param {Object} evt
	 * @private
	 */
	_onDragMouseUp: function(evt) {
		if (!this._dragging && this.toggleable) {
			this.toggle();
		}
		this.inherited(arguments);
	},
	
	// override dijit.TitlePane._onTitleKey
	/**
	 * Changes opacity on key events.
	 * @param {Object} evt
	 * @private
	 */
	_onTitleKey: function(evt) {
		// do nothing, this is handled by _onKey
	},
	
	/**
	 * Handles key events
	 * @private
	 * @augments idx.layout._Dockable._onKey
	 */
	_onKey: function(evt) {
		var dk = dojo_keys;
		var k = evt.keyCode;
		if (evt.ctrlKey && this.dockArea == "float") {	// control opacity
			if (k == dk.UP_ARROW) {
				this._setOpacity(1);
				dojo_event.stop(evt);
			} else if (k == dk.DOWN_ARROW) {
				this._setOpacity(-1);
				dojo_event.stop(evt);
			}
		} else {
			this.inherited(arguments);
		}
	},
	
	/**
	 * Changes opacity on mouse scroll event.
	 * @param {Object} evt
	 * @private
	 */
	_onWheel: function(evt) {
		evt = evt || window.event;
		
		var delta = 0;
		if (evt.wheelDelta) {	// IE
			delta = evt.wheelDelta;
		} else if (evt.detail) {	// FF
			delta = evt.detail * -1;
		}
		
		this._setOpacity(delta);
		
		dojo_event.stop(evt);
		return false;
	},

	/**
	 * Changes opacity.
	 * @param {Numner} delta
	 * @private
	 */
	_setOpacity: function(delta) {

		var opa = dojo_html.style(this.domNode, "opacity");
		var d = delta > 0 ? 0.1 : -0.1;
		
		opa = Math.min(1, Math.max(0.1, opa - 0 + d));
		dojo_html.style(this.domNode, "opacity", opa);
		
	}
});
});
