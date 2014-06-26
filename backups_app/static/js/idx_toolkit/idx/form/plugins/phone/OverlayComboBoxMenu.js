/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/dom-style",
	"dojo/dom-construct",
	"dojo/_base/window",
	"dojo/touch",
	"dojo/dom-geometry",
	"dojo/_base/array",
	"dijit/_WidgetBase",
	"dijit/form/_ComboBoxMenuMixin",
	"dojox/mobile/Overlay",
	"dojox/mobile/Heading",
	"dojox/mobile/ScrollableView",
	"dojox/mobile/EdgeToEdgeList",
	"dojox/mobile/ListItem"
], function(declare,  domStyle, domConstruct, 
			win, touch,  domGeometry, array, _WidgetBase,  _ComboBoxMenuMixin,
			Overlay, Heading, ScrollableView, RoundRectList, 
			ListItem){

	return declare("idx.form.plugins.phone.OverlayComboBoxMenu",[_WidgetBase,_ComboBoxMenuMixin], {
		/**
		 * 
		 */
		showed:false,
		/**
		 * 
		 */
		buildRendering: function(){
			var overlay = new Overlay({"class": "idxMobileComboBoxMenu"});
			
			
			this.overlay = overlay;
			var heading = new Heading();

			var closeButton = domConstruct.toDom('<span aria-label="Close" role="button" class="mblSelectCloseButton"></span>');
			heading.domNode.appendChild(closeButton);
			var self = this;
			touch.press(closeButton, function(){
				self.hide();
			});
			this.header = heading;
			
			this.domNode = overlay.domNode;
			overlay.domNode.appendChild(heading.domNode);
			heading.startup();
			
			var scrollableView = new ScrollableView({
				selected: true,
				height: "auto"
			});
			var self = this;
			var roundRectList = new RoundRectList({
				select:"single",
				onCheckStateChanged: function(item, checked){
					if (checked){
						self.set("value", item.domNode);
					}
				}
			});
			this.roundRectList = roundRectList;
			scrollableView.addChild(roundRectList);
			//
			// Set containerNode for the ComboBoxMenuMixin
			//
			this.containerNode = roundRectList.domNode;

			overlay.domNode.appendChild(scrollableView.domNode);
			scrollableView.startup();
			win.body().appendChild(overlay.domNode);

		},
		
		/**
		 * 
		 * @param {Object}  DomNode node
		 */
		_setSelectedAttr: function(/*DomNode*/ node){
			
		},
		/**
		 * Hide the overlay instead of dropdown
		 */
		hide: function(){
			if (this.showed){
				this.overlay.hide();
			}
			this.showed = false;
			
		},
		/**
		 * 
		 */
		show: function(containerNode, position){
			
			var openerPad = domGeometry.getPadExtents(this.overlay.domNode);
			//
			// Set the Height of Overlay due to the content and the screen height
			//
			var maxHeight = document.documentElement.clientHeight / 2,
				scrollContentBox = domGeometry.getContentBox(this.roundRectList.domNode),
				headerContentBox = domGeometry.getContentBox(this.header.domNode);
				
			if ( maxHeight < headerContentBox.h + scrollContentBox.h ) {
				domStyle.set(this.overlay.domNode, "height", maxHeight + "px");
			}
			else{
				domStyle.set(this.overlay.domNode, "height", headerContentBox.h + scrollContentBox.h + "px");
			}
			
			
			this.overlay.show(containerNode,position);
			this.showed = true;
		},
		/**
		 * 
		 * @param {Object} results
		 * @param {Object} options
		 * @param {Object} labelFunc
		 */
		createOptions: function(results, options, labelFunc){
			this.items = results;
			// create options using _createOption function defined by parent
			// ComboBox (or FilteringSelect) class
			// #2309:
			//		iterate over cache nondestructively
			var self = this;
			//
			// Empty DOM Node for RountRectList, for _openResultList 
			// in _AutoCompleterMixin line: this._announceOption(this.dropDown.containerNode.firstChild.nextSibling); 
			//
			var menuitem = new ListItem({});
			self.roundRectList.addChild(menuitem);
			domStyle.set(menuitem.domNode,"display","none");
				
			array.forEach(results, function(item, i){
				
				menuitem = new ListItem({
					label: item.name, 
					value: item.value
				});
				menuitem.domNode.setAttribute("item", i);
				self.roundRectList.addChild(menuitem);
			}, this);
			
			menuitem = new ListItem({});
			self.roundRectList.addChild(menuitem);
			domStyle.set(menuitem.domNode,"display","none");
		},
		/**
		 * 
		 */
		clearResultList: function(){
			// summary:
			//		Clears the entries in the drop down list, but of course keeps the previous and next buttons.
			var container = this.containerNode;
			while(container.childNodes.length > 0){
				container.removeChild(container.childNodes[container.childNodes.length - 1]);
			}
			this._setSelectedAttr(null);
		}
	});
});