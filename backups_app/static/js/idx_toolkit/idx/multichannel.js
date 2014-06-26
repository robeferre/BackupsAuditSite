define(["require",
	"dojo/_base/kernel", // kernel.isAsync
	"dojo/_base/declare", // declare
	"dojo/_base/config",
    "dojo/_base/window",
	"dojo/_base/lang", // lang.mixin lang.hitch
	"dojo/_base/array", // array.forEach array.indexOf array.map
	"dojo/_base/sniff",
	"dojo/dom-class",
	"dojo/when",
	"dojo/promise/all",
	"dojo/Deferred"
], function(require, kernel, declare, config, win, lang, array, has, domClass, when, all, Deferred){
	
	//TODO add more common initial logic
	var getDojoxMobile = function() {
		var result = new Deferred();
		require(["dojox/mobile/common","dojox/mobile/compat"], function(common,compat) {
			var dm = lang && lang.getObject("dojox.mobile", true) || {};
			if(!win){
				win = window;
				win.doc = document;
				win._no_dojo_dm = dm;
			}
			dm.deviceTheme = {};
			dm.deviceTheme.setDm = function(/*Object*/_dm){
				dm = _dm;
			};
			result.resolve(dm);
		});
		return result.promise;
	};
	var themePromise = null;
	var setCurrentTheme = function(theme) {
		var dmPromise = getDojoxMobile();
		themePromise = when(all([dmPromise, themePromise]), function(results) {
			var dm = results[0];
			dm.currentTheme = theme;
		});
	};

	var idxMultichannel = declare("idx/multichannel", [], {
		themeMap: {
			"Holodark":		"holodark",
			"Android 3":	"holodark",
			"Android 4":	"holodark",
			"Android":		"android",
			"BlackBerry": 	"blackberry",
			"BB10":			"blackberry",
			"iPhone":		"iphone",
			"iPad":			"ipad",
			"MSIE 10":		"windows",
			"WindowsPhone":	"windows",
			"Custom":		"custom"
		},
		themes: null,
		platform: "",//"tablet", "phone", "desktop"
		_detectPlatform: function(){
			var dua = navigator.userAgent;
			var themes = []; //"tablet", "phone", "mobile", ......
			if(dua.match(/(iPhone|iPod|iPad|Android|Holodark|BlackBerry|BB10|WindowsPhone)/)){
				themes.push("mobile");
				if((dua.indexOf("iPod")>=0) || (dua.indexOf("iPhone")>=0) || (dua.indexOf("WindowsPhone")>=0)){
					this.platform = "phone";
				} else if (dua.indexOf("iPad")>=0) {
					this.platform = "tablet";
				}
				
				// Should be actived if we have to support OS specified theme
				for(var key in this.themeMap){
					if(dua.indexOf(key) > -1){
						var theme = this.themeMap[key];
						themes.push(theme);
						setCurrentTheme(theme);
					}
				}
				
			}else{
				themes.push("desktop");
				this.platform = "desktop";
			}
			//For IE10
			if (dua.match(/IEMobile\/10\.0/)) {
				var msViewportStyle = document.createElement("style");
				msViewportStyle.appendChild(document.createTextNode("@-ms-viewport{width:auto!important}"));
				document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
			}
			this.themes = themes;
		},
		getRuntimePlatform: function(){
			if(!this.platform){this._detectPlatform();}
			return this.platform;
		},
		updateGlobalTheme: function(themes){
			if((!themes) || themes.length == 0){
				themes = this.themes;
			}
			var doc = document.documentElement;
			array.map(themes, function(theme){
				domClass.add(doc, theme + "Platform");
			})
		}
	});
	idxMultichannel.getRuntimePlatform = function(){
		if(!idxMultichannel._masterMC){
			idxMultichannel._masterMC = new idxMultichannel();
		}
		return idxMultichannel._masterMC.getRuntimePlatform();
	};
	idxMultichannel.updateGlobalTheme = function(theme){
		if(!idxMultichannel._masterMC){
			idxMultichannel._masterMC = new idxMultichannel();
		}
		idxMultichannel._masterMC.updateGlobalTheme(theme);
	}
	return idxMultichannel;
});
