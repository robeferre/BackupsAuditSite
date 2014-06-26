/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/has",
	"dojo/on",
	"dojo/touch",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dojo/date/stamp",
	"dijit/_WidgetBase",
	"dijit/Calendar",
	"idx/widget/HoverHelpTooltip",
	"./_CssStateMixin",
	"./_DateTimeTextBox",
	"./_CompositeMixin",
	"idx/has!#mobile?idx/_TemplatePlugableMixin:#platform-plugable?idx/_TemplatePlugableMixin", 
	"idx/has!#mobile?idx/PlatformPluginRegistry:#platform-plugable?idx/PlatformPluginRegistry",
	
	"idx/has!#idx_form_DateTextBox-desktop?dojo/text!./templates/DropDownBox.html"  // desktop widget, load the template
		+ ":#idx_form_DateTextBox-mobile?"										// mobile widget, don't load desktop template
		+ ":#desktop?dojo/text!./templates/DropDownBox.html"						// global desktop platform, load template
		+ ":#mobile?"														// global mobile platform, don't load
		+ ":dojo/text!./templates/DropDownBox.html", 							// no dojo/has features, load the template
		
	"idx/has!#idx_form_DateTextBox-mobile?./plugins/mobile/DateTextBoxPlugin"		// mobile widget, load the plugin
		+ ":#idx_form_DateTextBox-desktop?"										// desktop widget, don't load plugin
		+ ":#mobile?./plugins/mobile/DateTextBoxPlugin"							// global mobile platform, load plugin
		+ ":"																// no features, don't load plugin
		
], function(declare, lang, winUtil, has, on, touch, domStyle, domClass, domConstruct, domAttr, stamp, _WidgetBase, Calendar, HoverHelpTooltip,
			_CssStateMixin, _DateTimeTextBox, _CompositeMixin, 
			_TemplatePlugableMixin, PlatformPluginRegistry, desktopTemplate, MobilePlugin){
	var oneuiForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2
	var iForm = lang.getObject("idx.form", true);
	
	// module:
	//		idx/form/DateTextBox
	// summary:
	//		A validating, serializable, range-bound date text box with a drop down calendar

	/**
	* @name idx.form.DateTextBox
	* @class A validating, serializable, range-bound date text box with a drop down calendar
	* @augments idx.form._DateTimeTextBox
	* @augments idx.form._CompositeMixin
	* @augments idx.form._CssStateMixin
	*/ 
	var DateTextBox = declare("idx.form.DateTextBox_base", [_DateTimeTextBox, _CompositeMixin, _CssStateMixin], {
	/**@lends idx.form.DateTextBox*/ 
		// summary:
		//		A validating, serializable, range-bound date text box with a drop down calendar
		//
		//		Example:
		// |	new dijit.form.DateTextBox({value: new Date(2009, 0, 20)})
		//
		//		Example:
		// |	<input dojotype='dijit.form.DateTextBox' value='2009-01-20'>
		templateString: desktopTemplate,
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		/**
		* base class of this oneui widget
		*/
		baseClass: "idxDateTextBoxWrap",
		/**
		* base class of dijit widget
		*/
		oneuiBaseClass: "dijitTextBox dijitComboBox dijitDateTextBox",
		_selector: "date",
		popupClass: "dijit.Calendar",
		// value: Date
		//		The value of this widget as a JavaScript Date object, with only year/month/day specified.
		//		If specified in markup, use the format specified in `dojo.date.stamp.fromISOString`.
		//		set("value", ...) accepts either a Date object or a string.
		value: new Date(""),// value.toString()="NaN"
		
		showPickerIcon: false,
		
		/** @ignore */
		postCreate: function(){
			this.inherited(arguments);
			if(this.instantValidate){
				this.connect(this, "_onFocus", function(){
					if (this._hasBeenBlurred && (!this._refocusing)) {
						this.validate(true);
					}
				});
				this.connect(this, "_onInput", function(){
					this.validate(true);
				});
			}else{
				this.connect(this, "_onFocus", function(){
					if (this.message && this._hasBeenBlurred && (!this._refocusing)) {
						this.displayMessage(this.message);
					}
				})
			}
			
			//domAttr.set(this.oneuiBaseNode, "title", this.iconTitle || this._nlsResources.idxDateIconTitle || "Click to open date picker");
			
			if(this.showPickerIcon){
				var iconNode = domConstruct.create("div", {
					title: this.iconTitle || this._nlsResources.idxDateIconTitle || "Click to open date picker",
					//tabIndex: 0,
					className: "dijitInline idxPickerIconLink"
				}, this.oneuiBaseNode);
				
				var iconImage = domConstruct.create("img", {
					alt: this.iconAlt || this._nlsResources.idxDateIconTitle || "Click to open date picker",
					className: "idxPickerIcon idxCalendarIcon",
					src: this._blankGif
				}, iconNode);
				
				domStyle.set(this.oneuiBaseNode, "position", "relative");
			}
			this._resize();
		},
		/**
		 * Provides a method to return focus to the widget without triggering
		 * revalidation.  This is typically called when the validation tooltip
		 * is closed.
		 */
		refocus: function() {
			this._refocusing = true;
			this.focus();
			this._refocusing = false;
		},
		
		/**
		* Overridable method to display validation errors/hints
		*/
		displayMessage: function(/*String*/ message, /*Boolean*/ force){
			if(message){
				if(!this.messageTooltip){
					this.messageTooltip = new HoverHelpTooltip({
						connectId: [this.iconNode],
						label: message,
						position: this.tooltipPosition,
						forceFocus: false
					});
				}else{
					this.messageTooltip.set("label", message);
				}
				if(this.focused || force){
					var node = domStyle.get(this.iconNode, "visibility") == "hidden" ? this.oneuiBaseNode : this.iconNode;
					this.messageTooltip.open(node);
				}
			}else{
				this.messageTooltip && this.messageTooltip.close();
			}
		}
		
	});
	
	if(has("mobile") || has("platform-plugable")){
	
		var pluginRegistry = PlatformPluginRegistry.register("idx/form/DateTextBox", {	
			desktop: "inherited",	// no plugin for desktop, use inherited methods  
			mobile: MobilePlugin	// use the mobile plugin if loaded
		});
		
		DateTextBox = declare([DateTextBox,_TemplatePlugableMixin], {
			/**
		     * Set the template path for the desktop template in case the template was not 
		     * loaded initially, but is later needed due to an instance being constructed 
		     * with "desktop" platform.
	     	 */
			
			
			templatePath: require.toUrl("idx/form/templates/DropDownBox.html"),  
		
			// set the plugin registry
			pluginRegistry: pluginRegistry,
			
			openDropDown: function(callback){
				return this.doWithPlatformPlugin(arguments, "openDropDown", "openDropDown", callback);
			},
			closeDropDown: function(){
				return this.doWithPlatformPlugin(arguments, "closeDropDown", "closeDropDown");
			},
			displayMessage: function(message){
				return this.doWithPlatformPlugin(arguments, "displayMessage", "displayMessage", message);
			},
			_setHelpAttr: function(helpText){
				return this.doWithPlatformPlugin(arguments, "_setHelpAttr", "setHelpAttr", helpText);
			}
		});
	}
	return iForm.DateTextBox = declare("idx.form.DateTextBox", DateTextBox);
});
