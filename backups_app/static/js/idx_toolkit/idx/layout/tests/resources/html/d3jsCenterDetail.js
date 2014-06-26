require([
	"dojo/_base/array",
	"dojo/_base/lang",
	'dojo/dom',
	'dojo/dom-attr',
	'dojo/dom-style',
	'dojo/dom-class',
	'dojo/dom-geometry',
	'dojo/dom-construct',
	"dojo/ready",
	"dojo/aspect",
	"dijit/registry"
],function(array, lang, dom, domAttr, domStyle, domClass, domGeometry, domConstruct, ready, aspect, registry){
		
	var rootNode = dom.byId("d3js_center_container_detail");
	var flipcard = registry.getEnclosingWidget(rootNode);
	var flipcardItem = flipcard.getParent();
	
	d3.select(rootNode).append("div").style("width", "100px").style("height", "20px")
		.style("position", "absolute").style("left", "20px").style("top", "25px")
		.style("color", "white").style("background-color", "gray")
		.text("Back TreeMapNav").on("click", function(d) {
			flipcardItem.processFlip();
		});
		
	var pos = domGeometry.position(rootNode);
	var m = [10, 10, 10, 10], w = (pos.w || 450)-20 - m[1] - m[3], h = (pos.h || 250)-20 - m[0] - m[2], i = 0, root;

	var tree = d3.layout.tree().size([h, w]);

	var diagonal = d3.svg.diagonal().projection(function(d) {
		return [d.y, d.x];
	});

	var vis = d3.select(rootNode).append("svg:svg").attr("width", w + m[1] + m[3]).attr("height", h + m[0] + m[2])
		.attr("viewBox", "0 0 650 250").attr("preserveAspectRatio", "xMidYMid")
		.append("svg:g").attr("transform", "translate(" + m[3] + "," + m[0] + ")");

	d3.json("resources/data/files.json", function(json) {
		root = json;
		root.x0 = h / 2;
		root.y0 = 0;

		function toggleAll(d) {
			if (d.children) {
				d.children.forEach(toggleAll);
				toggle(d);
			}
		}

		// Initialize the display to show a few nodes.
		root.children.forEach(toggleAll);
		toggle(root.children[1]);
		toggle(root.children[1].children[2]);
		toggle(root.children[7]);
		toggle(root.children[7].children[0]);

		update(root);
		
		var signal = aspect.after(flipcard, "topicProcess", function(data){
		}, true);
		
		var signal_resize = aspect.after(flipcardItem, "onResizeHandleEnd", function(evt, size){
			d3.select(rootNode).select("svg").attr("width", (size.w-20)).attr("height", (size.h-20));
		}, true);
	});

	function update(source) {
		var duration = d3.event && d3.event.altKey ? 5000 : 500;

		// Compute the new tree layout.
		var nodes = tree.nodes(root).reverse();

		// Normalize for fixed-depth.
		nodes.forEach(function(d) {
			d.y = d.depth * 180;
		});

		// Update the nodes…
		var node = vis.selectAll("g.node").data(nodes, function(d) {
			return d.id || (d.id = ++i);
		});

		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("svg:g").attr("class", "node").attr("transform", function(d) {
			return "translate(" + source.y0 + "," + source.x0 + ")";
		}).on("click", function(d) {
			toggle(d);
			update(d);
			if(root == d.parent){
				flipcard.topicPublisherStub({title:d.name,sort:false,size:d.size}, "d3jsBarChart");
				flipcard.topicPublisherStub({title:d.name,size:d.size}, "d3jsTrend");
			}else{
				flipcard.topicPublisherStub({title:d.name,sort:true,asend:true,size:d.size}, "d3jsBarChart");
				flipcard.topicPublisherStub({title:d.name,size:d.size}, "d3jsTrend");
			}
			
		});

		nodeEnter.append("svg:circle").attr("r", 1e-6).style("fill", function(d) {
			return d._children ? "lightsteelblue" : "#fff";
		});

		nodeEnter.append("svg:text").attr("x", function(d) {
			return d.children || d._children ? -10 : 10;
		}).attr("dy", ".35em").attr("text-anchor", function(d) {
			return d.children || d._children ? "end" : "start";
		}).text(function(d) {
			return d.name;
		}).style("fill-opacity", 1e-6);

		// Transition nodes to their new position.
		var nodeUpdate = node.transition().duration(duration).attr("transform", function(d) {
			return "translate(" + d.y + "," + d.x + ")";
		});

		nodeUpdate.select("circle").attr("r", 4.5).style("fill", function(d) {
			return d._children ? "lightsteelblue" : "#fff";
		});

		nodeUpdate.select("text").style("fill-opacity", 1);

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition().duration(duration).attr("transform", function(d) {
			return "translate(" + source.y + "," + source.x + ")";
		}).remove();

		nodeExit.select("circle").attr("r", 1e-6);

		nodeExit.select("text").style("fill-opacity", 1e-6);

		// Update the links…
		var link = vis.selectAll("path.link").data(tree.links(nodes), function(d) {
			return d.target.id;
		});

		// Enter any new links at the parent's previous position.
		link.enter().insert("svg:path", "g").attr("class", "link").attr("d", function(d) {
			var o = {
				x : source.x0,
				y : source.y0
			};
			return diagonal({
				source : o,
				target : o
			});
		}).transition().duration(duration).attr("d", diagonal);

		// Transition links to their new position.
		link.transition().duration(duration).attr("d", diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition().duration(duration).attr("d", function(d) {
			var o = {
				x : source.x,
				y : source.y
			};
			return diagonal({
				source : o,
				target : o
			});
		}).remove();

		// Stash the old positions for transition.
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}

	// Toggle children.
	function toggle(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
	}
	
});