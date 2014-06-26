/**
 * Licensed Materials - Property of IBM (C) Copyright IBM Corp. 2012 US Government Users Restricted Rights - Use,
 * duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class", 
	"dijit/layout/ContentPane"
], //
function(dDeclare, //
dLang, //
dClass, //
dContentPane) {

	/**
	 * @name idx.layout.WizardPane
	 * @class Provides a pane in the idx.layout._Wizard.
	 */
	return dDeclare("idx.layout.WizardPane", [
		dContentPane
	], {
		/** @lends idx.layout.WizardPane.prototype */

		/**
		 * Boolean indicating if the save button should be enabled or disabled when this pane is the current pane. (This
		 * setting only applies when the save button is displayed in the wizard.) Default is true.
		 */
		savable: true,
		/**
		 * Boolean indicating if the finish button should enable when this pane is the current pane. Default is false.
		 * (Note: for the last pane in the wizard, this value is ignored.) Default is false.
		 */
		finishable: false,
		/**
		 * Boolean indicating if this pane should be hidden. If true, this pane is skipped when the user hits Next.
		 * For the table of contents wizard, this pane's label will not display in the table of contents. Default
		 * is false.
		 */
		hidden: false,
		/**
		 * Boolean indicating if this pane is only a heading with no content.  If true, this pane's label will display 
		 * in the table of contents, but the pane will be skipped when the user hits Next.  Default is false.
		 */
		headingOnly: false,
		/**
		 * Boolean indicating if this pane is displayed. If true, this pane's label displays in the table of contents as disabled,
		 * but the pane will be skipped when the user hits Next.  Default is false.
		 */
		disabled: false,
		/**
		 * Boolean indicating if the data on the pane is valid. If true and this is the current pane, then the _Wizard
		 * enables the Next (or Finish) button. If false and this is the current pane, then the _Wizard disables the
		 * Next button (or Finish). Default is true.
		 */
		valid: true,
		/**
		 * Boolean indicating if this is a sub-step. Default is false.
		 */
		substep: false,
		/**
		 * An extra, optional class to add to the table of contents label node.
		 */
		labelClass: "",
		/**
		 * If substep = true, then this will contain the parent idx.layout.WizardPane after the pane is added to the
		 * wizard.
		 */
		parent: null,
		/**
		 * Optionally, specifies the next WizardPane to display when the Next button is selected.
		 */
		next: null,
		/**
		 * Boolean indicating if the pane is visited.  Default is false.  This value will be updated when the pane is selected.  
		 */
		visited: false,

		postCreate: function() {
			this.inherited(arguments);
			dClass.add(this.domNode, "idxWizardPane");
		},
		
		/**
		 * Set the valid attribute.
		 * 
		 * @param bool
		 * 		A boolean indicating if this pane is valid.
		 */
		_setValidAttr: function(bool) {
			this.valid = bool;
		},

		/**
		 * Set the disabled attribute.
		 * 
		 * @param bool
		 * 		A boolean indicating if this pane is disabled.
		 */
		_setDisabledAttr: function(bool) {
			this.disabled = bool;
		},

		/**
		 * Get the disabled attribute.  If this is a sub-step and its parent is disabled, then this sub-step is disabled.
		 * 
		 * @return A boolean indicating if this pane is disabled.
		 */
		_getDisabledAttr: function() {
			if (this.substep && this.parent && this.parent.get("disabled")) {
				return true;
			} else {
				return this.disabled;
			}
		},

		/**
		 *  Set the hidden attribute.
		 * 
		 * @param bool
		 * 		A boolean indicating if this pane is hidden.
		 */
		_setHiddenAttr: function(bool) {
			this.hidden = bool;
		},

		/**
		 * Get the hidden attribute.  If this is a sub-step and its parent is hidden, then this sub-step is hidden.
		 * 
		 * @return A boolean indicating if this pane is hidden.
		 */
		_getHiddenAttr: function() {
			if (this.substep && this.parent && this.parent.get("hidden")) {
				return true;
			} else {
				return this.hidden;
			}
		},

		/**
		 *  Set the visited attribute.
		 * 
		 * @param bool
		 * 		A boolean indicating if this pane is visited.
		 */
		_setVisitedAttr: function(bool) {
			this.visited = bool;
		},

		/**
		 *  Set the savable attribute.
		 * 
		 * @param bool
		 * 		A boolean indicating if the save button is enabled when this pane is selected.
		 */
		_setSavableAttr: function(bool) {
			this.savable = bool;
		},

		/**
		 *  Set the finishable attribute.
		 * 
		 * @param bool
		 * 		A boolean indicating if the finish button is enabled when this pane is selected.
		 */
		_setFinishableAttr: function(bool) {
			this.finishable = bool;
		},

		/**
		 *  Set the idx.layout.WizardPane that should display when the user hits the Next button when this pane is the current pane. 
		 *  This method allows the user to specify the pane that should display when the user hits Next.
		 *  If this value is not set, then the _Wizard will determine the next pane to display.
		 *  
		 *  @param pane
		 *  	An instance of {@link idx.layout.WizardPane}.
		 */
		_setNextAttr: function(pane) {
			this.next = pane;
		},

		/**
		 * Event fired when this pane is going to be selected / shown.
		 */
		onSelect: function() {
		},

		/**
		 * Event fired when the user hit Next and this pane will no longer be selected / shown.
		 */
		onNext: function() {
		},
		
		/**
		 * Event fired when the user hit Previous and this pane will no longer be selected / shown.
		 */
		onPrevious: function() {
		},
		
		/**
		 * Event fired when the wizard data is cleared.
		 */
		onClear: function() {
		},

		/**
		 * Returns true if this pane can be selected.  Hidden, disabled, and heading only panes cannot be selected.
		 * 
		 * @return Boolean indicating if the pane can be selected.
		 */
		isSelectable: function() {
			return !this.get("hidden") && !this.get("disabled") && !this.headingOnly;
		},
		
		/**
		 *  Call this method to hide or show the sub-steps.  The _Wizard listens to this event and sets the hidden attribute for all of this step's sub-steps.
		 *  
		 *  @param bool
		 *  	A boolean indicating if this pane's substeps should be hidden or shown.
		 */
		hideSubsteps: function(bool) {
		},
		
		/**
		 *  Call this method to clear the sub-steps.  The _Wizard listens to this event and calls clearData for all of this step's sub-steps.
		 */
		clearSubsteps: function() {
		},

		/**
		 * This method should return the data entered on this pane. Users of this widget can enhance this method to
		 * return the data the user entered in the fields on this pane.
		 * 
		 * @return An object containing the data on this pane.
		 */
		getData: function() {
			return null;
		},
		
		/**
		 * This method set set the data on this pane.  Users of this widget can enhance this method to update the 
		 * UI with the data passed into this method.
		 */
		setData: function(data) {
		}
	});
});
