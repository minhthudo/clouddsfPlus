var forceGraph = (function() {
	var data = {
		"nodes" : [
				{
					"size" : 30,
					"id" : 101,
					"type" : "decision",
					"parent" : 1,
					"classification" : "Application Migration in General",
					"label" : "Select Application Layer",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 102,
					"type" : "decision",
					"parent" : 1,
					"classification" : "Application Migration in General",
					"label" : "Select Application Tier",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 103,
					"type" : "decision",
					"parent" : 1,
					"classification" : "Application Migration in General",
					"label" : "Select Application Components",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 104,
					"type" : "decision",
					"parent" : 1,
					"classification" : "Cloud Migration specific",
					"label" : "Select Migration Type",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 201,
					"type" : "decision",
					"parent" : 2,
					"classification" : "Cloud Migration specific / Application Migration in General",
					"label" : "Define Scalability Level",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 202,
					"type" : "decision",
					"parent" : 2,
					"classification" : "Cloud Migration specific / Application Migration in General",
					"label" : "Select Scaling Type",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 203,
					"type" : "decision",
					"parent" : 2,
					"classification" : "Cloud Migration specific / Application Migration in General",
					"label" : "Select Elasticity Automation Degree",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 204,
					"type" : "decision",
					"parent" : 2,
					"classification" : "Cloud Migration specific / Application Migration in General",
					"label" : "Select Scaling Trigger",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 301,
					"type" : "decision",
					"parent" : 3,
					"classification" : "Cloud Migration specific",
					"label" : "Select Multi-Tenancy Architecture",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 401,
					"type" : "decision",
					"parent" : 4,
					"classification" : "Cloud Migration specific",
					"label" : "Select Cloud Deployment Model",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 402,
					"type" : "decision",
					"parent" : 4,
					"classification" : "Cloud Migration specific",
					"label" : "Select Cloud Service Model",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 403,
					"type" : "decision",
					"parent" : 4,
					"classification" : "Cloud Migration specific / Application Migration in General",
					"label" : "Define Cloud Hosting",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 404,
					"type" : "decision",
					"parent" : 4,
					"classification" : "Cloud Migration specific / Application Migration in General",
					"label" : "Define Roles of Responsibility",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 405,
					"type" : "decision",
					"parent" : 4,
					"classification" : "Cloud Migration specific / Application Migration in General",
					"label" : "Select Cloud Vendor",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 406,
					"type" : "decision",
					"parent" : 4,
					"classification" : "Cloud Migration specific",
					"label" : "Select Pricing Model",
					"children" : null
				},
				{
					"size" : 30,
					"id" : 407,
					"type" : "decision",
					"parent" : 4,
					"classification" : "Cloud Migration specific / Application Migration in General",
					"label" : "Define Resource Location",
					"children" : null
				} ],
		"links" : [ {
			"source" : 101,
			"target" : 103,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 101,
			"target" : 104,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 101,
			"target" : 301,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 101,
			"target" : 103,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 102,
			"target" : 103,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 103,
			"target" : 101,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 103,
			"target" : 104,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 103,
			"target" : 201,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 103,
			"target" : 301,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 103,
			"target" : 402,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 103,
			"target" : 104,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 103,
			"target" : 402,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 104,
			"target" : 101,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 104,
			"target" : 103,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 104,
			"target" : 201,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 104,
			"target" : 301,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 104,
			"target" : 402,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 104,
			"target" : 103,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 201,
			"target" : 103,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 201,
			"target" : 104,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 201,
			"target" : 202,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 201,
			"target" : 203,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 201,
			"target" : 204,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 201,
			"target" : 301,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 201,
			"target" : 402,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 201,
			"target" : 405,
			"dir" : "auto",
			"label" : "Affecting",
			"type" : "DecRel"
		}, {
			"source" : 201,
			"target" : 402,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 202,
			"target" : 201,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 202,
			"target" : 402,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 202,
			"target" : 405,
			"dir" : "auto",
			"label" : "Affecting",
			"type" : "DecRel"
		}, {
			"source" : 202,
			"target" : 201,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 203,
			"target" : 201,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 203,
			"target" : 204,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 203,
			"target" : 402,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 203,
			"target" : 405,
			"dir" : "auto",
			"label" : "Affecting",
			"type" : "DecRel"
		}, {
			"source" : 203,
			"target" : 202,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 203,
			"target" : 204,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 204,
			"target" : 201,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 204,
			"target" : 203,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 204,
			"target" : 402,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 204,
			"target" : 405,
			"dir" : "auto",
			"label" : "Affecting",
			"type" : "DecRel"
		}, {
			"source" : 204,
			"target" : 203,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 301,
			"target" : 101,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 301,
			"target" : 103,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 301,
			"target" : 104,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 301,
			"target" : 201,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 301,
			"target" : 402,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 301,
			"target" : 405,
			"dir" : "auto",
			"label" : "Affecting",
			"type" : "DecRel"
		}, {
			"source" : 301,
			"target" : 402,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 401,
			"target" : 403,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 401,
			"target" : 404,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 401,
			"target" : 405,
			"dir" : "auto",
			"label" : "Affecting",
			"type" : "DecRel"
		}, {
			"source" : 401,
			"target" : 403,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 401,
			"target" : 405,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 402,
			"target" : 103,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 402,
			"target" : 104,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 402,
			"target" : 201,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 402,
			"target" : 202,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 402,
			"target" : 203,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 402,
			"target" : 204,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 402,
			"target" : 301,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 402,
			"target" : 405,
			"dir" : "auto",
			"label" : "Affecting",
			"type" : "DecRel"
		}, {
			"source" : 403,
			"target" : 401,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 403,
			"target" : 404,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 403,
			"target" : 405,
			"dir" : "auto",
			"label" : "Affecting",
			"type" : "DecRel"
		}, {
			"source" : 403,
			"target" : 407,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 403,
			"target" : 407,
			"dir" : "auto",
			"label" : "Requiring",
			"type" : "DecRel"
		}, {
			"source" : 404,
			"target" : 401,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 404,
			"target" : 403,
			"dir" : "auto",
			"label" : "Influencing",
			"type" : "DecRel"
		}, {
			"source" : 404,
			"target" : 405,
			"dir" : "auto",
			"label" : "Affecting",
			"type" : "DecRel"
		}, {
			"source" : 405,
			"target" : 201,
			"dir" : "auto",
			"label" : "Binding",
			"type" : "DecRel"
		}, {
			"source" : 405,
			"target" : 202,
			"dir" : "auto",
			"label" : "Binding",
			"type" : "DecRel"
		}, {
			"source" : 405,
			"target" : 203,
			"dir" : "auto",
			"label" : "Binding",
			"type" : "DecRel"
		}, {
			"source" : 405,
			"target" : 204,
			"dir" : "auto",
			"label" : "Binding",
			"type" : "DecRel"
		}, {
			"source" : 405,
			"target" : 301,
			"dir" : "auto",
			"label" : "Binding",
			"type" : "DecRel"
		}, {
			"source" : 405,
			"target" : 401,
			"dir" : "auto",
			"label" : "Binding",
			"type" : "DecRel"
		}, {
			"source" : 405,
			"target" : 402,
			"dir" : "auto",
			"label" : "Binding",
			"type" : "DecRel"
		}, {
			"source" : 405,
			"target" : 403,
			"dir" : "auto",
			"label" : "Binding",
			"type" : "DecRel"
		}, {
			"source" : 405,
			"target" : 404,
			"dir" : "auto",
			"label" : "Binding",
			"type" : "DecRel"
		}, {
			"source" : 405,
			"target" : 406,
			"dir" : "auto",
			"label" : "Binding",
			"type" : "DecRel"
		}, {
			"source" : 405,
			"target" : 407,
			"dir" : "auto",
			"label" : "Binding",
			"type" : "DecRel"
		}, {
			"source" : 406,
			"target" : 405,
			"dir" : "auto",
			"label" : "Affecting",
			"type" : "DecRel"
		}, {
			"source" : 407,
			"target" : 405,
			"dir" : "auto",
			"label" : "Affecting",
			"type" : "DecRel"
		} ],
		"cluster" : [ {
			"id" : 1,
			"type" : "decisionPoint",
			"radius" : 40,
			"cluster" : 1,
			"label" : "Distribute Application"
		}, {
			"id" : 2,
			"type" : "decisionPoint",
			"radius" : 40,
			"cluster" : 2,
			"label" : "Define Elasticity Strategy"

		}, {
			"id" : 3,
			"cluster" : 3,
			"type" : "decisionPoint",
			"radius" : 40,
			"label" : "Define Multi-Tenancy Requirements"

		}, {

			"id" : 4,
			"type" : "decisionPoint",
			"radius" : 40,
			"cluster" : 4,
			"label" : "Select Service Provider / Offering"
		} ]
	};

	var padding = {
		top : 5,
		right : 5,
		bottom : 5,
		left : 5
	};

	var mC = marginConvention(padding, 900);

	d3.select("#svgContainer").remove();

	var svg = d3.select("#visContent").append("svg").attr("width", mC.oWidth)
			.attr("height", mC.oHeight).attr("id", "svgContainer").append("g")
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

	var pathGroup = svg.append("g").attr("id", "paths");

	var hash_lookup = [];

	var force = d3.layout.force().size([ mC.panelWidth, mC.panelHeight ]);

	force.linkDistance(function(d) {
		if (d.source.cluster == d.target.cluster)
			return 80;
		if (d.source.id == d.target.cluster)
			return padding;
		return 500;
	}).charge(function(d) {
		return d.charge
	}).linkStrength(function(d) {
		if (d.target.cluster == d.source.cluster)
			return 0.9;
		if (d.source.id == d.target.cluster)
			return 1;
		return 0.6;
	}).gravity(0).friction(0.05).on("tick", tick);

	// var group;
	var nodes = force.nodes();
	var links = force.links();
	var circle, text, path;
	var n, m, clusters, color;
	var padding = 80, clusterPadding = 100, maxRadius = 12;
	var data;

	function initialize(linkTypes) {
		// d3.json("./js/json/decisionRelations.json", function(error, json) {
		// data = json;
		n = data.nodes.length + data.cluster.length; // total number of
		// circles
		m = data.cluster.length; // number of distinct clusters

		// color = d3.scale.category10().domain(d3.range(m));
		clusters = new Array(m);

		setClusters();
		data.nodes.forEach(function(d) {
			addNode(d);
		});
		var relations = linkTypes || [ "" ];
		setLinks(relations);
		// update();
		// });

	}

	function setClusters() {
		data.cluster.map(function(node) {
			var i = node.id, r = 4, d = {
				cluster : i,
				radius : r,
				id : node.id,
				label : node.label,
				charge : -500,
				type : node.type,
				x : 0,
				y : 0,
				cx : 0,
				cy : 0,
				fixed : true
			};
			clusters[i] = d;
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
			"source" : hash_lookup[link.source],
			"target" : hash_lookup[link.target],
			"dir" : link.dir,
			"label" : link.label,
			"type" : link.type
		});
	}

	function setLinks(relationType) {
		links.splice(0, links.length);
		var specificLinks = data.links.filter(function(d) {
			for (var i = 0; i < relationType.length; i++) {
				if (d.label == relationType[i])
					return d;
			}
		});
		specificLinks.forEach(function(d) {
			addLink(d);
		});
		update();
	}

	// function removeNode(id) {
	// var i = 0;
	// var n = findNode(id);
	// while (i < links.length) {
	// if ((links[i]['source'] == n) || (links[i]['target'] == n)) {
	// links.splice(i, 1);
	// }
	// else i++;
	// }
	// nodes.splice(findNodeIndex(id), 1);
	// update();
	// };
	// var findNodeIndex = function (id) {
	// for (var i = 0; i < nodes.length; i++) {
	// if (nodes[i].id == id) {
	// return i;
	// }
	// }
	// ;
	// };
	function addNode(node) {
		switch (node.type) {
		case "decision":
			var i = Math.floor(node.id / 100), r = 22, d = {
				cluster : i,
				radius : r,
				id : node.id,
				label : node.label,
				type : node.type,
				charge : -50
			};
			hash_lookup[d.id] = d;
			nodes.push(d);
			break;
		case "outcome":
			var i = Math.floor(node.id / 10000), r = 8, d = {
				cluster : i,
				radius : r,
				id : node.id,
				label : node.label,
				type : node.type,
				charge : 1000
			};
			hash_lookup[d.id] = d;
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
			// return color(d.cluster);
			return color(d);
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
			var r = d.radius + maxRadius + Math.max(padding, clusterPadding), nx1 = d.x
					- r, nx2 = d.x + r, ny1 = d.y - r, ny2 = d.y + r;
			quadtree
					.visit(function(quad, x1, y1, x2, y2) {
						if (quad.point && (quad.point !== d)) {
							var x = d.x - quad.point.x, y = d.y - quad.point.y, l = Math
									.sqrt(x * x + y * y), r = d.radius
									+ quad.point.radius
									+ (d.cluster === quad.point.cluster ? padding
											: clusterPadding);
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
	function color(d) {
//		var color = d3.scale.ordinal().domain(
//				[ 0, 1, 11, 111, 2, 22, 222, 3, 33, 333, 4, 44, 444 ]).range(
//				[ "#636363",
//
//				"#3182bd", "#6baed6", "#9ecae1",
//
//				"#e6550d", "#fd8d3c", "#fdae6b",
//
//				"#31a354", "#74c476", "#a1d99b",
//
//				"#756bb1", "#9e9ac8", "#bcbddc" ]);
//		var color = d3.scale.ordinal().domain(
//				[ 0, 1, 11, 111, 2, 22, 222, 3, 33, 333, 4, 44, 444 ]).range(
//				[ "#636363",
//
//				"#393b79", "#5254a3", "#6b6ecf",
//
//				"#637939", "#8ca252", "#b5cf6b",
//
//				"#8c6d31", "#bd9e39", "e7ba52",
//
//				"#7b4173", "#a55194", "#ce6dbd" ]);
		
//		var color = d3.scale.ordinal().domain(
//				[ 0, 1, 11, 111, 2, 22, 222, 3, 33, 333, 4, 44, 444 ]).range(
//				[ "#636363",
//
//				"#393b79", "#5254a3", "#6b6ecf",
//
//				"#637939", "#8ca252", "#b5cf6b",
//
//				"#8c6d31", "#bd9e39", "e7ba52",
//
//				"#843c39", "#ad494a", "#d6616b" ]);
//
		var color = d3.scale.ordinal().domain(
				[ 0, 1, 11, 111, 2, 22, 222, 3, 33, 333, 4, 44, 444 ]).range(
				[ "#636363",

				"#5254a3", "#6b6ecf", "#9c9ede",

				"#8ca252", "#b5cf6b", "#cedb9c",

				"#bd9e39", "#e7ba52", "#e7cb94",

				"#a55194", "#ce6dbd", "#de9ed6" ]);
//		
	


		var i;
		switch (d.type) {
		case "decision":
			i = Math.floor(d.id / 100);
			break;
		case "outcome":
			i = Math.floor(d.id / 10000);
			break;
		default:
			i = d.id;
			break;
		}
		switch (i) {
		case 1:
			if (d.type == "decisionPoint")
				return color(1);
			if (d.type == "decision")
				return color(11);
			if (d.type == "outcome")
				return color(111);
			break;
		case 2:
			if (d.type == "decisionPoint")
				return color(2);
			if (d.type == "decision")
				return color(22);
			if (d.type == "outcome")
				return color(222);
			break;
		case 3:
			if (d.type == "decisionPoint")
				return color(3);
			if (d.type == "decision")
				return color(33);
			if (d.type == "outcome")
				return color(333);
			break;
		case 4:
			if (d.type == "decisionPoint")
				return color(4);
			if (d.type == "decision")
				return color(44);
			if (d.type == "outcome")
				return color(444);
			break;
		default:
			return color(0);
			break;
		}
	}
	// update();

	// Reveal module pattern, offer functions to the outside
	return {
		getForce : force,
		update : update,
		setLinks : setLinks,
		initialize : initialize
	};

});
