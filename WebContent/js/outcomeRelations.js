var outcomeGraph = (function() {
	// Padding for svg container
	var padding = {
		top : 5,
		right : 5,
		bottom : 5,
		left : 5
	};

	var config = {
		outcomeWidth : 10,
		decisionWidth : 20,
		ldRoot : 220,
		ldDp : 120,
		ldDec : 50,
		ldOut : 50,
		// lsRoot : 50,
		// lsDp : 80,
		// lsDec : 30,
		// lsOut : 20
		gravity : 0.05,
		friction : 0.75,
		lsDefault : 1,
		chRoot : -15,
		chDp : -20,
		chDec : -300,
		chOut : -160,
		minSvgWidth : 900
	};

	var mC, root, initialNodes;
	var svg, pathGroup, linkGroup, node, link, circle;
	var force, nodes, links;
	var outcomeLinks, outcomePaths = [];
	var node_lookup = [], root_lookup = [];

	// Toggle stores whether the highlighting is on
	var toggle = 0;
	// Create an array logging what is connected to what
	var linkedByIndex = {};

	function initialize() {
		// compute panel size and margins after margin convention
		mC = marginConvention(padding, config.minSvgWidth);

		// select container and remove it in case it exists already
		d3.select("#svgContainer").remove();
		// new svg with margin and id svgContainer, class for css flexibility
		svg = d3
				.select("#visContent")
				.append("svg")
				.attr("width", mC.oWidth)
				.attr("height", mC.oHeight)
				.attr("id", "svgContainer")
				.append("g")
				.attr("transform",
						"translate(" + mC.marginLeft + "," + mC.marginTop + ")")
				.attr("class", "outcomeContainer");

		// append group for links (lines) and paths
		pathGroup = svg.append("g").attr("id", "paths");
		linkGroup = svg.append("g").attr("id", "links");

		// new force layout and configuration
		force = d3.layout.force().size([ mC.panelWidth, mC.panelHeight ]);
		// todo

		// array to finde nodes for link target and source

		// set nodes and links as ref to force layout to keep in synch
		nodes = force.nodes();
		links = force.links();
		// variables for layout entities

		root.fixed = true;
		root.x = mC.panelWidth / 2;
		root.y = mC.panelHeight / 2;

		update();
	}

	// update the layout according to the changes and start the simulation
	function update() {
		nodes.splice(0, nodes.length);
		node_lookup.splice(0, node_lookup.length);
		var initialNodes = flatten(root);
		initialNodes.forEach(function(d) {
			if(d.type != "root"){
			d.x = Math.cos(d.cluster / 4 * 2 * Math.PI) * 300 + mC.panelWidth / 2 + Math.random();
			d.y = Math.sin(d.cluster / 4 * 2 * Math.PI) * 300 + mC.panelHeight / 2 + Math.random()}
//			switch (d.cluster) {
//			case 1:
//				d.x = 5;
//				d.y = 5;
//				break;
//			case 2:
//				d.x = 600
//				d.y = 100
//				break;
//			case 3:
//				d.x = 100;
//				d.y = 500;
//				break;
//			case 4:
//				d.x = 600;
//				d.y = 500;
//				break;
//			default:
//				break;
//			}

			addNode(d);
		});

		links.splice(0, links.length);
		var layoutLinks = d3.layout.tree().links(nodes);
		layoutLinks.forEach(function(d) {
			addLayoutLink(d);
		});
		outcomePaths.splice(0, outcomePaths.length);
		outcomeLinks.forEach(function(d) {
			addLink(d);
		});
		// stop force not necessary
		force.stop();

		// force.charge(function(d) {
		// return d._children ? config.chDp : config.chOut;
		// }).linkDistance(function(d) {
		// return setLinkDistance(d);
		// }).linkStrength(config.lsDefault).gravity(config.gravity).friction(
		// config.friction).on("tick", tick);
		//		

		force
		.charge(function(d) {
			return setCharge(d);
			// return d._children ? config.chDp : config.chOut;
		})
		.linkDistance(function(d) {
			return setLinkDistance(d);
		}).linkStrength(config.lsDefault).gravity(config.gravity).friction(
				config.friction).on("tick", tick);
		// get group with all line (layoutLinks)
		link = linkGroup.selectAll("line").data(links, function(d) {
			return d.source.id + "-" + d.target.id + "-" + d.type;
		});
		// update and insert new lines
		link.enter().insert("line").attr("class", function(d) {
			return d.type;
		}).attr("x1", function(d) {
			return d.source.x;
		}).attr("y1", function(d) {
			return d.source.y;
		}).attr("x2", function(d) {
			return d.target.x;
		}).attr("y2", function(d) {
			return d.target.y;
		});

		// Exit any old links.
		link.exit().remove();

		path = pathGroup.selectAll("path").data(outcomePaths, function(d) {
			return d.source.id + "-" + d.target.id + "-" + d.type;
		});

		path.enter().insert("path").attr("class", function(d) {
			return d.relationGroup + d.type;
		});

		path.exit().remove();

		// select groups for nodes
		var node = svg.selectAll("g.node").data(nodes, function(d) {
			return d.id;
		});

		// select new groups and updates for nodes
		var nodeEnter = node.enter().append("g").attr("class", "node");

		// append circle
		nodeEnter.append("svg:circle").attr("r", function(d) {
			return d.children ? config.decisionWidth : config.outcomeWidth;// d.size
			// :
			// outcomeWidth;
		}).attr("cx", function(d) {
			// if(d.cluster > 2) return 400;
			// return -400;
			return d.x;
		}).attr("cy", function(d) {
			// if(d.cluster > 2) return 400;
			// return -400;
			return d.y;
		}).style("fill", function(d) {
			return setCircleFill(d)
		}).on("dbclick", click).call(force.drag);
		// .on('click', function(d){connectedNodes(d);});
		nodeEnter.filter(function(d) {
			if (d.type != "out")
				return d;
		}).append("text").attr("x", 0).attr("y", "1em").attr("dy", function(d) {
			var i = d.children ? config.decisionWidth : config.outcomeWidth;
			return "" + i + "px";
		}).attr("text-anchor", "middle").text(function(d) {
			return d.label;
		});

		// remove nodes
		node.exit().remove();

		// set circle for tick
		circle = node.selectAll("g.node circle");

		circle.transition().attr("r", function(d) {
			return d.children ? config.decisionWidth : config.outcomeWidth;// d.size
			// :
			// outcomeWidth;
		});

		text = node.selectAll("g.node text");
		force.start();
		// for (var int = 0; int < 200; int++) {
		// force.tick();
		// }
		// start force layout
		// force.stop();
	}

	function tick() {
		link.attr("x1", function(d) {
			return d.source.x;
		}).attr("y1", function(d) {
			return d.source.y;
		}).attr("x2", function(d) {
			return d.target.x;
		}).attr("y2", function(d) {
			return d.target.y;
		});

		text.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

		path.attr("d", linkArc);

		circle.attr("cx", function(d) {
			return d.x;
		}).attr("cy", function(d) {
			return d.y;
		});
	}

	function linkArc(d) {
		var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math
				.sqrt(dx * dx + dy * dy);
		return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr
				+ " 0 0,1 " + d.target.x + "," + d.target.y;
	}

	function setLinkDistance(d) {
		switch (d.source.type) {
		case "root":
			return config.ldRoot;
			break;
		case "dp":
			return config.ldDp;
			break;
		case "dec":
			return config.ldDec;
			break;
		default:
			return config.ldRoot;
			break;
		}
	}

	function setCharge(d) {
		switch (d.type) {
		case "root":
			return config.chRoot;
			break;
		case "dp":
			return config.chDp;
			break;
		case "dec":
			return config.chDec;
			break;
		case "out":
			return config.chOut;
			break;
		}

		// if(d.type =="root") return 0;
		// if(d._children || d.children) return config.chDp;
		// if(d.children) return config.chDec;
		//		
		// return config.chOut;
	}

	// Toggle children on click.
	function click(d) {

		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}

		// todo löschen der unabhängigen pfade entsprechend des ausgewählten
		// knotens
		// initialize();
		update();
	}

	// Returns a list of all nodes under the root.
	function flatten(root) {
		var flattenedNodes = [];// i = 0;
		function recurse(node) {
			if (node.children)
				node.size = node.children.reduce(function(p, v) {
					return p + recurse(v);
				}, 0);
			flattenedNodes.push(node);
			return node.size;
		}
		root.size = recurse(root);
		return flattenedNodes;
	}

	function setCircleFill(d) {
		return getColor(d.group);
	}

	// Module functions
	// add node to force.nodes and to lookup table
	function addNode(d) {
		nodes.push(d);
		node_lookup[d.id] = d;
	}

	function addLink(link) {
		var source = node_lookup[link.source];
		var target = node_lookup[link.target];
		if (source != null && target != null) {
			outcomePaths.push({
				"source" : source,
				"target" : target,
				"relationGroup" : link.relationGroup,
				"type" : link.type
			});
		}
	}

	// add layout link (tree) for hierarchy
	function addLayoutLink(link) {
		links.push({
			"source" : link.source,
			"target" : link.target,
			"relationGroup" : "treeRel",
			"type" : "layoutLink"
		});
	}

	function connectedNodes(d) {
		if (toggle == 0) {
			// Reduce the opacity of all but the neighbouring nodes
			// d = d3.select(this).node().__data__;
			// node.style("opacity", function (o) {
			// return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
			// });
			// link.style("opacity", function (o) {
			// return d.index==o.source.index | d.index==o.target.index ? 1 :
			// 0.1;
			// });
			d3.selectAll("g.node").style("opacity", 0.1);
			d3.selectAll("paths").style("opacity", 0.1);
			// d.style("opacity", 0.1);
			// Reduce the op
			toggle = 1;
		} else {
			// Put them back to opacity=1
			d3.selectAll("g.node").style("opacity", 1);
			d3.selectAll("paths").style("opacity", 1);
			toggle = 0;
		}
	}

	d3.json("./data/cloudDSFPlus.json", function(error, json) {
		root = json.cdsfPlus;
		outcomeLinks = json.outcomeLinks.filter(function(d) {
			if (d.target != d.source)
				return d;
		});
		// initialize();
	});

	var setOutCharge = (function(d) {
		config.chOut = d;
		update();
	});

	var setDecCharge = (function(d) {
		config.decOut = d;
		update();
	});
	
	var setDpCharge = (function(d) {
		config.chDp = d;
		update();
	});
	
	var setRootCharge = (function(d) {
		config.chRoot = d;
		update();
	});

	// Reveal module pattern, offer functions to the outside
	return {
		getForce : force,
		update : update,
		initialize : initialize,
		setOutCharge : setOutCharge,
		setDecCharge : setDecCharge,
		setDpCharge : setDpCharge,
		setRootCharge : setRootCharge
	};
})();