/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo",
    	"dijit/registry",
        "dijit/layout/ScrollingTabController"],
       function(dojo, registry, ScrollingTabController){
	/**
	 * Creates an idx.layout.MenuTabController
	 * @name idx.layout.MenuTabController
	 * @class The MenuTabController widget provides a tab controller with
	 * support for drop-down menus on tabs. It is an extension of
	 * dijit.layout.ScrollingTabController, and supports a new 'popup' property
	 * on each content pane in the associated dijit.layout.StackContainer.
	 * <p>
	 * To add a drop-down menu to a tab, create a menu widget and assign it to
	 * the 'popup' property of the content pane for the tab in the associated
	 * dijit.layout.StackContainer. A drop-down arrow affordance will be added
	 * to the tab. Clicking the drop-down arrow, or using right-click or Shift+F10
	 * on the tab, will cause the drop-down menu to be shown.
	 * </p>
	 * <p>
	 * Note that if the 'closeable' property is set to true on a content pane that
	 * also has a 'popup' set, the corresponding tab will also be closeable and will
	 * show a close affordance alongside the drop-down arrow affordance. However, the
	 * drop-down menu will replace the automatic menu containing a 'Close' item, so
	 * in order to maintain keyboard access to the close function a suitable action
	 * item should be included in the drop-down menu that is supplied.
	 * </p>
	 * @augments dijit.layout.ScrollingTabController
	 */

	var MenuTabController = dojo.declare("idx.layout.MenuTabController", [ScrollingTabController], {
		/** @lends idx.layout.MenuTabController.prototype */

		constructor: function(){
			this.buttonWidget = "idx.layout._PopupTabButton";
			this._watches = {};
			this._connects = {};
		},
		
		onAddChild: function(/*dijit._Widget*/ page, /*Integer?*/ insertIndex){
			this.inherited(arguments);
			
			// at this point (although it might get overridden later)
			// page.controlButton gives us the button instance we just created
			var button = page.controlButton,
				me = this,
				applyPopup = function(name, oldpopup, newpopup){
					if(oldpopup){
						me._unbindPopup(page, button.domNode, button.dropdownNode, oldpopup);
					}
					
					if(newpopup){
						me._bindPopup(page, button.domNode, button.dropdownNode, newpopup);
						button.set("arrowButton", true);
					}else{
						button.set("arrowButton", false);
					}
				};
			
			applyPopup(null, null, page.popup && button.dropdownNode && registry.byId(page.popup));
			
			// watch() for changes to the 'popup' property on the content pane
			this._watches[page.id] = page.watch("popup", this, applyPopup);
			this._connects[page.id] = this.connect(button, 'onClickArrowButton', dojo.hitch(this, "onArrowButtonClick", page, button));
		},
		
		onRemoveChild: function(/*dijit._Widget*/ page){
			this.inherited(arguments);

			if(this._connects[page.id]){
				this.disconnect(this._connects[page.id]);
				delete this._connects[page.id];
			}
			
			if(this._watches[page.id]){
				this._watches[page.id].unwatch();
				delete this._watches[page.id];
			}
		},

		_bindPopup: function(/*dijit._Widget*/ page, /*DOM node*/ tabNode, /*DOM node*/ popupNode, /*dijit._Widget*/ popup){
			// summary:
			//		Bind a popup to display when triggered by the specified popupNode.
			
			if(typeof popup.bindDomNode == 'function'){
				if(popup._openMyself){
					// dijit menu only supports single set of bind options
					// so bind right-click to tab node and catch arrow
					// button clicks in the onArrowButtonClick method.
					popup.leftClickToOpen = false;
					popup.bindDomNode(tabNode);
				}else{
					// bind right-click to tab node and left-click to arrow button
					popup.bindDomNode(tabNode, { leftClickToOpen: false });
					popup.bindDomNode(popupNode, { leftClickToOpen: true });
				}
			}
		},
		
		_unbindPopup: function(/*dijit._Widget*/ page, /*DOM node*/ tabNode, /*DOM node*/ popupNode, /*dijit._Widget*/ popup){
			// summary:
			//		Unbind a popup which used to display when triggered by the specified popupNode.
			
			popup.unbindDomNode(popupNode);
		},
		
		onArrowButtonClick: function(/*dijit._Widget*/ page, /*idx.layout._PopupTabButton*/ button){
			// summary:
			//		Called whenever one of my child buttons [v] is pressed in an attempt
			//		to open a menu, but only when the popup widget has not already
			//		intercepted and consumed the click event
			// tags:
			//		private
			
			if(page.popup && page.popup._openMyself){
				page.popup._openMyself({ target: button.dropdownNode });
			}
		}
	});	

	dojo.declare("idx.layout._PopupTabButton", [dijit.layout._TabButton], {
		//	summary:
		//
		//		_PopupTabButton
		//
		//      An extension of the dijit _TabButton which adds a popup affordance.
		//
	    /*templateString:
	    	'<div role="presentation" data-dojo-attach-point="titleNode" data-dojo-attach-event="onclick:onClick">' +
				'<div role="presentation" data-dojo-attach-point="focusNode">' +
					'<div role="presentation" class="dijitTabInnerDiv" data-dojo-attach-point="innerDiv">' +
						'<div role="presentation" class="dijitTabContent" data-dojo-attach-point="tabContent">' +
			        		'<img src="${_blankGif}" alt="" class="dijitIcon dijitTabButtonIcon" data-dojo-attach-point="iconNode" />' +
					        '<span data-dojo-attach-point="containerNode" class="tabLabel">' + 
					        '</span>' +
					        '<span class="dijitInline dijitTabArrowButton dijitTabArrowIcon" data-dojo-attach-point="dropdownNode" data-dojo-attach-event="onclick: onClickArrowButton, onmouseenter: onMouseEnterArrowButton, onmouseleave: onMouseLeaveArrowButton" role="presentation">' +
					            '<span class="dijitTabDropDownText">${tabDropDownText}</span>' +
					        '</span>' +
					        '<span class="dijitInline dijitTabCloseButton dijitTabCloseIcon" data-dojo-attach-point="closeNode" role="presentation">' +
					            '<span class="dijitTabCloseText">${tabCloseText}</span>' +
					        '</span>' +
					        '<span class="idxTabSeparator" aria-hidden="true" data-dojo-attach-point="separatorNode">${tabSeparatorText}</span>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>',*/
		templateString:
			'<div role="presentation" data-dojo-attach-point="titleNode,innerDiv,tabContent" class="dijitTabInner dijitTabContent">' +
				'<img src="${_blankGif}" alt="" class="dijitIcon dijitTabButtonIcon" data-dojo-attach-point="iconNode"/>' +
				'<span data-dojo-attach-point="containerNode,focusNode" class="tabLabel"></span>' +
		        '<span class="dijitInline dijitTabArrowButton dijitTabArrowIcon" data-dojo-attach-point="dropdownNode" data-dojo-attach-event="onclick: onClickArrowButton, onmouseenter: onMouseEnterArrowButton, onmouseleave: onMouseLeaveArrowButton" role="presentation">' +
		            '<span data-dojo-attach-point="dropdownText" class="dijitTabDropDownText">${tabDropDownText}</span>' +
		        '</span>' +
				'<span class="dijitInline dijitTabCloseButton dijitTabCloseIcon" data-dojo-attach-point="closeNode" role="presentation">' +
					'<span data-dojo-attach-point="closeText" class="dijitTabCloseText">[x]</span>' +
				'</span>' +
		        '<span class="idxTabSeparator" aria-hidden="true" data-dojo-attach-point="separatorNode">${tabSeparatorText}</span>' +
			'</div>',		
			
		tabDropDownText: "&nbsp;[v]",
		tabCloseText: "[x]",
		tabSeparatorText: "",
			
		_setCloseButtonAttr: function(/*Boolean*/ disp){
			// we suppress the default pop-up menu containing "Close"
			// if the tab is closable but we have our own menu to display
			if(this.arrowButton){
				this._set("closeButton", disp);
				dojo.toggleClass(this.innerDiv, "dijitClosable", disp);
				this.closeNode.style.display = disp ? "" : "none";
			}else{
				this.inherited(arguments);
			}
		},

		_setArrowButtonAttr: function(/*Boolean*/ disp){
			this._set("arrowButton", disp);
			//dojo.toggleClass(this.innerDiv, "dijitPopup", disp);
			this.dropdownNode.style.display = disp ? "" : "none";
		},

		onClickArrowButton : function(/*Event*/ evt){
			evt.stopPropagation();
		},

		onMouseEnterArrowButton : function(event){
			dojo.addClass(event.currentTarget, "enter");
		},

		onMouseLeaveArrowButton : function(event){
			dojo.removeClass(event.currentTarget, "enter");
		}
	});

	return MenuTabController;	
});