define([
	"dojo/_base/declare",
	"dojo/_base/html",
	"dojo/_base/event",
	"dojo/keys",
	"idx/form/DropDownLink",
	"dojo/text!./templates/ComboLink.html"
], function(dojo_declare, dojo_html, dojo_event, dojo_keys, idx_form_DropDownLink, templateString){

/**
 * @name idx.form.ComboLink
 * @class Link with own action and a drop-down menu. Alternative for dijit.form.ComboButton with "link" style.
 * @augments idx.form.DropDownLink
 */
return dojo_declare("idx.form.ComboLink", idx_form_DropDownLink,
/**@lends idx.form.ComboLink#*/
{
	/**
	 * Base CSS class.
	 * @type String
	 * @default "idxComboLink"
	 */
	baseClass: "idxComboLink",
	
	/**
	 * Template string.
	 * @type String
	 * @private
	 */
	templateString: templateString,

	/**
	 * Sets up event handlers.
	 * @private as part of widget life cycle
	 */
	postCreate: function() {
		this.inherited(arguments);
		
		this.connect(this._buttonNode, "onkeypress", "_onKey");
		this.connect(this._buttonNode, "onkeyup", "_onKeyUp");
	},
	
	/**
	 * Updates tabIndex.
	 * @private
	 */
	_setStateClass: function(){
		this.inherited(arguments);

		dojo_html.attr(this._buttonNode, "tabIndex", (this.disabled ? -1 : this.tabIndex));
	},

	/**
	 * Override since Dojo 1.6 dijit._HasDropDown listens for key events
	 * on the focus node to activate the drop down instead of the _buttonNode.
	 * @private
	 * @param {Event} e
	 */
	_onKey: function(e) {
		// ignore the vent if disabled or modifier keys are pressed
		if (this.disabled || e.altKey || e.ctrlKey) {
			return;
		}
		
		// on the focus node, only the down arrow is allowed to activate
		// the drop-down -- not the space or enter key (problem in Dojo 1.6)
		if (e.target == this.focusNode && e.charOrCode != dojo_keys.DOWN_ARROW) {
			return;
		}
		this._lastFocusedNode = e.target;
		this.inherited(arguments);
	},
	
	/**
	 * Override since Dojo 1.7 upper dijit._HasDropDown listens for key events
	 * on the focus node to activate the drop down instead of the _buttonNode.
	 * @private
	 * @param {Event} e
	 */
	_onKeyUp: function(e) {
		// ignore the vent if disabled or modifier keys are pressed
		if (this.disabled || e.altKey || e.ctrlKey) {
			return;
		}
		
		// on the focus node, only the down arrow is allowed to activate
		// the drop-down -- not the space or enter key (problem in Dojo 1.6)
		if (e.target == this.focusNode && e.charOrCode != dojo_keys.DOWN_ARROW) {
			return;
		}
		this.inherited(arguments);
	},

	/**
	 * Handles focus.
	 */
	focus: function() {
		if (this._lastFocusedNode) {
			this._lastFocusedNode.focus();
		} else {
			this.focusNode.focus();
		}
	}
});

});
