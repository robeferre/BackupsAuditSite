define(["dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/aspect",
		"dojo/dom-construct",
		"dojo/dom-attr",
		"dijit/registry",
		"dojox/app/View",
		"idx/string"],
	function(dDeclare, 
			 dLang, 
			 dAspect, 
			 dDomConstruct,
			 dDomAttr,
			 dRegistry,
			 dView,
			 iString) {
			 
	return dDeclare("idx.app.View", dView, {
		/**
		 * Constructor.
		 */
		constructor: function(params) {
			// mixin the actual view config
			var viewConfig = this.app._getViewConfig(this.parent, this.name);
			var overrides = null;
			if (viewConfig) {
				// mixin the view config
				dLang.mixin(this, viewConfig);
			}
			
			// make sure to replace the DOM structur of the template before destruction
			dAspect.before(this, "destroy", dLang.hitch(this, function() {
				if (this._templateDomNode) {
					dDomConstruct.place(this.domNode, this._templateDomNode);
					this.domNode = this._templateDomNode;
				}
			}));
		},
		
		/**
		 * Override "buildRendering()" to check for a widget
		 * at the root of the template.
		 */
		buildRendering: function() {
			// add a wrapper DIV around the template string to allow the
			// entire template to be a widget
			this.templateString = "<div>" + this.templateString + "</div>";
			this.inherited(arguments);
			
			// get the wrapper node and save it
			this._templateDomNode = this.domNode;
			
			// take the first child node and make it the dom node
			var firstChild = this.domNode.firstChild;
			this.domNode.removeChild(firstChild);
			this.domNode = firstChild;
		}
	});
			 
});