require([
	'dojo/parser',
	'dojo/dom',
	'dojo/dom-attr',
	'dojo/dom-style',
	'dojo/dom-class',
	'dojo/dom-geometry',
	'dojo/dom-construct',
	'dojo/topic',
	'dojo/aspect',
	'dojo/on',
	'dojo/touch',
	"dojo/_base/event", // event.stop
	'dojo/store/Memory',
	'dijit/registry'
], function(parser, dom, domAttr, domStyle, domClass, domGeometry, domConstruct, topic, aspect, on, touch, event, Memory, registry){

	var rootNode = dom.byId("d3js_trend_detail_container");
	var flipcard = registry.getEnclosingWidget(rootNode);
	var flipcardItem = flipcard.getParent();
	
	
	var title = d3.select(rootNode).append("div").style("width", "300px").style("height", "20px")
		.style("position", "absolute").style("left", "20px").style("top", "0px")
		.style("color", "white").style("background-color", "orange").style("padding-left", "5px")
		.text("File Type Percentage").on("click", function(d) {
			// flipcardItem.processFlip();
		});
	
	var pie_title = d3.select(rootNode).append("div").style("width", "150px").style("height", "40px")
		.style("position", "absolute").style("left", "10px").style("top", "30px")
		.style("color", "red").style("font-size", "16px").style("padding", "10px")
		.text("");
	
	
	var pos = domGeometry.position(rootNode);
	//content
	var width = (pos.w||450)-20, height = (pos.h||250)-20, radius = Math.min(width, height) / 2;

	var color = d3.scale.category20();

	var pie = d3.layout.pie().value(function(d) {
		return d.partition1;
	}).sort(null);

	var arc = d3.svg.arc().innerRadius(radius - 100).outerRadius(radius - 20);

	var svg = d3.select(rootNode).append("svg").attr("width", width).attr("height", height)
		.attr("viewBox", "0 0 400 200").attr("preserveAspectRatio", "xMidYMid")
		.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	
	d3.tsv("resources/data/pie.tsv", type, function(error, data) {
		var path = svg.datum(data).selectAll("path").data(pie).enter().append("path").attr("fill", function(d, i) {
			return color(i);
		}).attr("d", arc);
		
		path.on("mouseover", function(d){
			var percentage = (d.endAngle-d.startAngle)*100/6.28 + "'";
			var re = /([0-9]+\.[0-9]{2})[0-9]*/;
			percentage = percentage.replace(re,"$1");
			
			pie_title.text(percentage + "% " + d.data["partition5"] + " files");
		});

		var index_count = 0;
		function change() {
			var value = "partition" + (index_count%4);
			pie.value(function(d) {
				return d[value];
			});
			// change the value function
			path = path.data(pie);
			// compute the new angles
			path.transition()
                .duration(1000)
                .attr("d", arc);
			// redraw the arcs
			
			index_count++;
		}
		
		var signal = aspect.after(flipcard, "topicProcess", function(rev_data){
			title.text("File Type Percentage in Folder: " + rev_data.title);
			change();
		}, true);
		
		var signal_resize = aspect.after(flipcardItem, "onResizeHandleEnd", function(evt, size){
			d3.select(rootNode).select("svg").attr("width", (size.w-20)).attr("height", (size.h-20));
		}, true);

	});

	function type(d) {
		d.partition1 = +d.partition1;
		d.partition2 = +d.partition2;
		return d;
	}
	
});