
var dm = {};
window._no_dojo_dm = dm;
dm.deviceTheme = {};
dm.deviceTheme.setDm = function(/*Object*/_dm){
	dm = _dm;
};
var themeMap = {
	"Holodark":"holodark",
	"Android 3":"holodark",
	"Android 4":"holodark",
	"Android":"android",
	"BlackBerry":"blackberry",
	"BB10":"blackberry",
	"iPhone":"iphone",
	"iPad":"ipad",
	"MSIE 10":"windows",
	"WindowsPhone":"windows",
	"Custom":"custom"
}
var dua = navigator.userAgent;
var platform = ""; //"tablet", "phone", "mobile", ......
if(dua.match(/(iPhone|iPod|iPad|Android|Holodark|BlackBerry|BB10|WindowsPhone)/)){
	platform += "mobile||";
	if((dua.indexOf("iPod")>=0) || (dua.indexOf("iPhone")>=0) || (dua.indexOf("WindowsPhone")>=0)){
		platform += "phone||";
	} else if (dua.indexOf("iPad")>=0) {
		platform += "tablet||";
	}
	for(var key in themeMap){
		if(dua.indexOf(key) > -1){
			var theme = themeMap[key];
			platform += theme + "||";
			dm.currentTheme = theme;
		}
	}
}else{
	platform += "desktop||";
}

//For IE10
if (dua.match(/IEMobile\/10\.0/)) {
	var msViewportStyle = document.createElement("style");
	msViewportStyle.appendChild(document.createTextNode("@-ms-viewport{width:auto!important}"));
	document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
}


//customize dojoConfig
var dojoConfig = currentDojoVersion.dojoConfig;
if (platform.indexOf("desktop")>-1) dojoConfig.has["desktop"] = true;
if (platform.indexOf("mobile")>-1) dojoConfig.has["mobile"] = true;
if (platform.indexOf("phone")>-1) {
	dojoConfig.has["phone"] = true;
	dojoConfig.has["mobile"] = true;
}
if (platform.indexOf("tablet")>-1) {
	dojoConfig.has["tablet"] = true;
	dojoConfig.has["mobile"] = true;
}

//document class
var pOriginArray = platform.split("||"), pArray = [];
for(var i = 0; i < pOriginArray.length; i++){
	if(pOriginArray[i]){
		pArray.push(pOriginArray[i] + "Platform");
	}
}
document.documentElement.className += " " + pArray.join(" ");
