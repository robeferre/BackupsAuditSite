define(["dojo/_base/lang"],
		function(lang){
	lang.getObject("idx.mobile.demos.gallery.src.structure", true);
	
	var THRESHOLD_WIDTH = 600;

	idx.mobile.demos.gallery.src.structure = {
		layout: {
			threshold: THRESHOLD_WIDTH, // threshold for layout change
			leftPane: {
				hidden: (window.innerWidth < THRESHOLD_WIDTH) ? true : false,
						currentView: null
			},
			rightPane: {
				hidden: false,
				currentView: null
			},
			getViewHolder: function(id) {
				if (id === "navigation")
					return (window.innerWidth < THRESHOLD_WIDTH) ? "rightPane" : "leftPane";
				else
					return "rightPane";
			},
			setCurrentView: function(id) {
				var holder = this.getViewHolder(id);
				this[holder].currentView = id;
			},
			// last selected demo view
			currentDemo: {
				id: "welcome",
				title: "Welcome"
			}
		},
		demos: [{
			id: "controls",
			label: "Controls",
			iconBase: "gallery/images/navigation_list_all_29.png",
			views: [{
				id: "accordion",
				speclevel: "9",
				iconPos: "464,0,29,29",
				title: "Accordion",
				demourl: "gallery/views/accordion.html",
				jsmodule: "idx/mobile/demos/gallery/src/accordion",
				jsSrc: "gallery/doc/src/accordion.js.txt"
			}, {
				id: "badges",
				speclevel: "9",
				iconPos: "522,0,29,29",
				title: "Badges",
				demourl: "gallery/views/badges.html",
				jsmodule: "idx/mobile/demos/gallery/src/badges",
				jsSrc: "gallery/doc/src/badges.js.txt"				
			}, {
				id: "buttons",
				speclevel: "9",
				iconPos: "0,0,29,29",
				title: "Buttons",
				demourl: "gallery/views/buttons.html"
			}, {
				id: "dialogs",
				speclevel: "9",
				iconPos: "638,0,29,29",
				title: "Dialogs",
				demourl: "gallery/views/dialogs.html",
				jsmodule: "idx/mobile/demos/gallery/src/dialogs",
				jsSrc: "gallery/doc/src/dialogs.js.txt"
			}, {
				id: "domButtons",
				speclevel: "9",
				iconPos: "638,0,29,29",
				title: "DOM Buttons",
				demourl: "gallery/views/domButtons.html",
				jsmodule: "idx/mobile/demos/gallery/src/domButtons",
				jsSrc: "gallery/doc/src/domButtons.js.txt"
			}, {
				id: "forms",
				speclevel: "9",
				iconPos: "29,0,29,29",
				title: "Forms",
				demourl: "gallery/views/forms.html",
				jsmodule: "idx/mobile/demos/gallery/src/forms",
				jsSrc: "gallery/doc/src/forms.js.txt"
			}, {		
				id: "gridLayout",
				speclevel: "9",
				iconPos: "580,0,29,29",
				title: "GridLayout",
				demourl: "gallery/views/gridLayout.html",
				jsmodule: "idx/mobile/demos/gallery/src/gridLayout",
				jsSrc: "gallery/doc/src/gridLayout.js.txt"
			}, {
				id: "headings",
				speclevel: "9",
				iconPos: "145,0,29,29",
				title: "Headings",
				demourl: "gallery/views/headings.html",
				jsmodule: "idx/mobile/demos/gallery/src/headings",
				jsSrc: "gallery/doc/src/headings.js.txt"
			}, {
				id: "icons",
				speclevel: "9",
				iconPos: "87,0,29,29",
				title: "Icon Container",
				demourl: "gallery/views/icons.html",
				jsmodule: "idx/mobile/demos/gallery/src/icons",
				jsSrc: "gallery/doc/src/icons.js.txt"
			}, {
				id: "idxHeader",
				speclevel: "9",
				iconPos: "0,0,29,29",
				title: "IDX Header",
				demourl: "gallery/views/idxHeader.html",
				jsmodule: "idx/mobile/demos/gallery/src/idxHeader",
				jsSrc: "gallery/doc/src/idxHeader.js.txt"
			},{
				id: "idxLaunch",
				speclevel: "9",
				iconPos: "0,0,29,29",
				title: "IDX Launch",
				demourl: "gallery/views/idxLaunch.html",
				jsmodule: "idx/mobile/demos/gallery/src/idxLaunch",
				jsSrc: "gallery/doc/src/idxLaunch.js.txt"
			},{
				id: "idxAbout",
				speclevel: "9",
				iconPos: "0,0,29,29",
				title: "IDX About",
				demourl: "gallery/views/idxAbout.html",
				jsmodule: "idx/mobile/demos/gallery/src/idxAbout",
				jsSrc: "gallery/doc/src/idxAbout.js.txt"
			},{
				id: "idxLogin",
				speclevel: "9",
				iconPos: "0,0,29,29",
				title: "IDX Login",
				demourl: "gallery/views/idxLogin.html",
				jsmodule: "idx/mobile/demos/gallery/src/idxLogin",
				jsSrc: "gallery/doc/src/idxLogin.js.txt"
			},{
				id: "list",
				speclevel: "9",
				iconPos: "203,0,29,29",
				title: "Lists",
				demourl: "gallery/views/list.html",
				jsmodule: "idx/mobile/demos/gallery/src/list",
				jsSrc: "gallery/doc/src/list.js.txt"
			}, {
				id: "mobileLists",
				speclevel: "9",
				iconPos: "203,0,29,29",
				title: "List Data",
				demourl: "gallery/views/mobileListData.html",
				jsmodule: "idx/mobile/demos/gallery/src/mobileListData",
				jsSrc: "gallery/doc/src/mobileListData.js.txt"
			}/*, {
				id: "filteredLists",
				iconPos: "203,0,29,29",
				title: "Filtered Lists",
				demourl: "gallery/views/filteredLists.html",
				jsmodule: "idx/mobile/demos/gallery/src/filteredLists",
				jsSrc: "doc/src/filteredLists.js.txt"
			}, {
				id: "longLists",
				iconPos: "203,0,29,29",
				title: "Long Lists",
				demourl: "gallery/views/longLists.html",
				jsmodule: "idx/mobile/demos/gallery/src/longLists",
				jsSrc: "doc/src/longLists.js.txt"
			}*/, {					
				id: "media",
				speclevel: "9",
				iconPos: "435,0,29,29",
				title: "Media",
				demourl: "gallery/views/mobileMedia.html",
				jsmodule: "idx/mobile/demos/gallery/src/media"
			}, {
				id: "valuePicker",
				speclevel: "9",
				iconPos: "667,0,29,29",
				title: "Pickers",
				demourl: "gallery/views/valuePicker.html",
				jsmodule: "idx/mobile/demos/gallery/src/valuePicker",
				jsSrc: "gallery/doc/src/valuePicker.js.txt"
			}, {				
				id: "progress",
				speclevel: "9",
				iconPos: "493,0,29,29",
				title: "Progress",
				demourl: "gallery/views/progress.html",
				jsmodule: "idx/mobile/demos/gallery/src/progress",
				jsSrc: "gallery/doc/src/progress.js.txt"
			}/*, {
				id: "rating",
				speclevel: "9",
				iconPos: "609,0,29,29",
				title: "Rating",
				demourl: "gallery/views/rating.html",
				jsmodule: "idx/mobile/demos/gallery/src/rating",
				jsSrc: "gallery/doc/src/rating.js.txt"
			}*/, {
				id: "scrollablePane",
				speclevel: "9",
				iconPos: "551,0,29,29",
				title: "Scroll Pane",
				demourl: "gallery/views/scrollablePane.html",
				jsmodule: "idx/mobile/demos/gallery/src/scrollablePane",
				jsSrc: "gallery/doc/src/scrollablePane.js.txt"
			}, {
				id: "swapView",
				speclevel: "9",
				iconPos: "58,0,29,29",
				title: "Swap View",
				demourl: "gallery/views/swapView.html"
			}, {
				id: "mobileSwitches",
				speclevel: "9",
				iconPos: "29,0,29,29",
				title: "Switches",
				demourl: "gallery/views/mobileSwitches.html"
			}, {
				id: "tabBar",
				speclevel: "9",
				iconPos: "116,0,29,29",
				title: "Tab Bar",
				demourl: "gallery/views/tabBar.html"
			}, {
				id: "mobileTransitions",
				speclevel: "9",
				iconPos: "290,0,29,29",
				title: "Transitions",
				demourl: "gallery/views/mobileTransitions.html"
			},
			{				
				id: "map",
				speclevel: "9",
				iconPos: "174,0,29,29",
				title: "Map (Google)",
				demourl: "gallery/views/map.html",
				jsmodule: "idx/mobile/demos/gallery/src/map",
				jsSrc: "gallery/doc/src/map.js.txt"
			}/*,
			{			
				href: "../mobileGauges/demo.html",
				hrefTarget: "_blank",
				speclevel: "9",
				title: "Gauge",
				iconPos: "232,0,29,29"
			}, {
				href: "../mobileCharting/demo.html",
				hrefTarget: "_blank",
				speclevel: "9",
				title: "Chart",
				iconPos: "377,0,29,29"
			}, {
				href: "../mobileGeoCharting/demo.html",
				hrefTarget: "_blank",
				speclevel: "9",
				title: "Geo Chart",
				iconPos: "377,0,29,29"
			}, {
				href: "../mobileOpenLayers/demo.html",
				hrefTarget: "_blank",
				speclevel: "9",
				title: "OpenLayers Map",
				iconPos: "174,0,29,29"
			}, {
				href: "../touch/demo.html",
				hrefTarget: "_blank",
				speclevel: "9",
				title: "Touch",
				iconPos: "261,0,29,29"
			}*/]
		}, {
			id: "effects",
			label: "Effects",
			iconBase: "gallery/images/navigation_list_all_29.png",
			views: [
			{
				id: "css3",
				speclevel: "9",
				iconPos: "406,0,29,29",
				title: "CSS 3",
				demourl: "gallery/views/css3.html",
				jsmodule: "idx/mobile/demos/gallery/src/css3",
				jsSrc: "gallery/doc/src/css3.js.txt"
			}
			]
		}, {
			id: "dataList",
			label: "Data",
			iconBase: "gallery/images/navigation_list_all_29.png",
			views: [
			/*{
				id: "jsonp",
				speclevel: "9",
				iconPos: "319,0,29,29",
				title: "JSON P",
				demourl: "gallery/views/jsonp.html",
				jsmodule: "idx/mobile/demos/gallery/src/jsonp",
				jsSrc: "gallery/doc/src/jsonp.js.txt"
			},*/ {
				id: "ajax",
				speclevel: "9",
				iconPos: "348,0,29,29",
				title: "AJAX",
				demourl: "gallery/views/ajax.html",
				jsmodule: "idx/mobile/demos/gallery/src/ajax",
				jsSrc: "gallery/doc/src/ajax.js.txt"
			}, {
				id: "html5",
				speclevel: "9",
				iconPos: "348,0,29,29",
				title: "HTML5",
				demourl: "gallery/views/html5.html",
				jsmodule: "idx/mobile/demos/gallery/src/html5",
				jsSrc: "gallery/doc/src/html5.js.txt"
			}
			]
		}],
		/* Below are internal views. */
		_views: [{
			id: 'source',
			title: 'Source',
			type: 'source'
		}, {
			id: 'welcome',
			title: 'IBM One UI Mobile'
		}, {
			id: 'navigation',
			title: 'Widgets',
			type: 'navigation',
			back: ''
		}],
		/* data model for tracking view loading */
		load: {
			loaded: 0,
			target: 0 //target number of views that should be loaded
		},
		// navigation list
		navRecords: []
	};
	return idx.mobile.demos.gallery.src.structure;
});
