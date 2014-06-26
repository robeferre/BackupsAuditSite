require([
	'dojo/_base/lang',
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
], function(lang, parser, dom, domAttr, domStyle, domClass, domGeometry, domConstruct, topic, aspect, on, touch, event, Memory, registry){

	var rootNode = dom.byId("d3js_barchart_container");
	var flipcard = registry.getEnclosingWidget(rootNode);
	var flipcardItem = flipcard.getParent();
	
	
	var title = d3.select(rootNode).append("div").style("width", "250px").style("height", "20px")
		.style("position", "absolute").style("right", "20px").style("top", "0px")
		.style("color", "white").style("background-color", "blue")
		.text("FileName Acronym Frequency").on("click", function(d) {
			// flipcardItem.processFlip();
		});
		
	var pos = domGeometry.position(rootNode);
	//content
	var margin = {
		top : 20,
		right : 20,
		bottom : 30,
		left : 40
	}, width = (pos.w||450)-20 - margin.left - margin.right, height = (pos.h||250)-20 - margin.top - margin.bottom;

	var formatPercent = d3.format(".0%");

	var x = d3.scale.ordinal().rangeRoundBands([0, width], .1, 1);

	var y = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis().scale(x).orient("bottom");

	var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(formatPercent);

	var svg = d3.select(rootNode).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
		.attr("viewBox", "0 0 450 250").attr("preserveAspectRatio", "xMidYMid")
		.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.tsv("resources/data/data.tsv", function(error, data) {

		data.forEach(function(d) {
			d.frequency = +d.frequency;
		});

		x.domain(data.map(function(d) {
			return d.letter;
		}));
		y.domain([0, d3.max(data, function(d) {
			return d.frequency + 0.1;
		})]);

		svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);

		svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("Frequency");

		var nodes = svg.selectAll(".bar").data(data).enter().append("rect").attr("class", "bar").attr("x", function(d) {
			return x(d.letter);
		}).attr("width", x.rangeBand()).attr("y", function(d) {
			return y(d.frequency);
		}).attr("height", function(d) {
			return height - y(d.frequency);
		});
		
		nodes.on("click", function(d){
			flipcard.topicPublisherStub({title:d.letter, gravity: d.frequency*10}, "d3jsForce");
		});


		function change(sort, asend) {
			
			// Copy-on-write since tweens are evaluated after a delay.
			var x0 = x.domain(data.sort(sort ? function(a, b) {
				return asend ? (a.frequency-b.frequency) : (b.frequency-a.frequency);
			} : function(a, b) {
				return d3.ascending(a.letter, b.letter);
			}).map(function(d) {
				return d.letter;
			})).copy();

			var transition = svg.transition().duration(750), delay = function(d, i) {
				return i * 50;
			};

			transition.selectAll(".bar").delay(delay).attr("x", function(d) {
				return x0(d.letter);
			});
			
			var random = parseInt(Math.random()*40) -20;
			transition.selectAll(".bar").delay(delay).attr("y", function(d, index) {
				return Math.max(0, y(d.frequency) + random);
			}).attr("height", function(d, index) {
				return Math.max(0, height - y(d.frequency) - random);
			});;

			transition.select(".x.axis").call(xAxis).selectAll("g").delay(delay);
		}


		var signal = aspect.after(flipcard, "topicProcess", function(received_data){
			title.text("Acronym Frequency in Folder: " + received_data.title);
			change(received_data.sort, received_data.asend);
		}, true);
		
		var signal_resize = aspect.after(flipcardItem, "onResizeHandleEnd", function(evt, size){
			d3.select(rootNode).select("svg").attr("width", (size.w-20)).attr("height", (size.h-20));
		}, true);
	});
});