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
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dijit/_base/wai",
	"dijit/form/VerticalSlider",
	"idx/typematic",
	"./_CssStateMixin",
	"./_ValidationMixin",
	"./_CompositeMixin",
	"idx/has!#mobile?idx/_TemplatePlugableMixin:#platform-plugable?idx/_TemplatePlugableMixin", 
	"idx/has!#mobile?idx/PlatformPluginRegistry:#platform-plugable?idx/PlatformPluginRegistry",
	
	"idx/has!#idx_form_VerticalSlider-desktop?dojo/text!./templates/VerticalSlider.html"  // desktop widget, load the template
		+ ":#idx_form_VerticalSlider-mobile?"										// mobile widget, don't load desktop template
		+ ":#desktop?dojo/text!./templates/VerticalSlider.html"						// global desktop platform, load template
		+ ":#mobile?"														// global mobile platform, don't load
		+ ":dojo/text!./templates/VerticalSlider.html", 							// no dojo/has features, load the template
		
	"idx/has!#idx_form_VerticalSlider-mobile?./plugins/mobile/VerticalSliderPlugin"		// mobile widget, load the plugin
		+ ":#idx_form_VerticalSlider-desktop?"										// desktop widget, don't load plugin
		+ ":#mobile?./plugins/mobile/VerticalSliderPlugin"							// global mobile platform, load plugin
		+ ":"																// no features, don't load plugin
		
], function(declare, lang, has, on, domStyle, domAttr, domClass, domConstruct, wai, 
			VerticalSlider, typematic, _CssStateMixin, _ValidationMixin, _CompositeMixin,
			_TemplatePlugableMixin, PlatformPluginRegistry, desktopTemplate, MobilePlugin){
	var iForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2

	/**
	* @name idx.form.VerticalSlider
	* @class A form widget that allows one to select a value with a vertically draggable handle
	* @augments dijit.form.VerticalSlider
	* @augments idx.form._ValidationMixin
	* @augments idx.form._CompositeMixin
	* @augments idx.form._CssStateMixin
	*/ 
	var VerticalSlider = declare("idx.form.VerticalSlider_base", [VerticalSlider, _ValidationMixin, _CompositeMixin, _CssStateMixin], {
	/**@lends idx.form.VerticalSlider*/ 
		// summary:
		//		A form widget that allows one to select a value with a vertically draggable handle
		/**
		* Fire validation when widget get input by set true, 
		* fire validation when widget get blur by set false
		* @type Boolean
		*/
		templateString: desktopTemplate,
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: true,
		/**
		* base class of dijit widget
		*/
		oneuiBaseClass: "dijitSlider",
		/**
		* base class of this oneui widget
		*/
		baseClass:"idxSliderWrapV",
		cssStateNodes: {
			incrementButton: "dijitSliderIncrementButton",
			decrementButton: "dijitSliderDecrementButton",
			focusNode: "dijitSliderThumb"
		},
		/** @ignore */
		postCreate: function(){
			this._event = {
				"input" : "_setValueAttr",
				"blur" 	: "_onBlur",
				"focus" : "_onFocus"
			}
			
			if(this.showButtons){
				this.own(
					typematic.addTouchListener(this.decrementButton, this, "_typematicCallback", 25, 500),
					typematic.addTouchListener(this.incrementButton, this, "_typematicCallback", 25, 500)
				);
				this.showButtons = false;
				this.inherited(arguments);
				this.showButtons = true;
			}else{
				this.inherited(arguments);
			}
			
			var height = domStyle.get(this.domNode, "height");
			domStyle.set(this.oneuiBaseNode, "height", height + "px");
			domStyle.set(this.leftDecoration, "height", Math.max(height - 50, 1) + "px");
			domStyle.set(this.rightDecoration, "height", Math.max(height - 50, 1) + "px");

			this._resize();
		},
		/**
		* use set("label", labelValue) to set the label of the VerticalSlider
		*/
		_setLabelAttr: function(/*String*/ label){
			this.inherited(arguments);
			wai.setWaiState(this.focusNode, "labelledby", this.id + "_label");
			domAttr.remove(this.compLabelNode, "for");
		},
		_setFieldWidthAttr: null
	});
	
	
	if(has("mobile") || has("platform-plugable")){
	
		var pluginRegistry = PlatformPluginRegistry.register("idx/form/VerticalSlider", {	
			desktop: "inherited",	// no plugin for desktop, use inherited methods  
			mobile: MobilePlugin	// use the mobile plugin if loaded
		});
		
		VerticalSlider = declare([VerticalSlider,_TemplatePlugableMixin], {
			/**
		     * Set the template path for the desktop template in case the template was not 
		     * loaded initially, but is later needed due to an instance being constructed 
		     * with "desktop" platform.
	     	 */
			templatePath: require.toUrl("idx/form/templates/VerticalSlider.html"),  
			// set the plugin registry
			pluginRegistry: pluginRegistry
		});
	}
	return iForm.VerticalSlider = declare("idx.form.VerticalSlider", VerticalSlider);
});
