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
	"idx/layout/MoveableTabContainer",
	"idx/layout/_DockAreaMixin"
], function(dojo_declare, dojo_lang, dojo_array, dojo_window, dojo_html, dojo_event, dojo_connect, dojo_keys, dijit_registry, idx_html, idx_util, idx_layout_MoveableTabContainer, idx_layout__DockAreaMixin){
/**
 * @name idx.layout.DockTabContainer
 * @class Tabbed dock area based on TabContainer
 * @augments idx.layout.MoveableTabContainer
 * @augments idx.layout._DockAreaMixin
 */
return dojo_declare("idx.layout.DockTabContainer", [idx_layout_MoveableTabContainer, idx_layout__DockAreaMixin],
/**@lends idx.layout.DockTabContainer#*/
{

	/**
	 * Tab layout is always horizontal so set collision check dimension to x
	 * @private as part of widget life cycle
	 */
	postMixInProperties: function() {
		this.inherited(arguments);
		this._dim = "x";	// tabs are always horizontal
	},
	
	/**
	 * Sets up CSS class and event handler.
	 * @private as part of widget life cycle
	 */
	postCreate: function() {
		this.inherited(arguments);
		dojo_html.addClass(this.domNode, "idxDockTabContainer");
		this.connect(this.tablist, "_onMove", "_onTabMove");
	},

	/**
	 * Computes coordinates of each of my children, relative to my own position.
	 * This will later be used when calculating insert index.
	 * @private
	 */
	_computeBounds: function() {
		var rootPos = dojo_html.position(this.tablist.domNode);
		this._bounds = [];
		dojo_array.forEach(this.tablist.getChildren(), dojo_lang.hitch(this, function(child) {
			var pos = dojo_html.position(child.domNode);
			this._bounds.push({x: pos.x - rootPos.x + pos.w / 2, y: pos.y - rootPos.y + pos.h / 2});
		}));
	},

	/**
	 * Detects dragging out to undock.
	 * @param {Object} msg
	 * @private
	 */
	_onTabMove: function(msg) {
		this.inherited(arguments);
		// check to see if the user dragged the tab out of myself
		if (this.tablist._dragOut) {
			this.tablist._movingTab = false;
			this._undock(msg.content, msg.event);
		}
	},

	/**
	 * Undocks a child pane.
	 * @param {Object} pane
	 * @param {Object} evt
	 * @private
	 */
	_undock: function(pane, evt) {
		this.removeChild(pane);
		this.domNode.parentNode.appendChild(pane.domNode);
		dojo_html.removeClass(pane.domNode, "dijitTabPane");
		pane.set("selected", false);
		pane._onDragMouseDown(evt);
		pane._offsetX = 30;
		pane._offsetY = 10;
		pane.position(evt.clientX, evt.clientY);
		pane._startMove(evt);
	}	
});
});
