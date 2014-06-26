/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/kernel",
	"dojo/_base/event",
	"dojo/dom-attr",
	"dojo/query",
	"dojo/has",
	"dijit/form/ToggleButton",
	"./_CssStateMixin",
	"./_CompositeMixin",
	"./_ValidationMixin",
		// ====================================================================================================================
	// ------
	// Load _TemplatePlugableMixin and PlatformPluginRegistry if on "mobile" or if on desktop, but using the 
	// platform-plugable API.  Any prior call to PlaformPluginRegistry.setGlobalTargetPlatform() or 
	// PlatformPluginRegistry.setRegistryDefaultPlatform() sets "platform-plugable" property for dojo/has.
	// ------
	"idx/has!#mobile?idx/_TemplatePlugableMixin:#platform-plugable?idx/_TemplatePlugableMixin", 
	"idx/has!#mobile?idx/PlatformPluginRegistry:#platform-plugable?idx/PlatformPluginRegistry",
	
	// ------
	// We want to load the desktop template unless we are using the mobile implementation.
	// ------
	"idx/has!#idx_form_TriStateCheckBox-desktop?dojo/text!./templates/TriStateCheckBox.html" 	// desktop widget, load the template
		+ ":#idx_form_TriStateCheckBox-mobile?"													// mobile widget, don't load desktop template
		+ ":#desktop?dojo/text!./templates/TriStateCheckBox.html"								// global desktop platform, load template
		+ ":#mobile?"																			// global mobile platform, don't load
		+ ":dojo/text!./templates/TriStateCheckBox.html", 										// no dojo/has features, load the template
			
	// ------
	// Load the mobile plugin according to build-time/runtime dojo/has features
	// ------
	"idx/has!#idx_form_TriStateCheckBox-mobile?./plugins/phone/TriStateCheckBoxPlugin"			// mobile widget, load the plugin
		+ ":#idx_form_TriStateCheckBox-desktop?"													// desktop widget, don't load plugin
		+ ":#mobile?./plugins/phone/TriStateCheckBoxPlugin"										// global mobile platform, load plugin
		+ ":",																					// no features, don't load plugin

	
	"dojo/NodeList-dom" // NodeList.addClass/removeClass
], function(declare, array, lang, kernel, event, domAttr, query, has, 
			ToggleButton, _CssStateMixin, _CompositeMixin, _ValidationMixin, 
			TemplatePlugableMixin, PlatformPluginRegistry, desktopTemplate, MobilePlugin){
	
	var baseClassName = "idx.form.TriStateCheckBox";
	if (has("mobile") || has("platform-plugable")) {
		baseClassName = baseClassName + "Base";
	}
	if (has("dojo-bidi")) {
		baseClassName = baseClassName + "_";
	}		
		
	var iForm = lang.getObject("idx.oneui.form", true); // for backward compatibility with IDX 1.2

	/**
	 * @name idx.form.TriStateCheckBox
	 * @class idx.form.TriStateCheckBox is implemented according to IBM One UI(tm) <b><a href="http://dleadp.torolab.ibm.com/uxd/uxd_oneui.jsp?site=ibmoneui&top=x1&left=y6&vsub=*&hsub=*&openpanes=0100110000">Check Boxes Standard</a></b> 
	 * Compared with dijit.form.CheckBox, TriStateCheckBox has a indeterminate state in addtion to checked state and unchecked state.
	 * The state cycle of TriStateCheckBox is configureable, so you can even create a CheckBox with states cycle such as: 'checked' -> 'indeterminate' -> 'checked' -> 'unchecked'
	 * As idx.form.TriStateCheckBox is a composite widget. You can set a label for it directly rather than adding a label tag mannually.
	 * @augments dijit.form.ToggleButton
	 * @augments idx.form._CssStateMixin
	 * @augments idx.form._CompositeMixin
	 * @augments idx.form._ValidationMixin
	 */
	iForm.TriStateCheckBox = declare(baseClassName, [ToggleButton, _CssStateMixin, _CompositeMixin, _ValidationMixin],
	/**@lends idx.form.TriStateCheckBox.prototype*/
	{
		templateString: desktopTemplate,
		
		instantValidate: true,
		
		baseClass: "idxOneuiTriStateCheckBoxWrap",
		
		oneuiBaseClass: "idxOneuiTriStateCheckBox",

		labelAlignment: "horizontal",
		
		/**
		 * States cycle of a TriStateCheckBox. By default it's [false, "mixed", true] which means the state cycles from
		 * 'unchecked' -> 'indeterminate' -> 'checked'.
		 * Note: The value of the 'checked' property of a TriStateCheckBox should be one of these states.
		 * For example, if the 'states' property of a TriStateCheckBox is [false, true], then setting 'checked'
		 * property to 'midex' is invalid.
		 * @type Array|String
		 * @default [false, "mixed", true]
		 */
		states: "",
		
		/**
		 * Alt text used to replace the image to show
		 * current state of TriStateCheckBox in high contrast mode.
		 * @type Object
		 * @default {"False": '&#9633;', "True": '&#8730;', "Mixed": '&#9632;'};
		 * @private
		 */
		_stateLabels: null,
		
		/**
		 * The submit value for each state. By default, "on"/"mixed" will be submitted
		 * if the state of a TriStateCheckBox is checked/indeterminate.
		 * @type Object
		 * @default {"False": false, "True": "on", "Mixed": "mixed"};
		 */
		stateValues: null,
		
		/**
		 * The current state of the TriStateCheckBox
		 * @type Integer
		 * @private
		 */
		_currentState: 0,
		
		/**
		 * The current state type of the TriStateCheckBox.
		 * Could be "False", "True" or "Mixed"
		 * @private
		 */
		_stateType: "False",
		
		/**
		 * Should this widget respond to user input or not.
		 * In markup, this is specified as "readOnly".
		 * Similar to disabled except readOnly form values are submitted.
		 * @type Boolean
		 */
		readOnly: false,
		
		/**
		 * Current check state of the check box. Can be one of element in 'states' property.
		 * @type Boolean|String
		 * @default false
		 */
		checked: "",
		
		constructor: function(){
			// summary:
			//		Runs on widget initialization to setup arrays etc.
			// tags:
			//		private
			this.states = [false, "mixed", true];
			this.checked = false;
			this._stateLabels = {
				"False": '&#9633;',
				"True": '&#8730;',
				"Mixed": '&#9632;'
			};
			this.stateValues = { 
				"False": false,
				"True": "on", 
				"Mixed": "mixed"
			};
		},
		
		_fillContent: function(/*DomNode*/ source){
			// Override Button::_fillContent() since it doesn't make sense for CheckBox,
			// since CheckBox doesn't even have a container
		},
		
		postCreate: function(){
			
			this._event = {
				"input" : "onChange",
				"blur" : "_onBlur",
				"focus" : "_onFocus"
			}
			if(this.instantValidate){
				this.connect(this.focusNode, "onfocus", function(){
					if(this.message == "" || this.mouseFocus){
						this.mouseFocus = false;
						return;
					}
				});
			}
			domAttr.set(this.stateLabelNode, 'innerHTML', this._stateLabels[this._stateType]);
			this.inherited(arguments);
		},
		
		startup: function(){
			this.set("checked", this.params.checked || this.states[this._currentState]);
			domAttr.set(this.stateLabelNode, 'innerHTML', this._stateLabels[this._stateType]);
			this.inherited(arguments);
		},
		
		_isEmpty: function(){
			return !this.get("checked");
		},
		
		_setCheckedAttr: function(/*String|Boolean*/ checked, /*Boolean?*/ priorityChange){
			// summary:
			//		Handler for checked = attribute to constructor, and also calls to
			//		set('checked', val).
			// checked:
			//		true, false or 'mixed'
			// description:
			//		Controls the state of the TriStateCheckBox. Set this.checked, 
			//		this._currentState, value attribute of the <input type="checkbox">
			//		according to the value of 'checked'.
			var stateIndex = array.indexOf(this.states, checked), changed = false;
			if(stateIndex >= 0){
				this._currentState = stateIndex;
				if(checked != this.get("checked")){
					changed = true;
				}
				this._set("checked", checked);
				this._stateType = this._getStateType(checked);
				if(checked == "mixed"){
					domAttr.set(this.focusNode || this.domNode, "checked", true);
				}else{
					domAttr.set(this.focusNode || this.domNode, "checked", checked);
				}
				domAttr.set(this.focusNode, "value", this.stateValues[this._stateType]);
				domAttr.set(this.stateLabelNode, 'innerHTML', this._stateLabels[this._stateType]);
				(this.focusNode || this.domNode).setAttribute("aria-checked", checked);
				if(changed){
					this._handleOnChange(checked, priorityChange);
				}
			}else{
				console.warn("Invalid state!");
			}
		},
		
		setChecked: function(/*String|Boolean*/ checked){
			// summary:
			//		Deprecated.  Use set('checked', true/false) instead.
			kernel.deprecated("setChecked(" + checked + ") is deprecated. Use set('checked'," + checked + ") instead.", "", "2.0");
			this.set('checked', checked);
		},
		
		_setStatesAttr: function(/*Array|String*/ states){
			if(lang.isArray(states)){
				this._set("states", states);
			}else if(lang.isString(states)){
				var map = {
					"true": true,
					"false": false,
					"mixed": "mixed"
				};
				states = states.split(/\s*,\s*/);
				for(var i = 0; i < states.length; i++){
					states[i] = map[states[i]] !== undefined ? map[states[i]] : false;
				}
				this._set("states", states);
			}
		},
		
		_setReadOnlyAttr: function(/*Boolean*/ value){
			this._set("readOnly", value);
			domAttr.set(this.focusNode, "readOnly", value);
		},
		
		_setValueAttr: function(/*String|Boolean*/ newValue, /*Boolean*/ priorityChange){
			// summary:
			//		Handler for value = attribute to constructor, and also calls to
			//		set('value', val).
			// description:
			//		During initialization, just saves as attribute to the <input type=checkbox>.
			//
			//		After initialization,
			//		when passed a boolean or the string 'mixed', controls the state of the
			//		TriStateCheckBox.
			//		If passed a string except 'mixed', changes the value attribute of the
			//		TriStateCheckBox. Sets the state of the TriStateCheckBox to checked.
			if(typeof newValue == "string" && (array.indexOf(this.states, newValue) < 0)){
				if(newValue == ""){
					newValue = "on";
				}
				this.stateValues["True"] = newValue;
				newValue = true;
			}
			if(this._created){
				this._currentState = array.indexOf(this.states, newValue);
				this.set('checked', newValue, priorityChange);
				domAttr.set(this.focusNode, "value", this.stateValues[this._stateType]);
			}
		},
		
		_setValuesAttr: function(/*Array*/ newValues){
			// summary:
			//		Handler for values = attribute to constructor, and also calls to
			//		set('values', val).
			// newValues:
			//		If the length of newValues is 1, it will replace the value of
			//		the TriStateCheckBox in true state. Otherwise, the values of
			//		the TriStateCheckBox in true state and 'mixed' state will be
			//		replaced by the first two values in newValues.
			// description:
			//		Change the value of the TriStateCheckBox in 'mixed' and true states.
			this.stateValues["True"] = newValues[0] ? newValues[0] : this.stateValues["True"];
			this.stateValues["Mixed"] = newValues[1] ? newValues[1] : this.stateValues["Mixed"];
		},
		
		_getValueAttr: function(){
			// summary:
			//		Hook so get('value') works.
			// description:
			//		Returns value according to current state of the TriStateCheckBox.
			return this.stateValues[this._stateType];
		},
		
		reset: function(){
			this._hasBeenBlurred = false;
			this.set("states", this.params.states || [false, "mixed", true]);
			this.stateValues = this.params.stateValues || {
				"False" : false,
				"True" : "on",
				"Mixed" : "mixed"
			};
			this.set("values", this.params.values || []);
			this.set('checked', this.params.checked || this.states[0]);
		},
		
		_onFocus: function(){
			if(this.id){
				query("label[for='" + this.id + "']").addClass("dijitFocusedLabel");
			}
			this.inherited(arguments);
		},
		
		_onBlur: function(){
			if(this.id){
				query("label[for='" + this.id + "']").removeClass("dijitFocusedLabel");
			}
			this.mouseFocus = false;
			this.inherited(arguments);
		},
		
		_onClick: function(/*Event*/ e){
			// summary:
			//		Internal function to handle click actions - need to check
			//		readOnly and disabled
			if(this.readOnly || this.disabled){
				event.stop(e);
				return false;
			}
			this.click();
			return this.onClick(e); // user click actions
		},
		
		click: function(){
			// summary:
			//		Emulate a click on the check box, but will not trigger the 
			//		onClick method.
			if(this._currentState >= this.states.length - 1){
				this._currentState = 0;
			}else{
				if(this._currentState == -1){
					this.fixState();
				}else{
					this._currentState++;
				}
			}
			var oldState = this._currentState;
			this.set("checked", this.states[this._currentState]);
			this._currentState = oldState;
			domAttr.set(this.stateLabelNode, 'innerHTML', this._stateLabels[this._stateType]);
		},
		
		fixState: function(){
			// summary:
			//		Fix _currentState property if it's out of bound.
			this._currentState = this.states.length - 1;
		},
		
		_getStateType: function(/*String|Boolean*/ state){
			//	summary:
			//		Internal function to return the type of a certain state
			//		false: False
			//		true: True
			//		"mixed": Mixed
			return state ? (state == "mixed" ? "Mixed" : "True") : "False";
		},
		
		_onMouseDown: function(){
			this.mouseFocus = true;
		},
		
		_setDisabledAttr: function(){
			this.inherited(arguments);
			this._refreshState();
		},
		
		_setLabelAlignmentAttr: null,
		_setFieldWidthAttr: null,
		_setLabelWidthAttr: null,
		resize:function(){return false;},
		_setIconClassAttr: null
	});
	
	
	if (has("dojo-bidi")) {
		baseClassName = baseClassName.substring(0, baseClassName.length-1);
		var baseTriStateCheckBox = iForm.TriStateCheckBox;
		iForm.TriStateCheckBox = declare(baseClassName,[baseTriStateCheckBox]);
	}
	
	if ( has("mobile") || has("platform-plugable")) {
	
		var pluginRegistry = PlatformPluginRegistry.register("idx/form/TriStateCheckBox", 
				{	
					desktop: "inherited",	// no plugin for desktop, use inherited methods  
				 	mobile: MobilePlugin	// use the mobile plugin if loaded
				});

		iForm.TriStateCheckBox = declare("idx.form.TriStateCheckBox",[iForm.TriStateCheckBox, TemplatePlugableMixin], {
			/**
		     * Set the template path for the desktop template in case the template was not 
		     * loaded initially, but is later needed due to an instance being constructed 
		     * with "desktop" platform.
	     	 */
			templatePath: require.toUrl("idx/form/templates/TriStateCheckBox.html"), 

			// set the plugin registry
			pluginRegistry: pluginRegistry,
			/**
			 * Stub Plugable method
			 */
			postCreate: function(){
				var promise = this.doWithPlatformPlugin(arguments, "postCreate", "postCreate");
				this.inherited(arguments);
				return promise;
			},	 			
			/**
			 * 
			 * @param {Object} message
			 */
			displayMessage: function(message){
				return this.doWithPlatformPlugin(arguments, "displayMessage", "displayMessage", message);
			},
			/**
			 * 
			 * @param {Object} helpText
			 */
			_setHelpAttr: function(helpText){
				return this.doWithPlatformPlugin(arguments, "_setHelpAttr", "setHelpAttr", helpText);
			},
			/**
			 * 
			 * @param {Object} value
			 */
			_setCheckedAttr: function(value){
				this.inherited(arguments);
				this.focusNode.setAttribute("value", this.stateValues[this._stateType]);
				
			}
		});
	}
	
	return iForm.TriStateCheckBox;
});
