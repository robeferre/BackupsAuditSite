define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-class",
	"dijit/popup",
	"dijit/_HasDropDown",
	"dijit/_Container",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/MenuItem",
	"idx/ext",
	"dojo/text!./templates/DropDownSelect.html"
], function(dojo_declare, dojo_lang, dojo_array, dojo_domclass, dijit_popup, dijit_HasDropDown, dijit_Container, dijit_Widget, dijit_TemplatedMixin, dijit_MenuItem, idx_ext, templateString){

/**
 * @name idx.form.DropDownSelect
 * @class Selection text with a drop down menu. Alternative for dijit.form.Select with plain text style.
 * @augments dijit._Widget
 * @augments dijit._TemplatedMixin
 * @augments dijit._Container
 * @augments dijit._HasDropDown
 */
var DropDownSelect = dojo_declare("idx.form.DropDownSelect",
	[dijit_Widget, dijit_TemplatedMixin, dijit_Container, dijit_HasDropDown],
/**@lends idx.form.DropDownSelect#*/
{
	/**
	 * The base CSS class for this widget. 
	 */
	baseClass: "idxDropDownSelect",
	
	/**
	 * Template string.
	 * @type String
	 * @private
	 */
	templateString: templateString,

	/**
	 * Initial label string.
	 * @type String
	 * @default ""
	 */
	label: "",

	/**
	 * Tooltip text.
	 * @type String
	 * @default ""
	 */
	title: "",
	
	/**
	 * Drop-down widget.
	 * @type Widget
	 * @default null
	 */
	dropDown: null,

	/**
	 * Disabled flag.
	 * @type Boolean
	 * @default false
	 */
	disabled: false,
	
	/**
	 * Attribute map.
	 * @type Object
	 * @private
	 */
	attributeMap: dojo_lang.delegate(dijit_Widget.prototype.attributeMap, {
		label: {node: "labelNode", type: "innerHTML"},
		title: {node: "labelNode", type: "attribute", attribute: "title"}
	}),

	/**
	 * Override to set "disabled" CSS class.
	 */
	_setDisabledAttr: function(value) {
		this.disabled = value;
		if (this.disabled) {
			dojo_domclass.add(this.domNode, ["dijitDisabled", this.baseClass + "Disabled"]);
		} else {
			dojo_domclass.remove(this.domNode, ["dijitDisabled", this.baseClass + "Disabled"]);
		}
	},
	
	/**
	 * Sets up the drop down menu.
	 * @private as part of widget life cycle
	 */
	startup: function() {
		if (this._started) return;

		this.inherited(arguments);
		
		this.dropDown = this.dropDown || this.getChildren()[0];
		if (this.dropDown) {
			dijit_popup.moveOffScreen(this.dropDown);
			var findMenu = dojo_lang.hitch(this, function(item) {
				if (item.onItemClick) {
					this.connect(item, "onItemClick", "_onItemClick");
				}
				if (item.popup) {
					findMenu(item.popup);
				}
				if (item.getChildren) {
					var children = item.getChildren();
					dojo_array.forEach(children, function(child) {
						findMenu(child);
					}, this);
				}
			});
			findMenu(this.dropDown);
		}
	},

	/**
	 * Handles focus.
	 */
	focus: function() {
		this.focusNode.focus();
	},

	/**
	 * Callback to be called on selection change.
	 * @param {Widget} item
	 */
	onSelect: function(item) {

	},

	/**
	 * Updates label and invoke a callback on a menu item clicked.
	 * @param {Object} item
	 * @param {Object} evt
	 * @private
	 */
	_onItemClick: function(/* MenuItem */ item, evt) {
		if (item.popup) {
			// this item has children - don't do anything
			return;
		}
		
		var selectedLabel = item.get("selectedLabel");
		if (selectedLabel && selectedLabel != "") {
			this.set("label", selectedLabel);
		}
		
		this.onSelect(item);
	}
});

dojo_lang.extend(dijit_MenuItem, {
	selectedLabel: "",
	
	_getSelectedLabelAttr: function() {
		var l = this.selectedLabel != "" ? this.selectedLabel : this.label;
		return l;
	}
});

return DropDownSelect;

});
