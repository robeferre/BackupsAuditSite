/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare","dojo/dom-style","dojo/dom-geometry","../util","./BorderDesign"],
		function(dDeclare,		// (dojo/_base/declare)
				 dDomStyle,		// (dojo/dom-style) for (dDomStyle.set)
				 dDomGeo,		// (dojo/dom-geometry) for (dDomGeo.getMarginBox)
				 iUtil,			// (../util)
				 iBorderDesign)	// (./BorderDesign) 
{
	/**
	 * Utility module for helping widgets that wish to use a border-container layout.
	 * This module allows you to create an instance and set the nodes that represent
	 * the various regions.  It also provides more border layout options that the 
	 * standard border container (see idx.border.BorderDesign)
	 * @public
	 * @name idx.border.BorderLayout
	 * @class
	 * @see idx.border.BorderDesign
	 */
return dDeclare("idx.border.BorderLayout", null, 
		/**@lends idx.border.BorderLayout#*/								
{
  /**
   * The idx.border.BorderDesign describing the type of border layout being employed.  If
   * this is specified as a String in the constructor, then an attempt is made to create
   * a BorderDesign instance from it.
   *
   * @field
   * @public
   * @type idx.border.BorderDesign
   */
  design: null,

  /**
   * The node representing the outer frame of the border.  This node is required.
   *
   * @field
   * @public
   * @type Node
   */
  frameNode: null,

  /**
   * The node representing the top region of the border.  If not specified then this region is
   * assumed to be absent.
   *
   * @field
   * @public
   * @type Node
   */
  topNode: null,

  /**
   * The node representing the bottom region of the border.  If not specified then this region is
   * assumed to be absent.
   *
   * @field
   * @public
   * @type Node
   */
  bottomNode: null,

  /**
   * The node representing the left region of the border.  If not specified then this region is
   * assumed to be absent.
   * @field
   * @public
   * @type Node
   */
  leftNode: null,

  /**
   * The node representing the right region of the border.  If not specified then this region is
   * assumed to be absent.
   * @field
   * @public
   * @type Node
   */
  rightNode: null,

  /** 
   * The node representing the center region of the border layout.  This node is required.
   *
   * @field
   * @public
   * @type Node
   */
  centerNode: null,

  /**
   * Constructs an instance with the specified arguments.
   * @function
   * @public
   * @param {Object} args The arguments to mix in.
   */
  constructor: function(args) {
    this.design = (args.design instanceof iBorderDesign)
                  ? args.design
                  : new iBorderDesign(args.design, args.leftToRight);

    this.frameNode  = args.frameNode;
    this.topNode    = args.topNode;
    this.bottomNode = args.bottomNode;
    this.leftNode   = args.leftNode;
    this.rightNode  = args.rightNode;
    this.centerNode = args.centerNode;

    // apply the base styling
    var borderStyle = { position: "absolute", margin: "0px" };
    this.style(this.topNode,    borderStyle);
    this.style(this.bottomNode, borderStyle);
    this.style(this.leftNode,   borderStyle);
    this.style(this.rightNode,  borderStyle);

    // require the center node and frame node
    dDomStyle.set(this.centerNode, borderStyle);

    this._nodeLookup = {
      header: this.topNode,
      top: this.topNode,
      left: this.leftNode,
      center: this.centerNode,
      right: this.rightNode,
      footer: this.bottomNode,
      bottom: this.bottomNode
    };

    if (args.leftToRight != null) {
      this._nodeLookup.leader = (args.leftToRight) ? this.leftNode : this.rightNode;
      this._nodeLookup.trailer = (args.leftToRight) ? this.rightNode : this.leftNode;
    }
  },

  /**
   * If a node is specified then this function applies the specified style to the node.
   * @private
   * @function
   */
  style: function(node, style) {
    if (! node) return;
    dDomStyle.set(node, style);
  },

  /**
   * Returns the margin box for node or a 0x0 margin box if the node is null.
   * @private
   * @function
   */
  marginBox: function(node) {
    if (! node) return {w:0,h:0};
    return dDomGeo.getMarginBox(node);
  },

  /**
   * Performs the layout with the nodes specified in the constructor to this instance
   * by assigning the border and center nodes the proper styling.
   * @public
   * @function
   */
  layout: function() {
    // summary:
    //      Handles layout of the border regions.
    //
    var tbox   = this.marginBox(this.topNode);
    var lbox   = this.marginBox(this.leftNode);
    var rbox   = this.marginBox(this.rightNode);
    var bbox   = this.marginBox(this.bottomNode);

    var cstyle = { left: lbox.w + "px",
                   right: rbox.w + "px",
                   top: tbox.h + "px",
                   bottom: bbox.h + "px" };

    this.style(this.centerNode, cstyle);

    for (edge in cstyle) {
      var styling = { };
      var node    = this._nodeLookup[edge];

      var styler  = this.design[edge + "Styler"];

      for (side in styler) {      
        var offset = styler[side];
        if (cstyle[offset]) offset = cstyle[offset];
        styling[side] = offset;
      }

      this.style(node, styling);
    }
  },

  /**
   * Sets the optimal width on the framing node based on the computed optimal widths of the regions.
   * @param {Boolean} excludeCenter Set to true of the center region should be excluded in the calculation
   *                                and false if it should be included.
   * @public
   * @function
   */
  setOptimalWidth: function(/*Boolean*/ excludeCenter) {
    var width = this.computeOptimalWidth(excludeCenter);
    dDomStyle.set(this.centerNode, {width: ""});
    dDomStyle.set(this.frameNode, {width: width + "px"});
    this.layout();
  },

  /**
   * Computers the optimal width of the frame node, optionally excluding the center region from 
   * the calculation.
   * @param {Boolean} excludeCenter Set to true of the center region should be excluded in the calculation
   *                                and false if it should be included.
   * @public
   * @function
   */
  computeOptimalWidth: function(/*Boolean*/ excludeCenter) {
    var wideners = this.design.wideners;
    var idx1     = 0;
    var maxWidth = 0;
    for (idx1 = 0; idx1 < wideners.length; idx1++) {
      var idx2 = 0;
      var regions = wideners[idx1];
      if (excludeCenter && (regions.length > 0)
          && (regions[0] == "center")) {
        continue;
      }
      var width = 0;
      for (idx2 = 0; idx2 < regions.length; idx2++) {
        var node = this._nodeLookup[regions[idx2]];
        if (! node) continue;
        var dim = iUtil.getStaticSize(node);
        width += dim.w;
      }
      if (width > maxWidth) maxWidth = width;
    }
    return maxWidth;
  },

  /**
   * Sets the optimal height on the framing node based on the computed optimal heights of the regions.
   * @param {Boolean} excludeCenter Set to true of the center region should be excluded in the calculation
   *                                and false if it should be included.
   * @public
   * @function
   */
  setOptimalHeight: function(/*Boolean*/ excludeCenter) {
    var height = this.computeOptimalHeight(excludeCenter);
    dDomStyle.set(this.centerNode, {height: ""});
    dDomStyle.set(this.frameNode, {height: height + "px"});
    this.layout();
  },

  /**
   * Computers the optimal height of the frame node, optionally excluding the center region from 
   * the calculation.
   * @param {Boolean} excludeCenter Set to true of the center region should be excluded in the calculation
   *                                and false if it should be included.
   * @public
   * @function
   */
  computeOptimalHeight: function(/*Boolean*/ excludeCenter) {
    var heighteners = this.design.heighteners;
    var idx1     = 0;
    var maxHeight = 0;
    for (idx1 = 0; idx1 < heighteners.length; idx1++) {
      var idx2 = 0;
      var regions = heighteners[idx1];
      if (excludeCenter && (regions.length > 0)
          && (regions[0] == "center")) {
        continue;
      }
      var height = 0;
      for (idx2 = 0; idx2 < regions.length; idx2++) {
        var node = this._nodeLookup[regions[idx2]];
        if (! node) continue;
        var dim = iUtil.getStaticSize(node);
        height += dim.h;
      }
      if (height > maxHeight) maxHeight = height;
    }
    return height;
  },

  /**
   * Sets the optimal width and height on the framing node based on the computed optimal widths and
   * heights of the regions.
   *
   * @public
   * @function
   */
  setOptimalSize: function() {
    var width  = this.computeOptimalWidth();
    var height = this.computeOptimalHeight();
    dDomStyle.set(this.centerNode, {height: "", width: ""});
    dDomStyle.set(this.frameNode, {width: width + "px", height: height + "px"});
    this.layout();
  }
});
});