var decisionGraph = (function() {
	var padding = {
		top : 5,
		right : 5,
		bottom : 5,
		left : 5
	};

	var config = {
		outcomeWidth : 10,
		decisionWidth : 20,
		nodePadding : 80,
		clusterPadding : 100,
		maxRadius : 12,
		amountClusters : 4,
		ldRoot : 50,
		ldDp : 80,
		ldDec : 30,
		ldOut : 20,
		// lsRoot : 50,
		// lsDp : 80,
		// lsDec : 30,
		// lsOut : 20
		lsDefault : 1,
		gravity : 0,
		friction : 0.05,
		chRoot : -80,
		chDp : -80,
		chDec : -50,
		chOut : 1000
	};

	var mC, root, svg, force, node_lookup;
	var nodes, links, pathGroup, text, circle, path;
	var clusters, initialNodes;

	function initialize(linkTypes) {

		mC = marginConvention(padding, 900);

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
		pathGroup = svg.append("g").attr("id", "paths");

		node_lookup = [];

		force = d3.layout.force().size([ mC.panelWidth, mC.panelHeight ]);

		force.linkDistance(function(d) {
			if (d.source.cluster == d.target.cluster)
				return 80;
			if (d.source.id == d.target.cluster)
				return config.nodePadding;
			return 500;
		}).charge(function(d) {
			return d.charge
		}).linkStrength(function(d) {
			if (d.target.cluster == d.source.cluster)
				return 0.9;
			if (d.source.id == d.target.cluster)
				return 1;
			return 0.6;
		}).gravity(config.gravity).friction(config.friction).on("tick", tick);

		nodes = force.nodes();
		links = force.links();

		// amountClusters = root.cluster.length; // number of distinct clusters

		clusters = new Array(config.amountClusters);

		setClusters();

		initialNodes = flatten(root.cdsfPlus);

		initialNodes.forEach(function(d) {
			addNode(d);
		});

		if (typeof linkTypes === 'undefined') {
			setLinks([ "" ]);
		} else {
			setLinks(relations);
		}
	}

	function setClusters() {
		var clusterNodes = root.cdsfPlus.children.filter(function(d) {
			if (d.type = "dp")
				return d;
		});
		clusterNodes.map(function(node) {
			var r = 4, d = {
				cluster : node.cluster,
				radius : r,
				id : node.id,
				label : node.label,
				charge : -500,
				group : node.group,
				type : node.type,
				x : 0,
				y : 0,
				cx : 0,
				cy : 0,
				fixed : true
			};
			clusters[d.cluster] = d;
			nodes.push(d);
		});
		clusters[1].x = mC.panelWidth / 4;
		clusters[1].y = mC.panelHeight / 5;
		clusters[2].x = mC.panelWidth / 4 * 3;
		clusters[2].y = mC.panelHeight / 5;
		clusters[3].x = mC.panelWidth / 4;
		clusters[3].y = mC.panelHeight / 4 * 3;
		clusters[4].x = mC.panelWidth / 4 * 3;
		clusters[4].y = mC.panelHeight / 4 * 3;
	}

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
			if (node.type =="dec")
				nodes.push(node);
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
				group : node.group
			};
			node_lookup[d.id] = d;
			nodes.push(d);
			break;
		}
	}

	function update() {
		force.stop();

		path = pathGroup.selectAll("path").data(links, function(d) {
			return d.source.id + "-" + d.target.id + "-" + d.label;
		});

		path.enter().append("path").attr("class", function(d) {
			return "link " + d.label.toLowerCase();
		}).attr("marker-end", function(d) {
			return "url(#" + d.label.toLowerCase() + ")";
		});

		path.exit().remove();

		var node = svg.selectAll("g.node").data(nodes, function(d) {
			return d.id;
		});

		var nodeEnter = node.enter().append("g").attr("class", "node");

		nodeEnter.append("circle").attr("r", function(d) {
			return d.radius;
		}).style("fill", function(d) {
			return setCircleFill(d)
		}).call(force.drag);

		nodeEnter.append("text").attr("x", 0).attr("y", "1em").attr("dy",
				function(d) {
					return "" + d.radius + "px";
				}).attr("text-anchor", "middle").text(function(d) {
			return d.label;
		});

		node.exit().remove();

		circle = node.selectAll("circle");

		text = node.selectAll("text");

		force.start();
	}

	function tick(e) {
		circle.each(cluster(10 * e.alpha * e.alpha)).each(collide(.5)).attr(
				"cx", function(d) {
					return d.x;
				}).attr("cy", function(d) {
			return d.y;
		});
		text.attr("transform", transform);
		path.attr("d", linkArc);
	}

	function linkArc(d) {
		var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math
				.sqrt(dx * dx + dy * dy);
		var offsetX = (dx * d.target.radius) / dr;
		var offsetY = (dy * d.target.radius) / dr;
		return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr
				+ " 0 0,1 " + (d.target.x - offsetX) + ","
				+ (d.target.y - offsetY);
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

	function cluster(alpha) {
		return function(d) {
			var cluster = clusters[d.cluster], k = 1;
			// For cluster nodes, apply custom gravity.
			if (cluster === d) {
				cluster = {
					x : d.x,
					y : d.y,
					// x : width / 2,
					// y : height / 2,
					radius : -d.radius
				};
				k = .1 * Math.sqrt(d.radius);
			}
			var x = d.x - cluster.x, y = d.y - cluster.y, l = Math.sqrt(x * x
					+ y * y), r = d.radius + cluster.radius;
			if (l != r) {
				l = (l - r) / l * alpha * k;
				d.x -= x *= l;
				d.y -= y *= l;
				cluster.x += x;
				cluster.y += y;
			}
		};
	}

	function setCircleFill(d) {
		return getColor(d.group);
	}

	d3.json("./data/cloudDSFPlus.json", function(error, json) {
		root = json;
	//	initialize();
	});

	// Reveal module pattern, offer functions to the outside
	return {
		getForce : force,
		update : update,
		initialize : initialize,
		setLinks : setLinks,
	};
})();
