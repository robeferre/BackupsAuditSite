/**
 * Licensed Materials - Property of IBM (C) Copyright IBM Corp. 2012 US Government Users Restricted Rights - Use,
 * duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"idx/layout/BorderContainer",
	"dijit/registry",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/form/Button",
	"dijit/layout/ContentPane",
	"dijit/layout/StackContainer",
	"dojo/i18n!./nls/_Wizard",
	"dojo/text!./templates/_Wizard.html"
], //
function(declare, //
dArray, //
dLang, //
dAspect, //
dClass, //
dConstruct, //
dAttr, //
iBorderContainer, //
dRegistry, //
dWidget, //
dTemplatedMixin, //
dWidgetsInTemplateMixin, //
dButton, //
dContentPane, //
dStackContainer, //
messages, //
templateText) {

	/**
	 * @name idx.layout._Wizard
	 * @class Provides a widget that is used to display a wizard.
	 */
	return declare("idx.layout._Wizard", [
		dWidget,
		dTemplatedMixin,
		dWidgetsInTemplateMixin
	], {
		/** @lends idx.layout._Wizard.prototype */
		baseClass: "idxWizard",
		
		templateString: templateText,
		widgetsInTemplate: true,

		/**
		 * Boolean indicating if the save button should display in the list of buttons.
		 */
		showSave: false,

		/**
		 * Post create.
		 */
		postCreate: function() {
			this.inherited(arguments);
			if (this.showSave) {
				dClass.remove(this._saveButton.domNode, "dijitHidden");
			}
			this._previousButton.set("label", messages.previous);
			this._nextButton.set("label", messages.next);
			this._finishButton.set("label", messages.finish);
			this._saveButton.set("label", messages.save);
			this._cancelButton.set("label", messages.cancel);
		},

		/**
		 * Destroy.
		 */
		destroy: function() {
			dArray.forEach(this.getChildren(), function(child) {
				child.destroyRecursive();
			});
			this.inherited(arguments);
		},

		/**
		 * Startup.
		 */
		startup: function() {
			if (!this._started) {
				dArray.forEach(dRegistry.findWidgets(this.containerNode), function(child) {
					this.addChild(child);
				}, this);
				this.next();
			}
			this.inherited(arguments);
		},

		/**
		 * @private Enable and disable the buttons.
		 */
		_enableButtons: function() {
			var next = this.getNext();
			var selected = this.getSelected();

			this._previousButton.set("disabled", !this.getPrevious());
			this._saveButton.set("disabled", !selected || !selected.savable);

			if (!next || !selected) { // No next pane or no selected page
				this._nextButton.set("disabled", true);
			} else {
				this._nextButton.set("disabled", !selected.valid);
			}

			if (!selected) { // No items in the wizard
				this._finishButton("disabled", true);
			} else if (!next) { // Last pane in the wizard.  Enable the finish button (if valid).
				this._finishButton.set("disabled", !selected.valid);
			} else { // Use the finishable value for this pane to determine if the Finish button should be selected.
				if (selected.finishable) {
					this._finishButton.set("disabled", !selected.valid);
				} else {
					this._finishButton.set("disabled", true);
				}
			}
		},

		/**
		 * Return the wizard panes.
		 * 
		 * @return An array of {@link idx.layout.WizardPane}.
		 */
		getChildren: function() {
			return this._stackContainer.getChildren();
		},

		/**
		 * Return the sub-steps for the input pane.
		 * 
		 * @param pane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 * @return An array of {@link idx.layout.WizardPane}.
		 */
		getSubsteps: function(pane) {
			if (!pane) {
				pane = this.getSelected();
			}
			var array = [];
			if (!pane.substep) {
				var children = this.getChildren();
				var foundIt = false;
				for (var i = 0 ; i < children.length ; i++) {
					var child = children[i];
					if (child == pane) {
						foundIt = true;
					} else if (foundIt) {
						if (child.substep) {
							array.push(child);
						} else {
							break;
						}
					}
				}
			}
			return array;
		},
		
		/**
		 * Add the wizard pane.
		 * 
		 * @param pane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 */
		addChild: function(pane, index) {
			var children = this.getChildren();
			var previousPane = null;
			var nextPane = null;
						
			// check if substep logic is wrong
			if (index !== undefined && index !== null) {				
				// normalize the index
				if (index > children.length) index = children.length; // add to end
				if (index < 0) index = 0;

				// check for "substep-first"
				if (pane.get("substep") && index == 0) {
					throw "Cannot add a substep as the first step: " + pane.id;
				}
				
				// check for "main step between substeps"
				if ((!pane.get("substep")) && (index > 0) && (index < children.length)) {
					if (children[index-1].get("substep") && children[index].get("substep")) {
						throw "Cannot add a main step between substeps: " + pane.id;
					}
				}
			}
			
			this._stackContainer.addChild(pane, index);
			this._addListeners(pane);
			var lastStep = null;
			var children = null;
			var child = null;
			// If this adding a sub-step, then set the parent on this pane.
			if (pane.substep) {
				children = this.getChildren();
				for ( var i = 0; i < children.length; i++) {
					child = children[i];
					if (!child.substep) {
						lastStep = child;
					}
					if (child === pane) {
						pane.parent = lastStep;
						break;
					}
				}
			}
			this.onAdd();
		},

		/**
		 * @private Add listeners to the pane.
		 */
		_addListeners: function(pane) {
			pane.own(dAspect.after(pane, "hideSubsteps", dLang.hitch(this, function(bool) {
				this.hideSubsteps(pane, bool);
			}), true));
			
			pane.own(dAspect.after(pane, "clearSubsteps", dLang.hitch(this, function() {
				this.clearSubsteps(pane);
			}), true));
			
			pane.own(dAspect.after(pane, "_setHiddenAttr", dLang.hitch(this, function(bool) {
				if (bool) {
					this.onRemove();
				} else {
					this.onAdd();
				}
			}), true));
			
			pane.own(dAspect.after(pane, "_setDisabledAttr", dLang.hitch(this, function(bool) {
				if (bool) {
					this.onRemove();
				} else {
					this.onAdd();
				}
			}), true));
			
			pane.own(dAspect.after(pane, "_setValidAttr", dLang.hitch(this, function(bool) {
				if (pane == this.getSelected()) {
					this._enableButtons();
				}
			}), true));
			
			pane.own(dAspect.after(pane, "_setSavableAttr", dLang.hitch(this, function(bool) {
				if (pane == this.getSelected()) {
					this._enableButtons();
				}
			}), true));
			
			pane.own(dAspect.after(pane, "_setFinishableAttr", dLang.hitch(this, function(bool) {
				if (pane == this.getSelected()) {
					this._enableButtons();
				}
			}), true));
			
			pane.own(dAspect.after(pane, "_setVisitedAttr", dLang.hitch(this, function(bool) {
				this.onVisitChange(pane);
			}), true));
		},

		/**
		 * Hide the sub-steps for the input pane.
		 * 
		 * @param pane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 * @param bool
		 * 		A boolean indicating if the substeps should be hidden or shown.
		 */
		hideSubsteps: function(pane, bool) {
			if (!pane) {
				pane = this.getSelected();
			}
			if (bool == undefined) {
				bool = false;
			}
			dArray.forEach(this.getSubsteps(pane), function(child) {
				child.hidden = bool;
			}, this);
			if (bool) {
				this.onRemove();
			} else {
				this.onAdd();
			}
		},

		/**
		 * Remove the wizard pane. If the pane has sub-steps, then the sub-steps will also be removed.
		 * 
		 * @param pane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 */
		removeChild: function(pane) {
			if (pane) {
				dArray.forEach(this.getSubsteps(pane), function(child) {
					this._remove(child);
				}, this);
				this._remove(pane);
				this.onRemove();
				this._select(this.getSelected());
			}
		},

		/**
		 * @private Remove the pane.
		 */
		_remove: function(pane) {
			this._stackContainer.removeChild(pane);
		},

		/**
		 * Clear the subsequent data on the panes after the input pane.
		 * 
		 * @param pane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 */
		clearSubsequent: function(pane) {
			if (!pane) {
				pane = this.getSelected();
			}
			var startClear = false;
			dArray.forEach(this.getChildren(), function(child) {
				if (child == pane) {
					startClear = true;
				} else if (startClear) {
					this._clear(child);
				}
			}, this);
		},

		/**
		 * Clear the pane's sub-step data.
		 * 
		 * @param pane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 */
		clearSubsteps: function(pane) {
			dArray.forEach(this.getSubsteps(pane), function(child) {
				this._clear(child);
			}, this);
		},

		/**
		 * @private Clear the pane.
		 */
		_clear: function(pane) {
			pane.set("visited", false);
			pane.onClear();
		},

		/**
		 * Return the selected WizardPane.
		 * 
		 * @return An instance of {@link idx.layout.WizardPane}.
		 */
		getSelected: function() {
			return this._stackContainer.selectedChildWidget;
		},

		/**
		 * @private Called when the user clicks the next button.
		 */
		_onNext: function() {
			this.next();
		},
		
		/**
		 * Show the next WizardPane.
		 */
		next: function() {
			var nextPane = this.getNext();
			var selectedPane = this.getSelected();
			if (selectedPane && nextPane != selectedPane) {
				selectedPane.onNext();
			}
			this._select(nextPane);
		},

		/**
		 * @private Called when the user clicks the previous button.  Show the previous WizardPane.
		 */
		_onPrevious: function() {
			var prevPane = this.getPrevious();
			var selectedPane = this.getSelected();
			if (selectedPane && prevPane != selectedPane) {
				selectedPane.onPrevious();
			}
			this._select(prevPane);
		},

		/**
		 * @private Select the pane and enable the buttons.
		 */
		_select: function(pane) {
			if (pane && pane != this.getSelected() && pane.isSelectable()) {
				this._stackContainer.selectChild(pane);
				pane.onSelect();
				this.onSelect(pane);
				pane.set("visited", true);
				this._enableButtons();
			}
		},
		
		/**
		 * @private Called when the finish button is selected.
		 */
		_onFinish: function() {
			this.onFinish(this.getChildren(), this.getSelected());
		},

		/**
		 * @private Called when the save button is selected.
		 */
		_onSave: function() {
			this.onSave(this.getChildren(), this.getSelected());
		},

		/**
		 * @private Called when the cancel button is selected.
		 */
		_onCancel: function() {
			this.onCancel(this.getChildren(), this.getSelected());
		},

		/**
		 * @private Return a boolean indicating if the stackContainer has the pane.
		 */
		_containsPane: function(pane) {
			var children = this.getChildren();
			for ( var i = 0; i < children.length; i++) {
				if (children[i] == pane) {
					return true;
				}
			}
			return false;
		},
		
		/**
		 * @private Returns the pane with the input id.
		 */
		_getPaneWithId: function(id) {
			var children = this.getChildren();
			for (var i = 0 ; i < children.length ; i++) {
				var child = children[i];
				if (child.id == id) {
					return child;
				}
			}
			return null;
		},

		/**
		 * Return the next WizardPane.
		 * 		 
		 * @param pane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 * @return An instance of {@link idx.layout.WizardPane}.
		 */
		getNext: function(pane) {
			if (!pane) {
				pane = this.getSelected();
			}
			// If the pane indicated its next, then return it.
			if (pane && pane.next) {
				return pane.next;
			}
			var returnNext = false;
			var children = this.getChildren();
			for ( var i = 0; i < children.length; i++) {
				var child = children[i];
				if (child.isSelectable()) {
					if (!pane || returnNext) {
						return child;
					} else if (child == pane) {
						returnNext = true;
					}
				}
			}
			return null;
		},

		/**
		 * Return the previous WizardPane.
		 * 		 
		 * @param pane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 * @return An instance of {@link idx.layout.WizardPane}.
		 */
		getPrevious: function(pane) {
			if (!pane) {
				pane = this.getSelected();
			}
			var previous = null;
			var children = this.getChildren();
			for ( var i = 0; i < children.length; i++) {
				var child = children[i];
				if (child.isSelectable()) {
					if (child == pane) {
						return previous;
					}
					previous = child;
				}
			}
			return null;
		},

		/**
		 * Fired when the one or more panes in the wizard are removed from the view.
		 */
		onRemove: function() {
		},

		/**
		 * Fired when the one or more panes in the wizard are added to the view.
		 */
		onAdd: function() {
		},
		
		/**
		 * Fired when the pane is going to be selected.
		 * 		 
		 * @param pane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 */
		onSelect: function(pane) {
		},
		
		/**
		 * Fired when the pane visit state changes.
		 * 		 
		 * @param pane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 */
		onVisitChange: function(pane) {
		},
		
		/**
		 * Fired when the cancel button is selected.
		 * 		 
		 * @param panes
		 * 		An array of {@link idx.layout.WizardPane}.
		 * @param currentPane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 */
		onCancel: function(panes, currentPane) {
		},

		/**
		 * Fired when the finish button is selected. Users of this widget can listen to this event in order to save the data in
		 * the panes.
		 * 
		 * @param panes
		 * 		An array of {@link idx.layout.WizardPane}.
		 * @param currentPane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 */
		onFinish: function(panes, currentPane) {
		},

		/**
		 * Fired when the save button is selected. Users of this widget can listen to this event in order to save the data in
		 * the panes.
		 * 
		 * @param panes
		 * 		An array of {@link idx.layout.WizardPane}.
		 * @param currentPane
		 * 		An instance of {@link idx.layout.WizardPane}.
		 */
		onSave: function(panes, currentPane) {
		}
	});
});
