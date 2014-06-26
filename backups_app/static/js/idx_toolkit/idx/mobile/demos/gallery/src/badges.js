define([
	"dojo/dom",
	"dijit/registry",
	"dojox/mobile/parser",
	"dojox/mobile",
	"dojox/mobile/compat",
	"dojox/mobile/IconContainer",
	"dojox/mobile/Badge",
	"dojox/mobile/RoundRect"
], function(dom, registry){


	setBadgeValue = function(i){
		var w = registry.byId("icon" + i);
		var badgeVal = w.get("badge");
		var val = dom.byId("val").value || "0";
		var result = parseInt(val);
		if(result.toString() === "NaN"){
			result = val.substring(0,3);
		}else{
			if(result > 99){
				result = "+99";
			}else if(result < -99){
				result = "-99";
			}else{
				result = result+"";
			}
		}
		w.set("badge", badgeVal ? null : result);
	}
});
