define(["dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array", 
		"dojo/has",
		"dojo/when",
		"dojo/aspect",
  		"dojo/Deferred",
  		"dojo/Stateful",
  		"dojo/io-query",
  		"dijit/_WidgetBase",
  		"./util",
  		"./string",
		"./multichannel"  		
		], function(dDeclare, dLang, dArray, dHas, dWhen, dAspect, dDeferred, dStateful, dIOQuery, dWidgetBase, iUtil, iString, iMultichannel){
		
	// bootstrap the dojo/has settings to ensure "mobile" is set if "tablet" or "phone" is set
	if ((dHas("tablet")||dHas("phone"))&&(!dHas("mobile"))) {
		dHas.add("mobile", function() { return true; } );
	}
	
	// map of all plugin registries by module name
	var registries = {};
	
	// map of module names to maps of platform names to plugin module names
	var pluginModuleNames = {};
	
	// map of module names to maps of platform names to promises for loaded plugin modules
	var pluginModules = {};
	
	// map of module names to maps of platform names to promises for created plugins
	var plugins = {};
	
	// array of all platforms
	var platforms = [ "desktop", "tablet", "phone" ];
	
	// mapping of platform names to possible plugins in precedence
	var platformFallbacks = {
		"desktop": [ "tablet", "phone" ],
		"tablet":  [ "phone", "desktop" ],
		"phone":  [ "tablet", "desktop" ]
	};
		
	// the "auto" platform as determined by "dojo/has" and "idx/multichannel"
	//var autoPlatform = (dHas("tablet")?"tablet":(dHas("phone")?"phone":(dHas("mobile")?"phone":"desktop")));
	//if (!dHas(autoPlatform)) dHas.add(autoPlaform, function() { return true; } );
	
	var autoPlatform = iMultichannel.getRuntimePlatform();
	
	// the default plugins for registries
	var defaultPlatforms = {};
	
	// create an internal stateful instance to maintain the platform property
	var GlobalPlatform = dDeclare([dStateful], {
		/**
		 * The tartget platform.
		 */
		targetPlatform: "desktop"
	});
	
	// the variable representing the selected platform (default to desktop)
	var globalPlatform = new GlobalPlatform();
	var doGlobalHas = true;
	
	// Returns the platform that will be used when a setting of "auto" is used for the
 	// target platform settings.
	var getAutoPlatform = function() {
		return autoPlatform;
	};
	
	/**
	 * Normalizes the specified platform.  If empty or null, then null is returned.
	 * If "auto" then the auto platform is returned.  Otherwise, the platform is
	 * checked to see if it is valid and then returned.
	 * 
	 * @param platform The platform to normalize.
	 * @return The normalized platform.
	 * @private
	 */
	var normalizePlatform = function(platform) {
		// check if null
		platform = iString.nullTrim(platform);
		if (!platform) return null;
		
		// check if auto
		if (platform == "auto") return autoPlatform;
				
		// check if valid
		switch (platform) {
			case "desktop":
			case "tablet":
			case "phone":
				return platform;
			default: 
				throw "Invalid platform name: " + platform;
		}
	};

 	// Returns the global default target platform.
	var getGlobalTargetPlatform = function() {
		return globalPlatform.get("targetPlatform");
	};
	
 	// Sets the global target platform to the specified platform.
 	// The possible values that it can be set to are "desktop", "tablet", "phone" or "auto".
 	// The global target platform cannot be set to empty-string or null.  By default, the 
 	// global target platform is set to "desktop".
	var setGlobalTargetPlatform = function(platform) {
		// flag that widgets should be platform-plugable
		if (!dHas("platform-plugable")) dHas.add("platform-plugable", function() { return true; } );
		if (doGlobalHas) {
			doGlobalHas = false;
			var hasPlatform	= normalizePlatform(platform);
			if (!dHas(hasPlatform)) dHas.add(hasPlatform, function() { return true; } );
			if ((hasPlatform == "tablet") || (hasPlatform == "phone")) {
				if (!dHas("mobile")) dHas.add("mobile", function() { return true; } );
				iMultichannel.updateGlobalTheme(["mobile"]);
			}
			
		}
		
		var targetPlatform = iString.nullTrim(platform);
		if (!targetPlatform) {
			throw "Global target platform setting cannot be empty or null: " + platform;
		}
		switch (platform) {
			case "desktop":
			case "tablet":
			case "phone":
			case "auto":
				// do nothing
				break;
			default:
				throw "Illegal platform setting for global target platform: " + platform;	
		}
		globalPlatform.set("targetPlatform", targetPlatform);
	};

	/**
	 * Verifies that the specified platform is valid strips it of white space.
	 * 
	 * @param platform The platform to verified.
	 * @return The verified platform.
	 * @private
	 */
	var verifyPlatform = function(platform) {
		// check if null
		platform = iString.nullTrim(platform);
		if (!platform) {
			throw "Invalid platform name: " + platform;
		}
		
		// check if auto
		if (platform == "auto") return platform;
				
		// check if valid
		switch (platform) {
			case "desktop":
			case "tablet":
			case "phone":
				return platform;
			default: 
				throw "Invalid platform name: " + platform;
		}
	};
		
	/**
	 * @name idx.PlatformPluginRegistry
	 * @class Provides a registry for platform-specific plugins for 
	 * implementing multi-channel widgets based on a module name.
	 * Plugin registries are created via the static "register" 
	 * method rather than by constructing them.  In fact, constructed
	 * instances will not function if they were not created by the
	 * "register" function.
	 * @example
	 * define(["idx/PlatformPluginRegistry"], function(MPR) {
	 * 	var registry = MPR.register("idx/app/Header");
	 *  ...
	 * }); 
	 */
	var thisModule = dDeclare("idx/PlatformPluginRegistry", [dStateful], 
		/** @lends idx.PlatformPluginRegistry */
	{
		/**
		 * The name of the module for which the registry exists.
		 */
		moduleName: "",
	
		/**
		 * The target platform to be used by all widgets that leverage this registry.
		 * The order of precedence for determining the target platform is first
		 * widget specific, then registry-specific, then using the global platform.
		 */
		targetPlatform: "",
		
		/**
		 * Constructor.
		 */
		constructor: function(args) {
			dLang.mixin(this, args);
		},
		
		/**
		 * Asserts that this instance was created using the "register" function.
		 * @private
		 */
		_assertRegistered: function() {
			if ( this !== registries[this.moduleName]) {
				throw "Must use 'register' function to create "
					+ "instances of PlatformPluginRegistry: " 
					+ this.moduleName;
			}
		},
		
		/**
		 * Normalizes the platform name.
		 * @param platform The platform name (e.g.: "desktop", "tablet", "phone", or "auto")
		 * @return The normalized platform name (e.g.: "desktop", "tablet" or "phone")
		 * @throws An error if the specified platform name is not recognized.
		 * @private
		 */
		_normalizePlatform: function(platform) {
			this._assertRegistered();
			return normalizePlatform(platform);			
		},
		
		/**
		 * This is called when the target platform on this instance changes to 
		 * determining if we need to notify widgets that leverage this registry.
		 *
		 * @param attrName This should be "targetPlatform"
		 * @param oldPlatform The old value.
		 * @param newPlatform The new value.
		 * @private
		 */
		_onTargetPlatformChange: function(attrName, oldPlatform, newPlatform) {
			// check if they normalize to the same value
			oldPlatform = this._normalizePlatform(oldPlatform);
			newPlatform = this._normalizePlatform(newPlatform);
			var globalPlatform = (!oldPlatform || !newPlatform) ? getGlobalTargetPlatform() : null;
			if (!oldPlatform) oldPlatform = globalPlatform;
			if (!newPlatform) newPlatform = globalPlatform;

			if (oldPlatform == newPlatform) return; // no change in platform
			
			// the platform has changed, get the plugin platforms
			var oldPluginPlatform = (oldPlatform ? this._getPluginPlatform(oldPlatform) : null);
			var newPluginPlatform = this._getPluginPlatform(newPlatform);
			
			// resolve the plugins
			var oldPlugin = (oldPluginPlatform ? this._getPlugin(oldPluginPlatform) : null);
			var newPlugin = this._getPlugin(newPluginPlatform);
			
			// call the onDefaultPlatformChange event handler
			this.onDefaultPlatformChange(this, oldPlatform, newPlatform, oldPlugin, newPlugin);	
		},

		/**
		 * This method is called when the global platform changes.
		 *
		 * @param attrName This should be "targetPlatform"
		 * @param oldPlatform The old value.
		 * @param newPlatform The new value.
		 * @private
		 */
		_onGlobalTargetPlatformChange: function(attrName, oldPlatform, newPlatform) {
			// check if this registry has an overridden target platform, if so this does not matter
			var targetPlatform = this._normalizePlatform(this.targetPlatform);
			if (targetPlatform) return;
			
			this._onTargetPlatformChange(attrName, oldPlatform, newPlatform);			
		},
		
		/**
		 * Tracks the specified requester for updates if it not already being tracked.
		 * @param requester The requester to be tracked.
		 */
		_trackRequester: function(requester) {
			if (!requester) return;
			if (requester._platformTracking === this) return;
			if (requester._platformTracking) {
				throw "A single widget cannot use more than one PlatformPluginRegistry: " + requester 
					  + " / previousRegistry = " + requester._platformTracking.moduleName;
			}
			if (requester && ("_onDefaultPlatformChange" in requester) && (dLang.isFunction(requester._onDefaultPlatformChange))) {
				requester.own(dAspect.after(this, "onDefaultPlatformChange", dLang.hitch(requester, "_onDefaultPlatformChange"), true));
			}		
		},

		/**
		 * Returns the actual platform that will be used when the "auto" platform setting is employed.
		 * This will return one of "desktop", "tablet" or "phone".
		 *
		 * @return The platform that the "auto" platform resolves to.
		 */
		getAutoPlatform: function() {
			return getAutoPlatform();
		},
						
		/**
		 * Obtains the global default platform that is being used as the default across all registries.
		 * 
		 * @param requester The optional reference to the requesting widget for tracking of changes.
		 */
		getGlobalTargetPlatform: function(requester) {
			this._trackRequester(requester);
			return getGlobalTargetPlatform();
		},
		
		/**
		 * Sets the global default program that is used as the default across all registries.
		 * 
		 * @param platform The platform to set as the global default (e.g.: "desktop", "tablet",
		 *                 "phone" or "auto")
		 */
	    setGlobalTargetPlatform: function(platform) {
	    	setGlobalTargetPlatform(platform);
	    },
	    
		/**
		 * This method is called when the global platform changes.
		 * 
		 * @param registry The PlatformPluginRegistry.
		 * @param oldPlatform The old platform.
		 * @param newPlatform The new platform.
		 * @param oldPlugin The old plugin.
		 * @param newPlugin The new plugin (which may be the same).
		 */
		onDefaultPlatformChange: function(registry, oldPlatform, newPlatform, oldPlugin, newPlugin) {
			// do nothing -- this is an event handler that requesters are attached to			
		},
		
		/**
		 * Sets the target platform for all widgets using this registry to the specified platform.
		 * If this changes the underlying plugin then an event will be fired to all widgets
		 * leveraging that plugin.  The platform can be set to "auto", "desktop", "tablet" or
		 * "phone" or can be set to null or empty-string to indicate that the global target platform
		 * setting should be used instead.  Usually, the global setting is the one used.
		 *
		 * @param targetPlatform The new target platform.
		 */
		_setTargetPlatformAttr: function(targetPlatform) {
			this._assertRegistered();
			this.targetPlatform = targetPlatform;
			targetPlatform = normalizePlatform(targetPlatform);
			this._targetPlatform = (targetPlatform ? targetPlatform : "");
		},
		
		/**
		 * Returns the target platform that is set as the registry's default target platform.
		 * This method returns null if the target platform is set to empty string.
		 *
		 * @return The target platform set as the registry default.
		 */
		_getTargetPlatformAttr: function() {
			this._assertRegistered();
			return iString.nullTrim(this._targetPlatform);
		},
		
		/**
		 * Determines the target platform to use given the optionally specified widget-specific
		 * target platform.  If the specified target platform is a valid non-empty string then it
		 * is used.  If not, then an attempt is made to use the 
		 */
		resolveTargetPlatform: function(requester) {
			// track the requester
			this._trackRequester(requester);
			
			// normalize the platform
			var targetPlatform = (requester ? this._normalizePlatform(requester.get("targetPlatform")) : null);
			
			// if not null then use it
			if (targetPlatform) return targetPlatform;
			
			// try the registry default platform
			targetPlatform = this._normalizePlatform(this.get("targetPlatform"));
			
			// if not null then use it
			if (targetPlatform) return targetPlatform;
			
			// use the global default platform
			return this._normalizePlatform(globalPlatform.get("targetPlatform"));
		},
		
		/**
		 * Returns the name for the specified requesting requester that implements
		 * _PlatformPlugableMixin.  If no requester is specified then the registry default
		 * platform is resolved.
		 *
		 * @requester The optional reference to the requesting widget.
		 *
		 * @return The name for the plugin module. 
		 *
		 */
		getPluginModuleName: function(requester) {
			// normalize the platform
			var platform = this.resolveTargetPlatform(requester);
			
			// call the internal function
			return this._getPluginModuleName(platform);		
		},
		
		
		/**
		 * Internal version of "getPluginModuleName" that does not normalize the platform name.
		 * @private
		 */
		_getPluginModuleName: function(platform) {
			var map = pluginModuleNames[this.moduleName];
			return map[platform];
		},
		
		/**
		 * Returns the promise for the plugin module for the optionally specified requesting
		 * widget that typically implements _PlatformPlugableMixin.  If no requester is specified
		 * then the registry default platform is used to resolve the plugin module.
		 *
		 * @requester The optional reference to the requesting widget.
		 *
		 * @return The promise for resolving the loaded plugin module. 
		 */
		getPluginModule: function(requester) {
			// normalize the platform
			var platform = this.resolveTargetPlatform(requester);
			
			// call the internal function
			return this._getPluginModule(platform);		
		},
		
		/**
		 * Determines which platform to use for resolving the
		 * plugin module using fallbacks when a widget may not
		 * implement plugins for every platform.
		 */
		_getPluginPlatform: function(platform) {			
			// get the map of module name to plugin modules
			var map = pluginModules[this.moduleName];
			var index = 0;
			var fallback = null;
			
			// check if the platform is known
			if (! (platform in map)) {
				// not known, get the fall-back platforms
				var fallbacks = platformFallbacks[platform];
				
				// loop through fallbacks
				for (index = 0; index < fallbacks.length; index++) {
					// check if this fallback is known
					if (fallbacks[index] in map) {
						fallback = fallbacks[index];
						break;
					}
				}

				if (!fallback) {
					throw "No plugin available for specified platform: " + platform;
				}
				
				// set the platform to the fallback
				platform = fallback;
			}

			// return the platform
			return platform;		
		},
		
		/**
		 * Internal version of "getPluginModule" that does not normalize the platform name.
		 * @private
		 */
		_getPluginModule: function(platform, sync) {
			// get the map of module name to plugin modules
			platform = this._getPluginPlatform(platform);
			
			// get the plugin modules map
			var map = pluginModules[this.moduleName];
			
			// lookup the plugin module for the platform
			var modulePromise = map[platform];
			
			// check if null
			if (!modulePromise) {
				// create a deferred
				modulePromise = new dDeferred();
				
				// record it in the module map for future use
				map[platform] = modulePromise;
				
				// get the module name
				var moduleName = this._getPluginModuleName(platform);
				
				try {
					if (sync) {
						// require the module using synchronous loading
						require({async: false}, [moduleName], function(pluginModule) {
							modulePromise.resolve(pluginModule);
						});
					} else {
						// require the module using default async setting
						require([moduleName], function(pluginModule) {
							modulePromise.resolve(pluginModule);
						});					
					}
				} catch (e) {
					console.log("Failed to load plugin module for " + platform + " platform: " + this.moduleName);
					modulePromise.reject(e);
				}
			}
			
			// return the module promise
			return modulePromise;
		},
				
		/**
		 * Returns a promise that will resolve to the global plugin instance
		 * for the optionally specified requester that typically implements _PlatformPlugableMixin.
		 * If no requester is specified then the registry default platform will be
		 * resolved for obtaining the plugin promise.
		 *
		 * This method will execute synchronously if the specified requester has not yet had its
		 * startup() function called (i.e.: requester._started !== true).  Further, if the 
		 * optional second parameter for "forceSync" is set to true, then it will be synchronous.
		 *
		 * @requester The optional reference to the requesting widget.
		 * @forceSync The optional parameter force synchrnous behavior.  This may be the only
		 *            parameter if the requester is not provided so long as the value provided
		 *            for the first parameter is true or false.
		 *
		 * @return The instance of the appropriate plugin to be used. 
		 */
		getPlugin: function(requester, forceSync) {
			if (arguments.length === 0) {
				requester = null;
				forceSync = false;
				
			} else if ((arguments.length == 1) && (requester !== undefined) && ((requester === true) || (requester === false))) {
				forceSync = requester;
			}
			if (forceSync === undefined) forceSync = false;
			if (forceSync !== true) forceSync = false;
			
			// determing the platform
			var platform = this.resolveTargetPlatform(requester);
			
			// check if we should be making this request synchronously
			var sync = false;
			if (requester && ("instanceOf" in requester) 
				&& (dLang.isFunction(requester.instanceOf)) && requester.instanceOf(dWidgetBase)) {
				sync = (!forceSync && requester._started) ? false : true;
			}
			
			// call the internal function
			return this._getPlugin(platform, sync);
		},
		
		/**
		 * Internal version of "getPlugin" that does not normalize the specified platform name.
		 * @private
		 */
		_getPlugin: function(platform, sync) {
			// get the map of module name to plugins
			var map = plugins[this.moduleName];
			
			// lookup the plugin for the platform
			var pluginPromise = map[platform];
			
			// check if null
			if (!pluginPromise) {
				// create a deferred
				pluginPromise = new dDeferred();
				
				// record it in the plugin map for future use
				map[platform] = pluginPromise;
				
				// create the plugin
				try {
					var modulePromise = this._getPluginModule(platform, sync);
					dWhen(modulePromise, function(pluginModule) {
						var plugin = null;
						// check if we are using the inherited base class as the plugin
						// for this platform
						if (dLang.isString(pluginModule) && (pluginModule == "inherited")) {
							// an empty plugin forces inherited behavior
							plugin = {};
						} else {
							// create a plugin instance from the module
							plugin = new pluginModule();
						}
						pluginPromise.resolve(plugin);
					});
				} catch (e) {
					console.log("Failed to load plugin module for " + platform + " platform: " + this.moduleName);
					pluginPromise.reject(e);
				}
			}
			
			// return the promise
			return pluginPromise;
		}
	});	
	
	/**
  	 * @public
  	 * @function
 	 * @name idx.PlatformPluginRegistry.setAutoPlatform
 	 * @description Returns the platform that will be used when a setting of "auto" is used for the
 	 *              target platform settings.
	 */
	thisModule.getAutoPlatform = getAutoPlatform;
	
	/**
  	 * @public
  	 * @function
 	 * @name idx.PlatformPluginRegistry.setGlobalPlatform
 	 * @description Returns the global default target platform.  The possible return values are
 	 *              "desktop", "tablet", "phone" or "auto".  The global target platform will never
 	 *              be empty-string or null.  By default, the global target platform is set to "desktop".
 	 * @return The global default target platform.
	 */
	thisModule.getGlobalTargetPlatform = getGlobalTargetPlatform;
	
	/**
  	 * @public
  	 * @function
 	 * @name idx.PlatformPluginRegistry.setGlobalPlatform
 	 * @description Sets the global target platform to the platform obtained from the URL query parameters
 	 *              of optionally specified URL (or the current page's URL if not specified) using the
 	 *              "platform" parameter from the query string (or the optionally specified parameter name
 	 *              if provided).
 	 * @param paramName The optional parameter name for extracting the platform from the query string.
 	 *                  If not specified, then "platform" is used.
 	 * @param url The optional URL from which to extract the platform.  If not specified then 
 	 *            document.location.href is used.
	 */
	thisModule.setGlobalTargetPlatformFromURL = function(paramName, url) {
		// default the optional parameters
	    if (!paramName) paramName = "platform";
		if (!url) url = "" + document.location.href;
	    
	    var split = url.indexOf("?");
	    var queryString = null;
	    if ((split >= 0) && (split < url.length - 1)) {
			queryString = url.substring(split+1, url.length);
	    }
	    var params = null;
	    if (queryString) {
	    	params = dIOQuery.queryToObject(queryString);
	    }
	    var platform = "auto";
	    if (params && ("platform" in params) && (params.platform)) {
	    	switch (params.platform) {
	    		case "desktop":
	    		case "tablet":
	    		case "phone":
	    		case "auto":
	    			platform = params.platform;
	    			break;
	    		case "default":
	    			console.log("USING NON-PLUGABLE IMPLEMENTATION");
	    			platform = null;
	    			break;
	    		default: 
	    			console.log("UNRECOGNIZED PLATFORM IN URL: " + params.platform);
	    			break;
	    	}
	    }
	    if (platform) {
	    	thisModule.setGlobalTargetPlatform(platform);
	    }
	};
	
	/**
  	 * @public
  	 * @function
 	 * @name idx.PlatformPluginRegistry.setGlobalPlatform
 	 * @description Sets the global target platform to the specified platform.
 	 *              The possible values that it can be set to are "desktop", "tablet", "phone" or "auto".
 	 *              The global target platform cannot be set to empty-string or null.  By default, the 
 	 *              global target platform is set to "desktop".
 	 * @param platform The platform to set as the global default target platform (i.e.: "desktop",
 	 *                 "tablet", "phone" or "auto").
	 */
	thisModule.setGlobalTargetPlatform = setGlobalTargetPlatform;
	
	/**
  	 * @public
  	 * @function
 	 * @name idx.PlatformPluginRegistry.register
 	 * @description Creates a plugin registry for the specified module name.  Note, when specifying
 	 * the "loadedPluginModules" or "customPluginNames" parameters, the psuedo-platform of "mobile"
 	 * can be used to set a default plugin or plugin module name (respectively) for both tablet and
 	 * phone platforms if not otherwise specified. 
 	 * @param baseModuleName The name of the master module that will use the plugins.  The names
 	 *                       of the plugin modules will be inferred from this if not provided.
 	 * @param loadedPluginModules A map of valid platform names (e.g.: "desktop", "tablet" or "phone") to
 	 *                            plugin modules that have already been loaded.  Typically this contains
 	 *                            null values for unloaded plugin modules and a real value for the default
 	 *                            platform module.  If a field is missing from this object then it is 
 	 *                            assumed that such a plugin does not exist for that widget.
 	 * @param customPluginNames A map of valid platform names (e.g.: "desktop", "tablet" or "phone") to
 	 *                          the names for finding and loading the plugin modules.  This is optional and
 	 *                          if not provided, the names are inferred from the base module name.
 	 * @return The PlatformPluginRegistry that was just created or previously created for the specified
 	 *         base module name.
 	 */
	thisModule.register = function(baseModuleName, loadedPluginModules, customPluginNames) {
		// unset the doGlobalHas flag to prevent further "has" settings
		doGlobalHas = false;
		
		// check if the registry has already been created
		var registry = registries[baseModuleName];
		if (registry) {
			console.warn("Attempt to register a PlatformPluginRegistry that has already been "
							+ "registered: " + baseModuleName);
			return registry;
		}

		// prepare to create the registry
		var registryArgs = {moduleName: baseModuleName};
				
		// determine if we already have a default platform
		if (baseModuleName in defaultPlatforms) {
			console.log("SETTING DEFAULT PLATFORM FOR " + baseModuleName + " TO " + defaultPlatforms[baseModuleName]);
			registryArgs.targetPlatform = defaultPlatforms[baseModuleName];
		}
				
		// create the registry
		registry = new thisModule(registryArgs);
		
		// save the registry
		registries[baseModuleName] = registry;
		
		// determine the plugin module names
		var names = pluginModuleNames[baseModuleName] = {};
		var modules = pluginModules[baseModuleName] = {};
		plugins[baseModuleName] = {};
		
		var index = baseModuleName.lastIndexOf("/");
		if ((index < 0) || (index == baseModuleName.length -1)) {
			throw "Invalid base module name: " + baseModuleName;
		}
		var prefix = baseModuleName.substring(0, index+1);
		var suffix = baseModuleName.substring(index+1);
		var deferred = null;
		var upperPlatformName = null;
		
		dArray.forEach(platforms, function(platform) {
			// determing the plugin name
			var pluginName = null;
			
			// mark the field so that we at least know it exists
			if (loadedPluginModules && (platform in loadedPluginModules)) {
				modules[platform] = null;
			}
			
			if ((customPluginNames) && (platform in customPluginNames) && (customPluginNames[platform])) {
				// a name is provided and it is defined and not null
				pluginName = customPluginNames[platform];
			} else if ((customPluginNames) && (platform in customPluginNames) && (!customPluginNames[platform])) {
				// a name is provided and it is either null or undefined, use the default naming
				pluginName = prefix + "/plugins/" + platform + "/" + suffix + "Plugin";		
				
			} else if ((platform != "desktop") && (customPluginNames) && ("mobile" in customPluginNames) && (customPluginNames["mobile"])) {
				// an actual defined non-null module name is provided for mobile, use it
				pluginName = customPluginNames["mobile"];
			} else if ((platform != "desktop") && (customPluginNames) && ("mobile" in customPluginNames) && (!customPluginNames["mobile"])) {
				// an undefined or null name is provided for the mobile platform, use the default "mobile" naming
				pluginName = prefix + "/plugins/mobile/" + suffix + "Plugin";
				
			} else {
				// no custom names have been provided or at least none for this platform -- check if the
				// default name should use "mobile" naming convention for mobile platforms
				if ((platform != "desktop") && (loadedPluginModules) && ("mobile" in loadedPluginModules)
					&& (!(platform in loadedPluginModules))) {
					// use the mobile module naming convention because the specific mobile platform is 
					// missing from the loaded plugin map, but the "mobile" psuedo-platform is specified
					pluginName = prefix + "/plugins/mobile/" + suffix + "Plugin";
						
				} else {
					// use the standard naming convention since either this is not a mobile platform or 
					// no "mobile" variant was specified
					pluginName = prefix + "/plugins/" + platform + "/" + suffix + "Plugin";		
				}
			}
			names[platform] = pluginName; 
			
			// check if the module is already loaded
			if ((loadedPluginModules) && (loadedPluginModules[platform])) {
				// the platform has a specific loaded module
				deferred = modules[platform] = new dDeferred();
				deferred.resolve(loadedPluginModules[platform]);
				
			} else if ((platform != "desktop") && (loadedPluginModules) && (loadedPluginModules["mobile"])) {
				// check if using "mobile" plugin module as a default for tablet or phone platforms
				deferred = modules[platform] = new dDeferred();
				deferred.resolve(loadedPluginModules["mobile"]);
			}
		});

		globalPlatform.watch("targetPlatform", dLang.hitch(registry, "_onGlobalTargetPlatformChange"));
		registry.watch("targetPlatform", dLang.hitch(registry, "_onTargetPlatformChange"));
			
		// return the registry
		return registry;
	};
		
	/**
  	 * @public
  	 * @function
 	 * @name idx.PlatformPluginRegistry.setRegistryDefaultPlatform
 	 * @description Sets the default platform for a registry even BEFORE it is created.
 	 *              A warning is issued if this is called AFTER the register has been created
 	 *              and registered since this method will have no effect in such a case.
 	 * @param baseModuleName The name of the master module with which the registry is associated.
 	 * @param defaultPlatform The name of the default platform for the associated registry once
 	 *                        it becomes registered (e.g.: "desktop", "tablet", "phone" or "auto").
	 */
	thisModule.setRegistryDefaultPlatform = function(baseModuleName, defaultPlatform) {
		// flag that widgets should be platform-plugable
		if (!dHas("platform-plugable")) dHas.add("platform-plugable", function() { return true; } );
		
		// verify the platform name
		defaultPlatform = verifyPlatform(defaultPlatform);
		
		// check if the registry has already been created
		var registry = registries[baseModuleName];
		if (registry) {
			console.warn("Attempt to set the default platform for a PlatformPluginRegistry "
							+ "that has already been registered.  This will have no effect: " + baseModuleName);
			return registry;
		}
		
		// set the default platform
		defaultPlatforms[baseModuleName] = defaultPlatform;
		
		// setup the dojo/has feature
		var featurePrefix = baseModuleName.replace(/\//g, "_") + "-";
		var featureSuffix = defaultPlatform;
		
		// add the dojo-has condition
		dHas.add(featurePrefix + defaultPlatform, function() { return true; });
		
		// add the "mobile" dojo-has for "tablet" and "phone" platforms
		if ((defaultPlatform == "tablet") || (defaultPlatform == "phone")) {
			dHas.add(featurePrefix + "mobile", function() { return true; });
		}
	};
	
	/**
  	 * @public
  	 * @function
 	 * @name idx.PlatformPluginRegistry.setRegistryTargetPlatform
 	 * @description Sets the target platform for a registry associated with the sepcified
 	 *              module AFTER it has been created/registered by its associated module.
 	 *              A warning is issued if this is called BEFORE the registry has been created
 	 *              and registered since this method will have no effect in such a case.
 	 * @param baseModuleName The name of the master module with which the registry is associated.
 	 * @param targetPlatform The name of the target platform for the associated registry (e.g.: 
 	 *                       "desktop", "tablet", "phone" or "auto").
	 */
	thisModule.setRegistryTargetPlatform = function(baseModuleName, targetPlatform) {
		// verify the platform name
		targetPlatform = normalizePlatform(targetPlatform);
		
		// check if the registry has already been created
		var registry = registries[baseModuleName];
		if (!registry) {
			console.warn("Attempt to set the target platform for a PlatformPluginRegistry "
						  + "that has NOT yet been registered.  This will have no effect: " + baseModuleName);
			return;
		}

		// set the target platform
		registry.set("targetPlatform", targetPlatform);
	};
	
	// return the module	
	return thisModule;
});
