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
	"dojo/_base/array",
	"dojo/has",
	"dojo/on",
	"dojo/touch",
	"dojo/date", // date
	"dojo/date/locale",
	"dojo/date/stamp",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dijit/registry",
	"dijit/form/Button",
	"dojox/mobile/ToolBarButton",
	"dojox/mobile/Heading",
	// "dojox/mobile/ValuePickerTimePicker"
	"dojox/mobile/TimePicker"
], function(declare, lang, winUtil, array, has, on, touch, date, locale, stamp, domStyle, domClass, domConstruct, domAttr, registry,
		Button, ToolBarButton, Heading, TimePicker){
	
	return declare("idx/form/plugins/mobile/_TimePickerMobile", [TimePicker], {
		
		datePackage: "",
		value: new Date(""),
		
		startup: function(){
			this.inherited(arguments);
			
			if(!this.actionBar){
				this.actionBar = new Heading({
					label: "Time Picker"
				}).placeAt(this.domNode, "before");
				domClass.add(this.actionBar.domNode, "timeTextBoxOpenerHeader");
				
				this.doneButton = new ToolBarButton({
					label:"Done"
				});
				domClass.add(this.doneButton.domNode, "mblColorBlue timePickerMobileDone");
				this.actionBar.addChild(this.doneButton);
				on(this.doneButton, touch.release, lang.hitch(this, function(e){
					this.onChange(this.get("date"));
					this.textBox.opener.hide();
				}));
				
				this.cancelButton = new ToolBarButton({
					label:'Cancel'
				});
				domClass.add(this.cancelButton.domNode, "mblColorBlue timePickerMobileCancel");
				this.actionBar.addChild(this.cancelButton);
				on(this.cancelButton, touch.release, lang.hitch(this, function(e){
					this.textBox.opener.hide();
				}));
				domClass.add(this.textBox.opener.domNode, "idxMobileTimePickerOpener");
			}
			
			//init value
			clearTimeout(this.initTextBoxValueTimeout);
			this.initTextBoxValueTimeout = setTimeout(lang.hitch(this, function(){
				this.set("value", this._get("textboxValue"));
			}),500);
		},
		
		onChange: function(value){
			// summary:
			//		Called only when the selected date has changed
		},
		
		_getValueAttr: function(){
			var v = this.get("values"); // [hour24, minute]
			return v[0] + ":" + v[1];
		},
		
		_setValueAttr: function(/*String*/value){
			if(typeof value == "string"){
				value = stamp.fromISOString(value);
				value = this._patchTime(value);
			}

			if(this._isValidTime(value)){
				this._set("textboxValue", value);
				value = locale.format(value, {timePattern:"H:m", selector: "time"});
			}else{
				var now = new Date();
				this._set("textboxValue", now);
				value = locale.format(now, {timePattern:"H:m", selector: "time"});
			}
			
			var values = value.split(":");
			this.set("colors", values);
			this.set("values", values);
		},
		
		_patchTime: function(/*Date|Number*/ value){
			if(value){
				value = new Date(value);
				value.setFullYear(1970, 0, 1);
			}
			return value;
		},
		
		_isValidTime: function(/*Date*/ value){
			return value && !isNaN(value) && typeof value == "object" &&
				value.toString() != this.constructor.prototype.value.toString();
		},
		
		destroy: function(){
		 	this.inherited(arguments);
		 	if(this.actionBar && this.actionBar.destroy){
		 		this.actionBar.destroy();
		 	}
		}
		
	});
	
});
