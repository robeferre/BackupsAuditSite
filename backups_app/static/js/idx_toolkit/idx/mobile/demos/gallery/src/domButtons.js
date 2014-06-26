define(["dojo/_base/window",
	"dojo/dom",
	"dojo/ready",
	"dojox/mobile/iconUtils",
	"dojox/mobile",
	"dojox/mobile/parser",
	"dojox/mobile/compat"],
  function(win, dom, ready, iconUtils){
  	
	setIconValue = function(id, val){
		var txt = win.doc.createTextNode(val);
		dom.byId(id).firstChild.appendChild(txt);
	}
	return {
		init: function(){
			var nodes = dom.byId("domButtomsTable").getElementsByTagName("div");
			for(var i = 0; i < nodes.length; i++){
				var div = nodes[i];
				if(div.nodeType != 1 || div.className.indexOf("mblDomButton") == -1){ continue; }
				//div.style.border = "1px solid red";
				iconUtils.createDomButton(div);
			}
			//setIconValue("btn1", "32");
		}
	};
});
