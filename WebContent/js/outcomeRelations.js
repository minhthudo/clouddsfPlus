var outcomeGraph = (function() {

	// Padding for svg container
	var padding = {
		top : 30,
		right : 30,
		bottom : 40,
		left : 30
	};

	var config = {
		outWidth : 13,
		decWidth : 23,
		dpWidth : 28,
		addedDpWidth : 20,
		addedDecWidth : 10,
		rootWidth : 30,

		ldRoot : 320,
		ldDp : 170,
		ldDec : 90,

		gravity : 0.05,
		friction : 0.92,
		lsDefault : 0.85,
		chRoot : -20,
		chDp : -20,
		chDec : -150,
		chOut : -400,
		minHeight : 1400,
		minWidth : 1600,

		legendRelations : [ "Including", "Excluding", "Affecting", "Binding",
				"Allowing" ],
		relations : [ "in", "ex", "aff", "eb", "a" ],

	};
	var relationTypes = config.relations;
	var start = true, fixed = false;
	var mC, root, initialNodes, initialLinks;
	var svg, visGroup, pathGroup, linkGroup, nodeGroup, link, circle;
	var force, nodes, links;
	var outcomeLinks, outcomePaths = [], node_lookup = [];
	var drag, labels;

	function dragend(d, i) {
		force.alpha(0.04);
	}

	// var zoom = d3.behavior.zoom().scaleExtent([ 1, 8 ]).on("zoom", move);
	//	
	//	
	// function move() {
	// var t = d3.event.translate;
	// var s = d3.event.scale;
	// var h = mC.panelHeight / 3;
	// t[0] = Math.min(mC.panelWidth * (s - 1), Math.max(mC.panelWidth
	// * (1 - s), t[0]));
	// t[1] = Math.min(mC.panelHeight * (s - 1) + h * s, Math.max(
	// mC.panelHeight * (1 - s) - h * s, t[1]));
	// zoom.translate(t);
	// visGroup.attr("transform", "translate(" + t + ")scale(" + s + ")");
	// }
	/**
	 * @memberOf outcomeGraph
	 */
	function initialize() {
		// compute panel size and margins after margin convention
		mC = marginConvention(padding, config.minHeight, config.minWidth);

		// $('body').css("min-width", config.minWidth);

		// config.ldRoot = Math.floor(Math.sqrt((Math.pow(
		// mC.panelWidth / 100 * 20, 2) - padding.left)
		// + (Math.pow(mC.panelHeight / 100 * 25, 2) - padding.top)));
		// config.ldDp = config.ldRoot - config.ldDec - 100;

		// select container and remove it in case it exists already
		d3.select("#svgContainer").remove();
		// new svg with margin and id svgContainer, class for css flexibility
		svg = d3
				.select("#visContent")
				.append("svg")
				.attr("width", mC.oWidth)
				.attr("height", mC.oHeight)
				.attr("id", "svgContainer")
				// .call(zoom)
				.append("g")
				.attr("transform",
						"translate(" + mC.marginLeft + "," + mC.marginTop + ")")
				.attr("class", "outcomeContainer").attr("id", "zoomGroup");

		// defs for path endings
		// todo different markers
		svg.append("defs").selectAll("marker").data(config.relations).enter()
				.append("marker").attr("id", function(d) {
					return d;
				}).attr("viewBox", "0 0 10 10").attr("refX", function(d) {
					// if (d == "requiring")
					// return 10;
					return 10;
				}).attr("refY", function(d) {
					// if (d == "requiring")
					// return 5;
					return 5;
				}).attr("markerWidth", 6).attr("markerHeight", 6).attr(
						"markerUnits", "strokeWidth").attr("orient", "auto")
				.append("svg:path").attr("d", "M 0,0 l 10,5 l -10,5").attr(
						"class", function(d) {
							return "outRel " + d + " outRelArrow";
							// return "outRelArrow";
						});

		// create legend above chart
		var legend = svg.append("g").attr("id", "legend");
		legend.selectAll("line").data(config.relations).enter().append("line")
				.attr("class", function(d) {
					return "outRel " + d;
				}).attr("x1", function(d, i) {
					return (mC.iWidth / 10) * ((i * 2) + 0.5);
				}).attr("y1", 0).attr("y2", 0).attr("x2", function(d, i) {
					return (mC.iWidth / 10) * ((i * 2) + 1.5);
				}).attr("marker-end", function(d) {
					return "url(#" + d + ")";
				});
		// set text in the middle below the links
		legend.selectAll("text").data(config.legendRelations).enter().append(
				"text").attr("x", function(d, i) {
			return (mC.iWidth / 10) * ((i * 2) + 1);
		}).attr("y", 0).attr("dy", "2em").attr("text-anchor", "middle").text(
				function(d) {
					return d + " Relation";
				});

		// tooltip
		tip = d3.tip().attr('class', 'd3-tip').direction('se').offset([ 5, 5 ])
				.html(function(d) {
					return getTooltipText(d);
				});

		// Invoke tip in context of visualization
		svg.call(tip);
		// main svg group to enable padding
		visGroup = svg.append("g").attr('id', 'visualization').attr(
				"transform",
				"translate(" + padding.left + "," + padding.top + ")");
		// append group for links (lines) and paths
		pathGroup = visGroup.append("g").attr("id", "paths");
		linkGroup = visGroup.append("g").attr("id", "links");

		// new force layout and configuration
		force = d3.layout.force().size([ mC.panelWidth, mC.panelHeight ])
				.charge(function(d) {
					return setCharge(d);
				}).linkDistance(function(d) {
					return setLinkDistance(d);
				}).linkStrength(function(d) {
					if (d.type == "dp")
						return 0.7;
					return config.lsDefault;
				}).gravity(config.gravity).friction(config.friction).on("tick",
						tick);

		nodes = force.nodes();

		initialNodes = flatten(root);
		initialLinks = d3.layout.tree().links(initialNodes);
		if (start === true) {
			initializeNode();
		}
		setupForceLayout();
		// update();
	}

	/**
	 * Updates force layout and redraws objects in case they have changed
	 * 
	 * @memberOf outcomeGraph
	 */
	function update() {
		force.stop();

		// get all layout links
		link = linkGroup.selectAll("g.line").data(force.links(), function(d) {
			return d.source.id + "-" + d.target.id + "-" + "layoutLink";
		});

		// update and insert new lines
		var linkEnter = link.enter().append("g").attr("class", "line");

		linkEnter.append("line").attr("class", function(d) {
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

		linkEnter.filter(function(d) {
			if (d.target.type == "out")
				return d;
		}).append("text").text(function(d) {
			return d.target.abbrev;
		}).attr("x", function(d) {
			return d.target.x;
		}).attr("y", function(d) {
			return d.target.y;
		}).attr("class", "small");

		// Exit any old links.
		link.exit().remove();
		// paths for links between outcomes
		path = pathGroup.selectAll("path").data(outcomePaths, function(d) {
			return d.source.id + "-" + d.target.id + "-" + d.type;
		});
		// enter new links
		path.enter().insert("path").attr("class", function(d) {
			return d.relationGroup + " " + d.type;
		}).attr("marker-end", function(d) {
			return "url(#" + d.type + ")";
		});
		// exit old paths
		path.exit().remove();

		// select groups for nodes
		nodeGroup = visGroup.selectAll("g.node").data(force.nodes(),
				function(d) {
					return d.id;
				});
		// set specific drag behaviour
		drag = force.drag()
		// .on("dragstart", dragstart)
		// .on("drag", dragmove)
		.on("dragend", dragend);

		// select new groups and updates for nodes
		var nodeEnter = nodeGroup.enter().append("g").attr("class", "node")
				.call(drag)
				// .call(force.drag)
				.on("dblclick", function(d) {
					if (d.type != "out" && d.type != "root") {
						toggleNode(d);
					}
				}).on("click", function(d) {
					if (d.type == "out") {
						highlightNode(d);
					}
				}).on("mouseover", tip.showTransition).on("mouseout",
						tip.hideDelayed);

		// append circle
		nodeEnter.append("circle").attr("r", function(d) {
			return setCircleRadius(d);
		}).attr("cx", function(d) {
			return d.x;
		}).attr("cy", function(d) {
			return d.y;
		}).style("fill", function(d) {
			return setCircleFill(d);
		}).style("stroke-width", function(d) {
			return setCircleStroke(d);
		});

		nodeEnter.filter(function(d) {
			if (d.type != "out")
				return d;
		}).append("text").attr("x", 0).attr("y", "0.5em").attr("text-anchor",
				"middle").text(function(d) {
			return d.abbrev;
		}).attr("class", function(d) {
			if (d.type != "out")
				return "legend";
			return "legend small";
		});

		// remove nodes
		nodeGroup.exit().remove();

		// set circle for tick
		circle = nodeGroup.selectAll("circle");
		circle.transition().attr("r", function(d) {
			return setCircleRadius(d);
		}).style("stroke-width", function(d) {
			return setCircleStroke(d);
		});
		// select text nodes
		text = nodeGroup.selectAll("text");

		link = linkGroup.selectAll("line");

		labels = linkGroup.selectAll("text");
		// text2.transition().attr("text-anchor",function(d){
		// if(d.target.x >= d.source.x) return "start";
		// return "end";});
		// calculate layout for a few round than set dps fixed
		force.nodes().forEach(function(d) {
			// d.fixed = true;
			if (d.type == "dp") {
				d.fixed = true;
			}

			// if ((d.abbrev == "SCV") || (d.abbrev == "DRL"))
			//
			// d.fixed = true;
			// if (d.type != "out") {
			// // d.fixed = true;
			// }
		});
		if (start === true) {
			force.start();
			for (var i = 0; i < 250; ++i)
				force.tick();
			force.stop();
			force.nodes().forEach(function(d) {
				d.fixed = true;
				if (d.type == "dp") {
					// d.fixed = true;
				}
				// if (d.type != "out") {
				// // d.fixed = true;
				// }
			});
			start = false;

		} else // in case layout has been calcuated just resume it shortly
		{
			// if fixed layout
			// force.tick();

			// start force and than directly resume with lower alpha to avoid
			// unnecessary long movement
			// start is needed because otherwise the distances and strenghts are
			// not calcuated
			force.start();
			force.alpha(0.01);

			// short iteration and new layout but is not inutitive and jumps
			// while (force.alpha() > 0.03) {
			// force.tick();
			// }
			// force.stop();
		}
		// without any differentiation always compute new loose layout
		// force.start();
	}

	/**
	 * Tick function of force layout
	 * 
	 * @memberOf outcomeGraph.d3Layout
	 */
	function tick(e) {

		circle.attr("cx", function(d) {
			// in case bounding box is needed
			return d.x = Math.max(30, Math.min(mC.panelWidth - 30, d.x));
			return d.x;
		}).attr("cy", function(d) {
			// in case bounding box is needed
			return d.y = Math.max(30, Math.min(mC.panelHeight - 30, d.y));
			return d.y;
		});

		// circle.each(collide(0.1, 40)).attr({
		// transform : function(d, i) {
		// return "translate(" + d.x + "," + d.y + ")";
		// }
		// });

		//		
		// circle.attr("cx", function(d) {
		// // in case bounding box is needed
		// // return d.x = Math.max(10, Math.min(mC.iWidth - 10, d.x));
		// return 0;
		// }).attr("cy", function(d) {
		// // in case bounding box is needed
		// // return d.y = Math.max(10, Math.min(mC.panelHeight - 10,
		// // d.y));
		// return 0;
		// });

		// recalculate path
		path.attr("d", linkArc);

		link.attr("x1", function(d) {
			return d.source.x;
		}).attr("y1", function(d) {
			return d.source.y;
		}).attr("x2", function(d) {
			return d.target.x;
		}).attr("y2", function(d) {
			return d.target.y;
		});
		//
		labels.attr("x", function(d) {
			return d.target.x;
		}).attr("y", function(d) {
			return d.target.y;
		}).transition().duration(150).attr("text-anchor", function(d) {
			if (d.target.x >= (d.source.x + 20))
				return "start";
			if (d.target.x <= (d.source.x - 20))
				return "end";
			return "middle";
		}).attr("dy", function(d) {
			if (d.target.x >= (d.source.x + 20)) {
				return "5px";
			}
			if (d.target.x <= (d.source.x - 20)) {
				return "5px";
			}
			if (d.target.y > d.source.y) {
				return "30px";
			}
			return "-22px";
		}).attr("dx", function(d) {
			if (d.target.x >= (d.source.x + 20))
				return "20px";
			if (d.target.x <= (d.source.x - 20))
				return "-20px";
			return 0;
		});

		text.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

	}

	function collide(alpha, radius) {
		// separation between circles

		var quadtree = d3.geom.quadtree(nodes);
		return function(d) {
			var rb = radius + 5, nx1 = d.x - rb, nx2 = d.x + rb, ny1 = d.y - rb, ny2 = d.y
					+ rb;
			quadtree
					.visit(function(quad, x1, y1, x2, y2) {
						if (quad.point && (quad.point !== d)) {
							var x = d.x - quad.point.x, y = d.y - quad.point.y, l = Math
									.sqrt(x * x + y * y);
							if (l < rb) {
								l = (l - rb) / l * alpha;
								d.x -= x *= l;
								d.y -= y *= l;
								quad.point.x += x;
								quad.point.y += y;
							}
						}
						return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
					});
		};
	}

	/**
	 * clears objets and recalculate nodes and links and lookup array calls
	 * function to create outcome paths and starts update of the force
	 * 
	 * @memberOf outcomeGraph
	 */
	function setupForceLayout() {
		nodes.splice(0, nodes.length);
		node_lookup.splice(0, node_lookup.length);
		initialNodes.forEach(function(d) {
			if (fixed === true) {
				d.fixed = true;
			} else {
				d.fixed = false;
			}
			nodes.push(d);
			node_lookup[d.id] = d;
		});
		links = d3.layout.tree().links(nodes);

		// initialNodes.forEach(function(d) {
		// if (d.type = "out") {
		// var newNode = {
		// label : d.label,
		// type : "out",
		// abbrev : d.abbrev,
		// cluster : d.cluster,
		// group : d.group,
		// highlighted : d.highlighted,
		// description : d.description,
		// parent : d.parent,
		// fixed : d.fixed,
		// id : (d.id * -1),
		// }
		// nodes.push(newNode);
		// var s = node_lookup[d.id];
		//
		// links.push({
		// source : s,
		// target : newNode,
		// });
		// }

		// });

		force.links(links);
		setOutcomePaths();

		update();
	}

	/**
	 * Sets all paths between outcomes if they exist
	 * 
	 * @memberOf outcomeGraph
	 */
	function setOutcomePaths() {
		outcomePaths.splice(0, outcomePaths.length);

		outcomeLinks.filter(function(d) {
			for (var i = 0; i < relationTypes.length; i++) {
				if (d.type == relationTypes[i])
					return d;
			}
		}).forEach(
				function(link) {
					var source = node_lookup[link.source];
					var target = node_lookup[link.target];

					if (typeof source !== 'undefined') {
						if (source.highlighted) {
							var parent, topParent, newLink = {};
							newLink.source = source;
							if (typeof target === "undefined") {
								initialLinks.forEach(function(d) {
									if (link.target == d.target.id) {
										parent = node_lookup[d.source.id];
									}
								});

								if (typeof parent === "undefined") {
									topParent = node_lookup[String(link.target)
											.charAt(0)];
									newLink.target = topParent;
								} else {
									newLink.target = parent;
								}
							} else {
								newLink.target = target;
							}
							newLink.relationGroup = link.relationGroup;
							newLink.type = link.type;
							outcomePaths.push(newLink);
						}
					}

				});
		links = d3.layout.tree().links(nodes);
		force.links(links);
	}

	/**
	 * Calculate path source and target coordinates with offset to show arrow
	 * 
	 * @memberOf outcomeGraph.d3Layout
	 */
	function linkArc(d) {
		var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math
				.sqrt(dx * dx + dy * dy), radius = config.outWidth;
		switch (d.target.type) {
		case "dp":
			radius = d.target._children ? config.dpWidth + config.addedDpWidth
					: config.dpWidth;
			break;

		case "out":
			radius = config.outWidth;
			break;
		case "dec":
			radius = d.target._children ? config.decWidth
					+ config.addedDecWidth : config.decWidth;
			break;
		}
		var offsetX = (dx * radius) / dr;
		var offsetY = (dy * radius) / dr;
		var targetX = d.target.x - ((dx * radius) / dr);
		var targetY = d.target.y - ((dy * radius) / dr);

		return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr
				+ " 0 0,1 " + targetX + "," + targetY;
	}

	/**
	 * Toggle paths from selected node to others
	 * 
	 * @memberOf outcomeGraph
	 */
	function highlightNode(d) {
		if (d3.event.defaultPrevented)
			return;
		if (d.highlighted) {
			removePaths(d.id);
			d.highlighted = false;
		} else {
			d.highlighted = true;
			setOutcomePaths();
		}
		update();
	}

	/**
	 * Deletes paths outgoing from selected node
	 * 
	 * @memberOf outcomeGraph
	 */
	function removePaths(id) {
		for (var i = outcomePaths.length - 1; i >= 0; i--) {
			if (outcomePaths[i].source.id == id) {
				outcomePaths.splice(i, 1);
			}
		}
	}

	/**
	 * Toggle children on double click.
	 * 
	 * @memberOf outcomeGraph
	 */
	function toggleNode(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
		initialNodes = flatten(root);
		setupForceLayout();
	}
	/**
	 * 
	 * 
	 * @memberOf outcomeGraph
	 */
	function fixLayout() {
		fixed = true;
		setupForceLayout();
	}
	/**
	 * 
	 * @memberOf outcomeGraph
	 */
	function looseLayout() {
		fixed = false;
		setupForceLayout();
	}

	/**
	 * 
	 * @memberOf outcomeGraph
	 */
	function showAllRelations() {
		nodes.forEach(function(d) {
			if (d.type == "out") {
				d.highlighted = true;
			}
		});
		setOutcomePaths();
		update();
	}

	/**
	 * 
	 * @memberOf outcomeGraph
	 */
	function hideAllRelations() {
		nodes.forEach(function(d) {
			d.highlighted = false;
		});
		setOutcomePaths();
		update();
	}
	/**
	 * 
	 * @memberOf outcomeGraph
	 */
	function setRelationTypes(types) {
		relationTypes = types;
		setOutcomePaths();
		update();
	}

	/**
	 * Returns a list of all nodes under the root; size is calculated
	 * 
	 * @memberOf outcomeGraph
	 */

	function flatten(root) {
		var flattenedNodes = [];
		function recurse(node) {
			// set size attribute to 1
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

	/**
	 * Sets initial positions for nodes to avoid jitter and speed up stable
	 * layout
	 * 
	 * @memberOf outcomeGraph
	 */
	function initializeNode() {
		// set root fixed in the middle
		root.fixed = true;
		root.x = mC.panelWidth / 2;
		root.y = mC.panelHeight / 2;
		root.px = mC.panelWidth / 2;
		root.py = mC.panelHeight / 2;
		// assign locations for nodes
		initialNodes.forEach(function(d) {
			if (d.type != "root") {
				var location = setInitialLocation(d);
				d.x = location[0];
				d.y = location[1];
				d.px = location[0];
				d.py = location[1];
			}
			if (d.type == "dp") {
				d.fixed = true;
			}
			// start with no outcome paths
			d.highlighted = false;
		});
	}

	/**
	 * Calculates semi-random positions for nodes depnding on cluster and type
	 * 
	 * @memberOf outcomeGraph.d3Layout
	 */
	function setInitialLocation(d) {
		var h = mC.panelHeight / 100, w = mC.panelWidth / 100;
		// random angle for circle
		var angle = Math.random() * Math.PI * 2;
		// x and y coordinat of point on circle with random angle
		var dp, randomX = Math.cos(angle), randomY = Math.sin(angle);
		switch (d.cluster) {
		case 1:
			// randomX = -Math.abs(Math.cos(angle));
			dp = [ (w * 31), (h * 30) ];
			break;
		case 2:
			// randomX = Math.abs(Math.cos(angle));
			dp = [ (w * 66), (h * 31) ];
			break;
		case 3:
			// randomX = Math.abs(Math.cos(angle));
			dp = [ (w * 69), (h * 59) ];
			break;
		case 4:
			// randomX = -Math.abs(Math.cos(angle));
			dp = [ (w * 40), (h * 69) ];
			break;
		default:
			return [ Math.random(), Math.random() ];
		}
		switch (d.type) {
		// shift nodes further away depnding on type according to link distance
		case "dp":
			return dp;
		case "dec":
			if (d.abbrev == "SCV")
				return [ dp[0], dp[1] - config.ldDp ];
			if (d.abbrev == "DRL")
				return [ dp[0], dp[1] + config.ldDp ];
			return [ dp[0] + randomX * (config.ldDp),
					dp[1] + randomY * (config.ldDp) ];
		case "out":
			return [ dp[0] + randomX * (config.ldDp + config.ldDec) - w,
					dp[1] + randomY * (config.ldDp + config.ldDec) ];
		}
	}

	/**
	 * generate tooltip text with distinction between out and others
	 * 
	 * @memberOf outcomeGraph.d3Layout
	 */
	function getTooltipText(d) {
		var mainText = '<p><strong>Name: </strong>' + d.label + ' (' + d.abbrev
				+ ')</p><p><strong>Description: </strong>' + d.description
				+ '</p>';
		var classification = '<p><strong>Classification: </strong>'
				+ d.classification + '</p';
		return d.type == "out" ? mainText : mainText + classification;
	}

	/**
	 * Returns charge parameter depending on type and if toggled or not
	 * 
	 * @memberOf outcomeGraph.d3Layout
	 */
	function setCharge(d) {
		switch (d.type) {
		case "root":
			return config.chRoot;
		case "dp":
			if (d.cluster == 3) {
				return d._children ? config.chDp + (d.size * config.chDec)
						: config.chDp;
			}
			return d._children ? config.chDp
					+ (d.size * 10 * (config.chDec + config.chOut))
					: config.chDp;
		case "dec":
			return d._children ? config.chDec + d.size * config.chOut
					: config.chDec;
		case "out":
			return config.chOut;
		}
	}

	/**
	 * Returns link distance depending on connected nodes and if toggled or not
	 * change of distance
	 * 
	 * @memberOf outcomeGraph.d3Layout
	 */
	function setLinkDistance(d) {
		switch (d.source.type) {
		case "root":
			return config.ldRoot;
		case "dp":
			// if (d.target.children) {
			//
			// if (d.source.cluster == 4 && d.target.children.length < 3
			// && d.target.children.length > 1) {
			// // return d.target.children ? config.ldDp : config.ldDp +
			// // config.ldDec
			// // / 2;
			// return config.ldDp * 1.6;
			// }
			// }
			return d.target.children ? config.ldDp : config.ldDp + config.ldDec
					/ 2;
		case "dec":
			return config.ldDec;
		}
	}

	/**
	 * Returns circle radius depending on node type and if toggled or not
	 * 
	 * @memberOf outcomeGraph.d3Layout
	 */
	function setCircleRadius(d) {
		switch (d.type) {
		case "root":
			return config.rootWidth;
		case "dp":
			return d.children ? config.dpWidth : config.dpWidth
					+ config.addedDpWidth;
		case "dec":
			return d.children ? config.decWidth : config.decWidth
					+ config.addedDecWidth;
		case "out":
			return d.highlighted ? config.outWidth - 1 : config.outWidth;
		}
	}

	/**
	 * Returns color for circle from global color scheme
	 * 
	 * @memberOf outcomeGraph.d3Layout
	 */
	function setCircleFill(d) {
		return getColor(d.group);
	}

	function setCircleStroke(d) {
		if (d.type == "out" && d.highlighted === true) {
			return "3px";
		}
		return "0px";
	}
	// set initial data on instantiation (in case of initialization is used
	// shift to initialize() methode and set content in callback
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
		getGravity : getGravity,
		fixLayout : fixLayout,
		looseLayout : looseLayout,
		showAllRelations : showAllRelations,
		hideAllRelations : hideAllRelations,
		setRelationTypes : setRelationTypes,
	};
})();