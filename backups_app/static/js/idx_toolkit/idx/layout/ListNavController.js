/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */


define(["dojo/_base/declare",
        "dijit/layout/StackController",
        "dojo/_base/lang",
        "dojo/dom-attr",   
        "dojo/dom-class",
        "dojo/dom-geometry", 
        "dojo/on",
        "dojo/aspect",
        "dijit/registry",
        "dijit/focus",
        "dojo/_base/array",
        "dijit/form/Button"
        ],
        function (dDeclare,
                  dStackController, 
                  dLang,
	              dDomAttr,		
	              dDomClass,
	              dDomGeo,  
	              dOn,
	              dAspect,
	              dRegistry,
	              dFocus,
	              dArray,
	              dButton) {
         var dStackButton = dStackController.StackButton;
         
     	 /**
     	  * A navigation button (the thing you click to select a pane).
     	  * Contains the title of the associated pane.  This is an internal widget and should not 
     	  * be instantiated directly.
     	  * @private
     	  * @class
     	  * @name idx.layout._ListNavButton
     	  */
 		 var ListNavButton = dDeclare("idx.layout._ListNavButton", 
				 					  [dStackButton], {
			 
     
     		/**
     		 * The CSS class applied to the domNode.
     		 * @field
     		 * @private
     		 */
     		baseClass: "idxListNavButton",
     
     
     		/**
     		 * prevent user click from being able to toggle _ListNavButton into an off state
     		 * @function
     		 * @private
     		 */
     		_clicked: function(/*Event*/ evt)
     		{
     			if(!this.checked)
     				this.inherited("_clicked", arguments);
     		}
		 });
		
        /**
         * @name idx.layout.ListNavController
         * @class Similar to dijit.layout.StackController, but uses a custom button widget
         *			to prevent the user from deselecting the navigation button that is
         *			associated with a selected pane
         * @function
         * @augments dijit.layout.StackController
         * @public 
         */
         var ListNavController = dDeclare("idx.layout.ListNavController",
        		 						  [dStackController], 
        		 						  		/** @lends idx.layout.ListNavController# */{

                buttonWidget: ListNavButton,
				buttonWidgetClass: "idxListNavButton",
				 
                idxBaseClass: "idxListNavController",
 
                constructor: function(args, node) {

                },

				/**
				 * Overridden to destroy handles.
				 */
				destroy: function() {
					if (this._firstFocus) {
						this._firstFocus.remove();
						delete this._firstFocus;
					}
					if (this._firstAspect) {
						this._firstAspect.remove();
						delete this._firstAspect;
					}
					this.inherited(arguments);
				},

				/**
				 * Overridden to check if the specified container has already been started
				 * @see dijit.layout.PostCreate.
				 */
				postCreate: function() {
					if (this.containerId) {
						var container = dRegistry.byId(this.containerId);
						if (container && container._started) {
							this._containerAlreadyStarted = true;
						}
					}
					this.inherited(arguments);
				},
				
				/**
				 *
				 */
				startup: function() {
					this.inherited(arguments);
					if (this._containerAlreadyStarted) {
						var container = dRegistry.byId(this.containerId);
						var children = container.getChildren();
						var selectedChild = container.selectedChildWidget;
						this.onStartup({children: children, selected: selectedChild});
						delete this._containerAlreadyStarted;
					}
				},
				
				/**
				 *
				 */
				onStartup: function(info) {
					this.inherited(arguments);
					// add this here since the container is not properly sized in some instances under Dojo 1.8
					// this seems to be an initialization issue
					var container = dRegistry.byId(this.containerId);
					if (container) {
						container.resize();	 
					}
				},
				
                buildRendering: function() {
                   this.inherited(arguments);
                   dDomClass.add(this.domNode, this.idxBaseClass);	 
                },

                resize: function(changeSize, resultSize) {
                   this.inherited(arguments);
                   if (changeSize) dDomGeo.getMarginBox(this.domNode, changeSize);
                },
                
                /**
                 * Override parent behavior so that up/down/left/right arrows don't switch direction when in RTL mode, see defect 8026
                 */
                adjacent: function(/*Boolean*/ forward){
                    
                    //if(!this.isLeftToRight() && (!this.tabPosition || /top|bottom/.test(this.tabPosition))){ forward = !forward; }
                    var index = 0;
                    // find currently focused button in children array
                    var children = this.getChildren();
                    var current = children[0];
                    if (this._currentChild) {
                    	index = dArray.indexOf(children, this.pane2button(this._currentChild.id) );
                    	current = children[index];
                    }

                    // Pick next/previous non-disabled button to focus on.   If we get back to the original button it means
                    // that all buttons must be disabled, so return current child to avoid an infinite loop.
                    var child;
                    do{
                        index = (index + (forward ? 1 : children.length - 1)) % children.length;
                        child = children[index];
                    }while(child.disabled && child != current);

                    return child; // dijit/_WidgetBase
                },
                
                addChild: function(widget, index) {
                	this.inherited(arguments);
                	this.ensureKeyboardNav();
                },
                
                removeChild: function(widgetOrIndex) {
                	this.inherited(arguments);
                	this.ensureKeyboardNav();
                },
                	
                ensureKeyboardNav: function() {
                	var children = this.getChildren();
                	var firstButton = null;
                	var widgetType = (typeof this.buttonWidget == "string") ? dLang.getObject(this.buttonWidget) : this.buttonWidget;
                	for (var index = 0; index < children.length; index++) {
                		var child = children[index];
                		if (child instanceof widgetType) {
                			firstButton = child;
                			break;
                		}
                	}
                	if ((this._firstButton) && (this._firstButton.focusNode)) {
                	    dDomAttr.set(this._firstButton.focusNode, "tabindex", "-1");
                		if (this._firstFocus) this._firstFocus.remove();
                		if (this._firstAspect) this._firstAspect.remove();
                		this._firstButton = null;
                		this._firstFocus = null;
                	}
                	if ((firstButton) && (firstButton.focusNode)) {
                	    dDomAttr.set(firstButton.focusNode, "tabindex", "0");
                		this._firstFocus = dOn(firstButton.focusNode, "onfocus", 
                							   dLang.hitch(this, "onFirstButtonFocus"));
                		if (firstButton.onFocus) {
                			this._firstAspect = dAspect.after(firstButton, "onFocus",
                											  dLang.hitch(this, "onFirstButtonFocus"), 
                											  true);
              			}
                		this._firstButton = firstButton;
                	}
                },
                
                onAddChild: function(page) {
                	this.inherited(arguments);
                	var button = this.pane2button(page.id);
                	if (! button) return;
                	var controlNode = (button.focusNode ? button.focusNode : button.domNode);
                	var pageNode = page.domNode;
                	if ((! pageNode) || (!controlNode)) return;
                	dDomAttr.set(controlNode, "aria-controls", pageNode.id);
                	
                },
                
                onRemoveChild: function(page) {
                	this.inherited(arguments);
                	this.ensureKeyboardNav();
                },
                
                onSelectChild: function(page) {
                	this.inherited(arguments);
                	if (! this._currentChild) {
                		this.ensureKeyboardNav();
                	}
                },
                
                onFirstButtonFocus: function() {
                	if (! this._currentChild && this._firstButton) {
                		this.onButtonClick(this._firstButton);
                	}
                },
                
                onkeypress: function(/*Event*/e) {
                	this.inherited(arguments);
                },

                paneOrButton2Button: function(paneOrButton) {
                	if (paneOrButton instanceof dButton) {
                		return paneOrButton;
                	}
                	return this.pane2button(paneOrButton.id);
                },
                
                onButtonClick: function(/*dijit._Widget*/ page){                	
					var button = this.paneOrButton2Button(page);
					dFocus.focus(button.focusNode);
					        			
        			if(this._currentChild && this._currentChild.id === page.id) {
        				//In case the user clicked the checked button, keep it in the checked state because it remains to be the selected stack page.
        				button.set('checked', true);
        			}
        			var container = dRegistry.byId(this.containerId);
        			container.selectChild(page);
                }
            });
         
         	ListNavController.ListNavButton = ListNavButton;
         	
         	return ListNavController;
});

