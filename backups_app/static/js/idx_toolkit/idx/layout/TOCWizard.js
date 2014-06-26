/**
 * Licensed Materials - Property of IBM (C) Copyright IBM Corp. 2012 US Government Users Restricted Rights - Use,
 * duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/keys",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"idx/layout/BorderContainer",
	"dijit/form/Button",
	"dijit/layout/ContentPane",
	"dijit/layout/StackContainer",
	"./_Wizard",
	"dojo/text!./templates/TOCWizard.html"
], //
function(declare, //
dArray, //
dLang, //
dAspect, //
dKeys, //
dClass, //
dConstruct, //
dAttr, //
iBorderContainer, //
dButton, //
dContentPane, //
dStackContainer, //
iWizard, //
templateText) {

	/**
	 * @name idx.layout.TOCWizard
	 * @class Provides a widget that is used to display a table of contents wizard.
	 */
	return declare("idx.layout.TOCWizard", [
		iWizard
	], {
		/** @lends idx.layout.TOCWizard.prototype */

		templateString: templateText,
		widgetsInTemplate: true,
		
		/**
		 * Boolean indicating if the table of contents visited nodes are clickable.  Default is false.
		 */
		isVisitedClickable: false,

		/**
		 * Destroy.
		 */
		destroy: function() {
			this._cleanupTOC();
			this.inherited(arguments);
		},

		/**
		 * Startup.
		 */
		startup: function() {
			var started = this._started;
			this.inherited(arguments);
			if (!started) {
				this._renderTOC();
				this._addWizardListeners();
			}
		},
		
		/**
		 * @private Adds wizard listeners.
		 */
		_addWizardListeners: function() {
			this.own(dAspect.after(this, "onVisitChange", dLang.hitch(this, function(pane) {
				var node = this._getTOCNode(pane);
				if (node && pane) {
					if (pane.visited) {
						dClass.add(node, this.baseClass + "Visited"); 
					} else {
						dClass.remove(node, this.baseClass + "Visited"); 
					}
				}
			}), true));
			
			this.own(dAspect.after(this, "onSelect", dLang.hitch(this, function(pane) {
				this._selectTOCNode(pane);
			}), true));
			
			this.own(dAspect.after(this, "onRemove", dLang.hitch(this, function() {
				this._renderTOC();
			}), true));
			
			this.own(dAspect.after(this, "onAdd", dLang.hitch(this, function() {
				this._renderTOC();
			}), true));
		},

		/**
		 * @private Clean up the table of contents.
		 */
		_cleanupTOC: function() {
			var children = this._tocList.getElementsByTagName("li");
			for ( var i = children.length - 1; i >= 0; i--) {
				dConstruct.destroy(children[i]);
			}
		},

		/**
		 * @private Render the table of contents.
		 */
		_renderTOC: function() {
			this._cleanupTOC();
			var selected = this.getSelected();
			dArray.forEach(this.getChildren(), function(child) {
				if (!child.get("hidden")) {
					this._tocList.appendChild(this._createTOCNode(child));
				}
			}, this);
			this._selectTOCNode(selected);
		},

		/**
		 * @private Create the node to display in the table of contents.
		 */
		_createTOCNode: function(pane) {
			var node = dConstruct.create("li", {
				"class": this.baseClass + "NavListItem",
				"tabindex": 0
			});
			dAttr.set(node, "paneId", pane.id);

			if (pane.get("disabled")) {
				dClass.add(node, this.baseClass + "Disabled");
			}
			if (pane.substep) {
				dClass.add(node, this.baseClass + "Substep");
			}
			if (pane.visited) {
				dClass.add(node, this.baseClass + "Visited");
			}
			if (pane.labelClass) {
				dClass.add(node, pane.labelClass);
			}

			node.appendChild(dConstruct.create("span", {
				"class": this.baseClass + "Icon"
			}));
			node.appendChild(dConstruct.create("span", {
				"class": this.baseClass + "Text",
				"innerHTML": pane.label || ""
			}));
			
			if (this.isVisitedClickable) {
				this.own(dAspect.after(node, "onclick", dLang.hitch(this, function(evt) {
					this._selectNode(evt.target);
				}), true));
				
				this.own(dAspect.after(node, "onkeypress", dLang.hitch(this, function(evt) {
					if (evt.type != "click" && evt.charCode == dKeys.SPACE) {
						this._selectNode(evt.target);
					}
				}), true));
			}
			return node;
		},
		
		/**
		 * @private Select the node.
		 */
		_selectNode: function(node) {
			while (node) {
				var paneId = dAttr.get(node, "paneId");
				if (paneId) {
					if (dClass.contains(node, this.baseClass + "Visited")) {
						this._select(this._getPaneWithId(paneId));
					}
					break;
				}
				node = node.parentNode;
			}
		},

		/**
		 * @private Select the table of contents node and marks it visited.
		 */
		_selectTOCNode: function(pane) {
			if (pane) {
				dArray.forEach(this._tocList.getElementsByTagName("li"), function(node) {
					if (pane.id == dAttr.get(node, "paneId")) {
						dClass.add(node, this.baseClass + "Selected");
						dClass.add(node, this.baseClass + "Visited");
						this._toc.domNode.scrollTop = node.offsetTop;
					} else {
						dClass.remove(node, this.baseClass + "Selected");
					}
				}, this);
			}
		},
		
		/**
		 * @private Return the table of contents node.
		 */
		_getTOCNode: function(pane) {
			if (pane) {
				var children = this._tocList.getElementsByTagName("li");
				for ( var i = 0; i < children.length; i++) {
					var node = children[i];
					if (pane.id == dAttr.get(node, "paneId")) {
						return node;
					}
				}
			}
			return null;
		}
	});
});
