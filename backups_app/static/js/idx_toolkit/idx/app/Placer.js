define(["require",
		"dojo/_base/declare",
	    "dojo/_base/lang",
		"dojo/when",
		"dojo/Deferred",
		"dojo/aspect",
		"dojo/dom-style",
		"dojo/dom-attr",
		"dojox/app/ViewBase",
		"dojox/app/View",
		"dijit/_WidgetBase",
		"dijit/registry",
		"idx/string"],
function(require, 
		 dDeclare, 
		 dLang, 
		 dWhen, 
		 dDeferred,
		 dAspect, 
		 dDomStyle, 
		 dDomAttr, 
		 dViewBase, 
		 dView, 
		 dWidgetBase, 
		 dRegistry,
		 iString) {
	
	return dDeclare("idx.app.Placer",[], {
		
		/**
		 * The module to use for decorating views as widgets.
		 * @type String
		 * @default "dijit/layout/ContentPane"
		 */
		decorator: "dijit/layout/ContentPane",
			
		/**
		 * The attribute to set with the constraint.
		 */
		decoratorConstraintsAttr: "region",
		
		/**
		 * The parameters to pass to the decorator when constructing it.
		 */
		decoratorParams: {style: "position: relative; padding: 0px;"},
		
		/**
		 * Constructs with the specified dojox/app application, the
		 * dojox/app view and parmaeters.
		 *
		 * @param app The app with which to construct.
		 * @param params The config parameters for this instance.
		 */
		constructor: function(app, params) {
			this.app = app;
			dLang.mixin(this, params);
		},
		
		/**
		 * Get's the decorator module to use for decorating the view
		 * as a widget.
		 *
		 * @param container The container to which the view will be added.
		 *                  This may be used to choose the decorator module.
		 *
		 * @param view The view that will be decorated.
		 *
		 * @return The widget module that will be used to decorate the view.
		 */
		_getDecoratorModule: function(parent, view, container, constraints) {
			if (this.decoratorModule) return this.decoratorModule;
			if (!this.decorator) return null;
			var deferred = new dDeferred();
			this._decoratorModule = deferred.promise;
			require([this.decorator], dLang.hitch(this, function(decoratorModule) {
				deferred.resolve(decoratorModule);
			}));
			return this._decoratorModule;
		},
		
		/**
		 * Decorates the specified view for residing in the specified container.
		 *
		 * @param container The container to which the view will be added.
		 *                  This may be used to choose the decorator module.
		 *
		 * @param view The view that will be decorated.
		 *
		 * @return The widget that decorates the specified view.
		 */
		_placeDecoratedView: function(parent, view, container, constraints) {
			// get the title for the view
			var title = iString.nullTrim(this.app._getViewTitle(view));
			title = (title?title:"");
				
			var promise = this._getDecoratorModule(container, view);
			var deferred = new dDeferred();
			dWhen(promise, dLang.hitch(this, function(decoratorModule) {
				// get the decorator and check if the view is already decorated
				var decorator = null;
				var widget = dRegistry.byNode(view.domNode);
				if (widget && (widget instanceof decoratorModule)) {
					decorator = widget;
				}
				if (!decorator) {
					decorator = new decoratorModule(this.decoratorParams);
					decorator.containerNode.appendChild(view.domNode);
					view._decorator = decorator;
				
					// make sure the widget gets destroyed when the view does
					decorator.own(dAspect.after(view, "destroy", dLang.hitch(decorator, "destroy")));
				}
				
				// set the region and title
				if (constraints && (constraints.length > 0) &&
					iString.nullTrim(this.decoratorConstraintsAttr)) {
					// apply the constraint to the decorator
					decorator.set(this.decoratorConstraintsAttr, constraints[0]);
					constraints.shift();
				}
				decorator.set("title", title);
						
				// add the widget child to the container
				container.addChild(decorator);
				if (container.selectChild && dLang.isFunction(container.selectChild)) {
					container.selectChild(decorator);
				}
				if (!decorator._started) decorator.startup();
				decorator._started = true;
				
				// ensure the widget gets removed before the view gets destroyed
				if (container.removeChild && dLang.isFunction(container.removeChild)) {
					decorator.own(dAspect.before(decorator, "destroy", function() {
						container.removeChild(decorator);
					}));
				}
						
				// ensure the widget becomes selected when the view gets activated
				if (container.selectChild && dLang.isFunction(container.selectChild)) {
					decorator.own(dAspect.after(view, "beforeActivate", function() {
						container.selectChild(decorator);
					}));
				}
				
				// resolve the decorator
				deferred.resolve(decorator);
			}));
			
			// return the promise
			return deferred.promise;
		},
		
		/**
		 * Override this method to place the view in the parent.  The
		 * default implementation handles basic scenarios with StackContainer
		 * and ContentPane widget wrappers where needed.
		 *
		 * @param parent The parent view.
		 * @param view The view to be placed.
		 * @param container The container node or widget.
		 * @param constraints The array of constraints for the view.
		 */
		placeView: function(parent, view, container, constraints) {
			var promise = null;
			// check if the container is a widget and it lacks an "addChild" function
			if (container.placeView && dLang.isFunction(container.placeView)) {
				container.placeView(parent, view, constraints);
				
			} else if ((container instanceof dWidgetBase) && (container.addChild)
				 && dLang.isFunction(container.addChild)) {
				promise = this._placeDecoratedView(parent, view, container, constraints);
				
			} else {
				container = container.containerNode ? container.containerNode : container;
				container = container.domNode ? container.domNode : container;
				
				// assume the container is a node of some sort
				container.appendChild(view.domNode);
				dDomStyle.set(view.domNode, {position: "absolute",  margin: "0px;",
											 top: "0px", bottom: "0px", left: "0px", right: "0px"});
			}

			dWhen(promise, dLang.hitch(this, function(decorator) {
				if (constraints && constraints.length>0) {
					dDomAttr.set(view.domNode, "data-app-constraint", constraints[0]);
					constraints.shift();
				}
			}));
			
			// return the promise (which may be null)
			return promise;
		}
	});
		
});