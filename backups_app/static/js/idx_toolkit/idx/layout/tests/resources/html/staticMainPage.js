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

	var rootNode = dom.byId("static_main_page");
	var cardContent = registry.getEnclosingWidget(rootNode);
	var cardItem = cardContent.getParent();
	
	//TODO
	toggleCSS3Animation_nav = function(val){
		this.set("label", val ? "Navigation Animation Disabled" : "Navigation Animation Enabled");
		flipCard.toggleCSS3Animation_nav(val);
	}
	
	toggleCSS3Animation_container = function(val){
		this.set("label", val ? "Container Animation Disabled" : "Container Animation Enabled");
		flipCard.toggleCSS3Animation_container(val);
	}
	
	toggleCSS3Animation_card = function(val){
		this.set("label", val ? "Card Animation Disabled" : "Card Animation Enabled");
		flipCard.toggleCSS3Animation_card(val);
	}
	
	toggleCSS3Animation = function(val){
		navigationAnimBtn.set('checked', val);
		containerAnimBtn.set('checked', val);
		cardAnimBtn.set('checked', val);
		
		this.set("label", val ? "Pluggable UI Animation Disabled" : "Pluggable UI Animation Enabled");
		flipCard.toggleCSS3Animation(val);
	}
});