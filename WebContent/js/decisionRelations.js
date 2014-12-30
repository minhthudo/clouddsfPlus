var decisionGraph = (function() {
	var padding = {
		top : 10,
		right : 10,
		bottom : 10,
		left : 10
	};

	var config = {
		decisionWidth : 20,
		nodePadding : 140,
		clusterPadding : 120,
		maxRadius : 12,
		amountClusters : 4,
		// ld34 : 60,
		// ld12 : 33,
		// ld13 : 30,
		// ld14 : 43,
		// lsRoot : 50,
		// lsDp : 80,
		// lsDec : 30,
		// lsOut : 20
		lsDefault : 0.5,
		// lsCluster : 0.5,
		gravity : 0,
		friction : 0.01,
		chDec : -50,
		minHeight : 900,
	};

	var mC, root, svg, force, node_lookup;
	var nodes, links, // = [],
	pathGroup, text, circle, path;
	var // clusters,
	initialNodes, tip;
	var foci;

	function initialize(linkTypes) {

		mC = marginConvention(padding, 800);
		config.nodePadding = mC.panelHeight / 6;
		//cluster padding eventuell berechnen und mitnehmen ansonsten lassen
		foci = [ {
			x : mC.panelWidth / 100 * 28,
			y : mC.panelHeight / 100 * 30
		}, {
			x : mC.panelWidth / 100 * 72,
			y : mC.panelHeight / 100 * 30
		}, {
			x : mC.panelWidth / 2,
			y : mC.panelHeight / 100 * 5
		}, {
			x : mC.panelWidth / 2,
			y : mC.panelHeight / 100 * 70
		} ];

		d3.select("#svgContainer").remove();

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

		svg.append("defs").selectAll("marker").data(
				[ "requiring", "influencing", "affecting", "binding" ]).enter()
				.append("marker").attr("id", function(d) {
					return d;
				})// .attr("viewBox", "0 -5 10 10")
				.attr("refX", 8).attr("refY", 4).attr("markerWidth", 10).attr(
						"markerHeight", 10).attr("orient", "auto").append(
						"polyline").attr("class", function(d) {
					return "arrow " + d;
				}).attr("points", "0 0, 10 5, 0 8");

		// .attr("viewBox", "0 -5 10 10")
		// .attr("refX", 15)
		// .attr("refY", -1.5)
		// .attr("markerWidth", 6)
		// .attr("markerHeight", 6)
		// .attr("orient", "auto")
		// .append("path")
		// .attr("d", "M0,-5L10,0L0,5");
		//	

		/* Initialize tooltip */
		tip = d3.tip().attr('class', 'd3-tip').direction('se').offset([ 5, 5 ])
				.html(function(d) {
					return format_description(d);
				});

		/* Invoke the tip in the context of your visualization */
		svg.call(tip)

		pathGroup = svg.append("g").attr("id", "paths");

		node_lookup = [];

		force = d3.layout.force().size([ mC.panelWidth, mC.panelHeight ]);

		force.linkDistance(function(d) {
			return calculateDistance(d)
		}).charge(function(d) {
			return d.charge
		}).linkStrength(function(d) {
			// if (d.target.cluster == d.source.cluster)
			// return config.lsCluster;
			return config.lsDefault;
		}).gravity(config.gravity).friction(config.friction).on("tick", tick);

		nodes = force.nodes();
		links = force.links();

		// amountClusters = root.cluster.length; // number of distinct clusters

		// clusters = new Array(config.amountClusters);

		// setClusters();

		initialNodes = flatten(root.cdsfPlus);

		initialNodes.forEach(function(d) {
			addNode(d);
		});

		if (typeof linkTypes === 'undefined') {
			setLinks([ "" ]);
		} else {
			setLinks(linkTypes);
		}
	}

	// function setClusters() {
	// var clusterNodes = root.cdsfPlus.children.filter(function(d) {
	// if (d.type = "dp")
	// return d;
	// });
	// clusterNodes.map(function(node) {
	// var r = 4, d = {
	// cluster : node.cluster,
	// radius : r,
	// id : node.id,
	// label : node.label,
	// charge : -500,
	// group : node.group,
	// type : node.type,
	// x : 0,
	// y : 0,
	// // cx : 0,
	// // cy : 0,
	// fixed : true
	// };
	// clusters[d.cluster] = d;
	// // nodes.push(d);
	// });
	// clusters[1].x = mC.panelWidth / 3;
	// clusters[1].y = mC.panelHeight / 3;
	// clusters[2].x = mC.panelWidth / 3 * 2;
	// clusters[2].y = mC.panelHeight / 3;
	// clusters[3].x = mC.panelWidth / 3;
	// clusters[3].y = mC.panelHeight / 3 * 2;
	// clusters[4].x = mC.panelWidth / 3 * 2;
	// clusters[4].y = mC.panelHeight / 3 * 2;
	// }

	function addLink(link) {
		links.push({
			"source" : node_lookup[link.source],
			"target" : node_lookup[link.target],
			"type" : link.type,
			"relationGroup" : link.relationGroup
		});
	}

	function flatten(root) {
		var nodes = [];
		function recurse(node) {
			if (node.children)
				node.children.forEach(recurse);
			if (node.type == "dec") {
				nodes.push(node);
			}
		}
		recurse(root);
		return nodes;
	}

	function setLinks(relationType) {
		links.splice(0, links.length);
		var specificLinks = root.links.filter(function(d) {
			for (var i = 0; i < relationType.length; i++) {
				if (d.type == relationType[i])
					return d;
			}
		});
		specificLinks.forEach(function(d) {
			addLink(d);
		});
		update();
	}

	function addNode(node) {
		switch (node.type) {
		case "dec":
			var r = 22, d = {
				cluster : node.cluster,
				radius : r,
				id : node.id,
				label : node.label,
				type : node.type,
				charge : config.chDec,
				group : node.group,
				classification : node.classification,
				description : node.description,
				abbrev : node.abbrev,
				x : foci[node.cluster - 1].x + Math.random(),
				y : foci[node.cluster - 1].y + Math.random(),
				cx : foci[node.cluster - 1].y + Math.random(),
				cy : foci[node.cluster - 1].y + Math.random(),
			};
			node_lookup[d.id] = d;
			nodes.push(d);
			break;
		}
	}

	function update() {
		force.stop();

		// path = pathGroup.selectAll("path").data(links, function(d) {
		// return d.source.id + "-" + d.target.id + "-" + d.label;
		// });
		//
		// path.enter().append("path").attr("class", function(d) {
		// return "link " + d.type.toLowerCase();
		// }).attr("marker-end", function(d) {
		// return "url(#" + d.type.toLowerCase() + ")";
		// });
		//
		// path.exit().remove();

		var node = svg.selectAll("g.node").data(nodes, function(d) {
			return d.id;
		});

		var nodeEnter = node.enter().append("g").attr("class", "node");

		nodeEnter.append("circle").attr("r", function(d) {
			return d.radius;
		}).style("fill", function(d) {
			return setCircleFill(d)
		}).attr("cx", function(d) {
			return d.cx;
		}).attr("cy", function(d) {
			return d.cy;
		}).call(force.drag).on("mouseover", tip.showTransition).on("mouseout",
				tip.hideDelayed);

		nodeEnter.append("text").attr("x", 0).attr("y", "0.5em").attr(
				"text-anchor", "middle").text(function(d) {
			return d.abbrev;
		}).on("mouseover", tip.showTransition).on("mouseout", tip.hideDelayed);
		;

		nodeEnter.append("text").attr("x", 0).attr("y", "1em").attr("dy",
				function(d) {
					return "" + (d.radius + 15) + "px";
				}).attr("text-anchor", "middle").text(function(d) {
			return d.label;
		});

		node.exit().remove();

		circle = node.selectAll("circle");

		text = node.selectAll("text");

		path = pathGroup.selectAll("path").data(links, function(d) {
			return d.source.id + "-" + d.target.id + "-" + d.type;
		});

		path.enter().append("path").attr("class", function(d) {
			return "link " + d.type.toLowerCase();
		}).attr("marker-end", function(d) {
			return "url(#" + d.type.toLowerCase() + ")";
		});

		path.exit().remove();

		force.start();
	}

	function tick(e) {

		var k = .4 * e.alpha;

		// Push nodes toward their designated focus.
		nodes.forEach(function(o, i) {
			o.y += (foci[o.cluster - 1].y - o.y) * k;
			o.x += (foci[o.cluster - 1].x - o.x) * k;
		});

		circle.each(collide(e.alpha)).attr("cx", function(d) {
			return d.x;
		}).attr("cy", function(d) {
			return d.y;
		});

		// circle.each(cluster(10 * e.alpha * e.alpha)).each(collide(.5)).attr(
		// "cx", function(d) {
		// return d.x;
		// }).attr("cy", function(d) {
		// return d.y;
		// });

		text.attr("transform", transform);
		path.attr("d", linkArc);

	}

	function calculateDistance(link) {
		var x1 = link.source.x, x2 = link.target.x, y1 = link.source.y, y2 = link.target.y;
		var distance = Math.sqrt((Math.pow(Math.abs(x1 - x2), 2) + Math.pow(
				Math.abs(y1 - y2), 2)));
		if (link.source.cluster == link.target.cluster)
			return config.nodePadding + 20;
		// distance = distance <= 0 ? 1 : distance;
		return distance <= 0 ? 20 : distance;
	}

	function linkArc(d) {
		var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math
				.sqrt(dx * dx + dy * dy);
		var offsetX = (dx * d.target.radius) / dr;
		var offsetY = (dy * d.target.radius) / dr;
		if (d.type != "Requiring")
			return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr
					+ " -0 0,1 " + (d.target.x - offsetX) + ","
					+ (d.target.y - offsetY);

		return "M" + d.source.x + "," + d.source.y + "A" + (dr + 50) + ","
				+ (dr) + " -50 0,1 " + (d.target.x - offsetX) + ","
				+ (d.target.y - offsetY);
		// return "M" + d.source.x + "," + d.source.y + "L" + (d.target.x -
		// offsetX) + ","
		// + (d.target.y - offsetY);
	}

	function transform(d) {
		return "translate(" + d.x + "," + d.y + ")";
	}

	function collide(alpha) {
		var quadtree = d3.geom.quadtree(nodes);
		return function(d) {
			var r = d.radius + config.maxRadius
					+ Math.max(config.nodePadding, config.clusterPadding), nx1 = d.x
					- r, nx2 = d.x + r, ny1 = d.y - r, ny2 = d.y + r;
			quadtree
					.visit(function(quad, x1, y1, x2, y2) {
						if (quad.point && (quad.point !== d)) {
							var x = d.x - quad.point.x, y = d.y - quad.point.y, l = Math
									.sqrt(x * x + y * y), r = d.radius
									+ quad.point.radius
									+ (d.cluster === quad.point.cluster ? config.nodePadding
											: config.clusterPadding);

							if (l < r) {
								l = (l - r) / l * alpha;
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

	function collide2(alpha) {
		var quadtree = d3.geom.quadtree(nodes);
		return function(d) {
			var r = d.radius + config.maxRadius + config.nodePadding, nx1 = d.x
					- r, nx2 = d.x + r, ny1 = d.y - r, ny2 = d.y + r;
			quadtree
					.visit(function(quad, x1, y1, x2, y2) {
						if (quad.point && (quad.point !== d)) {
							var x = d.x - quad.point.x, y = d.y - quad.point.y, l = Math
									.sqrt(x * x + y * y), r = d.radius
									+ quad.point.radius + config.nodePadding;
							if (l < r) {
								l = (l - r) / l * alpha;
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

//	// todo can be made much easier now without distinct clusters
//	function cluster(alpha) {
//		return function(d) {
//			var cluster = clusters[d.cluster], k = 1;
//			// For cluster nodes, apply custom gravity.
//			if (cluster === d) {
//				cluster = {
//					x : d.x,
//					y : d.y,
//					// x : width / 2,
//					// y : height / 2,
//					radius : -d.radius
//				};
//				k = .1 * Math.sqrt(d.radius);
//			}
//			var x = d.x - cluster.x, y = d.y - cluster.y, l = Math.sqrt(x * x
//					+ y * y), r = d.radius + cluster.radius;
//			if (l != r) {
//				l = (l - r) / l * alpha * k;
//				d.x -= x *= l;
//				d.y -= y *= l;
//				cluster.x += x;
//				cluster.y += y;
//			}
//		};
//	}

	function setCircleFill(d) {
		return getColor(d.group);
	}

	// tooltip
	function format_description(d) {
		return '<p><strong>Name: </strong>' + d.label + ' (' + d.abbrev
				+ ')</p><p><strong>Description: </strong>' + d.description
				+ '</p> <p><strong>Classification: </strong>'
				+ d.classification + '</p';
	}

	function resizeLayout(linkTypes) {
		initialize(linkTypes);
	}

	d3.json("./data/cloudDSFPlus.json", function(error, json) {
		root = json;
		// initialize();
	});

	// Reveal module pattern, offer functions to the outside
	return {
		update : update,
		initialize : initialize,
		setLinks : setLinks,
		resizeLayout : resizeLayout,
	};
})();
