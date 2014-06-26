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
	
], function(parser, dom, domAttr, domStyle, domConstruct, 
		topic, aspect, on, query, Memory, registry
	){

	var rootNode = dom.byId("sample_flip_card_load_as_page");
	var cardContent = registry.getEnclosingWidget(rootNode);
	var cardItem = cardContent.getParent();
	
	//TODO
	
});