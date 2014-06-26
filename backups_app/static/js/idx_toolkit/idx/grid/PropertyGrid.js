/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_Container",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/aspect",
        "dojo/string",
        "dojo/dom-construct",
        "dojo/query",
        "dijit/registry",
        "../string",
        "../util",
        "../resources",
        "./PropertyFormatter",
        "dojo/text!./templates/PropertyGrid.html",
        "dojo/text!./templates/_PropertyRow.html",
        "dojo/NodeList-dom",
        "dojo/i18n!../nls/base",
        "dojo/i18n!./nls/base",
        "dojo/i18n!./nls/PropertyGrid"],
        function(dDeclare,				// (dojo/_base/declare)
		         dWidget,				// (dijit/_Widget)
		         dTemplatedMixin,		// (dijit/_TemplatedMixin)
		         dContainer,			// (dijit/_Container)
		         dLang,					// (dojo/_base/lang)
				 dArray,				// (dojo/_base/array)
				 dAspect,				// (dojo/aspect)
				 dString,				// (dojo/string)
				 dDomConstruct,			// (dojo/dom-construct),
				 dQuery,				// (dojo/query.NodeList) + (dojo/NodeList-dom)
				 dRegistry,				// (dijit/registry)
				 iString,				// (../string)
				 iUtil,					// (../util)
				 iResources,			// (../resources)
				 iPropertyFormatter,	// (./PropertyFormatter)
				 templateText,			// (dojo/text!./templates/PropertyGrid.html)
				 rowTemplateText) {		// (dojo/text!./templates/PropertyRow.html)
	
	// place holder function
	var placeHolder = new function() { };
	
	var dNodeList = dQuery.NodeList;
	
	/**
	 * @name idx.grid._PropertyRow
	 * @class Property row widget.
	 * Internal widget class used by idx.grid.PropertyGrid to manage its rows.
	 * @private
	 * @augments dijit._Widget
	 * @augments dijit._TemplatedMixin
	 */
	var PropertyRow = dDeclare("idx.grid._PropertyRow",[dWidget,dTemplatedMixin],
		/**@lends idx.grid._PropertyRow#*/ 
	{
		  /**
		   * The property name for this instance.
		   * @type String
		   * @default ""
		   */
		  propertyName: "",

		  /**
		   * The property type for this instance.
		   * @type String
		   * @default ""   
		   */
		  propertyType: "",

		  /**
		   * The formatter for this instance.
		   * @type Function
		   * @default null
		   */
		  formatter: null,

		  /**
		   * the parent property grid for this instance
		   * @type Object
		   * @default null   
		   */
		  propertyGrid: null,

		  /**
		   * The label for this property.
		   * @type String
		   * @default ""   
		   */
		  label: "",

		  /*
		   * The index for this row in the grid.
		   * @type int
		   * @default 0   
		   */
		  rowIndex: 0,

		  /**
		   * The total number of rows in the grid.
		   * @type int
		   * @default 1   
		   */
		  rowCount: 1,

		  /**
		   * The attribute map for mapping content to the template.
		   * @type Object
		   * @default { title: { node: "titleNode", type: "innerHTML" } }  
		   */
		  attributeMap: dLang.delegate(dijit._Widget.prototype.attributeMap, {
		    title: { node: "titleNode", type: "innerHTML" }
		  }),

			/**
		 	 * Overrides of the base CSS class.
		 	 * This string is used by the template, and gets inserted into
		 	 * template to create the CSS class names for this widget.
		 	 * @private
		 	 * @constant
		 	 * @type String
		 	 * @default "idxPropertyRow"
		 	 */
		  baseClass: "idxPropertyRow",

		  /**
		   * This will be set to "Solo", "First, "Last" or "Middle" depending on the
		   * rowCount and the rowIndex.  "Solo" is only used if there is only one row
		   * in the entire grid.
		   * @type String
		   * @default "Solo"
		   */
		  posClassSuffix: "Solo",

		  /**
		   * This will be set to "Even" or "Odd" for applying additional CSS classes
		   * to the elements in the template.
		   * @type String
		   * @default "Solo"
		   */
		  altClassSuffix: "Even",
		  
			/**
			 * The path to the widget template for the dijit._TemplatedMixin base class.
			 * @constant
			 * @type String
			 * @private
			 * @default "grid/templates/_PropertyRow.html"
			 */
		  templateString: rowTemplateText,
		  
			/**
			 * Constructor
			 * Handles the reading any attributes passed via markup.
			 * @param {Object} args
			 * @param {Object} node
			 */
		  constructor: function(args, node) {
		    this._started = false;
		  },

		  /**
		   * Cleans up any loose handles.
		   */
		  destroy: function() {
			  if (this._editHandle) {
			  	this._editHandle.remove();
			  	delete this._editHandle;
			  }
			  if (this._changeHandle) {
			  	this._changeHandle.remove();
			  	delete this._changeHandle;
			  }
			  if (this._preSaveHandle) {
			  	this._preSaveHandle.remove();
			  	delete this._preSaveHandle;
			  }
			  if (this._postSaveHandle) {
			  	this._postSaveHandle.remove();
			  	delete this._postSaveHandle;
			  }
			  if (this.formatter && this._ownsFormatter) {
                  this.formatter.destroyRecursive();
                  delete this.formatter;
              }
			  this.inherited(arguments);
		  },
		  
		  /**
		   * Sets the row index attribute.  This method would normally not be needed since
		   * it only serves to set the member variable, HOWEVER, without this function in 
		   * place this module fails to function properly on IE7 when running under the 
		   * Dojo AMD loader.  The cause of the IE7 failure was not determined, only that
		   * the failure of "Object Error" would occur while setting "rowIndex" from the
		   * _WidgetBase.applyAttributes function.  Adding this function seems to workaround
		   * the issue.
		   * 
		   * @param value
		   */
		  _setRowIndexAttr: function(value) {
			this.rowIndex = value;
		  },
		  
		  /**
		   * Overrides dijit._Widget.postMixInProperties() to set
		   * properties, formatter and class variables.
		   * @see dijit._Widget.postMixInProperties
		   */
		  postMixInProperties: function() {
		    this.inherited(arguments);
		    var propType = iString.nullTrim(this.propertyType);
		    var properties = this.propertyName;
		    if (propType) {
		      properties = properties + "(" + propType + ")";
		    }
		    if (!this.formatter) {
		       this._ownsFormatter = true;
		       this.formatter = new iPropertyFormatter({
		              properties: properties,
		              propertyName: this.propertyName,
		              propertyContainer: this.propertyGrid});
		    }
		    this.altClassSuffix = ((this.rowIndex % 2) == 0) ? "Even" : "Odd";
		    this.posClassSuffix = ((this.rowCount == 1) ? "Solo"
		                           : ((this.rowIndex == 0) ? "First"
		                              : ((this.rowIndex == (this.rowCount - 1)) ? "Last"
		                                 : "Middle")));
		  },

		  /**
		   * Handles building out the markup and placing the formatter in the proper
		   * location.  If the formatter is custom, then it orphans it from the 
		   * grid's hidden location.
		   * @see dijit._Widget.buildRendering
		   */ 
		  buildRendering: function() {
		    this.inherited(arguments);
		  },

		  /**
		   * Called at startup to set state, setup children
		   * and rebuild rows.
		   * @see dijit._Widget.startup
		   */
		  startup: function() {
		    if (this._started) return;
		    if (!this._ownsFormatter) {
		       var nodeList = new dNodeList(this.formatter.domNode);
		       nodeList.orphan();
		    }

		    dDomConstruct.place(this.formatter.domNode, this.valueNode, "last");
		    
		    if (this._ownsFormatter) {
		       this.formatter.startup();
		    }
		    this.inherited(arguments);
		    this._changeHandle = dAspect.after(this.formatter, "onChange", dLang.hitch(this.propertyGrid, "_onChange"), true);
		  },
		  
		  /**
		   * Checks if this instance has any defined editors (i.e.: if the formatter has children)
		   * This returns true if editors are found, otherwise false. 
		   */
		  hasEditors: function() {
			return (this.formatter.getChildren().length > 0);  
		  },

		  /**
		   * Method provided for focusing the proper element on the row
		   * when editing.
		   */
		  focus: function() {
			  this.formatter.focus();
		  },
		  
		  /**
		   * Calls the contained formatter's 'reformat' method.
		   */
		  reformat: function() {
			var title = null;
			var label = this.propertyGrid._getLabel(this.propertyName);
		    this.set("title", label);
		    this.formatter.refresh();
		  }
	});

	/**
	 * @name idx.grid.PropertyGrid
	 * @class Provides a two-column grid display of name/value object properties.  The class
	 *        provides for simple property formatting as well as complex formatting via
	 *        idx.grid.PropertyFormatter.  A display property may be made up of one or more
	 *        actual data properties.  Inline editing is also supported at the individual
	 *        property level (via PropertyFormatter) or at the grid level (allowing for a
	 *        single "Edit" button to control editing).
	 * Internal widget class used by idx.grid.PropertyGrid to manage its rows.
	 * @public
	 * @augments dijit._Widget
	 * @augments dijit._TemplatedMixin
	 */
	var PropertyGrid = dDeclare("idx.grid.PropertyGrid", [dWidget,dTemplatedMixin,dContainer],
			/**@lends idx.grid.PropertyGrid#*/ {
  /**
   * The data object for this instance.
   * @type Object
   * @default null
   */
  data: null,

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
       EXAMPLE 3 (property with type): "startTime(time)"
       EXAMPLE 4 (assorted list):  "givenName,surname,age(int),birthDate(date)"
       
       The legal format types are:
          - txt:      assumes literal text (default for string properties)   
          - dat:      uses date formatting (default for date properties)
          - tim:      uses time formatting
          - dtm:      uses date-time formatting
          - dec:      uses decimal formatting (default for numeric properties)
          - int:      uses integer formatting
          - pct:      uses percentage formatting
          - cur:      uses currency formatting
 
   */
  properties: "",

  /**
   * The resources to use for obtaining the labels for each of the properties.
   * The resources that are used by this include:
   *   - labelKeyPrefix: the default prefix for the key used to lookup labels
   *   - labelKeySuffix: the default suffix for the key used to lookup labels
   *   - emptyFormat: for formatting empty values
   *   - dateFormatOptions: for formatting "dat" properties
   *   - timeFormatOptions: for formatting "tim" properties
   *   - dateTimeFormatOptions: for formatting "dtm" properties
   *   - decimalFormatOptions: for formatting "dec" properties
   *   - integerFormatOptions: for formatting "int" properties
   *   - percentFormatOptions: for formatting "pct" properties
   *   - currencyFormatOptions: for formatting "cur" properties
   *   - labelFieldSeparator: for separating labels from their fields
   * @type String
   * @default null
   */
  resources: null,

  /**
   * Indicates whether or not the property grid should use the property
   * names directly as labels rather than trying to lookup them in 
   * resources or format them nicely.
   * @type Boolean
   * @default false 
   */
  rawLabels: false,
  
  /**
   * The prefix to attach to the property names when looking up the label
   * for that field in the resources.  If not specified the value is taken
   * from the resources using the "labelKeyPrefix" key.  The default value
   * is empty string.
   * @type String
   * @default ""   
   */
  labelKeyPrefix: "",

  /**
   * The suffix to attach to the property names when looking up the label
   * for that field in the resources.  If not specified the value is taken
   * from the resources using the "labelKeyPrefix" key.  The default value
   * is empty string.
   * @type String
   * @default ""   
   */
  labelKeySuffix: "",

  /**
   * Overrides the "format" attribute by providing a function to call to 
   * format the data object directly.  The property name and the data object 
   * itself are passed as parameters to this function and it is expected to
   * return a string.  If this function returns null, then the default formatting
   * for the property is used.
   * @type String
   * @default null
   */
  formatFunc: placeHolder,

  /**
   * A reference to or the string ID of the idx.widget.EditController to be used
   * for this instance.  If none is specified the the contained PropertyFormatter
   * instance may create their own EditController to accomodate contained editors. 
   * See idx.widget.EditController.
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
 	 * @default "idxPropertyGrid"
 	 */
  baseClass: "idxPropertyGrid",

	/**
	 * The path to the widget template for the dijit._TemplatedMixin base class.
	 * @constant
	 * @type String
	 * @private
	 * @default "grid/templates/PropertyGrid.html"
	 */
  templateString: templateText,
  
	/**
	 * Constructor
	 * Handles the reading any attributes passed via markup.
	 * @function
	 * @param {Object} args
	 * @param {Object} node
	 */
  constructor: function(args, node) {
    this._started    = false;
    this._formatters = [ ];
    this._rows       = [ ];
  },
  
  /**
   * Cleans up the widgets in the hidden node.
   */
  destroy: function() {
  	if (this._formatters) {
  		for (field in this._formatters) {
  			var formatter = this._formatters[field];
  			if (formatter) {
  				formatter.destroyRecursive();
  				delete this._formatters[field];
  			}
  		}
  		delete this_formatters;	
    }
  
  	var children = dRegistry.findWidgets(this.hiddenNode);
  	dArray.forEach(children, function(child) {
  		child.destroyRecursive();
  		delete child;
  	});
  	this.inherited(arguments);
  },

  /**
   * Overrides dijit._Widget.postMixInProperties() to ensure
   * that the resources are reset.
   * @see dijit._Widget.postMixInProperties
   */
  postMixInProperties: function() {
    iUtil.nullify(this, this.params, ["formatFunc", "labelKeyPrefix", "labelKeySuffix"]);
    this.inherited(arguments);
    if (! this._rawResources) {
      this._rawResources = null;
      this._resetResources();
    }
 },

  /**
   * @see dijit._Container.buildRendering
   */
  buildRendering: function() {
    this.inherited(arguments);
  },
  
  /**
   * @see dijit._Container.postCreate
   */
  postCreate: function() {
    this.inherited(arguments);
  },
  
  /**
   * Called at startup to set state, setup children
   * and rebuild rows.
   * @see dijit._Container.startup
   */
  startup: function() {
    if(this._started){ return; }

    dArray.forEach(this.getChildren(), this._setupChild, this);

    // build out the rows
    this.inherited(arguments);

    this._started = true;
    this._rebuildRows();
    this._registerEditController();    
  },
  
  /**
   * Extends parent method by setting up child
   * widgets and rebuilding rows.
   * @param {Object} child
   * @param {int} index
   * @see dijit._Container.addChild
   */
  addChild: function(/*dijit._Widget*/ widget, /*int?*/ insertIndex) {
      this.inherited(arguments);
      if (this._started) {
         this._setupChild(widget);
         this._rebuildRows();
      }
  },

  /**
   * Extends parent method by setting up child
   * widgets and rebuilding rows.
   * @param {Object} child
   * @param {int} index
   * @see dijit._Container.addChild
   */
  removeChild: function(/*Widget or int*/ widget) {
     this.inherited(arguments);

     if (this._started) {
       if (typeof widget == "number" && widget > 0) {
          widget = this.getChildren()[widget];
       }
       if (widget instanceof iPropertyFormatter) {
         var propName  = widget.get("propertyName");
         this._formatters[propName] = null;
         widget.set("propertyContainer", null);      
       }
       this._rebuildRows();
     }
  },
  
  /**
   * Worker method to set up the added child
   * @param {Widget} child
   */
  _setupChild: function(/*Widget*/ child) {
    this.inherited(arguments);

    var nodeList  = new dNodeList(child.domNode);

    nodeList.orphan();
    dDomConstruct.place(child.domNode, this.hiddenNode, "last");

    if (child instanceof iPropertyFormatter) {
      var propName  = child.get("propertyName");
      this._formatters[propName] = child;
      child.set("propertyContainer", this);
    }
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
    if (this._started) this._reformat();
  },

  /**
   * Private method that sets the format function attribute with the
   * specified value and if the state is started, calls
   * the reformat method.
   * @param {Function} value
   * @private
   */
  _setFormatFuncAttr: function(/*Function*/ value) {
    this.formatFunc = value;
    if (this._started) this._reformat();
  },

  /**
   * Sets the label key prefix and reformats the labels.
   */
  _setLabelKeyPrefixAttr: function(/*String*/ prefix) {
	  this.labelKeyPrefix = prefix;
	  if (this._started) this._reformat();
  },
  
  /**
   * Sets the label key suffix and reformats the labels.
   */
  _setLabelKeySuffixAttr: function(/*String*/ suffix) {
	  this.labelKeySuffix = suffix;
	  if (this._started) this._reformat();
  },
  
  /**
   * Private method that sets the lang attribute with the
   * specified value and if the state is started, calls
   * the reset resources method.
   * @param {Object} value
   * @private
   */
  _setLangAttr: function(/*Object*/ value) {
    this.inherited(arguments);
    this.lang = value;
    this._resetResources();
  },

  /**
   * Private method that sets the resources attribute with the
   * specified value and if the state is started, calls
   * the reset resources method.
   * @param {Object} value
   * @private
   */
  _setResourcesAttr: function(/*Object*/ value) {
    this.resources = value;
    this._resetResources();
  },

  /**
   * Private method to get the resources attribute w
   * @returns {Object} value
   * @private
   */
  _getResourcesAttr: function() {
    return this._resources;
  },

  /**
   * Private method that sets the edit controller attribute with the
   * specified value and calls the on edit controller changed callback.
   * @param {Object} value
   * @private
   */
  _setEditControllerAttr: function(value) {
    this.editController = dijit.byId(value);
    if (this._preSaveHandle) {
    	this._preSaveHandle.remove();
    	delete this._preSaveHandle;
    }
    if (this._postSaveHandle) {
    	this._postSaveHandle.remove();
    	delete this._postSaveHandle;
    }
    if (this.editController) {
    	this._preSaveHandle = dAspect.after(this.editController, "onPreSave", dLang.hitch(this, "_onPreSave"), true);
    	this._postSaveHandle = dAspect.after(this.editController, "onPostSave", dLang.hitch(this, "_onPostSave"), true);
    }
    if (! this._started) return;
    this.onEditControllerChanged(value);
  },

  /**
   * 
   */
  _registerEditController: function() {
	  if (!this._started) return;
	  if (this._editHandle) {
	  	this._editHandle.remove();
	  	delete this._editHandle;
	  }
	  if (this.editController) {
		  this._editHandle = dAspect.after(this.editController, "onEdit", dLang.hitch(this, "_onEdit"), true);
	  }	  
  },
  
  /**
   * Called whenever the edit controller changed
   * @param {Object} controller
   */
  onEditControllerChanged: function(controller) {
	 this._registerEditController(); 
  },

  /**
   * Internal method alled when the edit controller activates edit mode.  This ensures
   * that the appropriate element is focused.
   * @private 
   */
  _onEdit: function() {
	  for (var index = 0; index < this._rows.length; index++) {
		  var row = this._rows[index];
	      if (row.hasEditors()) {
	    	  row.focus();
	    	  break;
	      }
	  }	  
  },
  
  /**
   * Private method that is called whenever one of
   * the property formatters changes a value.
   * @param {Object} data
   * @private
   */
  _onChange: function(data, formatter) {
    if (this._started) this._reformat();
    
    // if we are currently saving multiple properties then we defer onChange() until complete
    if (! this._saving) this.onChange(this.get("data"), this, formatter);
  },

  /**
   * Called whenever the fields of the existing data object are modified,
   * but not when the data object itself is changed.  That is to say that
   * set("data", someValue) will not trigger this method.  If multiple
   * fields are changed with a single click of the "save" button from the
   * PropertyGrid's EditController, then this method is designed to be called
   * only once for the change to avoid multiple round trips to the server.
   * 
   * @param {Object} data  The data that was changed.
   *       
   * @param {PropertyGrid} grid The property grid that fired the event.
   * 
   * @param {PropertyFormatter} formatter The property formatter that triggered the event.
   * 
   */
  onChange: function(data, grid, formatter) {
    
  },
  
  /**
   * Internal method is called whenever the "onPreSave()" event fires
   * from the associated EditController.   
   */
  _onPreSave: function() {
     this._saving = true;
  },
  
  /**
   * Internal method is called whenever the "onPostSave()" event fires
   * from the associated EditController.   
   */
  _onPostSave: function(data, grid) {
     this._saving = false;
     this.onChange(this.get("data"), this);
  },
  
  /**
   * Private method that sets the default resources
   * and if the state is started, calls reformat.
   * @private
   */
  _resetResources: function() {
    var defaultResources 
      = iResources.getResources("idx/grid/PropertyGrid", this.lang);

    // determine if custom resources were specified and if so override 
    // the defaults as needed, otherwise use the defaults as-is
    if (this.resources) {
      var combinedResources = new Object();
      dLang.mixin(combinedResources, defaultResources);
      dLang.mixin(combinedResources, this.resources);
      this._resources = combinedResources;

    } else {
      this._resources = defaultResources;
    }
    if(!this._resources.labelFieldSeparator){
      this._resources.labelFieldSeparator = iResources.getLabelFieldSeparator("idx/grid/PropertyGrid", this.lang);
    }
    if (this._started) this._reformat();
  },

  /**
   * Private method that sets the 'properties' attribute with the
   * specified value and calls rebuild rows.
   * @param {String} properties
   * @private
   */
  _setPropertiesAttr: function(/*String*/ properties) {
    this.properties     = properties;
    this._properties    = [ ];
    var index = 0;

    if (iString.nullTrim(this.properties)) {
       var props = this.properties.split(",");
       var index = 0;

       for (index = 0; index < props.length; index++) {
         var propName = dString.trim(props[index]);
         var propType = null;
         var openParen  = propName.indexOf("(");
         var closeParen = propName.indexOf(")");
 
         if ((openParen >= 0) && (closeParen == (propName.length-1))) {
           propType = propName.substring(openParen + 1, closeParen);
           propType = dString.trim(propType);
           propName = dString.trim(propName.substring(0, openParen));
         }
         
         this._properties.push({propName: propName, propType: propType});
      }
    }
    this._rebuildRows();
  },

  /**
   * Private method that rebuilds the rows in the grid.
   * @private
   */
  _rebuildRows: function() {
    if (! this._started) return;
    var index = 0;
    // move all the formatters up and out of the way
    for (var propName in this._formatters) {
      var formatter = this._formatters[propName];
      if (formatter.domNode.parentNode == this.hiddenNode) continue;
      var nodeList = new dNodeList(formatter.domNode);
      nodeList.orphan();
      dDomConstruct.place(formatter.domNode, this.hiddenNode, "last");
    }

    // remove all existing rows
    for (index = 0; index < this._rows.length; index++) {
      this._rows[index].destroyRecursive();
      dDomConstruct.destroy( this._rows[index].domNode );//since added 1-1, need to remove from dom that way
    }
    this._rows = [ ];//reset rows after they have been destroyed

    // create the new rows
    for (index = 0; index < this._properties.length; index++) {
      var prop      = this._properties[index];
      var propName  = prop.propName;
      var propType  = prop.propType;

      var label = null;
      var formatter = this._formatters[propName];
      if (formatter) label = formatter.get("title");
      if (!iString.nullTrim(label)) label = this._getLabel(propName);

	  var propRowArgs = {
           propertyName: propName,
           propertyType: propType,
           propertyGrid: this,
           title: label,
           rowIndex: index,
           rowCount: this._properties.length};
      if (formatter) {
      	propRowArgs.formatter = formatter;
      }
      this._rows[index] = new PropertyRow(propRowArgs);

      this._rows[index].placeAt(this.bodyNode, "last");      
      this._rows[index].startup();
    }
  },

  /**
   * Gets the prefix to use when building the label key.
   * @private
   * @returns {int} prefix
   */
  _getLabelKeyPrefix : function() {
    if (this.labelKeyPrefix) return this.labelKeyPrefix;
    var prefix = this._resources["labelKeyPrefix"];
    return (prefix) ? prefix : "";
  },

  /**
   * Gets the suffix to use when building the label key.
   * @private
   * @returns {int} suffix
   */
  _getLabelKeySuffix : function() {
    if (this.labelKeySuffix) return this.labelKeySuffix;
    var suffix = this._resources["labelKeySuffix"];
    return (suffix) ? suffix : "";
  },

  /**
   * Attempts to lookup a label for the property name or
   * construct one if it cannot find the lookup value.
   * @private
   * @returns {int} suffix
   */
  _getLabel: function(/*String*/ propName) {
	  if (this.rawLabels) return propName;
     // attempt to lookup the label
     var result = null;
     var prefix = this._getLabelKeyPrefix();
     var suffix = this._getLabelKeySuffix();
     var labelKey = (prefix + propName + suffix);
     result = this._resources[labelKey];
     if (result && iUtil.typeOfObject(result) != "string") result = null;
     
     // if we don't have a label from resources, check the title of the formatter
     if (!result) {
    	 var formatter = this._formatters[propName];
     
    	 if (formatter) {
    		 result = formatter.get("title");
    		 result = iString.nullTrim(result);
    	 }
     }
     
     // check if we don't have a label, and if not try to make one
     if (!result) {
     	result = iString.propToLabel(propName);
     }

     return result;
  },

  /**
   * Exposes reformat method for public access.  Call this method
   * when the underlying data values have changed for the referenced
   * data object in order to notify the PropertyGrid to reformat its
   * displayed values with the new values.
   * 
   * This method need not be called when changing the resources or
   * the properties or the label prefix or suffix as these methods
   * will automatically trigger the appropriate refresh.  This method
   * exists solely for when the data object referenced is shred by 
   * multiple objects and one object has changed the values, but this
   * PropertyGrid may be unaware of that change.
   */
  refresh: function() {
	  if (this._started) this._reformat();
  },

  /**
   * Private method that reformats the rows
   * @private
   */
  _reformat: function() {
    var index = 0;
    for (index = 0; index < this._rows.length; index++) {
       this._rows[index].reformat();
    }
  }
});

	PropertyGrid.PropertyRow = PropertyRow;
	
	return PropertyGrid;
});

