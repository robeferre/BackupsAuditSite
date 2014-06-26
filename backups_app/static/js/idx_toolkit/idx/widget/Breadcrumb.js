define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/html",
	"dijit/registry",
	"dijit/_Widget",
	"dijit/_TemplatedMixin"
], function(dojo_declare, dojo_lang, dojo_html, dijit_registry, dijit_Widget, dijit_TemplatedMixin){
	var iWidget = dojo_lang.getObject("idx.widget", true);

/**
 * @name idx.widget.Breadcrumb
 * @class Breadcrumb dynamically growing or shrinking
 * @augments dijit._Widget
 * @augments dijit._TemplatedMixin
 */
var Breadcrumb = dojo_declare(
	"idx.widget.Breadcrumb",
	[dijit_Widget, dijit_TemplatedMixin],
/**@lends idx.widget.Breadcrumb#*/
	{
		templateString: '<div class="idxBreadcrumb"><div dojoAttachPoint="containerNode"></div></div>',

		/**
		 * Holds members.
		 * @type Array
		 * @default null
		 */
		breadcrumbs: null,
		_separatorClass: "idx.widget._Separator",

		/**
		 * Initializes member array.
	 	 * @private as part of widget life cycle
		 */
		postCreate: function() {
			this.inherited(arguments);
			this.breadcrumbs = [ ];
		},

		/**
		 * Invalidates member array.
	 	 * @private as part of widget life cycle
		 */
		destroy: function() {
			this.inherited(arguments);
			this.breadcrumbs = null;
		},

		/**
		 * Removes a member.
		 * @param {Widget} bc
		 */
		pop: function(bc) {
			if(this.breadcrumbs.length == 0) {
				return;
			}
			var doPop = true;
			while(doPop) {
				var cbc = this.breadcrumbs.pop();
				if(cbc == bc) {
					this.breadcrumbs.push(cbc);
					break;
				}
				if(this.breadcrumbs.length > 1) {
					this.breadcrumbs.pop();
				}
				if(!bc) {
					doPop = false;
				}
			}
			this._refresh();
		},

		/**
		 * Adds a new member.
		 * @param {Widget} bc
		 */
		push: function(bc) {
			if(this.breadcrumbs && this.breadcrumbs.length > 0) {
				var sp = this._generateSeparator();
				this.breadcrumbs.push(sp);
			}
			this.breadcrumbs.push(bc);
			this._refresh();
		},

		/**
		 * Creates a separator.
		 * @private
		 */
		_generateSeparator: function() {
			var className = dojo_lang.getObject(this._separatorClass);
			var sp = new className();
			return sp;
		},

		/**
		 * Destroys widgets.
		 * @private
		 */
		_clearContent: function() {
			var ws = dijit_registry.findWidgets(this.containerNode);
			for(i in ws) {
				var w = ws[i];
				if(w.destroy) {
					w.destroy();
				}
			}
			this.containerNode.innerHTML = "";
		},

		/**
		 * Renders members.
		 * @private
		 */
		_renderItems: function() {
			var _this = this;
			for(var i=0; i<this.breadcrumbs.length; i++) {
				var bc = this.breadcrumbs[i];
				var isSeparator = bc.isSeparator;
				this._renderItem(bc, !isSeparator && i != this.breadcrumbs.length - 1);
			}
		},

		/**
		 * Render a member
		 * @param {Objec} bc
		 * @param {Boolean} isClickable
		 * @private
		 */
		_renderItem: function(bc, isClickable) {
			var itemNode;
			var _this = this;
			if(isClickable) {
				itemNode = dojo_html.create("A", {
					href: "javascript:;"
				});
				dojo_html.addClass(itemNode, "dijitInline idxBreadcrumbItem idxBreadcrumbItemClickable");
				bc.connect(itemNode, "onclick", function(e) {
					_this.pop(bc);
					if(bc.onClick) {
						bc.onClick(e);
					}
				});
			} else {
				itemNode = dojo_html.create("SPAN", {
					
				});
				dojo_html.addClass(itemNode, "dijitInline idxBreadcrumbItem");
			}
			itemNode.appendChild(bc.render());
			this.containerNode.appendChild(itemNode);
		},

		/**
		 * Refreshes members.
		 * @private
		 */
		_refresh: function() {
			this._clearContent();
			this._renderItems();
		}
	}
);

/**
 * @name idx.widget._Separator
 * @class Simple breadcrumb separator.
 * @augments dijit._Widget
 */
Breadcrumb.Separator = dojo_declare(
	"idx.widget._Separator",
	[dijit_Widget],
/**@lends idx.widget._Separator#*/
	{
		/**
		 * Indicates this widget is separator.
		 * @type Boolean
		 * @default true
		 */
		isSeparator: true,
		res: null,

		/**
		 * Initializes resource.
		 */
		postMixInProperties: function() {
			this.inherited(arguments);
			this.res = {
				arrowSeparater: " <span class='altText'> &gt; </span> "
			};
		},

		/**
		 * Render a separator.
		 */
		render: function() {
			var div = dojo_html.create("DIV", { "class": "separator",
				innerHTML: this.res.arrowSeparater
			});
			return div;
		}
	}
);

/**
 * @name idx.widget._SimpleBreadcrumb
 * @class Simple breadcrumb member.
 * @augments dijit._Widget
 */
Breadcrumb.Crumb = dojo_declare(
	"idx.widget._SimpleBreadcrumb",
	[dijit_Widget],
/**@lends idx.widget._SimpleBreadcrumb#*/
	{
		/**
		 * Label string.
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
		 * Renders a member.
		 */
		render: function() {
			var div = dojo_html.create("DIV", {
				innerHTML: this.label,
				title: this.title
			});
			return div;
		},

		/**
		 * Callback to be called on click.
		 * @param {Object} e
		 */
		onClick: function(e) {
			
		}
	}
);

iWidget.ECMBreadcrumb = Breadcrumb;

return Breadcrumb;

});
