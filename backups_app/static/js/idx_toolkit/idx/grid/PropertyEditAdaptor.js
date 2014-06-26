/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/declare",
 		"dojo/_base/lang",
 		"dijit/_WidgetBase",
		"dijit/form/_FormWidgetMixin",
		"idx/util",
		"idx/string"], 
		function(dDeclare,					// (dijit/_base/declare)
				 dLang,						// (dojo/_base/lang)
				 dWidgetBase,				// (dijit/_WidgetBase)
				 dFormWidgetMixin,			// (dijit/form/_FormWidgetMixin)
				 iUtil,						// (idx/util)
				 iString)					// (/idx/string)
{
	/**
	 * @name idx.grid.PropertyEditAdaptor
	 * @class Mixin for allowing the idx.grid.PropertyFormatter to use any widget
	 * as an "editor".  This provides the "editor" interface to the widget.  
	 *  
	 */
	var iPropertyEditAdaptor = dDeclare("idx.grid.PropertyEditAdaptor", null,
			/**@lends idx.grid.PropertyEditAdaptor#*/				
{
	/**
	 * Indicates whether or not the widget should be used as an editor.  The value defaults
	 * to null in the constructor if not specified.  A null value indicates that it will
	 * automatically be determined as true for descendants of dijit.form._FormWidgetMixin and
	 * false for non-descendants.  A value of true means that the widget will always be 
	 * considered an editor regardless of lineage of a value of false indicates that the widget
	 * will never be considered as an editor regardless of lineage.
	 * 
	 * @default null 
	 */
	editor: false,
	
	/**
	 * The name of the attribute used for extracting the property name assigned to the editor.
	 * This defaults to "name" which works with descendants of dijit.form._FormWidgetMixin.
	 * If the value obtained from this attribute is non-empty and non-null it is assumed to be
	 * the property name to be assigned to the editor.  If the editor does not have an attribute
	 * that identifies its name and an explicit name is needed then set the "propName" attribute
	 * to a non-null, non-empty value to cause the attribute to be ignored.  If this value specifies
	 * the name of a function on the editor, then that function will be called to obtain the name.
	 *  
	 * @default "name"
	 */
	propertyNameAttr: "name",

	/**
	 * The explicit property name to be assigned to all editors that leverage this adaptor.
	 * This defaults to empty-string which means it will be ignored and therefore the "propertyNameAttr"
	 * will be used to obtain the property name from the editor widget.
	 * 
	 * @default ""
	 */
	propertyName: "",
	
	/**
	 * The name of the editor function which fires when 
	 */
	changeEvent: "onChange",
	
	/**
	 * The name of the attribute to set to true or false to indicate if the editor
	 * should be marked as "read only".  If this is set to a function then that
	 * function will be called with a parameter of true or false for read-only or
	 * not read-only, respectively.  When checking for read-only state the attribute
	 * is retrieved via the "get" function unless the attribute name represents a 
	 * function for the editor, in which case it is called with no parameters.
	 * 
	 * @default "readOnly"
	 */
	readOnlyAttr: "readOnly",
	
	/**
	 * The name of the attribute to set to true or false to indicate if the editor
	 * should be marked as "disabled".  If this is set to a function then that
	 * function will be called with a parameter of true or false for disabled or
	 * enabled, respectively.  When checking for disabled state the attribute
	 * is retrieved via the "get" function unless the attribute name represents a 
	 * function for the editor, in which case it is called with no parameters.
	 * 
	 * @default "disabled"
	 */
	disabledAttr: "disabled",

	/**
	 * The name of the attribute used to determine if the editor is checkable or the name
	 * of the function for getting & setting the checked state of the editor.  This is used
	 * for widgets that represent boolean values and represent this by being checked or
	 * unchecked.
	 * 
	 * @default "checked"
	 */
	checkedAttr: "checked",
	
	/**
	 * The name of the attribute on the editor widget to set with the value and retrieve 
	 * when editing or saving values.  NOTE: source property names are translated to target
	 * property names when editing initiates and target names back to source names when 
	 * editing concludes.
	 * 
	 * @default "value"
	 */
	valueAttr: "value",
	
	/**
	 * The name of the reset function to search for in the editor.  If it has the function 
	 * then a reset can be performed.
	 * 
	 *  @default "reset"
	 */
	resetFunc: "reset",
	
	/**
	 * The name of the resize function to search for in the editor.  If it has the function 
	 * then a resize can be performed.
	 * 
	 *  @default ""
	 */
	resizeFunc: "",
	
	/**
	 * The name of the validation function to search for in the editor.  If it has the function
	 * then validation can be performed.
	 * 
	 * @default "validate"
	 */
	validateFunc: "validate",
	
	/**
	 * The name of the attribute or function to use to check if the editor's value is valid.
	 * If it is an attribute then the value is retrieved and assumed to be true or false.  
	 * If it is a function, then the function is called and the value is returned.
	 *  
	 * @default "isValid"
	 */
	validCheck: "isValid",
	
	/**
	 * Constructor that accepts the specified arguments and initializes the adapter.
	 * 
	 * @param args The parameters for initialization.
	 */
	constructor: function(args) {
		if (args) dLang.mixin(this, args);
		if ((!args) || (!("editor" in args))) this.editor = null;		
	},
	
	/**
	 * Internal method for checking if the specified widget is a form widget.
	 * 
	 * @param widget The widget to check if it is a form widget.
	 * 
	 * @return true if the widget is a form widget, otherwise false.
	 */
	_isFormWidget: function(widget) {
		// first check "isInstanceOf" for derivation from FormWidgetMixin
		if (widget.isInstanceOf && dLang.isFunction(widget.isInstanceOf)
				&& widget.isInstanceOf(dFormWidgetMixin)) return true;
		
		// use the built-in instanceof function otherwise
		if (widget instanceof dFormWidgetMixin) return true;
		
		// if not derived then return false
		return false;
	},
	
	/**
	 * Checks if the specified widget should be used as an editor.
	 * 
	 * @param widget The widget to check to see if it is an editor.
	 * 
	 * @return true if the widget should be considered an editor, otherwise false.
	 */
	isEditor: function(widget) {	
		// if explicitly excluded then return false
		if ((this.editor === null)||(this.editor === undefined)) return this._isFormWidget(widget);
		
		// return the "editor" property
		return this.editor;
	},
	
	/**
	 * Returns the name to associate with the editor.  This maps to the property name to use to map
	 * to the value of the editor by default (barring any additional properties that may be required
	 * via the "properties" attr).
	 * 
	 * @param editor The editor widget for which the editor name is being requested.
	 * 
	 * @return The editor name to associate with the editor.
	 */
	getPropertyName: function(editor) {
		if (! this.isEditor(editor)) return null;
		if (iString.nullTrim(this.propertyName)) return this.propertyName;
		if (! iString.nullTrim(this.propertyNameAttr)) return null;
		if ((this.propertyNameAttr in editor) && (dLang.isFunction(editor[this.propertyNameAttr]))) {
			return editor[this.propertyNameAttr].call(editor);
		}
		return editor.get(this.propertyNameAttr);
	},
	
	/**
	 * Checks if validation should be performed for the specified editor widget.
	 * 
	 * @param editor The editor widget to check for validation support.
	 * 
	 * @return true if the specified widget supports validation, otherwise false.
	 */
	isEditorValidating: function(editor) {
		return (this.validateFunc && (this.validateFunc in editor)
				&& (dLang.isFunction(editor[this.validateFunc])));
	},
	
	/**
	 * Validates the value for the specified editor widget if validation
	 * is supported, otherwise does nothing.
	 * 
	 * @param editor The editor widget whose value needs to be validated.
	 * 
	 */
	validateEditor: function(editor) {
		// if not validating then do nothing
		if (! this.isEditorValidating(editor)) return;
		
		// otherwise, call the validation function
		editor[this.validateFunc].call(editor);
	},
	
	/**
	 * Checks if the value for the specified widget is currently in a valid state.
	 * 
	 * @param editor The editor widget to check for a valid value.
	 */
	isEditorValid: function(editor) {
		// if no validation check is specified then assume the value is fine
		if (! iString.nullTrim(this.validCheck)) return true;
		
		// check if we need to call a function
		if ((this.validCheck in editor) && dLang.isFunction(editor[this.validCheck])) {
			return editor[this.validCheck].call(editor);
		}
		
		// get the attribute value
		var valid = editor.get(this.validCheck);
		
		// if we get an undefined value from a non-validating widget then return true
		if ((valid === undefined) && (! this.isEditorValidating(editor))) return true;
		
		// return the result
		return valid;
	},

	/**
	 * Checks if reset can be performed for the specified editor widget.
	 * 
	 * @param editor The editor widget to check for reset support.
	 * 
	 * @return true if the specified widget supports reset, otherwise false.
	 */
	isEditorResetable: function(editor) {
		return (this.resetFunc && (this.resetFunc in editor)
				&& (dLang.isFunction(editor[this.resetFunc])));
	},
	
	/**
	 * Resets the specified editor widget if reset is supported, 
	 * otherwise does nothing.
	 * 
	 * @param editor The editor widget to be reset.
	 * 
	 */
	resetEditor: function(editor) {
		// if not validating then do nothing
		if (! this.isEditorResetable(editor)) return;
		
		// otherwise, call the validation function
		editor[this.resetFunc].call(editor);
	},
	
	/**
	 * Checks if resize can be performed for the specified editor widget.
	 * 
	 * @param editor The editor widget to check for resize support.
	 * 
	 * @return true if the specified widget supports resize, otherwise false.
	 */
	isEditorResizable: function(editor){
		return (this.resizeFunc && (this.resizeFunc in editor)
			&& (dLang.isFunction(editor[this.resizeFunc])));
	},
	/**
	 * Resize the specified editor widget if resize is supported, 
	 * otherwise does nothing.
	 * 
	 * @param editor The editor widget to be resize.
	 * 
	 */
	resizeEditor: function(editor){
		// if not validating then do nothing
		if (! this.isEditorResizable(editor)) return;
		// otherwise, call the validation function
		editor[this.resizeFunc].call(editor);
	},
	
	
	/**
	 * Sets the value for the editor to the specified value using the valueAttr.
	 * 
	 * @param editor The editor to have its value set.
	 * 
	 * @param value The value to set for the editor.
	 */
	setEditorValue: function(editor, value) {
		if (! iString.nullTrim(this.valueAttr)) return;
		if (this.valueAttr in editor && dLang.isFunction(editor[this.valueAttr])) {
			editor[this.valueAttr].call(editor, value);
		} else {
			editor.set(this.valueAttr, value);
		}
	},
	

	/**
	 * Gets the current value from the editor using the valueAttr.
	 * 
	 * @param editor The editor from which to obtain the value.
	 */
	getEditorValue: function(editor) {
		if (! iString.nullTrim(this.valueAttr)) return undefined;
		if (this.valueAttr in editor && dLang.isFunction(editor[this.valueAttr])) {
			return editor[this.valueAttr].call(editor);
		}
		return editor.get(this.valueAttr);
	},
	
	/**
	 * Checks if the editor is "checkable".
	 * 
	 * @param editor The editor widget to check.
	 * 
	 * @return true to indicate that the checked attribute is set and found in the editor, otherwise false.
	 */
	isEditorCheckable: function(editor) {
		if (! iString.nullTrim(this.checkedAttr)) return false;
		
		return (this.checkedAttr in editor);
	},
	
	/**
	 * Checks if the editor is in a "checked" state.  If the editor does not support "checked" state
	 * then this method returns null or undefined.
	 * 
	 * @param editor The editor widget to check.
	 * 
	 * @return true, false or null/undefined depending on whether the editor is in checked, unchecked,
	 *         or unknown state.
	 */
	isEditorChecked: function(editor) {
		if (! iString.nullTrim(this.checkedAttr)) return undefined;
		
		if (this.checkedAttr in editor && dLang.isFunction(editor[this.checkedAttr])) {
			return editor[this.checkedAttr].call(editor);
		}
		
		return editor.get(this.checkedAttr);
	},
	/**
	 * Sets the "checked" state of the editor if such a state is supported by the editor, otherwise does nothing.
	 * 
	 * @param editor The editor for which the "checked" state will be set.
	 * 
	 * @param checked true or false to indicate whether or not the editor should marked as checked.
	 */
	setEditorChecked: function(editor, checked) {
		if (! iString.nullTrim(this.checkedAttr)) return;
		
		if (this.checkedAttr in editor && dLang.isFunction(editor[this.checkedAttr])) {
			return editor[this.checkedAttr].call(editor, checked);
		}
		
		return editor.set(this.checkedAttr, checked);		
		
	},
	
	/**
	 * Checks if the specified editor has a function by the same name as the
	 * "changeEvent" attribute of this instance and if so, returns the name
	 * of the function, otherwise returns null.  If the "changeEvent" attribute
	 * is empty or null, then this method returns null.
	 * 
	 * @param editor The widget editor to check for a change event.
	 * 
	 * @return The name of the function that is called upon changes to the editor.
	 */
	getEditorChangeEvent: function(editor) {
		var changeEvent = iString.nullTrim(editor.changeEvent) || iString.nullTrim(this.changeEvent);
		if (!changeEvent) return null;
		if (changeEvent in editor && dLang.isFunction(editor[changeEvent])) return changeEvent;
		return null;
	},
	
	/**
	 * Checks if the editor is in a read-only state.  If the editor does not support read-only state
	 * then this method returns null or undefined.
	 * 
	 * @param editor The editor widget to check.
	 * 
	 * @return true, false or null/undefined depending on whether the editor is in read-only, writable,
	 *         or unknown state.
	 */
	isEditorReadOnly: function(editor) {
		if (! iString.nullTrim(this.readOnlyAttr)) return undefined;
		
		if (this.readOnlyAttr in editor && dLang.isFunction(editor[this.readOnlyAttr])) {
			return editor[this.readOnlyAttr].call(editor);
		}
		
		return editor.get(this.readOnlyAttr);
	},
	
	/**
	 * Sets the "read-only" state of the editor if such a state is supported by the editor, otherwise does nothing.
	 * 
	 * @param editor The editor for which the read only state will be set.
	 * 
	 * @param readOnly true or false to indicate whether or not the editor should marked as read-only.
	 */
	setEditorReadOnly: function(editor, readOnly) {
		if (! iString.nullTrim(this.readOnlyAttr)) return;
		
		if (this.readOnlyAttr in editor && dLang.isFunction(editor[this.readOnlyAttr])) {
			return editor[this.readOnlyAttr].call(editor, readOnly);
		}
		
		return editor.set(this.readOnlyAttr, readOnly);		
		
	},
	
	/**
	 * Checks if the editor is in a disabled state.  If the editor does not support disabled state
	 * then this method returns null or undefined.
	 * 
	 * @param editor The editor widget to check.
	 * 
	 * @return true, false or null/undefined depending on whether the editor is in a disabled, enabled
	 *         or unknown state.
	 */
	isEditorDisabled: function(editor) {
		if (! iString.nullTrim(this.disabledAttr)) return undefined;
		
		if (this.disabledAttr in editor && dLang.isFunction(editor[this.disabledAttr])) {
			return editor[this.disabledAttr].call(editor);
		}
		
		return editor.get(this.disabledAttr);
	},
	
	/**
	 * Sets the "disabled" state of the editor if such a state is supported by the editor, otherwise does nothing.
	 * 
	 * @param editor The editor for which the disabled state will be set.
	 * 
	 * @param disabled true or false to indicate whether or not the editor should marked as disabled.
	 */
	setEditorDisabled: function(editor, disabled) {
		if (! iString.nullTrim(this.disabledAttr)) return;
		
		if (this.disabledAttr in editor && dLang.isFunction(editor[this.disabledAttr])) {
			return editor[this.disabledAttr].call(editor, disabled);
		}
		
		return editor.set(this.disabledAttr, disabled);
	}
	
});
	/**
	 * The PropertyEditAdaptor used for the "propertyEditAdaptor" attribute of all widgets 
	 * by default.  The default adaptor will work such that all descendants of 
	 * dijit.form._FormWidgetMixin will be considered editors by default with the default 
	 * settings for PropertyEditAdaptor.
	 * 
     * @field
     * @name idx.grid.PropertyEditAdaptor.DEFAULT
     * @public
     * @static
	 */
	iPropertyEditAdaptor.DEFAULT = new iPropertyEditAdaptor();

	/**
	 * The PropertyEditAdaptor that can be used for the "propertyEditAdaptor" attribute of widgets 
	 * that have the same interface as dijit.form._FormWidgetMixin descendants, but are NOT
	 * descendants of dijit.form._FormWidgetMixin.  This is useful if your widget has the same 
	 * properties as a form widget for getting name, value, checked, readOnly, and disabled 
	 * attributes but is not a form widget.
	 * 
     * @field
     * @name idx.grid.PropertyEditAdaptor.STANDARD
     * @public
     * @static
	 */
	iPropertyEditAdaptor.STANDARD = new iPropertyEditAdaptor({editor: true});
	
	/**
	 * The PropertyEditAdaptor used for the "propertyEditAdaptor" attribute of widgets that have 
	 * the dijit.form._FormWidgetMixin interface and may have the "checked" attribute but should 
	 * be leveraged as if they do not have the "checked" attribute (thus causing their values to be 
	 * treated literally rather than as true/false values depending on the "checked" state of the 
	 * editor).  This instance is otherwise identical to the "STANDARD" instance.
	 * 
     * @field
     * @name idx.grid.PropertyEditAdaptor.UNCHECKABLE
     * @public
     * @static
	 */
	iPropertyEditAdaptor.UNCHECKABLE = new iPropertyEditAdaptor({editor: true, checkedAttr: null});

	/**
	 * The PropertyEditAdaptor used for the "propertyEditAdaptor" attribute of widgets that should
	 * NOT be considered as editors. This is useful if your dijit.form._FormWidgetMixin descendant 
	 * should NOT be used as an editor by idx.grid.PropertyFormatter.  Alternatively, you can set the
	 * "propertyEditAdaptor" attribute on your widget to null.
	 * 
     * @field
     * @name idx.grid.PropertyEditAdaptor.EXCLUDED
     * @public
     * @static
	 */
	iPropertyEditAdaptor.EXCLUDED = new iPropertyEditAdaptor({editor: false});
	
	dLang.extend(dWidgetBase,
			/**@lends dijit._WidgetBase#*/
	{
		/**
		 * The idx.grid.PropertyEditAdaptor for this widget.
		 * 
		 * @default idx.grid.PropertyEditAdaptor.DEFAULT
		 */
		propertyEditAdaptor: iPropertyEditAdaptor.DEFAULT
	});
	
	return iPropertyEditAdaptor;
});
