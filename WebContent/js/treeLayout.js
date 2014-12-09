//TreeLayout Module
var treeGraph = function() {
	// Padding for svg container
	var padding = {
		top : 5,
		right : 10,
		bottom : 5,
		left : 50
	};

	var config = {
		decRadius : 10,
		outRadius : 10,
	};

	var tree, nodes, root, mC, svg, diagonal;
	var resizeId;
	var tooltip;
	function initialize() {
		// compute panel size and margins after margin convention
		// set height to 1000
		mC = marginConvention(padding, 1300);

		// delete old svg content
		d3.select("#svgContainer").remove();

		svg = d3
				.select("#visContent")
				.append("svg")
				.attr("width", mC.oWidth)
				.attr("height", mC.oHeight)
				.attr("id", "svgContainer")
				.append("g")
				.attr("transform",
						"translate(" + mC.marginLeft + "," + mC.marginTop + ")");

		// Create new TreeLayout with svg size
		tree = d3.layout.tree().size([ mC.panelHeight, mC.panelWidth ]);
		diagonal = d3.svg.diagonal().projection(function(d) {
			return [ d.y, d.x ];
		});

		tooltip = d3.select("body").append("div").attr("id", "tooltip").style(
				"position", "absolute").style("z-index", "10").style("opacity",
				0);
		// start in the left-middle of the svg
		root.x0 = mC.panelWidth / 2;
		root.y0 = 0;

		// collapse all children
		root.children.forEach(toggleAll);
		// update tree depending on node
		update(root, svg);
	}

	function update(source, svg) {
		var duration = d3.event && d3.event.altKey ? 5000 : 500;

		// Compute the new tree layout.
		var nodes = tree.nodes(root).reverse();

		// Normalize for fixed-depth.
		var distance = mC.panelWidth / 16;
		// set y for every node according to type and hence level to enable
		// better labeling
		nodes.forEach(function(d) {
			var x = 0;
			switch (d.type) {
			case "root":
				x = 0;
				break;
			case "dp":
				x = 4.5;
				break;
			case "dec":
				x = 8;
				break;
			case "out":
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
					return d.children || d._children ? -config.decRadius - 5
							: config.outRadius + 5;
				}).attr("y", function(d) {
			if (d.type == "root")
				return -config.decRadius - 5;
			if (d.type == "out")
				return config.outRadius * 1 / 2;
			return config.decRadius * 1 / 3;
		}).attr("dy", 0).attr("text-anchor", function(d) {
			if (d.type == "root")
				return "middle";
			return d.children || d._children ? "end" : "start";
		}).text(function(d) {
			return d.label;
		});
		textWrapper.filter(function(d) {
			if (d.type != "out")
				return d;
		}).call(wrap, mC.panelWidth / 6);

		textWrapper.filter(function(d) {
			if (d.type == "out")
				return d;
		}).call(wrap, mC.panelWidth / 3);

		// append different css classes through method
		nodeEnter.append("svg:circle").attr("r", function(d) {
			if (d.type == "out")
				return config.outRadius;
			return config.decRadius;
		}).attr("class", function(d) {
			return setClass(d);
		}).attr("fill", function(d) {
			return setCircleFill(d);
		}).attr("stroke", function(d) {
			return setCircleStroke(d);
		}).on("click", function(d) {

			toggle(d);
			update(d, svg);
			// ToDo
		}).on("mouseover", mouseOverArc).on("mousemove", mouseMoveArc).on(
				"mouseout", mouseOutArc);
		;

		// Transition nodes to their new position.
		var nodeUpdate = node.transition().duration(duration).attr("transform",
				function(d) {
					return "translate(" + d.y + "," + d.x + ")";
				});

		nodeUpdate.select("circle").attr("r", function(d) {
			if (d.type == "out")
				return config.outRadius;
			return config.decRadius;
		}).attr("class", function(d) {
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

	// collapse all datapoints
	function toggleAll(d) {
		if (d.children) {
			d.children.forEach(toggleAll);
			toggle(d);
		}
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
			return d.group + " treeCollapsed";
		} else {
			if (d.children) {
				return d.group + " treeExpanded";
			}
			return d.group + " treeExpanded outNode";
		}
	}

	function setCircleStroke(d) {
		return getColor(d.group);
	}

	function setCircleFill(d) {
		return getColor(d.group);
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
					// y - (decisionRadius / 2))
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

	// get data
	d3.json("./data/cloudDSFPlus.json", function(json) {
		root = json.cdsfPlus;
		// initialize();
	});

	function resizeLayout() {
		// compute panel size and margins after margin convention
		// set height to 1000
		mC = marginConvention(padding, 1000);

		// delete old svg content
		d3.select("#svgContainer").remove();

		svg = d3
				.select("#visContent")
				.append("svg")
				.attr("width", mC.oWidth)
				.attr("height", mC.oHeight)
				.attr("id", "svgContainer")
				.append("g")
				.attr("transform",
						"translate(" + mC.marginLeft + "," + mC.marginTop + ")");

		// Create new TreeLayout with svg size
		tree = d3.layout.tree().size([ mC.panelHeight, mC.panelWidth ]);
		diagonal = d3.svg.diagonal().projection(function(d) {
			return [ d.y, d.x ];
		});

		// start in the left-middle of the svg
		root.x0 = mC.panelWidth / 2;
		update(root, svg);
	}

	// show all decision points
	function showDPs() {
		root.children.forEach(toggleNeg);
		update(root, svg);
	}

	// show all decisions
	function showDecisions() {
		root.children.forEach(function(d) {
			if (d.children) {
				d.children.forEach(toggleNeg);
			}
			if (d._children) {
				d.children = d._children;
				d._children = null;
				d.children.forEach(toggleNeg);
			}
		});
		update(root, svg);
	}

	// show all outcomes
	function showOutcomes() {
		root.children.forEach(function(d) {
			if (d.children) {
				d.children.forEach(togglePos);
			}
			if (d._children) {
				d.children = d._children;
				d._children = null;
				d.children.forEach(togglePos);
			}
		});
		update(root, svg);
	}

	// Show all children
	function togglePos(d) {
		if (d.children) {
		} else {
			d.children = d._children;
			d._children = null;
		}
	}

	// Don't show children
	function toggleNeg(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		}
	}

	// tooltip
	function format_description(d) {
		return '<strong>' + d.label + '</strong> <p> ' + d.description + '</p>';
	}

	function mouseOverArc(d) {
		tooltip.html(format_description(d));
		return tooltip.transition().duration(50).style("opacity", 0.9);
	}

	function mouseOutArc() {
		return tooltip.style("opacity", 0);
	}

	function mouseMoveArc(d) {
		return tooltip.style("top", (d3.event.pageY + 10) + "px").style("left",
				(d3.event.pageX + 10) + "px");
	}

	return {
		update : update,
		initialize : initialize,
		resizeLayout : resizeLayout,
		showDPs : showDPs,
		showDecisions : showDecisions,
		showOutcomes : showOutcomes,
	};
}();
