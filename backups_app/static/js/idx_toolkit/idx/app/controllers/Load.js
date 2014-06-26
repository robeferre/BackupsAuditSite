define(["require", 
		"dojo/_base/lang", 
		"dojo/_base/array",
		"dojo/_base/declare", 
		"dojo/on", 
		"dojo/Deferred", 
		"dojo/when", 
		"dojo/promise/all",
		"dojo/dom-style", 
		"dojox/app/Controller",
		"idx/string"],
	function(require, 
			 dLang, 
			 dArray,
			 dDeclare, 
			 dOn, 
			 dDeferred, 
			 dWhen, 
			 dPromiseAll,
			 dDomStyle, 
			 dController,
			 iString){
			 
return dDeclare("idx.app.controllers.Load", dController, {

		/**
		 * Constructor that sets up and binds the events.
		 * @constructor
		 */
		constructor: function(app, events){
			this.events = {
				"app-init": this.init,
				"app-load": this.load
			};
		},

		/**
		 * Handle app-init event and return a promise for completion.
		 * The returned promise provides the root view that gets created.
		 */
		init: function(event){
			// created a deferred promise for the root view on app
			var deferred = new dDeferred();
			
			// allow the template string and controller to be promises
			var rootPromise = dPromiseAll([event.templateString,event.controller]);
			
			dWhen(rootPromise, dLang.hitch(this, function(values) {
				// extract fields from the event
				var parent = event.parent;
				var tmpl   = values[0];
				var ctrl   = values[1];
				var type   = event.type;
			
				// create the view -- TODO: check if should use null instead of "^root" for root ID (like Ed did)
				var promise = this.createView(
					parent, "^root", null, {templateString: tmpl, controller: ctrl }, null, type);
				
				// when the view is created, record the view and start it
				dWhen(promise, dLang.hitch(this, function(newView){
					// change from standard Load controller to set the app's root view
					this.app.rootView = newView;
					
					// do the callback after starting the new view
					dWhen(newView.start(), dLang.hitch(this, function() {
						// initialize the root view
						var promise = this._initRootView(newView);
						
						// resolve the deferred
						dWhen(promise, dLang.hitch(this, function() {
							deferred.resolve(newView);
						}));
					}));					
				}));
			}));
			
			// call the original event callback
			deferred.then(event.callback);
			
			// return the rootView promise
			return deferred.promise;
		},		

		/**
		 * This method is called by "init" to handle initialization of the root view after
		 * it is created.  This method may return a promise if initialization occurs 
		 * asynchronously.  The "app-init" will not fully resolve its promise until the 
		 * promise (if any) returned by this method is fulfilled.
		 *
		 * By default this method checks if a method by the same name exists on the app
		 * itself and calls it.
		 * 
		 * @param [View] rootView The root view reference.
		 */
		_initRootView: function(rootView) {
			var deferred = null;
			var promise = null;
			
			// do nothing (override this if needed)
			if (this.app && this.app._initRootView && dLang.isFunction(this.app._initRootView)) {
				deferred = new dDeferred();
				promise = this.app._initRootView(rootView);
				dWhen(promise, dLang.hitch(this, function(value) {
					deferred.resolve(value);
				}));
				return deferred.promise;
				
			} else {
				return null;
			}
		},
		
		/**
		 * Handles the app-load event for loading one or more views.
		 */
		load: function(event){
			this.app.log("in idx/app/controllers/Load event.viewId="+event.viewId+" event =", event);
			var viewPaths = this.app._decodeViewPaths(event.viewId);
			var viewPath = null;
			if (!viewPaths || viewPaths.length == 0) return null;
			var queue = [];
			var index = 0;
			var item = null;
			var defaultViews = [];
			var transEvent = null;
			
			// create a deferred return value
			var deferred = new dDeferred();
			//if (event.initLoad) {
			//	transEvent = {
			//		viewId: event.viewId,
			//		opts: { params: event.params },
			//		forceTransitionNone: true
			//	};
			//	transEvent.callback = dLang.hitch(this, function() {
			//		deferred.resolve([]);
			//	});
			//	this.app.emit("app-transition", transEvent);
			//	return deferred.promise;
			//}
			// iterate over the view array and setup queue items
			for (index = 0; index < viewPaths.length; index++) {
				// get the next view path
				viewPath = viewPaths[index];
				// create the queued item
				item = {
					viewPath: viewPath,
					queue: queue,
					defaultViews: defaultViews,
					origEvent: event,
					deferred: deferred
				};
				
				// add the event to the item
				item.event = dLang.clone(event);
				item.event.viewId = viewPath.id;
				item.event.callback = null;
				
				// add the item to the queue
				queue.push(item);
			}
			
			// start processing the queue by setting off the first trigger
			if (queue.length > 0) {
				item = queue.shift();
				this._processQueueItem(item);
			}
			
			// return the promise for when we complete
			return deferred.promise;
		},
		
		/**
		 * Handles processing an item on the queue.
		 */
		_processQueueItem: function(item) {
			// load the view with the associated event
			var promise = this.loadView(item.event);
					
			// wait for the view to be loaded
			dWhen(promise,  
				dLang.hitch(this, function(defaultViews) {
					var nextItem = null;
					if (defaultViews) {
						dArray.forEach(defaultViews, dLang.hitch(this, function(view) {
							item.defaultViews.push(view);
						}));
					}
					// once loaded, check for a next item
					if (item.queue.length > 0) {
						nextItem = item.queue.shift();
						this._processQueueItem(nextItem);
					
					} else {
						if (item.origEvent && item.origEvent.callback) {
							item.origEvent.callback(item.defaultViews);
						}
						// otherwise resolve the promise for this function
						item.deferred.resolve(item.defaultViews);
					}
				}),
				dLang.hitch(this, function(msg) {
					item.deferred.reject(msg);
				})
			);
		},
		
		/**
		 * Determines the parent to which the newly created
		 * view should be added using the specified event.
		 * This is called from loadView()
		 */
		_getParent: function(loadEvent) {
			return loadEvent.parent || this.app;
		},
		
		/**
		 * Handles loading each view chain specified for load in app-load event.
		 */
		loadView: function(loadEvent){
			var parent = this._getParent(loadEvent);
			var viewPaths = this.app._decodeViewPaths(loadEvent.viewId); 
			var viewPath = viewPaths[0]; // should only be one
			var parts = viewPath.lineage.concat([]);
			var childID = parts.shift();
			var params = loadEvent.params || "";

			var promise = this.loadChild(parent, childID, parts, params, loadEvent);
			return promise;
		},

		/**
		 * Load child and sub children views recursively.
		 * @param {Object} parent The parent of this view.
		 * @param {String} childID The view ID that needs to be loaded.
		 * @param {String[]} subIDs The array representing the posterity of the child.
		 * @param {Object} params The parameters to use.
		 * @param {Object} loadEvent The load event.
		 *
		 * @return {Promise} The promise for the default views array that need to be created.
		 */
		loadChild: function(parent, childID, subIDs, params, loadEvent){
			if(!parent){
				throw Error("No parent for Child '" + childID + "'.");
			}
			var parts = null, childViews = null;

			// NOTE: original Load controller has logic to handle null
			// childID, but it seems that this method never gets called
			// with a null child ID.
			if(!childID) return null;

			var loadChildDeferred = new dDeferred();
			var createPromise;
			try{
				createPromise = this.createChild(parent, childID, subIDs.concat([]), params);
			}catch(ex){
				console.warn("logTransitions:","","emit reject load exception for =["+childID+"]",ex);
				loadChildDeferred.reject("load child '"+childID+"' error.");
				return loadChildDeferred.promise;
			}
			dWhen(createPromise, dLang.hitch(this, 
				function(child){
					var defaultViews = null;
					var childID = null;
					// if no subIds and current view has default view, load the default view.
					if(!subIDs || subIDs.length == 0) {
						if ((child !== createPromise) && (child.defaultView)) {
							defaultViews = this.app._decodeDefaultViews(child, true);
							this.app.log("logTransitions:","Load:loadChild"," found default views=[ "
										+ defaultViews + " ]");
							loadChildDeferred.resolve(defaultViews);
						}
						loadChildDeferred.resolve(null);
						return;
					} 
				
					var parts = subIDs.concat([]);
					childID = parts.shift();
				
					var subPromise = this.loadChild(child, childID, parts, params, loadEvent);
					dWhen(subPromise, 
						function(defaultViews){
							loadChildDeferred.resolve(defaultViews);
						},
						function(){
							loadChildDeferred.reject("load child '"+childID+"' error.");
						}
					);
				}),
				function(){
					console.warn("loadChildDeferred.REJECT() for ["+childID+"] subIds=["+subIDs+"]");
					loadChildDeferred.reject("load child '"+childID+"' error.")
				}
			);
			return loadChildDeferred.promise; // dojo/Deferred.promise
		},

		/**
		 * Create a view instance if not already loaded by calling createView. This is typically a
		 * dojox/app/View.
		 * 
		 * @param {Object} parent The parent of the view.
		 * @param {String} childID The viw ID that needs to be loaded.
		 * @param {String[]} subIDs the array of sub view IDs.
		 * @return If the view exists, return the view object.  Otherwise, create the
		 *         view and return a dojo.Deferred instance.
		 */
		createChild: function(parent, childID, subIDs, params){
			var id = this.app._formatChildViewIdentifier(parent, childID);
			var viewConfig = this.app._getViewConfig(parent, childID);
			// check for possible default params if no params were provided
			if(!params && viewConfig && viewConfig.defaultParams) {
				params = viewConfig.defaultParams;
			}
			var view = parent.children[id];
			if(view){
				// set params to new value before returning
				if(params){
					view.params = params;
				}
				this.app.log("in app/controllers/Load createChild view is already loaded so return the loaded view with the new parms ",view);
				return view;
			}
			var deferred = new dDeferred();
			// create and start child. return Deferred
			var promise = this.createView(parent, id, childID, null, params, viewConfig.type);
			dWhen(promise, dLang.hitch(this, function(newView){
				parent.children[id] = newView;
				dWhen(newView.start(), function(view){
					deferred.resolve(view);
				});
			}));
			return deferred.promise;
		},

		/**
		 * Create a dojox/app/View instance. Can be overridden to create different type of views.
		 *
		 * @param {Object} parent The parnet of the view.
		 * @param {String} id The ID of the child.
		 * @param {String} name The name to associate with the view.
		 * @param {String} mixin The module name to mixin.
		 * @param {Object} params The parameters for the view.
		 * @param {String} type The MID of the View.  If not provided then "dojox/app/View"
		 *
		 * @return {Promise} The promise that will resolve to the view.
		 */
		createView: function(parent, id, name, mixin, params, type){
			var deferred = new dDeferred();
			var app = this.app;
			var defaultViewType = this.app._getDefaultViewType(parent, name);
			
			require([type?type:defaultViewType], dLang.hitch(this, function(View){
				var newView = new View(dLang.mixin({
					"app": app,
					"id": id,
					"name": name,
					"parent": parent
				}, { "params": params }, mixin));
				deferred.resolve(newView);
			}));
			return deferred;
		}
	});
		
});
