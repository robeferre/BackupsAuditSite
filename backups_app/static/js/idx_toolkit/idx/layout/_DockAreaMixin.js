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
	"dijit/focus",
	"dijit/layout/_LayoutWidget",
	"dijit/layout/ContentPane",
	"idx/html",
	"idx/util"
], function(dojo_declare, dojo_lang, dojo_array, dojo_window, dojo_html, dojo_event, dojo_connect, dojo_keys, dijit_registry, dijit_focus, dijit_layout_LayoutWidget, dijit_layout_ContentPane, idx_html, idx_util){
/**
 * @public
 * @name idx.layout._DockAreaMixin
 * @class Mix-in class for each of the four dock areas: top, left, right, bottom.
 * @augments dijit.layout._LayoutWidget
 */
return dojo_declare("idx.layout._DockAreaMixin", [dijit_layout_LayoutWidget],
/**@lends idx.layout._DockAreaMixin#*/
{

	/**
	 * If true, this pane is collapsed when there's no children.
	 * @type Boolean
	 * @default true
	 */
	collapseEmpty: true,

	/**
	 * Determines dimension based on "region" property.
	 * @private as part of widget life cycle
	 */
	postMixInProperties: function() {
		this.inherited(arguments);
		this._dim = (this.region == "top" || this.region == "bottom") ? "x" : "y";
	},

	/**
	 * Sets up CSS class based on dimension.
	 * @private as part of widget life cycle
	 */
	postCreate: function() {
		this.inherited(arguments);
		dojo_html.addClass(this.domNode, "idxDockArea");
		if (this._dim == "y") {
			dojo_html.addClass(this.domNode, "idxDockAreaVertical");
		} else {
			dojo_html.addClass(this.domNode, "idxDockAreaHorizontal");
		}
	},

	/**
	 * Creates a mock content pane.
	 * @private as part of widget life cycle
	 */
	startup: function() {
		if (this._started) {
			return;
		}
		this.inherited(arguments);
		this._mockPane = new dijit_layout_ContentPane({
			"class": "idxDockAreaMockPane"
		});
	},

	/**
	 * Destroys the mock content pane. 
	 * @private as part of widget life cycle
	 */
	destroy: function() {
		this.inherited(arguments);
		this._mockPane.destroy();
	},

	/**
	 * Computes coordinates of each of my children, relative to my own position.
	 * This will later be used when calculating insert index.
	 * @private
	 */
	_computeBounds: function() {
		var rootPos = dojo_html.position(this.domNode);
		this._bounds = [];
		dojo_array.forEach(this.getChildren(), dojo_lang.hitch(this, function(child) {
			var pos = dojo_html.position(child.domNode);
			this._bounds.push({x: pos.x - rootPos.x + pos.w / 2, y: pos.y - rootPos.y + pos.h / 2});
		}));
	},

	/**
	 * Docks dockable widget.
	 * @param {Widget} dockable
	 * @param {Object} pos
	 */
	dock: function(dockable, pos) {
		dockable.beforeDock();
		var idx = this._getInsertIndex(pos);
		dockable.set("dockArea", this.region);
		var s = {
			left: "",
			top: ""
		};
		
		dojo_html.style(dockable.domNode, s);
		this.addChild(dockable, idx);
		dockable.onDock(this.region);
		this.resetDockArea();
		this.layout();
		dijit_focus.focus(dockable.focusNode);
	},

	/**
	 * Opens a dock area.
	 * @param {Object} pos
	 * @param {Widget} child
	 */
	showDockArea: function(pos, child) {
		var idx = this._getInsertIndex(pos);
		if (this.isDockable()) {
			this.updateDockArea(idx);
		} else {
			this._computeBounds();
			idx = this._getInsertIndex(pos);
			dojo_html.addClass(this.domNode, "idxDockAreaDockable");
			this.addChild(this._mockPane, idx);
			this._resizeMockPane(child);
			this.layout();
		}
	},

	/**
	 * Resizes the mock content page to the child widget size.
	 * @param {Object} child
	 * @private
	 */
	_resizeMockPane: function(child) {
		var mb = dojo_html.marginBox(child.domNode);
		dojo_html.style(this._mockPane.domNode, {
			height: mb.h + "px",
			width: mb.w + "px"
		});
	},

	/**
	 * Closes the dock area.
	 */
	resetDockArea: function() {
		dojo_html.removeClass(this.domNode, "idxDockAreaDockable");
		if (this._mockPane) {
			try {
				this.removeChild(this._mockPane);
			} catch(e) {
				// ignore
			}
		}
		this.layout();
	},

	/**
	 * Updates the dock page moving the mock content page.
	 * @param {Number} idx
	 */
	updateDockArea: function(idx) {
		var childIndex = this.getIndexOfChild(this._mockPane);
		if (childIndex == idx) {
			return;
		}
		this.removeChild(this._mockPane);
		this.addChild(this._mockPane, idx);
		this.layout();
	},

	/**
	 * Returns whether this dock area is dockable.
	 * @returns Boolean
	 */
	isDockable: function() {
		return dojo_html.hasClass(this.domNode, "idxDockAreaDockable");
	},

	/**
	 * Determines the index of children to insert based on the specified position.
	 * @param {Object} pos
	 * @returns {Number}
	 * @private
	 */
	_getInsertIndex: function(pos) {
		var root = dojo_html.position(this.domNode);
		var rel = {x: pos.x - root.x, y: pos.y - root.y};
		var bounds = this._bounds;
		if (!bounds) {
			return 0;
		}
		var len = bounds.length;
		for (var i = 0; i < len; i++) {
			if (rel[this._dim] < bounds[i][this._dim]) {
				return i;
			}
		}
		return len;
	}
});
});
