/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
        	"dijit/_WidgetBase",
	        "dijit/_Widget",
	        "dijit/_TemplatedMixin",
	        "dijit/_Container",
 		    "dojo/_base/lang",
 		    "dojo/_base/array",
		    "dojo/string",
		    "dojo/number",
		    "dojo/date/locale",
		    "dojo/Deferred",
 		    "dojo/when",
		    "dojo/aspect",
		    "dojo/json",
		    "dojo/dom-class",
		    "dijit/registry",
		    "../util",
		    "../string",
		    "../resources",
		    "./PropertyEditAdaptor",
		    "../widget/EditController",
		    "dojo/text!./templates/PropertyFormatter.html",
	        "dojo/i18n!../nls/base",
	        "dojo/i18n!./nls/base",
	        "dojo/i18n!./nls/PropertyFormatter"], 
		function(dDeclare,					// (dijit/_base/declare)
				 dWidgetBase,				// (dijit/_WidgetBase)
				 dWidget,					// (dijit/_Widget)
				 dTemplatedMixin,			// (dijit/_TemplatedMixin)
				 dContainer,				// (dijit/_Container)
				 dLang,						// (dojo/_base/lang)
				 dArray,					// (dojo/_base/array)
				 dString,					// (dojo/string)
				 dNumber,					// (dojo/number)
				 dDateLocale,				// (dojo/date/locale)
				 dDeferred,					// (dojo/Deferred)
				 dWhen,						// (dojo/when)
				 dAspect,					// (dojo/aspect)
				 dJson,						// (dojo/json)
				 dDomClass,					// (dojo/dom-class)
				 dRegistry,					// (dijit/registry)
				 iUtil,						// (../util)
				 iString,					// (../string)
				 iResources,				// (../resources)
				 iPropertyEditAdaptor,		// (./PropertyEditAdaptor)
				 iEditController, 			// (../widget/EditController)
				 templateText) 				// (dojo/text!./templates/PropertyFormatter.html)
{
	// place holder function
	var placeHolder = new function() { };
	
	/**
	 * @name idx.grid.PropertyFormatter
	 * @class Property formatter widget.
	 * Provides a widgt that formats an object as text.  This widget can use
	 * standard formatting mechanisms for messages, numbers, and dates, but 
	 * can also use a specified function for custom formatting.  Typically,
	 * each object property is individually automatically formatted based off 
	 * type and the developer need only provide a message template for 
	 * combining the properties.  This is especially useful within the 
	 * idx.grid.PropertyGrid widget.
	 *  
	 * @augments dijit._Widget
	 * @augments dijit._TemplatedMixin
	 * @augments dijit._Container
	 */
	return dDeclare("idx.grid.PropertyFormatter", [dWidget,dTemplatedMixin,dContainer], 
			/**@lends idx.grid.PropertyFormatter#*/				
{
  /**
   * The data object for this instance.
   * @type Object
   * @default null
   */
  data: null,

  /**
   * The property name assigned to this instance so a container can use
   * this instance to format one of its properties.
   * @type String
   * @default ""       
   */
  propertyName: "",

  /**
   * A comma separated list of property names from the data object to be 
   * formatted by this instance.  This can be a single property name, a
   * simple list of property names, or a property name with type name in
   * parentheses following it.
   * @type String
   * @default ""       
   * @example
     For example:
       EXAMPLE 1 (single property name): "givenName"
       EXAMPLE 2 (list of property names):  "givenName,surname,age,birthDate"
       EXAMPLE 3 (property with type): "startTime(tim)"
       EXAMPLE 4 (assorted list):  "givenName,surname,age(int),birthDate(dat)"

       The legal format types are:
          - txt:      assumes literal text (default for string properties)   
          - dat:      uses date formatting (default for date properties)
          - tim:      uses time formatting
          - dtm:      uses date-time formatting
          - dec:      uses decimal formatting (default for numbers w fractional)
          - int:      uses integer formatting (defualt for numbers w/o fractional)
          - pct:      uses percentage formatting
          - cur:      uses currency formatting 
          - obj: 	  used for composite objects (formats as json)
   */
  properties: "",

  /**
   * The format string for combining the properties into text.  After the 
   * individual properties are formatted according to their type, they are
   * substituted into this string using processing similar to the 
   * dojo.string.substitute() method to replace the tokens for their 
   * respective formatted property values.
   * 
   * NOTE: The specified format string can use "${...}" tokens OR may use
   * "$[...]" token if the "altSyntax" attribute is set to true.  The 
   * alternate syntax is useful if the PropertyGrid or formatter is being
   * used inside of a dijit._TemplatedMixin widget where "${...}" is already 
   * used to replace templated items with widget properties. 
   * 
   * @type String
   * @default ""   
   */
  format: "",

  /**
   * Set this to true to leveage the "$[...]" syntax in your format string
   * instead of the "${...}" syntax.  This should be set to true whenever
   * declarative markup is used within a dijit._TemplatedMixin widget template 
   * in order to avoid problems with dijit._TemplatedMixin attempting to perform
   * the replacement for you.
   * 
   * @type Boolean
   * @default false
   */
  altSyntax: false,
  
  /**
   * The text to use to format any part of the result that is null.  By default,
   * null values are left as empty-string.
   * @type String
   * @default ""   
   */
  emptyFormat: "",

  /**
   * Set this to make the property formatter read only.  If not in edit mode then the
   * "Edit" link will be hidden.  If in edit mode then the Edit Controller will be 
   * disable its "Save" button and only enable its "Cancel" button.
   */
  readOnly: false,
  
  /**
   * Set this to completely disable the contained EditController (if any).
   */
  disabled: false,
  
  /**
   * Overrides the "format" attribute by providing a function to call to 
   * format the data object directly.  The data object itself is passed to
   * this function and it is expected to return a string.
   * @type Object
   * @default null
   */
  formatFunc: placeHolder,

  /**
   * The function called when populating the value of the form widget(s) when 
   * inline editing.  This allows for the value to be interpretted before
   * populating the form widget.  The function is passed two parameters.
   * The first parameter is the name of the property (useful if multiple
   * properties are being edited) and the second value is the data object.
   * 
   * @type Function
   * @default null
   */
  toEditFunc: null,

  /**
   * The function called when populating the value of the form widget(s) when 
   * inline editing.  This allows for the value to be interpretted before
   * populating the form widget.  The function is passed three parameters.
   * The first parameter is the name of the property (useful if multiple
   * properties are being edited) and the second value is the actual data 
   * value obtained from the form widget and the third is the current data
   * object (which should not be modified but is available for reading).  
   * The return value is an object whose fields are used to set the fields 
   * of the data referenced by the property formatter.
   * 
   * @type Function
   * @default null
   */
  fromEditFunc: null,

  /**
   * The date formatting options to use with dojo.date.locale.format().
   * If this is not provided, then it uses a default value.
   * @type Object
   * @default null
  */
  dateFormatOptions: null,

  /**
   * The time formatting options to use with dojo.date.locale.format()
   * If this is not provided, then it uses a default value.
   * @type Object
   * @default null
  */ 
  timeFormatOptions: null,

  /**
   * The date-time formatting options to use with dojo.date.locale.format()
   * If this is not provided, then it uses a default value.
   * @type Object
   * @default null
  */
  dateTimeFormatOptions: null,

  /**
   * The decimal formatting options to use with dojo.number.format().
   * If this is not provided, then it uses a default value.
   * @type Object
   * @default null
   */
  decimalFormatOptions: null,

  /**
   * The integer formatting options to use with dojo.number.format().
   * If this is not provided, then it uses a default value.
   * @type Object
   * @default null
   */
  integerFormatOptions: null,

  /**
   * The percent formatting options to use with dojo.number.format().
   * @type Object
   * @default null
   */
  percentFormatOptions: null,

  /**
   * The currency formatting options to use with dojo.number.format().
   * @type Object
   * @default null
   */
  currencyFormatOptions: null,
 
  /**
   * The object (usually parent object) to use as a fall-back for getting 
   * formatting options when none are specified for this instance.  If the
   * fallback does not provide what we need, then we may fall back to
   * idx.resources or use a default value.
   * @type Object
   * @default null
   */
  propertyContainer: null,

  /**
   * Set this to true if you are providing widgets as the format via the custom
   * format function and you want the old widgets to be automatically destroyed
   * when a different widget is provided on reformatting.  Set this to false if
   * you are manually handling the destruction of the formatter widgets you create
   * via the formatFunc function.  This will also control whether or not the 
   * created formatter widgets are automatically destroyed when the PropertyFormatter
   * is destroyed.
   * 
   * If you are not using custom formatter widgets via the formatFunc attribute, then
   * this setting is not relevant.
   * 
   * @type Boolean
   * @default true
   */
  autoDestroyWidgetFormats: true,
  
  /**
   * A reference to the idx.widget.EditController to be used for this instance.  
   * If none is specified, but editors exist, then an internal one will be 
   * automatically created and displayed inline.  See idx.widget.EditController.
   * @type Object
   * @default null   
   */
  editController: null,

	/**
	 * Overrides of the base CSS class.
	 * This string is used by the template, and gets inserted into
	 * template to create the CSS class names for this widget.
	 * @private
	 * @constant
	 * @type String
	 * @default "idxPropertyFormatter"
	 */
  baseClass: "idxPropertyFormatter",

	/**
	 * The path to the widget template for the dijit._TemplatedMixin base class.
	 * @constant
	 * @type String
	 * @private
	 * @default "grid/templates/PropertyFormatter.html"
	 */
  templateString: templateText,

	/**
	 * Constructor
	 * Handles the reading any attributes passed via markup.
	 * @param {Object} args
	 * @param {Object} node
	 */
  constructor: function(args, node) {
    this._started    = false;
    this.emptyFormat = null;
    this._editmode   = false;
    this._editorHandles = {};    
  },

  /**
   * Ensure the handles are removed
   */
  destroy: function() {
	if (this.autoDestroyWidgetFormats && this._widgetValue) {
		this._widgetValue.destroy();
		delete this._widgetValue;
	}
  	if (this._controllerHandle) {
  		this._controllerHandle.remove();
  		delete this._controllerHandle;
  	}
  	if (this._editorHandles) {
  		for (var childID in this._editorHandles) {
  			var handle = this._editorHandles[childID];
  			if (handle) {
  				handle.remove();
  			}
  			delete this._editorHandles[childID];
  		}
  	}
  	if (this._editController) {
  		this._editController.destroyRecursive();
  		delete this._editController;
  	}
  	if (this._editorsByOrder) {
  		dArray.forEach(this._editorsByOrder, function(editor) {
  			editor.destroyRecursive();
  			delete editor;
  		});
  		delete this._editorsByOrder;
  	}
  	var children = this.getChildren();
  	if (children) {
  		dArray.forEach(children, function(child) {
  			child.destroyRecursive();
  		});
  	}
  	this.inherited(arguments);
  },
  
    /**
   * Internal method for performing string substitution.  We do not 
   * use the default dojo.string.substitute method since we want to
   * support alternate syntax so we do not conflict with dijit._TemplatedMixin.
   * The alternate syntax is activated by setting the "altSyntax" attribute
   * to true (defaults ot false).
   */
  _stringSubstitute: function(/*String*/       template,
	  						  /*Object|Array*/ map) {
     var regex = ((this.altSyntax) 
    		 		? /\$\[([^\s\]]+)\]/g
    		 		: /\$\{([^\s\}]+)\}/g);
    return template.replace(regex,
      function(match, key){
    	   var result = dLang.getObject(key, false, map);
           return result;
     });
  },

  /**
   * Overrides dijit._Widget.postMixInProperties() 
   * @see dijit._Widget.postMixInProperties
   */
  postMixInProperties: function() {
	iUtil.nullify(this, this.params, ["formatFunc"]); 
    this.inherited(arguments);
  },

  /**
   * @see dijit._Widget.buildRendering
   */
  buildRendering: function() {
    this.inherited(arguments);
  },

  /**
   * @see dijit._Widget.postCreate
   */
  postCreate: function() {
    this.inherited(arguments);
  },

  /**
   * Called at startup to set state,format
   * and update contained editors.
   * @see dijit._Widget.startup
   */
  startup: function() {
    if (this._started) return;
    this.inherited(arguments);
    if (this._widgetValue && (!this._widgetValue._started)) this._widgetValue.startup();
    this._reformat();
    this._updateEditors();
  },

  /**
   * Extends parent method by calling a method
   * to set up the map editors.
   * @param {dijit._Widget} widget
   * @param {int} indexIndex
   * @see dijit._Widget.addChild
   */
  addChild: function(/*dijit._Widget*/ widget, /*int?*/ insertIndex) {
      this.inherited(arguments);
      if (this._started) {
    	  this._updateEditors();
      }
  },

  /**
   * Function to check if all editors mapped to properties that are contained within have valid values.
   */
  isEditorValid: function() {
	  var result = true;
	  if (this._editorsByName) {
		  for (var prop in this._editorsByName) {
			  var editor = this._editorsByName[prop];
			  if (! editor) continue;
			  var adaptor = editor.propertyEditAdaptor;
			  if (! adaptor) continue;
			  if (! adaptor.isEditorValid(editor)) {
				  result = false;
			  }
		  }
	  }
	  return result;
  },
  
  /**
   * Called whenever the value of one of the editors is modified.
   * This method does nothing if editMode has not yet been established
   * because these events might fire during setup of edit mode when the
   * editors are populated with the current values.  Afterward this is
   * used to help control when the EditController should or should not
   * allow saving data.
   * 
   * @param editor
   * @param value
   * @returns
   */
  _onEditorChange: function(editor,value) {
	 if (! this._editMode) return; // ignore events when not in edit mode
	 var editorID = editor.get("id");
	 
	 if (this._namesByEditorID) {
		 var propName = this._namesByEditorID[editorID];
		 
		 if (propName) {
			 this.onEditorChange(propName, value, this);
		 }
	 }
  },
  
  /**
   * Extends parent method by calling a method
   * to set up the map editors.
   * @param {dijit._Widget} widget
   * @param {int} indexIndex
   * @see dijit._Widget.removeChildd
   */
  removeChild: function(/*Widget or int*/ widget) {
     this.inherited(arguments);

     var widgetID = widget.get("id");
     if (widgetID in this._editorHandles) {
    	 var handle = this._editorHandles[widgetID];
    	 if (handle) handle.remove();
    	 delete this._editorHandles[widgetID];
     }
     if (this._started) {
       this._updateEditors();
     }
  },

  /**
   * Private method to update the internal editors.
   */
  _updateEditors: function() {
    // check if not yet started
    if (! this._started) return;

    // check if we have any editors
    if (this.getChildren().length == 0) {
       dDomClass.add(this.domNode, this.baseClass + "NoEditors");
    } else {
       dDomClass.remove(this.domNode, this.baseClass + "NoEditors");
    }

    // map the editors    
    this._mapEditors();

    // update the edit controller
    this._updateEditController();
  },

  /**
   * Access to get the edit controller
   * @returns {EditController} result
   */
  _getEditController: function() {
    if (this.editController) return this.editController;
    if (this._editController) return this._editController;
    if (this.propertyContainer) {
      var result = this.propertyContainer.get("editController");
      return result;
    }
    return null;
  },
  
  /**
   * Internal method to handle when the editController attribute is
   * set by ensuring that the "controlled" IDs are properly set
   * for accessibility.
   * @private
   */
  _setEditControllerAttr: function(controller) {
	this.editController = dRegistry.byId(controller);
	this._updateEditController();	
  },
  
  /**
   * Private method that sets the property container attribute with the
   * specified value, updates the edit controller, and calls 
   * @param {Object} value
   * @private
   */
  _setPropertyContainerAttr: function(value) {
    this.propertyContainer = value;
    if (this._controllerHandle) {
    	this._controllerHandle.remove();
    	delete this._controllerHandle;
    }
    if (value) {
      this._controllerHandle = dAspect.after(
          value, "onEditControllerChanged", 
          dLang.hitch(this, "_updateEditController"),
          true);
    }
    this._updateEditController();
    this._reformat();
  },

  /**
   * Private method called after an editor controller set
   * @private
   */
  _updateEditController: function() {
    // check if not yet started
    if (! this._started) return;

    // remove any existing attachments
    var controller = this._getEditController();

    // check the linked controller, and unlink it if it differs
    if (this._linkedController && (this._linkedController != controller)) {
    	this._linkedController.unlinkEditor(this);
    	this._linkedController = null;
    }
    
    // if we have no controller, but need one then create default
    if (!controller && this.getChildren().length > 0
        && !this._editController) {
      this._editController = new iEditController({readOnly: this.readOnly, 
    	  										  disabled: this.disabled,
    	  										  readControlledNodeIDs: this.formatNode.id,
    	  										  editControlledNodeIDs: this.containerNode.id});
      this._editController.startup();
      this._editController.placeAt(this.domNode, "last");
    }

    // if we no longer need a default controller, destroy it
    if (this._editController 
        && ((controller && (controller !== this._editController)) || this.getChildren().length == 0)) {
      this._editController.destroyRecursive();
      delete this._editController;
      this._editController = null;
    }
    
    // attach to the controller
    if (!controller && this._editController) { 
    	controller = this._editController;
    }
 
    // link the controller
    if (controller && (!this._linkedController)) {
      controller.linkEditor(this,
    		   			    { onSave: "_onSave", 
    	  				 	  onCancel: "_onCancel", 
    	  					  onEdit: "_onEdit",
    		  				  readNodeIDs: this.formatNode.id, 
    		  				  editNodeIDs: this.containerNode.id});
      this._linkedController = controller;
    }
  },


  /**
   * Private method to set up the map editors
   * @private
   */
  _mapEditors: function() {
    if (! this._started) return;
    if (! this.properties) {
      this._editorsByName = null;
      return;
    }
    var children        = this.getChildren();
    var editorsByName  	= [ ];
    var propsByWidgetID = [ ];
    var unmappedEditors 	= [ ];
    var allEditors     	= [ ];
    var editorCount    	= 0;
    var propsMapped     = 0;

    for (var index = 0; index < children.length; index++) {
      var child = children[index];
      var adaptor = child.propertyEditAdaptor;
      if (adaptor && adaptor.isEditor(child)) {
        editorCount++;

        var childID = child.get("id");
        var changeEvent = adaptor.getEditorChangeEvent(child);
        if ((!(childID in this._editorHandles)) && (changeEvent)) {
        	var self = this;
        	var handler = function(newValue) {
        		self._onEditorChange(child, newValue);
        	};
      	  	var handle = dAspect.after(child, changeEvent, handler, true);
      	  	this._editorHandles[childID] = handle;
        }
        
        allEditors.push(child);
        var name = adaptor.getPropertyName(child);
        if (iString.nullTrim(name)) {
          if (this._propsByName[name]) propsMapped++;

          // if we have a name match then map it directly
          var childID = child.get("id");
          
          editorsByName[name] 		= child;
          propsByWidgetID[childID] 	= name;
          
        } else {
          unmappedEditors.push(child);
        }
      }
    }

    // count how many properties are not mapped
    var propsUnmapped = 0;
    for (var index = 0; index < this._properties.length; index++) {
    	var propName = this._properties[index];
    	if (! (propName in editorsByName)) propsUnmapped++;
    }
    
    // check if the pending number of properties is equivalent to the pending number of editors
    if ((propsUnmapped > 0) && (unmappedEditors.length > 0)) {
      var formIndex = 0;
      for (var index = 0; ((index < this._properties.length) && (formIndex < unmappedEditors.length)); index++) {
        var propDesc    = this._properties[index];
        var propName    = propDesc.propName;
        var editor  	= editorsByName[propName];
        if (editor) continue;

        editor = unmappedEditors[formIndex++];
        var editorID = editor.get("id");
        editorsByName[propName] = editor;
        propsByWidgetID[editorID] = propName;
      }
    }
    if (this._editorsByName) delete this.editorsByName;
    if (this._namesByEditorID) delete this._namesByEditorID;
    if (this._editorsByOrder) delete this._editorsByOrder;
    
    this._editorsByName  = editorsByName;
    this._namesByEditorID  = propsByWidgetID;
    this._editorsByOrder = allEditors;    
  },

  /**
   * Private method that sets the data attribute with the
   * specified value and if the state is started, calls
   * the reformat method.
   * @param {Object} value
   * @private
   */
  _setDataAttr: function(/*Object*/ value) {
    this.data = value;
    this._reformat();
  },

  /**
   * Private method that sets the format attribute with the
   * specified value and then calls the reformat method.
   * @param {String} value
   * @private
   */
  _setFormatAttr: function(/*String*/ value) {
    this.format = value;
    this._reformat();
  },

  /**
   * Private method that sets the format attribute with the
   * specified value and then calls the reformat method.
   * @param {String} value
   * @private
   */
  _setEmptyFormatAttr: function(/*String*/ value) {
    this.emptyFormat = value;
    this._reformat();
  },

  /**
   * Private method that sets the format function attribute with the
   * specified value then calls the reformat method.
   * @param {Function} value
   * @private
   */
  _setFormatFuncAttr: function(/*Function*/ value) {
    this.formatFunc = value;
    this._reformat();
  },

  /**
   * Private method that sets the format date options attribute with the
   * specified value and then calls the reformat method.
   * @param {Object} value
   * @private
   */
  _setDateFormatOptionsAttr: function(/*Object*/ value) {
    this.dateFormatOptions = value;
    this._reformat();
  },

  /**
   * Private method that sets the format time options attribute with the
   * specified value and then calls the reformat method.
   * @param {Object} value
   * @private
   */
  _setTimeFormatOptionsAttr: function(/*Object*/ value) {
    this.timeFormatOptions = value;
    this._reformat();
  },

  /**
   * Private method that sets the format date time options attribute with the
   * specified value and then calls the reformat method.
   * @param {Object} value
   * @private
   */
  _setDateTimeFormatOptionsAttr: function(/*Object*/ value) {
    this.dateTimeFormatOptions = value;
    this._reformat();
  },

  /**
   * Private method that sets the decimal format options attribute with the
   * specified value and then calls the reformat method.
   * @param {Object} value
   * @private
   */
  _setDecimalFormatOptionsAttr: function(/*Object*/ value) {
    this.decimalFormatOptions = value;
    this._reformat();
  },

  /**
   * Private method that sets the integer format options attribute with the
   * specified value and then calls the reformat method.
   * @param {Object} value
   * @private
   */
  _setIntegerFormatOptionsAttr: function(/*Object*/ value) {
    this.integerFormatOptions = value;
    this._reformat();
  },

  /**
   * Private method that sets the percent format options attribute with the
   * specified value and then calls the reformat method.
   * @param {Object} value
   * @private
   */
  _setPercentFormatOptionsAttr: function(/*Object*/ value) {
    this.percentFormatOptions = value;
    this._reformat();
  },

  /**
   * Private method that sets the currency format options attribute with the
   * specified value and then calls the reformat method.
   * @param {Object} value
   * @private
   */
  _setCurrencyFormatOptionsAttr: function(/*Object*/ value) {
    this.currencyFormatOptions = value;
    this._reformat();
  },

  /**
   * Private method that sets the properties attribute with the
   * specified value and then calls the reformat method.
   * @param {Object} value
   * @private
   */
  _setPropertiesAttr: function(/*String*/ properties) {
    this.properties = properties;
    this._properties = [ ];
    this._propsByName = [ ];
    this._defaultFormat = "";
    var prefix = "";
    if (this.properties != null) {
       var props = this.properties.split(",");
       var index = 0;

       for (index = 0; index < props.length; index++) {
    	 var propDesc = this._parsePropertyName(props[index]);
         var propName = propDesc.propName;
         this._properties.push(propDesc);
         this._propsByName[propName] = propDesc;
         this._defaultFormat = (this._defaultFormat + prefix + "${" 
                                + propName + "}");
         prefix = ", ";
       }
    }
    this._reformat();
  },

  /**
   * Parses the property name and extracts the following:
   *  - propName (the original property name)
   *  - propType (the property type specified)
   *  - propParts (array of parts -- strings for dot notation, integers for bracket notation)
   */
  _parsePropertyName: function(/*String*/ propName) {
 	 var parsedProp = [ ];
     var propName = dString.trim(propName);
     var propType = null;
     var openParen  = propName.lastIndexOf("(");
     var closeParen = propName.lastIndexOf(")");
     var origPropName = propName;
     
     // check for the parens at the end
     if ((openParen >= 0) && (closeParen == (propName.length-1))) {
         propType = propName.substring(openParen + 1, closeParen);
         propType = dString.trim(propType);
         propName = dString.trim(propName.substring(0, openParen));
         origPropName = propName;
     }
     
     // look for dot-notation or bracket notation
     var dot        = propName.indexOf(".");
     var bracket    = propName.indexOf(this.altSyntax ? "(" : "[");
     
     while ((dot >= 0) || (bracket >= 0)) {
    	 var part = null;
    	 // check for "dot first" or "bracket first"
    	 if ((dot >= 0) && ((bracket < 0) || (dot < bracket))) {
    		 part = dString.trim(propName.substring(0, dot));
    		 if (dot < (propName.length - 1)) {
    			 propName = dString.trim(propName.substring(dot+1));
    		 } else {
    			 propName = "";
    		 }
    		 parsedProp.push(part);
    		 
    	 } else {
    		 var closeBracket = propName.indexOf(this.altSyntax ? ")" : "]");
    		 var arrIndex = this._makeNumber(dString.trim(
    				 	   	propName.substring(bracket+1, closeBracket)));
    		 part = dString.trim(propName.substring(0, bracket));
    		 if (closeBracket < (propName.length - 1)) {
    			 propName = dString.trim(propName.substring(closeBracket+1));
    		 } else {
    			 propName = "";
    		 }
    		 if (propName.charAt(0) == '.') {
    			 propName = propName.substring(1);
    		 }
    		 if (part.length > 0) parsedProp.push(part);
    		 parsedProp.push(arrIndex);
    	 }
    	 
    	 // get the next dot and bracket
    	 dot = propName.indexOf(".");
    	 bracket = propName.indexOf(this.altSyntax ? "(" : "[");
     }
     
     // get the remaining property name
     if (propName.length > 0) {
    	 parsedProp.push(propName);
     }
     
     return {propName: origPropName, propType: propType, propParts: parsedProp};	  
  },
  
  /**
   * Private method that reformats the formatted value
   * of the format node. Called after a value is set.
   * @private
   */
  _reformat: function() {
    if (! this._started) return;
    var formattedValue = this._getFormattedValue();
    var deferred = new dDeferred();
    dWhen(formattedValue, dLang.hitch(this, function(value) {
    	if (value && this._widgetValue === value) {
    		// nothing to do -- should be handled already by custom formatter
    	} else if (value instanceof dWidgetBase) {
        	// destroy any old widget value
        	if (this.autoDestroyWidgetFormats && this._widgetValue) {
        		this._widgetValue.destroy();
        		delete this._widgetValue;
        	}
    		// place the widget
    		value.placeAt(this.formatNode, "only");
    		
    		// startup the widget
    		if (this._started && (! value._started)) value.startup();
    		
    		// set the widget value
    		this._widgetValue = value;
    		
    	} else {
    		this.formatNode.innerHTML = value;
    	}
    	deferred.resolve(value);
    }));
    return deferred;
  },

  /**
   * Public method for refreshing the formatted value.  This triggers a call to "onRefresh"
   */
  refresh: function() {
	  var data = this._getData();
	  var grid = this.propertyContainer;
	  var d = this._reformat();
	  dWhen(d, dLang.hitch(this, function(value) {
		  this.onRefresh(data,this,grid);
	  }));
	  return d;
  },
  
  /**
   * Returns a formatter function
   * @param {Object} dataVal
   * @returns {Function} result
   * @private
   */
  _customFormat: function(/*Object*/ dataVal) {
    var result = null;
    if (this.formatFunc && this.formatFunc !== placeHolder) {
       result = this.formatFunc.call(this, dataVal);
    }
    if (result != null) return result;
    if (this.propertyContainer) {
       var func = this.propertyContainer.get("formatFunc");
       if (func) {
          result = func.call(this.propertyContainer,this.propertyName, dataVal);
       }
    }
    return result;
  },

  /**
   * Private getter for the formatted value
   * @returns {Object} result
   * @private
   */
  _getFormattedValue: function() {
    var dataVal = this._getData();
    var result = this._customFormat(dataVal);
    
    if (result) return result;
    
    var values = new Object();
    
    var index = 0;
    
    if (! this._properties) return "";
    for (index = 0; index < this._properties.length; index++) {
      var prop = this._properties[index];
      var propVal = (dataVal) ? this._resolveValue(dataVal, prop.propParts) : null;
      var valueref = values;
      for (var idx2 = 0; idx2 < prop.propParts.length; idx2++) {
    	  var key = prop.propParts[idx2];
    	  if (iUtil.typeOfObject(key) == 'number') {
    		  // we change up the array indices to be children with names prefixed by "_arrindex_"
    		  key = "__arrindex_" + key;
    	  }
    	  if (idx2 < (prop.propParts.length - 1)) {
    		  if (! (valueref[key])) {
    			  valueref[key] = { };
    		  }
    		  valueref = valueref[key];
    	  } else {
    		  // we append "__fmtTxt_" to each formatted key since some objects can be formatted
    		  // and still have children that can be formatted independently
    		  var formattedKey = key + "__fmtTxt_";
    		  valueref[formattedKey] = this._formatPart(propVal, prop.propType);
    	  }
      }
    }
    var formatTemplate = this.format;
    if (iString.nullTrim(formatTemplate) == null) {
      formatTemplate = this._defaultFormat;
    }
    // because we did substitution on the lookup keys above when creating the text
    // lookup map we need to do the same substitutions on the format string
    var replaced = formatTemplate;
    // first we replace all array derefencing with "._arrindex_[index]" 
    do {
    	formatTemplate = replaced;
    	replaced = formatTemplate.replace(
    		(this.altSyntax 
    				? /(\x24\x5b[^\x5d\x28\x29]+)\x28(\x2d?[0-9]+)\x29([^\x5b\x5d]*\x5d)/g
    				: /(\x24\x7b[^\x7d\x5b\x5d]+)\x5b(\x2d?[0-9]+)\x5d([^\x7b\x7d]*\x7d)/g),
    		"$1.__arrindex_$2$3");
    } while (replaced != formatTemplate);
    
    // next we append "__fmtTxt_|" to each key using the "|" as a marker for any
    // key that has already been handled (${...|}) to avoid an infinite loop
    do {
    	formatTemplate = replaced;
    	replaced = formatTemplate.replace(
    		(this.altSyntax
    				? /(\x24\x5b[^\x5d\x7c]+)(\x5d)/g
    				: /(\x24\x7b[^\x7d\x7c]+)(\x7d)/g),
    		"$1__fmtTxt_|$2");
    } while (replaced != formatTemplate);
    
    // finally we need to remove the "|" from all "${....|}" sequences from above
    do {
    	formatTemplate = replaced;
    	replaced = formatTemplate.replace(
    		(this.altSyntax
    				? /(\x24\x5b[^\x5d\x7c]+)\x7c(\x5d)/g
    				: /(\x24\x7b[^\x7d\x7c]+)\x7c(\x7d)/g),
    		"$1$2");
    } while (replaced != formatTemplate);
    // finally set the formatTemplate to the replaced template and do the substitution
    formatTemplate = replaced;
    result = this._stringSubstitute(formatTemplate, values);
    if ((result === undefined) || (iString.nullTrim(result) == null)) {
      result = this._getEmptyFormat();
    }
    return result;
  },
  
  /**
   * Resolves the property parts against the specified data obejct
   * and returns the value.
   */
  _resolveValue: function(/*Object*/ data, /*Array*/ propParts) {
	  var dataref = data;
	  for (var index = 0; index < propParts.length; index++) {
		  var key = propParts[index];
		  if ((iUtil.typeOfObject(key) == "number") && (key < 0) && ("length" in dataref)) {
			  key = dataref.length + key;
		  }
		  if (dataref[key] === undefined) return undefined;
		  dataref = dataref[key];
	  }
	  return dataref;
  },
  
  /**
   * Resolves the property parts against the specified data obejct
   * and sets the value if the path can be resolved.
   */
  _resolveEdit: function(/*Object*/ data, /*Array*/ propParts, value) {
	  var dataref = data;
	  for (var index = 0; index < propParts.length; index++) {
		  var key = propParts[index];
		  if ((iUtil.typeOfObject(key) == "number") && (key < 0) && ("length" in dataref)) {
			  key = dataref.length + key;
		  }
		  if (!key in dataref) return;
		  if (index < (propParts.length - 1)) {
			  if (dataref[key] === undefined) return;
			  dataref = dataref[key];
		  } else {
			  dataref[key] = value;
		  }
	  }
  },
  
  /**
   * Private method to map a type based on the specified value
   * @param {String} value
   * @returns {String} result
   * @private
   */
  _inferPropertyType: function(value) {
    var jstype = dParser.valToType(value);
    switch (jstype) {
      case "string":
        return "txt";
      case "number":
        return (Math.round(value) == value) ? "int" : "dec";
      case "date":
        return "dat";
      default: 
        return "txt";
    }
  },

  /**
   * Private method for formatting a date, time, or dateTime value.
   */
  _formatDate: function(/*Date*/ date, /*String*/ formatType) {
	  date = this._makeDate(date);
	  if ((date === null) || (date === undefined)) return null;
	  return dDateLocale.format(date, this._getFormatOptions(formatType));
  },

  /**
   * Private method for formatting a numeric value.
   */
  _formatNumber: function(/*Number*/ num, /*String*/ formatType) {
	num = this._makeNumber(num);
	if ((num === null) || (num === undefined)) return null;
	return dNumber.format(num, this._getFormatOptions(formatType));
  },
  
  /**
   * Private method to return an NLS formatted value for the
   * specified input property type key.
   * @param {Object} value
   * @param {String} propType (property type)
   * @returns {String} result
   * @private
   */
  _formatPart: function(/*Object*/ value, /*String*/ propType) {
	var result = null;
	if (propType == null) {
		var valtype = iUtil.typeOfObject(value);
		if (((value!=null)&&(value!==undefined))) {
			switch (valtype) {
			case "string":
				result = "" + value;
				break;
			case "date":
				result = this._formatDate(value, "dateTime");
				break;
			case "number":
				result = this._formatNumber(value, "decimal");
				break;
			case "object":
				if (value === null) result = "null";
				else if (value === undefined) result = "undefined";
				else result = dJson.stringify(value);
				break;
			default:
				result = "" + value;
				break;
			}
		}		
	} else if (((value!=null)&&(value!==undefined))||(propType=="obj")) {
		switch (propType) {
		case "txt":
			result = "" + value;
			break;
			
		case "dat":
			result = this._formatDate(value, "date");
			break;
			
		case "tim":
			result = this._formatDate(value, "time");
			break;
			
		case "dtm":
			result = this._formatDate(value, "dateTime");
			break;
			
		case "dec":
			result = this._formatNumber(value, "decimal");
			break;
			
		case "int":
			result = this._formatNumber(value, "integer");
			break;
			
		case "pct":
			result = this._formatNumber(value, "percent");
			break;
			
		case "cur":
			result = this._formatNumber(value, "currency");
			break;
			
		case "obj":
			if (value === null) result = "null";
			else if (value === undefined) result = "undefined";
			else result = dJson.stringify(value);
			break;
			
		default:
			// treat it like any other text
			result = "" + value;
			break;
		}
	}
	if ((result === null) || (result === undefined)) {
		result = this._getEmptyFormat();
	}
	return result;
  },


  /**
   * Private data accessor
   * @returns {Object} data
   * @private
   */
  _getData: function() {
    var result = this.data;
    if (result) return result;
    if (this.propertyContainer == null) return null;
    return this.propertyContainer.get("data");
  },

  /**
   * Private data accessor for empty format
   * @returns {Object} data
   * @private
   */
  _getEmptyFormat: function() {
    var result = this.emptyFormat;
    if (result != null) return result;
    if (this.propertyContainer != null) {
      var resources = this.propertyContainer.get("resources");
      if ((resources)&&("emptyFormat" in resources)) {
    	  result = resources["emptyFormat"];
      }
    }
    if (result != null) return result;
    
    result = iResources.get("emptyFormat",
                          	"idx/grid/PropertyFormatter");
    return result || "";
  },

  /**
   * Attempts to convert any value to be interpretted as a date.
   * @param {String} value   
   * @returns {Object} value
   * @private
   */
  _makeDate: function(value) {
     if (iUtil.typeOfObject(value) == "date") return value;
     return iUtil.parseObject("" + value, "date");
  },

  /**
   * Private method to return a number based on the input value.
   * @param {String} value
   * @returns {Object} value
   * @private
   */
  _makeNumber: function(value) {
     if (iUtil.typeOfObject(value) == "number") return value;
     return iUtil.parseObject("" + value, "number");
  },

  /**
   * Attempts to convert any value to be interpreted as a boolean.
   * @param {String} value
   * @returns {Boolean} result
   * @private
   */
  _makeBoolean: function(value) {
     if (iUtil.typeOfObject(value) == "boolean") return value;
     return iUtil.parseObject("" + value, "boolean");
  },

  /**
   * Attempts to convert any value to be interpreted as an object.
   * @param {String} value
   * @returns {Boolean} result
   * @private
   */
  _makeObject: function(value) {
     if (iUtil.typeOfObject(value) == "object") return value;
     return dJson.parse("" + value);
  },

  /**
   * Private accessor method for format options 
   * @param {String} optionsType
   * @returns {Object} result
   * @private
   */
  _getFormatOptions: function(/*String*/ optionsType) {
    optionsType = optionsType + "FormatOptions";
    if (this[optionsType]) return this[optionsType];

    var result = null;
    if (this.propertyContainer) {
      var resources = this.propertyContainer.get("resources");
      if (resources) result = resources[optionsType];
    }
    if (result) return result;


    result = iResources.get(optionsType, 
                             "idx/grid/PropertyFormatter");  
    return result;
  },
  
  /**
   * Called whenever the value value changes with the new data
   * value that was assigned through editing.  This exists so
   * others can connect to this method.
   * @param {Object} data
   * @param {PropertyFormatter} formatter
   */
  onChange: function(/*Object*/ data, formatter) {
    // do nothing, but allow others to connect
  },

  /**
   * Called when the PropertyFormatter is in edit mode and one of the
   * editors have been modified but the "save" action has not neccessarily 
   * been taken yet.  This may be used to trigger a call to "isValid()" to
   * check if the current value contained is in fact a valid value.
   * @param property The property name that the editor is bound to.
   * @param value The new value assigned to the property.
   * @param formatter The PropertyFormatter that triggered the event. 
   */
  onEditorChange: function(property, value, formatter) {
	  // do nothing, but allow others to connect
  },
  
  /**
   * Private method to set the read-only attribute
   * for the specified value.
   * @param {Object} value
   * @private
   */
  _setReadOnlyAttr: function(value) {
    this.readOnly = value;
    
    // mark the read-only state of editors
    if (this._editorsByName) {
	  for (var prop in this._editorsByName) {
		  var editor = this._editorsByName[prop];
		  if (! editor) continue;
		  var adaptor = editor.propertyEditAdaptor;
		  if (! adaptor) continue;
		  adaptor.setEditorReadOnly(editor, value);
	  }
	}

    if (! this._editController) return;
    this._editController.set("readOnly", value);
    
  },

  /**
   * Private method to set the disabled attribute
   * for the specified value.
   * @param {Object} value
   * @private
   */
  _setDisabledAttr: function(value) {
    this.disabled = value;
    
    // mark the disabled state of editors
    if (this._editorsByName) {
	  for (var prop in this._editorsByName) {
		  var editor = this._editorsByName[prop];
		  if (! editor) continue;
		  var adaptor = editor.propertyEditAdaptor;
		  if (! adaptor) continue;
		  adaptor.setEditorDisabled(editor, value);
	  }
	}
    
    if (! this._editController) return;
    this._editController.set("disabled", value);
  },

  /**
   * Private method called when save button pressed
   * @param {Event} event
   * @private
   */
  _onSave: function(event) {
    if (!this._editMode) return;
    this._editMode = false;

    if (this._editorsByOrder) {
    	for (var index = 0; index < this._editorsByOrder.length; index++) {
    		var editor   = this._editorsByOrder[index];
    		if (! editor) continue;
    		var adaptor  = editor.propertyEditAdaptor;
    		if (!adaptor) continue;
    		var editName = adaptor.getPropertyName(editor);
    		if (!iString.nullTrim(editName)) continue;
    		
    		var value = adaptor.getEditorValue(editor);
    		var checkable = adaptor.isEditorCheckable(editor);
    		var checked = adaptor.isEditorChecked(editor);
    		if ((value == "on" || value=="false" || value=="true" || value=="off") 
    				&& ((checked === true) || (checked === false) || checkable)) {
    			value = checked;
    		}
    		this.saveEditorValue(editName, value);
    	}
    } 
    if (this._properties) {
    	for (var index = 0; index < this._properties.length; index++) {
    		var propDesc = this._properties[index];
    		var propName = propDesc.propName;
    		var editor   = this._editorsByName[propName];
    		if (! editor) continue;
    		var adaptor = editor.propertyEditAdaptor;
    		if (! adaptor) continue;
    		if (iString.nullTrim(adaptor.getPropertyName(editor))) continue; // already handled
      
    		var value = adaptor.getEditorValue(editor);
    		var checkable = adaptor.isEditorCheckable(editor);
    		var checked = adaptor.isEditorChecked(editor);
    		if ((value == "on" || value=="false" || value=="true" || value=="off") 
    				&& ((checked === true) || (checked === false) || checkable)) {
    			value = checked;
    		}
    		this.saveEditorValue(propName, value);
    	}
    }
    this._reformat();

    dDomClass.remove(this.domNode, this.baseClass + "EditMode");

    this.onChange(this._getData(), this);
  },

  /**
   * Private method called when cancel button pressed
   * @param {Event} event
   * @private
   */
  _onCancel: function(event) {
    if (!this._editMode) return;
    this._editMode = false;
    dDomClass.remove(this.domNode, this.baseClass + "EditMode");
    this._prepareEditors();
    if (this._editController) this._editController.set("readOnly", this.readOnly);
    this.onEditCancel();
  },

  /**
   * Called to signal the property formatter has cancelled editing. 
   */
  onEditCancel: function() {
	  
	  
  },
  
  /**
   * Called to signal the edit controller has transitioned to edit mode.
   */
  onEditBegin: function() {
	  
  },
  
  /**
   * 
   */
  _prepareEditors: function() {
	  	if ((!this.properties) || (!this._editorsByOrder)) return;
	    for (var index = 0; index < this._editorsByOrder.length; index++) {
	        var editor   = this._editorsByOrder[index];
	        if (!editor) continue;
	        var adaptor = editor.propertyEditAdaptor;
	        if (!adaptor) continue;
	        
	        var editName = adaptor.getPropertyName(editor);
	        if (! iString.nullTrim(editName)) continue;
	        
	        var value = this.prepareEditorValue(editName);
	        // check if we have a boolean value
	        if ((value == true) || (value == false)) {
	          var checkable = adaptor.isEditorCheckable(editor);
	      	  var checked = adaptor.isEditorChecked(editor);
	      	  // see if the "checked" property exists with a boolean value
	      	  if ((checked == true) || (checked == false) || checkable) {
	      		  // if so then set the property
	      		  adaptor.setEditorChecked(editor, value);
	      	  }
	        }   
	        
	        // reset the editor to initial state
        	if (adaptor.isEditorResetable(editor)) {
        		adaptor.resetEditor(editor);
        	}
        	
	        // set the value on the editor
	        adaptor.setEditorValue(editor, value);
	        
	        // for non-resetable editors, try re-validating to clear any errors
	        if (!adaptor.isEditorResetable(editor) && adaptor.isEditorValidating(editor)) {
	        	adaptor.validateEditor(editor);
	        }
	      }

	      for (var index = 0; index < this._properties.length; index++) {
	         var propDesc     = this._properties[index];
	         var propName     = propDesc.propName;
	         var editor       = this._editorsByName[propName];

	         if (!editor) continue;
	         var adaptor = editor.propertyEditAdaptor;
	         if (!adaptor) continue;
	         
	         if (iString.nullTrim(adaptor.getPropertyName(editor))) continue; // already handled

	         var value = this.prepareEditorValue(propName);
	         if ((value == true) || (value == false)) {
	          var checkable = adaptor.isEditorCheckable(editor);
	       	  var checked = adaptor.isEditorChecked(editor);
	       	  
	       	  // see if the "checked" property exists with a boolean value
	       	  if ((checked == true) || (checked == false) || checkable) {
		   		  // if so then set the property
	       		  adaptor.setEditorChecked(editor, value);
	       	  }
	        }
	        
	        // reset the editor
	        if (adaptor.isEditorResetable(editor)) {
	        	adaptor.resetEditor(editor);
	        }
			
			// resize the editor
			if (adaptor.isEditorResizable(editor)) {
				adaptor.resizeEditor(editor);
			}

	        // set the value on the editor
	        adaptor.setEditorValue(editor, value);
	        
	        // for non-resetable editors, try re-validating to clear any errors
	        if (!adaptor.isEditorResetable(editor) && adaptor.isEditorValidating(editor)) {
	        	adaptor.validateEditor(editor);
	        }
	     }	  
  },
  
  /**
   * Private method called when edit button pressed
   * @param {Event} event
   * @private
   */
  _onEdit: function(event) {
	if (this._editMode) return;
    if (this.getChildren().length == 0) return;
    this._editMode = true;
    dDomClass.add(this.domNode, this.baseClass + "EditMode");

    this._prepareEditors();
    
    if ((this._editController) && (this._editorsByOrder) && (this._editorsByOrder.length > 0)) {
    	var firstEditor = this._editorsByOrder[0];
    	if ("focus" in firstEditor && dLang.isFunction(firstEditor.focus)) {
    		firstEditor.focus();
    	}
    }
    this.onEditorChange();
    this.onEditBegin();
  },

  /**
   * Method providing for focusing this widget.  This method ensures the proper
   * child element obtains focus.  This is especially important when used with
   * an EditController to ensure a sensible field is focused for edit.
   */
  focus: function() {
	  if ((this._editMode) && (this._editorsByOrder.length > 0)) {
		  	var firstEditor = this._editorsByOrder[0]; 
		  	if ("focus" in firstEditor && dLang.isFunction(firstEditor.focus)) {
		  		firstEditor.focus();
		  	} else {
		  		this.focusNode.focus();
		  	}
	  } else {
		  this.focusNode.focus();
	  }
  },
  
  /**
   * Called to prepare a valud for editing
   * @param {String} propName
   * @returns {Object} data
   */
  prepareEditorValue: function(/*String*/ propName) {
    var data = this._getData();
    var val  = null;
    if (this.toEditFunc) {
      val = this.toEditFunc.call(this, propName, data);
    }
    if (val) return val;
    var propDesc = this._propsByName[propName];
    if (!propDesc) return null;
    return (data) ? this._resolveValue(data, propDesc.propParts) : null;
  },

  /**
   * Called to save a value to data
   * @param {String} propName
   * @param {Object} value
   */
  saveEditorValue: function(/*String*/ propName, /*Object*/ value) {
    var data = this._getData();
    var propDesc = null;
    var mixinProps = { };
    if (! data) return;
    if (this.fromEditFunc) {
       var result = this.fromEditFunc.call(this, propName, value, data);
       if (result != null) {
    	  for (var field in result) {
    		  	propDesc = this._propsByName[field];
    		  	if (propDesc) {
    		  		this._resolveEdit(data, propDesc.propParts, result[field]);
    		  	}
          }
    	  return;
       }
    }
    propDesc = this._propsByName[propName];
    if (propDesc) {
    	this._resolveEdit(data, propDesc.propParts, value);
    }
  },
  
  /**
   * Called after the PropertyFormatter is reformatted (typically with a new value).
   */
  onRefresh: function(data,formatter,grid) {
	  
  }
});
});
