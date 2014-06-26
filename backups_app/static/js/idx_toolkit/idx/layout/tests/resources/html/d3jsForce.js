require([
	'dojo/parser',
	'dojo/dom',
	'dojo/topic',
	'dojo/aspect',
	'dojo/on',
	'dojo/touch',
	"dojo/_base/event", // event.stop
	'dojo/store/Memory',
	'dijit/registry'
], function(parser, dom, topic, aspect, on, touch, event, Memory, registry){

	var rootNode = dom.byId("d3js_force_container");
	var flipcard = registry.getEnclosingWidget(rootNode);
	var flipcardItem = flipcard.getParent();
	
	
	var title = d3.select(rootNode).append("div").style("width", "200px").style("height", "35px")
		.style("position", "absolute").style("left", "40px").style("top", "25px")
		.style("color", "white").style("background-color", "gray")
		.text("Relation: connected together by same File Type");
	var titleHeader = d3.select(rootNode).append("div").style("width", "30px").style("height", "35px")
		.style("position", "absolute").style("left", "10px").style("top", "25px")
		.style("color", "red").style("background-color", "white").style("font-size", "25px")
		.text("A");
		
	//content
	var width = 450, height = 250;
	var color = d3.scale.category20();
	var force = d3.layout.force().charge(-120).linkDistance(30).size([width, height]);

	var svg = d3.select(rootNode).append("svg").attr("width", width).attr("height", height);
	d3.json("resources/data/miserables.json", function(error, graph) {
		force.nodes(graph.nodes).links(graph.links).start();

		var link = svg.selectAll(".link").data(graph.links).enter().append("line").attr("class", "link").style("stroke-width", function(d) {
			return Math.sqrt(d.value);
		});

		var node = svg.selectAll(".node").data(graph.nodes).enter().append("circle").attr("class", "node").attr("r", 5).style("fill", function(d) {
			return color(d.group);
		});//.call(force.drag);
		
		node.append("title").text(function(d) {
			return d.name;
		});

		force.on("tick", function() {
			link.attr("x1", function(d) {
				return d.source.x;
			}).attr("y1", function(d) {
				return d.source.y;
			}).attr("x2", function(d) {
				return d.target.x;
			}).attr("y2", function(d) {
				return d.target.y;
			});

			node.attr("cx", function(d) {
				return d.x;
			}).attr("cy", function(d) {
				return d.y;
			});
		});
		
		
	    svg.on("mousemove", mousemove).on("mousedown", mousedown);
	    
	    function mousemove() {
		  cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
		}
		
		function mousedown() {
		  var point = d3.mouse(this),
		      node = {x: point[0], y: point[1]},
		      n = nodes.push(node);
		
		  // add links to any nearby nodes
		  nodes.forEach(function(target) {
		    var x = target.x - node.x,
		        y = target.y - node.y;
		    if (Math.sqrt(x * x + y * y) < 30) {
		      links.push({source: node, target: target});
		    }
		  });
		
		  restart();
		}
		
		function restart() {
		  link = link.data(links);
		
		  link.enter().insert("line", ".node")
		      .attr("class", "link");
		
		  node = node.data(nodes);
		
		  node.enter().insert("circle", ".cursor")
		      .attr("class", "node")
		      .attr("r", 5)
		      .call(force.drag);
		      
		  force.start();
		}
		
		var nodes = force.nodes(),
		    links = force.links(),
		    node = svg.selectAll(".node"),
		    link = svg.selectAll(".link");
		    
		var cursor = svg.append("circle")
		    .attr("r", 30)
		    .attr("transform", "translate(-100,-100)")
		    .attr("class", "cursor");

		restart();
		
		//subscribe topic
		var timeoutHandler = null;
		var signal = aspect.after(flipcard, "topicProcess", function(data){
			titleHeader.text(data.title);
			// svg.selectAll(".node").style("fill", function(d) {
				// return color(d.group*parseInt(data.gravity*10)+5);
			// });
			// svg.selectAll(".link").style("stroke-width", function(d) {
				// return Math.sqrt(d.value)*2;
			// });
			
			// force.gravity(parseFloat(data.gravity));
			force.charge(-10).linkDistance(500).size([2000, 2000])
				.gravity(0.001);
			link.style("display", "none");
			
			restart();
			
			clearTimeout(timeoutHandler);
			timeoutHandler = setTimeout(function(){
				force.charge(-120).linkDistance(30).size([width, height])
					.gravity(parseFloat(data.gravity/2));
				link.style("display", "");
				restart();
			}, 600);
		}, true);
	});
	
});