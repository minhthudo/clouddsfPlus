var marginConventionOutcome = (function marginConvention(padding, height) {

	var margin = {
		top : 10,
		right : 10,
		bottom : 10,
		left : 10
	};

	var oWidth = 1140;
	var oHeight = height || 900;

	var iWidth = oWidth - margin.left - margin.right;
	var iHeight = oHeight - margin.top - margin.bottom;
	var panelWidth = iWidth - padding.left - padding.right;
	var panelHeight = iHeight - padding.top - padding.bottom;

	var marginConvention = {
		"panelWidth" : panelWidth,
		"panelHeight" : panelHeight,
		"oWidth" : oWidth,
		"oHeight" : oHeight,
		"iWidth" : iWidth,
		"iHeight" : iHeight,
		"marginTop" : margin.top,
		"marginRight" : margin.right,
		"marginBottom" : margin.bottom,
		"marginLeft" : margin.left
	}
	return marginConvention;
});

var outcomeGraph = (function() {

	// Padding for svg container
	var padding = {
		top : 100,
		right : 50,
		bottom : 30,
		left : 50
	};

	var config = {
		outWidth : 10,
		decWidth : 23,
		dpWidth : 28,
		rootWidth : 30,
		ldRoot : 260,
		ldDp : 120,
		ldDec : 50,
		// ldOut : 50,
		// lsRoot : 50,
		// lsDp : 80,
		// lsDec : 30,
		// lsOut : 20
		// gravity : 0.05,// 0.05,
		// friction : 0.8,
		// lsDefault : 1,
		// chRoot : -20,
		// chDp : -20,
		// chDec : -200, // -300,
		// chOut : -150, // -160,
		// minHeight : 1000
		// gravity : 0.1,// 0.05,
		// friction : 0.8,
		// lsDefault : 1,
		// chRoot : -200,
		// chDp : -20,// -10,
		// chDec : -350,// -40, // -300,
		// chOut : -350, // -50, // -160,
		// minHeight : 1000,
		gravity : 0.1,
		friction : 0.8,
		lsDefault : 1,
		chRoot : -20,
		chDp : -20,
		chDec : -450,
		chOut : -300,
		minHeight : 1000

	// gravity : 0.1,// 0.05,
	// friction : 0.8,
	// lsDefault : 1,
	// chRoot : -20,
	// chDp : -20,
	// chDec : -650,
	// chOut : -350,
	// minHeight : 1000

	};
	var start = true;
	var mC, root, initialNodes;
	var svg, pathGroup, linkGroup, node, link, circle;
	var force, nodes, links;
	// var outcomeLinks, outcomePaths = [];
	var node_lookup = [], root_lookup = [];

	function initialize() {
		// compute panel size and margins after margin convention
		mC = marginConventionOutcome(padding, config.minHeight);
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

		// svg.append("defs").selectAll("marker").data(relations).enter().append(
		// "marker").attr("id", function(d) {
		// return d;
		// }).attr("viewBox", "0 0 10 10").attr("refX", function(d) {
		// if (d == "requiring")
		// return 10;
		// return 10;
		// }).attr("refY", function(d) {
		// if (d == "requiring")
		// return 5;
		// return 5;
		// }).attr("markerWidth", 6).attr("markerHeight", 6).attr("markerUnits",
		// "strokeWidth").attr("orient", "auto").append("svg:path").attr(
		// "d", "M 0,0 l 10,5 l -10,5").attr("class", function(d) {
		// return d + "Arrow";
		// });

		// create legend above chart
		// var legend = svg.append("g");
		// legend.selectAll("line").data(relations).enter().append("line").attr(
		// "class", function(d) {
		// return "link " + d;
		// }).attr("x1", function(d, i) {
		// return (mC.iWidth / 12) * ((i * 2) + 3) + mC.marginLeft;
		// }).attr("y1", mC.marginTop).attr("y2", mC.marginTop).attr("x2",
		// function(d, i) {
		// return (mC.iWidth / 12) * ((i * 2) + 4) + mC.marginLeft;
		// }).attr("marker-end", function(d) {
		// return "url(#" + d.toLowerCase() + ")";
		// });
		// legend.selectAll("text").data(relations).enter().append("text").attr(
		// "x", function(d, i) {
		// return (mC.iWidth / 12) * ((i * 2) + 3.5) + mC.marginLeft;
		// }).attr("y", mC.marginTop).attr("dy", "2em").attr(
		// "text-anchor", "middle").text(function(d) {
		// return d.charAt(0).toUpperCase() + d.substring(1) + " Relation";
		// });

		// tooltip
		tip = d3.tip().attr('class', 'd3-tip').direction('se').offset([ 5, 5 ])
				.html(function(d) {
					return format_description(d);
				});

		// Invoke tip in context of visualization
		svg.call(tip);

		// append group for links (lines) and paths
		// pathGroup = svg.append("g").attr("id", "paths");
		linkGroup = svg.append("g").attr("id", "links");

		// new force layout and configuration
		force = d3.layout.force().size([ mC.panelWidth, mC.panelHeight ]);
		// todo
		// array to finde nodes for link target and source

		// set nodes and links as ref to force layout to keep in synch
		nodes = force.nodes();
		// variables for layout entities

		initializeNode();

		update();
	}

	// update the layout according to the changes and start the simulation
	function update() {
		// force.stop();
		links = d3.layout.tree().links(nodes);
		force.links(links);

		// outcomePaths.splice(0, outcomePaths.length);
		//		
		// outcomeLinks.forEach(function(d) {
		// addLink(d);
		// });

		force.charge(function(d) {
			return setCharge(d);
		}).linkDistance(function(d) {
			return setLinkDistance(d);
		}).linkStrength(config.lsDefault).gravity(config.gravity).friction(
				config.friction).on("tick", tick);

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

		// path = pathGroup.selectAll("path").data(outcomePaths, function(d) {
		// return d.source.id + "-" + d.target.id + "-" + d.type;
		// });
		//
		// path.enter().insert("path").attr("class", function(d) {
		// return d.relationGroup + d.type;
		// });
		//
		// path.exit().remove();

		// select groups for nodes
		var node = svg.selectAll("g.node").data(nodes, function(d) {
			return d.id;
		});

		// select new groups and updates for nodes
		var nodeEnter = node.enter().append("g").attr("class", "node").call(
				force.drag);

		// append circle
		nodeEnter.append("svg:circle").attr("r", function(d) {
			return setCircleRadius(d);
		}).attr("cx", function(d) {
			return d.x;
		}).attr("cy", function(d) {
			return d.y;
		}).style("fill", function(d) {
			return setCircleFill(d)
		}).on("click", function(d) {
			if (d.type != "out" && d.type != "root") {
				click(d);
			}
		});
		// todo dblclick on group

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

		// path.attr("d", linkArc);

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

	// tooltip text
	function format_description(d) {
		return '<p><strong>Name: </strong>' + d.label + ' (' + d.abbrev
				+ ')</p><p><strong>Description: </strong>' + d.description
				+ '</p> <p><strong>Classification: </strong>'
				+ d.classification + '</p';
	}

	// Toggle children on click.
	function click(d) {
		console.log("clicked");
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
		// todo löschen der unabhängigen pfade entsprechend des ausgewählten
		// knotens

		nodes.splice(0, nodes.length);
		node_lookup.splice(0, node_lookup.length);
		initialNodes = flatten(root);
		initialNodes.forEach(function(d) {
			nodes.push(d);
			node_lookup[d.id] = d;
		});
		update();
	}

	// Returns a list of all nodes under the root. size is calculated
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
			return d.children ? config.dpWidth : config.dpWidth + 20;
			break;
		case "dec":
			return d.children ? config.decWidth : config.decWidth + 10;
			break;
		default:
			return config.outWidth;
			break;
		}
	}

	function setCircleFill(d) {
		return getColor(d.group);
	}

	function initializeNode() {
		nodes.splice(0, nodes.length);
		node_lookup.splice(0, node_lookup.length);

		initialNodes = flatten(root);
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
		var randomX, randomY, dp;
		// todo randomX and Y cann be calculated here
		switch (d.cluster) {
		case 1:
			// randomX = -Math.abs(Math.cos(angle));
			randomX = Math.cos(angle);
			randomY = Math.sin(angle);
			dp = [ (w * 25) + padding.left, (h * 25) + padding.top ];
			break;
		case 2:
			// randomX = Math.abs(Math.cos(angle));
			randomX = Math.cos(angle);
			randomY = Math.sin(angle);
			dp = [ (w * 75) + padding.left, (h * 25) + padding.top ];
			break;
		case 3:
			randomX = Math.abs(Math.cos(angle));
			randomY = Math.sin(angle);
			dp = [ (w * 65) + padding.left, (h * 65) + padding.top ];
			break;
		case 4:
			// randomX = -Math.abs(Math.cos(angle));
			randomX = Math.cos(angle);
			randomY = Math.sin(angle);
			dp = [ (w * 30) + padding.left, (h * 75) + padding.top ]
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

	d3.json("./data/cloudDSFPlus.json", function(error, json) {
		root = json.cdsfPlus;

		outcomeLinks = json.outcomeLinks;
		// todo vermutlich nicht notwendig wenn richtiges json kommt
		// .filter(function(d) {
		// if (d.target != d.source)
		// return d;
		// });
		// initialize();
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

	// Reveal module pattern, offer functions to the outside
	return {
		getForce : force,
		update : update,
		initialize : initialize,
		setOutCharge : setOutCharge,
		setDecCharge : setDecCharge,
		setDpCharge : setDpCharge,
		setRootCharge : setRootCharge,
		setGravity : setGravity
	};
})();