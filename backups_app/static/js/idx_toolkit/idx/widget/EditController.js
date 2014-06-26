/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/_base/lang",
        "dojo/aspect",
        "dojo/dom-attr",
        "dojo/dom-class",
        "dijit/registry",
        "dijit/form/Button",
        "../resources",
        "../string",
        "../util",
        "../form/Link",
        "../layout/ButtonBar",
        "dojo/text!./templates/EditController.html",
        "dojo/i18n!../nls/base",
        "dojo/i18n!./nls/base",
        "dojo/i18n!./nls/EditController"],
		function(dDeclare,					// dDeclare					(dojo/_base/declare)
				 dWidget,					// dWidget					(dijit/_Widget)
				 dTemplatedMixin,			// dTemplatedMixin			(dijit/_TemplatedMixin)
				 dWidgetsInTemplateMixin,	// dWidgetsInTemplateMixin	(dijit/_WidgetsInTemplateMixin)
				 dLang,						// dLang					(dojo/_base/lang)
				 dAspect, 				    // dAspect					(dojo/aspect)
				 dDomAttr,					// dDomAttr					(dojo/dom-attr)
				 dDomClass,					// dDomClass				(dojo/dom-class)
				 dRegistry,					// dRegistry				(dijit/registry)
				 dButton,					// dButton					(dijit/form/Button)
				 iResources,				// iResoures				(../resources)
				 iString,					// iString					(../string)
				 iUtil,						// iUtil					(../util)
				 iLink,						// iLink					(../form/Link)
				 iButtonBar,				// iButtonBar				(../layout/ButtonBar)
				 templateText) 				// (dojo/text!./templates/EditController.html)
{
/**
 * @name idx.widget.EditController
 * @class Provides a button/link to trigger "edit" feature which then switches to multiple buttons 
 *        for "save" and "cancel" of editing along with appropriate events.  This is typically used
 *        with inline editing.
 * @augments dijit._Widget
 * @augments dijit._TemplatedMixin
 * @example
	   Example usage:
	  	&lt;div 
	       id="idxTestEditController2" 
	       dojoType="idx.widget.EditController" 
	       region="titleActions">&lt;/div>
		&lt;div dojoType="idx.grid.PropertyGrid" 
	       data="{givenName: 'Joe', surname: 'Schmoe', age: 31, birthDate: new Date(1980,0,1)}"
	       properties="givenName,surname,age(int),birthDate(dat)"
	       editController="dijit.byId('idxTestEditController2')">
 */
return dDeclare("idx.widget.EditController",[dWidget,dTemplatedMixin,dWidgetsInTemplateMixin], 
		/**@lends idx.widget.EditController#*/	
{
  /**
   * The ID of the node controlled by this controller when in read mode.
   */
  readControlledNodeIDs: "",
  
  /**
   * The ID of the node controlled by this controller when in edit mode. 
   */
  editControlledNodeIDs: "",
  
  /**
   * Flag indicating if the controller is in read-only mode.
   * @type boolean
   * @default false
   */
  readOnly: false,

  /**
   * Flag indicating if the controller is in disabled mode.
   * @type boolean
   * @default false
   */
  disabled: false,

  /**
   * The label to use for the save button if editting.  If not specified then
   * the default is taken from idx.resources using the "editLabel" key and the
   * "idx.widget.EditController" scope.
   * @type String
   * @default ""
   */
  editLabel: "",

  /**
   * The label to use for the save button if editing.  If not specified then
   * the default is taken from idx.resources using the "saveLabel" key and the
   * "idx.widget.EditController" scope.
   * @type String
   * @default ""
   */
  saveLabel: "",

  /**
   * The label to use for the cancel button if editing.  If not specified then
   * the default is taken from idx.resources using the "cancelLabel" key and the
   * "idx.widget.EditController" scope.
   * @type String
   * @default ""
   */ 
  cancelLabel: "",

	/**
	 * Overrides of the base CSS class.
	 * This string is used by the template, and gets inserted into
	 * template to create the CSS class names for this widget.
	 * @private
	 * @constant
	 * @type String
	 * @default "idxEditController"
	 */
  baseClass: "idxEditController",

	/**
	 * The path to the widget template for the dijit._TemplatedMixin base class.
	 * @constant
	 * @type String
	 * @private
	 * @default "widget/templates/EditController.html"
	 */
  templateString: templateText,

	/**
	 * Constructor
	 * Handles the reading any attributes passed via markup.
	 * @param {Object} args
	 * @param {Object} node
	 */
  constructor: function(args, node) {
    this._started    	= false;
    this._editMode   	= false;
    this._linkedEditors = {};
  },

  /**
   * Handles destroying handles from linked editors.
   */
  destroy: function() {
  	if (this._linkedEditors) {
  		for (var editorID in this._linkedEditors) {
  			var link = this._linkedEditors[editorID];
  			if (link.changeHandle) {
  				link.changeHandle.remove();
  				delete link.changeHandle;
  			}
  		}
  	}
  	this.inherited(arguments);
  },
  
  /**
   * Overridden to lookup default resources.
   */ 
  buildRendering: function() {
	var resources = iResources.getResources("idx/widget/EditController", this.lang);
    if (iString.nullTrim(this.editLabel) == null) 
       this.editLabel = resources.editLabel;
    if (iString.nullTrim(this.saveLabel) == null) 
       this.saveLabel = resources.saveLabel;
    if (iString.nullTrim(this.cancelLabel) == null) 
       this.cancelLabel = resources.cancelLabel;
    this.inherited(arguments);
    this._built = true;
    this._updateReadControlNodeIDs();
    this._updateEditControlNodeIDs();
  },

  /**
   * postCreate - extended to create dojo handles to internal buttons
   */
  postCreate: function() {
    this.inherited(arguments);
    this.own(dAspect.after(this._saveButton, "onClick", dLang.hitch(this, this._onSaveClick), true));
    this.own(dAspect.after(this._cancelButton, "onClick", dLang.hitch(this, this._onCancelClick), true));
    this.own(dAspect.after(this._editLink, "onClick", dLang.hitch(this, this._onEditClick), true));
  },

  /**
   * Sets those nodes that are controlled by the edit link using
   * the "aria-controls" attribute on the edit link (i.e.: the controlled
   * nodes when in read-only mode when the edit link is visible).  This is to 
   * assist screen readers that might make use of this for accessibility.
   * 
   * @param (String) ids -- a comma-separated list of IDs
   * @private
   */
  _setReadControlledNodeIDsAttr: function(ids) {
	  this.readControlledNodeIDs = ids;
	  this._updateReadControlNodeIDs();
  },

  /**
   * Updates the "aria-controls" attribute for the edit link according to the
   * "readControlledNodeIDs" field as well as the linked editors.
   */
  _updateReadControlNodeIDs: function() {
	  if (!this._built) return;
	  var ids = {};
	  if (iString.nullTrim(this.readControlledNodeIDs)) {
		  	var idArray = this.readControlledNodeIDs.split(",");
		  	for (var index = 0; index < idArray.length; index++) {
		  		var id = iString.nullTrim(idArray[index]);
		  		if (id) ids[id] = true;
		  	}
	  }
	  
	  // determine any node IDs specified by the linked editors
	  for (var editorID in this._linkedEditors) {
		  var link = this._linkedEditors[editorID];
		  var nodeIDs = link.readNodeIDs;
		  if (iString.nullTrim(nodeIDs)) {
			  var idArray = nodeIDs.split(",");
			  for (var index = 0; index < idArray.length; index++) {
				  var id = iString.nullTrim(idArray[index]);
				  if (id) ids[id] = true;
			  }
		  }
	  }
	  
	  var idText = "";
	  var prefix = "";
	  for (var field in ids) {
		  idText = idText + prefix + field;
		  prefix = " ";
	  }
	  
	  // check if we need to remove or set the aria-controls attirbutes
	  if (!iString.nullTrim(idText)) {
		  dDomAttr.remove(this._editLink.domNode, "aria-controls");
	  } else {
		  dDomAttr.set(this._editLink.domNode, "aria-controls", idText);
	  }
  },
  
  /**
   * Sets those nodes that are controlled by the Save and Cancel buttons using
   * the "aria-controls" attribute on those buttons (i.e.: the controlled
   * nodes when in edit mode mode when the save and cancel buttons are visible).
   * This is to assist screen readers that might make use of this for accessibility.
   * 
   * @param (String) ids -- a comma-separated list of IDs
   * @private
   * 
   */
  _setEditControlledNodeIDsAttr: function(ids) {
	  this.editControlledNodeIDs = ids;
	  this._updateEditControlNodeIDs();
  },
  
  /**
   * Updates the "aria-controls" attribute for the edit link according to the
   * "readControlledNodeIDs" field as well as the linked editors.
   */
  _updateEditControlNodeIDs: function() {
	  if (!this._built) return;
	  var ids = {};
	  if (iString.nullTrim(this.editControlledNodeIDs)) {
		  	var idArray = this.editControlledNodeIDs.split(",");
		  	for (var index = 0; index < idArray.length; index++) {
		  		var id = iString.nullTrim(idArray[index]);
		  		if (id) ids[id] = true;
		  	}
	  }
	  
	  // determine the IDs specified by the linked editors
	  for (var editorID in this._linkedEditors) {
		  var link = this._linkedEditors[editorID];
		  var nodeIDs = link.editNodeIDs;
		  if (iString.nullTrim(nodeIDs)) {
			  var idArray = nodeIDs.split(",");
			  for (var index = 0; index < idArray.length; index++) {
				  var id = iString.nullTrim(idArray[index]);
				  if (id) ids[id] = true;
			  }
		  }
	  }
	  
	  var idText = "";
	  var prefix = "";
	  for (var field in ids) {
		  idText = idText + prefix + field;
		  prefix = " ";
	  }
	  
	  // check if we need to remove or set the aria-controls attirbutes
	  if (!iString.nullTrim(idText)) {
		  dDomAttr.remove(this._saveButton.focusNode, "aria-controls");
		  dDomAttr.remove(this._cancelButton.focusNode, "aria-controls");
	  } else {
		  dDomAttr.set(this._saveButton.focusNode, "aria-controls", idText);
		  dDomAttr.set(this._cancelButton.focusNode, "aria-controls", idText);
	  }
  },
  /**
   * Private method to set the edit link label to the specified value.
   * @param {String} value (of label)
   * @private
   */
  _setEditLabelAttr: function(value) {
     this._editLink.set("label", value);
  },

  /**
   * Private method to set the save button label.
   * @param {String} value (of label)
   * @private
   */
  _setSaveLabelAttr: function(value) {
     this._saveButton.set("label", value);
  },

  /**
   * Private method to set the cancel button label.
   * @param {String} value (of label)
   * @private
   */
  _setCancelLabelAttr: function(value) {
     this._cancelButton.set("label", value);
  },

  /**
   * Called at startup to init contained buttons 
   */
  startup: function() {
    if (this._started) return;
    this.inherited(arguments);
    this._editLink.startup();
    this._saveButton.startup();
    this._cancelButton.startup();
    this._buttonBar.startup();
  },

  /**
   * Internal method that is called whenever the save button is clicked.
   * @private
   */
  _onSaveClick: function() {
    if (! this._editMode) return;
    
    for (var editorID in this._linkedEditors) {
    	var link = this._linkedEditors[editorID];
    	if (link.onPreSave) {
    		link.onPreSave();
    	}
    }
    this.onPreSave();
    
    this._editMode = false;
    dDomClass.remove(this.domNode, this.baseClass + "EditMode");        
    this.onResize();
    this._editLink.focus();

    for (var editorID in this._linkedEditors) {
    	var link = this._linkedEditors[editorID];
    	if (link.onSave) {
    		link.onSave();
    	}
    }
    this.onSave();

    for (var editorID in this._linkedEditors) {
    	var link = this._linkedEditors[editorID];
    	if (link.onPostSave) {
    		link.onPostSave();
    	}
    }
    this.onPostSave();
  },

  /**
   * Internal method that is called whenever the cancel button is clicked.
   * @private
   */
  _onCancelClick: function() {
    if (! this._editMode) return;
    this._editMode = false;
    dDomClass.remove(this.domNode, this.baseClass + "EditMode");        
    this.onResize();
    this._editLink.focus();
    
    for (var editorID in this._linkedEditors) {
    	var link = this._linkedEditors[editorID];
    	if (link.onCancel) {
    		link.onCancel();
    	}
    }
    this._valid = true;
    this._updateButtons();
    this.onCancel();
  },

  /**
   * Internal method that is called whenever the edit link is clicked
   * @private
   */
  _onEditClick: function() {
    if (this._editMode) return;
    this._editMode = true;
    dDomClass.add(this.domNode, this.baseClass + "EditMode");        
    this.onResize();
    this._cancelButton.focus();

    for (var editorID in this._linkedEditors) {
    	var link = this._linkedEditors[editorID];
    	if (link.onEdit) {
    		link.onEdit();
    	}
    }
    this.onEdit();
  },

  /**
   * This function exists so you can attach to it to 
   * be notified whenever the edit link has been clicked.
   */
  onEdit: function() {

  },
    
  /**
   * This function exists so you can attach to it to 
   * be notified whenever the save button has been clicked.
   */
  onSave: function() {

  },

  /**
   * This function exists so you can attach to it to
   * be notified before the "onSave()" function has been 
   * called.  This should occur BEFORE all those 
   * attached to the "onSave()" function have been notified
   * of the "save button" click and therefore before any saving
   * has occurred. 
   */
  onPreSave: function() {
	  
  },
  
  /**
   * This function exists so you can attach to it to
   * be notified after the "onSave()" function has returned
   * and completed.  This should occur AFTER all those 
   * attached to the "onSave()" function have been notified
   * of the "save button" click and therefore after all saving
   * has been completed. 
   */
  onPostSave: function() {
	  
  },
  
  /**
   * This function exists so you can attach to it to 
   * be notified whenever the cancel button has been clicked.
   */
  onCancel: function() {

  },
    
  /**
   * Internally handles disabling internal link and buttons as well
   * as applying the proper class for disabled mode.
   * @private
   * @param {Object} value
   */
  _setDisabledAttr: function(value) {
	this.disabled = value;
	var saveDisabled = this.disabled || this.readOnly;
    dDomClass.toggle(this.domNode, this.baseClass + "Disabled", value);
    this._editLink.set("disabled", value);
    this._saveButton.set("disabled", saveDisabled);
    this._cancelButton.set("disabled", value);
  },

  /**
   * Internally handles making internal link and buttons read only 
   * as well as applying the proper class for disabled mode.
   * @private
   * @param {Object} value
   */
  _setReadOnlyAttr: function(value) {
	this.readOnly = value;
    this._updateButtons();
  },

  /**
   * Updates the widgets buttons based on the current state.  This may be called either
   * because "readOnly" attribute is set or because the current set of
   * linked editors as at least one invalid value.
   */
  _updateButtons: function() {
    dDomClass.toggle(this.domNode, this.baseClass + "ReadOnly", this.readOnly);    
    this._editLink.set("readOnly", this.readOnly);
    this._saveButton.set("readOnly", this.readOnly);
    this._cancelButton.set("readOnly", this.readOnly);
    this._saveButton.set("disabled", (this.readOnly || this.disabled || !this._valid));	  
  },
  
  /**
   * This function is called whenever the widget resizes itself.
   */
  onResize: function() {

  },
  
  /**
   * Callback that is called whenever one of the linked editors changes it value.
   * This will check all editors for valid states.  If any is not valid it will
   * trigger the Save button to become disabled.
   */
  _editorChanged: function() {
	  var valid = true;
	  for (var editorID in this._linkedEditors) {
		  var link = this._linkedEditors[editorID];
		  if (!link) continue;
		  if (link.validCheck && (!link.validCheck())) {
			  valid = false;
		  }
	  }
	  this._valid = valid;
	  this._updateButtons();
  },
    
  /**
   * Internal method for checking the validity of the value for an editor.
   */
  _checkEditorValid: function(editor, attrName) {
	  if ((attrName == "invalid") || (attrName == "isInvalid") || (attrName == "errant")) {
		  return (! editor.get(attrName));
	  } else {
		  // assume name is likely "valid" or something similar
		  return (editor.get(attrName));
	  }
  },

  /**
   * Internal method for interpretting the notifiers when linking editors.
   */
  _interpretNotifier: function(widget, options, eventName) {
	  var notifier = ((options && options[eventName]) ? options[eventName] : null);
	  
	  if (notifier && (iUtil.typeOfObject(notifier) == "string") && (notifier in widget)
		  && (iUtil.typeOfObject(widget[notifier] == "function"))) {
		  notifier = dLang.hitch(widget, notifier);
	  }
	  if (notifier && (iUtil.typeOfObject(notifier) == "object") && ("attribute" in notifier)
		  && ("value" in notifier) && (widget[notifier.attribute])) {
		  notifier = dLang.hitch(editor, "set", notifier.attribute, notifier.value);
	  }
	  if (notifier && (iUtil.typeOfObject(notifier) != "function")) {
		  throw "The specified " + eventName + " handler is not a function of the specified widget, "
		        + "nor is it an object describing an attribute and value for the specified widget.  "
		        + "notifier=[ " + notifier + " ], notifier.attribute=[ " + notifier.attribute
		        + " ], notifier.value=[ " + notifier.value + " ]";
	  }
	  return notifier;
  },
  
  /**
   * Links the specified editor widget this with this widget.
   * 
   * @param widget The editor to link with this widget.
   * @param options The options parameter optionally contains one or more of the following:
   * 			- changeEvent: The name of the function to attach to when changes occur in the editor.
   * 			- validCheck: The function, function name or attribute name to check to see if the
   *                   		 editor's value is valid, if none then always assumed valid
   *            - onEdit: What to do when entering "edit mode".  Either a function to call, a 
   *                     function name for a function to call on the editor, or object containing
   *                     "attribute" and "value" fields indicating an attribute of the editor to 
   *                     be set to the specified value upon editing.
   *            - onPreSave: What to do after save is click, but before the "onSave" fires.  Either a 
   *            		 function to call, a function name for a function to call on the editor, or 
   *                     object containing "attribute" and "value" fields indicating an attribute of 
   *                     the editor to be set to the specified value upon pre-save.
   *            - onSave: What to do when entering saved.  Either a function to call, a 
   *                     function name for a function to call on the editor, or object containing
   *                     "attribute" and "value" fields indicating an attribute of the editor to 
   *                     be set to the specified value upon save.
   *            - onPostSave: What to do after save is click, and after the "onSave" fires.  Either a 
   *            		 function to call, a function name for a function to call on the editor, or 
   *                     object containing "attribute" and "value" fields indicating an attribute of 
   *                     the editor to be set to the specified value upon post-save.
   *            - onCancel: What to do when cancelling edit.  Either a function to call, a 
   *                       function name for a function to call on the editor, or object containing
   *                       "attribute" and "value" fields indicating an attribute of the editor to 
   *                       be set to the specified value upon cancel.
   *            - readNodeIDs: For accessibility, the comma-separated string list of node IDs 
   *                           indicating which nodes are "aria-controls" by this widget's "edit" link.
   *            - editNodeIDs: For accessibility, the comma-separated string list of node IDs 
   *                           indicating which nodes are "aria-controls" by this widget's "save" and
   *                           "cancel" buttons.
   */
  linkEditor: function(/*Widget|String*/ widget, /*Object?*/ options) {
	  widget = dRegistry.byId(widget);
	  var widgetID = widget.get("id");
	  if (this._linkedEditors[widgetID]) {
		  this.unlinkEditor(widget);
	  }
	  var changeEvent = ((options && options.changeEvent) ? options.changeEvent : null);
	  
	  // try to default the change event
	  if ((!changeEvent) && ("onEditorChange" in widget) 
			  && (iUtil.typeOfObject(widget.onChange) == "function")) {
		  changeEvent = "onEditorChange";
	  }
	  if ((!changeEvent) && ("onChange" in widget) 
			  && (iUtil.typeOfObject(widget.onChange) == "function")) {
		  changeEvent = "onChange";
	  }
	  if ((changeEvent) 
		  && ((! (("" + changeEvent) in widget))
			   || (iUtil.typeOfObject(widget["" + changeEvent]) != "function"))) {
		  throw "The specified change event is not recognized as a function of the specified editor "
		        + "widget.  changeEvent=[ " + changeEvent + " ]";
	  }
	  
	  // try to default the validity check
	  var validCheck = ((options && options.validCheck) ? options.validCheck : null);
	  if ((!validCheck) && ("isEditorValid" in widget) 
			  && (iUtil.typeOfObject(widget.isEditorValid) == "function")) {
		  validCheck = dLang.hitch(widget, "isEditorValid");
	  }
	  if ((!validCheck) && ("isValid" in widget) 
			  && (iUtil.typeOfObject(widget.isValid) == "function")) {
		  validCheck = dLang.hitch(widget, "isValid");
	  }
	  if (validCheck && (iUtil.typeOfObject(validCheck) == "string") && (validCheck in widget)) {
		  var attrName = validCheck;
		  validCheck = dLang.hitch(this, "_checkEditorValid", editor, attrName);
	  }
	  if (validCheck && (iUtil.typeOfObject(validCheck) != "function")) {
		  throw "The specified validity check is not a function or attribute of the speciifed widget, "
		        + "nor is it a function that can be called.  validCheck=[ " + validCheck + " ]";
	  }
	  
	  // hitch the onSave function if needed
	  var onSave = this._interpretNotifier(widget, options, "onSave");
	  var onPreSave = this._interpretNotifier(widget, options, "onPreSave");
	  var onPostSave = this._interpretNotifier(widget, options, "onPostSave");
	  var onEdit = this._interpretNotifier(widget, options, "onEdit");
	  var onCancel = this._interpretNotifier(widget, options, "onCancel");

	  var changeHandle = null;
	  if (changeEvent) changeHandle = dAspect.after(widget, "" + changeEvent, dLang.hitch(this, "_editorChanged"), true);
	  var link = {
			  editor: widget,
			  changeHandle: changeHandle,
			  validCheck: validCheck,
			  onEdit: onEdit,
			  onPreSave: onPreSave,
			  onSave: onSave,
			  onPostSave: onPostSave,
			  onCancel: onCancel,
			  readNodeIDs: (options.readNodeIDs ? options.readNodeIDs : null),
			  editNodeIDs: (options.editNodeIDs ? options.editNodeIDs: null)
	  };
	  this._linkedEditors[widgetID] = link;
	  if (link.readNodeIDs) this._updateReadControlNodeIDs();
	  if (link.editNodeIDs) this._updateEditControlNodeIDs();
  },

  /**
   * Unlinks the specified widget (or widget identified by the specified ID) from this edit controller.
   * @param widget The widget or String ID of the widget to be unlinked.
   */
  unlinkEditor: function(/*Widget|String*/ widget) {
	  widget = dRegistry.byId(widget);
	  var widgetID = widget.get("id");
	  if (!(widgetID in this._linkedEditors)) return;
	  var link = this._linkedEditors[widgetID];
	  var updateReadNodes = false;
	  var updateEditNodes = false;
	  if (link) {
		  if (link.changeHandle) {
		  	link.changeHandle.remove();
		  	delete link.changeHandle;
		  }
		  link.changeHandle = null;
	  
		  if (link.readNodeIDs) updateReadNodes = true;
		  if (link.editNodeIDs) updateEditNodes = true;
		  
		  for (var field in link) {
			  if (link[field]) delete link[field];
			  link[field] = null;
		  }
	  }
	  delete this._linkedEditors[widgetID];
	  if (updateReadNodes) this._updateReadControlNodeIDs();
	  if (updateEditNodes) this._updateEditControlNodeIDs();
  }
});
});