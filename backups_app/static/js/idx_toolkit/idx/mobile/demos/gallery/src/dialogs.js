define([
	"dojo/_base/array",
	"dojo/dom", 
	"dojo/dom-construct", 
	"dijit/registry",
	"dojox/mobile/ProgressIndicator",
	"dojox/mobile/parser", 
	"dojox/mobile",
	"dojox/mobile/compat",
	"dojox/mobile/SimpleDialog",
	"dojox/mobile/TextBox",
	"dojox/mobile/Button",
	"dojox/mobile/RadioButton",
	"dojox/mobile/Slider"], function(array, dom, domConstruct, registry, ProgressIndicator){
                 
	show = function(dlg){
		registry.byId(dlg).show();
	}

	hide = function(dlg){
		registry.byId(dlg).hide();
	}

	var prog, progtext;

	show_progress_indicator = function(dlg, cont){
		show(dlg);
		var container = dom.byId(cont);
		prog = ProgressIndicator.getInstance();
		container.appendChild(prog.domNode);
		progtext = domConstruct.create("div", {
			className: "idxLoadingMessage",
			innerHTML: "Loading"
		}, prog.domNode);
		prog.start();
		setTimeout(function(){
			hide_progress_indicator(dlg);
		}, 5000);
	}

	hide_progress_indicator = function(dlg){
		domConstruct.destroy(progtext);
		prog.stop();
		hide(dlg);
	}

	return {
		init: function(){
			array.forEach(["message", "confirm", "login", "progress", "volume", "select"],
				function(id){
					var node = registry.byId("dlg_"+id).domNode;
					node.parentNode.removeChild(node);
					document.body.appendChild(node);
				});
		}
	};
});
