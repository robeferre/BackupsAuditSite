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
	"dojo/on",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dojo/keys",
	"dijit/_TimePicker",
	"idx/widget/HoverHelpTooltip",
	"./_CssStateMixin",
	"./_DateTimeTextBox",
	"./_CompositeMixin",
	"idx/has!#mobile?idx/_TemplatePlugableMixin:#platform-plugable?idx/_TemplatePlugableMixin", 
	"idx/has!#mobile?idx/PlatformPluginRegistry:#platform-plugable?idx/PlatformPluginRegistry",
	
	"idx/has!#idx_form_TimeTextBox-desktop?dojo/text!./templates/DropDownBox.html"  // desktop widget, load the template
		+ ":#idx_form_TimeTextBox-mobile?"										// mobile widget, don't load desktop template
		+ ":#desktop?dojo/text!./templates/DropDownBox.html"						// global desktop platform, load template
		+ ":#mobile?"														// global mobile platform, don't load
		+ ":dojo/text!./templates/DropDownBox.html", 							// no dojo/has features, load the template
		
	"idx/has!#idx_form_TimeTextBox-mobile?./plugins/mobile/TimeTextBoxPlugin"		// mobile widget, load the plugin
		+ ":#idx_form_TimeTextBox-desktop?"										// desktop widget, don't load plugin
		+ ":#mobile?./plugins/mobile/TimeTextBoxPlugin"							// global mobile platform, load plugin
		+ ":"																// no features, don't load plugin
		
], function(declare, lang, has, on, domStyle, domClass, domConstruct, domAttr, keys, _TimePicker, HoverHelpTooltip,
			_CssStateMixin, _DateTimeTextBox, _CompositeMixin, 
			_TemplatePlugableMixin, PlatformPluginRegistry, desktopTemplate, MobilePlugin){
	var oneuiForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2
	var iForm = lang.getObject("idx.form", true);

	/**
	* @name idx.form.TimeTextBox
	* @class A validating, serializable, range-bound time text box with a drop down time picker
	* @augments idx.form._DateTimeTextBox
	* @augments idx.form._CompositeMixin
	* @augments idx.form._CssStateMixin
	*/ 
	var TimeTextBox = declare("idx.form.TimeTextBox_base", [_DateTimeTextBox, _CompositeMixin, _CssStateMixin], {
	/**@lends idx.form.TimeTextBox*/ 
		// summary:
		//		A validating, serializable, range-bound time text box with a drop down time picker
		templateString: desktopTemplate,
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		baseClass: "idxTimeTextBoxWrap",
		oneuiBaseClass: "dijitTextBox dijitComboBox dijitTimeTextBox",
		_selector: "time",
		popupClass: "dijit._TimePicker",

		// value: Date
		//		The value of this widget as a JavaScript Date object.  Note that the date portion implies time zone and daylight savings rules.
		//
		//		Example:
		// |	new idx.form.TimeTextBox({value: dojo.date.stamp.fromISOString("T12:59:59", new Date())})
		//
		//		When passed to the parser in markup, must be specified according to locale-independent
		//		`dojo.date.stamp.fromISOString` format.
		//
		//		Example:
		// |	<input dojotype='idx.form.TimeTextBox' value='T12:34:00'>
		value: new Date(""),		// value.toString()="NaN"
		//FIXME: in markup, you have no control over daylight savings
		
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
				});
			}
			//domAttr.set(this.oneuiBaseNode, "title", this.iconTitle || this._nlsResources.idxTimeIconTitle || "Click to open time picker");
			
			if(this.showPickerIcon){
				var iconNode = domConstruct.create("div", {
					title: this.iconTitle || this._nlsResources.idxTimeIconTitle || "Click to open time picker",
					//tabIndex: 0,
					className: "dijitInline idxPickerIconLink"
				}, this.oneuiBaseNode);
				
				var iconImage = domConstruct.create("img", {
					alt: this.iconAlt || this._nlsResources.idxTimeIconTitle || "Click to open time picker",
					className: "idxPickerIcon idxTimeIcon",
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
		* key event processor
		*/
		_onKey: function(evt){
			if(this.disabled || this.readOnly){ return; }
			this.inherited(arguments);

			// If the user has backspaced or typed some numbers, then filter the result list
			// by what they typed.  Maybe there's a better way to detect this, like _handleOnChange()?
			switch(evt.keyCode){
				case keys.ENTER:
				case keys.TAB:
				case keys.ESCAPE:
				case keys.DOWN_ARROW:
				case keys.UP_ARROW:
					// these keys have special meaning
					break;
				default:
					// defer() because the keystroke hasn't yet appeared in the <input>,
					// so the get('displayedValue') call below won't give the result we want.
					this.defer(function(){
						// set this.filterString to the filter to apply to the drop down list;
						// it will be used in openDropDown()
						var val = this.get('displayedValue');
						this.filterString = (val && !this.parse(val, this.constraints)) ? val.toLowerCase() : "";

						// close the drop down and reopen it, in order to filter the items shown in the list
						// and also since the drop down may need to be repositioned if the number of list items has changed
						// and it's being displayed above the <input>
						if(this._opened){
							this.closeDropDown();
						}
						this.openDropDown();
					});
			}
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
	
		var pluginRegistry = PlatformPluginRegistry.register("idx/form/TimeTextBox", {	
			desktop: "inherited",	// no plugin for desktop, use inherited methods  
			mobile: MobilePlugin	// use the mobile plugin if loaded
		});
		
		TimeTextBox = declare([TimeTextBox,_TemplatePlugableMixin], {
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
			// _onBlur: function(e){
				// return this.doWithPlatformPlugin(arguments, "_onBlur", "onBlur", e);
			// }
		});
	}
	return iForm.TimeTextBox = declare("idx.form.TimeTextBox", TimeTextBox);
});