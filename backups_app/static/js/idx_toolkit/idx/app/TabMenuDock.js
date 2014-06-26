/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
 
define(["dojo/_base/declare",
        "./_Dock",
        "dijit/_TemplatedMixin",
		"dojo/_base/html",
        "dojo/_base/kernel",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/aspect",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "dojo/dom-style",
        "dijit/_base/wai",
        "../util",
        "./WorkspaceTab",
        "dojo/text!./templates/TabMenuDock.html"],
	    function(dDeclare,
			     iDock,
			     dTemplatedMixin,
				 dHtml,
			     dKernel,			// (dojo/_base/kernel)
			     dLang,				// (dojo/_base/lang)
			     dArray,			// (dojo/_base/array)
			     dAspect,			// (dojo/aspect)
			     dDomConstruct,		// (dojo/dom-construct)
			     dDomGeo,			// (dojo/dom-geometry) for (dDomGeo.getMarginBox)
			     dDomStyle,			// (dojo/dom-style) for (dDomStyle.set)
			     dWAI,				// (dijit/_base/wai)
			     iUtil,				// (../util)
			     iWorkspaceTab,		// (./WorkspaceTab)
			     templateText) 		// (dojo/text!./templates/TabMenuDock)
{
	/**
	 * @name idx.app.TabMenuDock
	 * @class Class that houses (docks) and manages
	 * workspaces and their corresponding visual, a
	 * workspace tab. The TabMenuDock is contained
	 * in the TabMenuLauncher
	 * @augments idx.app._Dock
	 * @augments dijit._TemplatedMixin
	 * @see idx.app.WorkSpace
	 * @see idx.app.WorkSpaceTab
	 * @see idx.appTabMenuLauncher	
	 */
return dDeclare("idx.app.TabMenuDock",[iDock,dTemplatedMixin],
		/**@lends idx.app.TabMenuDock#*/
{
	/**
   	 * Indicates whether or not to show the menu for launching new tabs.  This
   	 * can be set to false to prevent showing when all the workspaces that can be
   	 * directly opened are visible at startup.
   	 * TODO: we currently ignore if set to true
   	 * @type boolean 
   	 * @default false
   	 */
  showMenu: false,  

  /**
   * Indicates whether or not the overflow menu should ALWAYS be visible 
   * regardless if there is overflow.  The overflow menu allows you to flip
   * between open tabs whether or not they are visible.  Typically, this menu 
   * will only appear if the need arises (i.e.: if there is not enough room to
   * show all open tabs).
   * @type boolean 
   * @default false
   */
  showOverflow: false,

	/**
 	 * Override of the base CSS class, set to "idxTabMenuDock".
 	 * This string is used by the template, and gets inserted into
 	 * template to create the CSS class names for this widget.
 	 * @constant
 	 * @private
 	 * @type String
 	 */
  baseClass: "idxTabMenuDock",

	/**
	 * The path to the widget template for the dijit._TemplatedMixin base class.
	 * @constant
	 * @type String
	 * @private
	 */
  templateString: templateText,

  /**
   * The class to use for the Tab widget.  If not set then an attempt is made
   * to retrieve from the CSS option "tabWidget", otherwise the default is used
   * which is idx.app.DockTab.
   * @type Object
   * @default null
   */
  tabWidgetClass: null,

	/**
	 * Constructor
	 * Constructs an instance of TabMenuDock
	 * @param {Object} args
	 * @param {Object} node
	 */
  constructor: function(args, node) {
    this._tabs = new Array();
    this._tabsByID = new Array();
    this._tabHandles = new Array();
  },

  /**
   * Override destory function to clean up handles.
   */
  destroy: function() {
  	if (this._tabHandles) {
  		var wsid = null;
  		for (wsid in this._tabHandles) {
  			var handles = this._tabHandles[wsid];
  			dArray.forEach(handles, function(handle) {
  				handle.remove();
  			});
  			delete this._tabHandles[wsid];
  		}
  	} 
  	this.inherited(arguments);
  },
  
  /**
   * Overridden to obtain CSS options before calling the base implementation.
   * Sets options, design and sizing.
   * @see dijit._TemplatedMixin implementation.
   */
  buildRendering: function() {
        // summary:
        //            Overridden to obtain CSS options before calling the base
        //            implementation.
        //
    // get the CSS options for this class
    this.cssOptions = iUtil.getCSSOptions(this.baseClass + "Options",
                                          this.domNode);

    // set the default options if no CSS options could be found
    if (! this.cssOptions) {
       this.cssOptions = {
        tabWidget: "idx.app.WorkspaceTab",
        autoHeight: "true" 
       }
    }
    if (this.cssOptions.autoHeight == "true") {
       this.cssOptions.autoHeight = true;
    } else {
       this.cssOptions.autoHeight = false;
    }

    // set the CSS option fields
    this.tabWidgetClass = iWorkspaceTab;

    this.autoHeight = this.cssOptions.autoHeight;
    
    // defer to the base function
    this.inherited(arguments);
  },

	/**
	 * Implemented to add a tab to the dock.
	 * @param {idx.app.Workspace} workspace
	 * @returns {Boolean} true
	 * @param {idx.app.Workspace
	 */
  _doAddWorkspace: function(/*Workspace*/ workspace) {
    var width = 0;
    var index = 0;
    for (index = 0; index < this._tabs.length; index++) {
     var tab = this._tabs[index];
     var box = dDomGeo.getMarginBox(tab.domNode);
     width += box.w;
    }

    // create the tab
    var tab = new this.tabWidgetClass({workspace: workspace, 
                                       tabPosition:  this._tabs.length});
    
    // register the tab
    this._tabs.push(tab);
    this._tabsByID[workspace.workspaceID] = tab;

    // attach to events on the tab
    var selectHandle = dAspect.after(tab, "onTabSelect", dLang.hitch(this, this._selectWorkspaceTab), true);
    var mouseOutHandle = dAspect.after(tab, "onTabMouseOut", dLang.hitch(this, this._onTabMouseOut), true);
    var mouseOverHandle = dAspect.after(tab, "onTabMouseOver", dLang.hitch(this, this._onTabMouseOver), true);

    var handles = new Array();
    this._tabHandles[workspace.workspaceID] = handles;
    handles.push(selectHandle);
    handles.push(mouseOutHandle);
    handles.push(mouseOverHandle);

    // place it and position it
    dDomConstruct.place(tab.domNode, this.tabsNode, "last");
    tab.startup();
    
    //For RTL languages, lay the tabs out starting on the right.
    if (dKernel._isBodyLtr()) {
	    dDomStyle.set(tab.domNode,
               { position: "absolute",
                 left: "" + width + "px"
               });
    } else {
	    dDomStyle.set(tab.domNode,
               { position: "absolute",
                 right: "" + width + "px"
               });
    }


    this.applyTabStyles();

    return true;
  },

  /**
   * Private method to apply style sheets when the user
   * exits the workspace tab.
   * Calls method 'applyTabStyles'. Resets hover vars to
   * indicate this tab/workspace is no longer active.
   * @private
   * @param {Event} event
   * @param {Object} tab
   * @param {idx.app.Workspace} workspace
   * @param {idx.app.Workspace
   */
  _onTabMouseOut: function(event, tab, workspace) {
    if (tab == this._hoverTab) {
      this._hoverTab = null;
      this._hoverIndex = -1;
    }
    this.applyTabStyles();
  },

  /**
   * Private method to apply style sheets when the user
   * exits the workspace tab.
   * Calls method 'applyTabStyles'. Sets hover vars to
   * indicate this tab/workspace is active.
   * @private
   * @param {Event} event
   * @param {Object} tab
   * @param {idx.app.Workspace} workspace
   */
  _onTabMouseOver: function(event, tab, workspace) {
    this._hoverIndex = dArray.indexOf(this._tabs, tab);
    this._hoverTab   = tab;
    this.applyTabStyles();
  },

  /**
   * Internal method that is called when the tab
   * is selected by the user clicking on it. 
   * Calls 'selectWorkspace'.
   * @private
   * @see idx.app._Dock._selectWorkspaceTab
   * @param {Event} event
   * @param {Object} tab
   * @param {idx.app.Workspace} workspace
   */
  _selectWorkspaceTab: function(event, tab, workspace) {
    this.selectWorkspace(workspace);
  },

  /**
   * Private method to handle actually selecting the workspace.
   * If this function returns false then it is assumed that the workspace
   * could not be selected.  The default implementation returns false, so you
   * must override to return true at the very least.
   * @private
   * @see idx.app._Dock._doSelectWorkspace
   * @param {idx.app.Workspace} toBeSelected - workspace to be selected
   * @param {idx.app.Workspace} previouslySelected - workspace previously selected
   * @returns {Boolean} true
   */
  _doSelectWorkspace: function(/*Workspace*/ toBeSelected,
                               /*Workspace*/ previouslySelected) {

    var toSelectTab = this._tabsByID[toBeSelected.workspaceID];

    this._selectedTab = toSelectTab;
    this._selectedIndex = dArray.indexOf(this._tabs, this._selectedTab);

    this.applyTabStyles();
    return true;
  },

  /**
   * Implemented to remove the tab for the workspace form the dock.
   * @private
   * @see idx.app._Dock._doRemoveWorkspace
   * @param {idx.app.Workspace} workspace to remove 
   * @param {boolean} selected indicator (true if selected, OTW false) 
   * @returns {boolean} true
   */
  _doRemoveWorkspace: function(/*Workspace*/ workspace, /*boolean*/ selected) {
    var tab = this._tabsByID[workspace.workspaceID];
    var tabIndex = dArray.indexOf(this._tabs, tab);
    var handles = this._tabHandles[workspace.workspaceID];
    
    dArray.forEach(handles, function(handle) {
    	if (handle) handle.remove();
    });
    
    // destroy the tab itself
    tab.destroyRecursive();

    // cleanup the arrays
    this._tabs.splice(tabIndex, 1);
    delete this._tabsByID[workspace.workspaceID];
    
    delete this._tabHandles[workspace.workspaceID];

    this.resize();

    // select an alternative tab
    if (selected) {
      var selectIndex = (this._tabs.length > tabIndex) 
                        ? tabIndex
                        : (tabIndex - 1);

      if (selectIndex >= 0) {
        var selectedTab = this._tabs[selectIndex];
        var selectedWorkspace = selectedTab.get("workspace");
        this.selectWorkspace(selectedWorkspace);
        
      } else {
      	this._selectedIndex = -1;
      }
    }
    this.applyTabStyles();
    
    // if we get here then return true
    return true;
  },
  
  /**
   * Resize taking into account CSS class size-related
   * settings (e.g. margins etc).
   */
  resize: function() {
    // reposition all tabs
    var index = 0;
    var width = 0;
    for (index = 0; index < this._tabs.length; index++) {
      var tab = this._tabs[index];
      var box = dDomGeo.getMarginBox(tab.domNode);
      //For RTL languages, lay the tabs out starting on the right.
      if (dKernel._isBodyLtr()) {
	      dDomStyle.set(tab.domNode,
                 { position: "absolute",
                   left: "" + width + "px"
                 });
      } else {
	      dDomStyle.set(tab.domNode,
                 { position: "absolute",
                   right: "" + width + "px"
                 });
      }
      width += box.w;
    }

    if (this.autoHeight) {
      var height = 0;
      var index = 0;
      for (index = 0; index < this._tabs.length; index++) {
        var tab = this._tabs[index];
        var tabBox = dDomGeo.getMarginBox(tab.domNode);
        if (tabBox.h > height) height = tabBox.h;
      }
      dDomStyle.set(this.domNode, { height: "" + height + "px" });
    }

  },

  /**
   * Apply style to tab based on the selected or
   * hovered tab, and call 'resize' so the changes 
   * can be seen.
   */
  applyTabStyles: function() {
    var index = 0;
    for (index = 0; index < this._tabs.length; index++) {
      var tab = this._tabs[index];

      tab.setState(this._tabs.length, 
                   index, 
                   this._selectedIndex, 
                   this._hoverIndex);

      if (index == this._selectedIndex) {
          dWAI.setWaiState(tab.tabNode, "selected", "true");
      } else {
          dWAI.setWaiState(tab.tabNode, "selected", "false");
      }

    }
    this.resize();
  }
});
});
