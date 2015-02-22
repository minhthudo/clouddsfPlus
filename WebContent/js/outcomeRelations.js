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
 * Outcome Relations Layout depicting the relations between outcomes.
 * 
 * @author Metz
 * @module outcomeGraph
 */
var outcomeGraph = (function() {

  // Padding for svg container
  var padding = {
    top: 30,
    right: 30,
    bottom: 40,
    left: 30
  };

  // config parameters
  var config = {
    // size of nodes
    outWidth: 13,
    decWidth: 23,
    dpWidth: 28,
    addedDpWidth: 20,
    addedDecWidth: 10,
    rootWidth: 30,

    // link distance
    ldRoot: 320,
    ldDp: 170,
    ldDec: 90,

    // force parameters
    gravity: 0.05,
    friction: 0.92,
    lsDefault: 0.85,
    chRoot: -20,
    chDp: -20,
    chDec: -150,
    chOut: -400,

    // layout size
    minHeight: 1400,
    minWidth: 1400,

    legendRelations: ["Including", "Excluding", "Allowing", "Affecting",
        "Binding"],
    relations: ["in", "ex", "a", "aff", "eb"],
  };

  // active relationship types at the beginning
  var relationTypes = ["in", "ex"];
  var start = true;
  var mC, root;
  var initialNodes, initialLinks;
  var svg, visGroup, pathGroup, linkGroup, nodeGroup, labelGroup, node, link, circle, labels;
  var force, nodes, links;
  var outcomeLinks, outcomePaths = [], node_lookup = [];
  var drag;

  // set initial data on instantiation (in case of initialization is used
  // shift to initialize() methode and set content in callback
  d3.json("./data/cloudDSFPlus.json", function(error, json) {
    root = json.cdsfPlus;
    outcomeLinks = json.outcomeLinks;
  });

  /**
   * @memberOf outcomeGraph
   */
  function initialize() {
    // compute panel size and margins after margin convention
    mC = cdsfPlus.marginConvention(padding, config.minHeight, config.minWidth);

    // select container and remove it in case it exists already
    d3.select("#svgContainer").remove();
    // new svg with margin and id svgContainer, class for css flexibility
    svg = d3.select("#visContent").append("svg").attr("width", mC.oWidth).attr(
            "height", mC.oHeight).attr("id", "svgContainer")
    // .call(zoom)
    .append("g").attr("transform",
            "translate(" + mC.marginLeft + "," + mC.marginTop + ")").attr(
            "class", "outcomeContainer");

    // defs for path endings
    svg.append("defs").selectAll("marker").data(config.relations).enter()
            .append("marker").attr("id", function(d) {
              return d;
            }).attr("refX", "7.5").attr("refY", "4").attr("markerWidth", 10)
            .attr("markerHeight", 10).attr("markerUnits", "strokeWidth").attr(
                    "orient", "auto").append("svg:path").attr("d",
                    "M 0,2 L7,4 L0,6").attr(
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
              return "outRel " + d;
            }).attr("x1", function(d, i) {
              return (mC.iWidth / 10) * ((i * 2) + 0.5);
            }).attr("y1", 0).attr("y2", 0).attr("x2", function(d, i) {
              return (mC.iWidth / 10) * ((i * 2) + 1.5);
            }).attr("marker-end", function(d) {
              return "url(#" + d + ")";
            });

    // set text in the middle below the links
    legend.selectAll("text").data(config.legendRelations).enter()
            .append("text").attr("x", function(d, i) {
              return (mC.iWidth / 10) * ((i * 2) + 1);
            }).attr("y", 0).attr("dy", "2em").attr("text-anchor", "middle")
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

    // main svg group to enable padding
    visGroup = svg.append("g").attr('id', 'visualization').attr("transform",
            "translate(" + padding.left + "," + padding.top + ")");

    // append group for links (lines) and paths
    linkGroup = visGroup.append("g").attr("id", "links");
    pathGroup = visGroup.append("g").attr("id", "paths");
    nodeGroup = visGroup.append("g").attr("id", "nodes");
    labelGroup = visGroup.append("g").attr("id", "labels");

    // new force layout
    force = d3.layout.force().size([mC.panelWidth, mC.panelHeight]).charge(
            function(d) {
              return setCharge(d);
            }).linkDistance(function(d) {
      return setLinkDistance(d);
    }).linkStrength(config.lsDefault).gravity(config.gravity).friction(
            config.friction).on("tick", tick);

    nodes = force.nodes();
    initialNodes = flatten(root);
    initialLinks = d3.layout.tree().links(initialNodes);
    if (start === true) {
      initializeNode();
    }
    setupForceLayout();
  }

  /**
   * Updates force layout and redraws objects in case they have changed.
   * 
   * @memberOf outcomeGraph
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

    // remove old links.
    link.exit().remove();

    // add outcome texts attached to links
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

    // remove old paths
    path.exit().remove();

    // select groups for nodes
    node = nodeGroup.selectAll("g.node").data(force.nodes(), function(d) {
      return d.id;
    });

    // set specific drag behaviour
    drag = force.drag()
    // .on("dragstart", dragstart)
    // .on("drag", dragmove)
    .on("dragend", dragend);

    // select new groups and updates for nodes
    var nodeEnter = node.enter().append("g").attr("class", "node").call(drag)
    // .call(force.drag)
    .on("dblclick", function(d) {
      if (d.type != "out" && d.type != "root") {
        toggleNode(d);
      }
    }).on("click", function(d) {
      if (d.type == "out") {
        highlightNode(d);
      }
    }).on("mouseover", tip.showTransition).on("mouseout", tip.hideDelayed);

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

    // add abbreviations for decision points and decisions
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

    // set circle for tick
    circle = nodeGroup.selectAll("circle");
    circle.transition().attr("r", function(d) {
      return setCircleRadius(d);
    }).attr("class", function(d) {
      return setCircleClass(d);
    });

    // select text within nodes
    text = nodeGroup.selectAll("text");
    // select layout links
    link = linkGroup.selectAll("line");
    // select all labels (texts attached to links)
    labels = labelGroup.selectAll("text");

    // text2.transition().attr("text-anchor",function(d){
    // if(d.target.x >= d.source.x) return "start";
    // return "end";});
    // calculate layout for a few round than set dps fixed
    force.nodes().forEach(function(d) {
      // d.fixed = true;
      if (d.type == "dp") {
        d.fixed = true;
      }
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
   * @memberOf outcomeGraph
   */
  function tick(e) {

    circle.attr("cx", function(d) {
      // in case bounding box is needed
      d.x = Math.max(30, Math.min(mC.panelWidth - 30, d.x));
      return d.x;
    }).attr("cy", function(d) {
      // in case bounding box is needed
      d.y = Math.max(30, Math.min(mC.panelHeight - 30, d.y));
      return d.y;
    });

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
    // move label depnding on incoming link direction to adjust label either
    // on the left top right or bottom of outcome circle
    labels.attr("x", function(d) {
      return d.target.x;
    }).attr("y", function(d) {
      return d.target.y;
    }).transition().duration(150).attr("text-anchor", function(d) {
      // set anchor either left, right or middle
      if (d.target.x >= (d.source.x + 20)) return "start";
      if (d.target.x <= (d.source.x - 20)) return "end";
      return "middle";

    }).attr("dy", function(d) {
      // set y shift to either 5 for left and right
      if ((d.target.x >= (d.source.x + 20))

      || (d.target.x <= (d.source.x - 20))) { return (0.5 * 0.85 / 2) + "em";

      }
      // 30 if below
      if (d.target.y > d.source.y) { return "2.5em";

      }
      // if above
      return "-1.5em";
    }).attr(
            "dx",
            function(d) {
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
   * 
   */
  function dragend(d, i) {
    force.alpha(0.04);
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
      nodes.push(d);
      node_lookup[d.id] = d;
    });
    setOutcomePaths();
    links = d3.layout.tree().links(nodes);
    force.links(links);
    update();
  }

  /**
   * Sets all paths between outcomes if they exist.
   * 
   * @memberOf outcomeGraph
   */
  function setOutcomePaths() {
    outcomePaths.splice(0, outcomePaths.length);

    outcomeLinks.filter(function(d) {
      for (var i = 0; i < relationTypes.length; i++) {
        if (d.type == relationTypes[i]) return d;
      }
    }).forEach(function(link) {
      var source = node_lookup[link.source];
      var target = node_lookup[link.target];

      // check if source outcome is not collapsed
      if (typeof source !== 'undefined') {
        // source exists check if higlighted
        if (source.highlighted) {
          // source is highlighted set target
          // new link between source and outcome, decision or decision point
          var newLink = {};
          newLink.source = source;
          // check if target outcome is collapsed
          if (typeof target === "undefined") {
            // target decision instead of collapsed outcome
            // Avoid iteration with extraction of parent id
            var parent = node_lookup[link.target.toString().substr(0, 3)];
            // alternative search parent decision of outcome
            // var parent;
            // initialLinks.forEach(function(d) {
            // if (link.target == d.target.id) {
            // parent = node_lookup[d.source.id];
            // }
            // });
            // if decision is collapsed as well
            if (typeof parent === "undefined") {
              // target decision point instead of decision
              var topParent = node_lookup[String(link.target).charAt(0)];
              newLink.target = topParent;
            } else {
              // decision is not collapsed decision
              newLink.target = parent;
            }
          } else {
            // outcome is not collapsed
            newLink.target = target;
          }
          newLink.relationGroup = link.relationGroup;
          newLink.type = link.type;
          outcomePaths.push(newLink);
        } // outcome is not highlighted no link
      } // outcome is collapsed no link
    });
  }

  /**
   * Calculate path source and target coordinates with offset to show arrow
   * 
   * @memberOf outcomeGraph
   * @param d
   *          current link
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
      radius = d.target._children ? config.decWidth + config.addedDecWidth
              : config.decWidth;
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
   * Sets initial positions for nodes to avoid jitter and speed up stable layout
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
   * Calculates semi-random positions for nodes depending on cluster and type.
   * 
   * @memberOf outcomeGraph
   * @param d
   *          node
   */
  function setInitialLocation(d) {
    var h = mC.panelHeight / 100, w = mC.panelWidth / 100;
    // random angle for circle
    var angle = Math.random() * Math.PI * 2;
    // x and y coordinate of point on circle with random angle
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
    case "dec":
      // if (d.abbrev == "SCV") return [dp[0], dp[1] - config.ldDp];
      // if (d.abbrev == "DRL") return [dp[0], dp[1] + config.ldDp];
      return [dp[0] + randomX * (config.ldDp), dp[1] + randomY * (config.ldDp)];
    case "out":
      return [dp[0] + randomX * (config.ldDp + config.ldDec) - w,
          dp[1] + randomY * (config.ldDp + config.ldDec)];
    default:
      return dp;
    }
  }

  /**
   * Highlight or Remove outgoing paths from selected node.
   * 
   * @memberOf outcomeGraph
   * @param d
   *          clicked node
   */
  function highlightNode(d) {
    // avoid click if node was dragged
    if (d3.event.defaultPrevented) return;
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
   * Deletes paths outgoing from selected node.
   * 
   * @memberOf outcomeGraph
   * @param id
   *          Id of node
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
   * @param d
   *          clicked node
   */
  function toggleNode(d) {
    // Write or Restore children with temp variable
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    // retraverse root and rebuild layout (have reference to root values)
    initialNodes = flatten(root);
    setupForceLayout();
  }

  /**
   * Returns a list of all nodes under the root; size is calculated
   * 
   * @memberOf outcomeGraph
   * @param root
   *          object to traverse (json object)
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
   * Returns charge parameter depending on type and if toggled or not.
   * 
   * @memberOf outcomeGraph
   * @param d
   *          node
   */
  function setCharge(d) {
    switch (d.type) {
    case "root":
      return config.chRoot;
    case "dp":
      // special value for decision point with only one decision
      if (d.cluster == 3) { return d._children ? config.chDp
              + (d.size * config.chDec) : config.chDp; }
      return d._children ? config.chDp
              + (d.size * 10 * (config.chDec + config.chOut)) : config.chDp;
    case "dec":
      return d._children ? config.chDec + d.size * config.chOut : config.chDec;
    case "out":
      return config.chOut;
    }
  }

  /**
   * Returns link distance depending on node type and if applicable whether
   * their children are visible or not.
   * 
   * @memberOf outcomeGraph
   * @param d
   *          node with link
   */
  function setLinkDistance(d) {
    switch (d.source.type) {
    case "root":
      return config.ldRoot;
    case "dp":
      return d.target.children ? config.ldDp : config.ldDp + config.ldDec / 3;
    case "dec":
      return config.ldDec;
    }
  }

  /**
   * Calculates circle radius depending on node type and if toggled or not.
   * 
   * @memberOf outcomeGraph
   * @param d
   *          node
   */
  function setCircleRadius(d) {
    switch (d.type) {
    case "root":
      return config.rootWidth;
    case "dp":
      return d.children ? config.dpWidth : config.dpWidth + config.addedDpWidth;
    case "dec":
      return d.children ? config.decWidth : config.decWidth
              + config.addedDecWidth;
    case "out":
      return d.highlighted ? config.outWidth - 1 : config.outWidth;
    }
  }

  /**
   * Returns class for nodes.
   * 
   * @memberOf outcomeGraph
   * @param d
   *          node
   */
  function setCircleClass(d) {
    return (d.type == "out" && d.highlighted === true) ? "highlighted" : "";
  }

  /**
   * Returns color for circle from global color scheme
   * 
   * @memberOf outcomeGraph
   * @param d
   *          node
   */
  function setCircleFill(d) {
    return cdsfPlus.getColor(d.group);
  }

  /**
   * Generate tooltip text with distinction between outcomes (no classification)
   * and other nodes.
   * 
   * @memberOf outcomeGraph
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
   * Fix all nodes in layout in their position.
   * 
   * @memberOf outcomeGraph
   */
  var fixLayout = function() {
    nodes.forEach(function(d) {
      d.fixed = true;
    });
  };

  /**
   * Release all nodes in layouts
   * 
   * @memberOf outcomeGraph
   */
  var looseLayout = function() {
    nodes.forEach(function(d) {
      if (d.type != "root") {
        d.fixed = false;
      }
    });
    // start layout for a short time to indicate successful loosing.
    force.alpha(0.01);
  };

  /**
   * Highlight all relations (toggle all nodes) and update layout.
   * 
   * @memberOf outcomeGraph
   */
  var showAllRelations = function() {
    nodes.forEach(function(d) {
      if (d.type == "out") {
        d.highlighted = true;
      }
    });
    setOutcomePaths();
    update();
  };

  /**
   * Hide all relations (untoggle all nodes) and update layout.
   * 
   * @memberOf outcomeGraph
   */
  var hideAllRelations = function() {
    nodes.forEach(function(d) {
      d.highlighted = false;
    });
    setOutcomePaths();
    update();
  };

  /**
   * Remove relationship type from array and update layout.
   * 
   * @memberOf outcomeGraph
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
   * Remove all relationship types from array and update layout.
   */
  var removeAllRelationTypes = function() {
    relationTypes.splice(0, relationTypes.length);
    relationTypes.push([""]);
    setOutcomePaths();
    update();
  };

  /**
   * Add relationship type to array and update layout.
   * 
   * @param type
   *          relationship type to be added
   */
  var addRelationType = function(type) {
    relationTypes.push(type);
    setOutcomePaths();
    update();
  };

  /**
   * Substitute relationship types with new array and update layout.
   * 
   * @param types
   *          relationship types array
   */
  var addAllRelationTypes = function(types) {
    relationTypes.splice(0, relationTypes.length);
    types.forEach(function(d) {
      relationTypes.push(d);
    });
    setOutcomePaths();
    update();
  };

  /**
   * Helper Methods to change and get force parameters directly.
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

  // Reveal module pattern, offer functions to the outside
  return {
    initialize: initialize,
    // helper methods to change force parameters on the fly
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
    fixLayout: fixLayout,
    looseLayout: looseLayout,
    showAllRelations: showAllRelations,
    hideAllRelations: hideAllRelations,
    removeRelationType: removeRelationType,
    addRelationType: addRelationType,
    removeAllRelations: removeAllRelationTypes,
    setAllRelations: addAllRelationTypes,
  };
})();