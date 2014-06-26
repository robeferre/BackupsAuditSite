define([
	"dojo/_base/declare",
	"dojo/has",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_CssStateMixin",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/keys",
    "dojo/_base/event",
    "dojo/has!dojo-bidi?../bidi/form/Link",
    "dojo/text!./templates/Link.html"
], function (dDeclare,			// (dojo/_base/declare)
			 has,				// (dojo/has)
			 dWidget,			// (dijit/_Widget)
			 dTemplatedMixin,		// (dijit/_TemplatedMixin)
			 dCssStateMixin,	// (dijit/_CssStateMixin)
			 dLang,				// (dojo/_base/lang)
			 dDomAttr,			// (dojo/dom-attr) for (dDomAttr.set)
			 dDomClass,			// (dojo/dom-class) for (dDomClass.add)
			 dKeys,				// (dojo/keys)
			 dEvent,			// (dojo/_base/event) for (dEvent.stop),
			 bidiExtension,		// (../bidi/form/Link)
			 templateText) 		// (dojo/text!./templates/Link.html)
{
	/**
	 * @name idx.form.Link
	 * @class Simple link for application to handle as a widget.
	 *	Optional attributes are provided to control disabled and selected states.
	 * @augments dijit._Widget
	 * @augments dijit._TemplatedMixin
	 */
var baseClassName = has("dojo-bidi")? "idx.form.Link_" : "idx.form.Link";
var linkBase = dDeclare(baseClassName, [dWidget,dTemplatedMixin,dCssStateMixin],
		/**@lends idx.form.Link#*/
{
	/**
	 * Template string.
	 * @type String
	 * @private
	 */
	templateString: templateText,

	/**
	 * Alternative text.
   	 * @type String
   	 * @default ""
	 */
	alt: "",
	
	/**
	 * Base CSS class.
   	 * @type String
   	 * @default "idxLink"
	 */
	baseClass: "idxLink",
	
	/**
	 * Derived CSS class.
   	 * @type String
   	 * @default "idxLinkDerived"
	 */
	idxBaseClass: "idxLinkDerived",
	
	/**
	 * Specifies the disabled state.
   	 * @type Boolean
   	 * @default false
	 */
	disabled: false,
	
	/**
	 * Label string.
	 * @type String
	 * @default ""
	 */
	label: "",

	/**
	 * URL for the link.
	 * @type String
	 * @default ""
	 */
	href: "",

	/**
	 * Target for the link.
	 * @type String
	 * @default ""
	 */
	target: "",

	/**
	 * Specifies the selected state.
	 * @type Boolean
	 * @default false
	 */
	selected: false,

	/**
	 * Tab index.
	 * @type Number
	 * @default 0
	 */
	tabIndex: 0,
	
	/**
	 * Stops the click event propagation.
	 * In cases where a click listener is added to a parent and not to the Link
	 * directly you need the event to bubble. For instance, a Link rendered for each
	 * row in a grid, you may want to avoid listeners on each and every link and just
	 * have a single listener on the grid.
	 * @type Boolean
	 * @default false, for backwards compatibility
	 */
	bubbleClickEvent: false,
	
	/**
	 * Attribute map.
	 * @type Object
	 * @private
	 */
	attributeMap: dLang.delegate(dWidget.prototype.attributeMap, {
		label: {node: "linkNode", type: "innerHTML"},
		title: {node: "linkNode", type: "attribute", attribute: "title"}
	}),

	/**
	 * Sets up attributes for the link.
	 * @private as part of widget life cycle
	 */
	postCreate: function(){
		this.inherited(arguments);

		if(this.href && this.href != "javascript:;"){
			dDomAttr.set(this.linkNode, "href", this.href);
		}else if(!this.selected){
			dDomAttr.set(this.linkNode, "href", "javascript:;");
			this.connect(this.linkNode, "onkeypress", this._onKeyPress);
			this.connect(this.linkNode, "onclick", this._onClick);
		}
		if(this.selected){
			dDomClass.add(this.linkNode, "idxLinkSelected");
		}
		if(this.target){
			dDomAttr.set(this.linkNode, "target", this.target);
		}
	},

	/**
	 * Handles focus.
	 */
	focus: function() {
		this.focusNode.focus();
	},

	/**
	 * Updates tabIndex.
	 * @private
	 */
	_setStateClass: function(){
		this.inherited(arguments);

		dDomAttr.set(this.focusNode, "tabIndex", (this.disabled ? -1 : this.tabIndex));
	},

	/**
	 * Handles key press event.
	 * @private 
	 * @param {Object} event
	 */
	_onKeyPress: function(/*Event*/ e) {
		if (this.disabled || e.altKey || e.ctrlKey) {
			return;
		}
		switch (e.charOrCode) {
		case dKeys.ENTER:
		case dKeys.SPACE:
		case " ":
			this.onClick(e);
			if (e && !this.bubbleClickEvent) {
				dEvent.stop(e);
			}
			break;
		default:
				// do nothing
		} 
	},
	
	/**
	 * Handles click event.
	 * @private 
	 * @param {Object} event
	 */
	_onClick: function(/*Event*/ event) {
		if (event && !this.bubbleClickEvent) dEvent.stop(event);
		if (this.disabled) return;
		this.onClick(event);
	},
	
	/**
	 * Callback called when the link is clicked.
	 * @param {Event} event
	 */
	onClick: function(/*Event*/event){
		if (!this.bubbleClickEvent) {
			dEvent.stop(event);			
		}
	}
});
return has("dojo-bidi")? dDeclare("idx.form.Link",[linkBase,bidiExtension]) : linkBase;
});
