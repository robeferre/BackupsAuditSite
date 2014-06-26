define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/window",
	"dojo/_base/html",
	"dojo/_base/event",
	"dojo/_base/connect",
	"dojo/keys",
	"dijit/registry",
	"dijit/layout/ContentPane",
	"idx/html",
	"idx/util",
	"idx/layout/_DockAreaMixin"
], function(dojo_declare, dojo_lang, dojo_array, dojo_window, dojo_html, dojo_event, dojo_connect, dojo_keys, dijit_registry, dijit_layout_ContentPane, idx_html, idx_util, idx_layout__DockAreaMixin){
/**
 * @name idx.layout.DockContentPane
 * @class Simple dock area based on ContentPane
 * @augments dijit.layout.ContentPane
 * @augments idx.layout._DockAreaMixin
 */
return dojo_declare("idx.layout.DockContentPane", [dijit_layout_ContentPane, idx_layout__DockAreaMixin],
/**@lends idx.layout.DockContentPane#*/
{
	/**
	 * Resizes children.
	 */
	resize: function() {
		this.inherited(arguments);
		var children = this.getChildren();
		var w = dojo_html.contentBox(this.domNode).w;
		dojo_array.forEach(children, function(child) {
			if (child.resize) {
				child.resize({w: w});
			} else {
				dojo_html.marginBox(child.domNode, {w: w});
			}
		});
	},

	/**
	 * Docks dockable widget and resizes it.
	 * @param {Widget} dockable
	 * @param {Object} pos
	 */
	dock: function(dockable, pos) {
		this.inherited(arguments);
		this.resize();
	}
});
});
