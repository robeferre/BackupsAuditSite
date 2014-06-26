define(["dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dojo/string",
		"idx/string",
		"idx/util"],
function(dDeclare, dLang, dArray, dString, iString, iUtil) {		
	return dDeclare("idx.app._AppMixin", null, {
		/**
		 * The default type to use for views.
		 */
		defaultViewType: "idx/app/View",
		
		/**
		 * The format to use for obtaining the view title from the
		 * the view's optional NLS bundle.
		 *
		 * @default "view_title_${name}"
		 */
		viewTitleKeyFormat: "view_title_${name}",
		
		/**
		 * The name of the default idx/app/Placer to be used by idx/app/Layout.
		 */
		defaultPlacer: "idx/app/Placer",

		/**
		 * Constructor.
		 */
		constructor: function(config, node) {
			dLang.mixin(this, config.idxAppOptions);

			var dependency = null;
			var index = 0;
			var found = false;
			if (iString.nullTrim(this.nls)) {
				dependency = "dojo/i18n!" + this.nls;
				if (!this.dependencies) {
					throw "Cannot specify top-level 'nls' parameter as '" + this.nls
						  + "' without including '" + dependency + "' in the dependencies.";
				}
				found = false;
				for (index = 0; index < this.dependencies.length; index++) {
					if (this.dependencies[index] == dependency) {
						found = true;
						break;
					}
				}
				if (!found) {
					throw "Cannot specify 'nls' parameter as '" + this.nls
				 		  + "' without including '" + dependency + "' in the dependencies.";						
				}
			}
			
			// initialize the NLS object to an empty object to ensure it is defined
			// this may get changed later if a global NLS bundle is specified
			this.nls = {};
		},
		
		/**
		 * Returns the name of the view type module to use for
		 * the view associated with the specified view name as a child
		 * of the specified parent view.
		 *
		 * @param parentView The parent view.
		 * @param viewName The name of the child view to be created.
		 *
		 * @return The name of the module to use for the view type.
		 */
		_getDefaultViewType: function(parentView, viewName) {
			return this.defaultViewType;
		},
		
		/**
		 * Returns the name of the default idx/app/Placer implementation
		 * to use.  This returns "idx/app/Placer" by default.
		 */
		_getDefaultPlacerName: function() {
			return this.defaultPlacer;
		},
				
		/**
		 * Splits the view constraint into an array if it has multiple parts.
		 *
		 * @return The array representing the split view constraint.
		 */
		_splitViewConstraint: function(constraint) {
			return iString.unescapedSplit(constraint, "/");
		},
		
		/**
		 * Returns the view configuration to use for creating
		 * the child view.
		 * 
		 * @param {Object} parent the parent of the child.
		 * @param {String} childID The ID of the child.
		 *
		 * @return The configuration for the view.
		 */
		_getViewConfig: function(parent, childID) {
			return parent.views[childID];
		},
				
		/**
		 * Tries to obtain the title for a view if available.
		 * If not available, returns empty-string.
		 */
		_getViewTitle: function(view) {
			var title = iString.nullTrim(view.title);
			if (title) return title;
			var titleKey = null;
			try {
				titleKey = dString.substitute(this.viewTitleKeyFormat, view);
			} catch (e) {
				// ignore
			}
			if (titleKey) {
				title = iString.nullTrim(view.nls[titleKey]);
			}
			return (title?title:"");
		},
		
		/**
		 * Formats a unique identifier for the child given the
		 * specified parent and the child view ID.
		 *
		 * @param {Object} parent The parent from which to obtain the parent ID.
		 * @param {String} viewID The view ID of the child.
		 */
		_formatChildViewIdentifier: function(parent, viewID) {
			return parent.id + "_" + viewID.replace(/_/g,"\\_");
		},
		
		/**
		 * Gets the lineage for the specified view.
		 *
		 * @param view The view for which the lineage is being requested.
		 *
		 * @return The array representing the lineage for the view.
		 */
		_getViewLineage: function(view) {
			var current = view;
			var result = [];
			while (current && (current !== this)) {
				result.push(current.name);
				current = current.parent;
			}
			return result.reverse();
		},
		
		/**
		 * Shortcut method to obtain the parent's view lineage, append the child ID, 
		 * and then encode the new lineage including the child ID and return it.
		 * 
		 * @param parent {Object} The parent view.
		 * @param childID {String} The relative ID of the child.
		 * @return {String} The encoded view ID of the child relative to the parent.
		 */
		_encodeViewChildLineage: function(parent, childID) {
			var lineage = this._getViewLineage(parent);
			lineage.push(childID);
			return this._encodeViewLineage(lineage);
		},
		
	    /**
		 * Encodes the view lineage as a string.  This can then
		 * be decoded as a view path via _decodeViewPaths()
		 *
		 * @param {String[]} viewLineage The lineage represented as an array of strings.
		 * @return The encoded string for the lineage.
		 */
		_encodeViewLineage: function(viewLineage) {
			if (!viewLineage || viewLineage.length == 0) return null;
			return viewLineage.join(",");
		},
		
		/**
		 * Extracts the default views from the specified view
		 * and fully qualifies them returnining view paths in
		 * the following form:
		 * [ 
		 *   { id: "encodedViewID",
		 *     remove: true|false,
		 *     lineage: [ "encodedViewID", "encodedViewID", ... ]
		 *   },
		 *   { id: "encodedViewID",
		 *     remove: true|false,
		 *     lineage: [ "encodedViewID", "encodedViewID", ... ]
		 *   },
		 *   . . .
		 * ]
		 *
		 * @param {Object} view The view from which the default views are extracted.
		 * @param {Boolean} fullyQualified true if views should be fully qualified, otherwise false.
		 * @return The array of view paths as described above.
		 */
		_decodeDefaultViews: function(view, fullyQualified) {
			var parent = view;
			if (!view.defaultView) return null;
			var lineage = [ ];
			while(parent !== this){
				lineage.push(parent.name);
				parent = parent.parent;
			}
			lineage.reverse();
			var prefix = (lineage.length == 0) ? "" :lineage.join(",") + ",";
			var encodedPaths = view.defaultView;
			console.log("DEFAULT VIEW ATTR: " + view.defaultView);
			var sepIndices = iString.unescapedIndexesOf(encodedPaths, "+-");
			var siblings = iString.unescapedSplit(encodedPaths, "+-");
			console.log("SIBLING COUNT: " + siblings.length);
			var result = [];
			var index = 0;
			var removes = [];
			var sepIndex = 0;
			var sep = "";
			var encodedDefault = "";
			for (index = 0; index < sepIndices.length; index++) {
				sepIndex = sepIndices[index];
				sep = encodedPaths.charAt(sepIndex);
				removes.push(sep== "-" ? true : false);
			}
			if ((sepIndices.length > 0) && (sepIndices[0]==0)) {
				// we begin with a separator so ignore first sibling
				// which should be empty-string
				siblings.shift();
			} else {
				// the first character is not a plus or minus, so assume
				// it is a plus by default so the first sibling is an add
				removes.unshift(false);
			}
			for (index = 0; index < siblings.length; index++) {
				encodedDefault = (fullyQualified?prefix:"") + siblings[index];
				result.push({
					id: encodedDefault,
					remove: removes[index],
					lineage: iString.unescapedSplit(encodedDefault, ",")
				});
			}
			return result;
		},
		
		/**
		 * Extracts the views form the specified string
		 * and returns an array of objects.  Each element
		 * in the array is a sibling or cousin view and 
		 * in turn contains a lineage.  The returned array
		 * takes the following form:
		 * [ 
		 *   { id: "encodedViewID",
		 *     remove: true|false,
		 *     lineage: [ "encodedViewID", "encodedViewID", ... ]
		 *   },
		 *   { id: "encodedViewID",
		 *     remove: true|false,
		 *     lineage: [ "encodedViewID", "encodedViewID", ... ]
		 *   },
		 *   . . .
		 * ]
		 */
		_decodeViewPaths: function(encodedPaths) {
			if (!iString.nullTrim(encodedPaths)) return null;
			var sepIndices = iString.unescapedIndexesOf(encodedPaths, "+-");
			var siblings = iString.unescapedSplit(encodedPaths, "+-");
			var result = [];
			var index = 0;
			var removes = [];
			var sepIndex = 0;
			var sep = "";
			for (index = 0; index < sepIndices.length; index++) {
				sepIndex = sepIndices[index];
				sep = encodedPaths.charAt(sepIndex);
				removes.push(sep== "-" ? true : false);
			}
			if ((sepIndices.length > 0) && (sepIndices[0]==0)) {
				// we begin with a separator so ignore first sibling
				// which should be empty-string
				siblings.shift();
			} else {
				// the first character is not a plus or minux, so assume
				// it is a plus by default so the first sibling is an add
				removes.unshift(false);
			}
			for (index = 0; index < siblings.length; index++) {
				result.push({
					id: siblings[index],
					remove: removes[index],
					lineage: iString.unescapedSplit(siblings[index], ",")
				});
			}
			return result;
		},

		/**
		 * Saves the specified view array structure to the specified event.
		 * By default this encodes it as a string and saves it in the "viewId" 
		 * field of the event.
		 */
		_encodeViewPaths: function(viewPaths) {
			var encodedViews = "";
			dArray.forEach(viewPaths, dLang.hitch(this, function(viewPath) {
				if ((encodedViews.length > 0) || (viewPath.remove)) {
					encodedViews = encodedViews + (viewPath.remove?"-":"+");
				}
				encodedViews = encodedViews + viewPath.id;
			}));
			return encodedViews;
		}
	});
});
		