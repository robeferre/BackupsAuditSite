require([
	'dojo/parser',
	'dojo/dom',
	'dojo/dom-attr',
	'dojo/dom-style',
	'dojo/dom-construct',
	'dojo/topic',
	'dojo/aspect',
	'dojo/on',
	'dojo/query',
	'dojo/store/Memory',
	'dijit/registry'
], function(parser, dom, domAttr, domStyle, domConstruct, topic, aspect, on, query, Memory, registry){

	// var rootNode = dom.byId("dynamic_card_item");
	// var cardContent = registry.getEnclosingWidget(rootNode);
	// var cardItem = cardContent.getParent();
	
	addMainSettings = function(node){
		if(node){
			cardContent = registry.getEnclosingWidget(node);
			cardItem = cardContent.getParent();
			content = query(".card_main_settings", cardContent.domNode)[0].innerHTML.toString();
			cardContent.addContentSettings({
				title: "Custom Settings",
				type: "normal",
				content: content
			});
		}
		
	}
	
	removeMainSettings = function(node){
		if(node){
			cardContent = registry.getEnclosingWidget(node);
			cardItem = cardContent.getParent();
		}
		cardContent.removeContentSettings();
	}
	
	setCardContent = function(node){
		if(node){
			var settingsWidget = registry.getEnclosingWidget(node);
			cardContent = settingsWidget.getParent();
			cardItem = cardContent.getParent();
			textarea = query(".card_main_settings_content", cardContent.domNode)[0];
			cardContent.set("content", textarea.value);
		}
	}
	
	
});