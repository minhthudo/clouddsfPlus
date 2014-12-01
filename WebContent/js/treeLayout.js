// Global variables for all layouts
// Margin and Size of SVG
var margin = {
	top : 5,
	right : 10,
	bottom : 10,
	left : 5
}

var oWidth = parseInt($('#visContent').width());
var oHeight = parseInt($('#visContent').height());
var iWidth, iHeight, panelWidth, panelHeight;

function marginConvention(padding) {
	iWidth = oWidth - margin.left - margin.right;
	iHeight = oHeight - margin.top - margin.bottom;
	panelWidth = iWidth - padding.left - padding.right;
	panelHeight = iHeight - padding.top - padding.bottom;
}
//todo write as revealing module
function drawTreeLayout() {
//	oWidth = 1100;
	oHeight = 1000;
	var padding = {
		top : 5,
		right : 5,
		bottom : 5,
		left : 45
	};
	marginConvention(padding);
	var circleRadius = 10;

	d3.select("#svgContainer").remove();
	
	var svg = d3.select("#visContent").append("svg").attr("width", oWidth)
			.attr("height", oHeight).attr("id", "svgContainer").append("g")
			.attr("transform",
					"translate(" + margin.left + "," + margin.top + ")");

	var root;
	// Create new TreeLayout with svg size
	var tree = d3.layout.tree().size([ panelHeight, panelWidth ]);

	var diagonal = d3.svg.diagonal().projection(function(d) {
		return [ d.y, d.x ];
	});

	d3.json("./js/json/elaboratedDSF.json", function(json) {
		root = json.decisionTree;
		// start in the left-middle of the svg
		root.x0 = panelWidth / 2;
		root.y0 = 0;
		// collapse all datapoints
		function toggleAll(d) {
			if (d.children) {
				d.children.forEach(toggleAll);
				toggle(d);
			}
		}
		// collapse all children
		root.children.forEach(toggleAll);
		update(root, svg);
	});

	function update(source, svg) {
		var duration = d3.event && d3.event.altKey ? 5000 : 500;

		// Compute the new tree layout.
		var nodes = tree.nodes(root).reverse();

		// Normalize for fixed-depth.
		var distance = panelWidth / 16;
		// set y for every node according to type and hence level to enable
		// better labeling
		nodes.forEach(function(d) {
			var x = 0;
			switch (d.type) {
			case "root":
				x = 0;
				break;
			case "decisionPoint":
				x = 4.5;
				break;
			case "decision":
				x = 8;
				break;
			case "outcome":
				x = 9.5;
				break;
			}
			d.y = (x * distance) + padding.left;
		});

		// Update the nodes…
		var node = svg.selectAll("g.treeNode").data(nodes, function(d) {
			return d.id;
		});

		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("svg:g").attr("class", "treeNode")
				.attr("transform", function(d) {
					return "translate(" + source.y0 + "," + source.x0 + ")";
				});
		// append text element with placement in dependance to circle radius and
		// wrap in case it exceeds treshold.
		var textWrapper = nodeEnter.append("svg:text").attr(
				"x",
				function(d) {
					if (d.type == "root")
						return 0;
					return d.children || d._children ? -circleRadius - 5
							: circleRadius + 5;
				}).attr("y", function(d) {
			if (d.type == "root")
				return -circleRadius - 5;
			return circleRadius / 2;
		}).attr("dy", 0).attr("text-anchor", function(d) {
			if (d.type == "root")
				return "middle";
			return d.children || d._children ? "end" : "start";
		}).text(function(d) {
			return d.label;
		});
		textWrapper.filter(function(d) {
			if (d.type != "outcome")
				return d;
		}).call(wrap, panelWidth / 6);
		
		textWrapper.filter(function(d) {
			if (d.type == "outcome")
				return d;
		}).call(wrap, panelWidth / 3);
		
		// append different css classes through method
		nodeEnter.append("svg:circle").attr("r", circleRadius).attr("class",
				function(d) {
					return setClass(d);
				}).on("click", function(d) {
			toggle(d);
			update(d, svg);
			// ToDo
		});

		// Transition nodes to their new position.
		var nodeUpdate = node.transition().duration(duration).attr("transform",
				function(d) {
					return "translate(" + d.y + "," + d.x + ")";
				});

		nodeUpdate.select("circle").attr("r", circleRadius).attr("class",
				function(d) {
					return setClass(d);
				});

		nodeUpdate.select("text").style("fill-opacity", 1);

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition().duration(duration).attr(
				"transform", function(d) {
					return "translate(" + source.y + "," + source.x + ")";
				}).remove();
		// toDo
		nodeExit.select("circle").attr("r", 1e-6);
		// toDo
		nodeExit.select("text").style("fill-opacity", 1e-6);

		// Update the links…
		var link = svg.selectAll("path.treeLink").data(tree.links(nodes),
				function(d) {
					return d.target.id;
				});

		// Enter any new links at the parent's previous position.
		link.enter().insert("svg:path", "g").attr("class", "treeLink").attr(
				"d", function(d) {
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

		// Keep old positions for transition
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

	// Set classes for entities
	function setClass(d) {
		if (d._children) {
			if ("decisionPoint" == d.type) {
				return "decisionPoint" + d.id.toString()[0] + " treeCollapsed";
			} else if ("decision" == d.type) {
				return "decision" + d.id.toString()[0] + " treeCollapsed";
			} else if ("outcome" == d.type) {
				return "outcome" + d.id.toString()[0] + " treeCollapsed";
			} else {
				return "treeRoot treeCollapsed";
			}
		} else {
			if ("decisionPoint" == d.type) {
				return "decisionPoint" + d.id.toString()[0] + " treeExpanded";
			} else if ("decision" == d.type) {
				return "decision" + d.id.toString()[0] + " treeExpanded";
			} else if ("outcome" == d.type) {
				return "outcome" + d.id.toString()[0] + " treeCollapsed";
			} else {
				return "treeRoot treeExpanded";
			}
		}
	}
	// wrap text items in multiple tspans to avoid foreignobject which is not
	// rendered by ie
	function wrap(text, width) {
		text.each(function() {
			var text = d3.select(this);
			var words = text.text().split(/\s+/).reverse();
			var word, line = [], lineNumber = 0, lineHeight = 1.1; // ems
			var y = text.attr("y"), x = text.attr("x"), dy = parseFloat(text
					.attr("dy"));
			var amountSpans = 1;
			var tspan = text.text(null).append("tspan").attr("x", x).attr("y",
					y).attr("dy", dy);
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [ word ];
					// resolve offset if more than two rows. Not got if more
					// than two rows.
					amountSpans++;
					tspan = text.append("tspan").attr("x", x).attr("y", y)
					// y - (circleRadius / 2))
					.attr("dy", ++lineNumber * lineHeight + dy + "em").text(
							word);
				}
			}
			if (amountSpans > 1) {
				var dyShift = (amountSpans - 1) / 2 * lineHeight;
				dyShift = dyShift.toFixed(2);
				text.attr("dy", -dyShift + "em");
				text.selectAll("tspan").attr("dy", function(d) {
					var span = d3.select(this);
					olddY = parseFloat(span.attr("dy"));
					return olddY - dyShift + "em";
				})
			}
		});
	}
}