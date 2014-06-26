/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
        "dojo/_base/lang"],
        function(dDeclare,dLang) {
	var _ltrLookup = {
			  leaderbar: "leftbar",
			  trailerbar: "rightbar",
			  forward: "clock",
			  reverse: "counterclock",
			  leaderfwd: "leftclock",
			  leaderrev: "leftcounter",
			  trailerfwd: "rightclock",
			  trailerrev: "rightcounter"
	};

	var _rtlLookup = {
			  leaderbar: "rightbar",
			  trailerbar: "leftbar",
			  forward: "counterclock",
			  reverse: "clock", 
			  leaderfwd: "rightcounter",
			  leaderrev: "rightclock",
			  trailerfwd: "leftcounter",
			  trailerrev: "leftclock"
	};

	var _lookup = {
			  headline: {
			    topStyler:    {left: "0px", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "bottom" },
			    bottomStyler: {left: "0px", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["top", "left", "bottom"],
			                   ["top", "right", "bottom"],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["top"],
			                ["bottom"],
			                ["center", "left", "right"] ] },

			  sidebar: {
			    topStyler:    {left: "left", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "0px" },
			    bottomStyler: {left: "left", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["left" ],
			                   ["right" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["left", "top", "right"],
			                ["left", "bottom", "right"],
			                ["center", "left", "right"] ] },

			  topline: {
			    topStyler:    {left: "0px", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "0px" },
			    bottomStyler: {left: "left", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["left", "top" ],
			                   ["right", "top" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["top"],
			                ["left", "bottom", "right"],
			                ["center", "left", "right"] ] },

			  bottomline: {
			    topStyler:    {left: "left", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "bottom" },
			    bottomStyler: {left: "0px", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["left", "bottom" ],
			                   ["right", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["bottom"],
			                ["left", "top", "right"],
			                ["center", "left", "right"] ] },

			  leftbar: {
			    topStyler:    {left: "left", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "bottom" },
			    bottomStyler: {left: "left", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["left" ],
			                   ["top", "right", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["left", "top"],
			                ["left", "bottom"],
			                ["center", "left", "right"] ] },

			  rightbar: {
			    topStyler:    {left: "0px", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "0px" },
			    bottomStyler: {left: "0px", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["right" ],
			                   ["top", "left", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["right", "top"],
			                ["right", "bottom"],
			                ["center", "left", "right"] ] },

			  clockwise: {
			    topStyler:    {left: "left", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "0px" },
			    bottomStyler: {left: "0px", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["left", "bottom" ],
			                   ["right", "top" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["right", "bottom"],
			                ["left", "top"],
			                ["center", "left", "right"] ] },

			  counterclock: {
			    topStyler:    {left: "0px", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "bottom" },
			    bottomStyler: {left: "left", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["left", "top" ],
			                   ["right", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["right", "top"],
			                ["left", "bottom"],
			                ["center", "left", "right"] ] },

			  topclock: {
			    topStyler:    {left: "0px", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "0px" },
			    bottomStyler: {left: "0px", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["right", "top" ],
			                   ["left", "top", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["top"],
			                ["right", "bottom"],
			                ["center", "left", "right"] ] },

			  topcounter: {
			    topStyler:    {left: "0px", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "bottom" },
			    bottomStyler: {left: "left", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["left", "top" ],
			                   ["right", "bottom", "top" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["top"],
			                ["left", "bottom"],
			                ["center", "left", "right"] ] },

			  bottomclock: {
			    topStyler:    {left: "left", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "bottom" },
			    bottomStyler: {left: "0px", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["left", "bottom" ],
			                   ["right", "bottom", "top" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["bottom"],
			                ["left", "top"],
			                ["center", "left", "right"] ] },

			  botttomcounter: {
			    topStyler:    {left: "0px", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "bottom" },
			    bottomStyler: {left: "0px", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["right", "bottom" ],
			                   ["left", "bottom", "top"],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["bottom"],
			                ["right", "top"],
			                ["center", "left", "right"] ] },

			  leftclock: {
			    topStyler:    {left: "left", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "0px" },
			    bottomStyler: {left: "left", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["left" ],
			                   ["right", "top" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["left", "top"],
			                ["left", "right", "bottom"],
			                ["center", "left", "right"] ] },

			  leftcounter: {
			    topStyler:    {left: "left", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "bottom" },
			    bottomStyler: {left: "left", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["left" ],
			                   ["right", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["left", "bottom"],
			                ["right", "top", "right"],
			                ["center", "left", "right"] ] },

			  rightclock: {
			    topStyler:    {left: "left", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "0px" },
			    bottomStyler: {left: "0px", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["right" ],
			                   ["left", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["right", "bottom"],
			                ["right", "left", "top"],
			                ["center", "left", "right"] ] },

			  rightcounter: {
			    topStyler:    {left: "0px", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "0px" },
			    bottomStyler: {left: "left", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["right" ],
			                   ["left", "top" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["right", "top"],
			                ["right", "left", "bottom"],
			                ["center", "left", "right"] ] }
	};
	
	/** 
	 * Encapsulates the meta-data used to render the various border design modes for border layouts.  The 
	 * recognized border designs are:
	 * <ul>
	 * <li>"headline" - top and bottom regions on expand to borders
	 * <pre>
	         +-------------------+
	         |                   |
	         |--+-------------+--|
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         |--+-------------+--|
	         |                   |
	         +-------------------+
	   </pre>
	 * </li>
     * <li>"sidebar" - left and right regions expand to borders
	 * <pre>
	         +--+-------------+--+
	         |  |             |  |
	         |  |-------------|  |
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         |  |-------------|  |
	         |  |             |  |
	         +--+-------------+--+
	   </pre>
     * </li>
     * <li>"topline" - top region expands to borders, left & right regions expand to bottom border
	 * <pre>
	         +-------------------+
	         |                   |
	         |--+-------------+--|
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         |  |-------------|  |
	         |  |             |  |
	         +--+-------------+--+
	   </pre>
     * </li>
     * <li>"bottomline" - bottom region expands to borders, left & right regions expand to top border
	 * <pre>
	         +--+-------------+--+
	         |  |             |  |
	         |  |-------------|  |
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         |--+-------------+--|
	         |                   |
	         +-------------------+
	   </pre>
     * </li>
     * <li>"leftbar" - left region expands to borders, top & bottom regions expand to right border
	 * <pre>
	         +--+----------------+
	         |  |                |
	         |  |-------------+--+
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         |  |-------------+--+
	         |  |                |
	         +--+----------------+
	   </pre>
     * </li>
     * <li>"rightbar" - right region expands to border, top & bottom region expand to left border
	 * <pre>
	         +----------------+--+
	         |                |  |
	         +--+-------------|  |
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         +--+-------------|  |
	         |                |  |
	         +----------------+--+
	   </pre>
     * </li>
     * <li>"clockwise" - clock-wise leading edge of each region expands to border
	 * <pre>
	         +--+----------------+
	         |  |                |
	         |  |-------------+--+
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         +--+-------------|  |
	         |                |  |
	         +----------------+--+
	   </pre>
     * </li>
     * <li>"counterclock" - counter-clockwise leading edge of each region expands to border 
	 * <pre>
	         +----------------+--+
	         |                |  |
	         +--+-------------|  |
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         |  |-------------+--+
	         |  |                |
	         +--+----------------+
	   </pre>
     * </li>
     * <li>"topclock" - top region expands to borders, otherwise clockwise lead edges expand to borders
	 * <pre>
	         +-------------------+
	         |                   |
	         +--+-------------+--+
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         +--+-------------|  |
	         |                |  |
	         +----------------+--+
	   </pre>
     * </li>
     * <li>"topcounter" - top region expands to borders, otherwise counter-clockwise lead edges expand to borders
	 * <pre>
	         +-------------------+
	         |                   |
	         +--+-------------+--+
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         |  |-------------+--+
	         |  |                |
	         +--+----------------+
	   </pre>
     * </li>
     * <li>"bottomclock" - bottom region expands to borders, otherwise clockwise lead edges expand to borders
	 * <pre>
	         +--+----------------+
	         |  |                |
	         |  |-------------+--+
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         +--+-------------+--+
	         |                   |
	         +-------------------+
	   </pre>
     * </li>
     * <li>"bottomcounter" - bottom region expands to borders, otherwise counter-clockwise lead edges expand to borders
	 * <pre>
	         +----------------+--+
	         |                |  |
	         +--+-------------|  |
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         +--+-------------+--+
	         |                   |
	         +-------------------+
	   </pre>
     * </li>
     * <li>"leftclock" - left region expands to borders, otherwise clockwise lead edges expand to borders
	 * <pre>
	         +--+----------------+
	         |  |                |
	         |  |-------------+--+
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         |  +-------------|  |
	         |  |             |  |
	         +--+-------------+--+
	   </pre>
     * </li>
     * <li>"leftcounter" - left region expands to borders, otherwise counter-clockwise lead edges expand to borders 
	 * <pre>
	         +--+-------------+--+
	         |  |             |  |
	         |  +-------------|  |
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         |  +-------------+--+
	         |  |                |
	         +--+----------------+
	   </pre>
     * </li>
     * <li>"rightclock" - right region expands to borders, otherwise clockwise lead edges expand to borders
	 * <pre>
	         +--+-------------+--+
	         |  |             |  |
	         |  |-------------|  |
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         +--+-------------|  |
	         |                |  |
	         +----------------+--+
	   </pre>
     * </li>
     * <li>"rightcounter" - right region expands to borders, otherwise counter-clockwise lead edges expand to borders 
	 * <pre>
	         +----------------+--+
	         |                |  |
	         +--+-------------|  |
	         |  |             |  |
	         |  |             |  |
	         |  |             |  |
	         |  |-------------|  |
	         |  |             |  |
	         +--+-------------+--+
	   </pre>
     * </li>
     * </ul>
     *
     * If the right-to-left mode is specified then the following names are also recognized:
     * <ul>
     * <li>"leaderbar" - equivalent to "leftbar" in LTR or "rightbar" in RTL</li>
     * <li>"trailerbar" - equivalent to "rightbar" in LTR or "leftbar" in RTL</li>
     * <li>"forward" - equivalent to "clock" in LTR or "counterclock" in RTL</li>
     * <li>"reverse" - equivalent to "counterclock" in RTL or "clock" in RTL</li>
     * <li>"leaderfwd" - equivalent to "leftclock" in LTR or "rightcounter" in RTL</li>
     * <li>"leaderrev" - equivalent to "leftcounter" in LTR or "rightclock" in RTL </li>
     * <li>"trailerfwd" - equivalent to "rightclock" in LTR or "leftcounter" in RTL</li>
     * <li>"trailerrev" - equivalent to "rightcounter" in LTR or "leftclock" in RTL</li>
     * </ul>
     *
     * @name idx.border.BorderDesign
     * @public
     * @class
	 */
	var BorderDesign = dDeclare("idx.border.BorderDesign", null,
			/**@lends idx.border.BorderDesign#*/						
{
  /**
   * The array indicating how to style the top region
   * @field
   * @private
   */
  topStyler: null,

  /**
   * The array indicating how to style the left region
   * @field
   * @private
   */
  leftStyler: null,

  /**
   * The array indicating how to style the right region
   * @field
   * @private
   */
  rightStyler: null,

  /**
   * The array indicating how to style the bottom region
   * @field
   * @private
   */
  bottomStyler: null,

  /**
   * The array indicating which components can make the height.
   * @field
   * @private
   */
  heighteners: null,

  /**
   * The array indicating which components can make the width.
   * @field
   * @private
   */
  wideners: null,

  /**
   * Constructs a BorderDesign instance with a name and a boolean indicating
   * whether it is for left-to-right or right-to-left.
   *
   * @public
   * @param {String} name The name of the BorderDesign (see class documentation for possible values)
   * @param {Boolean} leftToRight If specified then the specified name may use the "leader" and "trailer"
   *                              variants and a lookup is performed.  If not specified then the "leader"
   *                              and "trailer" names are not allowed.   Set to true if for left-to-right,
   *                              or false if for right-to-left. 
   */
  constructor: function(/*String*/ name, /*Boolean?*/ leftToRight) {
    this.name = name;

    if (leftToRight != null) {
      var lookup = (leftToRight) ? _ltrLookup : _rtlLookup;
      if (name in lookup) name = lookup[name];
    }

    var args = _lookup[name];
    if (!args) {
      throw new Error(this.declaredClass + ": Unrecognized BorderDesign name: " + name);
    }
    this.topStyler    = dLang.clone(args.topStyler);
    this.leftStyler   = dLang.clone(args.leftStyler);
    this.rightStyler  = dLang.clone(args.rightStyler);
    this.bottomStyler = dLang.clone(args.bottomStyler);
    this.heighteners  = dLang.clone(args.heighteners);
    this.wideners     = dLang.clone(args.wideners);
  }
});
	
	BorderDesign._lookup = _lookup;
	BorderDesign._ltrLookup = _ltrLookup;
	BorderDesign._rtlLookup = _rtlLookup;
	
	/**
	 * Similar to the constructor, but if a bad name is provided then null is returned.
     *
     * @function
     * @name idx.border.BorderDesign.create
     * @public
     * @static
     *
     * @param {String} name The name of the border design (see class documentation for possible values).
	 *
	 * @param {Boolean} leftToRight If specified then the specified name may use the "leader" and "trailer"
	 *                              variants and a lookup is performed.  If not specified then the "leader"
     *                              and "trailer" names are not allowed.
	 *
	 */
	BorderDesign.create = function(/*String*/ name,  /*Boolean?*/ leftToRight) {
		try {
			var bd = new BorderDesign(name, leftToRight);
			return bd;
		} catch (e) {
			return null;
		}
	};

	return BorderDesign;
});
