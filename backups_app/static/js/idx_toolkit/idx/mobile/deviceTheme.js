/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

// Note: the following module is a copy of dojox/mobile/deviceTheme.js,
// with modifications enclosed between comment lines like this:
// ===========================================================================
// Periodically, when dojox/mobile/deviceTheme.js is updated, this module
// should be updated, taking care to retain the modifications correctly.

/**
 * Automatically loads an applicable variant of the One UI theme.
 * @name idx.mobile.deviceTheme
 * @class This module detects the user agent of the browser and loads the
 * appropriate theme files. It can be enabled by simply requiring
 * dojox/mobile/deviceTheme from your application, or it can be loaded directly
 * before dojo.js is loaded; THE SECOND APPROACH IS STRONGLY RECOMMENDED
 * because loading this module via require/define can lead to timing/loading
 * issues which causes widgets to initialise before the applicable CSS is
 * loaded and applied, and layout problems can ensue.
 * <p>
 * You can also pass an additional query parameter string, device={theme-id},
 * to select a specific theme through the browser URL input. The available
 * theme-ids are "oneui-android" and "oneui-ios". The names are case-sensitive.
 * If the given theme-id is not recognised, the "oneui-ios" theme is used.
 * <ul>
 * <li>http://your.server.com/yourapp.html  // automatic detection</li>
 * <li>http://your.server.com/yourapp.html?theme=oneui-android  // forces Android variant of One UI theme</li>
 * </ul>
 * </p>
 * <p>
 * To simulate a particular device, the user agent may be overridden by setting
 * dojoConfig.mblUserAgent.
 * </p>
 * <p>
 * By default, an all-in-one theme file (e.g. themes/oneui-ios/oneui-ios.css)
 * is loaded. The all-in-one theme files load style sheets for all the
 * dojox/mobile and idx/mobile widgets regardless of whether they are used in
 * your application or not. If you want to choose what theme files to load, you
 * can specify them via dojoConfig as shown in the following example:
 * <ul>
 * <li>data-dojo-config="mblThemeFiles:['dojox/base','dojox/Button','idx/About']"</li>
 * </ul>
 * In the case of this example, if iphone is detected, for example, the
 * following files will be loaded:
 * <ul>
 * <li>idx/mobile/themes/oneui_ios/dojox/base.css</li>
 * <li>idx/mobile/themes/oneui_ios/dojox/Button.css</li>
 * <li>idx/mobile/themes/oneui_ios/idx/About.css</li>
 * </ul>
 * Note that theme files for widgets included in dojox/mobile should be
 * prefixed with "dojox/" while theme files for widgets included in idx/mobile
 * should be prefixed with "idx/". If the path prefix is omitted, "dojox/" will
 * be added automatically to provide compatibility with the config parameters
 * for dojox/mobile/deviceTheme.
 * </p>
 * <p>
 * If you want to load style sheets for your own custom widgets, you can
 * specify a package name along with a theme file name in an array.
 * <ul>
 * <li>['dojox/base','idx/About',['com.acme','MyWidget']]</li>
 * </ul>
 * In this case, the following files will be loaded:
 * <ul>
 * <li>idx/mobile/themes/oneui_ios/dojox/base.css</li>
 * <li>idx/mobile/themes/oneui_ios/idx/About.css</li>
 * <li>com/acme/themes/oneui_ios/MyWidget.css</li>
 * </ul>
 * </p>
 * <p>
 * If you specify '@theme' as a theme file name, it will be replaced with the
 * theme folder name (e.g. 'oneui_ios'). For example,
 * <ul>
 * <li>['@theme',['com.acme','MyWidget']]</li>
 * </ul>
 * will load the following files:
 * <ul>
 * <li>idx/mobile/themes/oneui_ios/oneui_ios.css</li>
 * <li>com/acme/themes/oneui_ios/MyWidget.css</li>
 * </ul>
 * </p>
 */

// start of snapshot of dojox/mobile/deviceTheme.js
// ===========================================================================
(typeof define === "undefined" ? function(deps, def) { def(); } : define)([
	"dojo/_base/config",
	"dojo/_base/lang",
	"dojo/_base/window",
	"require"
], function(config, lang, win, require){

	// module:
	//		dojox/mobile/deviceTheme

	var dm = lang && lang.getObject("dojox.mobile", true) || {};

	var DeviceTheme = function(){
// ===========================================================================
// commentary replaced with JSDoc comments above
// ===========================================================================
		if(!win){
			win = window;
			win.doc = document;
			win._no_dojo_dm = dm;
		}
		config = config || win.mblConfig || {};
		var scripts = win.doc.getElementsByTagName("script");
		for(var i = 0; i < scripts.length; i++){
			var n = scripts[i];
			var src = n.getAttribute("src") || "";
			if(src.match(/\/deviceTheme\.js/i)){
				config.baseUrl = src.replace("deviceTheme\.js", "../../dojo/");
				var conf = (n.getAttribute("data-dojo-config") || n.getAttribute("djConfig"));
				if(conf){
					var obj = eval("({ " + conf + " })");
					for(var key in obj){
						config[key] = obj[key];
					}
				}
				break;
			}else if(src.match(/\/dojo\.js/i)){
				config.baseUrl = src.replace("dojo\.js", "");
				break;
			}
		}

		this.loadCssFile = function(/*String*/file){
			// summary:
			//		Loads the given CSS file programmatically.
			var link = win.doc.createElement("link");
			link.href = file;
			link.type = "text/css";
			link.rel = "stylesheet";
			var head = win.doc.getElementsByTagName('head')[0];
			head.insertBefore(link, head.firstChild);
//===========================================================================
// use unshift rather than push to ensure array order matches load order
			dm.loadedCssFiles.unshift(link);
//===========================================================================
		};

		this.toUrl = function(/*String*/path){
			// summary:
			//		A wrapper for require.toUrl to support non-dojo usage.
			return require ? require.toUrl(path) : config.baseUrl + "../" + path;
		};

		this.setDm = function(/*Object*/_dm){
			// summary:
			//		Replaces the dojox/mobile object.
			// description:
			//		When this module is loaded from a script tag, dm is a plain
			//		local object defined at the begining of this module.
			//		common.js will replace the local dm object with the
			//		real dojox/mobile object through this method.
			dm = _dm;
		};

		this.themeMap = config.themeMap || [
			// summary:
			//		A map of user-agents to theme files.
			// description:
			//		The first array element is a regexp pattern that matches the
			//		userAgent string.
			//
			//		The second array element is a theme folder name.
			//
			//		The third array element is an array of css file paths to load.
			//
			//		The matching is performed in the array order, and stops after the
			//		first match.
			
//===========================================================================
// default themeMap config to select between android and ios variants of One UI theme			
   			[
				"Android",
				"oneui_android",
				[]
			],
			[
				"iPhone",
				"oneui_ios",
				[]
			],
			[
				"iPad",
				"oneui_ios",
				[]
			],
			[
				".*",
				"oneui_ios",
				[]
			]			
//===========================================================================

   		];

		dm.loadedCssFiles = [];
		this.loadDeviceTheme = function(/*String?*/userAgent){
			// summary:
			//		Loads a device-specific theme according to the user-agent
			//		string.
			// description:
			//		This function is automatically called when this module is
			//		evaluated.
			var t = config.mblThemeFiles || dm.themeFiles || ["@theme"];
			var i, j;
			var m = this.themeMap;
			var ua = userAgent || config.mblUserAgent || (location.search.match(/theme=(\w+)/) ? RegExp.$1 : navigator.userAgent);
			for(i = 0; i < m.length; i++){
				if(ua.match(new RegExp(m[i][0]))){
					var theme = m[i][1];
					var cls = win.doc.documentElement.className;
//===========================================================================
// add "oneui" marker class as well as "<theme>_theme" class							
					cls = cls.replace(new RegExp(" *" + dm.currentTheme + "_theme"), "") + " " + theme + "_theme oneui";
//===========================================================================
					win.doc.documentElement.className = cls;
					dm.currentTheme = theme;
					var files = [].concat(m[i][2]);
					for(j = 0; j < t.length; j++){ 
						var isArray = (t[j] instanceof Array || typeof t[j] == "array");
						var path;
						if(!isArray && t[j].indexOf('/') !== -1){
							path = t[j];
						}else{
//===========================================================================
// default package is idx/mobile							
							var pkg = isArray ? (t[j][0]||"").replace(/\./g, '/') : "idx/mobile";
//===========================================================================
							var name = (isArray ? t[j][1] : t[j]).replace(/\./g, '/');
							var f = "themes/" + theme + "/" +
//===========================================================================
// add 'dojox/' to unqualified names for compatibility with default format of themeFiles config
								(name === "@theme" ? theme : (((name.indexOf("/") >= 0) || (pkg !== "idx/mobile")) ? name : ("dojox/" + name))) + ".css";
//===========================================================================
							path = pkg + "/" + f;
						}
						files.unshift(this.toUrl(path));
					}
					//remove old css files
					for(var k = 0; k < dm.loadedCssFiles.length; k++){
						var n = dm.loadedCssFiles[k];
						n.parentNode.removeChild(n);
					}
					dm.loadedCssFiles = [];
//===========================================================================
// loadCssFile causes files to be loaded in the reverse order of the calls made
// so iterate backwards through the array to preserve the desired loading order
					for(j = files.length - 1; j >= 0; j--){
//===========================================================================
						this.loadCssFile(files[j].toString());
					}

					if(userAgent && dm.loadCompatCssFiles){
						dm.loadCompatCssFiles();
					}
					break;
				}
			}
		};
	};

	// Singleton.  (TODO: can we replace DeviceTheme class and singleton w/a simple hash of functions?)
	var deviceTheme = new DeviceTheme();

	deviceTheme.loadDeviceTheme();
	window.deviceTheme = dm.deviceTheme = deviceTheme;

	return deviceTheme;
//===========================================================================
//end of snapshot of dojox/mobile/deviceTheme.js
});