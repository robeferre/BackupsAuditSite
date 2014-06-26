define(["dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/when",
		"dijit/_TemplatedMixin",
        "idx/util",
        "idx/string",
        "idx/_PlatformPlugableMixin",
        "idx/PlatformPluginRegistry"],
	   function(dDeclare, dLang, dWhen, dTemplatedMixin, iUtil, iString, iPlatformPlugableMixin, iPlatformPluginRegistry) {
	
	/**
	 * @name idx._MultichannelMixin
	 * @class Provides a mixin for easily working with the idx/MultichannelPluginRegistry.
	 */
	return dDeclare("idx._TemplatePlugableMixin", [iPlatformPlugableMixin],
	/** @lends idx._TemplatePlugableMixin */ 
	{
		/**
		 * Override buildRendering() to set the templateString appropriately before
		 * calling the inherited method.	
		 */
		buildRendering: function() {
			// first time through, cache the original templateString and templatePath
			if (! ("_origTemplateString" in this)) {
				this._origTemplateString = this.templateString;
			}
			if (! ("_origTemplatePath" in this)) {
				this._origTemplatePath = this.templatePath;
			}
			
			// get the platform plugin promise (this is synchronous if widget is not yet started)
			var pluginPromise = this.getPlatformPluginPromise();
			
			// use "when" to get the plugin, but this will happen synchronously if widget is not yet started
			dWhen(pluginPromise, dLang.hitch(this, function(plugin) {
				// we have the plugin, check if it has templateString and/or templatePath
				if (("templateString" in plugin) && (iString.nullTrim(plugin.templateString))) {
					this.templatePath = "";
					this.templateString = plugin.templateString;
					
				} else if (("templatePath" in plugin) && (iString.nullTrim(plugin.templatePath))) {
					this.templateString = "";
					this.templatePath = plugin.templatePath;
					
				} else {
					this.templateString = this._origTemplateString;
					this.templatePath = this._origTemplatePath;
				}
			
			}));
			
			// defer to the inherited function
			this.inherited(arguments);
		},
		
		/**
		 *
		 */
	 	platformPluginChanged: function() {
	 		// TODO: NEED TO IMPLEMENT THIS METHOD TO REBUILD WIDGET WITH NEW TEMPLATE
	 		
	 		// call "supportsRebuild()" function -- if not supported then do nothing here
	 		
	 		// call "preserveComponents" function to preserve supporting
	 		// nodes and widgets (typically move them back to containerNode)
			// default implementation should:	 		
	 		// 		- create this._plugableResetNode as a clone of this.domNode
	 		// 		- place this._plugableResetNode BEFORE this.domNode in DOM
	 		// 		- move contents of this.containerNode to this._plugableResetNode

			// call "detachEvents" function to remove any event handlers against old
			// nodes or widgets that are scheduled for destruction
					 
	 		// destroy rendering via "destroyRendering()" function or similar
	 		
	 		// set this._rendered to false or delete it
	 		
	 		// set this.srcRefNode to this._plugableResetNode
	 		
	 		// change this.templateString (optionally loading new template)
	 		
	 		// call rebuild() or buildRendering() to rebuild the widget
	 		
	 		// call postRecreate() as opposed to postCreate()
	 		
	 		// call restartup() to re-add children from new containerNode
	 	}
		
			
		
	});
	
});