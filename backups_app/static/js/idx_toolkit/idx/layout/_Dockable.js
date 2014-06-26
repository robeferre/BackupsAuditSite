define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/window",
	"dojo/_base/html",
	"dojo/_base/event",
	"dojo/_base/connect",
	"dojo/keys",
	"dojo/touch",
	"dijit/registry",
	"idx/html",
	"idx/util"], function(dojo_declare, dojo_lang, dojo_array, dojo_window, dojo_html, dojo_event, dojo_connect, dojo_keys, dojo_touch, dijit_registry, idx_html, idx_util){

/**
 * @public
 * @name idx.layout._Dockable
 * @class Mix-in class for dockable child widgets.
 */
return dojo_declare("idx.layout._Dockable", null,
/**@lends idx.layout._Dockable#*/
{
	/**
	 * Docking area.
	 * One of "left", "right", "top", "bottom", and "float"
	 * @type String
	 * @default ""
	 */
	dockArea: "",

	/**
	 * Dragging pixel amount before starting undocking.
	 * @type Number
	 * @default 10 
	 */
	delay: 10,

	/**
	 * Node that users can drag
	 * @type Element
	 * @default null
	 */
	dragNode: null,

	/**
	 * Topic ID for events being published during undocking/docking operations.
	 * Specify this to differentiate if using two or more DockContainer.
	 * @type String
	 * @default ""
	 */
	topicId: "",
	
	_dragging: false,

	/**
	 * Sets up CSS class.
	 * @private as part of widget life cycle
	 */
	buildRendering: function() {
		this.inherited(arguments);
		dojo_html.addClass(this.domNode, "idxDockable");
	},

	/**
	 * Initializes a drag node.
	 * @private as part of widget life cycle
	 */
	postCreate: function() {
		this.inherited(arguments);
		this.dragNode = this.dragNode || this.focusNode || this.domNode;
	},

	/**
	 * Sets up event handlers.
	 * @private as part of widget life cycle
	 */
	startup: function() {
		if (this._started) {return;}
		this.inherited(arguments);
		
		this.connect(this.dragNode, dojo_touch.press, "_onDragMouseDown");
		this.connect(this.dragNode, "onkeyup", "_onKey");
	},

	/**
	 * Sets up CSS classes based on dockArea attribute.
	 * @private
	 */
	_setDockAreaAttr: function(area) {
		this.dockArea = area;
		
		var docked = (area != "float");
		dojo_html.toggleClass(this.domNode, "idxDockableDocked", docked);
		dojo_html.toggleClass(this.domNode, "idxDockableFloating", !docked);
	},

	_setParentSelectable: function(selectable) {
		var parent = this.domNode.parentNode;
		if (!parent) parent = dojo_window.body();
		dojo_html.setSelectable(parent, selectable);
	},
	
	/**
	 * Handles key events for starting, moving and ending dragging.
	 * @param {Object} evt
	 * @private
	 */
	_onKey: function(evt) {
		var k = evt.keyCode;
		var dk = dojo_keys;
		
		if (k == dk.SHIFT) {
			if (this._dragging) {
				var pos = dojo_html.position(this.domNode);
				var mb = dojo_html.marginBox(this.domNode);
				var obj = {
					clientX: pos.x + mb.w / 2,
					clientY: pos.y
				}
				
				this._publish("/idx/move/end", obj);
				this._dragging = false;
				this._setParentSelectable(true);
				
				// re-set focus
				if (dojo.isIE) {
					var _this = this;
					setTimeout(function() {
						_this.focusNode.focus();
					}, 30);
				}
				return;
			}
		}
		
		if (k == dk.ENTER || k == dk.SPACE) {
			if (this.toggleable) {
				this.toggle();
			}
			dojo_event.stop(evt);
			return;
		}
		
		if (evt.shiftKey) {	// control position
			if (k == dk.UP_ARROW || k == dk.DOWN_ARROW || k == dk.LEFT_ARROW || k == dk.RIGHT_ARROW) {
				// calculate original position before undocking
				this._offsetX = this._offsetY = 0;
				var pos = dojo_html.position(this.domNode);
				if (k == dk.UP_ARROW) {
					pos.y -= 20;
				} else if (k == dk.DOWN_ARROW) {
					pos.y += 20;
				} else if (k == dk.LEFT_ARROW) {
					pos.x -= 20;
				} else if (k == dk.RIGHT_ARROW) {
					pos.x += 20;
				}
				
				if (!this._dragging) {
					this._setParentSelectable(false);
					
					//undocks if necessary
					this._startMove(evt);
					
					var _this = this;
					setTimeout(function() {
						if (_this.focusNode) {
							_this.focusNode.focus();
						} else if (_this.focus) {
							_this.focus();
						} else {
							_this.domNode.focus();
						}						
					}, 0);
				}
				
				this.position(pos.x, pos.y);
				// imitate event object just for the coordinates
				var evtObj = {
					clientX: pos.x + dojo_html.marginBox(this.domNode).w / 2, 
					clientY: pos.y
				};
				this._publish("/idx/move", evtObj);
				
				dojo_event.stop(evt);
			}
		}
	},

	/**
	 * Starts dragging.
	 * @param {Object} evt
	 * @private
	 */
	_startMove: function(evt) {
		this._dragging = true;
		this._startLoc = {x: evt.clientX, y: evt.clientY};
		var dockArea = this.get("dockArea");
		if (dockArea != "float") {
			this.onUndock(this.get("dockArea"));
		}		
		this._publish("/idx/move/start", evt);
	},

	/**
	 * Ends dragging.
	 * @param {Object} evt
	 * @private
	 */
	_endMove: function(evt) {
		this._dragging = false;
		this._publish("/idx/move/end", evt);
	},

	/**
	 * Handling mouse down event for dragging.
	 * @param {Object} evt
	 * @private
	 */
	_onDragMouseDown: function(evt) {
		this._setParentSelectable(false);
		
		this._mouseDown = true;
		this._initX = evt.clientX;
		this._initY = evt.clientY;
		var pos = dojo_html.position(this.domNode);
		this._offsetX = evt.clientX - pos.x;
		this._offsetY = evt.clientY - pos.y;

		this._globalMouseMove = this._globalMouseMove || [];
		this._globalMouseUp = this._globalMouseUp || [];
		this._globalMouseMove.push(dojo_connect.connect(dojo_window.body(), dojo_touch.move, this, "_onDragMouseMove"));
		this._globalMouseUp.push(dojo_connect.connect(dojo_window.body(), dojo_touch.release, this, "_onDragMouseUp"));
	},
	
	/**
	 * Handling mouse up event for dragging.
	 * @param {Object} evt
	 * @private
	 */
	_onDragMouseUp: function(evt) {
		this._mouseDown = false;
		dojo_array.forEach(this._globalMouseMove, dojo_connect.disconnect);
		dojo_array.forEach(this._globalMouseUp, dojo_connect.disconnect);
		if (this._dragging) {
			this._endMove(evt);
		}
		
		this._setParentSelectable(true);
	},
	
	/**
	 * Handling mouse move event for dragging.
	 * @param {Object} evt
	 * @private
	 */
	_onDragMouseMove: function(evt) {
		if (!this._mouseDown) {
			return;
		}
		if (this._dragging == false) {
			if (Math.abs(this._initX - evt.clientX) > this.delay || Math.abs(this._initY - evt.clientY) > this.delay) {
				this._startMove(evt);
			}
		} else {
			this._publish("/idx/move", evt);
			this.position(evt.clientX, evt.clientY);
		}
		dojo_event.stop(evt);
	},

	/**
	 * Callback to be called before docking.
	 */
	beforeDock: function() {

	},

	/**
	 * Callback to be called on docking.
	 * @param {String} region
	 */
	onDock: function(region) {
		
	},

	/**
	 * Callback to be called on undocking.
	 * @param {String} region
	 */
	onUndock: function(region) {
		this.set("dockArea", "float");
		
		// clear width and height
		dojo_html.style(this.domNode, {width: "", height: ""});
	},

	/**
	 * Positions the widget.
	 * @param {Numner} x
	 * @parem {Number} y
	 */
	position: function(x, y) {
		var parentPos = dojo_html.position(this.domNode.offsetParent);
		var parentBox = dojo_html.contentBox(this.domNode.offsetParent);
		var mb = dojo_html.marginBox(this.domNode);
		// restrain the position within dock container.
		// TODO: place pane under body and make it moveable anywhere on screen.
		var left = Math.min(Math.max(x - parentPos.x - this._offsetX, 0), parentBox.w - mb.w);
		var top = Math.min(Math.max(y - parentPos.y - this._offsetY, 0), parentBox.h - this._offsetY);
		dojo_html.marginBox(this.domNode, {l: left, t: top});
	},

	/**
	 * Publishes a dock topic.
	 * @param {String} topic
	 * @param {Object} evt
	 * @private
	 */
	_publish: function(topic, evt) {
		var msg = [{target: this, content: this, event: evt, start: this._startLoc}];
		dojo_connect.publish(this.topicId + topic, msg);	
	}	
});
});
