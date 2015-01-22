/**
 * @type dynamicGraph
 */
var dynamicGraph = (function() {
	modals.showProgress();
	// Padding for svg container
	var padding = {
		top : 50,
		right : 10,
		bottom : 10,
		left : 10
	};
	// configuration
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
		minWidth : 1500,

		legendRelations : [ "Including", "Excluding", "Affecting", "Binding",
				"Allowing" ],

		relations : [ "in", "ex", "aff", "eb", "a" ],
	};

	// margin Convention variable and config
	var mC;
	start = true, fixed = false;
	// todo temp to select relations
	var relationTypes = [ "in", "ex" ];
	// d3 force layout variables
	var force, nodes, links;
	// d3 + svg layout variables for visualization elements
	var svg, visGroup, pathGroup, linkGroup, nodeGroup, link, circle, labels;
	// data nodes and links temp for serving state in case of rollback
	var root, initialNodes, outcomeLinks, outcomePaths = [], tempNodes = [], r
	tempLinks = [];
	// helper variables for O(n) lookup
	var node_lookup = [], link_lookup = [], tempNodes_lookup = [], tempLinks_lookup = [];

	/**
	 * 
	 * @memberOf dynamicGraph
	 */
	function initialize() {
		// compute panel size and margins after margin convention
		mC = marginConvention(padding, config.minHeight, config.minWidth);

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
				.attr("class", "outcomeContainer").attr("id", "zoomGroup");

		// defs for path endings
		svg.append("defs").selectAll("marker").data(config.relations).enter()
				.append("marker").attr("id", function(d) {
					return d;
				}).attr("viewBox", "0 0 10 10").attr("refX", function(d) {
					return 10;
				}).attr("refY", function(d) {
					return 5;
				}).attr("markerWidth", 6).attr("markerHeight", 6).attr(
						"markerUnits", "strokeWidth").attr("orient", "auto")
				.append("svg:path").attr("d", "M 0,0 l 10,5 l -10,5").attr(
						"class", function(d) {
							if (d.conflict === true) {
								return "outRel " + d + " outRelArrow conflict"
							}
							return "outRel " + d + " outRelArrow";
						});

		// create legend above chart
		var legend = svg.append("g").attr("id", "legend");
		legend.selectAll("line").data(config.relations).enter().append("line")
				.attr("class", function(d) {
					return "outRel " + d;
				}).attr("x1", function(d, i) {
					return (mC.iWidth / 15) * ((i * 1.5) + 0.5);
				}).attr("y1", "2.5em").attr("y2", "2.5em").attr("x2", function(d, i) {
					return (mC.iWidth / 15) * ((i * 1.5) + 1.5);
				}).attr("marker-end", function(d) {
					return "url(#" + d + ")";
				});
		// set text in the middle below the links
		legend.selectAll("text").data(config.legendRelations).enter().append(
				"text").attr("x", function(d, i) {
			return (mC.iWidth / 15) * ((i * 1.5) + 1);
		}).attr("y", "2.5em").attr("dy", "2em").attr("text-anchor", "middle").text(
				function(d) {
					return d + " Relation";
				});
		legend.selectAll("circle").data(
				[ "dp1", "dec1", "out1", "oex", "ocon" ]).enter().append(
				"circle").attr("cx", function(d, i) {
			return (mC.iWidth / 15) * ((i * 1.5) + 8.5);
		}).attr("cy", "1.5em").style("fill", function(d) {
			if (d == "oex" || d == "ocon")
				return getColor("out1");
			return getColor(d);
		}).attr("r", function(d) {
			switch (d) {
			case "dp1":
				return config.dpWidth;
			case "dec1":
				return config.decWidth;
			case "out1":
				return config.outWidth - 1;
			default:
				return config.outWidth
			}
		}).attr("class", function(d) {
			switch (d) {
			case "out1":
				return "highlighted";
			case "oex":
				return "deactivated";
			case "ocon":
				return "conflicting";
			}
		});
		legend.selectAll("text .legend").data(
				[ "Decision Point", "Decision", "Highlighted Outcome",
						"Excluded Outcome", "Conflicted Outcome" ]).enter()
				.append("text").attr("x", function(d, i) {
					return (mC.iWidth / 15) * ((i * 1.5) + 8.5);
				}).attr("y", "1.5em").attr("dy", "3em").attr("text-anchor",
						"middle").text(function(d) {
					return d;
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
				}).linkStrength(config.lsDefault).gravity(config.gravity)
				.friction(config.friction).on("tick", tick);

		nodes = force.nodes();
		if (start === true) {
			initializeNode();
		}

		initialNodes.forEach(function(d) {
			nodes.push(d);
			node_lookup[d.id] = d;
		});

		tempLinks.forEach(function(tempLink) {
			var oLink = link_lookup[tempLink.source + "," + tempLink.target];
			oLink.active = tempLink.active;
			oLink.conflict = tempLink.conflict;
		});

		tempNodes.forEach(function(tempNode) {
			var oNode = node_lookup[tempNode.id];
			oNode.selectable = tempNode.selectable;
			oNode.excluded = tempNode.excluded;
			oNode.highlighted = tempNode.highlighted;
			tempLinks.forEach(function(d) {
				if (tempNode.id == d.target) {
					var inLink = tempLinks_lookup[d.source + "," + d.target];
					tempNode.incomingLinks.push(inLink);
				}
				if (tempNode.id == d.source) {
					var outLink = tempLinks_lookup[d.source + "," + d.target];
					tempNode.outgoingLinks.push(outLink);
				}
			});
		});

		links = d3.layout.tree().links(nodes);
		force.links(links);
		setOutcomePaths();
		update();
	}

	/**
	 * 
	 * @memberOf dynamicGraph.d3
	 */
	function update() {
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

		// insert text abbrev for outcomes
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
			// if (d.conflict === true) {
			// return d.relationGroup + " " + d.type + " conflict";
			// }
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

		// select new groups and updates for nodes
		var nodeEnter = nodeGroup.enter().append("g").attr("class", "node")
				.call(force.drag()).on("click", function(d) {
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
		}).attr("class", function(d) {
			return setCircleClass(d);
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
		})

		.attr("class", function(d) {
			return setCircleClass(d);
		});
		// select text nodes
		text = nodeGroup.selectAll("text");

		link = linkGroup.selectAll("line");

		labels = linkGroup.selectAll("text");

		// calculate layout for a few round than set dps fixed
		if (start === true) {
			force.start();
			for (var i = 0; i < 250; ++i)
				force.tick();
			force.stop();
			force.nodes().forEach(function(d) {
				d.fixed = true;
			});
			start = false;
			modals.hideProgress();
		} else // in case layout has been calcuated just resume it shortly
		{
			force.start();
			force.tick();
			force.stop();
		}
	}

	/**
	 * 
	 * @memberOf dynamicGraph.d3
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
		// move label depnding on incoming link direction to adjust label either
		// on the left top right or bottom of outcome circle
		labels.attr("x", function(d) {
			return d.target.x;
		}).attr("y", function(d) {
			return d.target.y;
		}).transition().duration(150).attr("text-anchor", function(d) {
			// set anchor either left, right or middle
			if (d.target.x >= (d.source.x + 20))
				return "start";
			if (d.target.x <= (d.source.x - 20))
				return "end";
			return "middle";
		}).attr(
				"dy",
				function(d) {
					// set y shift to either 5 for left and right
					if ((d.target.x >= (d.source.x + 20))
							|| (d.target.x <= (d.source.x - 20))) {
						return (0.5 * 0.85 / 2) + "em";
					}
					// 30 if below
					if (d.target.y > d.source.y) {
						return "2.5em";
					}
					// if above
					return "-1.5em";
				}).attr("dx", function(d) {
			if (d.target.x >= (d.source.x + 20))
				return config.outWidth + 7 + "px";
			if (d.target.x <= (d.source.x - 20))
				return (config.outWidth + 7) * -1 + "px";
			return 0;
		});
		text.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

	}

	/**
	 * Sets all paths between outcomes if they exist
	 * 
	 * @memberOf dynamicGraph.d3
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
					if (source.highlighted === true) {
						// todo alle auf graphLinks umstellen
						var newGraphLink = new graphLink(source, target,
								link.type, link.relationGroup, link.active,
								link.conflict);
						outcomePaths.push(newGraphLink);
					}
				});
	}

	/**
	 * Calculate path source and target coordinates with offset to show arrow
	 * 
	 * @memberOf dynamicGraph.d3
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
	 * @memberOf dynamicGraph.logic
	 */
	function highlightNode(d) {
		if (d3.event.defaultPrevented)
			return;
		var tempNode = tempNodes_lookup[d.id];
		// if node is already selected
		if (tempNode.highlighted) {
			// untoggle node
			deselectDecisionOutcome(tempNode);
		} else {
			// if node is not selected check if decision is selected
			if (tempNode.excluded === false) {
				if (tempNode.selectable) {
					// todo check if excluded
					selectDecisionOutcome(tempNode);
				}
				// decision is already selected ask and then change
				else {
					modals.changeOutcomeWihtinDecision(tempNode);
				}
			} else if (tempNode.excluded === true
					&& tempNode.selectable === true) {

				modals.forceExcludedOutcome(tempNode, true);

			} else if (tempNode.excluded === true
					&& tempNode.selectable === false) {

				modals.forceExcludedOutcome(tempNode, false);
			}
		}
	}
	/**
	 * @memberOf dynamicGraph.logic
	 */
	function selectDecisionOutcome(tempNode) {
		restrictDecisionOutcomes(tempNode);
		checkConflicts();
	}
	/**
	 * 
	 * @memberOf dynamicGraph.logic
	 */
	function deselectDecisionOutcome(tempNode) {
		resetDecisionOutcomes(tempNode);
		checkConflicts();
	}
	/**
	 * activates node and restricts decision
	 * 
	 * @memberOf dynamicGraph.logic
	 */
	function restrictDecisionOutcomes(tempNode) {
		tempNode.activateNode();
		tempNodes.filter(function(d) {
			if (tempNode.outGroup == d.outGroup && d.id != tempNode.id)
				return d;
		}).forEach(function(d) {
			d.excludeOutcome();
		});
	}
	/**
	 * deactivates node and frees decision
	 * 
	 * @memberOf dynamicGraph.logic
	 */
	function resetDecisionOutcomes(tempNode) {
		tempNode.deactivateNode();
		tempNodes.filter(function(d) {
			if (tempNode.outGroup == d.outGroup && d.id != tempNode.id)
				return d;
		}).forEach(function(d) {
			d.resetOutcome();
		});
	}
	/**
	 * activates node despite exclusion and resets all outcomes that lead to
	 * exclusions restricts decison of selected outcome and resets decisions of
	 * deselected outcomes can also activate excluded node and force selection
	 * 
	 * @memberOf dynamicGraph.logic
	 */
	function forceExcludedSelectableOutcome(tempNode) {
		restrictDecisionOutcomes(tempNode);
		var restrictingNodes = tempNode.getRestrictingNodes();
		restrictingNodes.forEach(function(tempNode) {
			resetDecisionOutcomes(tempNode);
		});
		checkConflicts();
	}
	/**
	 * Updates nodes if they have conflicts through in or excluding relations
	 * 
	 * @memberOf dynamicGraph.logic
	 */
	function checkConflicts() {
		var conflict = false;
		for (var i = 0; i < tempNodes.length; i++) {
			var tempNode = tempNodes[i];
			if (tempNode.checkIncomingLinks() === true) {
				conflict = true;
				break;
			}
		}
		if (conflict) {
			console.log("do nothing because there is a conflict");
			confirmChanges(true);
		} else {
			confirmChanges(true);
		}
	}

	/**
	 * writes changes to d3 or resets changes to prior state
	 * 
	 * @memberOf dynamicGraph.logic
	 */
	function confirmChanges(confirm) {
		if (confirm === true) {
			tempNodes.forEach(function(tempNode) {
				var oNode = node_lookup[tempNode.id];
				oNode.selectable = tempNode.selectable;
				oNode.excluded = tempNode.excluded;
				oNode.highlighted = tempNode.highlighted;
				oNode.conflicting = tempNode.conflicting;
			});
			tempLinks
					.forEach(function(tempLink) {
						var oLink = link_lookup[tempLink.source + ","
								+ tempLink.target];
						oLink.active = tempLink.active;
						oLink.conflict = tempLink.conflict;
					});
			setOutcomePaths();
			update();
		} else {
			tempNodes.forEach(function(tempNode) {
				var oNode = node_lookup[tempNode.id];
				tempNode.selectable = oNode.selectable;
				tempNode.excluded = oNode.excluded;
				tempNode.highlighted = oNode.highlighted;
			});
			tempLinks
					.forEach(function(tempLink) {
						var oLink = link_lookup[tempLink.source + ","
								+ tempLink.target];
						tempLink.active = oLink.active;
						tempLink.conflict = oLink.conflict;
					});
		}
	}

	/**
	 * Sets initial positions for nodes to avoid jitter and speed up stable
	 * layout
	 * 
	 * @memberOf dynamicGraph
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
			if (d.type == "out") {
				var newTempNode = new tempNode("out" + d.parent, d.id, d.type,
						d.label)
				tempNodes.push(newTempNode);
				tempNodes_lookup[newTempNode.id] = newTempNode;
			}
			if (d.type == "dp") {
				d.fixed = true;
			}
		});
	}

	/**
	 * Calculates semi-random positions for nodes depnding on cluster and type
	 * 
	 * @memberOf dynamicGraph.d3
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
	 * @memberOf dynamicGraph.d3
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
	 * @memberOf dynamicGraph.d3
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
	 * @memberOf dynamicGraph.d3
	 */
	function setLinkDistance(d) {
		switch (d.source.type) {
		case "root":
			return config.ldRoot;
		case "dp":
			return d.target.children ? config.ldDp : config.ldDp + config.ldDec
					/ 2;
		case "dec":
			return config.ldDec;
		}
	}

	/**
	 * Returns circle radius depending on node type and if toggled or not
	 * 
	 * @memberOf dynamicGraph.d3
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
	 * @memberOf dynamicGraph.d3
	 */
	function setCircleFill(d) {
		return getColor(d.group);
	}

	/**
	 * Returns color for circle from global color scheme
	 * 
	 * @memberOf dynamicGraph.d3
	 */
	function setCircleClass(d) {
		if (d.type == "out") {
			if (d.conflicting === true) {
				console.log("conflicting");
				return "conflicting";
			}
			if (d.selectable === false || d.excluded === true) {
				return "deactivated";
			}
			if (d.highlighted === true) {
				return "highlighted";
			}
			return "selectable";
		}
		return "";
	}

	/**
	 * @memberOf dynamicGraph
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

	// set initial data on instantiation (in case of initialization is used
	// shift to initialize() methode and set content in callback
	d3.json("./data/cloudDSFPlus.json", function(error, json) {
		root = json.cdsfPlus;

		outcomeLinks = json.outcomeLinks;

		initialNodes = flatten(root);

		outcomeLinks.forEach(function(d) {
			link_lookup[d.source + "," + d.target] = d;
			if (d.type == "ex" || d.type == "in") {
				var newTempLink = new tempLink(d.source, d.target, d.type,
						d.relationGroup);
				tempLinks.push(newTempLink);
				tempLinks_lookup[d.source + "," + d.target] = newTempLink;
			}
		});
		initialize();
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

	var getLookup = (function(d) {
		return node_lookup;
	});

	var resetSelection = (function() {
		tempNodes.forEach(function(d) {
			d.resetEverything();
			// d.checkIncomingLinks();
		});
		confirmChanges(true);
	});

	var setData = (function(json) {
		var newTempNodes = json.tempNodes;
		var newTempLinks = json.tempLinks;
		newTempLinks.forEach(function(d) {
			var tempLink = tempLinks_lookup[d.source + "," + d.target];
			tempLink.active = d.active;
			tempLink.conflict = d.conflict;
		});

		newTempNodes.forEach(function(d) {
			var tempNode = tempNodes_lookup[d.id];
			tempNode.selectable = d.selectable;
			tempNode.excluded = d.excluded;
			tempNode.highlighted = d.highlighted;
			tempNode.conflicting = d.conflicting;
			tempNode.checkIncomingLinks();
		});
		confirmChanges(true);
	});

	var getData = (function(d) {
		var data = {};
		data.tempNodes = tempNodes;
		data.tempLinks = tempLinks;
		var json = JSON.stringify(data, null, 3);
		var blob = new Blob([ json ], {
			type : "application/json"
		});
		var url = URL.createObjectURL(blob);
		return url;
	});

	var removeRelationType = (function(type) {
		for (var int = 0; int < relationTypes.length; int++) {
			if (relationTypes[int] == type) {
				relationTypes.splice(int, 1);
				break;
			}
		}
		setOutcomePaths();
		update();
	});

	var addRelationType = (function(type) {
		relationTypes.push(type);
		setOutcomePaths();
		update();
	});

	function graphLink(source, target, type, relationGroup, active, conflict) {
		this.source = source;
		this.target = target;
		this.relationGroup = relationGroup;
		this.active = active;
		this.conflict = conflict;
		this.type = type;
	}

	function tempLink(source, target, type, relationGroup) {
		this.source = source;
		this.target = target;
		this.type = type;
		this.relationGroup = relationGroup;
		this.active = false;
		this.conflict = false;
		this.changeConflict = function(conflict) {
			this.conflict = conflict;
		}
	}

	function tempNode(outGroup, id, type, label) {
		this.selectable = true;
		this.excluded = false;
		this.highlighted = false;
		this.conflicting = false;
		this.outGroup = outGroup;
		this.id = id;
		this.label = label;
		this.type = type;
		this.excluding = 0;
		this.including = 0;
		this.incomingLinks = [];
		this.outgoingLinks = [];
		this.activateOutgoingLinks = function() {
			this.outgoingLinks.forEach(function(d) {
				d.active = true;
			});
		}
		this.deactivateOutgoingLinks = function() {
			this.outgoingLinks.forEach(function(d) {
				d.active = false;
			});
		}

		this.checkIncomingLinks = function() {
			var ex = 0, inc = 0;
			this.incomingLinks.forEach(function(incomingLink) {
				if (incomingLink.active === true) {
					switch (incomingLink.type) {
					case "ex":
						ex++;
						break;
					case "in":
						inc++;
						break;
					}
				}
			});
			this.excluding = ex;
			this.including = inc;
			// check if there is already a conflict
			if (this.conflicting === true) {
				this.setConflictingLinks(false);
				this.conflicting = false;
			}
			// yes see if there is still one and if yes
			if (this.including > 0 && this.excluding > 0) {
				this.conflicting = true;
				this.setConflictingLinks(true);
				return true;
			}
			if (this.excluding > 0 && this.highlighted === true) {
				this.conflicting = true;
				this.setConflictingLinks(true);
				return true;
			}
			if (this.excluding > 0) {
				this.excluded = true;
				return false;
			}
			if (this.excluding === 0) {
				this.excluded = false;
				return false;
			}
			return false;
		}

		this.setConflictingLinks = function(conflict) {
			this.incomingLinks.forEach(function(d) {
				if ((d.type == "ex" || d.type == "in") && d.active === true) {
					d.changeConflict(conflict);
				}
			});
		}

		this.getRestrictingNodes = function() {
			var restrictingNodes = [];
			this.incomingLinks.forEach(function(d) {
				if (d.type == "ex" && d.active === true) {
					var n = tempNodes_lookup[d.source];
					restrictingNodes.push(n);
				}
			});
			return restrictingNodes;
		}

		this.activateNode = function() {
			this.highlighted = true;
			this.selectable = true;
			this.activateOutgoingLinks();
		}

		this.deactivateNode = function() {
			this.highlighted = false;
			this.deactivateOutgoingLinks();
		}

		this.resetOutcome = function() {
			this.selectable = true;
			this.highlighted = false;
		}

		this.excludeOutcome = function() {
			if (this.highlighted === true) {
				this.highlighted = false;
				this.deactivateOutgoingLinks();
			}
			this.selectable = false;
		}

		this.resetEverything = function() {
			this.selectable = true;
			this.excluded = false;
			this.highlighted = false;
			this.conflicting = false;
			this.deactivateOutgoingLinks();
		}
	}

	// Reveal module pattern, offer functions to the outside
	return {
		// update : update,
		// initialize : initialize,
		// setOutCharge : setOutCharge,
		// setDecCharge : setDecCharge,
		// setDpCharge : setDpCharge,
		// setRootCharge : setRootCharge,
		// setGravity : setGravity,
		// getOutCharge : getOutCharge,
		// getDecCharge : getDecCharge,
		// getDpCharge : getDpCharge,
		// getRootCharge : getRootCharge,
		// getGravity : getGravity,
		selectDecisionOutcome : selectDecisionOutcome,
		getLookup : getLookup,
		getData : getData,
		resetSelection : resetSelection,
		addRelationType : addRelationType,
		removeRelationType : removeRelationType,
		setData : setData,
		forceExcludedSelectableOutcome : forceExcludedSelectableOutcome,
	};
})();