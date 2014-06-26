/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"dojo/_base/kernel", // kernel.isAsync
	"dojo/_base/array", // array.forEach array.indexOf array.map
	"dojo/_base/declare", // declare
	"dojo/_base/html", // Deferred
	"dojo/_base/connect",
	"dojo/_base/event", // event.stop
	"dojo/_base/lang", // lang.mixin lang.hitch
	"dojo/_base/window",
	"dojo/_base/json",
	"dojo/_base/sniff",
	"dojo/_base/xhr",
	"dojo/_base/NodeList",
	"dojo/_base/fx",
	"dojo/fx",
	"dojo/fx/easing", 
	"dojo/dom", // attr.set
	"dojo/dom-attr", // attr.set
	"dojo/dom-class", // domClass.add domClass.contains
	"dojo/dom-style", // domStyle.set
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/i18n", // i18n.getLocalization
	"dojo/keys",
	"dojo/topic", // topic.publish()
	"dojo/on",
	"dojo/window",
	"dojo/ready",
	"dojo/cache",
	"dojo/text",
	"dojo/query",
	"dojo/mouse",
	"dojo/touch",
	"dojo/cookie", 
	"dojo/json",
	"dojo/hash",
	
	"dijit/registry",
	"dijit/_base/wai",
	"dijit/_base/manager",	// manager.defaultDuration
	"dijit/_base/focus", // dijit.getFocus()
	"dijit/a11y",
	"dijit/focus",
	"dijit/Viewport"
	
], function(kernel, array, declare, htmlUtil, connect, event, lang, winUtil, baseJson, has, 
		xhrUtil, NodeList, baseFx, coreFx, easingUtil,
		dom, domAttr, domClass, domStyle, domConstruct, domGeom, i18n, keys, topic, on, windowLib, 
		ready, cache, text, query, mouse, touch, cookie, json, hash,
		registry, wai, manager, baseFocus, a11y, focus,
		Viewport
	){
	
	// the result object
	var fcUtil = {
		// summary:
		//		common utility function for flip card widget
		//
	};
	
	fcUtil.isObjectEmpty = function(obj){
		if(obj){
			for(var p in obj){
				return false;
			}
			return true;
		}else{
			return true;
		}
	};
	
	fcUtil.generateGUID = function(prefix){
		var guid = "";
	    for (var i = 1; i <= 32; i++){
	      var n = Math.floor(Math.random()*16.0).toString(16);
	      guid +=   n;
	      if((i==8)||(i==12)||(i==16)||(i==20))
	        guid += "-";
	    }
	    return ((prefix||"fc") + "-") + guid;  
	};
	
	fcUtil.getPageViewPort = function(doc){
		domClass.add(doc.body, "FlipCardContainerNoScroll");
		var viewport = Viewport.getEffectiveBox(doc);
		
		domClass.remove(doc.body, "FlipCardContainerNoScroll");
		
		return viewport;
	};
	
	
	
	return fcUtil;
});