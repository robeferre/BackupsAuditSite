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
	"dojox/mobile/Opener",
	"idx/multichannel",
	"dojo/text!idx/form/mobileTemplates/DropDownBox.html"
], function(declare, lang, winUtil, has, on, touch, domStyle, domClass, domConstruct, domAttr, stamp, _WidgetBase, 
			Opener, multichannel, template){
	
	return declare("idx.form.plugins.mobile._DateTimeTextBoxPluginBase", [], {
		/**
		* base class of dijit widget
		*/
		templateString: template,
		
		onBlur: function(textbox, e){
			// if(typeof e == "object"){
				// textbox.inherited(arguments);
			// }
		},
		
		openDropDown: function(dropdownInput, callback){
			//build opener
			if(dropdownInput.dropDown){
				dropdownInput.dropDown.destroy();
			}
			var PopupProto = lang.isString(this.popupClass) ? 
					lang.getObject(this.popupClass, false) : this.popupClass,
				value = dropdownInput.get("value");
			dropdownInput.dropDown = new PopupProto({
				onChange: function(value){
					dropdownInput.set('value', value, true);
				},
				id: dropdownInput.id + "_popup",
				dir: dropdownInput.dir,
				lang: dropdownInput.lang,
				value: value,
				textDir: dropdownInput.textDir,
				textBox: dropdownInput,
				currentFocus: !dropdownInput._isInvalidDate(value) ? value : dropdownInput.dropDownDefaultValue,
				constraints: dropdownInput.constraints,
				filterString: dropdownInput.filterString,
				datePackage: dropdownInput.params.datePackage,
				isDisabledDate: function(/*Date*/ date){
					return !dropdownInput.rangeCheck(date, dropdownInput.constraints);
				}
			});
			
			if(!dropdownInput.opener){
				dropdownInput.opener = new Opener({onHide:function(){}, onShow:function(){}}).placeAt(winUtil.body());
			}
			
			dropdownInput.opener.domNode.appendChild(dropdownInput.dropDown.domNode);
			dropdownInput.dropDown.startup();
			
			//open opener
			var aroundNode = dropdownInput._aroundNode || dropdownInput.domNode;
			dropdownInput.opener.show(aroundNode, ['below-centered','above-centered','after','before']);
		},
		
		closeDropDown: function(dropdownInput){
			// disable dropdown blur
			// dropdownInput.opener.hide();
		},
		
		displayMessage: function(dropdownInput, message){
			dropdownInput.validationMessage.innerHTML = message;
		},
		setHelpAttr: function(dropdownInput,helpText){
			dropdownInput._set("help", helpText);
			if(dropdownInput.helpContainer){
				domStyle.set(dropdownInput.helpContainer, "display", helpText ? "block": "none");
				dropdownInput.helpMessage.innerHTML = helpText;
			}
		}
		
	});
});
