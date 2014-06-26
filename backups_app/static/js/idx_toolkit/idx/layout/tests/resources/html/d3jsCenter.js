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
	"dojo/_base/event", // event.stop
	'dojo/store/Memory',
	'dijit/registry'
], function(parser, dom, domAttr, domStyle, domClass, domGeometry, domConstruct, topic, aspect, on, event, Memory, registry){

	var rootNode = dom.byId("d3js_center_container");
	var flipcard = registry.getEnclosingWidget(rootNode);
	var flipcardItem = flipcard.getParent();
	
	/*
	flipcard.topicPublisherStub({sourcedata: rawData}, "welcome_center", "detail");
	flipcard.topicPublisherStub({title:rawData.country, trend:rawData.trend.populationTrend}, "welcome_population");
	
	flipcardItem.processFlip();
	*/
	
	d3.select(rootNode).append("div").style("width", "100px").style("height", "20px")
		.style("position", "absolute").style("right", "20px").style("top", "25px")
		.style("color", "white").style("background-color", "gray").style("border", "1px solid black")
		.text("To TreeNav").on("click", function(d) {
			flipcardItem.processFlip();
		});
		
	var pos = domGeometry.position(rootNode);
	
	//content
	var w = pos.w || 650, h = pos.h || 280, w=w-20, h=h-20, x = d3.scale.linear().range([0, w]), y = d3.scale.linear().range([0, h]), color = d3.scale.category20c(), root, node;

	var treemap = d3.layout.treemap().round(false).sticky(true).size([w, h]).value(function(d) {
		return d.size;
	});

	var svg = d3.select(rootNode).append("div").attr("class", "chart").style("width", w + "px").style("height", h + "px")
		.append("svg:svg").attr("width", w).attr("height", h).attr("viewBox", "0 0 450 300").attr("preserveAspectRatio", "xMidYMid")
		.append("svg:g").attr("transform", "translate(.5,.5)")
		

	d3.json("resources/data/files.json", function(data) {
		node = root = data;

		var nodes = treemap.nodes(root).filter(function(d) {
			return !d.children;
		});

		var cell = svg.selectAll("g").data(nodes).enter().append("svg:g").attr("class", "cell").attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		}).on("click", function(d) {
			if(node == d.parent){
				flipcard.topicPublisherStub({title:d.name,sort:true,size:d.size}, "d3jsBarChart");
				flipcard.topicPublisherStub({title:d.name,size:d.size}, "d3jsTrend");
				return zoom(root);
			}else{
				flipcard.topicPublisherStub({title:d.name,sort:false,size:d.size}, "d3jsBarChart");
				flipcard.topicPublisherStub({title:d.name,size:d.size}, "d3jsTrend");
				return zoom(d.parent);
			}
		});

		cell.append("svg:rect").attr("width", function(d) {
			return d.dx - 1;
		}).attr("height", function(d) {
			return d.dy - 1;
		}).style("fill", function(d) {
			return color(d.parent.name);
		});

		cell.append("svg:text").attr("x", function(d) {
			return d.dx / 2;
		}).attr("y", function(d) {
			return d.dy / 2;
		}).attr("dy", ".35em").attr("text-anchor", "middle").text(function(d) {
			return d.name;
		}).style("opacity", function(d) {
			d.w = this.getComputedTextLength();
			return d.dx > d.w ? 1 : 0;
		});

		d3.select(window).on("click", function() {
			zoom(root);
		});

		d3.select("select").on("change", function() {
			treemap.value(this.value == "size" ? size : count).nodes(root);
			zoom(node);
		});
		
		
		//binding resize event from outside container
		var signal_resize = aspect.after(flipcardItem, "onResizeHandleEnd", function(evt, size){
			d3.select(rootNode).select("svg").attr("width", (size.w-20)).attr("height", (size.h-20));
			
			// treemap.size([size.w, size.h]);	
			// d3.select(rootNode).select("div.chart").style("width", size.w + "px").style("height", size.h + "px")
			// svg.attr("width", size.w).attr("height", size.h);
			// cell.attr("transform", function(d) {
				// return "translate(" + d.x*(size.w/w) + "," + d.y*(size.h/h) + ")";
			// })
			// cell.selectAll("rect").attr("width", function(d) {
				// return (d.dx - 1)*(size.w/w);
			// }).attr("height", function(d) {
				// return (d.dy - 1)*(size.h/h);
			// });
			// cell.selectAll("text").attr("x", function(d) {
				// return d.dx*(size.w/w) / 2;
			// }).attr("y", function(d) {
				// return d.dy*(size.h/h) / 2;
			// })
		}, true);
	});

	function size(d) {
		return d.size;
	}

	function count(d) {
		return 1;
	}

	function zoom(d) {
		var kx = w / d.dx, ky = h / d.dy;
		x.domain([d.x, d.x + d.dx]);
		y.domain([d.y, d.y + d.dy]);

		var t = svg.selectAll("g.cell").transition().duration(d3.event.altKey ? 7500 : 750).attr("transform", function(d) {
			return "translate(" + x(d.x) + "," + y(d.y) + ")";
		});

		t.select("rect").attr("width", function(d) {
			return kx * d.dx - 1;
		}).attr("height", function(d) {
			return ky * d.dy - 1;
		})

		t.select("text").attr("x", function(d) {
			return kx * d.dx / 2;
		}).attr("y", function(d) {
			return ky * d.dy / 2;
		}).style("opacity", function(d) {
			return kx * d.dx > d.w ? 1 : 0;
		});

		node = d;
		d3.event.stopPropagation();
	}
	
});