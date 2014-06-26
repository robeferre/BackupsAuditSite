/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
		"dojo/aspect",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/_base/lang",
        "dojo/query",
        "dojo/dom-class",
        "dojo/dom-attr",
        "dojo/_base/event",
        "../string",
        "../util",
        "../resources",
        "dojo/text!./templates/HoverHelp.html",
        "dijit/form/DropDownButton",
        "idx/widget/TooltipDialog",
        "../ext",
        "dojo/i18n!../nls/base",
        "dojo/i18n!./nls/base",
        "dojo/i18n!./nls/HoverHelp"
        ],
        function(dDeclare,					// (dojo/_base/declare)
        		 dAspect,					// (dojo/aspect)
		         dWidget,					// (dijit/_Widget)
		         dTemplatedMixin,			// (dijit/_TemplatedMixin)
		         dWidgetsInTemplateMixin, 	// (dijit/_WidgetsInTemplateMixin)
		         dLang,						// (dojo/_base/lang)
		         dQuery,					// (dojo/query)
		         dDomClass,					// (dojo/dom-class) for (dDomClass.add/remove)
		         dDomAttr,					// (dojo/dom-attr) for (dDomAttr.set/remove)  
		         dEvent,					// (dojo/event)          
		         iString,					// (../string)
		         iUtil,						// (../util)
		         iResources,				// (../resources)
		         templateText)				// (dojo/text!./templates/HoverHelp.html)   
{
	// the default profile value
	var defaultProfile = "standard";

	// the lookup table for profile CSS class suffixes
	var profileCSSLookup = {
		standard: "ProfileStandard",
		compact: "ProfileCompact"
	};
	
	/**
	 * @name idx.widget.HoverHelp
	 * @class Provides a button-like widget for context-sensitive hover help.
	 * @augments dijit._Widget
	 * @augments dijit._TemplatedMixin
	 * @augments dijit._WidgetsInTemplateMixin
	 * @example
	   Example usage:
	  	&lt;div dojoType="dijit.form.TextBox">&lt;/div>
	  	&lt;div dojoType="idx.widget.HoverHelp" message="Hello, World!"
	    href="http://www.ibm.com">&lt;/div>
	 */
  var iHoverHelp = dDeclare("idx.widget.HoverHelp",[dWidget,dTemplatedMixin,dWidgetsInTemplateMixin],
		  /**@lends idx.widget.HoverHelp#*/	
{ 
  /**
   * This is the HTML message content to display in the popup.  If this is not 
   * specified, the widget attempts to lookup its content in the resources using 
   * the key formed by concatenating messageKeyPrefix, topicID, and 
   * messageKeySuffix.  If no content can be determined then default text is
   * displayed indicating that no help has been defined.
   * @type String
   * @default ""
   */
  message: "",

  /**
   * The URL or path to use for launching a new window with additional help on 
   * the topic.  If this is not privided then an attempt is made to lookup the
   * href in the resources using the key formed by concatenating hrefKeyPrefix, 
   * topicID, and hrefKeySuffix.  If no href can be found, then no link is shown 
   * for additional help.  If provided, a link is displayed using the
   * "moreInfoLabel".
   * @type String
   * @default 
   */
  href: "",

  /**
   * The prefix to prepend to the provided HREF.  Typically this is set through
   * the provided or installed resources, however, it can be overridden here.
   * If this value is not provided the default value will be taken from resources
   * using the "idx.widget.HoverHelp" scope and the "baseHref" key.  The default
   * value for this is empty-string.
   * @type String
   * @default ""
   */
  baseHref: "",

  /**
   * Alternatively to directly specifying the message or the href, the 
   * message ID can be specified in order to trigger lookup of the message in 
   * the provided resources object.  When looking up the message by message ID 
   * the key used for lookup is constructed by concatenating the 
   * messageKeyPrefix, the topicID, and the messageKeySuffix.  When looking up 
   * the href, the key for lookup is constructed by concatenating the
   * hrefKeyPrefix, topicID, and the hrefKeySuffix.  If no topicID is provided 
   * then no such lookups are performed.
   * @type String
   * @default ""
   */
  topicID: "",

  /**
   * This is the text label to give to the link that launches the external help 
   * system in a new window.  If this is not specified during construction, the
   * default is obtained from resources using the "idx.widget.HoverHelp" scope
   * and the "moreInfoLabel" key.  The default text will be something like 
   * "Learn more...".
   * @type String
   * @default ""
   */
  hrefLabel: "",

 /**
   * The prefix to prepend to the topicID to create the key for looking up the
   * message in the resources.  If this value is not provided the default value
   * will be taken from resources using the "idx.widget.HoverHelp" scope and
   * the "messageKeyPrefix" key.  The default value for this is "topic_".
   * @type String
   * @default ""
   */
  messageKeyPrefix: "",

  /**
   * The suffix to append to the topicID to create the key for looking up the 
   * message in the resources.  If this value is not provided the default value
   * will be taken from resources using the "idx.widget.HoverHelp" scope and
   * the "messageKeySuffix" key.  The default value for this is "_message".
   * @type String
   * @default ""
   */
  messageKeySuffix: "",

  /**
   * The prefix to prepend to the topicID to create the key for looking up the
   * href in the resources.  If this value is not provided the default value
   * will be taken from resources using the "idx.widget.HoverHelp" scope and
   * the "hrefKeyPrefix" key.  The default value for this is "topic_".
   * @type String
   * @default ""
   */
  hrefKeyPrefix: "",

  /**
   * The suffix to append to the topicID to create the key for looking up the
   * href in the resources.  If this value is not provided the default value
   * will be taken from resources using the "idx.widget.HoverHelp" scope and
   * the "hrefKeySuffix" key.  The default value for this is "_href".
   * @type String
   * @default ""
   */
  hrefKeySuffix: "",

  /**
   * The resources to use for optionally obtaining the message and href for this
   * instance.  This is also used to obtain the default resources used by this 
   * instance.  If not specified the default resources are pulled from 
   * idx.resources using the "idx.widget.HoverHelp" scope.  Any resources not 
   * overridden fallback to the default resources.
   *
   * The default resources that are used by this include:
   *   - defaultHrefLabel: The label for the href linking to additional information.
   *   - defaultTitle: Default title to use for the button.
   *   - defaultMessage: Text to display when the message has not been defined.
   *   - baseHref: The base Href to prepend to all hrefs provided.
   *
   * Typically, one would specify a resources attribute that defines messages and
   * hrefs for one or more topicIDs and the same object would be shared among 
   * many instances of this widget, with each one pulling its message and href 
   * using a different topicID.
   * @type Object
   * @default null
   */
  resources: null,
  
  /**
   * The delay (in milliseconds) before the hover help is shown.  This is ignored
   * if "clickToOpen" is set to true since hovering does not open the hover help in
   * that case. 
   */
  showDelay: 400,

  /**
   * The delay (in milliseconds) before the hover help is hidden when hovering ceases.
   * This is ignored if "clickToOpen" is set to true since you must then click to close.
   */
  hideDelay: 800,
    
  /**
   * Set this to true if you want the help message to only open when clicked
   * rather than when hovered.
   */
  clickToOpen: false,
  
  /**
   * The flag indicating if this widget is disabled.
   */
  disabled: false,

  /**
   * Indication of whether or not the "compact" icon is desired instead of the
   * "standard" icon.  Typically the compact icon is used when many form fields
   * are clustered together with HoverHelp in order to prevent the help icons
   * from overwhelming the appearance of the form.  The standard icon is used
   * when the HoverHelp icon needs to stand out on the page and typically when
   * it is one of only a few HoverHelp icons displayed on the page.
   * <p>
   * The default for all instances can be controlled via the 
   * idx.widget.HoverHelp.setDefaultProfile() function.  If not set then the
   * default is "standard". 
   * 
   * @default "standard"
   */
  profile: "",
  
	/**
 	 * Overrides of the base CSS class.
 	 * This string is used by the template, and gets inserted into
 	 * template to create the CSS class names for this widget.
 	 * @private
 	 * @constant
 	 * @type String
 	 * @default "idxHoverHelp"
 	 */
  baseClass: "idxHoverHelp",

  /**
   * Defaults for high-contrast mode (when they cannot be discerned from the theme). 
   */
  idxHCDefaults: "clickToOpen=false&showDelay=600",
  
	/**
	 * The path to the widget template for the dijit._TemplatedMixin base class.
	 * @constant
	 * @type String
	 * @private
	 * @default templateText value
	 */ 
  templateString: templateText,

	/**
	 * Constructor
	 * Handles the reading any attributes passed via markup.
	 * @param {Object} args
	 * @param {Object} node
	 */
  constructor: function(args, node) {
    this._started = false;
    this._built   = false;
  },

  /**
   * Overrides dijit._Widget.postMixInProperties() to ensure
   * that the dijit._Widget.attr() function is called for each
   * property that was set.
   * @see dijit._Widget.postMixInProperties
   */
  postMixInProperties: function() {
	// nullify some fields that were not explicitly set
    iUtil.nullify(this, this.params, 
    		["messageKeyPrefix",
    		 "messageKeySuffix",
    		 "hrefKeyPrefix",
    		 "hrefKeySuffix",
    		 "baseHref",
    		 "title"]);
    
    this.inherited(arguments);
    this._defaultResources 
      = iResources.getResources("idx/widget/HoverHelp", this.lang);
  },

  /**
   * Overridden to update contained entities.
   */
  buildRendering: function() {
    this.inherited(arguments);
    this._built = true;
    this._updateProfile();
    this._updateMessage();
    this._updateHref();
    this._updateTitle();
    this._updateHrefLabel();
  },
  
  
  /**
   * Private method overridden to set the fill message
   * @see dijit._Widget._fillContent
   * @param {String} source
   * @private
   */
  _fillContent: function(source) {
    this.inherited(arguments);
    this._fillMessage = iString.nullTrim(this.containerNode.innerHTML);
  },


  /**
   * Private worker. Sets the language
   * @param {Object} value
   * @private
   */
  _setLangAttr: function(/*Object*/ value) {
    this.inherited(arguments);
    this.lang = value;
    this._resetResources();
  },

  /**
   * Private method.  Sets the disabled flag.
   * @param {Boolean} value
   * @private
   */
  _setDisabledAttr: function(/*Boolean*/ value) {
	this.disabled = value;
	this._button.set("disabled", value);
  },
  
  /**
   * Private worker. Handles resetting the saved resources.
   * @param {Object} value
   * @private
   */
  _setResourcesAttr: function(/*Object*/ value) {
    this.resources = value;
    this._resetResources();
  },

  /**
   * Private worker. Resets resources
   * by calling update methods for each.
   * @param {Object} value
   * @private
   */
  _resetResources: function() {
    this._updateMessage();
    this._updateTitle();
    this._updateHref();
    this._updateHrefLabel();
  },

  /**
   * Private convenience method to look up a resource
   * @param {String} key in resource file
   * @returns {String} result (message)
   * @private
   */
  _resourceLookup: function(key) {
    var result = null;
    if (this.resources) result = this.resources[key];
    if (! result) result = this._defaultResources[key];
    return result;
  },

  /**
   * Called at startup to set state and update all the
   * contained resources like the message and href.
   * Also attaches the contained dialog's orient method
   * for tooltips.
   */
  startup: function() {
    this.inherited(arguments);
    var buttonOpts = iUtil.getCSSOptions(this.baseClass + "ButtonOptions", this.domNode, this._button,
    									 {placement: 'toolbar', buttonType: 'help', displayMode: 'iconOnly'});
    if (buttonOpts) {
    	for (field in buttonOpts) {
    		console.log("BUTTON FIELD[ " + field + "] = " + buttonOpts[field]);
    		this._button.set(field, buttonOpts[field]);		
    	}
		this._updateTitle();
    }
    
    this._started = true;
    this._updateMessage();
    this._updateHref();
    this._updateHrefLabel();
    
    // remove/restore title when help is shown/hidden to avoid double-hover
    dAspect.after(this._button, "openDropDown", dLang.hitch(this, this._removeTitle), true);
    dAspect.after(this._button, "closeDropDown", dLang.hitch(this, this._restoreTitle), true);
   	
    // attach for the orentiation callback
    this.own(dAspect.after(this._dialog,"orient",dLang.hitch(this,this._orient), true));
    
    var self = this;
    this._docHandlers = [];
    this._attachCount = 0;
    
    dAspect.before(this._button, "_onDropDownMouseDown", function(e) {
		if(self._button.disabled || self._button.readOnly){ return [e]; }
		var docHandler = self._button._docHandler;
    	if (docHandler) {
    		self._button.disconnect(docHandler);
    		if (self._button._docHandler === docHandler) delete self._button._docHandler;
    		else delete docHandler;
    	}
    	return [e];
    });
    

    dAspect.before(this._button, "_onDropDownMouseUp", function(e) {
    	var docHandler = self._button._docHandler;
    	if (e && docHandler) {
    		self._button.disconnect(docHandler);
    		if (self._button._docHandler === docHandler) delete self._button._docHandler;
    		else delete docHandler;
    	}
    	return [e];
    });
  },

  /**
   * Internal method for handling focus events to route to the button.
   * 
   * @private
   */
  _onFocus: function() {
	 if (this._button.focus)  {
		 this._button.focus();
	 } else if (this._button.focusNode) {
		 this._button.focusNode.focus();
	 }
  },
  
  /**
   * 
   */
  _doOpen: function() {
  	  if (this._hideTimer) {
  			if (this._showTimer) {
  				clearTimeout(this._showTimer);
  				delete this._showTimer;
  			}
  			return;
  	  }
	  if (!this._button._opened) {
		  this._button._onDropDownMouseDown({preventDefault: function(){}});		  
	  }
	  if (this._showTimer) {
	  	clearTimeout(this._showTImer);
	  	delete this._showTimer;
	  }
  },
  
  /**
   * Callback to handle the hover event.
   */
  _handleMouseOver: function(e) {
  	  
	  if (this.clickToOpen) return;
	  this._removeTitle();
	  if (this._hideTimer) {
	  	clearTimeout(this._hideTimer);
	  	delete this._hideTimer;
	  }
	  if (!this._button._opened) {
 	      dEvent.stop(e);
	  	  e.preventDefault();
	  	  if (! this._showTimer) {
			  this._showTimer = setTimeout(dLang.hitch(this, function(){this._doOpen();}), this.showDelay);
		  }
	  }
  },
  
  /**
   *
   */
  _doClose: function(e) {
  		if (this._showTimer) {
  			if (this._hideTimer) {
  				clearTimeout(this._hideTimer);
  				delete this._hideTimer;
  			}
  			return;
  		}
		// avoid stealing focus on simulated "mouse up" action
	  	var prevValue = undefined;
	  	if (this._button.dropDown) {
	  		// cache the old value for "autoFocus" on the dropDown element of the button
	  		prevValue = this._button.dropDown.autoFocus;
	  	  	
	  	  	// set the value to false
	  	  	this._button.dropDown.autoFocus = false;
	  	}
	  	  
	  	// simulate the mouse up action
		this._button._onDropDownMouseUp(e);
		this._button.closeDropDown();
		
		// restore the previous "autoFocus" value on the button's dropDown
		if (this._button.dropDown) {
		  	this._button.dropDown.autoFocus = prevValue;
		}
		
		if (this._hideTimer) {
	  		delete this._hideTimer;
	  		this._hiding = false;
	 	}
		
  },
  
  
  /**
   * Calback to handle the hover-ending event. 
   */
  _handleMouseOut: function(e) {
	  if (this.clickToOpen) return;
	  this._hiding = true;
      this._restoreTitle();    	  
	  if (this._showTimer) {
		  clearTimeout(this._showTimer);
		  delete this._showTimer;
	  }
	  if (this._button._opened) {
	  	  dEvent.stop(e);
	  	  e.preventDefault();
	  	  if (! this._hideTimer) {
	  	  	var event = { pageX: e.pageX, pageY: e.pageY, target: e.target};
	  	  	this._hideTimer = setTimeout(dLang.hitch(this, this._doClose, event), this.hideDelay);
	  	  }
	  }
  },
  
  /**
   * This private method is attached to the TooltipDialog's "orient" method.
   * This allows us to apply an additional CSS class for handling
   * specifics to HoverHelp since "idxHoverHelp" is a peer with the various
   * dijit orientation CSS classes (e.g.: "dijitAbove" or "dijitBelow")
   * @param {Object} node
   * @param {Object} aroundCorner
   * @param {Object} corner
   * @private
   */
  _orient: function(node, aroundCorner, corner) {
	var c = this._currentOrientClass;
	if(c){
		dDomClass.remove(this._dialog.domNode, c);
	}
	c = "idxHoverHelpAB"+(corner.charAt(1) == 'L'?"Left":"Right")+" idxHoverHelp"+(corner.charAt(0) == 'T' ? "Below" : "Above");
	dDomClass.add(this._dialog.domNode, c);
	this._currentOrientClass = c;
  },

  /**
   * Private method that gets the prefix to use when building the message key.
   * @returns {String} msg prefix
   * @private
   */
  _getMessageKeyPrefix : function() {
    if (this.messageKeyPrefix) return this.messageKeyPrefix;
    var prefix = this._resourceLookup("messageKeyPrefix");
    return (prefix) ? prefix : "topic_";
  },


  /**
   * Private method that gets the suffix to use when building the message key.
   * @returns {String} msg suffix
   * @private
   */
  _getMessageKeySuffix : function() {
    if (this.messageKeySuffix) return this.messageKeySuffix;
    var suffix = this._resourceLookup("messageKeySuffix");
    return (suffix) ? suffix : "_message";
  },

  /**
   * Private method that gets the prefix to use when building the href key.
   * @returns {String} msg prefix
   * @private
   */
  _getHrefKeyPrefix : function() {
    if (this.hrefKeyPrefix) return this.hrefKeyPrefix;
    var prefix = this._resourceLookup("hrefKeyPrefix");
    return (prefix) ? prefix : "topic_";
  },

  /**
   * Private method that gets the suffix to use when building the href key.
   * @returns {String} msg prefix
   * @private
   */
  _getHrefKeySuffix : function() {
    if (this.hrefKeySuffix) return this.hrefKeySuffix;
    var suffix = this._resourceLookup("hrefKeySuffix");
    return (suffix) ? suffix : "_href";
  },

  /**
   * Private method that attempts to lookup a label for the
   * property name or construct one if it cannot find the lookup value.
   * @private
   * @returns {String} message
   */
  _getMessage: function() {
     // first check if the message is defined
     if (this.message) return this.message;

     var result = null;
     // check if the topic ID is defined
     if (this.topicID) {
       // attempt to lookup the message
       var result = null;
       var prefix = this._getMessageKeyPrefix();
       var suffix = this._getMessageKeySuffix();
       var key = (prefix + this.topicID + suffix);
       result = this._resourceLookup(key);
     }

     // check if we have fill content
     if ((!result) && (this._built)) {
       result = this._fillMessage;
     }
 
     // check if we don't have a label, and if not try to make one
     if (!result) result = this._resourceLookup("defaultMessage");
     
     return (result ? result : "");
  },

  /**
   * Private setter of message
   * @param {String} value
   * @private
   */
  _setMessageAttr: function(value) {
    this.message = value;
    if (this._built) this._messageNode.innerHTML = this._getMessage();
  },


  /**
   * Private setter of message - key prefix
   * @param {String} value
   * @private
   */
  _setMessageKeyPrefixAttr: function(value) {
    this.message = value;
    if (this._built) this._messageNode.innerHTML = this._getMessage();
  },

  /**
   * Private setter of message - key suffix
   * @param {String} value
   * @private
   */
  _setMessageKeySuffixAttr: function(value) {
    this.message = value;
    if (this._built) this._messageNode.innerHTML = this._getMessage();
  },

  /**
   * Private setter of topic ID
   * @param {String} value
   * @private
   */
  _setTopicIDAttr: function(value) {
    this.topicID = value;
    this._updateMessage();
    this._updateHref();
  },

  /**
   * Private setter of title
   * @param {String} value
   * @private
   */
  _setTitleAttr: function(value) {
    this.title = value;
    this._updateTitle();
  },

  /**
   * Private setter of Href
   * @param {String} value
   * @private
   */
  _setHrefAttr: function(value) {
    this.href = value;
    this._updateHref();
  },

  /**
   * Private setter of Href key prefix
   * @param {String} value
   * @private
   */
  _setHrefKeyPrefixAttr: function(value) {
    this.href = value;
    this._updateHref();
  },

  /**
   * Private setter of Href key suffix
   * @param {String} value
   * @private
   */
  _setHrefKeySuffixAttr: function(value) {
    this.href = value;
  },

  /**
   * Private setter of Href label
   * @param {String} value
   * @private
   */
  _setHrefLabelAttr: function(value) {
     this.hrefLabel = value;
     this._updateHrefLabel(); 
  },

  /**
   * Private method to update message node from message
   * @private
   */
  _updateMessage: function() {
    if (!this._built) return;
    this._messageNode.innerHTML = this._getMessage();
  },

  /**
   * Private method to update Href from Href full
   * @private
   */
  _updateHref: function() {
    if (!this._built) return;
    var href = this._getFullHref();
    if (href) {
      dDomClass.remove(this._linkNode, "idxHoverHelpLinkHidden");
      dDomClass.add(this._linkNode, "idxHoverHelpLink");
    } else {
      dDomClass.remove(this._linkNode, "idxHoverHelpLink");
      dDomClass.add(this._linkNode, "idxHoverHelpLinkHidden");
    }
    dDomAttr.set(this._anchorNode, "href", this._getFullHref());
  },

  /**
   * Removes the button title to avoid the double-hover effect when the 
   * button's help is shown.
   */
  _removeTitle: function() {
	 dDomAttr.remove(this._button.titleNode, "title");
  },
  
  /**
   * Restores the button title when the drop down closes to allow screen 
   * readers to leverage the title.
   */
  _restoreTitle: function() {
	 this._updateTitle();
  },
  
  /**
   * Private method to update title 
   * @private
   */
  _updateTitle: function() {
    if (!this._built) return;
    var titleText = this._getTitle();
    this._button.set("label", titleText);
    this._button.set("title", titleText);    
  },

  /**
   * Private method to update Href label 
   * @private
   */
  _updateHrefLabel: function() {
    if (!this._built) return;
    var label = this._getHrefLabel();
    dDomAttr.set(this._anchorNode, "innerHTML", label);
  },

  /**
   * Private method to look up a label for the property
   * name or construct one if it cannot find the lookup value.
   * @private
   * @returns {String} title
   */
  _getTitle: function() {
     if (iString.nullTrim(this.title)) return this.title;
     var result = this._resourceLookup("defaultTitle");
     return (result ? result : "");
  },

  /**
   * Private method to look up the Href full 
   * @private
   * @returns {String} Href full
   */
  _getFullHref: function() {
     var href = this._getHref();
     if (! href) return null;
     return this._getBaseHref() + href;
  },

  /**
   * Private method to look up the Href base 
   * @private
   * @returns {String} Href base
   */
  _getBaseHref: function() {
     if (this.baseHref) return this.baseHref;
     var result = this._resourceLookup("baseHref");
     return (result) ? result : "";
  },

  /**
   * Private method to look up the Href 
   * @private
   * @returns {String} Href
   */
  _getHref: function() {
     var href = iString.nullTrim(this.href);
     if (href) return href;

     // check if the topic ID is defined
     if (!this.topicID) return "";

     // attempt to lookup the message
     var result = null;
     var prefix = this._getHrefKeyPrefix();
     var suffix = this._getHrefKeySuffix();
     var key = (prefix + this.topicID + suffix);
     result = this._resourceLookup(key);
     
     return iString.nullTrim(result);
  },

  /**
   * Private method to look up the Href label 
   * @private
   * @returns {String} Href label
   */
  _getHrefLabel: function() {
    if (this.hrefLabel) return this.hrefLabel;
    var result = this._resourceLookup("defaultHrefLabel");
    return (result) ? result : "";
  }


});

	/**
	 * Sets the default profile to use for the HoverHelp instances.
	 * If set to an invalid value or not set at all then "standard" is used.
	 * Valid values include: "compact" and "standard".
	 *
	 * @param profile The name of the profile (either "standard" or "compact")
	 * @name idx.widget.HoverHelp.setDefaultProfile
	 * @function
	 */
	iHoverHelp.setDefaultProfile = function(profile) {
		if (profile == "compact") {
			defaultProfile = "compact";
		} else {
			defaultProfile = "standard";
		}
	};
	
	/**
	 * Returns the current default profile to use for HoverHelp instances.
	 * If an invalid value was previously set then "standard" is returned.
	 * 
	 * @return The current default profile.
	 * @name idx.widget.HoverHelp.getDefaultProfile
	 * @function
	 */
	iHoverHelp.getDefaultProfile = function() {
		return defaultProfile;
	};

	/**
	 * Extends HoverHelp to handle profile updates.
	 */
	dLang.extend(iHoverHelp, 
		/**@lends idx.widget.HoverHelp#*/ {
	
	  /**
   	   * Handles the setting of the profile and updating the CSS class.
   	   * @private
   	   */
  	  _setProfileAttr: function(value) {
  	  		this.profile = value;
  	  		this._updateProfile();
	  },

	  /**
   	   * Handles the setting of the profile and updating the CSS class.
   	   * @private
   	   */
  	  _updateProfile: function() {
  	  		if (! this._defaultProfileHandle) {
  	  			var callback = dLang.hitch(this, "_updateProfile");
  	  			this._defaultProfileHandle = this.own(dAspect.after(iHoverHelp, "setDefaultProfile", callback, true));
  	  		}
  	  		if (!this._built) return;
  	  		var newValue = iString.nullTrim(this.profile);
  	  		var defaultValue = iHoverHelp.getDefaultProfile();
  	  		
 		  	if ((!newValue) || (! (newValue in profileCSSLookup))) {
		  		newValue = defaultValue;
  			}
  			
  			if (this._profile == newValue) return;
  		
  			if (this._profile) {
  				var oldValue = this._profile;
  				var oldClass = this.baseClass + profileCSSLookup[oldValue ? oldValue : defaultProfile];
  				if (this.domNode) {
  					dDomClass.remove(this.domNode, oldClass);
  				}
  			}
  			
  			// set the new value
  			this._profile = newValue;
  		
  			// update the CSS class
  			var newClass = this.baseClass + profileCSSLookup[newValue];
  			if (this.domNode) {
  				dDomClass.add(this.domNode, newClass);
  			}
	  }
	});
	
	return iHoverHelp;
});
