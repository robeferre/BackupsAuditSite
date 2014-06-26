define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/query",
	"dijit/registry",
	"dijit/popup",
	"dijit/_HasDropDown",
	"dijit/_Container",
	"idx/form/Link",
	"dojo/text!./templates/DropDownLink.html"
], function(dojo_declare, dojo_lang, dojo_query, dijit_registry, dijit_popup, dijit_HasDropDown, dijit_Container, idx_form_Link, templateString){

/**
 * @name idx.form.DropDownLink
 * @class Link with a drop-down menu. Alternative for dijit.form.DropDownButton with "link" style.
 * @augments idx.form.Link
 * @augments dijit._Container
 * @augments dijit._HasDropDown
 */
return dojo_declare("idx.form.DropDownLink", [idx.form.Link, dijit_Container, dijit_HasDropDown],
		/**@lends idx.form.DropDownLink#*/
		{
			/**
	 		 * Base CSS class.
   	 		 * @type String
   	 		 * @default "idxDropDownLink"
   	 		 */
			baseClass: "idxDropDownLink",
			
			/**
	 		 * Template string.
   	 		 * @type String
   	 		 * @private
   	 		 */
			templateString: templateString,
			
			/**
	 		 * Drop-down widget.
   	 		 * @type Widget
   	 		 * @default null
   	 		 */
			dropDown: null,

			/**
			 * Saves pointer to original DOM to get dropdown later.
			 * @private
			 * @param {Element} src
			 */
			_fillContent: function(src) {
				// do not fill any content.  my only child is the dropdown
				// filling content causes layout issue in webkit
				this._ddContainer = src;
			},
			
			/**
			 * Sets up the drop down menu.
			 * @private as part of widget life cycle
			 */
			startup: function() {
				if (this._started) return;
				this.dropDown = this.dropDown || this._getDropDown();
				if (this.dropDown) {
					if (dijit_popup.hide) {
						// for 1.6+
						dijit_popup.hide(this.dropDown);
					} else {
						// for ~1.5
						dijit_popup.moveOffScreen(this.dropDown.domNode);	
					}
				}
				this.inherited(arguments);
			},
			
			/**
			 * Gets drop down widget from saved pointer to original DOM
			 * @private
			 */
			_getDropDown: function() {
				// find drop down widget node
				var ddNode = dojo_query("[widgetId]", this._ddContainer)[0];
				return (ddNode ? dijit_registry.byNode(ddNode) : null);
			},

			/**
			 * Handles focus.
			 */
			focus: function() {
				this.focusNode.focus();
			}			
		});

});
