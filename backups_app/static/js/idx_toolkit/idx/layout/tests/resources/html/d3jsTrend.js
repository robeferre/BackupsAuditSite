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

	var rootNode = dom.byId("d3js_trend_container");
	var flipcard = registry.getEnclosingWidget(rootNode);
	var flipcardItem = flipcard.getParent();
	
	
	var title = d3.select(rootNode).append("div").style("width", "180px").style("height", "20px")
		.style("position", "absolute").style("right", "20px").style("top", "20px")
		.style("color", "white").style("background-color", "blue")
		.text("Folder Size Trend").on("click", function(d) {
			// flipcardItem.processFlip();
		});
	
	var pos = domGeometry.position(rootNode);
	//content
	var margin = {
		top : 20,
		right : 20,
		bottom : 30,
		left : 50
	}, width = (pos.w||450)-20 - margin.left - margin.right, height = (pos.h||250)-20 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%d-%b-%y").parse;

	var x = d3.time.scale().range([0, width]);

	var y = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis().scale(x).orient("bottom");

	var yAxis = d3.svg.axis().scale(y).orient("left");

	var area = d3.svg.area().x(function(d) {
		return x(d.date);
	}).y0(height).y1(function(d) {
		return y(d.trend);
	});

	var svg = d3.select(rootNode).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
		.attr("viewBox", "0 0 450 250").attr("preserveAspectRatio", "xMidYMid")
		.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.tsv("resources/data/trend.tsv", function(error, data) {
		data.forEach(function(d) {
			d.date = parseDate(d.date);
			d.trend = +d.trend;
		});

		x.domain(d3.extent(data, function(d) {
			return d.date;
		}));
		y.domain([0, d3.max(data, function(d) {
			return d.trend+500;
		})]);

		var dpath = svg.append("path").datum(data).attr("class", "area").attr("d", area);

		svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);

		svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("Trend (num)");
		
		var signal = aspect.after(flipcard, "topicProcess", function(rev_data){
			title.text("Trend in " + rev_data.title + " Folder");
			
			var random = parseInt(Math.random()*8);
			area = d3.svg.area().x(function(d) {
				return x(d.date);
			}).y0(height).y1(function(d, index) {
				return y(Math.abs(d.trend + random*(index%10)*5));
			});
			
			y.domain([0, d3.max(data, function(d, index) {
				return d.trend+500+random*(index%10)*5;
			})]);
                
			dpath.transition()
                .duration(1000)
                .attr("d", area);
			// area.start();
			
			flipcard.topicPublisherStub({title:rev_data.title, data_series:data}, "d3jsTrendDetail");
		}, true);
		
		var signal_resize = aspect.after(flipcardItem, "onResizeHandleEnd", function(evt, size){
			d3.select(rootNode).select("svg").attr("width", (size.w-20)).attr("height", (size.h-20));
		}, true);
		
	});
	
	
});