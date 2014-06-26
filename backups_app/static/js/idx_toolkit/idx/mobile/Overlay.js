/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2013 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/dom-construct",
        "dojo/aspect",
        "dojo/on",
        "dojox/mobile/Overlay"],
        function(dDeclare,
        		 dLang,
        		 dDomClass,
        		 dDomStyle,
        		 dDomConstruct,
        		 dAspect,
        		 dOn,
        		 dOverlay){

	/**
	 * Extends dojox/mobile/Overlay to let you specify an edge from which the Overlay will be revealed.
	 * @author Barry M. Caceres
	 * @augments dojox/mobile/Overlay
	 */
	return dDeclare("idx.mobile.Overlay", [dOverlay],
	/** @lends idx.mobile.Overlay */
	{
		/**
		 * Set this flag to true if you want a second transparent overlay to exist 
		 * just below this overlay when show to catch any tap/click events on the
		 * unobscured portion of the screen.  These taps and clicks will serve to
		 * close this overlay.
		 */
		tapAwayToClose: false,
		
		/**
		 * The edge from which to reveal the overlay.  Possible values are: "top", "bottom", "left", 
		 * "right", "leading", and "trailing".
		 */
		edge: "bottom",

		/**
		 * Override to ensure the 
		 */
		startup: function() {
			this.inherited(arguments);
			this._started = true;
			this.own(dAspect.before(this, "show", dLang.hitch(this, "_showTapCatch")));
			this.own(dAspect.after(this, "hide", dLang.hitch(this, "_hideTapCatch")));
			this._setupTapCatch();
		},

		/**
		 *
		 */
		destroy: function() {
			if (this._tapCatchHandle) {
				this._tapCatchHandle.remove();
				delete this._tapCatchHandle;
			}
			if (this._tapCatchNode) {
				dDomConstruct.destroy(this._tapCatchNode);
				delete this._tapCatchNode;
			}
			this.inherited(arguments);		
		},
				
		/**
		 * This method is called before the "show" method is called via dojo/aspect.
		 * This method handles making the "tap catch" node visible if it is being used.
		 */
		_showTapCatch: function() {
			if (! this._tapCatchNode) return;
			dDomStyle.set(this._tapCatchNode, {visibility: "visible", display: "block"});
		},

		/**
		 * This method is called after the "hide" method is called via dojo/aspect.
		 * This method handles making the "tap catch" node invisible if it is being used.
		 */
		_hideTapCatch: function() {
			if (! this._tapCatchNode) return;
			dDomStyle.set(this._tapCatchNode, {visibility: "hidden", display: "none"});
		},
		
		/**
		 *
		 */
		_setupTapCatch: function() {
			if (! this._started) return;
			if ((this.tapAwayToClose) && (!this._tapCatchNode)) {
				this._tapCatchNode = dDomConstruct.create(
					"div", 
					{style: "position: absolute; top:0px; right:0px; left:0px; bottom:0px; width:100%; height:100%;"
							+ "background-color: transparent; border: 0px none transparent; display: none; "
							+ "visibility: hidden;"},
					this.domNode,
					"before");
				
				this._tapCatchHandle = dOn(this._tapCatchNode, "click", dLang.hitch(this, function() {
					this.hide();
				}));
				
			} else if ((!this._tapAwayToClose) && (this._tapCatchNode)) {
				if (this._tapCatchHandle) {
					this._tapCatchHandle.remove();
					delete this._tapCatchHandle;
				}

				dDomConstruct.destroy(this._tapCatchNode);
				delete this._tapCatchNode;
			}
		},
		
		/**
		 *
		 */
		_setTapAwayToCloseAttr: function(value) {
			this.tapAwayToClose = value;
			this._setupTapCatch();
		},
		
		/**
		 * Sets the reveal edge for the opener.
		 *
		 * @private
		 */
		_setEdgeAttr: function(value) {
			var oldValue = this.edge;
			var _oldValue = this._edge;
			var _oldCSSClass = this._edgeClass;
			
			this.edge = value;
			switch (value) {
				case "top":
				case "bottom":
				case "left":
				case "right":
					this._edge = value;
					break;
				case "leading":
					this._edge = (this.isLeftToRight()) ? "left" : "right";
					break;
				case "trailing":
					this._edge = (this.isLeftToRight()) ? "right" : "left";
					break;
				default:
					throw "Unrecognized Edge: " + value;
			}
			this._edgeClass = "idxEdge" 
									+ this._edge.substring(0,1).toUpperCase()
								    + this._edge.substring(1);
								    
			if (_oldCSSClass && (_oldCSSClass != this._edgeClass)) {
				dDomClass.remove(this.domNode, _oldCSSClass);
			}
			dDomClass.add(this.domNode, this._edgeClass);
		}
	});
});