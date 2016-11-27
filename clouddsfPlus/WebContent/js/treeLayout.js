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
 * Hierarchical Layout depicing a static view on the knowledge base in a tree
 * like manner.
 * 
 * @author Metz
 * @module hierarchicalLayout
 */
var hierarchicalLayout = (function() {

  // Padding for svg container
  var padding = {
    top: 5,
    right: 5,
    bottom: 5,
    left: 50
  };

  // config parameters
  var config = {
    decRadius: 10,
    outRadius: 10,
    minHeight: 1350,
    minWidth: 950,
  };

  var tree, nodes, root, svg, diagonal, visGroup;
  var mC, tip;

  // get data and create tree with immediate function
  (function() {
    d3.json("./data/cloudDSFPlus.json", function(json) {
      root = json.cdsfPlus;
      initialize(true);
    });
  })();

  /**
   * Setup of svg and d3 tree layout.
   * 
   * @param reset
   *          Boolean value to distinguish between resize and first startup.
   * @memberOf hierarchicalLayout
   */
  function initialize(reset) {
    // compute panel size and margins with margin convention
    mC = cdsfPlus.marginConvention(padding, config.minHeight, config.minWidth);

    // delete old svg content to switch between layouts
    d3.select("#svgContainer").remove();

    svg = d3.select("#visContent").append("svg").attr("width", mC.oWidth).attr(
            "height", mC.oHeight).attr("id", "svgContainer").append("g").attr(
            "transform",
            "translate(" + mC.marginLeft + "," + mC.marginTop + ")");

    // tooltip with offeset 5,5 and southeast
    tip = d3.tip().attr('class', 'd3-tip').direction('se').offset([5, 5]).html(
            function(d) {
              return getTooltipText(d);
            });

    // Invoke tip in context of visualization
    svg.call(tip);

    // Create new TreeLayout with svg size
    tree = d3.layout.tree().size([mC.panelHeight, mC.panelWidth]);
    diagonal = d3.svg.diagonal().projection(function(d) {
      return [d.y, d.x];
    });

    // start in the left-middle of the svg
    root.x0 = mC.panelWidth / 2;
    root.y0 = 0;
    // if tree is resized avoid toggle of any nodes
    if (reset === true) {
      // collapse all children
      root.children.forEach(toggleAll);
    }
    // margin convention
    visGroup = svg.append("g").attr('id', 'visualization').attr("transform",
            "translate(" + padding.left + "," + padding.top + ")");
    // update tree depending on node
    update(root);
  }

  /**
   * Updates and draw tree. *
   * 
   * @param source
   *          node that have been clicked.
   * @memberOf hierarchicalLayout
   */
  function update(source) {
    var duration = d3.event && d3.event.altKey ? 5000 : 500;

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse();

    // Normalize for fixed-depth.
    var distance = mC.panelWidth / 16;
    // set y for every node according to type and hence level to enable
    // better labeling
    nodes.forEach(function(d) {
      var x = 0;
      switch (d.type) {
      case "root":
        x = 0;
        break;
      case "dp":
        x = 4.5;
        break;
      case "dec":
        x = 8.5;
        break;
      case "out":
        x = 11;
        break;
      }
      d.y = (x * distance);
    });

    // Update the node selection groups
    var node = visGroup.selectAll("g.treeNode").data(nodes, function(d) {
      return d.id;
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g").attr("class", "treeNode").attr(
            "transform", function(d) {
              return "translate(" + source.y0 + "," + source.x0 + ")";
            });

    // append text element with placement in dependance to circle radius (type)
    var textWrapper = nodeEnter.append("text").attr(
            "x",
            function(d) {
              if (d.type == "root") return 0;
              return d.children || d._children ? -config.decRadius - 5
                      : config.outRadius + 5;
            }).attr("y", function(d) {
      if (d.type == "root") return -config.decRadius - 5;
      if (d.type == "out") return config.outRadius * 1 / 2;
      return config.decRadius * 1 / 3;
    }).attr("dy", 0).attr("text-anchor", function(d) {
      if (d.type == "root") return "middle";
      return d.children || d._children ? "end" : "start";
    }).text(function(d) {
      return d.label;
    });

    // Wrap text for decision points and decisions
    textWrapper.filter(function(d) {
      if (d.type != "out") return d;
    }).call(wrap, (mC.panelWidth / 16) * 3);

    // wrap text for outcomes
    textWrapper.filter(function(d) {
      if (d.type == "out") return d;
    }).call(wrap, (mC.panelWidth / 16) * 5);

    // append circles
    nodeEnter.append("circle").attr("r", function(d) {
      if (d.type == "out") return config.outRadius;
      return config.decRadius;
    }).attr("class", function(d) {
      return setClass(d);
    }).attr("fill", function(d) {
      return setCircleFill(d);
    }).attr("stroke", function(d) {
      return setCircleStroke(d);
    }).on("click", function(d) {
      toggle(d);
      update(d, svg);
    }).on("mouseover", tip.show).on("mouseout", tip.hide);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition().duration(duration).attr("transform",
            function(d) {
              return "translate(" + d.y + "," + d.x + ")";
            });
    nodeUpdate.select("circle").attr("r", function(d) {
      if (d.type == "out") return config.outRadius;
      return config.decRadius;
    }).attr("class", function(d) {
      return setClass(d);
    });

    nodeUpdate.select("text").style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition().duration(duration).attr(
            "transform", function(d) {
              return "translate(" + source.y + "," + source.x + ")";
            }).remove();

    // smoother
    nodeExit.select("circle").attr("r", 1e-6);
    nodeExit.select("text").style("fill-opacity", 1e-6);

    // Update the links
    var link = visGroup.selectAll("path.treeLink").data(tree.links(nodes),
            function(d) {
              return d.target.id;
            });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g").attr("class", "treeLink").attr("d",
            function(d) {
              var o = {
                x: source.x0,
                y: source.y0
              };
              return diagonal({
                source: o,
                target: o
              });
            }).transition().duration(duration).attr("d", diagonal);

    // Transition links to their new position.
    link.transition().duration(duration).attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition().duration(duration).attr("d", function(d) {
      var o = {
        x: source.x,
        y: source.y
      };
      return diagonal({
        source: o,
        target: o
      });
    }).remove();

    // Keep old positions for transition
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  /**
   * Set classes for nodes. *
   * 
   * @memberOf hierarchicalLayout
   * @param d
   *          current node.
   */
  function setClass(d) {
    if (d._children) {
      return d.group + " treeCollapsed";
    } else {
      if (d.children) { return d.group + " treeExpanded"; }
      return d.group + " treeExpanded outNode";
    }
  }

  /**
   * Set circle stroke. *
   * 
   * @memberOf hierarchicalLayout
   * @param d
   *          current node
   */
  function setCircleStroke(d) {
    return cdsfPlus.getColor(d.group);
  }

  /**
   * Set fill color of nodes. *
   * 
   * @memberOf hierarchicalLayout
   * @param d
   *          current node
   */
  function setCircleFill(d) {
    return cdsfPlus.getColor(d.group);
  }

  /**
   * Wrap text in multiple tspans to avoid foreignobject which is not rendered
   * by ie.
   * 
   * @memberOf hierarchicalLayout
   * @param text
   *          Text to wrap in tspans
   * @param width
   *          Available width between nodes depnding on type.
   */
  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this);
      var words = text.text().split(/\s+/).reverse();
      var word, line = [], lineNumber = 0, lineHeight = 1.1; // ems
      var y = text.attr("y"), x = text.attr("x"), dy = parseFloat(text
              .attr("dy"));
      var amountSpans = 1;
      var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y)
              .attr("dy", dy);
      while (typeof (word = words.pop()) !== 'undefined') {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          // resolve offset if more than two rows. Not got if more
          // than two rows.
          amountSpans++;
          tspan = text.append("tspan").attr("x", x).attr("y", y)
          // y - (decisionRadius / 2))
          .attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
      if (amountSpans > 1) {
        var dyShift = (amountSpans - 1) / 2 * lineHeight;
        dyShift = dyShift.toFixed(2);
        text.attr("dy", -dyShift + "em");
        text.selectAll("tspan").attr("dy", function(d) {
          var span = d3.select(this);
          olddY = parseFloat(span.attr("dy"));
          return olddY - dyShift + "em";
        });
      }
    });
  }

  /**
   * Generate tooltip text with distinction between out and others
   * 
   * @memberOf hierarchicalLayout
   * @param d
   *          current node
   */
  function getTooltipText(d) {
    var mainText = '<p><strong>Name: </strong>' + d.label + ' (' + d.abbrev
            + ')</p><p><strong>Description: </strong>' + d.description + '</p>';
    var classification = '<p><strong>Classification: </strong>'
            + d.classification + '</p';
    return d.type == "out" ? mainText : mainText + classification;
  }

  /**
   * Collapse all nodes.
   * 
   * @memberOf hierarchicalLayout
   * @param d
   *          selected node
   */
  function toggleAll(d) {
    if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
  }

  /**
   * Toggle children of node.
   * 
   * @memberOf hierarchicalLayout
   * @param d
   *          selected node
   */
  function toggle(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
  }

  /**
   * Show all children of node.
   * 
   * @memberOf hierarchicalLayout
   * @param d
   *          selected node
   */
  function togglePos(d) {
    if (d.children) {
    } else {
      d.children = d._children;
      d._children = null;
    }
  }

  /**
   * Do not show any children.
   * 
   * @memberOf hierarchicalLayout
   * @param d
   *          selected node
   */
  function toggleNeg(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    }
  }

  /**
   * Show all decision points.
   * 
   * @memberOf hierarchicalLayout
   */
  var showDps = (function() {
    root.children.forEach(toggleNeg);
    update(root, svg);
  });

  /**
   * Show all decisions. *
   * 
   * @memberOf hierarchicalLayout
   */
  var showDecisions = (function() {
    root.children.forEach(function(d) {
      if (d.children) {
        d.children.forEach(toggleNeg);
      }
      if (d._children) {
        d.children = d._children;
        d._children = null;
        d.children.forEach(toggleNeg);
      }
    });
    update(root, svg);
  });

  /**
   * Show all outcomes.
   * 
   * @memberOf hierarchicalLayout
   */
  var showOutcomes = (function() {
    root.children.forEach(function(d) {
      if (d.children) {
        d.children.forEach(togglePos);
      }
      if (d._children) {
        d.children = d._children;
        d._children = null;
        d.children.forEach(togglePos);
      }
    });
    update(root, svg);
  });

  /**
   * Resize tree without collapsing nodes.
   * 
   * @memberOf hierarchicalLayout
   */
  var resizeLayout = (function() {
    initialize(false);
  });

  // revealing module pattern
  return {
    resizeLayout: resizeLayout,
    showDps: showDps,
    showDecisions: showDecisions,
    showOutcomes: showOutcomes,
    initialize: initialize,
  };
})();
