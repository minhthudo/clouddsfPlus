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
 * KB Navigator to depict relations between outcomes and guide users through the
 * decisions.
 * 
 * @author Metz
 * @module dynamicGraph
 */
var dynamicGraph = (function() {

  // Padding for svg container
  var padding = {
    top: 80,
    right: 10,
    bottom: 10,
    left: 10
  };

  // config parameters
  var config = {
    // node widths
    outWidth: 13,
    decWidth: 23,
    dpWidth: 28,
    addedDpWidth: 20,
    addedDecWidth: 10,
    rootWidth: 30,

    // force parameters
    ldRoot: 320,
    ldDp: 170,
    ldDec: 90,

    gravity: 0.05,
    friction: 0.92,
    lsDefault: 0.85,

    chRoot: -20,
    chDp: -20,
    chDec: -150,
    chOut: -400,

    // layout size
    minHeight: 1400,
    minWidth: 1450,

    legendRelations: ["Including", "Excluding", "Requiring", "Allowing",
        "Affecting", "Binding"],
    relations: ["in", "ex", "requiring", "a", "aff", "eb"],
  };

  // margin Convention variable and config
  var mC;
  // indicates first call of layout
  var start = true;
  // id of last selected node
  var lastNode = true;
  // show requiring relations
  var requiring = false;
  // currently selected node
  var currentNode, tempCurrentNode;
  // initially used relations
  var relationTypes = ["in", "ex"];
  // d3 force layout variables
  var force, nodes, links;
  // d3 + svg layout variables for visualization elements
  var svg, visGroup, pathGroup, linkGroup, nodeGroup, labelGroup, lineGroup, node, link, circle, labels, lines;
  // data nodes and links
  var root, initialNodes, requiringLinks, requiringLines = [], outcomeLinks, outcomePaths = [];
  // temp vars for serving state in case of rollback
  var tempNodes = [], tempLinks = [], tempDpNodes = [], tempDecNodes = [];
  // helper variables for O(n) lookup
  var node_lookup = [], link_lookup = [], tempNodes_lookup = [], tempLinks_lookup = [], tempDpNodes_lookup = [], tempDecNodes_lookup = [];

  /**
   * Set initial data on instantiation with immediate function.
   */
  (function() {
    // show modal to user until layout is calculated
    modals.showProgress();
    d3.json("./data/cloudDSFPlus.json", function(error, json) {
      root = json.cdsfPlus;
      outcomeLinks = json.outcomeLinks;
      // traverse root
      initialNodes = flatten(root);
      // set link lookup and filter ex and in for tempLinks
      outcomeLinks.forEach(function(d) {
        link_lookup[d.source + "," + d.target] = d;
        if (d.type == "ex" || d.type == "in") {
          // construct new link
          var newTempLink = new tempLink(d.source, d.target, d.type,
                  d.relationGroup);
          tempLinks.push(newTempLink);
          tempLinks_lookup[d.source + "," + d.target] = newTempLink;
        }
      });
      // get requiring links from decision relations
      requiringLinks = json.links.filter(function(d) {
        if (d.type == "requiring") { return d; }
      });
      // initialize layout
      initialize();
    });
  })();

  /**
   * Setup of svg and force layout.
   * 
   * @memberOf dynamicGraph
   */
  function initialize() {
    // compute panel size and margins after margin convention
    mC = cdsfPlus.marginConvention(padding, config.minHeight, config.minWidth);

    // select container and remove it in case it exists already
    d3.select("#svgContainer").remove();
    // new svg with margin and id svgContainer, class for css flexibility
    svg = d3.select("#visContent").append("svg").attr("width", mC.oWidth).attr(
            "height", mC.oHeight).attr("id", "svgContainer").append("g").attr(
            "transform",
            "translate(" + mC.marginLeft + "," + mC.marginTop + ")").attr(
            "class", "outcomeContainer").attr("id", "zoomGroup");

    // defs for markers
    svg.append("defs").selectAll("marker").data(config.relations).enter()
            .append("marker").attr("id", function(d) {
              return d;
            }).attr("refX", function(d) {
              if (d == "requiring") return "2.5";
              return "7";
            }).attr("refY", function(d) {
              if (d == "requiring") return "4.5";
              return "4";
            }).attr("markerWidth", function(d) {
              if (d == "requiring") return 5;
              return 10;
            }).attr("markerHeight", function(d) {
              if (d == "requiring") return 9;
              return 10;
            }).attr("markerUnits", "strokeWidth").attr("orient", "auto")
            .append("svg:path").attr("d", function(d) {
              if (d == "requiring") return "M0,2 L2.5,4.5 L0,7";
              return "M 0,2 L7,4 L0,6";
            }).attr(
                    "class",
                    function(d) {
                      if (d.conflict === true) { return "outRelArrow " + d
                              + "Arrow" + " conflict"; }
                      return "outRelArrow " + d + "Arrow";
                    });

    // create legend above chart
    var legend = svg.append("g").attr("id", "legend");
    legend.selectAll("line").data(config.relations).enter().append("line")
            .attr("class", function(d) {
              if (d == "requiring") return "decRel " + d;
              return "outRel " + d;
            }).attr("x1", function(d, i) {
              if (i < 3) { return (mC.iWidth / 15) * ((i * 1.5) + 0.5); }
              return (mC.iWidth / 15) * (((i - 3) * 1.5) + 0.5);
            }).attr("y1", function(d, i) {
              if (i < 3) { return "1em"; }
              return "5.5em";
            }).attr("y2", function(d, i) {
              if (i < 3) { return "1em"; }
              return "5.5em";
            }).attr("x2", function(d, i) {
              if (i < 3) { return (mC.iWidth / 15) * ((i * 1.5) + 1.5); }
              return (mC.iWidth / 15) * (((i - 3) * 1.5) + 1.5);
            }).attr("marker-end", function(d) {
              return "url(#" + d + ")";
            });
    // set text in the middle below the links
    legend.selectAll("text").data(config.legendRelations).enter()
            .append("text").attr("x", function(d, i) {
              if (i < 3) { return (mC.iWidth / 15) * ((i * 1.5) + 1); }
              return (mC.iWidth / 15) * (((i - 3) * 1.5) + 1);
            }).attr("y", function(d, i) {
              if (i < 3) { return "1em"; }
              return "5.5em";
            }).attr("dy", "2em").attr("text-anchor", "middle").text(
                    function(d) {
                      return d + " Relation";
                    });
    // nodes for legend
    legend.selectAll("circle").data(
            ["dp1", "dec1", "dec1Req", "out1", "oex", "ocon"]).enter().append(
            "circle").attr("cx", function(d, i) {
      return (mC.iWidth / 15) * ((i * 1.5) + 5.5);
    }).attr("cy", "3em").style("fill", function(d) {
      if (d == "oex" || d == "ocon") return cdsfPlus.getColor("out1");
      if (d == "dec1Req") return cdsfPlus.getColor("dec1");
      return cdsfPlus.getColor(d);
    }).attr("r", function(d) {
      switch (d) {
      case "dp1":
        return config.dpWidth;
      case "dec1":
        return config.decWidth;
      case "dec1Req":
        return config.decWidth;
      case "out1":
        return config.outWidth - 1;
      default:
        return config.outWidth;
      }
    }).attr("class", function(d) {
      switch (d) {
      case "dec1":
        return "determined";
      case "dec1Req":
        return "required";
      case "out1":
        return "highlighted";
      case "oex":
        return "deactivated";
      case "ocon":
        return "conflicting";
      }
    });
    // text for nodes
    legend.selectAll("text .legend").data(
            ["Decision Point", "Predetermined Decision", "Required Decision",
                "Selected Outcome", "Excluded Outcome", "Conflicted Outcome"])
            .enter().append("text").attr("x", function(d, i) {
              return (mC.iWidth / 15) * ((i * 1.5) + 5.5);
            }).attr("y", "5.5em").attr("dy", "2em").attr("text-anchor",
                    "middle").text(function(d) {
              return d;
            });

    // tooltip
    tip = d3.tip().attr('class', 'd3-tip').direction('se').offset([5, 5]).html(
            function(d) {
              return getTooltipText(d);
            });

    // Invoke tip in context of visualization
    svg.call(tip);

    // main svg group to enable padding and margin convention
    visGroup = svg.append("g").attr('id', 'visualization').attr("transform",
            "translate(" + padding.left + "," + padding.top + ")");

    // append group for links (lines) and paths in specific order to determine
    // overlapping
    linkGroup = visGroup.append("g").attr("id", "links");
    pathGroup = visGroup.append("g").attr("id", "paths");
    lineGroup = visGroup.append("g").attr("id", "lines");
    nodeGroup = visGroup.append("g").attr("id", "nodes");
    labelGroup = visGroup.append("g").attr("id", "labels");

    // new force layout and configuration
    force = d3.layout.force().size([mC.panelWidth, mC.panelHeight]).charge(
            function(d) {
              return setCharge(d);
            }).linkDistance(function(d) {
      return setLinkDistance(d);
    }).linkStrength(config.lsDefault).gravity(config.gravity).friction(
            config.friction).on("tick", tick);

    nodes = force.nodes();
    // set initial location
    initializeNode();
    // push nodes into force layout and lookup
    initialNodes.forEach(function(d) {
      nodes.push(d);
      node_lookup[d.id] = d;
    });

    // connect children to nodes
    tempNodes.forEach(function(tempNode) {
      // get corresponding decision for outcome
      var parent = tempDecNodes_lookup[tempNode.parent];
      // add outcome as child to decision
      parent.children.push(tempNode);
      // add reference to link pointing to the outcome
      tempLinks.forEach(function(d) {
        if (tempNode.id == d.target) {
          var inLink = tempLinks_lookup[d.source + "," + d.target];
          tempNode.incomingLinks.push(inLink);
        }
        // get reference to link outgoing from the outcome
        if (tempNode.id == d.source) {
          var outLink = tempLinks_lookup[d.source + "," + d.target];
          tempNode.outgoingLinks.push(outLink);
        }
      });
    });

    // same as above for decisions
    tempDecNodes.forEach(function(tempDecNode) {
      // get decision point
      var parent = tempDpNodes_lookup[tempDecNode.parent];
      parent.children.push(tempDecNode);
      // add references to incoming and outgoing requiring links to decision
      requiringLinks.forEach(function(d) {
        if (tempDecNode.id == d.target) {
          tempDecNode.incomingLinks.push(d);
        }
        if (tempDecNode.id == d.source) {
          tempDecNode.outgoingLinks.push(d);
        }
      });
    });

    // set layout links (tree) for force layout
    links = d3.layout.tree().links(nodes);
    force.links(links);
    // write changes from temp into visualized objects
    confirmChanges(true);
  }

  /**
   * Updates the force layout.
   * 
   * @memberOf dynamicGraph
   */
  function update() {
    // get all layout links
    link = linkGroup.selectAll("line").data(force.links(), function(d) {
      return d.source.id + "-" + d.target.id + "-" + "layoutLink";
    });

    // update and insert new lines
    var linkEnter = link.enter().append("line").attr("class", function(d) {
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

    label = labelGroup.selectAll("text.small").data(
            force.links().filter(function(d) {
              if (d.target.type == "out") return d;
            }), function(d) {
              return d.source.id + "-" + d.target.id + "-" + "label";
            });

    var labelEnter = label.enter().append("text").text(function(d) {
      return d.target.abbrev;
    }).attr("x", function(d) {
      return d.target.x;
    }).attr("y", function(d) {
      return d.target.y;
    }).attr("class", "small");

    // Exit any old links.
    link.exit().remove();
    // remove old labels
    label.exit().remove();

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

    // add group for nodes
    node = nodeGroup.selectAll("g.node").data(force.nodes(), function(d) {
      return d.id;
    });

    // select new groups and updates for nodes
    var nodeEnter = node.enter().append("g").attr("class", "node").call(
            force.drag()).on("click", function(d) {
      if (d.type == "out") {
        highlightNode(d);
      }
    }).on("mouseover", tip.showTransition).on("mouseout", tip.hideDelayed);

    // append circle for decision points, decisions, outcomes
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

    // add abbreviation for decision points and decisions
    nodeEnter.filter(function(d) {
      if (d.type != "out") return d;
    }).append("text").attr("x", 0).attr("y", "0.5em").attr("text-anchor",
            "middle").text(function(d) {
      return d.abbrev;
    }).attr("class", function(d) {
      if (d.type != "out") return "legend";
      return "legend small";
    });

    // remove old nodes
    node.exit().remove();

    // select requiring lines
    line = lineGroup.selectAll("line.requiring").data(requiringLines,
            function(d) {
              return d.source.id + "-" + d.target.id + "-" + "requiring";
            });

    // enter new line
    line.enter().insert("line").attr("class", "decRel requiring").attr(
            "marker-end", function(d) {
              return "url(#" + d.type + ")";
            }).attr("x1", function(d) {
      return d.source.x;
    }).attr("y1", function(d) {
      return d.source.y;
    }).attr("x2", function(d) {
      var targetX = linkLine(d);
      return targetX[2];
    }).attr("y2", function(d) {
      var targetY = linkLine(d);
      return targetY[3];
    });

    // remove old lines
    line.exit().remove();

    // set circle for tick
    circle = nodeGroup.selectAll("circle");
    circle.transition().attr("r", function(d) {
      return setCircleRadius(d);
    }).attr("class", function(d) {
      return setCircleClass(d);
    });

    // select text nodes
    text = nodeGroup.selectAll("text");
    // select links
    link = linkGroup.selectAll("line");
    // labels = linkGroup.selectAll("text");
    labels = labelGroup.selectAll("text");

    // calculate layout for a few round than set all nodes fixed and stop layout
    if (start === true) {
      force.start();
      for (var i = 0; i < 250; ++i) {
        force.tick();
      }
      force.stop();
      fixLayout();
      start = false;
      modals.hideProgress();
    } else {
      // in case layout has been calcuated just tick it once
      force.start();
      force.tick();
      force.stop();
    }
  }

  /**
   * Tick function of the force layout.
   * 
   * @memberOf dynamicGraph
   * @param e
   *          tick event
   */
  function tick(e) {
    // Move circles
    circle.attr("cx", function(d) {
      // with bounding box
      d.x = Math.max(30, Math.min(mC.panelWidth - 30, d.x));
      return d.x;
    }).attr("cy", function(d) {
      // with bounding box is needed
      d.y = Math.max(30, Math.min(mC.panelHeight - 30, d.y));
      return d.y;
    });

    // recalculate path for arcs between outcomes
    path.attr("d", linkArc);

    // move links that connect nodes
    link.attr("x1", function(d) {
      return d.source.x;
    }).attr("y1", function(d) {
      return d.source.y;
    }).attr("x2", function(d) {
      return d.target.x;
    }).attr("y2", function(d) {
      return d.target.y;
    });

    // move requiring lines between decisions
    line.attr("x1", function(d) {
      return d.source.x;
    }).attr("y1", function(d) {
      return d.source.y;
    }).attr("x2", function(d) {
      var targetX = linkLine(d);
      return targetX[0];
    }).attr("y2", function(d) {
      var targetY = linkLine(d);
      return targetY[1];
    });
    // move label depnding on incoming link direction to adjust label either
    // on the left top right or bottom of outcome circle
    labels.attr("x", function(d) {
      return d.target.x;
    }).attr("y", function(d) {
      return d.target.y;
    }).transition().duration(150).attr("text-anchor", function(d) {
      return setLabelAnchor(d);
    }).attr("dy", function(d) {
      return setLabelYshift(d);
    }).attr("dx", function(d) {
      return setLabelXshift(d);
    });

    // move text in nodes to moved node
    text.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  /**
   * Calculate path source and target coordinates with offset to show arrow at
   * circle radius and with degree shift.
   * 
   * @memberOf dynamicGraph
   * @param d
   *          link between two outcomes
   */
  function linkArc(d) {
    var dx = d.target.x - d.source.x;
    var dy = d.target.y - d.source.y;
    var dr = Math.sqrt(dx * dx + dy * dy);

    var radius = config.outWidth + 1;
    var offsetAlpha = 25;

    var offsetX = (dx * radius) / dr;
    var offsetY = (dy * radius) / dr;
    var targetX = d.target.x - offsetX;
    var targetY = d.target.y - offsetY;

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
    var alphaX = Math.acos(Math.abs((targetX - d.target.x)) / radius);
    // convert to degree and normalize with c and k and add degree shift with
    // offsetAlpha
    var degreeAlphaX = ((c * (alphaX * 180 / Math.PI)) + k * 90) + offsetAlpha;
    // convert to radian
    alphaX = degreeAlphaX / 180 * Math.PI;
    // calculate new target x value with calculated angle
    targetX = (radius * Math.cos(alphaX)) + d.target.x;

    // similar as above for y value
    var alphaY = Math.asin(Math.abs((targetY - d.target.y)) / radius);
    var degreeAlphaY = ((c * (alphaY * 180 / Math.PI)) + k * 90) + offsetAlpha;
    alphaY = degreeAlphaY / 180 * Math.PI;
    targetY = (radius * Math.sin(alphaY)) + d.target.y;

    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr
            + " 0 0,1 " + targetX + "," + targetY;
  }

  /**
   * Calculates shift for requiring lines.
   * 
   * @memberOf dynamicGraph
   * @param d
   *          requiring link
   */
  function linkLine(d) {
    var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math
            .sqrt(dx * dx + dy * dy);
    var radius = config.decWidth + 3;
    var targetX = d.target.x - ((dx * radius) / dr);
    var targetY = d.target.y - ((dy * radius) / dr);

    return [targetX, targetY];
  }

  /**
   * Calculates text anchor depending on placement of decision and outcome.
   * 
   * @memberOf dynamicGraph
   * @param d
   *          link between decision and outcome
   */
  function setLabelAnchor(d) {
    if (d.target.x >= (d.source.x + 20)) return "start";
    if (d.target.x <= (d.source.x - 20)) return "end";
    return "middle";
  }

  /**
   * Calculates shift of y depending on placement of decision and outcome.
   * 
   * @memberOf dynamicGraph
   * @param d
   *          link between decision and outcome
   */
  function setLabelYshift(d) {
    // set y shift to either 5 for left and right
    if ((d.target.x >= (d.source.x + 20)) || (d.target.x <= (d.source.x - 20))) { return (0.5 * 0.85 / 2)
            + "em"; }
    // 30 if below
    if (d.target.y > d.source.y) { return "2.5em"; }
    // if above
    return "-1.5em";
  }

  /**
   * Calculates shift of x depending on placement of decision and outcome.
   * 
   * @memberOf dynamicGraph
   * @param d
   *          link between decision and outcome
   */
  function setLabelXshift(d) {
    if (d.target.x >= (d.source.x + 20)) return config.outWidth + 7 + "px";
    if (d.target.x <= (d.source.x - 20))
      return (config.outWidth + 7) * -1 + "px";
    return 0;
  }

  /**
   * writes changes to d3 or resets changes to prior state
   * 
   * @memberOf dynamicGraph
   */
  function confirmChanges(confirm) {
    if (confirm === true) {
      // if changes are confirmed
      // set currentNode to the newly selected node
      currentNode = tempCurrentNode;

      // set values of node to those of the tempNodes
      tempNodes.forEach(function(tempNode) {
        var oNode = node_lookup[tempNode.id];
        oNode.selectable = tempNode.selectable;
        oNode.excluded = tempNode.excluded;
        oNode.highlighted = tempNode.highlighted;
        oNode.conflicting = tempNode.conflicting;
      });

      tempDecNodes.forEach(function(tempDecNode) {
        // var oNode = node_lookup[tempDecNode.id];
        tempDecNode.checkOutcomes();
        // tempDecNode.checkRequiring();
        // oNode.decided = tempDecNode.decided;
        // oNode.determined = tempDecNode.determined;
        // oNode.required = tempDecNode.required;
      });

      tempDecNodes.forEach(function(tempDecNode) {
        var oNode = node_lookup[tempDecNode.id];
        tempDecNode.checkRequiring();
        oNode.decided = tempDecNode.decided;
        oNode.determined = tempDecNode.determined;
        oNode.required = tempDecNode.required;
      });

      tempDpNodes.forEach(function(tempDpNode) {
        var oNode = node_lookup[tempDpNode.id];
        // racing cond.?
        tempDpNode.checkDecisions();
        oNode.decided = tempDpNode.decided;
      });

      // set values of links to those of the tempLinks
      tempLinks.forEach(function(tempLink) {
        var oLink = link_lookup[tempLink.source + "," + tempLink.target];
        oLink.active = tempLink.active;
        oLink.conflict = tempLink.conflict;
      });
      // calculate outcome paths
      setOutcomePaths();
      // update graph
      update();
    } else {
      // if changes are not approved
      // set tempCurrentNode to last selected one
      tempCurrentNode = currentNode;

      // set tempNodes back to previous values of nodes of the force
      // layout
      tempDecNodes.forEach(function(tempDecNode) {
        var oNode = node_lookup[tempDecNode.id];
        tempDecNode.determined = oNode.determined;
        tempDecNode.decided = oNode.decided;
        tempDecNode.required = oNode.required;
      });

      tempDpNodes.forEach(function(tempDpNode) {
        var oNode = node_lookup[tempDpNode.id];
        tempDpNode.decided = oNode.decided;
      });

      tempNodes.forEach(function(tempNode) {
        var oNode = node_lookup[tempNode.id];
        tempNode.selectable = oNode.selectable;
        tempNode.excluded = oNode.excluded;
        tempNode.highlighted = oNode.highlighted;
      });
      // reset links
      tempLinks.forEach(function(tempLink) {
        var oLink = link_lookup[tempLink.source + "," + tempLink.target];
        tempLink.active = oLink.active;
        tempLink.conflict = oLink.conflict;
      });
    }
  }

  /**
   * Sets all paths between outcomes if they exist.
   * 
   * @memberOf dynamicGraph
   */
  function setOutcomePaths() {
    outcomePaths.splice(0, outcomePaths.length);
    requiringLines.splice(0, requiringLines.length);

    outcomeLinks.filter(function(d) {
      for (var i = 0; i < relationTypes.length; i++) {
        if (d.type == relationTypes[i]) if (start || lastNode === false) {
          return d;
        } else if (lastNode === true && d.source == currentNode) return d;
      }
    }).forEach(
            function(link) {
              var source = node_lookup[link.source];
              var target = node_lookup[link.target];
              if (source.highlighted === true) {
                // todo filter by source id
                var newGraphLink = new graphLink(source, target, link.type,
                        link.relationGroup, link.active, link.conflict);
                outcomePaths.push(newGraphLink);
              }
            });

    if (requiring === true) {
      requiringLinks.forEach(function(link) {
        if (link.active === true) {
          var source = node_lookup[link.source];
          var target = node_lookup[link.target];

          var newGraphLink = new graphLink(source, target, link.type,
                  link.relationGroup, false, false);
          requiringLines.push(newGraphLink);
        }
      });
    }
  }

  /**
   * Click function for outcomes.
   * 
   * @memberOf dynamicGraph
   */
  function highlightNode(d) {
    if (d3.event.defaultPrevented) return;
    // set new currently selected node
    tempCurrentNode = d.id;
    var tempNode = tempNodes_lookup[d.id];
    // if node is already in a conflict
    if (tempNode.conflicting) {
      bootbox
              .alert("The node cannot be selected because it is in a conflict. Deselect the excluding outcomes first.");
      return;
    }
    // if node is selected already
    if (tempNode.highlighted) {
      // untoggle node
      deselectDecisionOutcome(tempNode);
    } else {
      // if node is not selected check if outcome is excluded
      if (tempNode.excluded === false) {
        // if not excluded check if decision is selected
        if (tempNode.selectable) {
          // decision is not specified and outcome is not exlcuded
          // thus highlightin is easily possible
          selectDecisionOutcome(tempNode);
        } else {
          // decision is already selected ask if this outcome should
          // be chosen instead
          // may either select outcome or remain in before state
          modals.changeOutcomeWihtinDecision(tempNode);
        }
      } else if (tempNode.excluded === true && tempNode.selectable === true) {
        // node is ecluded but decision has not been specified
        // ask with modal if outcome should be selected and outcome that
        // exclude it should be deselected
        modals.forceExcludedOutcome(tempNode, true);
      } else if (tempNode.excluded === true && tempNode.selectable === false) {
        // node is excluded and decision is selected thus different
        // modal is used (boolean value)
        modals.forceExcludedOutcome(tempNode, false);
      }
    }
  }

  /**
   * Highlighting node
   * 
   * @memberOf dynamicGraph
   */
  function selectDecisionOutcome(tempNode) {
    restrictDecisionOutcomes(tempNode);
    checkConflicts();
  }

  /**
   * Dehighlighting node
   * 
   * @memberOf dynamicGraph
   */
  function deselectDecisionOutcome(tempNode) {
    resetDecisionOutcomes(tempNode);
    checkConflicts();
  }

  /**
   * activates node and restricts decision outcomes
   * 
   * @memberOf dynamicGraph
   */
  function restrictDecisionOutcomes(tempNode) {
    tempNode.activateNode();
    tempNodes.filter(function(d) {
      if (tempNode.outGroup == d.outGroup && d.id != tempNode.id) return d;
    }).forEach(function(d) {
      d.excludeOutcome();
    });
  }

  /**
   * deactivates node and frees decision
   * 
   * @memberOf dynamicGraph
   */
  function resetDecisionOutcomes(tempNode) {
    // highlight = false for node
    tempNode.deactivateNode();
    // set all nodes of decision back to normal (exclusion remain but they
    // are selectable again)
    tempNodes.filter(function(d) {
      if (tempNode.outGroup == d.outGroup && d.id != tempNode.id) return d;
    }).forEach(function(d) {
      d.resetOutcome();
    });
  }

  /**
   * activates node despite exclusion and resets all outcomes that lead to
   * exclusions restricts decison of selected outcome and resets decisions of
   * deselected outcomes can also activate excluded node and force selection
   * 
   * @memberOf dynamicGraph
   */
  function forceExcludedSelectableOutcome(tempNode) {
    // activates node and resets all selected outcomes that do interfer with
    // that
    restrictDecisionOutcomes(tempNode);
    var restrictingNodes = tempNode.getRestrictingNodes();
    restrictingNodes.forEach(function(tempNode) {
      resetDecisionOutcomes(tempNode);
    });
    // check for conflicts
    checkConflicts();
  }

  /**
   * Updates nodes if they have conflicts through in or excluding relations.
   * 
   * @memberOf dynamicGraph
   */
  function checkConflicts() {
    // checks if a conflict exists
    var conflict = false;
    for (var i = 0; i < tempNodes.length; i++) {
      var tempNode = tempNodes[i];
      if (tempNode.checkIncomingLinks() === true) {
        conflict = true;
      }
    }
    if (conflict === true) {
      // todo conflict alert
      // actually conflicts are allowed to show problems
      confirmChanges(true);
    } else {
      confirmChanges(true);
    }
  }

  /**
   * Sets initial positions for nodes to avoid jitter and speed up stable layout
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
      // for each node type create new tempNode and add them to their lookup
      if (d.type == "dp") {
        d.fixed = true;
        var newTempDpNode = new tempDpNode(d.id, d.type, d.label);
        tempDpNodes.push(newTempDpNode);
        tempDpNodes_lookup[newTempDpNode.id] = newTempDpNode;
      }
      if (d.type == "dec") {
        var newTempDecNode = new tempDecNode(d.id, d.type, d.label, d.parent);
        tempDecNodes.push(newTempDecNode);
        tempDecNodes_lookup[newTempDecNode.id] = newTempDecNode;
      }
      if (d.type == "out") {
        var newTempNode = new tempNode("out" + d.parent, d.id, d.type, d.label,
                d.parent);
        tempNodes.push(newTempNode);
        tempNodes_lookup[newTempNode.id] = newTempNode;
      }

    });
  }

  /**
   * Calculates semi-random positions for nodes depnding on cluster and type
   * 
   * @memberOf dynamicGraph
   */
  function setInitialLocation(d) {
    var h = mC.panelHeight / 100, w = mC.panelWidth / 100;
    // random angle for circle
    var angle = Math.random() * Math.PI * 2;
    // x and y coordinat of point on circle with random angle
    var dp, randomX = Math.cos(angle), randomY = Math.sin(angle);
    switch (d.cluster) {
    case 1:
      dp = [(w * 31), (h * 30)];
      break;
    case 2:
      dp = [(w * 66), (h * 31)];
      break;
    case 3:
      dp = [(w * 69), (h * 59)];
      break;
    case 4:
      dp = [(w * 40), (h * 69)];
      break;
    default:
      return [Math.random(), Math.random()];
    }
    switch (d.type) {
    // shift nodes further away depnding on type according to link distance
    case "dp":
      return dp;
    case "dec":
      if (d.abbrev == "SCV") return [dp[0], dp[1] - config.ldDp];
      if (d.abbrev == "DRL") return [dp[0], dp[1] + config.ldDp];
      return [dp[0] + randomX * (config.ldDp), dp[1] + randomY * (config.ldDp)];
    case "out":
      return [dp[0] + randomX * (config.ldDp + config.ldDec) - w,
          dp[1] + randomY * (config.ldDp + config.ldDec)];
    }
  }

  /**
   * Generate tooltip text with distinction between out and others
   * 
   * @memberOf dynamicGraph
   * @param d
   *          hovered node
   */
  function getTooltipText(d) {
    var mainText = '<p><strong>Name: </strong>' + d.label + ' (' + d.abbrev
            + ')</p><p><strong>Description: </strong>' + d.description + '</p>';
    var classification = '<p><strong>Classification: </strong>'
            + d.classification + '</p';
    return d.type == "out" ? mainText : mainText + classification;
  }

  /**
   * Returns charge parameter depending on type and if toggled or not not
   * 
   * @memberOf dynamicGraph
   * @param d
   *          node
   */
  function setCharge(d) {
    switch (d.type) {
    case "root":
      return config.chRoot;
    case "dp":
      return config.chDp;
    case "dec":
      return config.chDec;
    case "out":
      return config.chOut;
    }
  }

  /**
   * Returns link distance depending on connected nodes and if toggled or not
   * change of distance
   * 
   * @memberOf dynamicGraph
   * @param d
   *          link
   */
  function setLinkDistance(d) {
    switch (d.source.type) {
    case "root":
      return config.ldRoot;
    case "dp":
      return config.ldDp;
    case "dec":
      return config.ldDec;
    }
  }

  /**
   * Returns circle radius depending on node type and if toggled or not
   * 
   * @memberOf dynamicGraph
   * @param d
   *          node
   */
  function setCircleRadius(d) {
    switch (d.type) {
    case "root":
      return config.rootWidth;
    case "dp":
      return config.dpWidth;
    case "dec":
      return d.predetermined ? config.decWidth - 1 : config.decWidth;
    case "out":
      return d.highlighted ? config.outWidth - 1 : config.outWidth;
    }
  }

  /**
   * Returns color for circle from global color scheme.
   * 
   * @memberOf dynamicGraph
   * @param d
   *          node
   */
  function setCircleFill(d) {
    return cdsfPlus.getColor(d.group);
  }

  /**
   * Returns class for circle depending on attributes.
   * 
   * @memberOf dynamicGraph
   * @param d
   *          node
   */
  function setCircleClass(d) {
    switch (d.type) {
    case "dp":
      if (d.decided === true) { return "decided"; }
      return d.determined === true ? "determined" : null;
    case "dec":
      if (d.decided === true) { return d.required === true ? "decided required"
              : "decided"; }
      if (d.determined === true) { return d.required === true
              ? "determined required" : "determined"; }
      return d.required === true ? "required" : null;
    case "out":
      if (d.conflicting === true) { return "conflicting"; }
      if (d.selectable === false || d.excluded === true) { return "deactivated"; }
      if (d.highlighted === true) { return "highlighted"; }
      return "selectable";
    default:
      return null;
    }
  }

  /**
   * Traverse json file and return each node.
   * 
   * @memberOf dynamicGraph
   */
  function flatten(root) {
    var flattenedNodes = [];
    function recurse(node) {
      // set size attribute to 1
      node.size = 1;
      if (node.children) node.size = node.children.reduce(function(p, v) {
        return p + recurse(v);
      }, 0);
      flattenedNodes.push(node);
      return node.size;
    }
    root.size = recurse(root);
    return flattenedNodes;
  }

  /**
   * Represents path between two outcomes visualized in the layout.
   * 
   * @constructor
   * @param source
   *          reference to source node
   * @param target
   *          reference to target node
   * @param type
   *          relationship type
   * @param relationGroup
   *          group e.g. decRel, outRel
   * @param active
   *          boolean value to indicate if relations is shown
   * @param conflict
   *          boolean value if relation is part of a conflict
   */
  function graphLink(source, target, type, relationGroup, active, conflict) {
    this.source = source;
    this.target = target;
    this.relationGroup = relationGroup;
    this.active = active;
    this.conflict = conflict;
    this.type = type;
  }

  /**
   * Represents including or excluding link between two outcomes.
   * 
   * @param source
   *          id to source node
   * @param target
   *          id to target node
   * @param type
   *          type of link (in or ex)
   * @param relationGroup
   *          group (outRel)
   */
  function tempLink(source, target, type, relationGroup) {
    this.source = source;
    this.target = target;
    this.type = type;
    this.relationGroup = relationGroup;
    this.active = false;
    this.conflict = false;
    // setter for conflict
    this.changeConflict = function(conflict) {
      this.conflict = conflict;
    };
  }

  /**
   * Represents outcome.
   * 
   * @constructor
   * @param outGroup
   *          out+decision point id
   * @param id
   *          Id of outcome
   * @param type
   *          type (out)
   * @param label
   *          name of outcome
   * @param parent
   *          id of decision
   */
  function tempNode(outGroup, id, type, label, parent) {
    // indicates if outcome is selected
    this.selectable = true;
    // indicates if outcome is excluded by a relation
    this.excluded = false;
    // indicates if outcome is selected
    this.highlighted = false;
    // indicates if outcome is in a conflict
    this.conflicting = false;
    this.outGroup = outGroup;
    this.id = id;
    this.label = label;
    this.type = type;
    this.parent = parent;
    // number of excluding and including relations
    this.excluding = 0;
    this.including = 0;
    // links pointing to outcome
    this.incomingLinks = [];
    // link outgoing from outcome
    this.outgoingLinks = [];

    /**
     * Activate outgoing links e.g. in case outcome was selected.
     */
    this.activateOutgoingLinks = function() {
      this.outgoingLinks.forEach(function(d) {
        d.active = true;
      });
    };

    /**
     * Deactivate outgoing links e.g. in case outcome was deselected
     */
    this.deactivateOutgoingLinks = function() {
      this.outgoingLinks.forEach(function(d) {
        d.active = false;
      });
    };

    /**
     * Check the incoming links and determine the state of the outcome
     */
    this.checkIncomingLinks = function() {
      var ex = 0, inc = 0;
      // iterate over incoming links
      this.incomingLinks.forEach(function(incomingLink) {
        // count all occurences of ex and in
        if (incomingLink.active === true) {
          switch (incomingLink.type) {
          case "ex":
            ex++;
            break;
          case "in":
            inc++;
            break;
          default:
            break;
          }
        }
      });
      this.excluding = ex;
      this.including = inc;
      // node is included as well as excluded
      if (this.including > 0 && this.excluding > 0) {
        this.conflicting = true;
        this.setConflictingLinks(true);
        return true;
      }
      // node is highlighted but excluded by some outcome
      else if (this.excluding > 0 && this.highlighted === true) {
        this.conflicting = true;
        this.setConflictingLinks(true);
        return true;
      }
      // no conflict has been detected thus if it was in a conlfict state
      // set it to non conflicting
      if (this.conflicting === true) {
        this.setConflictingLinks(false);
        this.conflicting = false;
      }
      // if outcome is excluded set to excluded
      if (this.excluding > 0) {
        this.excluded = true;
        return false;
      }
      // if not excluded set to false
      else if (this.excluding === 0) {
        this.excluded = false;
        return false;
      }
      return false;
    };

    /**
     * Set incoming links to conflict
     */
    this.setConflictingLinks = function(conflict) {
      this.incomingLinks.forEach(function(d) {
        if ((d.type == "ex" || d.type == "in") && d.active === true) {
          d.changeConflict(conflict);
        }
      });
    };

    /**
     * Get all outcomes that are restricting this outcome.
     */
    this.getRestrictingNodes = function() {
      var restrictingNodes = [];
      this.incomingLinks.forEach(function(d) {
        if (d.type == "ex" && d.active === true) {
          var n = tempNodes_lookup[d.source];
          restrictingNodes.push(n);
        }
      });
      return restrictingNodes;
    };

    /**
     * activate node (highlighted and activate its outgoing links)
     */
    this.activateNode = function() {
      this.highlighted = true;
      this.selectable = true;
      this.activateOutgoingLinks();
    };

    /**
     * deactivates node (not highlighted and all outgoing links are not active)
     */
    this.deactivateNode = function() {
      this.highlighted = false;
      this.deactivateOutgoingLinks();
    };

    /**
     * Reset outcome if it is deselected.
     */
    this.resetOutcome = function() {
      this.selectable = true;
      this.highlighted = false;
    };

    /**
     * Set outcome to excluded (not selectable and not highlighted)
     */
    this.excludeOutcome = function() {
      if (this.highlighted === true) {
        this.highlighted = false;
        this.deactivateOutgoingLinks();
      }
      this.selectable = false;
    };

    /**
     * Reset outcome to default for clear of selection
     */
    this.resetEverything = function() {
      this.selectable = true;
      this.excluded = false;
      this.highlighted = false;
      this.conflicting = false;
      this.deactivateOutgoingLinks();
    };
  }

  /**
   * Represents decision.
   * 
   * @constructor
   * @param id
   *          Id of decision
   * @param type
   *          type (dec)
   * @param label
   *          name of decision
   * @param parent
   *          Id of decision point
   */
  function tempDecNode(id, type, label, parent) {
    this.decided = false;
    this.determined = false;
    this.required = false;
    this.id = id;
    this.label = label;
    this.type = type;
    this.parent = parent;
    // array with reference to corresponding outcome nodes
    this.children = [];
    // requiring relations to other decisions
    this.outgoingLinks = [];
    // required relations by other decisions
    this.incomingLinks = [];

    /**
     * Check associated outcomes to determine if decision is decided or not or
     * determined (one outcome left)
     */
    this.checkOutcomes = function() {
      // reset values
      this.decided = false;
      var excluded = 0;
      // iterate children
      for (var int = 0; int < this.children.length; int++) {
        var outcome = this.children[int];
        // check if child is selected
        if (outcome.highlighted === true) {
          // a child is highlighted thus the decision is decided
          this.decided = true;
          break;
        } else if (outcome.excluded === true) {
          // outcome is excluded
          excluded++;
        }
      }
      // check if any outcome was highlighted
      if (this.decided === false) {
        // no outcome was highlighted check if only one decision is not excluded
        this.determined = excluded == this.children.length - 1 ? true : false;
      } else if (excluded == this.children.length) {
        // all outcomes are excluded thus decision is excluded
        // maybe setting conflict instead
        this.excluded = true;
      }
      // if decision is neither determined nor excluded than decided = false
      // remains
    };

    /**
     * Check if any incoming or outgoing requiring relation is active if so set
     * decision as required.
     */
    this.checkRequiring = function() {
      this.required = false;

      for (var num = 0; num < this.outgoingLinks.length; num++) {
        var outReqLink = this.outgoingLinks[num];
        var target = tempDecNodes_lookup[outReqLink.target];
        if (this.decided === true && target.decided === false) {
          this.required = true;
          outReqLink.active = true;
        } else {
          outReqLink.active = false;
        }
      }

      if (this.decided === false) {
        for (var int = 0; int < this.incomingLinks.length; int++) {
          var inReqLink = this.incomingLinks[int];
          var source = tempDecNodes_lookup[inReqLink.target];
          if (source.decided === true) {
            // if (inReqLink.active === true) {
            this.required = true;
          }
          // inReqLink.active = true;
          // return;
        }
        // }
      }
    };

    /**
     * Actiave all outgoing links
     */
    this.activateOutgoingLinks = function() {
      this.outgoingLinks.forEach(function(d) {
        d.active = true;
      });
    };

    /**
     * Deactivate outgoing links
     */
    this.deactivateOutgoingLinks = function() {
      this.outgoingLinks.forEach(function(d) {
        d.active = false;
      });
    };
  }

  /**
   * Represents decision point node
   * 
   * @constructor
   * @param id
   *          Id of decision point
   * @param type
   *          type (dp)
   * @param label
   *          name of decision point
   */
  function tempDpNode(id, type, label) {
    this.decided = false;
    this.id = id;
    this.label = label;
    this.type = type;
    // Array with reference to corresponding decisions
    this.children = [];

    /**
     * Checks if all decisions are decided and thus dp is decided as well
     */
    this.checkDecisions = function() {
      this.decided = true;
      for (var int = 0; int < this.children.length; int++) {
        var decision = this.children[int];
        if (decision.decided === false) {
          this.decided = false;
          break;
        }
      }
    };
  }

  /**
   * Restore selection from loaded json file.
   * 
   * @memberOf dynamicGraph
   */
  var setData = function(json) {
    var newTempNodes = json.tempNodes;
    var newTempLinks = json.tempLinks;
    tempCurrentNode = json.tempCurrentNode;
    //
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
  };

  /**
   * Get current selection data and serialize it into json file to save
   * selection
   * 
   * @memberOf dynamicGraph
   */
  var getData = function(d) {
    var data = {};
    data.tempNodes = tempNodes;
    data.tempLinks = tempLinks;
    // dps and decs not necessary because no selection are performed thus
    // they can be recalculated at the import
    data.tempCurrentNode = tempCurrentNode;
    var json = JSON.stringify(data, null, 3);
    var blob = new Blob([json], {
      type: "application/json"
    });
    // create url for blob object and return url for download attribute
    var url = URL.createObjectURL(blob);
    return url;
  };

  /**
   * Fix all nodes in layout in their position.
   */
  var fixLayout = function() {
    nodes.forEach(function(d) {
      d.fixed = true;
    });
  };

  /**
   * Toggle between all paths for selected outcomes or only for last one.
   * 
   * @param {Boolean}
   */
  var setLastNode = function(d) {
    lastNode = d;
    setOutcomePaths();
    update();
  };

  /**
   * Activate or Deactivate requiring relations overlay.
   */
  var setRequiring = function(d) {
    // if (d === true) {
    // tempDecNodes.forEach(function(d) {
    // d.activateOutgoingLinks();
    // });
    // } else {
    // tempDecNodes.forEach(function(d) {
    // d.deactivateOutgoingLinks();
    // });
    // }
    requiring = d;
    confirmChanges(true);
  };

  /**
   * Reset complete selection.
   * 
   * @memberOf dynamicGraph
   */
  var resetSelection = function() {
    tempNodes.forEach(function(d) {
      d.resetEverything();
    });
    confirmChanges(true);
  };

  /**
   * Remove one relationship type from relations array and update layout.
   * 
   * @memberOf dynamicGraph
   * @param type
   *          relationship type to be removed
   */
  var removeRelationType = function(type) {
    for (var int = 0; int < relationTypes.length; int++) {
      if (relationTypes[int] == type) {
        relationTypes.splice(int, 1);
        break;
      }
    }
    setOutcomePaths();
    update();
  };

  /**
   * Add relationship type to relations array and update layout.
   * 
   * @memberOf dynamicGraph
   * @param type
   *          relationship type to be added
   */
  var addRelationType = (function(type) {
    relationTypes.push(type);
    setOutcomePaths();
    update();
  });

  /**
   * Helper methods to directly manipulate force layout.
   */
  var setOutCharge = function(d) {
    config.chOut = d;
    update();
  };

  var setDecCharge = function(d) {
    config.chDec = d;
    update();
  };

  var setDpCharge = function(d) {
    config.chDp = d;
    update();
  };

  var setRootCharge = function(d) {
    config.chRoot = d;
    update();
  };

  var setGravity = function(d) {
    config.gravity = d;
    update();
  };

  var getOutCharge = function(d) {
    return config.chOut;
  };

  var getDecCharge = function(d) {
    return config.chDec;
  };

  var getDpCharge = function(d) {
    return config.chDp;
  };

  var getRootCharge = function(d) {
    return config.chRoot;
  };

  var getGravity = function(d) {
    return config.gravity;
  };

  var getLookup = function(d) {
    return node_lookup;
  };

  // Reveal module pattern, offer functions to the outside
  return {
    // Helper methods
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
    setLastNode: setLastNode,
    selectDecisionOutcome: selectDecisionOutcome,
    getLookup: getLookup,
    getData: getData,
    resetSelection: resetSelection,
    addRelationType: addRelationType,
    removeRelationType: removeRelationType,
    setData: setData,
    setRequiring: setRequiring,
    forceExcludedSelectableOutcome: forceExcludedSelectableOutcome,
  };
})();