require([
		"dojo/_base/array",
		"dojo/_base/lang",
		"dojo/dom",
		"dojo/dom-style",
		"dojo/dom-construct",
		"dojo/ready",
		"dojo/aspect",
		"dijit/registry",
		"dijit/form/Button",
		"dojox/charting/Chart",
		"dojox/charting/plot2d/Spider", 
		"dojox/charting/axis2d/Base",
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
	function(array, lang, dom, domStyle, domConstruct, ready, aspect, registry, Button,
		Chart, Spider, Base, Shrooms, blue, cyan, green, Ireland, SageToLime, Minty, Tufte,
		Highlight, Magnify, Tooltip){
		
		var rootNode = dom.byId("welcome_center_detail_container");
		var flipcard = registry.getEnclosingWidget(rootNode);
		var flipcardItem = flipcard.getParent();
		
		var signal = aspect.after(flipcard, "topicProcess", function(data){
			var seriesData = lang.clone(data.sourcedata);
			var name = seriesData.country;
			delete seriesData["country"];
			delete seriesData["trend"];
			
			flipcard.centerChart && flipcard.centerChart.destroy();
			flipcard.centerChart = new Chart(rootNode);
			flipcard.centerChart.setTheme(blue);
			flipcard.centerChart.addPlot("default", {
				type: Spider,
				labelOffset: -10,
				axisColor:      "lightgray",
				spiderColor:    "silver",
	            seriesFillAlpha: 0.2,
				spiderOrigin:	 0.16,
				markerSize:  	 3,
				precision:		 0
			});
	
			// we define several axis (optional step for the general case)
			flipcard.centerChart.addAxis("gdp", { type: Base, min: 0, max: 30 });
			flipcard.centerChart.addAxis("growth", { type: Base, min: 0, max: 30});
			flipcard.centerChart.addAxis("population", { type: Base, min: 0, max: 30 });
			flipcard.centerChart.addAxis("area", { type: Base, min: 0, max: 30});
			flipcard.centerChart.addAxis("inflation", { type: Base, min: 100, max:350 });
			
			// we add a single series, without axis definitions we won't be able to compute data axis min/max
			flipcard.centerChart.addSeries(name, {data: seriesData }, { fill: "green" });
	
			flipcard.centerChart.render();
			
			//chart title
			flipcard.centerChartTitle && domConstruct.destroy(flipcard.centerChartTitle);
			flipcard.centerChartTitle = domConstruct.create("div", {
				innerHTML: name + " Spider Chart",
				style: "font-size: 20px; color:blue; position:absolute; left:10px; top: 30px;"
			}, rootNode);
			
			flipcard.centerBack && flipcard.centerBack.destroy();
			flipcard.centerBack = new Button({
				label: "Back",
				style: "position:absolute;left:20px;top:55px;",
				onClick: function(){
					flipcardItem.processFlip();
				}
			}).placeAt(rootNode);
		}, true);
});