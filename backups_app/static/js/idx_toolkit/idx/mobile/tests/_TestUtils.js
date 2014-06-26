/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo/_base/lang",
        "dojo/_base/window",
        "dojox/mobile" ],
        function(_lang,
        		 _win,
        		 mobile){

	var tu = _lang.getObject("idx.mobile.tests._TestUtils", true);
	
	/**
	 * Set the screen size that dojox.mobile will use, regardless of detected
	 * device/viewport characteristics. Valid values are "phone", "tablet".
	 * Pass null to return to using dojox.mobile default behaviour.
	 */
	tu.forceBodySize = function(width, height){
		var body = _win.body();
		
		if(!mobile._idxOriginalWindowSize){
			mobile._idxOriginalWindowSize = mobile.getScreenSize();
		}
		
		if(width){
			_win.global.innerWidth = width || "";
			body.style.width = width + "px";
		}
		
		if(height){
			_win.global.innerHeight = height || "";
			body.style.height = height + "px";
		}
		
		mobile.resizeAll();
	};

	/**
	 * Set the screen size that dojox.mobile will use, regardless of detected
	 * device/viewport characteristics. Valid values are "phone", "tablet".
	 * Pass null to return to using dojox.mobile default behaviour.
	 */
	tu.forceScreenSize = function(size){
		var before = mobile.tabletSize;
		if(size){
			// store original value of tabletSize in order to be able
			// to restore it later if required
			if(!mobile._idxOriginalTabletSize){
				mobile._idxOriginalTabletSize = mobile.tabletSize;
			}
			
			mobile.tabletSize = (size.toLowerCase() == "phone") ? 4000000000 : 0;
		}else if(mobile._idxOriginalTabletSize){
			// restore default behaviour
			mobile.tabletSize = mobile._idxOriginalTabletSize;
		}
		
		if(mobile.tabletSize !== before){
			mobile.detectScreenSize(true);
		}
	};
	
	var w = location.search.match(/width=(\w+)/i),
		w2 = RegExp.$1,
		h = location.search.match(/height=(\w+)/i),
		h2 = RegExp.$1,
		s = location.search.match(/screensize=(\w+)/i),
		s2 = RegExp.$1;

	// use query parameters 'width' and/or 'height' to force body size
	tu.forceBodySize(location.search.match(/width=(\w+)/i) && RegExp.$1, location.search.match(/height=(\w+)/i) && RegExp.$1);

	// use query parameter 'screensize' to force a screen size value
	tu.forceScreenSize(location.search.match(/screensize=(\w+)/i) && RegExp.$1);
});