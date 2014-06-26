/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dijit/_base/wai",
	"dojo/has",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/currency",
	"dijit/form/CurrencyTextBox",
	"dijit/form/NumberTextBox",
	"idx/widget/HoverHelpTooltip",
	"./_CssStateMixin",
	"./_CompositeMixin",
	"idx/has!#mobile?idx/_TemplatePlugableMixin:#platform-plugable?idx/_TemplatePlugableMixin", 
	"idx/has!#mobile?idx/PlatformPluginRegistry:#platform-plugable?idx/PlatformPluginRegistry",
	
	"idx/has!#idx_form_CurrencyTextBox-desktop?dojo/text!./templates/CurrencyTextBox.html"  // desktop widget, load the template
		+ ":#idx_form_CurrencyCurrencyTextBox-mobile?"										// mobile widget, don't load desktop template
		+ ":#desktop?dojo/text!./templates/CurrencyTextBox.html"						// global desktop platform, load template
		+ ":#mobile?"														// global mobile platform, don't load
		+ ":dojo/text!./templates/CurrencyTextBox.html", 							// no dojo/has features, load the template
		
	"idx/has!#idx_form_CurrencyTextBox-mobile?./plugins/mobile/CurrencyTextBoxPlugin"		// mobile widget, load the plugin
		+ ":#idx_form_CurrencyTextBox-desktop?"										// desktop widget, don't load plugin
		+ ":#mobile?./plugins/mobile/CurrencyTextBoxPlugin"							// global mobile platform, load plugin
		+ ":"																// no features, don't load plugin
], function(declare, lang, wai, has, domStyle, domClass, currency, 
	DijitCurrencyTextBox, DijitNumberTextBox, HoverHelpTooltip, 
	_CssStateMixin, _CompositeMixin, _TemplatePlugableMixin, 
	PlatformPluginRegistry, desktopTemplate, MobilePlugin){
	var iForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2
	
	/**
	 * @name idx.form.CurrencyTextBox
	 * @class One UI version widget, it is a composite widget which enhanced dijit.form.CurrencyTextBox with following features:
	 * <ul>
	 * <li>Built-in label</li>
	 * <li>Built-in label positioning</li>
	 * <li>Built-in hint</li>
	 * <li>Built-in hint positioning</li>
	 * <li>Built-in required attribute</li>
	 * <li>One UI theme support</li>
	 * </ul>.
	 * @augments dijit.form.CurrencyTextBox
	 * @augments idx.form._CssStateMixin
	 * @augments idx.form._CompositeMixin
	 */
	 
	 
	var CurrencyTextBox = declare([DijitCurrencyTextBox, _CompositeMixin, _CssStateMixin], {
		/**@lends idx.form.CurrencyTextBox.prototype*/
		
		instantValidate: false,
		
		templateString: desktopTemplate,
		
		baseClass: "idxCurrencyTextBoxWrap",
		
		oneuiBaseClass: "dijitTextBox dijitCurrencyTextBox",
		
		currency: "",
		
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
				this._computeRegexp(this.constraints);
			}else{
				this.connect(this, "_onFocus", function(){
					if (this.message && this._hasBeenBlurred && (!this._refocusing)) {
						this.displayMessage(this.message);
					}
				})
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
		_isEmpty: function(){
			var v = this.get("value");
			return (v !== undefined) && isNaN(v);
		},
		/**
		 * Show error message using a hoverHelpTooltip, hide the tooltip if message is empty.
		 * @param {string} message
		 * Error message
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
		},
		
		_setCurrencyAttr: function(/*String*/ currency){
			this.currencyLabel.innerHTML = currency;
			domClass.toggle(this.currencyLabel, "dijitHidden", /^\s*$/.test(currency));
			this._set("currency", currency);
			wai.setWaiState(this.focusNode, "describedby", this.id + "_unit");
		},
		
		_setConstraintsAttr: function(/*Object*/ constraints){
			DijitNumberTextBox.prototype._setConstraintsAttr.apply(this, [lang.mixin(constraints, {exponent: false})]);
		}
	});
	
	if(has("mobile") || has("platform-plugable")){
	
		var pluginRegistry = PlatformPluginRegistry.register("idx/form/CurrencyTextBox", {	
			desktop: "inherited",	// no plugin for desktop, use inherited methods  
			mobile: MobilePlugin	// use the mobile plugin if loaded
		});
		
		CurrencyTextBox = declare([CurrencyTextBox,_TemplatePlugableMixin], {
			/**
		     * Set the template path for the desktop template in case the template was not 
		     * loaded initially, but is later needed due to an instance being constructed 
		     * with "desktop" platform.
	     	 */
			
			
			templatePath: require.toUrl("idx/form/templates/CurrencyTextBox.html"),  
		
			// set the plugin registry
			pluginRegistry: pluginRegistry,
			 			
			displayMessage: function(message){
				return this.doWithPlatformPlugin(arguments, "displayMessage", "displayMessage", message);
			},
			_setHelpAttr: function(helpText){
				return this.doWithPlatformPlugin(arguments, "_setHelpAttr", "setHelpAttr", helpText);
			},
			
			_setCurrencyAttr: function(currency){
				return this.doWithPlatformPlugin(arguments, "_setCurrencyAttr", "setCurrencyAttr", currency);
			},
			_setConstraintsAttr: function(constraints){
				return this.doWithPlatformPlugin(arguments, "_setConstraintsAttr", "setConstraintsAttr", constraints);
			}
		});
	}
	return iForm.CurrencyTextBox = declare("idx.form.CurrencyTextBox", CurrencyTextBox);
})
