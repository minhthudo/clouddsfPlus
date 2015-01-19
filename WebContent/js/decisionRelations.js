var decisionGraph = (function() {

	// padding for svg
	var padding = {
		top : 50,
		right : 10,
		bottom : 10,
		left : 10
	};

	// config parameters
	var config = {
		decisionWidth : 30,
		nodePadding : 200,
		strokeWidth : 20,
		// clusterPadding : 120,
		// maxRadius : 30, //collide function with clusters
		// amountClusters : 4,
		lsDefault : 0.5,
		gravity : 0,
		friction : 0.001,
		chDec : -50,
		minHeight : 1200,
		minWidth : 1150,
	};

	var mC, root, svg, tip;
	var force, node, nodes, links = [], pathGroup, text, circle, path, visGroup;
	var node_lookup, initialNodes, foci;
	// var clusters;
	var relations = [ "requiring", "influencing", "affecting", "binding" ];
	// Toggle stores whether the highlighting is on
	var toggle = 0;
	// Create an array logging what is connected to what
	var linkedByIndex = {};

	function initialize(linkTypes) {
		// calculate panel
		mC = marginConvention(padding, config.minHeight, config.minWidth);
		// adjust node padding to size
		config.nodePadding = mC.panelHeight / 6;
		// set focis for clusters
		console.log(mC.panelWidth);
		foci = [ {
			x : (mC.panelWidth / 100 * 25),// + mC.marginLeft + padding.left,
			y : (mC.panelHeight / 100 * 30),// + mC.marginTop + padding.top
		}, {
			x : (mC.panelWidth / 100 * 75),// + mC.marginLeft + padding.left,
			y : (mC.panelHeight / 100 * 30),// + mC.marginTop + padding.top
		}, {
			x : (mC.panelWidth / 2),// + mC.marginLeft + padding.left,
			y : (mC.panelHeight / 100 * 10),// + mC.marginTop + padding.top
		}, {
			x : (mC.panelWidth / 2),// + mC.marginLeft + padding.left,
			y : (mC.panelHeight / 100 * 70),// + mC.marginTop + padding.top
		} ];

		// remove old svg
		d3.select("#svgContainer").remove();
		// create new svg
		svg = d3
				.select("#visContent")
				.append("svg")
				.attr("width", mC.oWidth)
				.attr("height", mC.oHeight)
				.attr("id", "svgContainer")
				.on("click", clearHighlights)
				.append("g")
				.attr("transform",
						"translate(" + mC.marginLeft + "," + mC.marginTop + ")")
				.attr("class", "decisionContainer");

		svg.append("defs").selectAll("marker").data(relations).enter().append(
				"marker").attr("id", function(d) {
			return d;
		}).attr("viewBox", "0 0 10 10").attr("refX", function(d) {
			if (d == "requiring")
				return 10;
			return 10;
		}).attr("refY", function(d) {
			if (d == "requiring")
				return 5;
			return 5;
		}).attr("markerWidth", 6).attr("markerHeight", 6).attr("markerUnits",
				"strokeWidth").attr("orient", "auto").append("svg:path").attr(
				"d", "M 0,0 l 10,5 l -10,5").attr("class", function(d) {
			return d + "Arrow";
		});

		// .attr("viewBox", "0 -8 16 16").attr("refX", 16).attr("refY",
		// -1.5).attr("markerWidth", 6).attr("markerHeight", 6)
		// .attr("orient", "auto").append("svg:path").attr("d",
		// "M0,-8L16,0L0,8 z");

		// .attr("viewBox", "0 -5 10 10")
		// .attr("refX", 15)
		// .attr("refY", -1.5)
		// .attr("markerWidth", 6)
		// .attr("markerHeight", 6)
		// .attr("orient", "auto")
		// .append("path")
		// .attr("d", "M0,-5L10,0L0,5");
		//	
		// .enter().append("svg:marker") // This section adds in the
		// arrows
		// .attr("id", String)

		// create legend above chart
		var legend = svg.append("g");
		legend.selectAll("line").data(relations).enter().append("line").attr(
				"class", function(d) {
					return "link " + d;
				}).attr("x1", function(d, i) {
			return (mC.iWidth / 8) * ((i * 2) + 0.5);
		}).attr("y1", 0).attr("y2", 0).attr("x2", function(d, i) {
			return (mC.iWidth / 8) * ((i * 2) + 1.5);
		}).attr("marker-end", function(d) {
			return "url(#" + d.toLowerCase() + ")";
		});
		legend.selectAll("text").data(relations).enter().append("text").attr(
				"x", function(d, i) {
					return (mC.iWidth / 8) * ((i * 2) + 1);
				}).attr("y", 0).attr("dy", "2em").attr("text-anchor", "middle")
				.text(
						function(d) {
							return d.charAt(0).toUpperCase() + d.substring(1)
									+ " Relation";
						});

		// tooltip
		tip = d3.tip().attr('class', 'd3-tip').direction('se').offset([ 5, 5 ])
				.html(function(d) {
					return format_description(d);
				});

		// Invoke tip in context of visualization
		svg.call(tip);

		visGroup = svg.append("g").attr('id', 'visualization').attr(
				"transform",
				"translate(" + padding.left + "," + padding.top + ")");
		// g element for all paths
		pathGroup = visGroup.append("g").attr("id", "paths");
		// helper object to finde nodes
		node_lookup = [];
		// new force layout
		force = d3.layout.force().size([ mC.panelWidth, mC.panelHeight ]);
		// set force parameters
		force
		// .linkDistance(function(d) {
		// return calculateDistance(d)
		// })
		.charge(function(d) {
			return d.charge;
		})
		// .linkStrength(function(d) {
		// // if (d.target.cluster == d.source.cluster)
		// // return config.lsCluster;
		// return config.lsDefault;
		// })
		.gravity(config.gravity).friction(config.friction).on("tick", tick);

		nodes = force.nodes();
		// separated from force to avoid calculations
		// links = force.links();

		// amountClusters = root.cluster.length; // number of distinct clusters
		// clusters = new Array(config.amountClusters);
		// setClusters();

		initialNodes = flatten(root.cdsfPlus);

		initialNodes.forEach(function(d) {
			addNode(d);
		});
		/*
		 * #if change in nodes or textes desired move to update method #
		 */
		node = visGroup.selectAll("g.node").data(nodes, function(d) {
			return d.id;
		});
		// nodeEnter to append everything to same group
		// tooltip on mouseover and out and highlight on click
		var nodeEnter = node.enter().append("g").attr("class", "node").on(
				'click', connectedNodes).call(force.drag).on("mouseover",
				tip.showTransition).on("mouseout", tip.hideDelayed);

		// append circle for decisions
		nodeEnter.append("circle").attr("r", function(d) {
			return d.radius;
		}).style("fill", function(d) {
			return setCircleFill(d);
		})
		// .attr("stroke", function(d){return
		// setStrokeFill(d)}).attr("stroke-width", config.strokeWidth)
		.attr("cx", function(d) {
			return d.cx;
		}).attr("cy", function(d) {
			return d.cy;
		});

		// append abbrev in middle of circle
		nodeEnter.append("text").attr("x", 0).attr("y", "0.5em").attr(
				"text-anchor", "middle").text(function(d) {
			return d.abbrev;
		}).attr("class", "legend");
		// nodeEnter.append("rect").attr("width",30).attr("height",
		// "30").attr("dy", "30px").style("fill", "green");
		// append dec label below circle
		nodeEnter.append("text").attr("x", 0).attr("y", "1em").attr("dy",
				function(d) {
					return "" + (d.radius + 15) + "px";
				}).attr("text-anchor", "middle").text(function(d) {
			return d.label;
		}).attr("class", "legend");

		node.exit().remove();

		setLinks(linkTypes);

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
		links.forEach(function(d) {
			linkedByIndex[d.source.id + "," + d.target.id] = 0;
		});
		// linkedByIndex = {};
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

		links.forEach(function(d) {
			linkedByIndex[d.source.id + "," + d.target.id] = 1;
		});

		update();
	}

	// create node based on json data
	function addNode(node) {
		switch (node.type) {
		case "dec":
			var d = {
				cluster : node.cluster,
				radius : config.decisionWidth,
				id : node.id,
				label : node.label,
				type : node.type,
				charge : config.chDec,
				group : node.group,
				classification : node.classification,
				description : node.description,
				abbrev : node.abbrev,
				// initialize position around cluster to avoid jitter
				x : foci[node.cluster - 1].x + Math.random(),
				y : foci[node.cluster - 1].y + Math.random(),
				cx : foci[node.cluster - 1].y + Math.random(),
				cy : foci[node.cluster - 1].y + Math.random(),
			};
			// add node to lookup
			node_lookup[d.id] = d;
			// add node to force layout
			nodes.push(d);
			// set internal connection for highlighting
			linkedByIndex[d.id + "," + d.id] = 1;
			break;
		}
	}

	function update() {
		force.stop();
		// possible because node never change
		node = visGroup.selectAll("g.node").data(nodes, function(d) {
			return d.id;
		});
		// // nodeEnter to append everything to same group
		// // tooltip on mouseover and out and highlight on click
		// var nodeEnter = node.enter().append("g").attr("class", "node").on(
		// 'click', connectedNodes).call(force.drag).on("mouseover",
		// tip.showTransition).on("mouseout", tip.hideDelayed);
		//
		// // append circle for decisions
		// nodeEnter.append("circle").attr("r", function(d) {
		// return d.radius;
		// }).style("fill", function(d) {
		// return setCircleFill(d)
		// })
		// // .attr("stroke", function(d){return
		// // setStrokeFill(d)}).attr("stroke-width", config.strokeWidth)
		// .attr("cx", function(d) {
		// return d.cx;
		// }).attr("cy", function(d) {
		// return d.cy;
		// });
		//
		// // append abbrev in middle of circle
		// nodeEnter.append("text").attr("x", 0).attr("y", "0.5em").attr(
		// "text-anchor", "middle").text(function(d) {
		// return d.abbrev;
		// }).attr("class", "legend");
		//
		// // append dec label below circle
		// nodeEnter.append("text").attr("x", 0).attr("y", "1em").attr("dy",
		// function(d) {
		// return "" + (d.radius + 15) + "px";
		// }).attr("text-anchor", "middle").text(function(d) {
		// return d.label;
		// });
		//
		// node.exit().remove();

		circle = node.selectAll("circle");

		text = node.selectAll("text");

		path = pathGroup.selectAll("path").data(links, function(d) {
			return d.source.id + "-" + d.target.id + "-" + d.type;
		});
		// enter new paths with link type as class and respective marker head
		path.enter().append("path").attr("class", function(d) {
			return "link " + d.type.toLowerCase();
		}).attr("marker-end", function(d) {
			return "url(#" + d.type.toLowerCase() + ")";
		});
		// remove old paths
		path.exit().remove();

		// force.start();
		// for (var i = 0; i < 50; ++i)
		// force.tick();
		// force.stop();
		// // force.nodes().forEach(function(d) {
		// // d.fixed = true;
		// //
		// // //d.fixed = true;
		// // });
		force.start();
	}

	function tick(e) {
		// Push nodes toward their designated focus.
		var k = 0.4 * e.alpha;
		nodes.forEach(function(o, i) {
			o.y += (foci[o.cluster - 1].y - o.y) * k;
			o.x += (foci[o.cluster - 1].x - o.x) * k;
		});

		// check that circles dont collide
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

		// adjust text to circle
		text.attr("transform", transform);
		// adjust paths to circle
		path.attr("d", linkArc);

	}

	// link gets exact distance between nodes as length
	function calculateDistance(link) {
		var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, distance = Math
				.sqrt(dx * dx + dy * dy);
		// if (link.source.cluster == link.target.cluster)
		// return config.nodePadding + 20;
		// distance = distance <= 0 ? 1 : distance;
		// return distance <= 0 ? 20 : distance;
		return distance;
	}

	function linkArc(d) {
		var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math
				.sqrt(dx * dx + dy * dy);
		var offsetX = (dx * d.target.radius) / dr;
		var offsetY = (dy * d.target.radius) / dr;
		var targetX = d.target.x - offsetX;
		var targetY = d.target.y - offsetY;
		// possibility to adjust start and end to a point at the edge of the
		// circle with a fixed degree depending on the direction
		// It would be necessary to calculate a random angle between 10-80
		// depending on the direction
		// var addX = 0;
		// var addY = 0;
		// if(targetX > d.source.x) {addX = -15; } else {addX = 15;}
		// if(targetY > d.source.y) {addY = -25.9;} else {addY = 25.9;}
		if (d.type != "Requiring") {

			return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr
					+ " 0 0,1 " // + d.target.x
					+ targetX + "," + targetY;
		}
//		var t = 1.8 * Math.PI
//		targetX = d.target.radius * Math.cos(t) + d.target.x;
//		targetY = d.target.radius * Math.sin(t) + d.target.y;
		// + d.target.y;
		// requiring relation get different radius
		return "M" + (d.source.x) + "," + (d.source.y) + "A" + (dr * 0.6) + ","
				+ (dr * 0.7) + " 0 0,1 " + (targetX) + "," + (targetY);
		// return "M" + d.source.x + "," + d.source.y + "L" + (d.target.x -
		// offsetX) + ","
		// + (d.target.y - offsetY);
	}

	function transform(d) {
		return "translate(" + d.x + "," + d.y + ")";
	}

	// function collideCluster(alpha) {
	// var quadtree = d3.geom.quadtree(nodes);
	// return function(d) {
	// var r = d.radius + config.maxRadius
	// + Math.max(config.nodePadding, config.clusterPadding), nx1 = d.x
	// - r, nx2 = d.x + r, ny1 = d.y - r, ny2 = d.y + r;
	// quadtree
	// .visit(function(quad, x1, y1, x2, y2) {
	// if (quad.point && (quad.point !== d)) {
	// var x = d.x - quad.point.x, y = d.y - quad.point.y, l = Math
	// .sqrt(x * x + y * y), r = d.radius
	// + quad.point.radius
	// + (d.cluster === quad.point.cluster ? config.nodePadding
	// : config.clusterPadding);
	//
	// if (l < r) {
	// l = (l - r) / l * alpha;
	// d.x -= x *= l;
	// d.y -= y *= l;
	// quad.point.x += x;
	// quad.point.y += y;
	// }
	// }
	// return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	// });
	// };
	// }

	function collide(alpha) {
		var quadtree = d3.geom.quadtree(nodes);
		return function(d) {
			var r = d.radius + config.decisionWidth + config.nodePadding, nx1 = d.x
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

	// // todo can be made much easier now without distinct clusters
	// function cluster(alpha) {
	// return function(d) {
	// var cluster = clusters[d.cluster], k = 1;
	// // For cluster nodes, apply custom gravity.
	// if (cluster === d) {
	// cluster = {
	// x : d.x,
	// y : d.y,
	// // x : width / 2,
	// // y : height / 2,
	// radius : -d.radius
	// };
	// k = .1 * Math.sqrt(d.radius);
	// }
	// var x = d.x - cluster.x, y = d.y - cluster.y, l = Math.sqrt(x * x
	// + y * y), r = d.radius + cluster.radius;
	// if (l != r) {
	// l = (l - r) / l * alpha * k;
	// d.x -= x *= l;
	// d.y -= y *= l;
	// cluster.x += x;
	// cluster.y += y;
	// }
	// };
	// }

	function setCircleFill(d) {
		return getColor(d.group);
	}

	function setStrokeFill(d) {
		return getColor("dp" + d.cluster);
	}

	// tooltip text
	function format_description(d) {
		return '<p><strong>Name: </strong>' + d.label + ' (' + d.abbrev
				+ ')</p><p><strong>Description: </strong>' + d.description
				+ '</p> <p><strong>Classification: </strong>'
				+ d.classification + '</p';
	}

	// resize decGraph
	function resizeLayout(linkTypes) {
		 initialize(linkTypes);
	}

	// check if pair are neighbours
	function neighboring(a, b) {
		return linkedByIndex[a.id + "," + b.id];
	}

	function connectedNodes() {
		if (d3.event.defaultPrevented)
			return;
		d = d3.select(this).node().__data__;
		if (toggle != d.id || toggle === 0) {
			// Reduce the opacity of all but the neighbouring nodes
			// todo can be changed to including also ingoing links and nodes
			node.transition().duration(300).style("opacity", function(o) {
				return neighboring(d, o) ? null : 0.5;
			});
			// | neighboring(o, d)
			path.transition().duration(300).style("opacity", function(o) {
				return d.id == o.source.id ? null : 0.05;
				// | d.id == o.target.id
			});
			// nodes.forEach(function(n) {
			// node.style("opacity", function(n) {
			// return d.id == n.id ? 1 : 0.1;
			// })
			// })
			// Reduce the op
			toggle = d.id;
			d3.event.stopPropagation();
		} else {
			clearHighlights();
			d3.event.stopPropagation();
		}
	}

	// clear opacity to normal level by css
	function clearHighlights() {
		toggle = 0;
		node.transition().duration(300).style("opacity", null);
		path.transition().duration(300).style("opacity", null);
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
