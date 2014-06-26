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
	"dojox/mobile/DatePicker"
], function(declare, lang, winUtil, array, has, on, touch, date, locale, stamp, domStyle, domClass, domConstruct, domAttr, registry,
		Button, ToolBarButton, Heading, DatePicker){
	
	return declare("idx/form/plugins/mobile/_CalendarMobile", [DatePicker], {
		
		datePackage: "",
		value: new Date(""),
		
		constructor: function(params /*===== , srcNodeRef =====*/){
			this.dateModule = params.datePackage ? lang.getObject(params.datePackage, false) : date;
			this.dateClassObj = this.dateModule.Date || Date;
			this.dateLocaleModule = params.datePackage ? lang.getObject(params.datePackage + ".locale", false) : locale;
		},
		
		startup: function(){
			this.inherited(arguments);
			
			if(!this.actionBar){
				this.actionBar = new Heading({
					label: "Date Picker"
				}).placeAt(this.domNode, "before");
				domClass.add(this.actionBar.domNode, "dateTextBoxOpenerHeader");
				
				this.doneButton = new ToolBarButton({
					label:"Done"
				});
				domClass.add(this.doneButton.domNode, "mblColorBlue calendarMobileDone");
				this.actionBar.addChild(this.doneButton);
				on(this.doneButton, touch.release, lang.hitch(this, function(e){
					this.onChange(this._patchDate(stamp.fromISOString(this.get("value"))));
					this.textBox.opener.hide();
				}));
				
				this.cancelButton = new ToolBarButton({
					label:'Cancel'
				});
				domClass.add(this.cancelButton.domNode, "mblColorBlue calendarMobileCancel");
				this.actionBar.addChild(this.cancelButton);
				on(this.cancelButton, touch.release, lang.hitch(this, function(e){
					this.textBox.opener.hide();
				}));
				domClass.add(this.textBox.opener.domNode, "idxMobileCalendarOpener");
			}
			
			//init value
			// clearTimeout(this.initTextBoxValueTimeout);
			// this.initTextBoxValueTimeout = setTimeout(lang.hitch(this, function(){
				// this.set("value", this._get("textboxValue"));
			// }),100);
		},
		
		onChange: function(value){
			// summary:
			//		Called only when the selected date has changed
		},
		
		_setValueAttr: function(/*String*/value){
			if(typeof value == "string"){
				value = stamp.fromISOString(value);
				value = this._patchDate(value);
			}

			//for textbox input value
			if(this._isValidDate(value)){
				this._set("textboxValue", value);
				value = stamp.toISOString(value, {selector: "date"});
			}else{
				var now = new Date();
				this._set("textboxValue", now);
				value = stamp.toISOString(now, {selector: "date"});
			}
			
			//set current date
			var v = array.map(this.slots, function(w){ return w.format(this.textboxValue); }, this);
			this.set("colors", v);
			this.set("values", v);
			// this.inherited(arguments);
		},
		
		_patchDate: function(/*Date|Number*/ value){
			if(value){
				value = new this.dateClassObj(value);
				value.setHours(1, 0, 0, 0);
			}
			return value;
		},
		
		_isValidDate: function(/*Date*/ value){
			return value && !isNaN(value) && typeof value == "object" &&
				value.toString() != this.constructor.prototype.value.toString();
		},
		
		isDisabledDate: function(date){
			//Stub function TODO
		},
		destroy: function(){
		 	this.inherited(arguments);
		 	if(this.actionBar && this.actionBar.destroy){
		 		this.actionBar.destroy();
		 	}
		}
	});
	
});
