var outcomeGraph = (function() {

	// Padding for svg container
	var padding = {
		top : 80,
		right : 10,
		bottom : 30,
		left : 10
	};

	var config = {
		outWidth : 10,
		decWidth : 23,
		dpWidth : 28,
		addedDpWidth : 20,
		addedDecWidth : 10,
		rootWidth : 30,
		ldRoot : 270,
		ldDp : 120,
		ldDec : 50,
		// lsRoot : 1,
		// lsDp : 0.5,
		// lsDec : 1,

		// gravity : 0.05,// 0.05,
		// friction : 0.8,
		// lsDefault : 1,
		// chRoot : -20,
		// chDp : -20,
		// chDec : -200, // -300,
		// chOut : -150, // -160,

		// gravity : 0.1,// 0.05,
		// friction : 0.8,
		// lsDefault : 1,
		// chRoot : -200,
		// chDp : -20,// -10,
		// chDec : -350,// -40, // -300,
		// chOut : -350, // -50, // -160,

		gravity : 0.1,
		friction : 0.8,
		lsDefault : 1,
		chRoot : -20,
		chDp : -20,
		chDec : -450,
		chOut : -300,
		minHeight : 1000,
		minWidth : 1140

	// gravity : 0.1,// 0.05,
	// friction : 0.8,
	// lsDefault : 1,
	// chRoot : -20,
	// chDp : -20,
	// chDec : -650,
	// chOut : -350,

	};
	var start = true;
	var mC, root, initialNodes;
	var svg, pathGroup, linkGroup, node, link, circle;
	var force, nodes, links;
	var outcomeLinks, outcomePaths = [];
	var node_lookup = [], root_lookup = [];
	var relations = [ "including", "excluding", "affecting", "binding",
			"allowing" ];
	var visGroup;

	function initialize() {
		// compute panel size and margins after margin convention
		mC = marginConvention(padding, config.minHeight, config.minWidth);

		// console.log(mC.panelWidth);
		// console.log(mC.panelHeight);
		// config.ldRoot = Math.floor(Math.sqrt((Math.pow(
		// mC.panelWidth / 100 * 20, 2) - padding.left)
		// + (Math.pow(mC.panelHeight / 100 * 25, 2) - padding.top)));
		// console.log(config.ldRoot);
		// config.ldDp = config.ldRoot - config.ldDec - 100;
		// console.log(config.ldDp);

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

		svg.append("defs").selectAll("marker").data(relations).enter().append(
				"marker").attr("id", function(d) {
			return d;
		}).attr("viewBox", "0 0 10 10").attr("refX", function(d) {
			// if (d == "requiring")
			// return 10;
			return 10;
		}).attr("refY", function(d) {
			// if (d == "requiring")
			// return 5;
			return 5;
		}).attr("markerWidth", 6).attr("markerHeight", 6).attr("markerUnits",
				"strokeWidth").attr("orient", "auto").append("svg:path").attr(
				"d", "M 0,0 l 10,5 l -10,5").attr(
				"class",
				function(d) {
					return "outRel " + d.substring(0, 2) + " arrow"
							+ d.substring(0, 2);
				});

		// create legend above chart
		var legend = svg.append("g").attr("id", "legend");
		legend.selectAll("line").data(relations).enter().append("line").attr(
				"class", function(d) {
					return "outRel " + d.substring(0, 2);
				}).attr("x1", function(d, i) {
			return (mC.iWidth / 10) * ((i * 2) + 1);
		}).attr("y1", 0).attr("y2", 0).attr("x2", function(d, i) {
			return (mC.iWidth / 10) * ((i * 2) + 2);
		}).attr("marker-end", function(d) {
			return "url(#" + d + ")";
		});
		legend.selectAll("text").data(relations).enter().append("text").attr(
				"x", function(d, i) {
					return (mC.iWidth / 10) * ((i * 2) + 1.5);
				}).attr("y", 0).attr("dy", "2em").attr("text-anchor", "middle")
				.text(
						function(d) {
							return d.charAt(0).toUpperCase() + d.substring(1)
									+ " Relation";
						});

		// tooltip
		tip = d3.tip().attr('class', 'd3-tip').direction('se').offset([ 5, 5 ])
				.html(function(d) {
					return getTooltipText(d);
				});

		// Invoke tip in context of visualization
		svg.call(tip);

		visGroup = svg.append("g").attr('id', 'visualization').attr(
				"transform",
				"translate(" + padding.left + "," + padding.top + ")");
		// append group for links (lines) and paths

		pathGroup = visGroup.append("g").attr("id", "paths");

		linkGroup = visGroup.append("g").attr("id", "links");

		// new force layout and configuration
		force = d3.layout.force().size([ mC.panelWidth, mC.panelHeight ]);
		// todo
		// array to finde nodes for link target and source

		// set nodes and links as ref to force layout to keep in synch
		nodes = force.nodes();
		// variables for layout entities

		force.charge(function(d) {
			return setCharge(d);
		}).linkDistance(function(d) {
			return setLinkDistance(d);
		}).linkStrength(config.lsDefault).gravity(config.gravity).friction(
				config.friction).on("tick", tick);

		setLayout();
		initializeNode();
		// setOutcomePaths();
		update();
	}

	function setLayout() {
		nodes.splice(0, nodes.length);
		node_lookup.splice(0, node_lookup.length);
		initialNodes = flatten(root);
		links = d3.layout.tree().links(nodes);
		force.links(links);
	}

	function setOutcomePaths() {
		outcomePaths.splice(0, outcomePaths.length);
		outcomeLinks.forEach(function(d) {
			addLink(d);
		});
	}

	function setOutcomePathsFiltered(id) {
		// outcomePaths.splice(0, outcomePaths.length);
		outcomeLinks.forEach(function(d) {
			if (d.source == id) {// || d.target.id == id) {
				addLink(d);
			}
		});
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

	// update the layout according to the changes and start the simulation
	function update() {
		// force.stop();
		links = d3.layout.tree().links(nodes);
		force.links(links);

		// get all layout links
		link = linkGroup.selectAll("line").data(links, function(d) {
			return d.source.id + "-" + d.target.id + "-" + "layoutLink";
		});

		// update and insert new lines
		link.enter().insert("line").attr("class", function(d) {
			return "layoutLink";
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
			return d.relationGroup + " " + d.type;
		}).attr("marker-end", function(d) {
			return "url(#" + d.type + ")";
		});

		path.exit().remove();

		// select groups for nodes
		var node = visGroup.selectAll("g.node").data(nodes, function(d) {
			return d.id;
		});

		// select new groups and updates for nodes
		var nodeEnter = node.enter().append("g").attr("class", "node").call(
				force.drag).on("dblclick", function(d) {
			if (d.type != "out" && d.type != "root") {
				toggleNode(d);
			}
		}).on("click", function(d) {
			if (d.type == "out") {
				highlightNode(d);
			}
		}).on("mouseover", tip.showTransition).on("mouseout", tip.hideDelayed);

		// append circle
		nodeEnter.append("svg:circle").attr("r", function(d) {
			return setCircleRadius(d);
		}).attr("cx", function(d) {
			return d.x;
		}).attr("cy", function(d) {
			return d.y;
		}).style("fill", function(d) {
			return setCircleFill(d)
		});

		nodeEnter.filter(function(d) {
			if (d.type != "out")
				return d;
		}).append("text").attr("x", 0).attr("y", "0.5em").attr("text-anchor",
				"middle").text(function(d) {
			return d.abbrev;
		}).attr("class", "legend");

		// remove nodes
		node.exit().remove();

		// set circle for tick
		circle = node.selectAll("circle");
		circle.transition().attr("r", function(d) {
			return setCircleRadius(d);
		});

		text = node.selectAll("text");

		// calculate layout for a few round than set dps fixed
		// if (start) {
		// force.start();
		// for (var i = 0; i < 200; ++i)
		// force.tick();
		// force.stop();
		// force.nodes().forEach(function(d) {
		// if (d.type == "dp") {
		// d.fixed = true;
		// }
		// });
		// start = false;
		// force.resume();
		// }
		// else {
		// force.start();
		// }
		force.start();
	}

	function tick(e) {
		text.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

		path.attr("d", linkArc);

		// in case bounding box is needed
		circle.attr("cx", function(d) {
			// return d.x = Math.max(10, Math.min(mC.iWidth - 10, d.x));
			return d.x;
		}).attr("cy", function(d) {
			// return d.y = Math.max(10, Math.min(mC.panelHeight - 10, d.y));
			return d.y;
		});

		link.attr("x1", function(d) {
			return d.source.x;
		}).attr("y1", function(d) {
			return d.source.y;
		}).attr("x2", function(d) {
			return d.target.x;
		}).attr("y2", function(d) {
			return d.target.y;
		});
	}

	function linkArc(d) {
		// todo offset
		var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math
				.sqrt(dx * dx + dy * dy);
		return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr
				+ " 0 0,1 " + d.target.x + "," + d.target.y;
	}

	function highlightNode(d) {
		if (typeof d.highlighted === "undefined") {
			d.highlighted = false;
		}
		if (d.highlighted) {
			removePaths(d.id);
			d.highlighted = false;
		} else {
			setOutcomePathsFiltered(d.id);
			d.highlighted = true;

		}
		update();
	}

	function removePaths(id) {
		for (var i = outcomePaths.length - 1; i >= 0; i--) {
			if (outcomePaths[i].source.id == id) {
				outcomePaths.splice(i, 1);
			}
		}
	}

	// Toggle children on click.
	function toggleNode(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
		// todo umpolen der pfade auf parent entsprechend des ausgewählten
		// knotens
		setLayout();
		initialNodes.forEach(function(d) {
			nodes.push(d);
			node_lookup[d.id] = d;
		});
		setOutcomePaths();
		update();
	}

	// Returns a list of all nodes under the root; size is calculated
	function flatten(root) {
		var flattenedNodes = [];// i = 0;
		function recurse(node) {
			node.size = 1;
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

	function initializeNode() {
		root.fixed = true;
		root.x = mC.panelWidth / 2;
		root.y = mC.panelHeight / 2;
		root.px = mC.panelWidth / 2;
		root.py = mC.panelHeight / 2;

		initialNodes.forEach(function(d) {
			if (d.type != "root") {
				var location = setInitialLocation(d);
				d.x = location[0];
				d.y = location[1];
				d.px = location[0];
				d.py = location[1];
			}
			nodes.push(d);
			node_lookup[d.id] = d;
		});
	}

	function setInitialLocation(d) {
		var h = mC.panelHeight / 100;
		var w = mC.panelWidth / 100;
		var angle = Math.random() * Math.PI * 2;
		var dp;
		var randomX = Math.cos(angle);
		var randomY = Math.sin(angle);

		switch (d.cluster) {
		case 1:
			// randomX = -Math.abs(Math.cos(angle));
			// randomX = Math.cos(angle);
			// randomY = Math.sin(angle);
			dp = [ (w * 25), (h * 25) ];
			break;
		case 2:
			// randomX = Math.abs(Math.cos(angle));
			// randomX = Math.cos(angle);
			// randomY = Math.sin(angle);
			dp = [ (w * 75), (h * 25) ];
			break;
		case 3:
			// randomX = Math.abs(Math.cos(angle));
			// randomY = Math.sin(angle);
			dp = [ (w * 75), (h * 75) ];
			break;
		case 4:
			// randomX = -Math.abs(Math.cos(angle));
			// randomX = Math.cos(angle);
			// randomY = Math.sin(angle);
			dp = [ (w * 30), (h * 75) ]
			break;
		default:
			return [ Math.random(), Math.random() ];
			break;
		}

		switch (d.type) {
		case "dp":
			// d.fixed = true;
			return dp;
			break;
		case "dec":
			return [ dp[0] + randomX * (config.ldDp),
					dp[1] + randomY * (config.ldDp) ];
			break;
		case "out":
			return [ dp[0] + randomX * (config.ldDp + config.ldDec) - w,
					dp[1] + randomY * (config.ldDp + config.ldDec) ];
			break;
		}
	}

	// tooltip text
	function getTooltipText(d) {
		var mainText = '<p><strong>Name: </strong>' + d.label + ' (' + d.abbrev
				+ ')</p><p><strong>Description: </strong>' + d.description
				+ '</p>';
		var classification = '<p><strong>Classification: </strong>'
				+ d.classification + '</p';
		return d.type == "out" ? mainText : mainText + classification;
	}

	function setCharge(d) {
		switch (d.type) {
		case "root":
			return config.chRoot;
			break;
		case "dp":
			if (d.cluster == 3) {
				return d._children ? config.chDp + (d.size * config.chDec)
						: config.chDp;
			}
			return d._children ? config.chDp
					+ (d.size * 10 * (config.chDec + config.chOut))
					: config.chDp;
			break;
		case "dec":
			return d._children ? config.chDec + d.size * config.chOut
					: config.chDec;
			break;
		case "out":
			return config.chOut;
			break;
		}
	}

	function setLinkDistance(d) {
		switch (d.source.type) {
		case "root":
			return config.ldRoot;
			break;
		case "dp":
			return d.target.children ? config.ldDp : config.ldDp + config.ldDec
					/ 2;
			break;
		case "dec":
			return config.ldDec;
			break;
		}
	}

	function setCircleRadius(d) {
		switch (d.type) {
		case "root":
			return config.rootWidth;
			break;
		case "dp":
			return d.children ? config.dpWidth : config.dpWidth
					+ config.addedDpWidth;
			break;
		case "dec":
			return d.children ? config.decWidth : config.decWidth
					+ config.addedDecWidth;
			break;
		default:
			return config.outWidth;
			break;
		}
	}

	function setCircleFill(d) {
		return getColor(d.group);
	}

	// set initial data
	d3.json("./data/cloudDSFPlus.json", function(error, json) {
		root = json.cdsfPlus;
		outcomeLinks = json.outcomeLinks;
	});

	var setOutCharge = (function(d) {
		config.chOut = d;
		update();
	});

	var setDecCharge = (function(d) {
		config.chDec = d;
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

	var setGravity = (function(d) {
		config.gravity = d;
		update();
	});

	var getOutCharge = (function(d) {
		return config.chOut;
	});

	var getDecCharge = (function(d) {
		return config.chDec;
	});

	var getDpCharge = (function(d) {
		return config.chDp;
	});

	var getRootCharge = (function(d) {
		return config.chRoot;
	});

	var getGravity = (function(d) {
		return config.gravity;
	});

	// Reveal module pattern, offer functions to the outside
	return {
		getForce : force,
		update : update,
		initialize : initialize,
		setOutCharge : setOutCharge,
		setDecCharge : setDecCharge,
		setDpCharge : setDpCharge,
		setRootCharge : setRootCharge,
		setGravity : setGravity,
		getOutCharge : getOutCharge,
		getDecCharge : getDecCharge,
		getDpCharge : getDpCharge,
		getRootCharge : getRootCharge,
		getGravity : getGravity
	};
})();