define(["require", 
		"dojo/_base/lang", 
		"dojo/_base/array",
		"dojo/_base/declare", 
		"dojo/has", 
		"dojo/on", 
		"dojo/Deferred", 
		"dojo/when",
	    "dojo/dom-style", 
		"dojox/app/Controller", 
		"dojox/app/utils/constraints",
		"idx/string"],
	function(require, 
			 dLang, 
			 dArray,
			 dDeclare, 
			 dHas, 
			 dOn, 
			 dDeferred, 
			 dWhen, 
			 dDomStyle, 
			 dController, 
			 dConstraints,
			 iString){

	var transit;
	var MODULE = "idx/app/controllers/Transition";
	var LOGKEY = "logTransitions:";
	var eventID = 0;
	
	/**
	 * Defines a Transition controller that works with idx/app/mixins/_AppMixin
	 */
	return dDeclare("idx.app.controllers.Transition", dController, {

		proceeding: false,

		waitingQueue:[],

		/**
		 * Constructor which binds to events.
		 */
		constructor: function(app, events){
			this.events = {
				"app-transition": this.transition,
				"app-domNode": this.onDomNodeChange
			};
			require([this.app.transit || "dojox/css3/transit"], function(t){
				transit = t;
			});
			if(this.app.domNode){
				this.onDomNodeChange({oldNode: null, newNode: this.app.domNode});
			}
		},


		/**
		 * Response to dojox/app "app-transition" event.
		 */
		transition: function(event){
			var F = MODULE+":transition";
			this.app.log(LOGKEY,F,"New Transition event.viewId=["+event.viewId+"]");
			this.app.log(F,"event.viewId=["+event.viewId+"]","event.opts=",event.opts);

			var viewPaths = this.app._decodeViewPaths(event.viewId);
			var viewPath, newEvent, index;
			var queue = [];
			var item = null;

			if(viewPaths.length > 0) {
				for (index = 0; index < viewPaths.length; index++) {
					viewPath = viewPaths[index];
					newEvent = dLang.clone(event);
					newEvent.eventID = eventID++;
					newEvent.viewId = viewPath.id;
					newEvent._removeView = viewPath.remove;
					newEvent._doResize = (index<viewPaths.length-1)?false: true;
					queue.push({
						viewPath: viewPath,
						event: newEvent,
						queue: queue,
						origEvent: event
					});
				}
			} else {
				queue.push({
					event: event,
					queue: queue,
					origEvent: event
				});
				event._doResize = true; // at the end of the last transition call resize
				event._removeView = false;
			}
			
			// now that the triggers are setup, set off the first
			item = queue.shift();
			this._processQueueItem(item);
		},

		/**
		 * Loads an item from the queue, possibly updates the queue with new
		 * default views, performs the required transitions, and then triggers
		 * the next item on the queue (if any) to be processed.
		 * 
		 * @param item The item to be processed (already removed from queue).
		 */
		_processQueueItem: function(item) {
			var loadEvent = { };
			var transEvent = item.event;
			var viewPath = item.viewPath;
			var params = transEvent.params || transEvent.opts.params;
			loadEvent.viewId = transEvent.viewId;
			loadEvent.params = params;
			loadEvent.forceTransitionNone = transEvent.forceTransitionNone;
			loadEvent.eventID = eventID++;
			// setup the callback
			loadEvent.callback = dLang.hitch(this, function(defaultViewPaths) {
				var templateEvent = null;
				var newEvent = null;
				var defaultViewPath = null;
				var defaultViewEvents = [];
				var queue = item.queue;
				var index = 0;
				// check if we have default views to transition to
				if (defaultViewPaths && defaultViewPaths.length>0) {
					// we have default views so setup a transition event for each
					templateEvent = {
						defaultView: true,
						forceTransitionNone: loadEvent.forceTransitionNone,
						opts: { params: params }
					};
					for (index = 0; index < defaultViewPaths.length; index++) {
						defaultViewPath = defaultViewPaths[index];
						newEvent = dLang.clone(templateEvent);
						newEvent.viewId = this.app._encodeViewPaths([defaultViewPath]);
						newEvent.eventID = eventID++;
						newEvent._removeView = defaultViewPath.remove;
						newEvent._doResize = (queue.length==0 && index==defaultViewPaths.length-1)?true:false,
						defaultViewEvents.push(newEvent);
					}

					// push new items on to the front of the queue
					for (index = defaultViewEvents.length-1; index >= 0; index--) {
						queue.unshift({
							viewPath: defaultViewPaths[index],
							event: defaultViewEvents[index],
							queue: queue
						});
					}
					// process the next item WITHOUT doing the transition for this
					// item.  At least one (if not multiple default views) will handle
					// doing the transition for this item since it is handled recursively
					// from the root of the view lineage
					if (queue.length > 0) {
						// delay doing any transition or layout since the default 
						// views should trigger that since they are down-stream
						this._processQueueItem(queue.shift());
					} else {
						if (item.origEvent && item.origEvent.callback) {
							item.origEvent.callback();
						}
					}
				} else {
					// perform the transition and layout now
					var transComplete = this._doTransition(viewPath, 
														   transEvent.opts, 
														   params, 
														   transEvent.opts.data, 
														   this.app, 
														   transEvent._removeView, 
														   transEvent._doResize, 
														   transEvent.forceTransitionNone);
														   
					// wait for the transition to complete before processing the next item
					// TODO: look into this since we should be able to optimize so we avoid
					// waiting for off-screen transitions (not sure if already handled)
					dWhen(transComplete, dLang.hitch(this, function(){
						var nextItem = null;
						if (queue.length > 0) {
							nextItem = queue.shift();
							this._processQueueItem(nextItem);
						} else {
							if (item.origEvent && item.origEvent.callback) {
								item.origEvent.callback();
							}
						}
					}));
				}
			});						
			
			// emit the event
			this.app.emit("app-load", loadEvent);
		},
		
		/**
		 *
		 */
		onDomNodeChange: function(evt){
			if(evt.oldNode != null){
				this.unbind(evt.oldNode, "startTransition");
			}
			this.bind(evt.newNode, "startTransition", dLang.hitch(this, this.onStartTransition));
		},

		/**
		 * Response to dojox/app "startTransition" event.
		 */
		onStartTransition: function(evt){
			if(evt.preventDefault){
				evt.preventDefault();
			}
			evt.cancelBubble = true;
			if(evt.stopPropagation){
				evt.stopPropagation();
			}

			var target = evt.detail.target;
			var regex = /#(.+)/;
			if(!target && regex.test(evt.detail.href)){
				target = evt.detail.href.match(regex)[1];
			}

			// transition to the target view
			this.transition({ "viewId":target, opts: dLang.mixin({}, evt.detail), data: evt.detail.data });
		},

		/** 
	     * Get view's transition type from the config for the view or from the parent view recursively.
	     * If not available use the transition option otherwise get view default transition type in the
		 * config from parent view.
		 */
		_getTransition: function(nextView, parent, transitionTo, opts, forceTransitionNone){
			if(forceTransitionNone){
				return "none";
			}
			var parentView = parent;
			var transition = null;
			if(nextView){
				transition = nextView.transition;
			}
			if(!transition && parentView.views[transitionTo]){
				transition = parentView.views[transitionTo].transition;
			} 
			if(!transition){
				transition = parentView.transition;
			}
			var defaultTransition = (nextView && nextView.defaultTransition) ?  nextView.defaultTransition : parentView.defaultTransition;
			while(!transition && parentView.parent){
				parentView = parentView.parent;
				transition = parentView.transition;
				if(!defaultTransition){
					defaultTransition = parentView.defaultTransition;
				}
			}
			return transition || opts.transition || defaultTransition || "none";
		},


		/**
		 * Get view's params only include view specific params if they are for this view.
		 * 
		 * @param {String} view The view's name.
		 * @param {Object} params The view params.
		 * @return {Object} The object params for this view.
		 */
		_getParamsForView: function(view, params){
			var viewParams = {};
			for(var item in params){
				var value = params[item];
				if(dLang.isObject(value)){	// view specific params
					if(item == view){		// it is for this view
						// need to add these params for the view
						viewParams = dLang.mixin(viewParams, value);
					} 
				}else{	// these params are for all views, so add them
					if(item && value != null){
						viewParams[item] = params[item];
					}
				}
			}
			return viewParams;
		},

		/**
		 * Transitions from the currently visible view to the defined view.
		 * It should determine what would be the best transition unless
		 * an override in opts tells it to use a specific transitioning methodology
		 * the transitionTo is a string in the form of [view1,view2].
		 *
		 * @param {Object} transitionTo Transition to view path (as parsed from app._decodeViewPaths());
		 * @param {Object} opts Transition options.
		 * @param {Object} params The parameters
		 * @param {Object} data data object that will be passed on activate & de-activate methods of the view
		 * @param {Object} parent The view's parent.
		 * @param {Boolean} removeView Remove view instead of transition to it.
		 * @param {Boolean} forceTransitionNone Force the transition type to be none (used for initial default view)
		 * @param {Boolean} nested Whether the mthod is called from the transitioning of a parent view.
		 *
		 * @return {Promise} Transit dojo/promise/all object.
		 */
		_doTransition: function(transitionTo, opts, params, data, parent, removeView, doResize, forceTransitionNone, nested){
			var F = MODULE+":_doTransition";

			if(!parent){
				throw Error("view parent not found in transition.");
			}

			this.app.log(F+" transitionTo=[",(transitionTo?transitionTo.id:null),"], removeView=[",removeView,"] parent.name=[",parent.name,"], opts=",opts);

			var parts, toId, subIDs, next;
			parts = transitionTo.lineage.concat([]); // clone the array
			
			toId = parts.shift();
			subIDs = this.app._encodeViewLineage(parts);
		
			var childID = this.app._formatChildViewIdentifier(parent, toId);
			
			// next is loaded and ready for transition
			next = parent.children[childID];
			if(!next){
				if(removeView){
					this.app.log(F+" called with removeView true, but that view is not available to remove");
					return;	// trying to remove a view which is not showing
				}
				throw Error("child view must be loaded before transition.");
			}

			var nextSubViewArray = [next || parent];
			if(subIDs){
				nextSubViewArray = this._getNextSubViewArray(parts, next, parent);
			}

			var context = {};
			var current = dConstraints.getSelectedChild(parent, next.constraint);
			var currentSubViewArray = this._getCurrentSubViewArray(parent, nextSubViewArray, removeView, context);

			var currentSubNames = this._getCurrentSubViewNamesArray(currentSubViewArray);

			// set params on next view.
			next.params = this._getParamsForView(next.name, params);

			if(removeView){
				if(next !== current){ // nothing to remove
					this.app.log(F+" called with removeView true, but that view is not available to remove");
					return;	// trying to remove a view which is not showing
				}	
				this.app.log(LOGKEY,F,"Transition Remove current From=["+currentSubNames+"]");
				// if next == current we will set next to null and remove the view with out a replacement
				next = null;
			}

			// get the list of nextSubNames, this is next.name followed by the subIDs
			var nextSubNames = "";
			if(next){
				nextSubNames = next.name;
				if(subIDs){
					nextSubNames = nextSubNames+","+subIDs;
				}
			}

			if((nextSubNames == (""+currentSubNames)) && (next == current)){ // new test to see if current matches next
				this.app.log(LOGKEY,F,"Transition current and next DO MATCH From=["+currentSubNames+"] TO=["+nextSubNames+"]");
				this._handleMatchingViews(nextSubViewArray, next, current, parent, data, removeView, doResize, subIDs, currentSubNames, toId, forceTransitionNone, opts, context);

			}else{
				this.app.log(LOGKEY,F,"Transition current and next DO NOT MATCH From=["+currentSubNames+"] TO=["+nextSubNames+"]");
				//When clicking fast, history module will cache the transition request que
				//and prevent the transition conflicts.
				//Originally when we conduct transition, selectedChild will not be the
				//view we want to start transition. For example, during transition 1 -> 2
				//if user click button to transition to 3 and then transition to 1. After
				//1->2 completes, it will perform transition 2 -> 3 and 2 -> 1 because
				//selectedChild is always point to 2 during 1 -> 2 transition and transition
				//will record 2->3 and 2->1 right after the button is clicked.

				//assume next is already loaded so that this.set(...) will not return
				//a promise object. this.set(...) will handles the this.selectedChild,
				//activate or deactivate views and refresh layout.

				//necessary, to avoid a flash when the layout sets display before resize
				if(!removeView && next){
					var nextLastSubChild = context.nextLastSubChildMatch || next;
					var startHiding = false; // only hide views which will transition in
					for(var i = nextSubViewArray.length-1; i >= 0; i--){
						var v = nextSubViewArray[i];
						if(startHiding || v.id == nextLastSubChild.id){
							startHiding = true;
							if(!v._needsResize && v.domNode){
								this.app.log(LOGKEY,F," setting domStyle visibility hidden for v.id=["+v.id+"], display=["+v.domNode.style.display+"], visibility=["+v.domNode.style.visibility+"]");
								this._setViewVisible(v, false);
							}
						}
					}
				}

				if(current && current._active){
					this._handleBeforeDeactivateCalls(currentSubViewArray, context.nextLastSubChildMatch || next, current, data, subIDs);
				}
				if(next){
					this.app.log(F+" calling _handleBeforeActivateCalls next name=[",next.name,"], parent.name=[",next.parent.name,"]");
					this._handleBeforeActivateCalls(nextSubViewArray, context.currentLastSubChildMatch || current, data, subIDs);
				}
				if(!removeView){
					var nextLastSubChild = context.nextLastSubChildMatch || next;
					var trans = this._getTransition(nextLastSubChild, parent, toId, opts, forceTransitionNone)
					this.app.log(F+" calling _handleLayoutAndResizeCalls trans="+trans);
					this._handleLayoutAndResizeCalls(nextSubViewArray, removeView, doResize, subIDs, forceTransitionNone, trans, context);
				}else{
					// for removeView need to set visible before transition do it here
					for(var i = 0; i < nextSubViewArray.length; i++){
						var v = nextSubViewArray[i];
						this.app.log(LOGKEY,F,"setting visibility visible for v.id=["+v.id+"]");
						if(v.domNode){
							this.app.log(LOGKEY,F,"  setting domStyle for removeView visibility visible for v.id=["+v.id+"], display=["+v.domNode.style.display+"]");
							this._setViewVisible(v, true);
						}
					}
				}
				var result = true;

				// context.currentLastSubChildMatch holds the view to transition from
				if(transit && (!nested || context.currentLastSubChildMatch != null) && context.currentLastSubChildMatch !== next){
					// css3 transit has the check for IE so it will not try to do it on ie, so we do not need to check it here.
					// We skip in we are transitioning to a nested view from a parent view and that nested view
					// did not have any current
					result = this._handleTransit(next, parent, context.currentLastSubChildMatch, opts, toId, removeView, forceTransitionNone, doResize, context);
				}
				dWhen(result, dLang.hitch(this, function(){
					if(next){
						this.app.log(F+" back from transit for next ="+next.name);
					}
					if(removeView){
						var nextLastSubChild = context.nextLastSubChildMatch || next;
						var trans = this._getTransition(nextLastSubChild, parent, toId, opts, forceTransitionNone);
						this._handleLayoutAndResizeCalls(nextSubViewArray, removeView, doResize, subIDs, forceTransitionNone, trans, context);
					}

					// Add call to handleAfterDeactivate and handleAfterActivate here!
					this._handleAfterDeactivateCalls(currentSubViewArray, context.nextLastSubChildMatch || next, current, data, subIDs);
					this._handleAfterActivateCalls(nextSubViewArray, removeView, context.currentLastSubChildMatch || current, data, subIDs);
				}));
				return result; // dojo/promise/all
			}
		},

		/**
		 * Called when the current views and the next views match.
		 * @private
		 */
		_handleMatchingViews: function(subs, next, current, parent, data, removeView, doResize, subIDs, currentSubNames, toId, forceTransitionNone, opts, context){
			var F = MODULE+":_handleMatchingViews";

			this._handleBeforeDeactivateCalls(subs, context.nextLastSubChildMatch || next, current, data, subIDs);
			// this is the order that things were being done before on a reload of the same views, so I left it
			// calling _handleAfterDeactivateCalls here instead of after _handleLayoutAndResizeCalls
			this._handleAfterDeactivateCalls(subs, context.nextLastSubChildMatch || next, current, data, subIDs);
			this._handleBeforeActivateCalls(subs, context.currentLastSubChildMatch || current, data, subIDs);
			var nextLastSubChild = context.nextLastSubChildMatch || next;
			var trans = this._getTransition(nextLastSubChild, parent, toId, opts, forceTransitionNone)
			this._handleLayoutAndResizeCalls(subs, removeView, doResize, subIDs, forceTransitionNone, trans, context);
			this._handleAfterActivateCalls(subs, removeView, context.currentLastSubChildMatch || current, data, subIDs);
		},

		/**
	 	 * Call beforeDeactivate for each of the current views which are about to be deactivated
		 * @private
		 */
		_handleBeforeDeactivateCalls: function(subs, next, current, /*parent,*/ data, /*removeView, doResize,*/ subIDs/*, currentSubNames*/){
			var F = MODULE+":_handleBeforeDeactivateCalls";
			if(current._active){
				//now we need to loop backwards thru subs calling beforeDeactivate
				for(var i = subs.length-1; i >= 0; i--){
					var v = subs[i];
					if(v && v.beforeDeactivate && v._active){
						this.app.log(LOGKEY,F,"beforeDeactivate for v.id="+v.id);
						v.beforeDeactivate(next, data);
					}
				}
			}
		},

		/**
		 * Call afterDeactivate for each of the current views which have been deactivated
		 * @private
		 */
		_handleAfterDeactivateCalls: function(subs, next, current, data, subIDs){
			var F = MODULE+":_handleAfterDeactivateCalls";
			if(current && current._active){
				//now we need to loop forwards thru subs calling afterDeactivate
				for(var i = 0; i < subs.length; i++){
					var v = subs[i];
					if(v && v.beforeDeactivate && v._active){
						this.app.log(LOGKEY,F,"afterDeactivate for v.id="+v.id);
						v.afterDeactivate(next, data);
						v._active = false;
					}
				}

			}
		},

		/**
		 * Call beforeActivate for each of the next views about to be activated
		 * @private
		 */
		_handleBeforeActivateCalls: function(subs, current, data, subIDs){
			var F = MODULE+":_handleBeforeActivateCalls";
			//now we need to loop backwards thru subs calling beforeActivate (ok since next matches current)
			for(var i = subs.length-1; i >= 0; i--){
				var v = subs[i];
				this.app.log(LOGKEY,F,"beforeActivate for v.id="+v.id);
				v.beforeActivate(current, data);
			}
		},

		/** 
		 * fire app-layoutView for each of the next views about to be activated, and fire app-resize if doResize is true
		 * @private
		 */
		_handleLayoutAndResizeCalls: function(subs, removeView, doResize, subIDs, forceTransitionNone, transition, context){
			var F = MODULE+":_handleLayoutAndResizeCalls";
			var remove = removeView;
			for(var i = 0; i < subs.length; i++){
				var v = subs[i];
				this.app.log(LOGKEY,F,"emit layoutView v.id=["+v.id+"] removeView=["+remove+"]");
				// it seems like we should be able to minimize calls to resize by passing doResize: false and only doing resize on the app-resize emit
				this.app.emit("app-layoutView", {"parent": v.parent, "view": v, "removeView": remove, "doResize": false, "transition": transition, "currentLastSubChildMatch": context.currentLastSubChildMatch});
				remove = false;
			}
			if(doResize){
				this.app.log(LOGKEY,F,"emit doResize called");
				this.app.emit("app-resize"); // after last layoutView fire app-resize
				if(transition == "none"){
					this._showSelectedChildren(this.app); // Need to set visible too before transition do it now.
				}
			}

		},

		_showSelectedChildren: function(w){
			var F = MODULE+":_showSelectedChildren";
			this.app.log(LOGKEY,F," setting domStyle visibility visible for w.id=["+w.id+"], display=["+w.domNode.style.display+"], visibility=["+w.domNode.style.visibility+"]");
			this._setViewVisible(w, true);
			w._needsResize = false;
			for(var hash in w.selectedChildren){	// need this to handle all selectedChildren
				if(w.selectedChildren[hash] && w.selectedChildren[hash].domNode){
					this.app.log(LOGKEY,F," calling _showSelectedChildren for w.selectedChildren[hash].id="+w.selectedChildren[hash].id);
					this._showSelectedChildren(w.selectedChildren[hash]);
				}
			}
		},

		_setViewVisible: function(v, visible){
			if(visible){
				dDomStyle.set(v.domNode, "visibility", "visible");
			}else{
				dDomStyle.set(v.domNode, "visibility", "hidden");
			}
		},


		/**
		 * Call afterActivate for each of the next views which have been activated
		 */
		_handleAfterActivateCalls: function(subs, removeView, current, data, subIDs){
			var F = MODULE+":_handleAfterActivateCalls";
			//now we need to loop backwards thru subs calling beforeActivate (ok since next matches current)
			var startInt = 0;
			if(removeView && subs.length > 1){
				startInt = 1;
			}
			for(var i = startInt; i < subs.length; i++){
				var v = subs[i];
				if(v.afterActivate){
					this.app.log(LOGKEY,F,"afterActivate for v.id="+v.id);
					v.afterActivate(current, data);
					v._active = true;
				}
			}
		},

		/**
		 * Get next sub view array, this array will hold the views which are about to be transitioned to
		 * 
		 * @param {String[]} subIDs An array of strings for the subviews.
		 * @param {Object} next The next view to be transitioned to.
		 * @param {Object} parent The parent view used in place of next if next is not set.
		 */
		_getNextSubViewArray: function(subIDs, next, parent){
			var F = MODULE+":_getNextSubViewArray";
			var parts = subIDs.concat([]);
			var p = next || parent;
			var nextSubViewArray = [p];
			for(var i = 0; i < parts.length; i++){
				toId = parts[i];
				var id = this.app._formatChildViewIdentifier(p,toId);
				var v = p.children[id];
				if(v){
					nextSubViewArray.push(v);
					p = v;
				}
			}
			nextSubViewArray.reverse();
			return nextSubViewArray;
		},
		
		/**
		 * Get current sub view array which will be replaced by the views in the nextSubViewArray
		 * 
		 * @param {Object} parent The parent view hose selected children will be replaced.
		 * @param {Object[]} nextSubViewArray The array of views which are to be transitioned to.
		 * @param {Boolean} removeView Flag indicating if removing the views.
		 * @return {Object[]} Array of views which will be deactivated during this transition
		 */
		_getCurrentSubViewArray: function(parent, nextSubViewArray, removeView, context){
			var F = MODULE+":_getCurrentSubViewArray";
			var currentSubViewArray = [];
			var constraint, type, hash;
			var p = parent;
			context.currentLastSubChildMatch = null;
			context.nextLastSubChildMatch = null;

			for(var i = nextSubViewArray.length-1; i >= 0; i--){
				constraint = nextSubViewArray[i].constraint;
				type = typeof(constraint);
				hash = (type == "string" || type == "number") ? constraint : constraint.__hash;
				// if there is a selected child for this constraint, and the child matches this view, push it.
				if(p && p.selectedChildren && p.selectedChildren[hash]){
					if(p.selectedChildren[hash] == nextSubViewArray[i]){
						context.currentLastSubChildMatch = p.selectedChildren[hash];
						context.nextLastSubChildMatch = nextSubViewArray[i];
						currentSubViewArray.push(context.currentLastSubChildMatch);
						p = context.currentLastSubChildMatch;
					}else{
						context.currentLastSubChildMatch = p.selectedChildren[hash];
						currentSubViewArray.push(context.currentLastSubChildMatch);
						context.nextLastSubChildMatch = nextSubViewArray[i]; // setting this means the transition will be done to the child instead of the parent
						// since the constraint was set, but it did not match, need to deactivate all selected children of context.currentLastSubChildMatch
						if(!removeView){
							var selChildren = dConstraints.getAllSelectedChildren(context.currentLastSubChildMatch);
							currentSubViewArray = currentSubViewArray.concat(selChildren);
						}
						break;
					}
				}else{ // the else is for the constraint not matching which means no more to deactivate.
					context.currentLastSubChildMatch = null; // there was no view selected for this constraint
					context.nextLastSubChildMatch = nextSubViewArray[i]; // set this to the next view for transition to an empty constraint
					break;
				}

			}
			// Here since they had the constraint but it was not the same I need to deactivate all children of p
			if(removeView){
				var selChildren = dConstraints.getAllSelectedChildren(p);
				currentSubViewArray = currentSubViewArray.concat(selChildren);
			}

			return currentSubViewArray;
		},

		/**
		 * Get current sub view names array, the names of the views which will be transitioned from
		 * @param {Object[]} The array of views which are being transitioned from.
		 * @return {String[]} Array of views that will be deactovated during this transition.
		 */
		_getCurrentSubViewNamesArray: function(currentSubViewArray){
			var F = MODULE+":_getCurrentSubViewNamesArray";
			var currentSubViewNamesArray = [];
			for(var i = 0; i < currentSubViewArray.length; i++){
				currentSubViewNamesArray.push(currentSubViewArray[i].name);
			}
			return currentSubViewNamesArray;
		},

		/**
		 * Setup the options and call transit to do the transition
		 * @param {Object} next The next view, the view which will be transitioned to.
		 * @param {Object} parent The parent view which is used to get the transition type to be used.
		 * @param {Object} currentLastSubChild The current view which is being transitioned away from.
		 * @param {Object} opts The options used for the transition.
		 * @param {String} toId The id of the view being transitioned to.
		 * @param {Boolean} removeView true if the view is being removed.
		 * @param {Boolean} forceTransitionNone true if the transition type should be forced to none.
		 * @param {Boolean} resizeDone true if resize was called before this transition.
		 * @param {Object} context The context for the current transition.
		 * @return {Promise} The promise object returned by the call to transit.
		 */
		_handleTransit: function(next, parent, currentLastSubChild, opts, toId, removeView, forceTransitionNone, resizeDone, context){
			var F = MODULE+":_handleTransit";

			var nextLastSubChild = context.nextLastSubChildMatch || next;

			var mergedOpts = dLang.mixin({}, opts); // handle reverse from mergedOpts or transitionDir
			mergedOpts = dLang.mixin({}, mergedOpts, {
				reverse: (mergedOpts.reverse || mergedOpts.transitionDir === -1)?true:false,
				// if transition is set for the view (or parent) in the config use it, otherwise use it from the event or defaultTransition from the config
				transition: this._getTransition(nextLastSubChild, parent, toId, mergedOpts, forceTransitionNone)
			});

			if(removeView){
				nextLastSubChild = null;
			}
			if(currentLastSubChild){
				this.app.log(LOGKEY,F,"transit FROM currentLastSubChild.id=["+currentLastSubChild.id+"]");
			}
			if(nextLastSubChild){
				if(mergedOpts.transition !== "none"){
					if(!resizeDone && nextLastSubChild._needsResize){ // need to resize if not done yet or things will not be positioned correctly
						this.app.log(LOGKEY,F,"emit doResize called from _handleTransit");
						this.app.emit("app-resize"); // after last layoutView fire app-resize
					}
					this.app.log(LOGKEY,F,"  calling _showSelectedChildren for w3.id=["+nextLastSubChild.id+"], display=["+nextLastSubChild.domNode.style.display+"], visibility=["+nextLastSubChild.domNode.style.visibility+"]");
					this._showSelectedChildren(this.app); // Need to set visible too before transition do it now.
				}
				this.app.log(LOGKEY,F,"transit TO nextLastSubChild.id=["+nextLastSubChild.id+"] transition=["+mergedOpts.transition+"]");
			}else{
				this._showSelectedChildren(this.app); // Need to set visible too before transition do it now.
			}
			return transit(currentLastSubChild && currentLastSubChild.domNode, nextLastSubChild && nextLastSubChild.domNode, mergedOpts);
		}

	});
});
