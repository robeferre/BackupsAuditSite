define(["dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dojo/_base/window",
		"dojo/_base/config",
		"dojo/json",
		"dojo/has",
		"dojo/aspect",
		"dojo/when",
		"dojo/Deferred",
		"dojo/dom-geometry",
		"dojo/dom-class",
		"dojo/dom-style",
		"dojo/dom-attr",
		"dojo/query",
		"dojo/topic",
		"dojox/app/Controller",
		"dijit/registry",
		"idx/string"],
function(dDeclare, 
		 dLang, 
		 dArray, 
		 dWindow, 
		 dConfig, 
		 dJson,
		 dHas,
		 dAspect, 
		 dWhen, 
		 dDeferred, 
		 dDomGeometry, 
		 dDomClass,
		 dDomStyle, 
		 dDomAttr, 
		 dQuery, 
		 dTopic,
		 dController, 
		 dRegistry, 
		 iString,
		 iUtil) {
		 	
	var defaultConstraints = {
		"left": 	true,
		"right": 	true,
		"top": 		true,
		"bottom": 	true,
		"leading": 	true,
		"trailing": true
	};

	// used to generate IDs for containers
	var nextContainerID = 0;
	
	var designOrders = {
		"headline": [ "top", "bottom", "leading", "trailing", "center" ],
		"sidebar": [ "leading", "trailing", "top", "bottom", "center" ],
		"topline": [ "top", "leading", "trailing", "bottom", "center" ],
		"bottomline": [ "bottom", "leading", "trailing", "top", "center" ],
		"leaderbar": [ "leading", "top", "bottom", "trailing", "center" ],
		"trailerbar": [ "trailing", "top", "bottom", "leading", "center" ],
		"leftbar": [ "left", "top", "bottom", "right", "center" ],
		"rightbar": [ "right", "top", "bottom", "left", "center" ]
	};
	
	var _baseDirLookup = { "top": "top", "bottom": "bottom", "left": "left", "right": "right" };
	var _dirLookup = {
		"ltr": dLang.mixin({ "leading": "left", "trailing": "right" }, _baseDirLookup),
		"rtl": dLang.mixin({ "leading": "right", "trailing": "left" },_baseDirLookup)
	};
	
	return dDeclare("idx.app.controllers.Layout",[dController], {
		
	constructor: function(app, events){
			// summary:
			//		bind "app-initLayout", "app-layoutView" and "app-resize" events on application instance.
			//
			// app:
			//		dojox/app application instance.
			// events:
			//		{event : handler}
			this.events = {
				"app-initLayout": this.initLayout,
				"app-layoutView": this.layoutView,
				"app-resize": this.onResize
			};
			// if we are using dojo mobile & we are hiding address bar we need to be bit smarter and listen to
			// dojo mobile events instead
			if(dConfig.mblHideAddressBar){
				dTopic.subscribe("/dojox/mobile/afterResizeAll", dLang.hitch(this, this.onResize));
			}else{
				// bind to browsers orientationchange event for ios otherwise bind to browsers resize
				if (dHas("ios")) {
					this.bind(dWindow.global, "orientationchange", dLang.hitch(this, this.onResize));
				}
				this.bind(dWindow.global, "resize", dLang.hitch(this, this.onResize));
			}
		},
		
		/**
		 * Called when the "app-resize" event fires.
		 * 
		 */
		onResize: function() {
			if (this._deferredResizeTimer) {
				clearTimeout(this._deferredResizeTimer);
				delete this._deferredResizeTimer;
			}
			this._onResize();
			if (!this._doingDeferredResize) {
				this._deferredResizeTimer = setTimeout(dLang.hitch(this, this._deferredResize), 1000);
			}
		},
		
		/**
		 * Handles a deferred call to onResize() that fires moments after the last one to 
		 * handle those elements that are sized bottom-up instead of top-down.
		 * @private
		 */
		_deferredResize: function() {
			this._doingDeferredResize = true;
			this.onResize();
			this._doingDeferredResize = false;
		},
		
		/**
		 * Handles resize
		 * @private
		 */
		_onResize: function(){
			this._doResize(this.app);
			
			// this is needed to resize the children on an orientation change or a resize of the browser.
			// it was being done in _doResize, but was not needed for every call to _doResize.
			for(var hash in this.app.selectedChildren){	// need this to handle all selectedChildren
				if(this.app.selectedChildren[hash]){
					this._doResize(this.app.selectedChildren[hash]);
				}
			}
			
			// this is needed to resize the children on an orientation change or a resize of the browser.
			// it was being done in _doResize, but was not needed for every call to _doResize.
			this.resizeSelectedChildren(this.app);
		},

		_getContentBox: function(node) {
			// get the margin box of the node
			var mb = dDomGeometry.getMarginBox(node);
			
			if(node !== this.app.domNode){	
				var cs = dDomStyle.getComputedStyle(node);
				var me = dDomGeometry.getMarginExtents(node, cs);
				var be = dDomGeometry.getBorderExtents(node, cs);
				var bb = {
					w: mb.w - (me.w + be.w),
					h: mb.h - (me.h + be.h)
				};
				var pe = dDomGeometry.getPadExtents(node, cs);
				return {
					l: dDomStyle.toPixelValue(node, cs.paddingLeft),
					t: dDomStyle.toPixelValue(node, cs.paddingTop),
					w: bb.w - pe.w,
					h: bb.h - pe.h
				};
			}else{
				// if we are layouting the top level app the above code does not work when hiding address bar
				// so let's use similar code to dojo mobile.
				return {
					l: 0,
					t: 0,
					h: dWindow.global.innerHeight || dWindow.doc.documentElement.clientHeight,
					w: dWindow.global.innerWidth || dWindow.doc.documentElement.clientWidth
				};
			}					
		},
		
		_doResize: function(view){
			// summary:
			//		resize view.
			//
			// view: Object
			//		view instance needs to do layout.
			var node = view.domNode;
			if(!node){
				this.app.log("Warning - View has not been loaded, in Layout _doResize view.domNode is not set for view.id="+view.id+" view=",view);
				return;
			}

			// Compute and save the size of my border box and content box
			// (w/out calling dojo/_base/html.contentBox() since that may fail if size was recently set)
			view._contentBox = this._getContentBox(node);
			
			this.app.log("in LayoutBase _doResize called for view.id="+view.id+" view=",view);
			this._doLayout(view);
				
		},

		/**
		 *
		 */
		_getAncestorNode: function(node, ceilingNode) {
			while (node && node !== ceilingNode) {
				node = node.parentNode;
			}
			return node;
		},
		
		/**
		 * Gets the layout children of the specified view.  This method includes child views
		 * but does not include the children of those child views.
		 */
		getLayoutChildren: function(w) {
			var ceilingNode = w.parent?w.parent.domNode:this.app.domNode;
			var ancestorNode = this._getAncestorNode(w.domNode, ceilingNode);
			if (!ancestorNode) return [];
			
			var containerDir = this._getDirection(w.domNode);
			var layoutChildren = [];
			var childViewLookup = {};
			var unidentifiedChildren = []; // this array should stay empty
			dArray.forEach(w.children, dLang.hitch(this, function(child) {
				if (!child.domNode) return;
				var childID = dDomAttr.get(child.domNode, "id");
				if (childID) {
					childViewLookup[childID] = child;
				} else {
					unidentifiedChildren.push(child);
				}
			}));
			
			var root = {
				domNode: w.domNode,
				direction: containerDir,
				view: w,
				widget: dRegistry.byNode(w.domNode),
				constraint: dDomAttr.get(w.domNode, "data-app-constraint"),
				parent: null,
				children: layoutChildren
			};
			
			this._getConstrainedLayoutChildren(root, childViewLookup, unidentifiedChildren);
			
			// now find the children that are not within the bounds of constrained nodes
			dArray.forEach(w.children, dLang.hitch(this, function(child) {
				if (!child || !child.domNode) return;
		
				var chain = [];
				var current = child;
				var currentNode = child.domNode;				
				var index1 = 0, index2 = 0;
				var container = null;
				var dir = null;
				var parent = null;
				
				// build the chain back to the parent view dom node
				while (currentNode && currentNode !== w.domNode) {
					chain.push({ domNode: currentNode, view: current });
					current = null;
					currentNode = currentNode.parentNode;
				}
				chain.reverse();
				
				if (!currentNode) {
					// we have a child that is currently orphaned
					return;
				}
				
				// for each item in the chain starting from the top, see if we
				// already have it in the hierarchy
				for (index1 = 0; index1 < chain.length; index1++) {
					parent = root;
					container = null;
					// see if the item is found
					for (index2 = 0; index2 < parent.children.length; index2++) {
						if (parent.children[index2].domNode === chain[index1].domNode) {
							container = parent.children[index2];
							break;
						}
					}
					
					// check if the container was not found
					if (!container) {
						dir = iString.nullTrim(dDomAttr.get(chain[index1].domNode, "dir"));
						
						// create the container object
						container = { 
							domNode: 		chain[index1].domNode,
							direction: 		(dir?dir:parent.direction),
							view: 			chain[index1].view,
							widget: 		dRegistry.byNode(chain[index1].domNode),
							constraint: 	dDomAttr.get(chain[index1].domNode, "data-app-constraint"),
							parent: 		parent,
							children: 		[]
						};
						parent.children.push(container);
					}
					
					// drill down to the next set of containers
					parent = container;
				}
			}));
			
			// return the containers array
			return layoutChildren;
		},

		/**
		 * Resolves the constraint with respect to the direction ("ltr" versus "rtl").
		 *
		 * @param constraint The constraint to be resolved.
		 * @param direction Either "ltr" or "rtl"
		 * @return The constraint resolved according to the direction.
		 */
		_dirLookup: function(constraint, direction) {
			if (!constraint) return null;
			var lookup = _dirLookup[direction];
			return (lookup[constraint] ? lookup[constraint] : constraint);
		},
		
		/**
		 *
		 */
		_getConstrainedLayoutChildren: function(parent, childViewLookup, unidentifiedChildren) {
			var childrenNodes = dQuery("> [data-app-constraint]", parent.domNode);
			dArray.forEach(childrenNodes, dLang.hitch(this, function(childNode) {
				var childID = dDomAttr.get(childNode, "id");
				var childView = null;
				var index = 0;
				var dir = null;
				if (childID) childView = childViewLookup[childID];
				if (!childView) {
					// check unidentified children (array should be empty)
					for (index = 0; index < unidentifiedChildren.length; index++) {
						if (unidentifiedChildren[index].domNode === childNode) {
							childView = unidentifiedChildren[index];
							break;
						}
					}
				}
				dir = iString.nullTrim(dDomAttr.get(childNode, "dir"));
				
				var layoutChild = {
					domNode: 		childNode,
					direction:		dir?dir:parent.direction,
					view: 			childView,
					widget:			dRegistry.byNode(childNode),
					constraint:		dDomAttr.get(childNode, "data-app-constraint"),
					parent:			parent,
					children: 		[] 
				};
				parent.children.push(layoutChild);
				
				// recursively find descendants if this layout child is not a child view
				if (!layoutChild.view) {
					this._getConstrainedLayoutChildren(layoutChild, childViewLookup, unidentifiedChildren);
				}
			}));
		},
		
		/**
		 *
		 */
		resizeSelectedChildren: function(w){
			for(var hash in w.selectedChildren){	// need this to handle all selectedChildren
				if(w.selectedChildren[hash] && w.selectedChildren[hash].domNode){
					this.app.log("in Layout resizeSelectedChildren calling resizeSelectedChildren calling _doResize for w.selectedChildren[hash].id="+w.selectedChildren[hash].id);
					this._doResize(w.selectedChildren[hash]);
					// Call resize on child widgets, needed to get the scrollableView to resize correctly initially	
					dArray.forEach(w.selectedChildren[hash].domNode.children, function(child){
						var widget = dRegistry.byNode(child);
						if (widget && widget.layout && dLang.isFunction(widget.layout)) {
							widget.layout();
						}if (widget && widget.resize && dLang.isFunction(widget.resize)) {
							widget.resize();
						}
					});	

					this.resizeSelectedChildren(w.selectedChildren[hash]);
				}
			}
		},
		
		/**
		 *
		 */
		initLayout: function(event){
			var view       		= event.view;
			var rootView   		= this.app.rootView ? this.app.rootView : this.app;
			var parent     		= ((view.parent===this.app)||(view.parent==null)) ? rootView : view.parent;
			var constraint 		= view.constraint;
			var constraints     = (constraint?this.app._splitViewConstraint(constraint):null);
			var constraint0		= (constraints?constraints[0]:null);
			var container  		= ( (constraint0 && parent[constraint0 + "Container"]) 
								    ? parent[constraint0 + "Container"] : null );
			var attrValue 		= null;
			var wrapper    		= null;
			var fillContainer 	= false;
			var placer 			= null;
			var deferred		= null;
			var promise			= null;
			
			// if the first constraint was used to find a container, then shift the constraints array
			if (container && constraints) constraints.shift();
			
			// try to get the default container if possible
			container = (container?container:parent.container);
			container = (container?container:parent.containerNode);
			container = (container?container:parent);
			if (!parent.layoutHierarchy) parent.layoutHierarchy = [];
			
			if ((view !== rootView) && container) {
				deferred = new dDeferred();
				if (container.placeView && dLang.isFunction(container.placeView)) {
					promise = container.placeView(parent, view, constraints);
					dWhen(promise, dLang.hitch(this, function(value) {
						deferred.resolve(value);
					}));
				} else {
					promise = this.getPlacer(
						parent, view, (container.domNode ? container.domNode : container));
					dWhen(promise, dLang.hitch(this, function(placer) {
						var promise = placer.placeView(parent, view, container, constraints);
						dWhen(promise, dLang.hitch(this, function(value) {
							deferred.resolve(value);
						}));
					}));
				}
			} else if (!event.view.domNode.parentNode) {
				event.view.parent.domNode.appendChild(event.view.domNode);
			}
			
			// set the ID on the view DOM node
			dDomAttr.set(event.view.domNode, "id", event.view.id);	// Set the id for the domNode

			// check for a callback and schedule to call it once view is placed
			if (event.callback) {
				dWhen(deferred, dLang.hitch(this, function() {
					event.callback();
				}));
			}
			
			// return the promise
			return (deferred?deferred.promise:null);
		},
		
		/**
		 * Obtains the idx/app/Placer for the specified container node.
		 */
		getPlacer: function(parent, view, containerNode) {
			var containerID = dDomAttr.get(containerNode, "id");
			if (! iString.nullTrim(containerID)) {
				containerID = iString.nullTrim(dDomAttr.get(containerNode, "data-dojo-attach-point"));
				containerID = "_container_" + (containerID ? containerID : "") + (nextContainerID++);
				dDomAttr.set(containerNode, "id", containerID);				
			}
			if (! parent._placers) parent._placers = {};
			if (containerID in parent._placers) return parent._placers[containerID];
			
			var deferred = new dDeferred();
			var promise = null;
			var placerName = dDomAttr.get(containerNode, "data-app-placer");
			var placerPropText = iString.nullTrim(dDomAttr.get(containerNode, "data-app-placer-props"));
			var jsonText = "{" + placerPropText + "}";
			var placerProps = (placerPropText ? dJson.parse(jsonText) : null);
			if (!placerName) placerName = this.app._getDefaultPlacerName();
			require([placerName], dLang.hitch(this, function(placerModule) {
				if (!parent._placers[containerID]) {
					parent._placers[containerID] = new placerModule(this.app, placerProps);
				}
				deferred.resolve(parent._placers[containerID]);
			}));
			
			return deferred.promise;
		},
		
		/**
		 * Response to dojox/app "app-layoutView" event.
		 *
		 */
		layoutView: function(event){
			if(event.view){
				this._layoutView(event);
				
				// normally when called from transition doResize will be false, and the resize will only be done when the app-resize event is fired
				if(event.doResize){
					this._doResize(event.parent || this.app);
					this._doResize(event.view);
				}
			}
		},
		
		/**
		 *
		 */
		_layoutView: function(event) {
			var parent = event.parent || this.app;
			var view = event.view;

			if(!view){
				return;
			}

			this.app.log("in LayoutBase layoutView called for event.view.id="+event.view.id);

			// if the parent has a child in the view constraint it has to be hidden, and this view displayed.
			var parentSelChild = this.getSelectedChildren(parent, view.constraint);
			if(event.removeView){	// if this view is being removed set display to none and the selectedChildren entry to null
				view.viewShowing = false;
				this.hideView(view);
				if(view == parentSelChild){
					this.setSelectedChild(parent, view.constraint, null);	// remove from selectedChildren
				}
			}else if(view !== parentSelChild){
				if(parentSelChild){
					//	domStyle.set(parentSelChild.domNode, "zIndex", 25);
					parentSelChild.viewShowing = false;
					if(event.transition == "none" || event.currentLastSubChildMatch !== parentSelChild){
						this.hideView(parentSelChild); // only call hideView for transition none or when the transition will not hide it
					}
				}
				view.viewShowing = true;
				this.showView(view);
				//domStyle.set(view.domNode, "zIndex", 50);
				this.setSelectedChild(parent, view.constraint, view);
			}else{ // this view is already the selected child and showing
				view.viewShowing = true;
			}		
		},

		/**
		 * Handle view layout.
		 */
		_doLayout: function(view){
			if(!view){
				console.warn("layout empty view.");
				return;
			}
			this.app.log("in Layout _doLayout called for view.id="+view.id+" view=",view);

			var children = this.getLayoutChildren(view);
		
			// We don't need to layout children if this._contentBox is null for the operation will do nothing.
			if(view._contentBox){
				this.layoutChildren(view.domNode, view._contentBox, children);
			}
		},

		/**
		 *
		 */
		hideView: function(view){
			this.app.log("logTransitions:","LayoutBase"+" setting domStyle display none for view.id=["+view.id+"], visibility=["+view.domNode.style.visibility+"]");
			dDomStyle.set(view.domNode, "display", "none");
		},

		/**
		 *
		 */
		showView: function(view){
			if(view.domNode){
				this.app.log("logTransitions:","LayoutBase"+" setting domStyle display to display for view.id=["+view.id+"], visibility=["+view.domNode.style.visibility+"]");
				dDomStyle.set(view.domNode, "display", "");
			}
		},
		
		/**
		 * Get current selected children according to the constraint
		 */
		getSelectedChildren: function(view, constraint){
			var type = typeof(constraint);
			var hash = (type == "string" || type == "number") ? constraint : constraint.__hash;
			return (view && view.selectedChildren && view.selectedChildren[hash]) ?
				view.selectedChildren[hash] : null;
		},

		/**
		 * Set the specified child as selected for the given constraint.
		 *
		 * @param view The parent view.
		 * @param constraint The constraint.
		 * @param child The child view to select.
		 */
		setSelectedChild: function(view, constraint, child){
			// summary:
			//		set current selected child according to the constraint
			//
			// view: View
			//		the View to set the selected child to
			// constraint: Object
			//		tbe constraint object
			// child: View
			//		the child to select
			var type = typeof(constraint);
			var hash = (type == "string" || type == "number") ? constraint : constraint.__hash;
			if (view.beforeChildSelected && dLang.isFunction(view.beforeChildSelected)) view.beforeChildSelected(constraint, child);
			view.selectedChildren[hash] = child;
			if (view.afterChildSelected && dLang.isFunction(view.afterChildSelected)) view.afterChildSelected(constraint, child);
		},

		/**
		 * Get current all selected children for this view and it's selected subviews
		 *
		 */
		getAllSelectedChildren: function(view, selChildren){
			selChildren = selChildren || [];
			if(view && view.selectedChildren){
				for(var hash in view.selectedChildren){
					if(view.selectedChildren[hash]){
						var subChild = view.selectedChildren[hash];
						selChildren.push(subChild);
						this.getAllSelectedChildren(subChild, selChildren);
					}
				}
			}
			return selChildren;
		},

		/**
		 * Register a constraint.
		 */
		register: function(constraint){
			// if the constraint has already been registered we don't care about it...
			var type = typeof(constraint);
			if(!constraint.__hash && type != "string" && type != "number"){
				var match = null;
				arr.some(constraints, function(item){
					var ok = true;
					for(var prop in item){
						if(prop.charAt(0) !== "_"){//skip the private properties
							if(item[prop] != constraint[prop]){
								ok = false;
								break;
							}
						}
					}
					if(ok == true){
						match = item;
					}
					return ok;
				});
				if(match){
					constraint.__hash = match.__hash;
				}else{
					// create a new "hash"
					var hash = "";
					for(var prop in constraint){
						if(prop.charAt(0) !== "_"){
							hash += constraint[prop];
						}
					}
					constraint.__hash = hash;
					constraints.push(constraint);
				}
			}
		},
		
		
		
		//================================================================
		/**
		 * Given the margin-box size of a node, return its content box size.
		 * Functions like domGeometry.contentBox() but is more reliable since it doesn't have
		 * to wait for the browser to compute sizes.
		 */
		marginBox2contentBox : function(/*DomNode*/ node, /*Object*/ mb){
			// summary:
			//		
			var cs = dDomStyle.getComputedStyle(node);
			var me = dDomGeometry.getMarginExtents(node, cs);
			var pb = dDomGeometry.getPadBorderExtents(node, cs);
			return {
				l: dDomStyle.toPixelValue(node, cs.paddingLeft),
				t: dDomStyle.toPixelValue(node, cs.paddingTop),
				w: mb.w - (me.w + pb.w),
				h: mb.h - (me.h + pb.h)
			};
		},


		/**
		 * Gets the direction for the specified node.
		 */
		_getDirection: function(node) {
			var ltr = true;
			var dir = null;
			
			do {
				// get the dir attribute and trim it (null if empty)
				dir = iString.nullTrim(dDomAttr.get(node, "dir"));
				
				// convert to lower case
				if (dir) dir = dir.toLowerCase();
				
				// ignore invalid values
				if (dir != "ltr" && dir != "rtl") dir = null;
				
				// go to the parent node
				if (!dir) node = node.parent;
			
			} while ( (!dir) && (node) );
			
			// check if we found a direction
			if (dir) return dir;
			
			// if no widget then use body
			ltr = dDomGeometry.isBodyLtr();
			
			return (ltr) ? "ltr" : "rtl";
		},
		
		/**
		 * Layout a bunch of child dom nodes within a parent dom node
		 */
		layoutChildren: function(/*DomNode*/ 		container, 
								 /*Object*/ 		dim, 
								 /*LayoutChild[]*/ 	children,
								 /*Boolean*/		suppressConstraints){
			// TODO: temporary work-around for bottom-up views -- need to fix this
			if (dim.h == 0) return;
			
			// determine the parent
			if (!children || (children.length == 0)) return;
			var parent = children[0].parent;
			
			// check if the parent is a layout widget
			if (parent.widget && parent.widget.layout && dLang.isFunction(parent.widget.layout)) {
				// parent is a layout widget, assume its resize/layout functions have already
				// been called to resize these children and recursively handle the grand children
				dArray.forEach(children, dLang.hitch(this, function(child) {
					if (child.widget && child.widget.resize && dLang.isFunction(child.widget.resize)) {
						child.widget.resize();
					}
					if (child.widget && child.widget.layout && dLang.isFunction(child.widget.layout)) {
						child.widget.layout();
					}
					this.layoutChildren(child.domNode,
										this._getContentBox(child.domNode),
										child.children,
										true);
				}));
				return;
			}
			
			// check for leading/trailing constraints among children
			var reorderedChildren = [];
			var index = 0;
			var design = iString.nullTrim(dDomAttr.get(container, "data-app-design"));
			if (!design) design = "headline";
			var designOrder = designOrders[design];
			if (!designOrder) designOrder = designOrders["headline"];
			
			// reorder the children according to the design
			for (index = 0; index < designOrder.length; index++) {
				reorderedChildren = reorderedChildren.concat(dArray.filter(children, dLang.hitch(this, function(child) {
					if (!child.constraint) return false;
					var childConstraint = this._dirLookup(child.constraint, child.parent.direction);
					var designConstraint = this._dirLookup(designOrder[index], child.parent.direction);
					if (!child._extracted) child._extracted = (childConstraint == designConstraint);
					return (childConstraint == designConstraint);
				})));
			}
			
			// get any remaining children that lack a constraint or don't have a constraint that 
			// matches the design order
			var constrainedCount = reorderedChildren.length;
			reorderedChildren.concat(dArray.filter(children, dLang.hitch(this, function(child) {
				return (child._extracted ? false : true);
			})));
			var unconstrainedCount = reorderedChildren.length - constrainedCount;
			
			// check if we have no constrainted children that we know how to layout
			if (constrainedCount == 0 || suppressConstraints) {
				// assume the children are already laid out correctly -- handle grandchildren
				dArray.forEach(children, dLang.hitch(this, function(child) {
					if (child.widget && child.widget.resize && dLang.isFunction(child.widget.resize)) {
						child.widget.resize();
					}
					if (child.widget && child.widget.layout && dLang.isFunction(child.widget.layout)) {
						child.widget.layout();
					}
					this.layoutChildren(child.domNode,
										this._getContentBox(child.domNode),
										child.children,
										suppressConstraints && (constrainedCount == 0));
				}));
				return;
			}
			
			// make a copy of the dimensions
			dim = dLang.mixin({}, dim);			
			dDomClass.add(container, "dijitLayoutContainer");
			
			// set positions/sizes
			dArray.forEach(reorderedChildren, dLang.hitch(this, function(child){
				var childNode = child.domNode;
				var constraint = this._dirLookup(child.constraint, child.parent.direction);
				
				// if no constraint then skip this one
				if (constraint) {
					// set elem to upper left corner of unused space; may move it later
					var nodeStyle = childNode.style;
					nodeStyle.left = dim.l+"px";
					nodeStyle.top = dim.t+"px";
					nodeStyle.position = "absolute";

					dDomClass.add(childNode, "dijitAlign" + constraint.charAt(0).toUpperCase() + constraint.substring(1));
				
					// Size adjustments to make to this child widget
					var sizeSetting = {};

					// set size && adjust record of remaining space.
					// note that setting the width of a <div> may affect its height.
					if(constraint == "top" || constraint == "bottom"){
						sizeSetting.w = dim.w;
						this._size(child, sizeSetting);
						dim.h -= child.h;
						if(constraint == "top"){
							dim.t += child.h;
						}else{
							nodeStyle.top = dim.t + dim.h + "px";
						}
					}else if(constraint == "left" || constraint == "right"){
						sizeSetting.h = dim.h;
						this._size(child, sizeSetting);
						dim.w -= child.w;
						if(constraint == "left"){
							dim.l += child.w;
						}else{
							nodeStyle.left = dim.l + dim.w + "px";
						}
					}else if(constraint == "center"){
						this._size(child, dim);
					}
				} else {
					if (child.widget && child.widget.resize && dLang.isFunction(child.widget.resize)) {
						child.widget.resize();
					}
				}
				if (child.widget && child.widget.layout && dLang.isFunction(child.widget.layout)) {
					child.widget.layout();
				}
				// handle the grand children
				this.layoutChildren(child.domNode,
									this._getContentBox(child.domNode),
									child.children,
									false);
			}));
		},
	
		/**
	  	 *
		 */
		_size: function(child, dim){
			// size the child
			var newSize = null;
			if (child.widget && child.widget.resize && dLang.isFunction(child.widget.resize)) {
				newSize = child.widget.resize(dim);
			} else {
				newSize = dDomGeometry.setMarginBox(child.domNode, dim);
			}
			
			// record child's size
			if(newSize){
				// if the child returned it's new size then use that
				dLang.mixin(child, newSize);
			}else{
				// otherwise, call getMarginBox(), but favor our own numbers when we have them.
				// the browser lies sometimes
				dLang.mixin(child, dDomGeometry.getMarginBox(child.domNode));
				dLang.mixin(child, dim);
			}
		}
	});
		
});
		