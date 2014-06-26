/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2011, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare"         ,
	    "dojo/_base/lang"            ,
	    "dojo/_base/html"            ,
        "dojo/_base/kernel"          ,
		"dojo/string"                ,
        "dojo/_base/connect"         ,
        "dojo/dom-style"             ,
        "idx/bus"                    ,
        "idx/app/_ConsoleLoaderMixin",
	    "dijit/layout/_LayoutWidget" ,
	    "dijit/_TemplatedMixin"      ,
	    "dijit/_WidgetsInTemplateMixin",
	    "dojo/text!./templates/ConsoleLayout.html",
        "idx/resources",
        "dojo/i18n!../nls/base",
        "dojo/i18n!./nls/base",
        "dojo/i18n!./nls/ConsoleLayout",
        "dijit/layout/BorderContainer", // widgets used in the template follow
        "dijit/layout/ContentPane",     
        "dijit/layout/TabContainer",       
        "dojox/layout/ContentPane",        
        "dijit/layout/StackContainer",     
        "dijit/layout/StackController",
        "idx/app/AppMarquee",
        "idx/form/Link"
	], function(dojo_declare, 
				dojo_lang, 
				dojo_html, 
				dojo_kernel, 
				dojo_string, 
				dojo_connect, 
				dojo_style, 
				idx_bus, 
				idx_app__ConsoleLoaderMixin, 
				dijit_layout__LayoutWidget, 
				dijit__TemplatedMixin,
				dijit__WidgetsInTemplateMixin,
				templateString, 
				idx_resources, 
				idx_link) {

/**
 * @name idx.app.ConsoleLayout
 * @class Templated Widget for a basic InfoSphere styled application
 * Uses supporting mixin to dynamically load from a registry and populate
 * the UI in this template.
 * @augments dijit._LayoutWidget
 * @augments dijit._Templated
 * @augments idx.app._ConsoleLoaderMixin
 * 
 */

var ConsoleLayout = dojo_declare("idx.app.ConsoleLayout",
								 [idx_app__ConsoleLoaderMixin,
								  dijit_layout__LayoutWidget,
								  dijit__TemplatedMixin,
								  dijit__WidgetsInTemplateMixin],
/**@lends idx.app.ConsoleLayout#*/
{

	/**
 	 * Constant with the path to the widget template for the 
 	 * dijit._Templated base class.
 	 * @constant
 	 * @type String
 	 * @private
 	 * @default templates/ConsoleLayout.html
 	 */
	templateString: templateString,
	
	/**
 	 * CSS class name
 	 * @private
 	 * @constant
 	 * @type String
 	 * @default "idxConsoleLayout"
 	 */
	baseClass: "idxConsoleLayout",

	/**
	 * Border Container in HTML template
	 * for central part of console frame.
	 * @private
	 * @constant
	 * @type BorderContainer
	 */
	/*BorderContainer*/_frameContainer: null,
	/**
	 * Marquee in HTML template for
	 * header of console frame.
	 * @private
	 * @constant
	 * @type AppMarquee
	 */
	/*AppMarquee*/marqueeNode: null,
	
	/**
	 * Stack Container in HTML template
	 * @private
	 * @constant
	 * @type StackContainer
	 */
	/*StackContainer*/ _container: null,

	/**
	 * Context sensitive help URL which is the help url
	 * of the UI element with focus.
	 * @type String
	 * @default "http://www.ibm.com"
	 */
	/* String*/ _helpUrl:		"http://www.ibm.com",
    
	/**
	 * Dojo Topic name for notifications relating to application control
	 * @type String
	 * @default {idx.bus.NOTIFICATIONS}
	 */
    topic: idx_bus.NOTIFICATIONS,
	
    /**
	 * Counter used to indicate if a context switcher area is
	 * needed. If there are 2 contexts or more to show, then we
	 * need a switcher area to be visible.
	 * @type int
	 * @private
	 * @default 0
	 */
    /*int*/numCxt:	"0",
    
    /**
     * Flag indicating if status bar area at bottom of console is visible 
     * @type boolean
	 * @default false
     */
    hasStatusBar: false,
    
	/**
	 * NLS messages
	 * @type Object
	 * @default {}
	 */
    msg : {},
    
	/**
 	 * vendor name in marquee
 	 * @constant
 	 * @type String
 	 * @default "IBM &#0174;"
 	 */
    vendorName: "IBM &#0174;",
    
	/**
 	 * vendor logo in marquee
 	 * @constant
 	 * @type String
 	 * @default "<module-url>/resources/claro/vendorLogoWhite.png"
 	 */
	vendorLogo:  dojo_kernel.moduleUrl("idx")+"/themes/oneui/idx/images/vendorLogoWhite.png",
	
	/**
 	 * user name in marquee
 	 * @constant
 	 * @type String
 	 * @default null
 	 */
	username:    "",
	
	/**
 	 * expanded marquee welcome message
 	 * @constant
 	 * @type String
 	 * @default ""
 	 */
	welcome:     "",
	
	/**
	 * whether about link should be displayed or not
	 * @type boolean
	 * @default true
	 */
	includeAbout: true,
	
	/**
	 * Default constructor
	 * Note: If user sets inherited field "title".
	 * it will be used as the frame marquee/banner
	 * name as well as browser title (document.title).
	 * @param {Object} args
	 */
    constructor: function(args) { 
		// Add NLS messages to "msg" field
    	this.msg = idx_resources.getResources("idx/app/ConsoleLayout", this.lang);
		if (args) { dojo_lang.mixin(this,args); }
		
		dojo_connect.subscribe(
				this.topic ,
				dojo_lang.hitch(this, this._receiveNotification)
		);		
	},
	
	/**
	 * Prepares this object to be garbage-collected
	 */
	destroy: function(){
		this.inherited(arguments);
		// placeholder for cleanup actions
	},
	
	/**
	 * Post rendering processing. 
	 * Uses mixin to dynamically populate console
	 */
    postCreate : function() {
    	this.inherited(arguments);
    	this.loadUIFromRegistry(); // Dynamically populate UI   
    	// If more than one context switcher, show buttons to switch
    	
    	//Defect 5965: changed this._ctxSwitcher.id to this._ctxSwitcher.domNode
    	//For some reason, at this point in the lifecycle _ctxSwitcher
    	//does have an id, but dojo.byId on it does not find it
    	dojo_html.toggleClass(this._ctxSwitcher.domNode, "dijitHidden", this.numCtx < 2);
    	if(this.hasStatusBar) { dojo_style.set(this.footerNode.domNode, "display", "inline"); }
		
    	this.set("title", this.title);
        this.set("username", this.username);
        this.set("includeAbout",this.includeAbout);
		
		//remove tooltip
		this.domNode.title = "";

      // Set up connections to header links, about, helpe and logout
      this.aboutNode.onClick  = dojo_lang.hitch(this,this.onAbout);
      this.helpNode.onClick   = dojo_lang.hitch(this,this.onHelp);
      this.logoutNode.onClick = dojo_lang.hitch(this,this.onLogout);

    },
    
	
	/**
	 * 
	 * @see dijit.layout._LayoutWidget.layout
	 */
	layout: function()
	{
	    this._frameContainer.layout();
	    if(this.marqueeNode.layout)this.marqueeNode.layout();
	    this.inherited(arguments);
	},
	
	  /**
	   * Extends parent method by adding in a resize after the 
	   * child node is added.
	   * @param {Object} child
	   * @param {int} index
	   * @see dijit.layout._LayoutWidget.addChild
	   */
	  addChild: function(/*_LayoutWidget*/ child,/*int*/ index)
	  {
	    this.inherited(arguments);
	    this.resize();
	  },

	  /**
	   * Extends parent method 
	   * @param {Object} child
	   * @see dijit.layout._LayoutWidget.removeChild
	   */
	  removeChild: function(/*_LayoutWidget*/child)
	  {
	    this.inherited(arguments);
	    this.resize();
	  },
	  
	  /**
	   * Resize method that extends parent by also sizing the children
	   *
	   * @param {Object} changeSize
	   * @param {Object} resultSize
	   * @see dijit.layout._LayoutWidget.resize
	   */
	  resize: function(changeSize,resultSize)
	  {
	    if (! this._started) return;	    
	    this.inherited(arguments);	    
	    this._frameContainer.resize();
	    this.layout();
	  },
	  
	  /**
	   * Method called when 'help' link is clicked
	   */
	  onHelp: function()  {
		  var MN = this.declaredClass+".onHelp ";
		  window.open(this._helpUrl,"Help");		
	  },
	
	/**
	 * Method called when 'log out' link is clicked
	 */
	onLogout: function() {		
		var MN = this.declaredClass+".onLogout ";
		alert("onLogout - method not overridden by caller..");
	},

	/**
	 * Method called when 'about' link is clicked
	 */
	onAbout: function()  {
		var MN = this.declaredClass+".onAbout ";
		alert("onAbout - method not overridden by caller...");
	},
	
	//---------------------------------------------------------------	
	// Private worker methods
	//---------------------------------------------------------------
    
	/**
	 * Receive notifications relating to application control
	 * @param {Message} event
	 */
	_receiveNotification: function(/*Message*/ event) {
		var MN = this.declaredClass+"._receiveNotification";
		console.debug(MN,"name="+event.name,"type="+event.type,"event:",event);//tmp
    },
    

    _setTitleAttr: function(/*String*/title) {
        this.title = title;
        document.title = this.title;
        this.marqueeNode.set("appName", this.title);
    },
    
    _setUsernameAttr: function(/*String*/username) {
        this.username = username;
        dojo_html.toggleClass(this.logoutNode.domNode, "dijitHidden", !this.username || this.username == "");
        //dojo_style.set(this.logoutNodeWrapper, "display", (this.username && this.username != "") ? "inline" : "none");             
        if(this.welcome) {
            // welcome message overridden - don't change it
            return;
        }

        // update welcome message
        var msg;
        if(this.username && this.username != "") {
            msg = dojo_string.substitute( this.msg.userNameMessage,{"username": this.username} );
        }
        else {
            msg = ""; //todo: if other teams need to show just "Welcome" then we need to add a flag to hide welcome and show this.msg.noUserNameMessage here
        }
        this.welcomeNode.innerHTML =  msg;
    },
    
    _setIncludeAboutAttr: function(/*boolean*/include) {
    	
    	this.includeAbout = include;
    	
    	//dojo_style.set(this.aboutNode, "display", this.includeAbout ? "inline" : "none");
    	dojo_html.toggleClass(this.aboutNode.domNode, "dijitHidden", !this.includeAbout);
    }
});

return ConsoleLayout;

});