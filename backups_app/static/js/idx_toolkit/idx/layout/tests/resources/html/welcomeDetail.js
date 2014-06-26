require([
	'dojo/parser',
	'dojo/dom',
	'dojo/dom-attr',
	'dojo/dom-style',
	'dojo/dom-construct',
	'dojo/topic',
	'dojo/aspect',
	'dojo/on',
	'dojo/store/Memory',
	'dijit/registry'
], function(parser, dom, domAttr, domStyle, domConstruct, topic, aspect, on, Memory, registry){

	var rootNode = dom.byId("welcome_detail_container");
	var flipcard = registry.getEnclosingWidget(rootNode);
		
	var signal = aspect.after(flipcard, "topicProcess", function(data){
		domAttr.set(rootNode, {
			innerHTML: data.title + "Trend Detail" + "<br>"
				+ data.trend.join(", ")
		}); 
	}, true);
	
});