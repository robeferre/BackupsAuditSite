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
	"idx/layout/BorderContainer"
], function(dojo_declare, dojo_lang, dojo_array, dojo_window, dojo_html, dojo_event, dojo_connect, dojo_keys, dijit_registry, idx_html, idx_util, idx_layout_BorderContainer){

/**
 * @name idx.layout.DockContainer
 * @class BorderContainer enabling child widgets docked and undocked (floated or docked in another pane).
 * @augments idx.layout.BorderContainer
 */
return dojo_declare("idx.layout.DockContainer", [idx_layout_BorderContainer],
/**@lends idx.layout.DockContainer#*/
{
	/**
	 * Overrides super-class's default.
	 * @type String
	 * @default "sidebar"
	 */
	design: "sidebar",
	
	_topZ: 50,

	/**
	 * Dragging pixel amount before starting undocking.
	 * @type Number
	 * @default 10 
	 */
	delay: 10,

	/**
	 * Topic ID for events being published during undocking/docking operations.
	 * @type String
	 * @default ""
	 */
	topicId: "",

	/**
	 * Initialize topic ID with the widget ID when not specified.
	 * @private as part of widget life cycle
	 */
	buildRendering: function() {
		this.inherited(arguments);
		this.topicId = this.topicId || this.id;
	},

	/**
	 * Subscribes events and sets up children (starting floating children and collapsing empty children).
	 * @private as part of widget life cycle
	 */
	startup: function() {
		if (this._started) {return;}
		this.inherited(arguments);
		
		this.subscribe(this.topicId + "/idx/move/start", "_onChildMoveStart");
		this.subscribe(this.topicId + "/idx/move", "_onChildMove");
		this.subscribe(this.topicId + "/idx/move/end", "_onChildMoveEnd");
		
		this._startupFloatingChildren();
		
		// collapse empty children
		var children = this.getChildren();
		dojo_array.forEach(children, function(child) {
			var region = child.get("region");
			var cs = child.getChildren ? child.getChildren() : [];
			if (region && cs.length == 0 && child.get("collapseEmpty")) {
				this.collapse(region);
			}
		}, this);
	},

	/**
	 * Updates size for dock area.
	 */
	layout: function() {
		this.inherited(arguments);
		var mb = dojo_html.marginBox(this.domNode);
		this._dockWidth = mb.w;
		this._dockHeight = mb.h;
	},

	/**
	 * Returns only "docked" children, unless "all" is specified to true.
	 * @param {Boolean} all
	 */
	getChildren: function(all) {
		var children = this.inherited(arguments);
		return dojo_array.filter(children, function(child) {
			return child.region || all;
		});
	},

	/**
	 * When "dockable" child is added, make it float.
	 * @param {Object} child
	 */
	addChild: function(child) {
		this.inherited(arguments);
		
		// if a dockable is added, make it float
		if (child.dockArea) {
			child.set("dockArea", "float");
			dojo_html.style(child.domNode, "position", "absolute");
			dojo_html.style(child.domNode, "zIndex", this._topZ++);	
		}
	},

	/**
	 * Starts up floating children.
	 * @private
	 */
	_startupFloatingChildren: function() {
		var children = this.getChildren(true);
		dojo_array.forEach(children, function(child) {
			if (!child.region) {
				child.startup();
			}
		}, this);
	},

	/**
	 * Sets CSS class for the docked child.
	 * @param {Object} child
	 * @param {String} area
	 * @private
	 */
	_onChildDocked: function(child, area) {
		dojo_html.toggleClass(this.domNode, "idxDockableDocked", false);
		dojo_html.toggleClass(this.domNode, "idxDockableFloating", true);
		this.domNode.appendChild(this.domNode);
	},

	/**
	 * Tests if a child is contained by a parent.
	 * @param {Object} parent
	 * @param {Object} child
	 * @returns {Boolean}
	 * @private
	 */
	_contains: function(parent, child) {
		if (parent == child) {
			return true;
		}
		return dojo_html.isDescendant(child, parent);
	},

	/**
	 * Sets up properties for dragging dockable child.
	 * @param {Object} msg
	 * @private
	 */
	_onChildMoveStart: function(msg) {
		var child = msg.content;
		if (dojo_array.indexOf(this.domNode.childNodes, child.domNode) == -1) {
			if (child.getParent) {
				this._currentDockArea = child.getParent();	
			}
			this.domNode.appendChild(child.domNode);
			// refocus to prevent indicator to get stuck for FF10+
			child.focusNode && child.focusNode.focus();
		}
		dojo_html.style(child.domNode, "zIndex", this._topZ++);
		this._rootPos = dojo_html.position(this.domNode);
		
		var center = this._getChildPane("center");
		if (center) {
			this._centerPos = dojo_html.position(center.domNode);	
		}

		if (child.layoutAlign) {
			this._clearLayoutAlign(child);
		}
	},

	/**
	 * Retrieves a child widget for the specified region.
	 * @param {String} region
	 * @returns {Object}
	 * @private
	 */
	_getChildPane: function(region) {
		var c;
		dojo_array.some(this.getChildren(), function(child) {
			if (child.region == region) {
				c = child;
				return true;
			}
		});
		return c;
	},

	/**
	 * Removes alignment property and CSS classes from child.
	 * @param {Object} pane
	 * @private
	 */
	_clearLayoutAlign: function(pane) {
		delete pane.layoutAlign;
		dojo_html.removeClass(pane.domNode, "dijitAlignLeft");
		dojo_html.removeClass(pane.domNode, "dijitAlignRight");
		dojo_html.removeClass(pane.domNode, "dijitAlignTop");
		dojo_html.removeClass(pane.domNode, "dijitAlignBottom");
		dojo_html.removeClass(pane.domNode, "dijitAlignClient");
	},

	/**
	 * Checks collision on child being moved.
	 * @param {Object} msg
	 * @private
	 */
	_onChildMove: function(msg) {
		var evt = msg.event;
		var child = msg.content;
		this._collisionCheck({x: evt.clientX, y: evt.clientY}, child);
	},

	/**
	 * Docks a child when dragging ends.
	 * @param {Object} msg
	 * @private
	 */
	_onChildMoveEnd: function(msg) {
		if (this._currentDockArea) {
			var pos = {x: msg.event.clientX, y: msg.event.clientY};
			this._currentDockArea.dock(msg.content, pos);
		}
	},

	/**
	 * Opens dock area when a child is moving close to the area.
	 * Otherwise, reset the opened dock area. 
	 * @param {Object} pos
	 * @param {Object} child
	 * @private
	 */
	_collisionCheck: function(pos, child) {
		var root = this._rootPos;
		var center = this._centerPos;
		if (pos.x < center.x + 5) {
			this._showDockArea(pos, "left", child);
		} else if (pos.x > center.x + center.w - 5) {
			this._showDockArea(pos, "right", child);
		} else if (pos.y < center.y + 5) {
			this._showDockArea(pos, "top", child);
		} else if (pos.y > center.y + center.h - 5) {
			this._showDockArea(pos, "bottom", child);
		} else {
			this._resetDockArea();
		}
	},

	/**
	 * Resets the candidate dock area, closing it if empty.
	 * @private
	 */
	_resetDockArea: function() {
		if (this._currentDockArea) {
			this._currentDockArea.resetDockArea();
			
			var da = this._currentDockArea;

			// close dock area if no child is present
			if (da.getChildren().length == 0 && da.get("collapseEmpty")) {
				this.collapse(this._currentRegion);
			}
			
			this._currentDockArea = null;
			this._currentRegion = null;
		}
	},

	/**
	 * Opens the candidate dock area when it is collapsed.
	 * @param {Object} pos
	 * @param {String} region
	 * @param {Object} child
	 * @private
	 */
	_showDockArea: function(pos, region, child) {
		var pane = this._getChildPane(region);
		if (!pane || !pane.showDockArea) {
			return;
		}

		if (this._currentRegion != region) {
			this._resetDockArea();
			
			// open the dock area in case it was collapsed
			if (pane.get("collapseEmpty") && pane.getChildren().length == 0) {
				this.restore(region);
			}
		}
		
		pane.showDockArea(pos, child);
		this._currentRegion = region;
		this._currentDockArea = pane;
	},

	/**
	 * Determines a parent widget of the specified child widget.
	 * @param {Object} child
	 * @returns {Object}
	 * @private
	 */
	_getParentWidget: function(child) {
		var node = child.domNode;
		while (node != dojo_window.body()) {
			node = node.parentNode;
			var widget = dijit_registry.byNode(node);
			if (widget && widget.get("region")) {
				var children = widget.getChildren ? widget.getChildren() : [];
				for (var i = 0; i < children.length; i++) {
					if (children[i] == child) {
						return widget;
					}
				}
			}
		}
	}
});
});
