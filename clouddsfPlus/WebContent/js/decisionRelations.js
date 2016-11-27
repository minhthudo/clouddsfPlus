/*
 * Copyright 2015 Balduin Metz
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * Decision Relations Layout depicting the relations between decisions.
 * 
 * @author Metz
 * @module decisionGraph
 */
var decisionGraph = (function() {

  // padding for svg
  var padding = {
    top: 40,
    right: 10,
    bottom: 10,
    left: 10
  };

  // config parameters
  var config = {
    decisionWidth: 30,
    nodePadding: 200,
    strokeWidth: 20,
    lsDefault: 0.5,
    gravity: 0,
    friction: 0.001,
    chDec: -50,
    minHeight: 1200,
    minWidth: 1100,
  };

  var mC, tip;
  var root, svg;
  var force, node, nodes = [], links = [], pathGroup, text, circle, path, visGroup;
  var node_lookup = [], initialNodes, foci, relations = [];

  // Text for legend
  var legendRelations = ["Requiring", "Influencing", "Affecting", "Binding"];
  // Toggle stores whether the highlighting is on and which decision it is
  var toggle = 0;
  // Create an array logging what is connected to what
  var linkedByIndex = {};

  // get d3 data and set root to json
  (function() {
    d3.json("./data/cloudDSFPlus.json", function(error, json) {
      root = json;
      // initialize();
    });
  })();

  /**
   * Sets up svg element and d3 force layout with cluster (focis) and all
   * necessary elements.
   * 
   * @memberOf decisionGraph
   */
  function initialize(resize) {
    // calculate panel
    mC = cdsfPlus.marginConvention(padding, config.minHeight, config.minWidth);
    // adjust node padding to size
    config.nodePadding = mC.panelHeight / 6;
    // set focis for clusters
    foci = [{
      x: (mC.panelWidth / 100 * 25),
      y: (mC.panelHeight / 100 * 30),
    }, {
      x: (mC.panelWidth / 100 * 75),
      y: (mC.panelHeight / 100 * 30),
    }, {
      x: (mC.panelWidth / 2),
      y: (mC.panelHeight / 100 * 10),
    }, {
      x: (mC.panelWidth / 2),
      y: (mC.panelHeight / 100 * 70),
    }];

    // remove old svg
    d3.select("#svgContainer").remove();
    // create new svg
    svg = d3.select("#visContent").on("click", function() {
      clearHighlights();
    }).append("svg").attr("width", mC.oWidth).attr("height", mC.oHeight).attr(
            "id", "svgContainer").append("g").attr("transform",
            "translate(" + mC.marginLeft + "," + mC.marginTop + ")").attr(
            "class", "decisionContainer").on("click", clearHighlights);

    // set defs for markers
    svg.append("defs").selectAll("marker").data(legendRelations).enter()
            .append("marker").attr("id", function(d) {
              return d.toLowerCase();
            }).attr("refX", "9.8").attr("refY", "5").attr("markerWidth", 12)
            .attr("markerHeight", 12).attr("markerUnits", "strokeWidth").attr(
                    "orient", "auto").append("svg:path").attr("d",
                    "M 0,2 L10,5 L0,8").attr("class", function(d) {
              return "arrow " + d.toLowerCase() + "Arrow";
            });

    // create legend above chart
    var legend = svg.append("g");
    legend.selectAll("line").data(legendRelations).enter().append("line").attr(
            "class", function(d) {
              return "link " + d.toLowerCase();
            }).attr("x1", function(d, i) {
      return (mC.iWidth / 8) * ((i * 2) + 0.5);
    }).attr("y1", 5).attr("y2", 5).attr("x2", function(d, i) {
      return (mC.iWidth / 8) * ((i * 2) + 1.5);
    }).attr("marker-end", function(d) {
      return "url(#" + d.toLowerCase() + ")";
    });
    legend.selectAll("text").data(legendRelations).enter().append("text").attr(
            "x", function(d, i) {
              return (mC.iWidth / 8) * ((i * 2) + 1);
            }).attr("y", 5).attr("dy", "2em").attr("text-anchor", "middle")
            .text(function(d) {
              return d + " Relation";
            });

    // tooltip
    tip = d3.tip().attr('class', 'd3-tip').direction('se').offset([5, 5]).html(
            function(d) {
              return getTooltipText(d);
            });

    // Invoke tip in context of visualization
    svg.call(tip);

    // margin convention
    visGroup = svg.append("g").attr('id', 'visualization').attr("transform",
            "translate(" + padding.left + "," + padding.top + ")");

    // Group paths
    pathGroup = visGroup.append("g").attr("id", "paths");
    // new force layout
    force = d3.layout.force().size([mC.panelWidth, mC.panelHeight]);
    // set force parameters
    force.charge(function(d) {
      return d.charge;
    }).gravity(config.gravity).friction(config.friction).on("tick", tick);
    // if layout is only resized no reset of nodes
    if (resize !== true) {
      // preprocess json file
      initialNodes = flatten(root.cdsfPlus);
      nodes.splice(0, nodes.length);
      node_lookup.splice(0, node_lookup.length);
      // add all nodes to force layout
      initialNodes.forEach(function(d) {
        addNode(d, resize);
      });
    }
    // set force nodes
    force.nodes(nodes);
    setLinks();
  }

  /**
   * Update force layout.
   * 
   * @memberOf decisionGraph
   */
  function update() {
    // possible because node never change
    node = visGroup.selectAll("g.node").data(nodes, function(d) {
      return d.id;
    });

    // nodeEnter to append everything to the same group
    var nodeEnter = node.enter().append("g").attr("class", "node").call(
            force.drag()).on('click', function() {
      d3.event.stopPropagation();
      if (d3.event.defaultPrevented) return; // avoid click if dragged
      connectedNodes(d3.select(this).node().__data__);
    })
    // tooltip on mouseover and out and highlight on click
    .on("mouseover", tip.showTransition).on("mouseout", tip.hideDelayed);

    // append circle for decisions
    nodeEnter.append("circle").attr("r", function(d) {
      return d.radius;
    }).style("fill", function(d) {
      return setCircleFill(d);
    }).attr("cx", function(d) {
      return d.cx;
    }).attr("cy", function(d) {
      return d.cy;
    });

    // append abbrev in middle of circle
    nodeEnter.append("text").attr("x", 0).attr("y", "0.5em").attr(
            "text-anchor", "middle").text(function(d) {
      return d.abbrev;
    }).attr("class", "legend");

    // append label (name) below circle
    nodeEnter.append("text").attr("x", 0).attr("y", "1em").attr("dy",
            function(d) {
              return "" + (d.radius + 15) + "px";
            }).attr("text-anchor", "middle").text(function(d) {
      return d.label;
    }).attr("class", "legend");
    // remove old nodes (will never happen)
    node.exit().remove();

    path = pathGroup.selectAll("path").data(links, function(d) {
      return d.source.id + "-" + d.target.id + "-" + d.type;
    });
    // enter new paths with link type as class and respective marker head
    path.enter().append("path").attr("class", function(d) {
      return "link " + d.type;
    }).attr("marker-end", function(d) {
      return "url(#" + d.type + ")";
    });
    // remove old paths
    path.exit().remove();

    circle = node.selectAll("circle");
    text = node.selectAll("text");
    // start layout
    force.start();
  }

  /**
   * Tick method of the force layout.
   * 
   * @memberOf decisionGraph
   * @param e
   *          tick event
   */
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

    // adjust text to circle
    text.attr("transform", transform);
    // adjust paths to circle
    path.attr("d", linkArc);
  }

  /**
   * Calculate exact distance between nodes as length.
   * 
   * @memberOf decisionGraph
   * @param link
   *          link between two decisions
   */
  function calculateDistance(link) {
    var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, distance = Math
            .sqrt(dx * dx + dy * dy);
    return distance;
  }

  /**
   * Calculate link between nodes with target offset.
   * 
   * @memberOf decisionGraph
   * @param d
   *          link between two decisions
   */
  function linkArc(d) {
    var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math
            .sqrt(dx * dx + dy * dy);
    var offsetX = (dx * d.target.radius) / dr;
    var offsetY = (dy * d.target.radius) / dr;
    var targetX = d.target.x - offsetX;
    var targetY = d.target.y - offsetY;

    var offsetAlpha = 20;
    offsetAlpha = d.type == "requiring" ? 60 : offsetAlpha;
    // requiring relation get different radius
    // calculate quadrant (where is the link coming from)
    var diffX = targetX - d.target.x;
    var diffY = targetY - d.target.y;
    var k, c;
    if (diffX >= 0 && diffY >= 0) {
      k = 0;
      c = 1;
    } else if (diffX >= 0 && diffY <= 0) {
      k = 4;
      c = -1;
    } else if (diffX <= 0 && diffY >= 0) {
      k = 2;
      c = -1;
    } else if (diffX <= 0 && diffY <= 0) {
      k = 2;
      c = 1;
    }
    // calcluate angle in radian
    var alphaX = Math.acos(Math.abs((targetX - d.target.x))
            / config.decisionWidth);
    // convert to degree and add degree shift
    var degreeAlphaX = ((c * (alphaX * 180 / Math.PI)) + k * 90) + offsetAlpha;
    // convert to radian
    alphaX = degreeAlphaX / 180 * Math.PI;
    // calculate new target x value with calculated angle
    targetX = (config.decisionWidth * Math.cos(alphaX)) + d.target.x;

    // similar as above for y value
    var alphaY = Math.asin(Math.abs((targetY - d.target.y))
            / config.decisionWidth);
    var degreeAlphaY = ((c * (alphaY * 180 / Math.PI)) + k * 90) + offsetAlpha;
    alphaY = degreeAlphaY / 180 * Math.PI;
    targetY = (config.decisionWidth * Math.sin(alphaY)) + d.target.y;

    if (d.type != "requiring") {
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr
              + " 0 0,1 " + targetX + "," + targetY;
    } else {
      // return arc with stronger ellipsis
      return "M" + (d.source.x) + "," + (d.source.y) + "A" + (dr * 0.6) + ","
              + (dr * 0.7) + " 0 0,1 " + targetX + "," + targetY;
    }
  }

  /**
   * Generic transformation method to shift elements.
   * 
   * @memberOf decisionGraph
   * @param d
   *          object to transform
   */
  function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }

  /**
   * Collision detection between nodes to avoid overlapping.
   * 
   * @param alpha
   *          alpha value of force layout tick event
   */
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function(d) {
      var r = d.radius + config.decisionWidth + config.nodePadding, nx1 = d.x
              - r, nx2 = d.x + r, ny1 = d.y - r, ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x, y = d.y - quad.point.y, l = Math.sqrt(x
                  * x + y * y), r = d.radius + quad.point.radius
                  + config.nodePadding;
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

  /**
   * Adds link to force layout
   * 
   * @memberOf decisionGraph
   * @param link
   *          link defined in json file
   */
  function addLink(link) {
    // connect link with decisions
    links.push({
      "source": node_lookup[link.source],
      "target": node_lookup[link.target],
      "type": link.type,
      "relationGroup": link.relationGroup
    });
  }

  /**
   * Traverse json cloudDSF object to get all decision elements.
   * 
   * @memberOf decisionGraph
   * @param root
   *          json object of the cloudDSF
   */
  function flatten(root) {
    var nodes = [];
    function recurse(node) {
      if (node.children) node.children.forEach(recurse);
      if (node.type == "dec") {
        nodes.push(node);
      }
    }
    recurse(root);
    return nodes;
  }

  /**
   * Get all links for the selected node and update layout.
   * 
   * @memberOf decisionGraph
   */
  function setLinks() {
    // reset connected links
    links.forEach(function(d) {
      linkedByIndex[d.source.id + "," + d.target.id] = 0;
    });
    links.splice(0, links.length);
    // only get links that are selected
    var specificLinks = root.links.filter(function(d) {
      for (var i = 0; i < relations.length; i++) {
        if (d.type == relations[i]) return d;
      }
    });
    // add links to force layout
    specificLinks.forEach(function(d) {
      addLink(d);
    });
    // set linked decisions
    links.forEach(function(d) {
      linkedByIndex[d.source.id + "," + d.target.id] = 1;
    });
    // update layout
    update();
    if (toggle !== 0) {
      var highlightedDecision = node_lookup[toggle];
      toggle = 0;
      connectedNodes(highlightedDecision);
    }
  }

  /**
   * Create node based on json data and initialize them next to their cluster.
   * 
   * @memberOf decisionGraph
   * @param node
   *          decision object from json file
   */
  function addNode(node) {
    switch (node.type) {
    case "dec":
      var d = new decisionNode(node);
      d.setInitialPosition();
      // add node to lookup and to force layout
      node_lookup[d.id] = d;
      nodes.push(d);
      // set internal connection for highlighting
      linkedByIndex[d.id + "," + d.id] = 1;
      break;
    }
  }

  /**
   * Set circle color
   * 
   * @param d
   *          decision node to be colored
   */
  function setCircleFill(d) {
    return cdsfPlus.getColor(d.group);
  }

  /**
   * Set stroke fill of decision nodes
   * 
   * @param d
   *          decision node to be colored
   */
  function setStrokeFill(d) {
    return cdsfPlus.getColor("dp" + d.cluster);
  }

  /**
   * Resizing of layout.
   * 
   * @memberOf decisionGraph
   */
  function resizeLayout() {
    initialize(true);
  }

  /**
   * Check if pair of decisions are connnected
   * 
   * @param a
   *          decision A
   * @param b
   *          decision B
   */
  function neighboring(a, b) {
    return linkedByIndex[a.id + "," + b.id];
  }

  /**
   * Fade-out of all non connected nodes and links.
   * 
   * @memberOf decisionGraph
   * @param d
   *          clicked node
   */
  function connectedNodes(d) {
    if (d3.event !== null) {
      d3.event.stopPropagation();
    }
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
      toggle = d.id;
    } else {
      clearHighlights();
    }
  }

  /**
   * Generate tooltip text with distinction between out and others.
   * 
   * @memberOf decisionGraph
   * @param d
   *          node with mouse over
   */
  function getTooltipText(d) {
    var mainText = '<p><strong>Name: </strong>' + d.label + ' (' + d.abbrev
            + ')</p><p><strong>Description: </strong>' + d.description + '</p>';
    var classification = '<p><strong>Classification: </strong>'
            + d.classification + '</p';
    return d.type == "out" ? mainText : mainText + classification;
  }

  /**
   * Clear opacity to normal level (fade-in).
   * 
   * @memberOf decisionGraph
   */
  function clearHighlights() {
    toggle = 0;
    node.transition().duration(300).style("opacity", null);
    path.transition().duration(300).style("opacity", null);
  }

  /**
   * Remove one relation type and update layout.
   * 
   * @memberOf decisionGraph
   * @param type
   *          relationship type to be removed
   */
  var removeRelationType = function(type) {
    for (var int = 0; int < relations.length; int++) {
      if (relations[int] == type) {
        relations.splice(int, 1);
        break;
      }
    }
    setLinks();
  };

  /**
   * Remove all relationhip types and update layout.
   * 
   * @memberOf decisionGraph
   */
  var removeAllRelations = function() {
    relations.splice(0, relations.length);
    relations.push([""]);
    setLinks();
  };

  /**
   * Substitute array of relationship types with new array and update layout.
   * E.g. to toggle all relations at once.
   * 
   * @memberOf decisionGraph
   * @param types
   *          array of relationship types
   */
  var setAllRelations = function(types) {
    relations.splice(0, relations.length);
    types.forEach(function(d) {
      relations.push(d);
    });
    setLinks();
  };

  /**
   * Add one relationship type and update layout.
   * 
   * @memberOf decisionGraph
   * @param type
   *          relationship type to be added
   */
  var addRelationType = function(type) {
    relations.push(type);
    setLinks();
  };

  /**
   * Decision node
   * 
   * @type Decision
   * @constructor
   * @param node
   *          object from json file
   */
  function decisionNode(node) {
    this.cluster = node.cluster;
    this.radius = config.decisionWidth;
    this.id = node.id;
    this.label = node.label;
    this.type = node.type;
    this.charge = config.chDec;
    this.group = node.group;
    this.classification = node.classification;
    this.description = node.description;
    this.abbrev = node.abbrev;

    // initialize position around cluster to avoid jitter
    this.setInitialPosition = function() {
      this.x = foci[node.cluster - 1].x + Math.random();
      this.y = foci[node.cluster - 1].y + Math.random();
      this.cx = foci[node.cluster - 1].y + Math.random();
      this.cy = foci[node.cluster - 1].y + Math.random();
    };
  }

  // Reveal module pattern, offer functions to the outside
  return {
    initialize: initialize,
    removeRelationType: removeRelationType,
    addRelationType: addRelationType,
    setAllRelations: setAllRelations,
    removeAllRelations: removeAllRelations,
    resizeLayout: resizeLayout,
  };
})();
