define(["idx/mobile/tests/_TestUtils",
	 "dojo/dom",
	 "dojo/on",
	 "dojo/sniff",
	 "dijit/registry",
	 "dojox/mobile/parser", 
     "dojox/mobile/Button",
     "dojox/mobile/ContentPane",
     "dojox/mobile/Heading",
     "dojox/mobile/EdgeToEdgeList",
     "dojox/mobile/ListItem",
     "dojox/mobile/ScrollableView",
     "dojox/mobile/Switch",
     "dojox/mobile/TabBar",
     "dojox/mobile/TabBarButton",
     "dojox/mobile/ToolBarButton",
     "dojox/mobile/Tooltip",
     "idx/mobile/tests/_LogPane"],
  function(tu, dom, on, sniff, registry, parser){
	return {
		init: function(){
			
			/*
			   This is a monkey-patch workaround for IDT defect 8536
			   (https://csnext.ibm.com:8002/jazz/web/projects/IBM%20Dojo%20Toolkit%20Public#action=com.ibm.team.workitem.viewWorkItem&id=8536)
			 */
			registry.getEnclosingWidget = function(node){
				while(node){
					var id = (node.nodeType == 1) && node.getAttribute("widgetId");
					if(id){
						return registry._hash[id];
					}
					node = node.parentNode;
				}
				return null;
			}		
			var useSpinner = (dojox.mobile.currentTheme === "oneui_android");
			if(useSpinner) {
				registry.byId("id_heading").set("label", "");
			}
			
			var mainView = registry.byId("idxHeaderMain");
			var mainLog = registry.byId("id_mainLog");
			var textLog = registry.byId("id_textLog");
			var navigationMenuTooltip = registry.byId("id_navigationMenuTooltip");
			var spinner = registry.byId("id_spinner");
			var tabletMenuButton = registry.byId("id_tabletMenuButton");
			var overflowButton = registry.byId("id_overflowButton");
			var overflowMenuTooltip = registry.byId("id_overflowMenuTooltip");
			
			var showingMenu = null;
			var showingMenuButton = null;
			var showHideMenu = function(menuButton, menu, show, domNode) {
				if(show) {
					if((menu !== showingMenu) || (menuButton != showingMenuButton))
					{
						if (showingMenu)
							showingMenu.hide();
						if (showingMenuButton)
							showingMenuButton.set("selected", false);
						menu.show(domNode, ['below']);
						menuButton.set("selected", true);
						showingMenu = menu;
						showingMenuButton = menuButton;
					}
				}
				else {
					if (showingMenu)
					{
						showingMenu.hide();
						showingMenu = null;
					}
					if (showingMenuButton)
					{
						showingMenuButton.set("selected", false);
						showingMenuButton = null;
					}
				}
			}
			
			logMain = function(message){
				mainLog.addMessage(message);
			}

			logText = function(message){
				textLog.addMessage(message);
			}

			on(spinner, "click", function(evt){
				showHideMenu(spinner, navigationMenuTooltip, !(navigationMenuTooltip === showingMenu), spinner.domNode);
				evt.preventDefault();
				evt.stopPropagation();
			});
			on(tabletMenuButton, "click", function(evt){
				showHideMenu(tabletMenuButton, navigationMenuTooltip, !(navigationMenuTooltip === showingMenu), tabletMenuButton.domNode);
				evt.preventDefault();
				evt.stopPropagation();
			});

			on(overflowButton, "click", function(evt){
				showHideMenu(overflowButton, overflowMenuTooltip, !(overflowMenuTooltip === showingMenu), overflowButton.domNode);
				evt.preventDefault();
				evt.stopPropagation();
			});
						
			var hideMenuOnMainViewClick = function(evt) {
				if(showingMenu) {
					if(!dom.isDescendant(evt.target, showingMenuButton.domNode))
						showHideMenu(null, showingMenu, false);
				}
			};
			on(mainView, "click", hideMenuOnMainViewClick);
			on(mainView, "touchend", hideMenuOnMainViewClick);
			on(navigationMenuTooltip, "click", function(){
				showHideMenu(null, navigationMenuTooltip, false);
			});
			on(overflowMenuTooltip, "click", function(){
				showHideMenu(null, overflowMenuTooltip, false);
			});
		}
	};
});
