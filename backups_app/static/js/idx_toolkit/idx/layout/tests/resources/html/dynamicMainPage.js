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

	var rootNode = dom.byId("dynamic_main_page");
	
	addNavigationItem = function(){
		var headerContent = dom.byId("sample_grid_action").innerHTML.toString();
		flipCard.addNavigationItem({
			item: {
				id:"sample_nav", name:"sample_nav", title:"Added_Navigation", icon:"resources/images/blank.png", type:"nav"
			}
		},{
			props: {
				headerParams: {
					content: headerContent
				}
			},
			cntType: "grid",
			forceOverride: true
		});
		
		flipCard.addNavigationItem({
			item: {
				id:"sample_nav_2", name:"sample_nav_2", title:"Added_Navigation_2", icon:"resources/images/blank.png", type:"nav"
			},
			parent: {id:"monitor"}, 
			insertIndex: 2, 
			rootNavItem: {id:"monitor"}
		},{});
	}
	
	removeNavigationItem = function(){
		flipCard.removeNavigationItem({
			itemId: "sample_nav"
		});
		
		flipCard.removeNavigationItem({
			itemId: "sample_nav_2",
			parent: {id:"monitor"},
			rootNavItem: {id:"monitor"}
		});
	}
	
	
});