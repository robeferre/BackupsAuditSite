require([
		"dojo/_base/array",
		"dojo/dom",
		"dojo/dom-style",
		"dojo/dom-construct",
		"dojo/ready",
		"dojo/aspect",
		"dijit/registry",
		"dojox/charting/Chart",
		"dojox/charting/themes/Shrooms",
		"dojox/charting/themes/PlotKit/blue",
		"dojox/charting/themes/PlotKit/cyan",
		"dojox/charting/themes/PlotKit/green",
		"dojox/charting/themes/Ireland",
		"dojox/charting/themes/SageToLime",
		"dojox/charting/themes/Minty",
		"dojox/charting/themes/Tufte",
		"dojox/charting/action2d/Highlight",
		"dojox/charting/action2d/Magnify",
		"dojox/charting/action2d/Tooltip",
		"dojox/charting/axis2d/Default",
		"dojox/charting/plot2d/Default",
		"dojox/charting/plot2d/Areas",
		"dojox/charting/plot2d/Markers",
		"dojox/charting/plot2d/MarkersOnly",
		"dojox/charting/plot2d/StackedLines",
		"dojox/charting/plot2d/StackedAreas",
		"dojox/charting/plot2d/Bars",
		"dojox/charting/plot2d/ClusteredBars",
		"dojox/charting/plot2d/StackedBars",
		"dojox/charting/plot2d/ClusteredColumns",
		"dojox/charting/plot2d/StackedColumns"
	],
	function(arr, dom, domStyle, domConstruct, ready, aspect, registry, 
		Chart, Shrooms, blue, cyan, green, Ireland, SageToLime, Minty, Tufte,
		Highlight, Magnify, Tooltip){
		
		var rootNode = dom.byId("welcome_population_container");
		var flipcard = registry.getEnclosingWidget(dom.byId("welcome_population_container"));
		
		var signal = aspect.after(flipcard, "topicProcess", function(data){
			flipcard.popChart && flipcard.popChart.destroy();
			flipcard.popChart = new Chart(rootNode, {title: data.title + " Population Trend"});
			flipcard.popChart.setTheme(cyan);
			flipcard.popChart.addAxis("x", { fixLower: "minor", fixUpper: "minor", natural: true });
			flipcard.popChart.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major", includeZero: true });
			flipcard.popChart.addPlot("default", {type: "Bars", labels: true, gap: 5, animate: { duration: 1000 }});
			flipcard.popChart.addSeries("Population", data.trend);
			
			new Highlight(flipcard.popChart, "default");
			new Tooltip(flipcard.popChart, "default");
			flipcard.popChart.render();
			flipcard.popChart.resize(600, 250);
		}, true);
});