define(["require",
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dojo/Deferred",
		"idx/util",
		"idx/string",
		"idx/multichannel",
		"./_AppMixin"],
	   function (require, dDeclare, dLang, dArray, dDeferred, 
				 iUtil, iString, iMultichannel, iAppMixin) {

	var validPlatforms = { desktop: true, tablet: true, phone: true, mobile: true };
	var validTargetPlatforms = { desktop: true, tablet: true, phone: true };
	var mobilePlatforms = { tablet: true, phone: true };
	
	return dDeclare("idx.app.mixins._PlatformAppMixin", iAppMixin, {
		/**
		 * For now, the target platform is an attribute.  Later it will likely auto-detect.
		 */
		targetPlatform: "auto",
							
		/**
		 * Constructor to initialize the mixin.
		 */
		constructor: function(config, node) {			
			// check the target platform
			if (this.targetPlatform == "auto") {
				this.targetPlatform = iMultichannel.getRuntimePlatform();
			}
			if (! this.targetPlatform in validTargetPlatforms) {
				throw "Invalid target platform for app detected: " + this.targetPlatform;
			}
			
			// record the default template
			this._defaultTemplate = this.template;
			
			// resolve the config
			this._resolveConfig(this, config);
			
			// resolve the template
			this._setupTemplate();
		},

		/**
		 * Recursively resolves the config for platform-specific fields.
		 */
		_resolveConfig: function(target, config, path) {
			var field = null;
			var baseField = null;
			var fieldLookup = {};
			var overrideLookup = {};
			var platforms = null;
			var index = 0;
			var splitField = null;
			var overrides = {};
			var childTarget = null, childConfig = null, childPath = null;
			if (!path) path = "/";
			
			// iterate over the config fields
			for (field in config) {
				if (field.indexOf("@") < 0) continue;
				splitField = iString.unescapedSplit(field, "@");
				if (splitField.length == 1) continue;
				if (splitField.length > 2) {
					throw "Platform-specific field has multiple '@' symbols.  field=[ "
						  + field + " ], path=[ " + path + " ]";
				}
				baseField = splitField[0];
				platforms = splitField[1].split(",");
				
				// handle each platform
				dArray.forEach(platforms, dLang.hitch(this, function(platform) {
					// normalize the platform name
					var p = iString.nullTrim(platform);
					if (p) p = (p in validPlatforms) ? p : null;
					
					// check if it is not valid
					if (!p) {
						throw "Invalid platform found for field.  platform=[ " + platform
							 + " ], field=[ " + field + " ], path=[ " + path + " ]";
					}
					
					// check if another field has already defined a value for this platform
					var lookupKey = baseField+"@"+p;
					if (fieldLookup[lookupKey]) {
						throw "Ambiguous platform found for field.  platform=[ " + platform
							 + " ], baseField=[ " + baseField + " ], originalField=[ "
							 + fieldLookup[lookupKey] + " ], redundantField=[ " + field + " ]";
					} else {
						fieldLookup[lookupKey] = field;
					}
					
					// record the value if it matches the target platform
					if (p == this.targetPlatform) {
						// record the override
						overrides[baseField] = config[field];
						overrideLookup[baseField] = field;
						
					} else if ((p == "mobile") && (this.targetPlatform in mobilePlatforms)) {
						// if the target platform is a mobile platform and we have not
						// overridden with a specific mobile platform already, then override
						if (! (baseField in overrides)) {
							overrides[baseField] = config[field];
							overrideLookup[baseField] = field;
						}
					}
				}));
			}
			
			// mixin the overrides to the target
			dLang.mixin(target, overrides);
			
			// mixin the overrides to the config
			dLang.mixin(config, overrides);
			
			// iterate over the config fields again and recurse
			for (field in config) {
				if (field == "__parent") continue;
				// skip any platform-specific fields (only recurse for normal fields)
				if ((field.indexOf("@") < 0) || (iString.unescapedSplit(field, "@").length==1)) {
					childTarget = target[field];
					childConfig = config[field];
					childPath = path + (overrideLookup[field]?overrideLookup[field]:field) + "/";
					if (!childTarget || !childConfig) continue;
					if (dLang.isObject(childTarget) && (iUtil.typeOfObject(childTarget)=="object")
						&& dLang.isObject(childConfig) && (iUtil.typeOfObject(childConfig)=="object")) {
						// recursively resolve the configuration
						this._resolveConfig(childTarget, childConfig, childPath);
					}
				}
			}
		},
				
		/**
		 * Make sure to setup the template appropriately.
		 */
		_setupTemplate:function() {
			// set a deferred promise for the template string
			if (this.template != this._defaultTemplate) {
				this.templateString = null;
				var deferred = null;
				if (template) {
					deferred = new dDeferred();
					this.templateString = deferred.promise;
					require(["dojo/text!" + this.template], dLang.hitch(this, function(templateText) {
						deferred.resolve(templateText);
					}));
				}
			}
			// return the deferred promise
			return this.templateString;
		}				
	});
});
