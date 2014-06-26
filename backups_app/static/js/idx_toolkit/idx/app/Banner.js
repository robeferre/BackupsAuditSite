define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/sniff",
	"dojo/aspect",
	"dojo/dom-style",
	"dojo/_base/array",
	"dijit/_Widget",
	"dijit/_Container",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/form/DropDownButton",
	"dijit/form/Button",
	"dijit/Menu",
	"dijit/MenuItem",
	"idx/util",
	"idx/string",
	"idx/resources",
	"dojo/has!dojo-bidi?../bidi/app/Banner",
	"dojo/text!./templates/Banner.html",
	"dojo/i18n!./nls/base",
	"dojo/i18n!./nls/ConsoleLayout"
], function(dojo_declare, dojo_lang, has, dojo_aspect, dojo_dom_style, dojo_array, dijit_Widget, dijit_Container, dijit_TemplatedMixin, dijit_WidgetsInTemplateMixin, dijit_form_DropDownButton, dijit_form_Button, dijit_Menu, dijit_MenuItem, idx_util, idx_string, idx_resources, bidiExtension, templateString){

var placeHolder = new function() {};

/**
 * @name idx.app.Banner
 * @class Application banner with built-in and custom links.
 * @augments dijit._Widget
 * @augments dijit._Container
 * @augments dijit._TemplatedMixin
 * @augments dijit._WidgetsInTemplateMixin
 */
var baseClassName = has("dojo-bidi")? "idx.app.Banner_" : "idx.app.Banner";
var Banner = dojo_declare(baseClassName, [ dijit_Widget, dijit_Container, dijit_TemplatedMixin, dijit_WidgetsInTemplateMixin ],
/** @lends idx.app.Banner# */
{
	/**
	 * Template string.
	 * @type String
	 * @private
	 */
	templateString: templateString,

	/**
	 * Label string for username.
	 * 
	 * @type String
	 * @default ""
	 */
	usernameLabel: "",

	/**
	 * Username.
	 * 
	 * @type String
	 * @default ""
	 */
	username: "",

	/**
	 * Label string for log out link.
	 * 
	 * @type String
	 * @default "Log out"
	 */
	logoutLabel: "",

	/**
	 * Function to call when the user clicks the log out menu item.
	 * 
	 * @type Function
	 * @default null
	 */
	logoutFunc: placeHolder,

	/**
	 * Label string for help link.
	 * 
	 * @type String
	 * @default "Help"
	 */
	helpLabel: "",

	/**
	 * Function to call when the user clicks the help button.
	 * 
	 * @type Function
	 * @default null
	 */
	helpFunc: placeHolder,

	/**
	 * Label string for about link.
	 * 
	 * @type String
	 * @default "About"
	 */
	aboutLabel: "",

	/**
	 * Function to call when the user clicks the about menu item.
	 * 
	 * @type Function
	 * @default null
	 */
	aboutFunc: placeHolder,

	/**
	 * 
	 */
	vendorName: "IBM",
	
	/**
	 *
	 */
	_setVendorNameAttr: function(name) {
		this.vendorName = name;
		this.logoTextNode.innerHTML = this.vendorName;
	},
	
	/**
	 * 
	 */
	postMixInProperties: function() {
	    idx_util.nullify(this, this.params, ["helpFunc", "aboutFunc", "logoutFunc"]);
		this.inherited(arguments);
	},
	
	/**
	 * Creates a trailer section.
	 * @private as part of widget life cycle
	 */
	buildRendering: function() {
		var resources = idx_resources.getResources("idx/app/ConsoleLayout", this.lang);
		if(!this.logoutLabel){
			this.logoutLabel = resources.logout;
		}
		if(!this.helpLabel){
			this.helpLabel = resources.help;
		}
		if(!this.aboutLabel){
			this.aboutLabel = resources.about;
		}

		this.inherited(arguments);

		this._actionsMenuItemCount = 0;
		this.helpButton.set("label", this.helpLabel);
		dojo_dom_style.set(this.actionsButton.domNode, {display: 'none', visibility: 'hidden'});
		dojo_dom_style.set(this.helpButton.domNode, {display: 'none', visibility: 'hidden'});
		dojo_aspect.after(this.actionsMenu, "addChild", dojo_lang.hitch(this, "_onActionMenuAddChild"));
		dojo_aspect.after(this.actionsMenu, "removeChild", dojo_lang.hitch(this, "_onActionMenuRemoveChild"));
	},

	/**
	 *
	 */
	_setUsernameAttr: function(value) {
		this.username = value;
		this._updateActionsButtonDisplay();
	},
	
	/**
	 *
	 */
	_setUsernameLabelAttr: function(value) {
		this.usernameLabel = value;
		this._updateActionsButtonDisplay();
	},
	
	/**
	 *
	 */
	_updateActionsButtonDisplay: function() {
		var label = idx_string.nullTrim(this.usernameLabel);
		if (!label) label = idx_string.nullTrim(this.username);
		this.actionsButton.set("label", (label ? label : ""));
		if (label || this._actionsMenuItemCount > 0) {
			dojo_dom_style.set(this.actionsButton.domNode, {display: '', visibility: 'visible'});
		} else {
			this._actionsMenuItemCount = 0;
			dojo_dom_style.set(this.actionsButton.domNode, {display: 'none', visibility: 'hidden'});
		}		
	},
	
	/**
	 *
	 */
	_setLogoutFuncAttr: function(value) {
		if (this._logoutItemValue === value) return;
		this.logoutFunc = value;
		if (this._logoutItem) {
			this.actionsMenu.removeChild(this._logoutItem);
			this._logoutItem.destroy();
			this._logoutItem = null;
		}
		if (this.logoutFunc && this.logoutFunc !== placeHolder) {
			this._logoutItem = new dijit_MenuItem({
				label: this.logoutLabel,
				onClick: this.logoutFunc
			});
			this._logoutItemValue = value;
			this.actionsMenu.addChild(this._logoutItem);
		}		
	},
	
	/**
	 *
	 */
	_setAboutFuncAttr: function(value) {
		if (this._aboutItemValue === value) return;
		this.aboutFunc = value;
		if (this._aboutItem) {
			this.actionsMenu.removeChild(this._aboutItem);
			this._aboutItem.destroy();
			this._aboutItem = null;
		}
		if (this.aboutFunc && this.aboutFunc !== placeHolder) {
			this._aboutItem = new dijit_MenuItem({
				label: this.aboutLabel,
				onClick: this.aboutFunc
			});
			this._aboutItemValue = value;
			this.actionsMenu.addChild(this._aboutItem);
		}		
	},
	
	/**
	 *
	 */
	_setHelpFuncAttr: function(value) {
		this.helpFunc = value;
		if (this.helpFunc && this.helpFunc !== placeHolder) {
			this.helpButton.onClick = this.helpFunc;
			dojo_dom_style.set(this.helpButton.domNode, {display: '', visibility: 'visible'});
		} else {			
			dojo_dom_style.set(this.helpButton.domNode, {display: 'none', visibility: 'hidden'});
		}
	},
	
	
	/**
	 * 
	 */
	_onActionMenuAddChild: function() {
		this._actionsMenuItemCount++;
		this._updateActionsButtonDisplay();
	},
	
	/**
	 * 
	 */
	_onActionMenuRemoveChild: function() {
		this._actionsMenuItemCount--;
		this._updateActionsButtonDisplay();		
	},
	
	/**
	 * Adds items to the action menu drop-down.
	 * 
	 * @param {Array} actionMenusItems 
	 *				An array of dijit.MenuItem objects to add to the action menu drop-down.
	 */
	addMenuItems: function(actionMenusItems) {
		if (actionMenusItems && actionMenusItems.length > 0) {
			var self = this;

			dojo_array.forEach(actionMenusItems, function(actionMenuItem) {
				self.actionsMenu.addChild(actionMenuItem);
			});
		}
	}
});
return has("dojo-bidi")? dojo_declare("idx.app.Banner",[Banner,bidiExtension]) : Banner;
});
