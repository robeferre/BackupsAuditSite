define(["dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/when",
		"dojo/aspect",
		"dojo/dom-class",
        "idx/util",
        "idx/string",
        "idx/PlatformPluginRegistry"],
	   function(dDeclare, dLang, dWhen, dAspect, dDomClass, iUtil, iString, iMPR) {
	
	/**
	 * @name idx._PlatformPlugableMixin
	 * @class Provides a mixin for easily working with the idx/PlatformPluginRegistry.
	 */
	return dDeclare("idx._PlatformPlugableMixin", [],
	/** @lends idx._PlatformPlugableMixin */ 
	{
		/**
		 * The target platform for this widget.  This defaults to 
		 * empty-string, which means it uses the global setting.
		 * @default ""
		 */
		targetPlatform: "",
		
		/**
		 * The idx/PlatformPluginRegistry to be used by this instance.
		 * 
		 * @default null
		 */
		pluginRegistry: null,

		/**
		 * Constructor.
		 */
		constructor: function(args, refNode) {
			this.own(dAspect.after(this, "postMixInProperties", dLang.hitch(this, function() {
				// check if the original base classes have been recorded
				if (! ("_origBaseClass" in this)) {
					this._origBaseClass = this.baseClass;
				}
				if (! ("_origIDXBaseClass" in this)) {
					this._origIDXBaseClass = this.idxBaseClass;
				}				
			})));
			this.own(dAspect.after(this, "buildRendering", dLang.hitch(this, function() {
				this._updatePlatformClasses();
			})));
		},
		
		/**
		 * Sets the global default target platform for all registries.
		 *
		 * @param platform The target platform which must be one of 
		 *                 "desktop", "tablet", "mobile" or "auto".
		 */
		setGlobalTargetPlatform: function(platform) {
			iMPR.setGlobalTargetPlatform(platform);
		},
		
		/**
		 * Returns the global default target platform for all registries.
		 * The returned value is one of "desktop", "tablet", "mobile" or "auto".
		 *
		 * @return The global default target platform for all registries. 
		 */
		getGlobalTargetPlatform: function(platform) {
			return iMPR.getGlobalTargetPlatform();
		},
		
		/**
		 * Setter for _targetPlatform
		 * @private
		 */
		_setTargetPlatformAttr: function(platform) {
			// determine the old platform
			var oldPlatform = this.getTargetPlatform();
			
			// set the target platform
			this.targetPlatform = platform;
			
			// store the normalized current target platform
			var currentPlatform = this._targetPlatform;
			
			// set the normalized current target platform
			this._targetPlatform = iString.nullTrim(platform);
			
			// check if the old and local platform are the same
			if (oldPlatform == this._targetPlatform) return;
			
			// get the new plugin 
			var newPlugin = this.pluginRegistry.getPlugin(this);
			if ((!("_plugin" in this)) || (this._plugin === undefined) || (this._plugin !== newPlugin)) {
				this._newPlugin = newPlugin;
				
				var promise = this.platformPluginChanged();
				dWhen(promise, dLang.hitch(this, function() {
					this._updatePlatformClasses();
				}));
				
			} else {
				this._updatePlatformClasses();
			}
		},
		
		/**
		 * Updates the baseClass and idxBaseClass to whatever is defined in the
		 * current plugin after the this._plugin promise is resolved.  If the 
		 * plugin does not have a baseClass or idxBaseClass or if they do not 
		 * differ from the current one then this method does nothing.
		 * 
		 * This method returns a promise indicating when it completes beause the
		 * this._plugin is a promise that may not yet be resolved when this method
		 * is called.
		 */
		_updateBaseClasses: function() {
			// do nothing if we don't have a plugin promise yet
			if (! this._plugin) return;
			if (! this.domNode) return;
			
			return dWhen(this._plugin, dLang.hitch(this, function(plugin) {
				// apply a new baseClass or restore the original
				if (plugin && ("baseClass" in plugin) && plugin.baseClass) {
					// plugin has a baseClass, check if the base classes differ
					if (((this.baseClass === undefined) && (plugin.baseClass)) || (this.baseClass != plugin.baseClass)) {
						// if base classes differ then swap
						if (this.baseClass) {
							dDomClass.replace(this.domNode, plugin.baseClass, this.baseClass);
						} else {
							dDomClass.add(this.domNode, plugin.baseClass);
						}
						this.baseClass = plugin.baseClass;
					}
				} else if (this.baseClass != this._origBaseClass) {
					// no baseClass in plugin, but current does not match original (restore)
					dDomClass.replace(this.domNode, this._origBaseClass, this.baseClass);
					this.baseClass = this._origBaseClass;
				}
			
				// apply a new idxBaseClass or restore the original
				if (plugin && ("idxBaseClass" in plugin) && plugin.idxBaseClass) {
					// plugin has a idxBaseClass, check if the base classes differ
					if (((this.idxBaseClass === undefined) && plugin.idxBaseClass) || (this.idxBaseClass != plugin.idxBaseClass)) {
						// if base classes differ then swap
						if (this.idxBaseClass) {
							dDomClass.replace(this.domNode, plugin.idxBaseClass, this.idxBaseClass);
						} else {
							dDomClass.add(this.domNode, plugin.idxBaseClass);
						}
						this.idxBaseClass = plugin.idxBaseClass;
					}
				} else if (this.idxBaseClass != this._origIDXBaseClass) {
					// no idxBaseClass in plugin, but current does not match original (restore)
					dDomClass.replace(this.domNode, this._origIDXBaseClass, this.idxBaseClass);
					this.idxBaseClass = this._origIDXBaseClass;
				}
			}));
		},
		
		/**
		 * Updates the platform-specific CSS classes for the widget's DOM node.
		 * 
		 */
		_updatePlatformClasses: function() {
			if (! this.domNode) return;
			var promise = this._updateBaseClasses();
			return dWhen(promise, dLang.hitch(this, function() {
				var platform = this.getTargetPlatform();
				var bc = this.baseClass;
				var removeClasses = null;
				var addClasses = null;
				var ibc = iString.nullTrim(this.idxBaseClass);
				var prevBC = this._prevBaseClass ? this._prevBaseClass : this.baseClass;
				var prevIBC = this._prevIDXBaseClass ? this._prevIDXBaseClass : this.idxBaseClass;
			
				switch (platform) {
				case "desktop":
					removeClasses = [ "idxPlatform_tablet", "idxPlatform_phone", "idxPlatform_mobile",
					                  prevBC + "_tablet", prevBC + "_phone", prevBC + "_mobile" ];
					addClasses = [ "idxPlatform_desktop", bc + "_desktop" ];
				
					if (prevIBC) {
						removeClasses.push(prevIBC + "_tablet");
						removeClasses.push(prevIBC + "_phone");
						removeClasses.push(prevIBC + "_mobile");
					}
					if (ibc) {
						addClasses.push(ibc + "_desktop");
					}
				
					break;
				
				case "tablet":
					removeClasses = [ "idxPlatform_desktop", "idxPlatform_phone", prevBC + "_desktop", prevBC + "_phone" ];
					addClasses = [ "idxPlatform_tablet", "idxPlatform_mobile", bc + "_tablet", bc + "_mobile" ];
					if (prevIBC) {
						removeClasses.push(prevIBC + "_desktop");
						removeClasses.push(prevIBC + "_phone");
					}
					if (ibc) {
						addClasses.push(ibc + "_tablet");
						addClasses.push(ibc + "_mobile");
					}
					break;
				case "phone":
					removeClasses = [ "idxPlatform_desktop", "idxPlatform_tablet", prevBC + "_desktop", prevBC + "_tablet" ];
					addClasses = [ "idxPlatform_phone", "idxPlatform_mobile", bc + "_phone", bc + "_mobile" ];
					if (prevIBC) {
						removeClasses.push(prevIBC + "_desktop");
						removeClasses.push(prevIBC + "_tablet");
					}
					if (ibc) {
						addClasses.push(ibc + "_phone");
						addClasses.push(ibc + "_mobile");					
					}
			
					break;
				default:
					removeClasses = [ "idxPlatform_desktop", "idxPlatform_tablet", "idxPlatform_phone", "idxPlatform_mobile", 
					                  prevBC + "_desktop", prevBC + "_tablet", prevBC + "_phone", prevBC + "_mobile" ];
					addClasses = [];
					if (prevIBC) {
						removeClasses.push(prevIBC + "_desktop");
						removeClasses.push(prevIBC + "_tablet");
						removeClasses.push(prevIBC + "_phone");
						removeClasses.push(prevIBC + "_mobile");					
					}
				}

				// record the base classes as they are now
				this._prevBaseClass = this.baseClass;
				this._prevIDXBaseClass = this.idxBaseClass;

				// replace the CSS classes
				dDomClass.replace(this.domNode, addClasses, removeClasses);
			}));
		},
		
		/**
		 * Resolves the target platform target platform to use which is computed from the platform
		 * that is set specifically for this widget as well as the registry-default and 
		 * global-default platform. 
		 */
		getTargetPlatform: function() {
			return this.pluginRegistry.resolveTargetPlatform(this);
		},
		
		/**
		 * Event handler called whenever the platform plugin has changed.
		 * This usually gets called with the global target platform changes
		 * or the instance-specific platform changes (assuming it triggers
		 * the use of a different plugin module).  This method should be 
		 * overridden to handle this event.
		 * 
		 * @return Optionally return a promise if this function is asynchronous in order
		 *         to notify when complete.  Upon completion, the _PlatformPlugableMixin
		 *         will update the platform CSS classes on the DOM node.
		 */
		platformPluginChanged: function() {
			
		},
		
		
		/**
		 * Handles changes to the default platform by checking if the change is
		 * relevant to this instance and if so, updating this._newPlugin and
		 * calling the "platformPluginChanged" method as well as the 
		 * "_updatePlatformClasses" method.
		 * 
		 * @param registry The PlatformPluginRegistry for which the change occurred.
		 * @param oldPlatform The old platform value (after resolving against defaults).
		 * @param newPlatform The new platform value (after resolving against defaults).
		 * @param oldPlugin The old plugin value (assuming a plugin was set)
		 * @param newPlugin The new plugin value (which may be the same as the old).
		 */
		_onDefaultPlatformChange: function(registry, oldPlatform, newPlatform, oldPlugin, newPlugin) {
			// check if this instance is not relying on the default platform
			if (iString.nullTrim(this.targetPlatform)) return;
			
			// if we get here then we are relying on the default platform
			// check if we are already using the same plugin
			if (newPlugin === this._plugin) {
				// just update the CSS classes and return
				this._updatePlatformClasses();
				return;
			}
			
			// update and notify
			this._newPlugin = newPlugin;
			var promise = this.platformPluginChanged();
			dWhen(promise, dLang.hitch(this, function() {				
				// update the platform classes
				this._updatePlatformClasses();
			}));
		},
		
		/**
		 * Checks if the promise for the platform plugin has been previously
		 * obtained and used.  If it has never been obtained, then this method 
		 * returns false, otherwise this method returns true.
		 */
		isPlatformPluginObtained: function() {
			if (! ("_plugin" in this)) return false;
			if ((this._plugin == null) || (this._plugin === undefined)) return false;
			return true;
		},
		
		/**
		 * Returns the platform plugin that was previously used, unless this
		 * is the first call, in which case its sets the current plugin to the new 
		 * one and then returns that.  The returned value is actually a promise for
		 * the plugin in the case where it has not yet been loaded.  In some cases
		 * you are guaranteed for this to be a synchronous call and that the promise
		 * is already fulfilled upon return.  This call is forced to be synchronous 
		 * if this widget is not yet had its "startup()" method called to ensure 
		 * completion during synchronous widget lifecycle functions.  Further, the
		 * caller can specify an optional first parameter with a value of true to 
		 * force synchronous behavior. 
		 *
		 * @param forceSync Optional parameter.  If provided and set to true then 
		 *                  forces this operation to be synchronous.
		 */
		getPlatformPluginPromise: function(forceSync) {
			if (!this._plugin) {
				// handle first-time call where new plugin is known, but has not yet been used
				this._plugin = this._newPlugin;
			}
			
			// determine if forcing synchronous behavior
			if (forceSync === undefined) forceSync = false;
			if (forceSync !== true) forceSync = false;
			
			if (!this._plugin) {
				// handle first-time call where the new plugin is not known
				this._plugin = this.pluginRegistry.getPlugin(this, forceSync);
				this._newPlugin = null;
			}
			
			// return the plugin
			return this._plugin;
		},
		
		/**
		 * Returns the latest platform plugin (in case of change) and sets
		 * the current platform plugin to the latest one.  This method should
		 * be used when handling a plugin change and you know you are ready to switch
		 * the new plugin.  The returned value is actually a promise for the plugin in
		 * the case where it has not yet been loaded.
		 *
		 * This call is forced to be synchronous if this widget is not yet had its 
		 * "startup()" method called to ensure completion during synchronous widget 
		 * lifecycle functions.  Further, the caller can specify an optional first 
		 * parameter with a value of true to  force synchronous behavior. 
		 *
		 * @param forceSync Optional parameter.  If provided and set to true then 
		 *                  forces this operation to be synchronous.		 
		 */
		getNewPlatformPluginPromise: function(forceSync) {
			// determine if forcing synchronous behavior
			if (forceSync === undefined) forceSync = false;
			if (forceSync !== true) forceSync = false;
			
			if (! this._newPlugin) {
				// the plugin has never been obtained
				this._newPlugin = this.pluginRegistry.getPlugin(this, forceSync);
			}
			
			// set the current plugin
			this._plugin = this._newPlugin;
			this._newPlugin = null;
			
			// return the plugin
			return this._plugin;
		},
		
		/**
		 * Internal method to call a function with the specified arguments.
		 *
		 * @param plugin The resolved plugin
		 * @param args The array of arguments, the first of which is the function or function name.
		 * @private
		 */
		_doWithPlugin: function(plugin, args) {
			var baseArgs = null, baseFunc = null, altArgs = null, funcOrFuncName = null, offset = 1;
			if (dLang.isString(args[0]) || dLang.isFunction(args[0])) {
				funcOrFuncName = args[0];			
			} else {
				baseArgs = args[0];
				baseFunc = args[1];
				if (! dLang.isString(baseFunc)) {
					throw "Unexpected base function name: " + baseFunc;
				}
				if (dLang.isString(args[2])) {
					funcOrFuncName = args[2];
					offset = 3;
				} else if (dLang.isFunction(args[2])) {
					throw "Unexpected inheritance fallback specified with direct "
						  + "plugin function call: " + baseFunc + " / " + args[2];
					
				} else {
					altArgs = args[2];
					funcOrFuncName = args[3];
					offset = 4;
				}
			}
			if (dLang.isString(funcOrFuncName)) {
				var funcName = funcOrFuncName;
				
				// verify that we have a function
				if (!(funcName in plugin)) {
					// defer to the inherited fallback if possible
					if (baseArgs && baseFunc) {
						// we have an inherited fallback
						if (!altArgs) {
							return this.inherited(baseFunc, baseArgs);
						} else {
							return this.inherited(baseFunc, baseArgs, altArgs);
						}
					} else {
						throw "No such function in plugin: functionName=[ " + funcName
						      + " ], plugin=[ " + plugin + " ]";
					}
				}
				if (! dLang.isFunction(plugin[funcName])) {
					throw "Attribute in plugin is not a function: functionName=[ " + funcName
					      + " ], plugin=[ " + plugin + " ]";
				}
				
				if (args.length > offset) {
					// call function with provided arguments
					var post = dLang._toArray(args, offset);
					var pre = [ this ];
					return plugin[funcName].apply(plugin, pre.concat(post));
					
				} else {
					// call function with only the this pointer
					return plugin[funcName].call(plugin, this);
				}
			} else if (dLang.isFunction(funcOrFuncName)) {
				var func = funcOrFuncName;
					
				if (args.length > 1) {
					// call the function with provided arguments
					var post = dLang._toArray(args, offset);
					var pre = [ plugin ];
					return func.apply(this, pre.concat(post));
					
				} else {
					// call the function with the plugin as a parameter in the scope of this
					return func.call(this, plugin);
				}
			} else {
				throw "Unrecognized first argument.  Expected a string or a function: " + funcOrFuncName;
			} 
		},
		
		/**
		 * Handle calling a named function on the current plugin (once the promise is resolved)
		 * passing this instance as the first parameter, followed any other provided arguments.  
		 * Alternatively, the caller may specify a function to call.  That function will
		 * be called within the scope of "this" instance and will have the plugin passed as the 
		 * first parameter.  If additional parameters are provided, they will be passed to the 
		 * function after the plugin.  The return value from this function is a promise for the 
		 * result of the function that gets executed.
		 *
		 * @param baseArgs Optional: "arguments" used for inheritance call back if the
		 *                 specified named function does not exist on the plugin.
		 *                 Omit this parameter if not using inheritance fallbacks.
		 * @param baseFunc Omit this parameter if "baseArgs" is not provided, otherwise
		 *                 this parameter is required.
		 * @param altArgs Optionally include this parameter in conjunction with "baseArgs",
		 *                or omit if the baseArgs should be used directly during inherited calls,
		 *                but omit this parameter if "baseArgs" is not specified. 
		 * @param funcOrFuncName The name of the function to call or the function itself.  If
		 *                       you specify "baseArgs" then this can only be a name.
		 *
		 * @return A promise for the resultant value of the executed function.
		 */
		doWithPlatformPlugin: function(baseArgs,baseFunc,altArgs,funcOrFuncName) {
			var pluginPromise = this.getPlatformPluginPromise();
			var origArgs = arguments;
			return dWhen(pluginPromise, dLang.hitch(this, function(plugin) {
				return this._doWithPlugin(plugin, origArgs);
			}));
		},
		
		/**
		 * Handle synchronously calling a named function on the current plugin,
		 * passing this instance as the first parameter, followed any other provided arguments.  
		 * Alternatively, the caller may specify a function to call.  That function will
		 * be called within the scope of "this" instance and will have the plugin passed as the 
		 * first parameter.  If additional parameters are provided, they will be passed to the 
		 * function after the plugin.  The return value from this function is the result returned
		 * from the function that gets executed.
		 *
		 * @param baseArgs Optional: "arguments" used for inheritance call back if the
		 *                 specified named function does not exist on the plugin.
		 *                 Omit this parameter if not using inheritance fallbacks.
		 * @param baseFunc Omit this parameter if "baseArgs" is not provided, otherwise
		 *                 this parameter is required.
		 * @param altArgs Optionally include this parameter in conjunction with "baseArgs",
		 *                or omit if the baseArgs should be used directly during inherited calls,
		 *                but omit this parameter if "baseArgs" is not specified. 
		 * @param funcOrFuncName The name of the function to call or the function itself.  If
		 *                       you specify "baseArgs" then this can only be a name.
		 *
		 * @return A promise for the resultant value of the executed function.
		 */
		syncDoWithPlatformPlugin: function(baseArgs,baseFunc,altArgs,funcOrFuncName) {
			var pluginPromise = this.getPlatformPluginPromise(true);
			var origArgs = arguments;
			var result = null;
			// this should happen immediately because synchrnous promise is resolved
			dWhen(pluginPromise, dLang.hitch(this, function(plugin) {
				result = this._doWithPlugin(plugin, origArgs);
			}));
			return result;
		},
		
		/**
		 * Handle calling a named function on the latest plugin (once the promise is resolved).
		 * This will result in the current plugin promise being set to the latest one.  The function
		 * is called with this instance as the first parameter, followed any other provided arguments.  
		 * Alternatively, the caller may specify a function to call.  That function will
		 * be called within the scope of "this" instance and will have the plugin passed as the 
		 * first parameter.  If additional parameters are provided, they will be passed to the 
		 * function after the plugin.  The return value from this function is a promise for the 
		 * result of the function that gets executed.
		 *
		 * @param baseArgs Optional: "arguments" used for inheritance call back if the
		 *                 specified named function does not exist on the plugin.
		 *                 Omit this parameter if not using inheritance fallbacks.
		 * @param baseFunc Omit this parameter if "baseArgs" is not provided, otherwise
		 *                 this parameter is required.
		 * @param altArgs Optionally include this parameter in conjunction with "baseArgs",
		 *                or omit if the baseArgs should be used directly during inherited calls,
		 *                but omit this parameter if "baseArgs" is not specified. 
		 * @param funcOrFuncName The name of the function to call or the function itself.  If
		 *                       you specify "baseArgs" then this can only be a name.
		 *
		 * @return A promise for the resultant value of the executed function.
		 */
		doWithNewPlatformPlugin: function(baseArgs,baseFunc,altArgs,funcOrFuncName) {
			var pluginPromise = this.getNewPlatformPluginPromise();
			var origArgs = arguments;
			return dWhen(pluginPromise, dLang.hitch(this, function(plugin) {
				return this._doWithPlugin(plugin, origArgs);
			}));
		},

		/**
		 * Handle synchronously calling a named function on the latest plugin.
		 * This will result in the current plugin promise being set to the latest one.  The function
		 * is called with this instance as the first parameter, followed any other provided arguments.  
		 * Alternatively, the caller may specify a function to call.  That function will
		 * be called within the scope of "this" instance and will have the plugin passed as the 
		 * first parameter.  If additional parameters are provided, they will be passed to the 
		 * function after the plugin.  The return value from this function is a promise for the 
		 * result of the function that gets executed.
		 *
		 * @param baseArgs Optional: "arguments" used for inheritance call back if the
		 *                 specified named function does not exist on the plugin.
		 *                 Omit this parameter if not using inheritance fallbacks.
		 * @param baseFunc Omit this parameter if "baseArgs" is not provided, otherwise
		 *                 this parameter is required.
		 * @param altArgs Optionally include this parameter in conjunction with "baseArgs",
		 *                or omit if the baseArgs should be used directly during inherited calls,
		 *                but omit this parameter if "baseArgs" is not specified. 
		 * @param funcOrFuncName The name of the function to call or the function itself.  If
		 *                       you specify "baseArgs" then this can only be a name.
		 *
		 * @return A promise for the resultant value of the executed function.
		 */
		syncDoWithNewPlatformPlugin: function(baseArgs,baseFunc,altArgs,funcOrFuncName) {
			var pluginPromise = this.getNewPlatformPluginPromise(true);
			var origArgs = arguments;
			var result = null;
			// this should happen immediatley because synchronous promise is resolved
			dWhen(pluginPromise, dLang.hitch(this, function(plugin) {
				result = this._doWithPlugin(plugin, origArgs);
			}));
			return result;
		}		
		
	});
	
});