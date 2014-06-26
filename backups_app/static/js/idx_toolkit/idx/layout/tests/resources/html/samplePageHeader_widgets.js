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
	'dijit/registry',
	'dijit/Menu',
	'dijit/MenuItem',
	
	'idx/app/Header'
	
], function(parser, dom, domAttr, domStyle, domConstruct, topic, aspect, on, query, Memory, registry,
		Menu, MenuItem, Header){

	var rootNode = dom.byId("sample_page_header_widgets");
	var cardContent = registry.getEnclosingWidget(rootNode);
	var cardItem = cardContent.getParent();
	
	var headerWidgetNode = dom.byId("header_widget_ref_id");
	
	var actionsMenu = new Menu();
	actionsMenu.addChild(new MenuItem({ label: "Edit Profile" }));
	actionsMenu.addChild(new MenuItem({ label: "Sign Out" }));
	
	var sharingMenu = new Menu();
	sharingMenu.addChild(new MenuItem({ label: "Post to Forum" }));
	sharingMenu.addChild(new MenuItem({ label: "Post to Wiki" }));

	var helpMenu = new Menu();
	helpMenu.addChild(new MenuItem({ label: "Help Center" }));
	helpMenu.addChild(new MenuItem({ label: "About" }));

	var header = new Header({
		primaryTitle: "IBM Product/Context",
		primarySearch: {
			entryPrompt: "Search",
			onSubmit: function(value){ alert('Search for "' + value + '" requested.'); }
		},
		user: {
			displayName: "User Name",
			displayImage: "http://w3.ibm.com/bluepages/photo/ImageServlet.wss/919362672.jpg?cnum=919362672",
			actions: actionsMenu
		},
		sharing: sharingMenu,
		help: helpMenu,
		primaryBannerType: "thick"
	},headerWidgetNode);
	header.startup();
	
});