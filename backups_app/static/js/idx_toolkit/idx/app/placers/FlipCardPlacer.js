define(["require",
		"dojo/_base/declare",
	    "dojo/_base/lang",
		"dojo/when",
		"dojo/Deferred",
		"dojo/aspect",
		"dojo/dom-style",
		"dojo/dom-attr",
		"dojo/dom-construct",
		"dojox/app/ViewBase",
		"dojox/app/View",
		"dijit/_WidgetBase",
		"idx/app/Placer",
		"idx/string"],
function(require, 
		 dDeclare, 
		 dLang, 
		 dWhen, 
		 dDeferred,
		 dAspect, 
		 dDomStyle, 
		 dDomAttr, 
		 dDomConstruct,
		 dViewBase, 
		 dView, 
		 dWidgetBase, 
		 iPlacer,
		 iString) {
	
	var FlipCardAdapter = dDeclare("idx.app.placers._FlipCardAdapter", null, {
		placer: null,
		parent: null,
		view: null,
		constructor: function(args) {
			dLang.mixin(this, args);
			this.centerCount = 0;
			this.current = {};
			this.mainNode = dDomConstruct.create("div", 
				{ id: this.view.id + "_mainNode", style: "padding: 0px; margin: 0px; position: relative;"});
			this.detailNode = dDomConstruct.create("div", 
				{ id: this.view.id + "_detailNode", style: "padding: 0px; margin: 0px; position: relative;"});
			dDomConstruct.place(this.view.domNode, this.mainNode);
		},
		
		placeView: function(parent, view, constraints) {
			return this.placer.placeFlipCardChild(this, parent, view, constraints);
		},
		
		preActivateFlip: function() {
			this._activating = true;
			try {
				this.flipCard.processFlip();
			} catch (e) {
				this._flipping = false;
				throw e;
			}
			this._activating = false;
		},
		
		bind: function(flipCard) {
			console.log("FLIP CARD: " + flipCard);
			this.flipCard = flipCard;
			flipCard.own(
				dAspect.around(this.flipCard, "processFlip", dLang.hitch(this, function(origProcessFlip) {
				return dLang.hitch(this, function(e) {
					var awaySide = null, toSide = null;
					var awayView = null, toView = null;
					var awayNode = null, toNode = null;
					var app = this.placer.app;
					if (this.flipCard.itemMode == "main") {
						awayNode = this.mainNode;
						toNode = this.detailNode;
					} else {
						awayNode = this.detailNode;
						toNode = this.mainNode;
					}
					awaySide = this.flipCard.itemMode;
					toSide = (awaySide=="main"?"detail":"main");
					awayView = this.current[awaySide];
					toView = this.current[toSide];
					console.log("TO/AWAY SIDES: " + toSide + " / " + awaySide);
					awayView = (awayView?"-"+app._encodeViewLineage(app._getViewLineage(awayView)):"");
					toView = (toView?app._encodeViewLineage(app._getViewLineage(toView)):"");
					console.log("TO/AWAY VIEWS: " + toView + " / " + awayView);
					app.transitionToView(this.flipCard.domNode,{transition: "none", target: awayView}, e);
					origProcessFlip.call(this.flipCard, e);
					dDomConstruct.place(this.view.domNode, toNode);
					if (!this._activating) {
						app.transitionToView(this.flipCard.domNode,{transition: "none", target: toView}, e);
					}
				});
			})));
		}
	});	
	
	return dDeclare("idx.app.placers.FlipCardPlacer",iPlacer, {
		
		/**
		 * The module to use for decorating views as widgets.
		 * @type String
		 * @default "idx/layout/FlipCardItem"
		 */
		decorator: "idx/layout/FlipCardItem",
		
		/**
		 * The attribute to set with the constraint.
		 */
		decoratorConstraintsAttr: null,
		
		/**
		 * The parameters to pass to the decorator when constructing it.
		 */
		decoratorParams: null,

		/**
		 *
		 */
		mainSettings: null,
		
		/**
		 *
		 */
		detailSettings: null,
		
		/**
		 *
		 */
		mainCardActions: null,
		
		/**
		 *
		 */
		detailCardActions: null,
		
		/**
		 * Constructs with the specified dojox/app application, the
		 * dojox/app view and parmaeters.
		 *
		 * @param app The app with which to construct.
		 * @param params The config parameters for this instance.
		 */
		constructor: function(app, params) {
			// do nothing
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
				var itemProps = {};
				var fillAttrs = null;
				var mainContainer = null;
				var detailContainer = null;
				
				if (this.decoratorParams) dLang.mixin(itemProps, this.decoratorParams);
				if (this.detailSettings) {
					itemProps.detail_settings = this.detailSettings;
				}
				if (this.mainSettings) {
					itemProps.main_settings = this.mainSettings;
				}
				var flippable = (!("flippable" in this.decoratorParams) || this.decoratorParams.flippable);
				var flipCardAdapter = null;
				// check if we need to adapt an existing view for making its children part
				// of the flip card experience
				if (flippable && view.domNode.children.length == 0 && !view.container) {
					// create a bogus container with a "placeView" function to handle the
					// logic
					flipCardAdapter = new FlipCardAdapter({placer: this, parent: parent, view: view});
					view.container = flipCardAdapter;
					itemProps.main_props = {
						title: title,
						content: flipCardAdapter.mainNode
					};
					itemProps.detail_props = {
						title: title,
						content: flipCardAdapter.detailNode
					};
						
				} else {
					itemProps.main_props = {
						title: title,
						content: view.domNode
					};
				}
				if (this.mainCardActions) {
					itemProps.main_props.cardActions = this.mainCardActions;
				}
				if (this.detailCardActions) {
					itemProps.detail_props.cardActions = this.detailCardActions;
				}
				
				var decorator = new decoratorModule(itemProps);
				view._decorator = decorator;
				if (flipCardAdapter) {
					flipCardAdapter.bind(decorator);
				}
				
				// make sure the widget gets destroyed when the view does
				decorator.own(dAspect.after(view, "destroy", dLang.hitch(decorator, "destroy")));
						
				// set the region and title
				if (constraints&&constraints.length>0) {
					decorator.set("region", constraints[0]);
					constraints.shift();
				}
						
				// add the widget child to the container
				container.addChild(decorator);
				if (container.selectChild && dLang.isFunction(container.selectChild)) {
					container.selectChild(decorator);
				}
				decorator.startup();
				
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
		 *
		 */
		placeFlipCardChild: function(adapter, parent, view, constraints) {
			console.log("PLACING FLIP CARD CHILD: " + view.name);
			console.log("PARENT IS " + parent.id);
			
			view._flipSide = null;
			if (constraints.length>0) {
				if (constraints[0]=="main"||constraints[0]=="detail") {
					view._flipSide = constraints.shift();
				} else if (constraints[0]=="center") {
					view._flipSide = (adapter.centerCount==0?"main":"detail");
					adapter.centerCount++;
				} else {
					view._flipSide = "both";
				}
			} else {
				// assume with no constraint that this is a "center" view
				view._flipSide = (adapter.centerCount==0?"main":"detail");
				adapter.centerCount++;
			}
			
			// layout the child in the DOM node
			console.log("adapter.view.domNode === parent.domNode: " + 
						 (adapter.view.domNode === parent.domNode));
			this.placeView(parent, view, adapter.view.domNode, constraints);
							
			// discover when the view activates
			var scope = {adapter: adapter, view: view};
			dAspect.after(view, "beforeActivate", dLang.hitch(scope, function() {
				var adapter = this.adapter;
				var view = this.view;
				var flipCard = adapter.flipCard;
				if (view._flipSide == "both") return;
				adapter.current[view._flipSide] = view;
				console.log("FLIP SIDE / ITEM MODE: " + view._flipSide + " / " + flipCard.itemMode);
				if (view._flipSide != flipCard.itemMode) {
					adapter.preActivateFlip();
				}
			}));
			return null;
		}
		
	});
		
});