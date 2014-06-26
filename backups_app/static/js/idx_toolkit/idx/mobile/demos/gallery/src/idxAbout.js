define(["dijit/registry",
		 "dojox/mobile/parser",
		 "dojox/mobile/Button",
		 "dojox/mobile/ContentPane",
		 "dojox/mobile/Heading",
		 "dojox/mobile/ScrollableView",
		 "idx/mobile/AboutPane",
		 "idx/mobile/About"],
  function(registry, parser){
  	
	show_about = null;
	
	dialog_log = null;
	pane_log = null;

	return {
		init: function(){
			show_about = function(){
				registry.byId("aboutdialog").show();
			};
			
			dialog_log = registry.byId("id_dialoglog");
			pane_log = registry.byId("id_panelog");			
		}
	};
});
