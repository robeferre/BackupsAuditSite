/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/has",
	"dojo/i18n", // i18n.getLocalization
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/dom-construct",
	"dojo/query", 
	"dojo/on",
	"dijit/_base/wai", 
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/form/_FormValueWidget",
	"../widget/HoverHelpTooltip",
	"../util",
	"../string",
	"./_CompositeMixin",
	"./DateTextBox",
	"./TimeTextBox",
	"dojo/i18n!./nls/DateTimeTextBox",
	"idx/has!#mobile?idx/_TemplatePlugableMixin:#platform-plugable?idx/_TemplatePlugableMixin", 
	"idx/has!#mobile?idx/PlatformPluginRegistry:#platform-plugable?idx/PlatformPluginRegistry",
	
	"idx/has!#idx_form_DateTimeTextBox-desktop?dojo/text!./templates/DateTimeTextBox.html"  // desktop widget, load the template
		+ ":#idx_form_DateTimeTextBox-mobile?"										// mobile widget, don't load desktop template
		+ ":#desktop?dojo/text!./templates/DateTimeTextBox.html"						// global desktop platform, load template
		+ ":#mobile?"														// global mobile platform, don't load
		+ ":dojo/text!./templates/DateTimeTextBox.html", 							// no dojo/has features, load the template
		
	"idx/has!#idx_form_DateTimeTextBox-mobile?./plugins/mobile/DateTimeTextBoxPlugin"		// mobile widget, load the plugin
		+ ":#idx_form_DateTimeTextBox-desktop?"										// desktop widget, don't load plugin
		+ ":#mobile?./plugins/mobile/DateTimeTextBoxPlugin"							// global mobile platform, load plugin
		+ ":"																// no features, don't load plugin
		
], function(declare, lang, has, i18n, domAttr, domClass, domGeometry, domStyle, domConstruct, query, on,
		wai, _TemplatedMixin, _WidgetsInTemplateMixin, _FormValueWidget, 
		HoverHelpTooltip, iUtil, iString, _CompositeMixin, DateTextBox, TimeTextBox, DateTimeTextBox_nls,
		_TemplatePlugableMixin, PlatformPluginRegistry, desktopTemplate, MobilePlugin){
	var oneuiForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2
	var iForm = lang.getObject("idx.form", true);

	// module:
	//		idx/form/DateTimeTextBox
	// summary:
	//		A Combined date and time text boxes.

	/**
	 * @name idx.form.DateTimeTextBox
	 * @class Combined date and time text boxes.
	 * @augments dijit.form._FormValueWidget
	 * @augments dijit._Templated
	 */
	var DateTimeTextBox = declare("idx.form.DateTimeTextBox_base", [_FormValueWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {
	/**@lends idx.form.DateTextBox*/ 
		/**
		* base class of this oneui widget
		*/
		baseClass: "idxDateTimeTextBoxWrap",
		templateString: desktopTemplate,
		/**
		 * Specifies if the value is required.
		 */
		required: false,
		readOnly: false,
		selectOnClick: false,
		
		value: null,
		
		instantValidate: false,
		showPickerIcon: false,
		dateHint: "",
		timeHint: "",
		/**
		 * Layout of the label and the field, "horizontal" or "vertical", implemented according to 
		 * IBM One UI(tm) <b><a href="http://dleadp.torolab.ibm.com/uxd/uxd_oneui.jsp?site=ibmoneui&top=x1&left=y16&vsub=*&hsub=*&openpanes=0000011100">Field & Label Alignment</a></b>
		 * @type String
		 * @default "horizontal"
		 */
		labelAlignment: "horizontal",
		
		postMixInProperties: function(){
			this._nlsResources = i18n.getLocalization("idx.form", "DateTimeTextBox", this.lang);
			this.inherited(arguments);
		},
	
		/**
		 * Sets up event handlers.
		 */
		postCreate: function() {
			this.inherited(arguments);
			
			this.own(on(this.dateTextBox, "change", lang.hitch(this, "onChange")));
			this.own(on(this.timeTextBox, "change", lang.hitch(this, "onChange")));
			
			this.connect(this.dateTextBox, "_onInput", "_onInput");
			this.connect(this.timeTextBox, "_onInput", "_onInput");
			this.connect(this.dateTextBox, "_setValueAttr", "_updateValueAttr");
			this.connect(this.timeTextBox, "_setValueAttr", "_updateValueAttr");
			
			//a11y
			domAttr.set(this.dateTextBox.focusNode, "title", this._nlsResources.dateTitle);
			domAttr.set(this.timeTextBox.focusNode, "title", this._nlsResources.timeTitle);
			
			this._resize();
		},
		
		onChange: function(e){
			//TODO
		},
		
		_onInput: function(e){
			//TODO
		},
		/**
		 * Validates both date and time values.
		 * @param {Boolean} f
		 * @returns {Boolean}
		 */
		validate: function(f) {
			//A containing form will first set "_hasBeenBlurred" on this
			//widget before validating; we must pass this on to our children
			if(typeof(this._hasBeenBlurred)!== "undefined"){
				this.dateTextBox._hasBeenBlurred = (this._hasBeenBlurred || this.dateTextBox._hasBeenBlurred);
				this.timeTextBox._hasBeenBlurred = (this._hasBeenBlurred || this.timeTextBox._hasBeenBlurred);
			}
			
			//Call separately to ensure both get called - no short-circuiting
			//This is important to trigger the validation icons if needed
			var dateValid = this.dateTextBox.validate(f);
			var timeValid = this.timeTextBox.validate(f);
			
			//Return true if, and only if, both are valid
			return (dateValid && timeValid);
		},
	
		/**
		 * Returns if both date and time are valid.
		 * @param {Boolean} f
		 * @returns {Boolean}
		 */
		isValid: function(f) {
			return this.dateTextBox.isValid(f) && this.timeTextBox.isValid(f);
		},
	
		/**
		 * Retrieves the current date value.
		 * @returns {Date}
		 * @private
		 */
		_getDateAttr: function() {
			return this.dateTextBox.get("value");
		},
	
		/**
		 * Retrieves the current time value.
		 * @returns {Date}
		 * @private
		 */
		_getTimeAttr: function() {
			return this.timeTextBox.get("value");
		},
	
		/**
		 * Sets a new date value.
		 * @param {Date} value
		 * @private
		 */
		_setDateAttr: function(value) {
			this.dateTextBox.set("value", value);
		},
	
		/**
		 * Sets a new time value.
		 * @param {Date} value
		 * @private
		 */
		_setTimeAttr: function(value) {
			this.timeTextBox.set("value", value);
		},
	
		/**
		 * Retrieves a combined date and time value.
		 * @returns {Date}
		 * @private
		 */
		_getValueAttr: function() {
			return this._getCombinedValue();
		},
	
		/**
		 * Sets a new combined date and time value.
		 * @param {Date} date
		 * @private
		 */
		_setValueAttr: function(date) {
			this.value = date;
			this.dateTextBox.set("value", date);
			this.timeTextBox.set("value", date);
		},
	
		/**
		 * Specifies "disabled" attributes for date and time text boxes.
		 * @param {Boolean} disabled
		 * @private
		 */
		_setDisabledAttr: function(disabled) {
			this.inherited(arguments);	// dijit.form._FormWidget
			this.dateTextBox.set("disabled", disabled);
			this.timeTextBox.set("disabled", disabled);
		},
	
		/**
		 * Specifies "required" attributes for date and time text boxes.
		 * @param {Boolean} required
		 * @private
		 */
		_setRequiredAttr: function(required) {
			this.dateTextBox.set("required", required);
			this.timeTextBox.set("required", required);
			
			wai.setWaiState(this.focusNode, "required", required + "");
			this.set("state", required?"Required":"");
			this._set("required", required);
		},
		
		/**
		 * Specifies "readOnly" attributes for date and time text boxes.
		 * @param {Boolean} readOnly
		 * @private
		 */
		_setReadOnlyAttr: function(readOnly) {
			this.readOnly = readOnly;
			this.dateTextBox.set("readOnly", readOnly);
			this.timeTextBox.set("readOnly", readOnly);
		},
	
		/**
		 * Updates the current value with a combined data and time value.
		 * @param {Date} value
		 * @private
		 */
		_updateValueAttr: function(value) {
			this.value = this._getCombinedValue();
		},
	
		/**
		 * Generates a combined data and time value.
		 * @returns {Date}
		 * @private
		 */
		_getCombinedValue: function() {
			var d = this.dateTextBox.get("value");
			var t = this.timeTextBox.get("value");
			if (!d && !t) {
				// both TextBox have no value, return null
				return null;
			}
			d = d || new Date(0);
			t = t || new Date(0);
			// var dt = new Date(d.getTime() + t.getTime());
			var dt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds());
			return dt;
			// return this._convertDateToUTC(dt);
		},
		
		_convertDateToUTC: function(date) { 
		    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); 
		},
	
		/**
		 * Resets date and time text boxes.
		 */
		reset: function(){
			this.inherited(arguments);
			this.dateTextBox.reset();
			this.timeTextBox.reset();
		},
		
		_setHintPositionAttr: function(/*String*/ position){
			//TODO
			this.inherited(arguments);
		},
		
		_setHintAttr: function(/*String*/ hint){
			//TODO
			this.inherited(arguments);
		},
		
		_setLabelAlignmentAttr: function(/*String*/ alignment){
			var h = alignment == "horizontal";
			query(".idxLabel", this.domNode).toggleClass("dijitInline", h);
			query(".idxCompContainer", this.domNode).toggleClass("dijitInline", h);
			this._set("labelAlignment", alignment);
		},
		
		_setLabelAttr: function(/*String*/ label){
			this.compLabelNode.innerHTML = label;
			domClass.toggle(this.labelWrap, "dijitHidden", /^\s*$/.test(label));
			this._set("label", label);
		},
		
		_setDateLabelAttr: function(/*String*/ label){
			this.dateTextBox.set("label", label);
		},
		
		_setTimeLabelAttr: function(/*String*/ label){
			this.timeTextBox.set("label", label);
		},
		
		_getDateLabelAttr: function(/*String*/ label){
			return this.dateTextBox.get("label");
		},
		
		_getTimeLabelAttr: function(/*String*/ label){
			return this.timeTextBox.get("label");
		},
		
		_setDateConstraintsAttr: function(constraints) {
            this.dateTextBox.set("constraints", constraints);
        },
        
        _setTimeConstraintsAttr: function(constraints) {
            this.timeTextBox.set("constraints", constraints);
        },
		
		_setSelectOnClickAttr: function(/*String*/ flag){
			this._set("selectOnClick", flag);
			this.dateTextBox.set("selectOnClick", flag);
			this.timeTextBox.set("selectOnClick", flag);
		},
		
		_onMouseDown: function(e) {
			// Override FormWidget#_onMouseDown
		},
		_resize: function(){
			var labelWidth = this.labelWidth,
				fieldWidth = this.fieldWidth,
				styleWidth = this._styleWidth;
			if(!(labelWidth || fieldWidth || styleWidth)){return;}
			
			var	realWidth = domGeometry.getContentBox(this.domNode).w;
			
			if(this.label && this.labelAlignment == "horizontal"){
				if(labelWidth){
					if(iUtil.isPercentage(labelWidth)){
						labelWidth = Math.floor(realWidth * parseInt(labelWidth)/100) - 10;
					}
					domStyle.set(this.labelWrap, "width", iUtil.normalizedLength(labelWidth,this.domNode) + "px");
				}
				if(fieldWidth){
					if(iUtil.isPercentage(fieldWidth)){
						fieldWidth = Math.floor(realWidth * parseInt(fieldWidth)/100);
					}
					fieldWidth = iUtil.normalizedLength(fieldWidth,this.domNode);
					domStyle.set(this.dateTextBox.oneuiBaseNode, "width", Math.floor(fieldWidth/2 -31) + "px");
					domStyle.set(this.timeTextBox.oneuiBaseNode, "width", Math.floor(fieldWidth/2 -31) + "px");
				}
			}else{
				if(styleWidth){
					domStyle.set(this.dateTextBox.oneuiBaseNode, "width", Math.floor(realWidth/2 - 31) + "px");
					domStyle.set(this.timeTextBox.oneuiBaseNode, "width", Math.floor(realWidth/2 - 31) + "px");
				}else if(fieldWidth && !iUtil.isPercentage(fieldWidth)){
					fieldWidth = iUtil.normalizedLength(fieldWidth,this.domNode);
					domStyle.set(this.dateTextBox.oneuiBaseNode, "width", Math.floor(fieldWidth/2 -31) + "px");
					domStyle.set(this.timeTextBox.oneuiBaseNode, "width", Math.floor(fieldWidth/2 -31) + "px");
				}
			}
		},
		_setStyleAttr: function(style){
			// If there's no label share the widget width with field,
			// field would occupy whole widget width if "width" is specified in given style.
			this.inherited(arguments);
			this._styleWidth = iUtil.getValidCSSWidth(style);
			this._created && this._resize();
		},
		/**
		 * Set the width of label, the width is from the start of label to the start of the field.
		 * @public
		 * @param {string | number} width 
		 * Unit of "pt","em","px" will be normalized to "px", and "px" by default for numeral value.
		 */
		_setLabelWidthAttr: function(/*String | Integer*/width){
			if(!width || this.labelAlignment == "vertical"){ return; }
			this._set("labelWidth", width);
			this._created && this._resize();
		},
		
		/**
		 * Set the width of field with a hidden validation icon.
		 * @public
		 * @param {string | number} width 
		 * Unit of "pt","em","px" will be normalized to "px", and "px" by default for numeral value.
		 */
		_setFieldWidthAttr: null,
		
		_setHelpAttr: function(/*String*/ helpText){
			//_CompositeMixin.prototype._setHelpAttr.apply(this, arguments);
		},
		
		_setupHelpListener: function() {
			_CompositeMixin.prototype._setupHelpListener.apply(this, arguments);
		}
	});
	
	
	if(has("mobile") || has("platform-plugable")){
	
		var pluginRegistry = PlatformPluginRegistry.register("idx/form/DateTimeTextBox", {	
			desktop: "inherited",	// no plugin for desktop, use inherited methods  
			mobile: MobilePlugin	// use the mobile plugin if loaded
		});
		
		DateTimeTextBox = declare([DateTimeTextBox,_TemplatePlugableMixin], {
			/**
		     * Set the template path for the desktop template in case the template was not 
		     * loaded initially, but is later needed due to an instance being constructed 
		     * with "desktop" platform.
	     	 */
			
			templatePath: require.toUrl("idx/form/templates/DropDownBox.html"),  
		
			// set the plugin registry
			pluginRegistry: pluginRegistry
		});
	}
	return iForm.DateTimeTextBox = declare("idx.form.DateTimeTextBox", DateTimeTextBox);
});
