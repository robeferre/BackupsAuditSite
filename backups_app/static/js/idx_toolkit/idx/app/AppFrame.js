/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
        "dijit/layout/_LayoutWidget",
        "dijit/_TemplatedMixin",
        "./_A11yAreaProvider",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/dom-geometry",
        "dojo/query",
        "../a11y",
        "../util",
		"../string",
        "../border/BorderDesign",
        "../border/BorderLayout",
		"./AppMarquee",
		"./Header",
		"./Banner",
        "dojo/text!./templates/AppFrame.html",
        "dojo/NodeList-dom"],
        function(dDeclare,				// (dojo/_base_decalre)
		         dLayoutWidget,			// (dijit/layout/_LayoutWidget)
		         dTemplatedMixin,		// (dijit/_TemplatedMixin)
		         iA11yAreaProvider,		// (./_A11yAreaProvider)
		         dArray,				// (dojo/_base/array)
				 dDomConstruct,			// (dojo/dom-construct)
			 	 dDomAttr,				// (dojo/dom-attr)
				 dDomGeo,				// (dojo/dom-geometry)
				 dQuery,				// (dojo/query.NodeList)+(dojo/NodeList-dom)
				 iA11y,					// (../a11y)
				 iUtil,					// (../util)
				 iString,				// (../string)
				 iBorderDesign,			// (../border/BorderDesign)
				 iBorderLayout,			// (../border/BorderLayout)
				 iAppMarquee,			// (./AppMarquee)
				 iHeader,				// (./AppHeader)
				 iBanner,				// (./Banner)
				 templateText) 			// (dojo/text!./html/AppFrame.html)
{
	var dNodeList = dQuery.NodeList;
	
	/**
	 * @name idx.app.AppFrame
	 * @class AppFrame widget provides the basic border/frame around
	 * the application as well as any theme-defined background images.
	 * The basic layout is achieved through the use of the AppFrame,
	 * AppMarquee, TabMenuLauncher,and WorkspaceType widgets.
	 * @augments dijit._LayoutWidget
	 * @augments dijit._Templated
	 * @example
	   CSS Options can control the "design" of the BorderContainer
	   as well as which of the BorderContainer regions serves as the
	   "marquee" and "body" regions using the following CSS URL query options:
	    - marquee: [ header* | leader | center | trailer | footer ]
	    - body: [ header | leader | center* | trailer | footer ]
	    - marqueeSizing: [ auto* | fixed ]
	   <br>
	   NOTE: cssOptions are typically used for re-arranging the position of the regions such as the
	   marquee and body when changing the layout for a new theme.
	   <br>
	   Example usage:
	   &lt;div style="width: 100%; height: 100%; margin: 0; padding: 0" dojoType="idx.app.AppFrame">
	   &lt;/div>
	 */
	return dDeclare("idx.app.AppFrame",[dLayoutWidget,dTemplatedMixin,iA11yAreaProvider],
			/**@lends idx.app.AppFrame# */
{
	/**
   	 * Overrides of the base CSS class.
   	 * This string is used by the template, and gets inserted into
   	 * template to create the CSS class names for this widget.
   	 * @constant
   	 * @type String
   	 * @default "idxAppFrame"
   	 */
	baseClass: "idxAppFrame",

	/**
	 * The name of the application.
	 */
	appName: "",
	
	/**
	 * The design attribute is used to indicate the design for the AppFrame and specifically the location
	 * of the "marquee" and "body" region.  This can be set to "auto", in which case the theme will attempt
	 * to set the region using the "CSS Options" feature from idx/util.  However, you can explicitly set this
	 * to "header" to force an application header at the top or set it to "sidebar" to force a sidebar navigation.
	 *
	 * @type String
	 * @default "auto"
	 */
	design: "auto", // can be "header" or "sidebar" in addition to "auto"
	
	/**
 	 * The widget text for the dijit._Templated base class.
 	 * @constant
 	 * @type String
 	 * @default "app/templates/AppFrame.html"
 	 */
	templateString: templateText,
	
	/**
	 * The resources to use for obtaining the labels for each of the properties.
	 * The resources that are used by this include:
	 *   - gotoMainContentLabel: The hidden accessibility link label for jumping to main content.
	 *   - gotoMainNavigationLabel: The hidden accessibility link label for jumping to main navigation.
	 * @type Object
	 * @default null
	 */
	resources: null,
  
	/**
	 * Constructor
	 * Handles the reading any attributes passed via markup.
	 * @param {Object} args
	 * @param {Object} node
	 */
	constructor: function(args, node) {
		this.ctorArgs = args;
		this.domNode   = node;
	},

	/**
	 * Overrides dijit._Widget.postMixInProperties() to ensure
	 * that the dijit._Widget.attr() function is called for each
	 * property that was set.
	 * @see dijit._Widget.postMixInProperties
	 */
	postMixInProperties: function() {
		this.inherited(arguments);
		this.set(this.ctorArgs);
	},

  /**
   *
   */
  _setAppNameAttr: function(value) {
	this.appName = value;
	this._setupA11yLabel();
  },
  
  /**
   * Attempts to find the application name in child widget and reference it with aria-labelledby.
   */
  _setupA11yLabel: function() {
	// check if we have an explicit app name
	if (iString.nullTrim(this.appName)) {
		dDomAttr.remove(this.domNode, "aria-labelledby");
		dDomAttr.set(this.domNode, "aria-label", this.appName);
		return;
	}
	// if nothing explicit, then remove "aria-label" and try to "aria-labelledby"
	dDomAttr.remove(this.domNode, "aria-label");
	
	// look for an AppMarquee widget
	if (this._marquee && this._marquee.appNameNode) {
		dDomAttr.set(this.domNode, "aria-labelledby", dDomAttr.get(this._marquee.appNameNode, "id"));
		return;
	}
	
	// look for Banner widget
	if (this._banner && this._banner.containerNode) {
		dDomAttr.set(this.domNode, "aria-labelledby", dDomAttr.get(this._banner.containerNode, "id"));
		return;
	}
	
	// look for a Header widget
	if (this._header && this._header.primaryTitleTextNode) {
		dDomAttr.set(this.domNode, "aria-labelledby", 
					 dDomAttr.get(this._header.primaryTitleTextNode, "id"));
		return;
	}
	if (this._header && this._header.secondaryTitleTextNode) {
		dDomAttr.set(this.domNode, "aria-labelledby", 
					 dDomAttr.get(this._header.secondaryTitleTextNode, "id"));
		return;
	}
	
	// if no app name found them remove the "aria-labelledby" attribute
	dDomAttr.remove(this.domNode, "aria-labelledby");
  },
  
  /**
   * Overrides dijit._TemplatedMixin._fillContent() to ensure that
   * the container node is properly set via CSS options.
   * @see dijit._TemplatedMixin._fillContent
   * @param {Node} srcNodeRef
   */
  _fillContent: function(/*Node*/srcNodeRef) {

    if (this.isLeftToRight()) {
      this.leaderNode = this.leftNode;
      this.trailerNode = this.rightNode;
    } else {
      this.leaderNode = this.rightNode;
      this.trailerNode = this.leftNode;
    }

    // set the container node
    this.nodeLookup = {
      header: this.headerNode,
      top: this.headerNode,
      left: this.leftNode,
      leader: this.leaderNode,
      center: this.centerNode,
      trailer: this.trailerNode,
      right: this.rightNode,
      footer: this.footerNode,
      bottom: this.footerNode
    };

    // set the body node and marquee node
	var marqueeRegion = null;
	var bodyRegion = null;
	switch (this.design) {
		case "header":
			marqueeRegion = "header";
			bodyRegion = "center";
			break;
		case "sidebar":
			marqueeRegion = "leader";
			bodyRegion = "center";
			break;
		default: // "auto"
			marqueeRegion = this.cssOptions.marquee;
			bodyRegion = this.cssOptions.body;
	}
	
    this.marqueeNode = this.nodeLookup[marqueeRegion];
    this.bodyNode    = this.nodeLookup[bodyRegion];

    // in case the CSS is ill-formed, then log that and use defaults
    if (! this.marqueeNode) {
      console.log("Bad region name for 'marquee' node - defaulting "
                  + "to 'header': " + this.cssOptions.app);
      this.marqueeNode = this.headerNode;
    }
    if (! this.bodyNode) {
      console.log("Bad region name for 'body' node - defaulting "
                  + "to 'center': " + this.cssOptions.body);
      this.bodyNode = this.centerNode;
    }

    // create the region nodes within the marquee and the body
    var marqueeAttrs = { "class": "idxAppFrameMarquee" };
    
    this.marqueeRegion = dDomConstruct.create(
    		"div", marqueeAttrs, this.marqueeNode);
    
    var bodyAttrs = { "class": "idxAppFrameBody" }; 
    
    this.bodyRegion = dDomConstruct.create(
        "div", bodyAttrs, this.bodyNode);

    // create the lookup for the region nodes
    this.regionLookup = {
      marquee: this.marqueeRegion,
      body: this.bodyRegion
    };

    // set the container node
    this.containerNode = this.bodyRegion;

    // create the node IDs for accessibility 
    dDomAttr.set(this.marqueeRegion, "id", this.id + "_banner");
    dDomAttr.set(this.bodyRegion, "id", this.id + "_mainContent");    
    
    // defer to the parent implementation
    this.inherited(arguments);
  },
  
  /**
   * Gets the children widgets that are within the marquee region.
   */
  getMarqueeChildren: function() {
	return (this.marqueeRegion) ? dijit.findWidgets(this.marqueeRegion) : [];  
  },
  
	/**
	 * 
	 */
	_getA11yMainNode: function() {
		return this.bodyRegion;
	},
	
	/**
	 * 
	 */
	_getA11yBannerNode: function() {
		return this.marqueeRegion;
	},
	
  /**
   * Overridden to obtain CSS options before calling the base implementation.
   * Sets options, design and sizing.
   */
  buildRendering: function() {

    // get the CSS options for this class
    this.cssOptions = iUtil.getCSSOptions(this.baseClass + "Options",
                                          this.domNode);

    // set the default options if no CSS options could be found
    if (! this.cssOptions) {
      this.cssOptions = {
        marquee: "header",
        body: "center",
        marqueeSizing: "auto",
        borderDesign: "headline"
      };
    }

    // determine the marquee sizing
    this.marqueeSizing = this.cssOptions.marqueeSizing;
    if (!this.marqueeSizing) this.marqueeSizing = "auto";
    if ((this.marqueeSizing != "auto") && (this.marqueeSizing != "fixed")) {
      console.log("Unrecognized 'marqueeSizing' CSS option, defaulting to "
                  + "'auto': " + this.marqueeSizing);
      this.marqueeSizing = "auto";
    }

    // determine the border design
    this.borderDesign = this.cssOptions.borderDesign;
    if (!this.borderDesign) this.borderDesign = "headline";
    var bd = iBorderDesign.create(this.borderDesign);
    if (bd == null) {
      console.log("Unrecognized 'borderDesign' CSS option, defaulting to "
                  + "'headline': " + this.borderDesign);
      this.borderDesign = new iBorderDesign("headline");
    } else {
      this.borderDesign = bd;
    }

    // defer to the base function
    this.inherited(arguments);    
  },
  
  /**
   * postCreate - default behavior
   */
  postCreate: function() {
    this.inherited(arguments);
  },
  
  /**
   * Called at startup to create an idx.border.BorderLayout
   * given the input arguments.
   */
  startup: function() {
    if(this._started){ return; }

    this.borderLayout = new iBorderLayout({
        frameNode: this.domNode,
        topNode: this.headerNode,
        bottomNode: this.footerNode,
        leftNode: this.leftNode,
        rightNode: this.rightNode,
        centerNode: this.centerNode,
        design: this.borderDesign,
        leftToRight: this.isLeftToRight()});

    this.inherited(arguments);

    dArray.forEach(this.getChildren(), this._setupChild, this);
    
    // connect to resize events from contained BorderContainer
    this._appFrameStarted = true;
    // setup the accessibility links
    this.a11yStartup();
    // resize the widget
    this.resize();
	
	// setup the A11y label for the application
	this._setupA11yLabel();
  },
  	
  /**
   * Pass through to call the idx.border.BorderLayout 'layout' method
   */
  layout: function(){
    this.borderLayout.layout();
  },

  /**
   * Extends parent method by adding in a resize after the 
   * child node is added.
   * @param {Object} child
   * @param {int} index
   */
  addChild: function(child, index) {
    this.inherited(arguments);
    this.resize();
		
	// setup the A11y label for the application
	this._setupA11yLabel();
  },

  /**
   *
   */
  removeChild: function(child) {
	this.inherited(arguments);
	
	// check the child's type to see if app name can be inferred
	if (child === this._marquee) {
		this._marquee = null;
	} else if (child === this._banner) {
		this._banner = null;
	} else if (child === this._header) {
		this._header = null;
	}
	
	// setup the A11y label for the application
	this._setupA11yLabel();
  },
  
  /**
   * Worker method to set up the added child
   * @param {Widget} child
   */
  _setupChild: function(/*Widget*/ child) {
    this.inherited(arguments);
    var region = child.region;
    if ((region == null) || (region.length === 0)) region = "body";

    var node = this.regionLookup[region];
    if (node == null) {
      console.log("Child region unrecognized - defaulting to 'body': "
                  + region);
      node = this.bodyRegion;
    }
    
    if (node == this.bodyRegion) return;
    var nodeList = new dNodeList(child.domNode);
    nodeList.orphan();
    dDomConstruct.place(child.domNode, node, "last");
	
	// check the child's type to see if app name can be inferred
	if (child instanceof iAppMarquee) {
		this._marquee = child;
	} else if (child instanceof iBanner) {
		this._banner = child;
	} else if (child instanceof iHeader) {
		this._header = child;
	}
  },

  /**
   * Resize method that extends parent by also sizing the marquee
   * and all children as well as calling the contained borderLayout
   * 'layout' method.
   * @param {Object} changeSize
   * @param {Object} resultSize
   */
  resize: function(changeSize,resultSize) {
    if (! this._appFrameStarted) {
    	return;
    }
	var index = 0, child = null, d = null;
    // call the inherited function
    this.inherited(arguments);
    // do the border layout
    this.borderLayout.layout();

    // cycle through the marquee children
    var marqueeChildren = this.getMarqueeChildren();
    for (index = 0; index < marqueeChildren.length; index++) {
    	child = marqueeChildren[index];
    	if (! child.resize) continue;
    	if (marqueeChildren.length == 1) {
    		// single child behavior
    		d = dDomGeo.getContentBox(this.marqueeRegion);
    		changeSize = { w: d.w, h: d.h };
    	} else {
    		changeSize = changeSize || dDomGeo.getMarginBox(child.domNode);
    	}
    	child.resize(changeSize, resultSize);
    }
    
    // cycle through the body children
	var children = this.getChildren();
	for (index = 0; index < children.length; index++) {
		child = children[index];
		if (! child.resize) continue;
		if (children.length == 1) {
			// single child behavior
			d = dDomGeo.getContentBox(this.containerNode);
			changeSize = { w: d.w, h: d.h };
	    } else {
	    	changeSize = changeSize || dDomGeo.getMarginBox(child.domNode);
	    }
		child.resize(changeSize, resultSize);
	}	  

	
    // PENDING/TODO(bcaceres): Need to figure out why nested TabContainer is not
    // laying out properly unless we delay and resize it afterward.... At one
    // point it is correct (even until after this widget completely starts up, 
    // but then the tabs slide to the right and become partially obscured)
    //
    // FOLLOWUP: This appears to be fixed by a patch from Rose Hogan/Austin/IBM 
    // -- commenting out for now.  In addition to changing "getDescendants()" to
    // "getChildren()" above, the following line was added before resizing the 
    // child:
    //    changeSize = changeSize || dojo.marginBox(child.domNode);
    //
    // if (! this._autoResized) {
    //   this._autoResized = true;
    //   setTimeout(dojo.hitch(this,this.resize), 600);
    // } else {
    //   this._autoResized = false;
    // }
  }
});
});