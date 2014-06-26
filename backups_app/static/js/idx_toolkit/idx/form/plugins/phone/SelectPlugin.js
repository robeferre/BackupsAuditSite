/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/event",
	"dojo/_base/window",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/dom-geometry",
	"dojo/keys",
	"dojo/query",
	"dojo/touch",
	"dijit/_WidgetsInTemplateMixin",
	"dojox/mobile/Overlay",
	"dojox/mobile/Heading",
	"dojox/mobile/ToolBarButton",
	"dojox/mobile/ScrollableView",
	"dojox/mobile/ListItem",
	"dojox/mobile/EdgeToEdgeList",
	"dojo/text!../../mobileTemplates/Select.html"
], function(declare, array, event, win, lang, domClass, domStyle, 
			domAttr, domGeometry, keys, query, touch, _WidgetsInTemplateMixin,
			Opener, Heading, ToolBarButton,	ScrollableView, ListItem,EdgeToEdgeList, template){

		return declare(_WidgetsInTemplateMixin, {
			baseClass: "idxMobileSelect",
			/**
			 * 
			 */
			templateString: template,
			/**
			 * append the overlay node to win.body
			 */
			isBodyOverlay: true,
			/**
			 * remove the refocus on mobile
			 */
			refocus: function() {
				return;
			},
			
			/**
			 * Not Need on Mobile Platform
			 */
			closeDropDown: function(){},
			/**
			 * Calculate the Overlay height according to the document height and the content height
			 * Change the hook funciton from openDropDown to _onDropDownMouseDown
			 */
			_onDropDownMouseDown: function(scope){
				
				var baseNodeContentBox = domGeometry.getContentBox(scope.oneuiBaseNode),
					openerPad = domGeometry.getPadExtents(scope.selectOverlay.domNode);
				//
				// Set the Height of Overlay due to the content and the screen height
				//
				domStyle.set(scope.placeHolderNode , "width", baseNodeContentBox.w - openerPad.l - openerPad.r + "px");
				var maxHeight = document.documentElement.clientHeight / 2,
					scrollContentBox = domGeometry.getContentBox(scope.roundRectList.domNode),
					headerContentBox = domGeometry.getContentBox(scope.header.domNode);
					
				if ( maxHeight < headerContentBox.h + scrollContentBox.h ) {
					domStyle.set(scope.selectOverlay.domNode, "height", maxHeight + "px");
				}
				else{
					domStyle.set(scope.selectOverlay.domNode, "height", headerContentBox.h + scrollContentBox.h + "px");
				}
				scope.selectOverlay.show(scope.oneuiBaseNode, ['above-centered','below-centered','after','before']);
			},
			/**
			 * 
			 * @param {Object} item
			 * @param {Object} checked
			 */
			onCheckStateChanged: function(scope, item, checked){
				if (checked){
					scope.set("value", item.value);
				}
			},
			/**
			 * 
			 */
			onCloseButtonClick: function(scope){
				scope.selectOverlay.hide(true);
			},
			/**
			 * The dropDown property should be set to null on mobile platform
			 * insteadly, use the dojox.mobile.EdgeToEdgeList
			 */
			_createDropDown: function(scope){
				var roundRectList = scope.roundRectList;
				for (var iIndex = 0; iIndex < scope.options.length; iIndex++){
					roundRectList.addChild(
						new ListItem({label: scope.options[iIndex].label, value:scope.options[iIndex].value, checked:scope.options[iIndex].selected})
					);
				}				
				// In phone platform, the dropDown property is set to null.
				// move this node to win.body
				if (this.isBodyOverlay)
					scope.selectOverlay.placeAt(win.body());
				return null;
			},
			/**
			 * 
			 * @param {Object} message
			 */
			displayMessage: function(scope, message){
				if (message) {
					scope.validationMessage.innerHTML = message;
				}
			},
			/**
			 * 
			 * @param {Object} helpText
			 */
			_setHelpAttr: function(scope, helpText){
				scope._set("help", helpText);
				if(scope.helpContainer){
					domStyle.set(scope.helpContainer, "display", helpText ? "block": "none");
					scope.helpMessage.innerHTML = helpText;
				}
			}
		});
});
