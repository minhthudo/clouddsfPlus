/* ========================================================================
 * Cloud Decision Support Framework - CloudDSF
 * dsamc.js - v1.0 - 2014/03/22
 * http://www.clouddsf.com
 * ========================================================================
 * Copyright 2014 Alexander Darsow
 * ========================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* General Variables */
/* ======================================================================== */

/* Page Layout Variables ==================== */
//var showVisLeftDIV = true;
//var visLeftDIVStatus = true;
//var allowResizeVisContent = true;
var showVislabelInfo = true;

var showTooltips;
var showLabels;

/* Visualization Layout Variables ============ */
// General
var visContentID = "visContent";
var SVGWidth = 900;
var SVGHeight = 900;

var visType = "clusterLayout";
var visTypeName = {
	"partitionLayout" : "Partition Layout",
	"treeLayout" : "Tree Layout",
	"chordLayout" : "Chord Layout",
	"forceLayout" : "Force Layout",
	"bundleLayout" : "Bundle Layout",
	"treemapLayout" : "Treemap Layout",
	"networkLayout" : "Network Layout",
	"clusterLayout" : "Cluster Layout"
};

var layoutSVG = null;
var layoutNodes = null;
var layoutLinks = null;

// Partition Layout
var layoutPartition = null;
var layoutPartitionDefaultSettings = {
	"showLabels" : true,
	"showTooltips" : false
};

// Tree Layout
var layoutTree = null;
var layoutTreeDefaultSettings = {
	"showLabels" : true,
	"showTooltips" : false
};

// Cluster Layout
var layoutCluster = null;
var layoutBundle = null;

// Froce Layout
var layoutForce = null;
var layoutForceDefaultSettings = {
	"showDecisions" : true,
	"showTasks" : true,
	"showInfluenceLinks" : false,
	"showAffectLinks" : true,
	"showLabels" : true,
	"showTooltips" : false
};

// Treemap Layout
var layoutTreemap;
var layoutTreemapDefaultSettings = {
	"showLabels" : true,
	"showTooltips" : false
};

// var clusterLayoutData;
// var treeLayoutData;
// var treeMapLayoutData;
// var forceLayoutData;
// var partitionLayoutData;
var visualizationData;

var jsonRetrieval = function() {
	$.ajax({
		url : "./data/cloudDSF.json",
		dataType : 'json',
		async : false,
		success : function(json) {
			// New Root
			visualizationData = json;
		}
	});
}();

/* Initialization of Page */
/* ======================================================================== */
function initializationOfPage() {

	/* visLeftDiv */
	// if(!showVisLeftDIV) {
	// $("#visLeftContent").css("display", "none");
	// $("#visLeftDIV").css({"width": "4em", "min-width": "0px"});
	// }
	//    
	/* init SVG dimensions */
	// SVGWidth = $("#" + visContentID).width();
	// SVGHeight = $("#" + visContentID).height();
	/* init visType Layout */
	doVisType();

}

/* Layout Functions */
/* ======================================================================== */

// function toogleVisLeftDiv(duration) {
// if(!duration) {duration=500;}
//    
// if(visLeftDIVStatus) {
// $("#visLeftContent").slideToggle(duration, function(){
// $("#visLeftDIV").css("min-width", "0px");
// $("#visLeftDIV").animate({ width: "4em" }, duration);
// });
// visLeftDIVStatus = false;
// } else {
// $("#visLeftDIV").animate({ width: "20%" }, duration, function(){
// $("#visLeftDIV").css("min-width", "220px");
// $("#visLeftContent").slideToggle(duration);
// });
// visLeftDIVStatus = true;
// }
// }
function updateVisTypeSelection() {
	// Update the visTypeSelection
	$("#visTypeSelectedBTN").text(visTypeName[visType]);
	$("#visTypeUL li").removeClass("active");
	$("#" + visType).parent().addClass("active");
}

// function disableVisInputBox(inputElement){
// inputElement.prop("disabled", true);
// inputElement.parent().parent().addClass("visInputBoxDisabled");
// }

// function enableVisInputBox(inputElement){
// inputElement.prop("disabled", false);
// inputElement.parent().parent().removeClass("visInputBoxDisabled");
// }

// function resizeVisContent(){
// if(allowResizeVisContent){
// // Get visContent
// var visContent = $('#visContent');
// var newWidth = visContent.parent().width() -
// 2*Math.max(parseInt(visContent.css("margin-top"),10),parseInt(visContent.css("margin-bottom"),10));
//        
// // Handel what to set depending on Layout
// if("partitionLayout" == visType) {
// visContent.css('width', newWidth);
// visContent.css('height', newWidth);
// SVGWidth = newWidth;
// SVGHeight = newWidth;
// } else if("treeLayout" == visType) {
// visContent.css('width', newWidth);
// visContent.css('height', newWidth);
// SVGWidth = newWidth;
// SVGHeight = newWidth;
// } else if("clusterLayout" == visType) {
// visContent.css('width', newWidth);
// visContent.css('height', newWidth);
// SVGWidth = newWidth;
// SVGHeight = newWidth;
// } else if("forceLayout" == visType) {
// visContent.css('width', newWidth);
// visContent.css('height', newWidth);
// SVGWidth = newWidth;
// SVGHeight = newWidth;
// } else if("chordLayout" == visType) {
// alert("chordLayout");
// } else if("bundleLayout" == visType) {
// alert("bundleLayout");
// } else if("treemapLayout" == visType) {
// visContent.css('width', newWidth);
// visContent.css('height', newWidth);
// SVGWidth = newWidth;
// SVGHeight = newWidth;
// } else if("networkLayout" == visType) {
// alert("networkLayout");
// }
//              
// } else {
// alert("Resizing prohibited!");
// }
// }

function toogleSettingsBox(endState, duration) {
	if ("collapsed" == endState) {
		if (!$('#visPanelSettingsContent').is(":hidden"))
			$('#visPanelSettingsContent').slideToggle('fast').delay(duration);
	} else if ("expanded" == endState) {
		if ($('#visPanelSettingsContent').is(":hidden"))
			$('#visPanelSettingsContent').slideToggle('fast').delay(duration);
	} else {
		$('#visPanelSettingsContent').slideToggle('fast').delay(duration);
	}
}

// function vCenterTextForce() {
// $(".forceTextCenter").not('.forceTextDP').each(function(i){
// var tSpaceH = $(this).parent().parent()[0].getBBox().height -
// $(this).parent().height();
// $(this).css( { "margin-top" : tSpaceH/2+"px" , "margin-bottom" :
// tSpaceH/2+"px" } );
// });
// }

/* onClick Events */
/* ======================================================================== */

// $("#visPanelToogle").click(function() {
// toogleVisLeftDiv();
// });
$('#visPanelSettingsIconToogle').click(function() {
	toogleSettingsBox();
});

$('#visPanelSettingsLabelToogle').click(function() {
	toogleSettingsBox();
});

$("#visTypeBTNGroup button").click(function() {
});

$("#visTypeBTNGroup a").click(function() {
	doVisType($(this).attr("id"));
});

// $('#resizeVisContent').click(function(){
// resizeVisContent();
// });

/* Actions */
/* ======================================================================== */
function doVisType(inputVisTypeID) {

	// Handle inital state
	if ($("#" + visContentID).children().length == 0) {
		drawLayout();
		updateVisTypeSelection();
	} else if (visType != inputVisTypeID) {
		// Handle changed visType
		clearLayout();
		visType = inputVisTypeID;
		drawLayout();
		updateVisTypeSelection();
	}

}

function drawLayout() {
	// Handel draw Layout
	if ("partitionLayout" == visType) {
		// Settings BOX
		setPartitionSettings();
		// Draw Layout
		drawPartitionLayout();
	} else if ("treeLayout" == visType) {
		// Settings BOX
		setTreeSettings();
		// Draw Layout
		drawTreeLayout();
	} else if ("clusterLayout" == visType) {
		// Settings BOX
		setClusterSettings();
		// Draw Layout
		drawClusterLayout();
	} else if ("forceLayout" == visType) {
		// Settings BOX
		setForceSettings();
		// Draw Layout
		drawForceLayout();
		// vCenterTextForce();
	} else if ("chordLayout" == visType) {
		alert("chordLayout draw");
	} else if ("bundleLayout" == visType) {
		alert("bundleLayout draw");
	} else if ("treemapLayout" == visType) {
		// Settings BOX
		setTreemapSettings();
		// Draw Layout
		drawTreemapLayout();
	} else if ("networkLayout" == visType) {
		alert("networkLayout draw");
	} else {
		alert("No Layout to draw!");
	}

	// Auto hide Settings Panel
	toogleSettingsBox("collapsed", 750);
	// setTimeout(toogleSettingsBox(),750);

}

function clearLayout() {
	// Handel clear Layout
	if ("partitionLayout" == visType) {
		clearVisPanelSettingsContent();
		clearPartitionLayout();
	} else if ("treeLayout" == visType) {
		clearVisPanelSettingsContent();
		clearTreeLayout();
	} else if ("clusterLayout" == visType) {
		clearVisPanelSettingsContent();
		clearClusterLayout();
	} else if ("forceLayout" == visType) {
		clearVisPanelSettingsContent();
		clearForceLayout();
	} else if ("chordLayout" == visType) {
		alert("Clear chordLayout");
	} else if ("bundleLayout" == visType) {
		alert("Clear bundleLayout");
	} else if ("treemapLayout" == visType) {
		clearVisPanelSettingsContent();
		clearTreemapLayout();
	} else if ("networkLayout" == visType) {
		alert("Clear networkLayout");
	}
}

/* Layout Rendering */
/* ======================================================================== */

/* Partition Layout */
/* ========================================= */
function drawPartitionLayout() {

	/* === Set Default Information === */
	setPartitionDefaultInformation();

	/* === Call Data - JSON === */
	// $.ajax({
	// url : "./data/elaboratedDSF.json",
	// dataType : 'json',
	// async : false,
	// success : function(json) {
	// New Root
	// partitionNodesTree = {id: -2, type: "root", parent: null,
	// children: []};

	var partitionLayoutData = JSON.parse(JSON.stringify(visualizationData));

	partitionLayoutData.decisionTree.type = "decRoot";
	// partitionNodesTree.children.push(json.decisionTree);
	partitionNodesTree = partitionLayoutData.decisionTree;
	// }
	// });

	/* === Partition Vars === */
	var partSVGWidth = SVGWidth;
	var partSVGHeight = SVGHeight;
	var partRadius = Math.min(partSVGWidth, partSVGHeight) / 2;

	var x = d3.scale.linear().range([ 0, 2 * Math.PI ]);
	var y = d3.scale.sqrt().range([ 0, partRadius ]);

	/* === Init SVG === */
	layoutSVG = d3.select("#" + visContentID).append("svg").attr("width",
			partSVGWidth).attr("height", partSVGHeight).append("g").attr(
			"transform",
			"translate(" + partSVGWidth / 2 + "," + partSVGHeight / 2 + ")");

	/* === Init Partition === */
	layoutPartition = d3.layout.partition().sort(null)
	// .size([2 * Math.PI, partRadius ])
	.value(function(d) {
		// @Metz set value to one to use the treemap for its purpose showing the
		// different amount / size of outcomes / decisions within decisions /
		// decisionPoints.
		return 1;// d.weight ? d.weight : 1;
	});
	layoutNodes = layoutPartition.nodes(partitionNodesTree);

	/* === Nodes / Links === */
	var partitionVisLabel = "Decision Tree Visualization";
	var partitionVisLabelInfo = "This representation shows the hierarchical structure of decision points, decisions, and outcomes of the CloudDSF visualized by a partition layout.";
	setVisLabel(partitionVisLabel, partitionVisLabelInfo);

	/* === Partition Arc === */
	var arc = d3.svg.arc().startAngle(function(d) {
		return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
	}).endAngle(function(d) {
		return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
	}).innerRadius(function(d) {
		return Math.max(0, y(d.y));
	}).outerRadius(function(d) {
		return Math.max(0, y(d.y + d.dy));
	});

	/* === Append Partition Elements + Functions === */
	var partitionPath = layoutSVG.selectAll(".partitionPath").data(layoutNodes)
			.enter().append("svg:g").attr("id", function(d, i) {
				return "n-" + d.id;
			}).attr("class", function(d, i) {
				return "gPartPath";
			}).on("click", function(d) {
				clickArc(d);
				mouseNodeClickPartition(d);
			});

	partitionPath.append("svg:path").attr("id", function(d) {
		return "path-" + d.id;
	}).attr("d", arc).attr("class", function(d) {
		if ("decisionPoint" == d.type) {
			return "decisionPoint" + d.id.toString()[0] + " partitionPath";
		} else if ("decision" == d.type) {
			return "decision" + d.id.toString()[0] + " partitionPath";
		} else if ("outcome" == d.type) {
			return "outcome" + d.id.toString()[0] + " partitionPath";
		} else if ("task" == d.type) {
			return "partitionTask partitionPath";
		} else if ("decRoot" == d.type) {
			return "partitionDecRoot partitionPath";
		} else if ("taskRoot" == d.type) {
			return "partitionTaskRoot partitionPath";
		} else {
			return "partitionPath";
		}
	});

	// DecisionPoints Path Text
	var partitionDPLabels = partDPLabels();

	function partDPLabels() {

		return partitionPath.filter(function(d) {
			return "decisionPoint" == d.type;
		}).append("svg:g").append("svg:text").attr("dx", 25).attr("dy", 50)
				.attr("class", "initDPText").append("svg:textPath").attr(
						"xlink:href", function(d) {
							return "#path-" + d.id;
						}).attr("class", "pathTextDP").text(function(d) {
					return d.id == 3 ? "Multi-Tenancy" : d.label;
				});

	}

	// Decision Text

	var partitionLabels = partLabels();

	function partLabels() {
		var i = -3.75;
		return layoutSVG
				.selectAll(".partitionLabel")
				.data(layoutNodes.filter(function(d) {
					return "decision" == d.type;
				}))
				.enter()
				.append("svg:g")
				.attr(
						"transform",
						function(d) {
							return "rotate(" + ((i++ / 17) * 360)
									+ ")translate(" + y(d.y) + ")";
						})
				.append("foreignObject")
				.attr(
						"transform",
						function(d) {
							return d.id.toString()[0] == 4
									|| d.id.toString()[0] == 3 ? "rotate(180)"
									: null;
						})
				.attr("width", 90)
				.attr("height", 60)
				.attr("dx", "30px")
				.attr(
						"x",
						function(d) {
							return d.id.toString()[0] == 4
									|| d.id.toString()[0] == 3 ? "-100px"
									: "10px";
						})
				.attr("dy", "-30px")
				.attr("y", "-30px")
				.append("xhtml:div")
				.attr("width", "100%")
				.attr("height", "100%")
				.append("xhtml:p")
				.attr(
						"class",
						function(d) {
							return d.id.toString()[0] == 4
									|| d.id.toString()[0] == 3 ? "pathTextDecTurn"
									: "pathTextDec";
						}).html(function(d, i) {
					return d.label;
				}).on("click", function(d) {
					clickArc(d);
					mouseNodeClickPartition(d);
				});

	}

	var text = partitionPath.append("text").attr("class", "pathTextDec").attr(
			"transform", function(d) {
				return "rotate(" + computeTextRotation(d) + ")";
			}).attr("x", function(d) {
		return y(d.y);
	}).attr("dx", "6") // margin
	.attr("dy", ".35em") // vertical-align
	.attr("opacity", 0).text(function(d) {
		return d.label;
	});

	function computeTextRotation(d) {
		return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
	}

	function clickArc(d) {

		if ("outcome" != d.type) {

			text.transition().attr("opacity", 0);

			if (partitionLabels != null)
				partitionLabels.remove();
			partitionLabels = null;
			if (partitionDPLabels != null)
				partitionDPLabels.remove();
			partitionDPLabels = null;

			layoutSVG
					.selectAll("path")
					.transition()
					.duration(750)
					.attrTween("d", arcTween(d))
					.each(
							"end",
							function(e, i) {
								// check if the animated element's data e lies
								// within the visible angle span given in d
								if (e.x >= d.x && e.x < (d.x + d.dx)) {
									// get a selection of the associated text
									// element
									var arcText = d3.select(this.parentNode)
											.select(".pathTextDec");
									if ("decisionPoint" == e.type)
										// console.log("DP");
										// fade in the text element and
										// recalculate
										// positions
										arcText
												.transition()
												.duration(250)
												.attr(
														"opacity",
														function(od) {
															return ("outcome" == od.type && "decision" != d.type)
																	|| "decRoot" == d.type ? 0
																	: 1;
														})
												.attr(
														"transform",
														function() {
															return "rotate("
																	+ computeTextRotation(e)
																	+ ")";
														}).attr("x",
														function(d) {
															return y(d.y);
														});
								}

								if ("decRoot" == d.type
										&& partitionLabels == null)
									partitionLabels = partLabels();
								if ("decRoot" == d.type
										&& partitionDPLabels == null)
									partitionDPLabels = partDPLabels();

							});
		}

	}

	// Interpolate the scales!
	function arcTween(d) {

		var xd = d3.interpolate(x.domain(), [ d.x, d.x + d.dx ]), yd = d3
				.interpolate(y.domain(), [ d.y, 1 ]), yr = d3.interpolate(y
				.range(), [ d.y ? 20 : 0, partRadius ]);
		return function(d, i) {
			return i ? function(t) {
				return arc(d);
			} : function(t) {
				x.domain(xd(t));
				y.domain(yd(t)).range(yr(t));
				return arc(d);
			};
		};
	}
}

// function updatePartitionLayout() {}
function clearPartitionLayout() {
	// Clear variables used by the partition layout
	$("svg").remove();
	layoutPartition = null;
	layoutNodes = null;
	layoutSVG = null;

	clearVisRightContent();
	hideInfoLabel();
}

function setPartitionDefaultInformation() {

	var defaultInformation = $('<div>')
			.attr("class", "visInfoBOX")
			.append(
					$('<p>')
							// .attr("class", "defaultInformation")
							.text(
									"Click on an arcs to zoom in the specific element. Click on the center circle to zoom out."))

			.append(
					$('<p>')
							// .attr("class", "defaultInformation")
							.text(
									"This panel then shows detailed information about the selected element."));
	$('#visRightContent').append(defaultInformation);

}
function setPartitionSettings() {

	var information = $('<div>')
			.attr("class", "visInfoBOX")
			.append(
					$('<div>')
							.attr("class", "visInfoHeaderBOX")
							.append($('<h4>').text("Information"))
							.append(
									$('<div>')
											.attr("class",
													"visInfoHeaderToogle")
											.append(
													$('<a>')
															.attr("href", "#")
															.attr("class",
																	"visInfoHeaderToogleLink")
															.append(
																	$('<span>')
																			.attr(
																					"class",
																					"glyphicon glyphicon-minus"))))
							.append($('<div>').attr("class", "clearfix")))

			.append(
					$('<div>')
							.attr("class", "visInfoContentBOX")

							.append(
									$('<div>')
											.attr("class",
													"input-group input-group-sm visInputBox")
											.append(
													$('<span>')
															.attr("class",
																	"input-group-addon")
															.append(
																	$('<input>')
																			.attr(
																					"type",
																					"checkbox")
																			.attr(
																					"name",
																					"showLabels")
																			.attr(
																					"id",
																					"showLabels")
																			.attr(
																					"checked",
																					function() {
																						return layoutPartitionDefaultSettings["showLabels"];
																					})))
											.append(
													$('<span>')
															.attr("class",
																	"form-control")
															.text("Show Labels"))));

	$('#visPanelSettingsContent').prepend(information);

	// Register Events
	$('.visInfoHeaderToogleLink').click(function() {
		visInfoHeaderToogle($(this));
	});

	$('#showLabels').change(
			function() {
				if ($(this).prop("checked")) {
					$('.pathTextDP, .pathTextDecTurn, .pathTextDec').css(
							"display", "block");
				} else {
					$('.pathTextDP, .pathTextDecTurn, .pathTextDec').css(
							"display", "none");
				}
			});

}
function mouseNodeClickPartition(n) {

	// Exiting node Catch
	if ((!n.children && !"outome" == n.type) || "root" == n.type
			|| "decRoot" == n.type) {
		clearVisRightContent();
		hideInfoLabel();
		setPartitionDefaultInformation();
		return;
	}

	// Set Info Label
	setInfoLabel(n);

	// Clear rest of content
	clearVisRightContent();

	// Set Node Information
	if ("decisionPoint" == n.type) {

		var dpNodeInfosUL = $('<ul>').attr("class", "visInfoRelatedNodesUL");

		$.each(n.children, function(i, v) {

			dpNodeInfosUL.append($('<li>').append(
					$('<span>').attr("class", function() {
						return "bordercolorDecision" + v.id.toString()[0];
					}).text(v.label)));

		});

		var nodeInfos = $('<div>').attr("class", "visInfoBOX").append(
				$('<div>').attr("class", "visInfoHeaderBOX").append(
						$('<h4>').text("Decisions")).append(
						$('<div>').attr("class", "visInfoHeaderToogle").append(
								$('<a>').attr("href", "#").attr("class",
										"visInfoHeaderToogleLink").append(
										$('<span>').attr("class",
												"glyphicon glyphicon-minus"))))
						.append($('<div>').attr("class", "clearfix")))

		.append(
				$('<div>').attr("class", "visInfoContentBOX").append(
						dpNodeInfosUL));
		$('#visRightContent').append(nodeInfos);

	} else if ("decision" == n.type) {
		// Node Info
		var nodeInfos = $('<div>')
				.attr("class", "visInfoBOX")
				.append(
						$('<div>')
								.attr("class", "visInfoHeaderBOX")
								.append($('<h4>').text("Node Details"))
								.append(
										$('<div>')
												.attr("class",
														"visInfoHeaderToogle")
												.append(
														$('<a>')
																.attr("href",
																		"#")
																.attr("class",
																		"visInfoHeaderToogleLink")
																.append(
																		$(
																				'<span>')
																				.attr(
																						"class",
																						"glyphicon glyphicon-minus"))))
								.append($('<div>').attr("class", "clearfix")))

				.append(
						$('<div>')
								.attr("class", "visInfoContentBOX")
								.append(
										$('<ul>')
												.attr("class",
														"visInfoNodeInformationUL")
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Decision Point:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.label)))
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Classification:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.classification)))));
		$('#visRightContent').append(nodeInfos);

		// Outcomes
		var decOutcomeUL = $('<ul>').attr("class", "visInfoRelatedNodesUL");

		$.each(n.children, function(i, v) {

			decOutcomeUL.append($('<li>').append(
					$('<span>').attr("class", function() {
						return "bordercolorOutcome" + v.id.toString()[0];
					}).text(v.label)));

		});

		var decOutcomeInfos = $('<div>').attr("class", "visInfoBOX").append(
				$('<div>').attr("class", "visInfoHeaderBOX").append(
						$('<h4>').text("Possible Outcomes")).append(
						$('<div>').attr("class", "visInfoHeaderToogle").append(
								$('<a>').attr("href", "#").attr("class",
										"visInfoHeaderToogleLink").append(
										$('<span>').attr("class",
												"glyphicon glyphicon-minus"))))
						.append($('<div>').attr("class", "clearfix")))

		.append(
				$('<div>').attr("class", "visInfoContentBOX").append(
						decOutcomeUL));
		$('#visRightContent').append(decOutcomeInfos);

	} else if ("outcome" == n.type) {

		// Node Info
		var nodeInfos = $('<div>')
				.attr("class", "visInfoBOX")
				.append(
						$('<div>')
								.attr("class", "visInfoHeaderBOX")
								.append($('<h4>').text("Node Details"))
								.append(
										$('<div>')
												.attr("class",
														"visInfoHeaderToogle")
												.append(
														$('<a>')
																.attr("href",
																		"#")
																.attr("class",
																		"visInfoHeaderToogleLink")
																.append(
																		$(
																				'<span>')
																				.attr(
																						"class",
																						"glyphicon glyphicon-minus"))))
								.append($('<div>').attr("class", "clearfix")))

				.append(
						$('<div>')
								.attr("class", "visInfoContentBOX")
								.append(
										$('<ul>')
												.attr("class",
														"visInfoNodeInformationUL")
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Decision:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.label)))));
		$('#visRightContent').append(nodeInfos);

	}

	// Register Toogle
	$('.visInfoHeaderToogleLink').click(function() {
		visInfoHeaderToogle($(this));
	});

}

/* Tree Layout */
/* ========================================= */
function drawTreeLayout() {

	/* === Set default information === */
	setTreeDefaultInformation();

	/* === Partition Vars === */
	var treeSVGWidth = SVGWidth;
	var treeSVGHeight = SVGHeight;

	/* === Init Tree === */
	layoutTree = d3.layout.tree().size([ treeSVGWidth, treeSVGHeight ]);

	var diagonal = d3.svg.diagonal().projection(function(d) {
		return [ d.y, d.x ];
	});

	/* === Nodes / Links === */
	var treeVisLabel = "Decision Tree Visualization";
	var treeVisLabelInfo = "This representation shows the hierarchical structure of decision points, decisions, and outcomes of the CloudDSF visualized by a tree layout.";
	setVisLabel(treeVisLabel, treeVisLabelInfo);

	/* === Init SVG === */
	layoutSVG = d3.select("#" + visContentID).append("svg").attr("width",
			treeSVGWidth).attr("height", treeSVGHeight);

	/* === Call Data - JSON === */
	// $.ajax({
	// url : "./data/elaboratedDSF.json",
	// dataType : 'json',
	// async : false,
	// success : function(json) {
	var treeLayoutData = JSON.parse(JSON.stringify(visualizationData));

	treeNodesTree = treeLayoutData.decisionTree;
	// }
	// });

	/* === Adjust positioning === */
	treeNodesTree.x0 = treeSVGWidth / 2;
	treeNodesTree.y0 = 0;

	/* === ToggleAll === */
	function toggleAll(d) {
		if (d.children) {
			d.children.forEach(toggleAll);
			toggle(d);
		}
	}

	/* === Toogle === */
	function toggle(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
	}

	/* === Initial settings === */
	// Don't show all nodes
	treeNodesTree.children.forEach(toggleAll);
	// Shown nodes
	// toggle(treeNodesTree.children[0]);

	/* === Update === */
	update(treeNodesTree);

	/* === Function Update === */
	function update(source) {
		var duration = d3.event && d3.event.altKey ? 5000 : 500;

		// Compute the new tree layout.
		var nodes = layoutTree.nodes(treeNodesTree).reverse();

		// Normalize for fixed-depth.
		var nodeWith = treeSVGWidth / 3.25;
		nodes.forEach(function(d) {
			if ("outcome" == d.type) {
				d.y = d.depth * nodeWith * 0.8;
			} else {
				d.y = d.depth * nodeWith;
			}
		});

		// Update the nodes…
		var node = layoutSVG.selectAll(".treeNode").data(nodes, function(d) {
			return d.id;
		});

		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("svg:g").attr("class", "treeNode")
				.attr("transform", function(d) {
					return "translate(" + source.y0 + "," + source.x0 + ")";
				}).on("click", function(d) {
					toggle(d);
					update(d);
					mouseNodeClickTree(d);
				});

		nodeEnter.append("svg:circle").attr("r", 10).attr("class", function(d) {
			if (d._children) {
				// Collapsed
				if ("decisionPoint" == d.type) {
					return "treeDP" + d.id.toString()[0] + "Collapsed";
				} else if ("decision" == d.type) {
					return "treeDec" + d.id.toString()[0] + "Collapsed";
				} else if ("outcome" == d.type) {
					return "treeOut" + d.id.toString()[0];
				} else {
					return "treeRootCollapsed";
				}
			} else {
				// Expanded
				if ("decisionPoint" == d.type) {
					return "treeDP" + d.id.toString()[0] + "Expanded";
				} else if ("decision" == d.type) {
					return "treeDec" + d.id.toString()[0] + "Expanded";
				} else if ("outcome" == d.type) {
					return "treeOut" + d.id.toString()[0];
				} else {
					return "treeRootExpanded";
				}
			}
		});

		// Appending text elements
		nodeEnter.append("foreignObject").attr("width", 185).attr("height",
				function(d) {
					return d.label.length < 25 ? 20 : 40;
				}).attr("x", function(d) {
			return d.children || d._children ? -200 : 20;
		}).attr("y", function(d) {
			return d.label.length < 25 ? "-9px" : "-18px";
		}).attr("text-anchor", function(d) {
			return d.children || d._children ? "end" : "start";
		}).append("xhtml:div").attr("width", "100%").attr("height", "100%")
				.attr(
						"class",
						function(d) {
							return "outcome" != d.type ? "treeTextDIV"
									: "treeOutTextDIV";
						}).append("xhtml:p").html(function(d, i) {
					return d.label;
				});

		// Transition nodes to their new position.
		var nodeUpdate = node.transition().duration(duration).attr("transform",
				function(d) {
					return "translate(" + d.y + "," + d.x + ")";
				});

		nodeUpdate.select("circle").attr("r", 10).attr("class", function(d) {
			if (d._children) {
				// Collapsed
				if ("decisionPoint" == d.type) {
					return "treeDP" + d.id.toString()[0] + "Collapsed";
				} else if ("decision" == d.type) {
					return "treeDec" + d.id.toString()[0] + "Collapsed";
				} else if ("outcome" == d.type) {
					return "treeOut" + d.id.toString()[0];
				} else {
					return "treeRootCollapsed";
				}
			} else {
				// Expanded
				if ("decisionPoint" == d.type) {
					return "treeDP" + d.id.toString()[0] + "Expanded";
				} else if ("decision" == d.type) {
					return "treeDec" + d.id.toString()[0] + "Expanded";
				} else if ("outcome" == d.type) {
					return "treeOut" + d.id.toString()[0];
				} else {
					return "treeRootExpanded";
				}
			}
		});

		nodeUpdate.select("div").style("opacity", 1);

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition().duration(duration).attr(
				"transform", function(d) {
					return "translate(" + source.y + "," + source.x + ")";
				}).remove();

		nodeExit.select("circle").attr("r", 0);

		nodeExit.select("div").style("opacity", 0);

		// Update the links…
		var link = layoutSVG.selectAll("path.treeLink").data(
				layoutTree.links(nodes), function(d) {
					return d.target.id;
				});

		// Enter any new links at the parent's previous position.
		link.enter().insert("svg:path", "g").attr("class", "treeLink").attr(
				"d", function(d) {
					var o = {
						x : source.x0,
						y : source.y0
					};
					return diagonal({
						source : o,
						target : o
					});
				}).transition().duration(duration).attr("d", diagonal);

		// Transition links to their new position.
		link.transition().duration(duration).attr("d", diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition().duration(duration).attr("d", function(d) {
			var o = {
				x : source.x,
				y : source.y
			};
			return diagonal({
				source : o,
				target : o
			});
		}).remove();

		// Stash the old positions for transition.
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}

}
// function updateTreeLayout() {}
function clearTreeLayout() {
	// Clear variables used by the partition layout
	$("svg").remove();
	layoutTree = null;
	layoutSVG = null;

	clearVisRightContent();
	hideInfoLabel();
}
function setTreeDefaultInformation() {

	var defaultInformation = $('<div>')
			.attr("class", "visInfoBOX")
			.append(
					$('<p>')
							// .attr("class", "defaultInformation")
							.text(
									"Click on a node to either expand or collapse its sub-nodes."))

			.append(
					$('<p>')
							// .attr("class", "defaultInformation")
							.text(
									"This panel then shows detailed information about the selected element."));
	$('#visRightContent').append(defaultInformation);

}
function setTreeSettings() {

	var information = $('<div>')
			.attr("class", "visInfoBOX")
			.append(
					$('<div>')
							.attr("class", "visInfoHeaderBOX")
							.append($('<h4>').text("Information"))
							.append(
									$('<div>')
											.attr("class",
													"visInfoHeaderToogle")
											.append(
													$('<a>')
															.attr("href", "#")
															.attr("class",
																	"visInfoHeaderToogleLink")
															.append(
																	$('<span>')
																			.attr(
																					"class",
																					"glyphicon glyphicon-minus"))))
							.append($('<div>').attr("class", "clearfix")))

			.append(
					$('<div>')
							.attr("class", "visInfoContentBOX")

							.append(
									$('<div>')
											.attr("class",
													"input-group input-group-sm visInputBox")
											.append(
													$('<span>')
															.attr("class",
																	"input-group-addon")
															.append(
																	$('<input>')
																			.attr(
																					"type",
																					"checkbox")
																			.attr(
																					"name",
																					"showLabels")
																			.attr(
																					"id",
																					"showLabels")
																			.attr(
																					"checked",
																					function() {
																						return layoutTreeDefaultSettings["showLabels"];
																					})))
											.append(
													$('<span>')
															.attr("class",
																	"form-control")
															.text("Show Labels"))));

	$('#visPanelSettingsContent').prepend(information);

	// Register Events
	$('.visInfoHeaderToogleLink').click(function() {
		visInfoHeaderToogle($(this));
	});

	$('#showLabels').change(function() {
		if ($(this).prop("checked")) {
			$('.treeTextDIV, .treeOutTextDIV').css("display", "block");
		} else {
			$('.treeTextDIV, .treeOutTextDIV').css("display", "none");
		}
	});

}

function mouseNodeClickTree(n) {

	// Exiting node Catch
	if ((!n.children && !"outome" == n.type) || "root" == n.type) {
		clearVisRightContent();
		hideInfoLabel();
		setTreeDefaultInformation();
		return;
	}

	// Set Info Label
	setInfoLabel(n);

	// Clear rest of content
	clearVisRightContent();

	// Set Node Information
	if ("decisionPoint" == n.type) {

		var dpNodeInfosUL = $('<ul>').attr("class", "visInfoRelatedNodesUL");

		$.each(n.children, function(i, v) {

			dpNodeInfosUL.append($('<li>').append(
					$('<span>').attr("class", function() {
						return "bordercolorDecision" + v.id.toString()[0];
					}).text(v.label)));

		});

		var nodeInfos = $('<div>').attr("class", "visInfoBOX").append(
				$('<div>').attr("class", "visInfoHeaderBOX").append(
						$('<h4>').text("Decisions")).append(
						$('<div>').attr("class", "visInfoHeaderToogle").append(
								$('<a>').attr("href", "#").attr("class",
										"visInfoHeaderToogleLink").append(
										$('<span>').attr("class",
												"glyphicon glyphicon-minus"))))
						.append($('<div>').attr("class", "clearfix")))

		.append(
				$('<div>').attr("class", "visInfoContentBOX").append(
						dpNodeInfosUL));
		$('#visRightContent').append(nodeInfos);

	} else if ("decision" == n.type) {
		// Node Info
		var nodeInfos = $('<div>')
				.attr("class", "visInfoBOX")
				.append(
						$('<div>')
								.attr("class", "visInfoHeaderBOX")
								.append($('<h4>').text("Node Details"))
								.append(
										$('<div>')
												.attr("class",
														"visInfoHeaderToogle")
												.append(
														$('<a>')
																.attr("href",
																		"#")
																.attr("class",
																		"visInfoHeaderToogleLink")
																.append(
																		$(
																				'<span>')
																				.attr(
																						"class",
																						"glyphicon glyphicon-minus"))))
								.append($('<div>').attr("class", "clearfix")))

				.append(
						$('<div>')
								.attr("class", "visInfoContentBOX")
								.append(
										$('<ul>')
												.attr("class",
														"visInfoNodeInformationUL")
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Decision Point:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.label)))
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Classification:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.classification)))));
		$('#visRightContent').append(nodeInfos);

		// Outcomes
		var decOutcomeUL = $('<ul>').attr("class", "visInfoRelatedNodesUL");

		$.each(n.children, function(i, v) {

			decOutcomeUL.append($('<li>').append(
					$('<span>').attr("class", function() {
						return "bordercolorOutcome" + v.id.toString()[0];
					}).text(v.label)));

		});

		var decOutcomeInfos = $('<div>').attr("class", "visInfoBOX").append(
				$('<div>').attr("class", "visInfoHeaderBOX").append(
						$('<h4>').text("Possible Outcomes")).append(
						$('<div>').attr("class", "visInfoHeaderToogle").append(
								$('<a>').attr("href", "#").attr("class",
										"visInfoHeaderToogleLink").append(
										$('<span>').attr("class",
												"glyphicon glyphicon-minus"))))
						.append($('<div>').attr("class", "clearfix")))

		.append(
				$('<div>').attr("class", "visInfoContentBOX").append(
						decOutcomeUL));
		$('#visRightContent').append(decOutcomeInfos);

	} else if ("outcome" == n.type) {

		// Node Info
		var nodeInfos = $('<div>')
				.attr("class", "visInfoBOX")
				.append(
						$('<div>')
								.attr("class", "visInfoHeaderBOX")
								.append($('<h4>').text("Node Details"))
								.append(
										$('<div>')
												.attr("class",
														"visInfoHeaderToogle")
												.append(
														$('<a>')
																.attr("href",
																		"#")
																.attr("class",
																		"visInfoHeaderToogleLink")
																.append(
																		$(
																				'<span>')
																				.attr(
																						"class",
																						"glyphicon glyphicon-minus"))))
								.append($('<div>').attr("class", "clearfix")))

				.append(
						$('<div>')
								.attr("class", "visInfoContentBOX")
								.append(
										$('<ul>')
												.attr("class",
														"visInfoNodeInformationUL")
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Decision:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.label)))));
		$('#visRightContent').append(nodeInfos);

	}

	// Register Toogle
	$('.visInfoHeaderToogleLink').click(function() {
		visInfoHeaderToogle($(this));
	});

}

/* Cluster Layout */
/* ========================================= */
function drawClusterLayout() {

	/* === Set default information === */
	setClusterDefaultInformation();

	/* === Call Data - JSON === */
	// $.ajax({
	// url : "./data/elaboratedDSF.json",
	// dataType : 'json',
	// async : false,
	// success : function(json) {
	// New Root
	clusterNodesTree = {
		id : -2,
		type : "root",
		parent : null,
		children : []
	};
	var clusterLayoutData = JSON.parse(JSON.stringify(visualizationData));
	clusterLayoutData.taskTree.type = "taskRoot";
	clusterNodesTree.children.push(clusterLayoutData.taskTree);
	// @Metz Node tree with normal decision Tree to avoid duplicate in
	// json file. child accessor function has been adapted (see below).
	clusterNodesTree.children = clusterNodesTree.children
			.concat(clusterLayoutData.decisionTree.children);
	clusterLinks = clusterLayoutData.linksArray;
	// }
	// });

	/* === Cluster Vars === */
	var clusterSVGWidth = SVGWidth;
	var clusterSVGHeight = SVGHeight;
	var clusterRX = clusterSVGWidth / 2;
	var clusterRY = clusterSVGHeight / 2;
	var clusterM0;
	var clusterRotate = 0;

	/* === Init Cluster / Bundle === */
	// Accessor function only return children down to decisions (no outcomes)
	layoutCluster = d3.layout.cluster().size([ 360, clusterRY * 0.85 - 150 ])
			.children(function(d) {
				if (d.type == "decisionPoint")
					return d.children;
				if (d.type == "taskRoot")
					return d.children;
				if (d.type == "root")
					return d.children;
			});

	layoutBundle = d3.layout.bundle();

	/* === Lines === */
	var line = d3.svg.line.radial().interpolate("bundle").tension(.5).radius(
			function(d) {
				return d.y;
			}).angle(function(d) {
		return d.x / 180 * Math.PI;
	});

	/* === Init SVG === */
	layoutSVG = d3.select("#" + visContentID).style(
			"-webkit-backface-visibility", "hidden").append("svg").attr(
			"width", clusterSVGWidth).attr("height", clusterSVGHeight).append(
			"g").attr("transform",
			"translate(" + clusterRX + "," + clusterRY + ")");

	/* === Nodes / Links === */
	var nodes = layoutCluster.nodes(clusterNodesTree);
	var pathNodes = nodes.filter(function(d) {
		return ("decision" == d.type || "task" == d.type);
	});
	var links = nodedLinksArray(clusterLinks, pathNodes);
	var splines = layoutBundle(links);

	/* === Nodes / Links === */
	var clusterVisLabel = "Network Visualization";
	var clusterVisLabelInfo = "This representation shows the network structure of how decisions influence to each other and how decisions and tasks are affecting each other within the CloudDSF.";
	setVisLabel(clusterVisLabel, clusterVisLabelInfo);
	setClusterLegend();

	/* === Paths === */
	var path = layoutSVG.selectAll("path.clusterLink").data(links).enter()
			.append("svg:path").attr(
					"class",
					function(d) {
						return "clusterLink source-" + d.source.id + " target-"
								+ d.target.id;
					}).attr("d", function(d, i) {
				return line(splines[i]);
			});

	/* === Texts === */
	var textNodes = layoutSVG.selectAll("g.clusterNode").data(pathNodes)
			.enter().append("svg:g").attr("id", function(d, i) {
				return "n-" + d.id;
			}).attr("class", function(d) {
				if ("decision" == d.type) {
					return "clusterNode decision" + d.id.toString()[0];
				} else if ("task" == d.type) {
					return "clusterNode clusterTaskText";
				} else {
					return "clusterNode";
				}
			}).attr("transform", function(d) {
				return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
			}).append("svg:text").attr("dx", function(d) {
				return d.x < 180 ? 38 : -38;
			}).attr("dy", ".31em").attr("text-anchor", function(d) {
				return d.x < 180 ? "start" : "end";
			}).attr("transform", function(d) {
				return d.x < 180 ? null : "rotate(180)";
			}).text(function(d) {
				return d.label;
			}).on("mouseover", clusterMouseover)
			.on("mouseout", clusterMouseout).on("click", mouseNodeClickCluster);

	/* === Arc Blueprint === */
	var arc = d3.svg.arc().innerRadius(clusterRY * 0.85 - 150).outerRadius(
			clusterRY * 0.85 - 120);

	/* === Decision Points - Groups === */
	var decisionPoints = nodes.filter(function(d) {
		return ("decisionPoint" == d.type || "taskRoot" == d.type);
	});

	var clusterGroups = layoutSVG.selectAll("g.clusterGroup").data(
			decisionPoints).enter().append("svg:g").attr("class",
			"clusterGroup");

	clusterGroups
			.append("svg:path")
			.attr("id", function(d) {
				return "n-" + d.id;
			})
			.attr(
					"class",
					function(d) {
						return "decisionPoint" == d.type ? "clusterGroupPath decisionPoint"
								+ d.id.toString()[0]
								: "clusterGroupPath task";
					}).attr("d", function(d) {

				var startAngle = 361;
				var endAngle = 0;

				pathNodes.forEach(function(j) {
					if (j.id.toString()[0] == d.id.toString()[0]) {
						startAngle = Math.min(startAngle, j.x);
						endAngle = Math.max(endAngle, j.x);
					}
				});

				d.startAngle = (startAngle - 1) * (Math.PI / 180);
				d.endAngle = (endAngle + 1) * (Math.PI / 180);
				return arc(d);

			});
	clusterGroups.append("svg:text").attr("dx", 10).attr("dy", 20).append(
			"svg:textPath").attr("class", function(d) {
		return "taskRoot" == d.type ? null : "clusterGroupDPText";
	}).attr("xlink:href", function(d) {
		return "#n-" + d.id;
	}).text(function(d) {
		return d.id == 3 ? "MT" : d.label;
	});

	/* === Cluster Functions === */
	function clusterMouseover(d) {

		layoutSVG.selectAll(
				"path.clusterLink.source-" + d.id
						+ ", path.clusterLink.target-" + d.id).classed(
				"clusterInfluenceLink", function(d) {
					return "DecRel" == d.type ? true : null;
				}).classed("clusterAffectationLink", function(d) {
			return "taskRel" == d.type ? true : null;
		});
	}

	function clusterMouseout(d) {

		layoutSVG.selectAll(
				"path.clusterLink.source-" + d.id
						+ ", path.clusterLink.target-" + d.id).classed(
				"clusterInfluenceLink", false).classed(
				"clusterAffectationLink", false);
	}

	function setClusterLegend() {

		var legendItems = $('<div>').attr("id", "layoutLegend");

		legendItems.append($('<span>').attr("class", "legendItem small")
				.append(
						$('<img>')
								.attr("src", "./img/legends/cluster-line.png"))
				.append($('<span>').text("Influence / Affects Link")));
		legendItems
				.append($('<span>')
						.attr("class", "legendItem small")
						.append(
								$('<img>')
										.attr("src",
												"./img/legends/cluster-lineAffectHighlight.png"))
						.append($('<span>').text("Highlighted Affects Link")));
		legendItems
				.append($('<span>')
						.attr("class", "legendItem small")
						.append(
								$('<img>')
										.attr("src",
												"./img/legends/cluster-lineInfluenceHighlight.png"))
						.append($('<span>').text("Highlighted Influence Link")));
		// $('#visContentDIV').append(legendItems);
		$('#visContent').append(legendItems);
	}
}

// function updateClusterLayout() {}
function clearClusterLayout() {
	// Clear variables used by the partition layout
	$("svg").remove();
	layoutCluster = null;
	layoutBundle = null;
	layoutSVG = null;

	clearVisRightContent();
	hideInfoLabel();
	removeLegend();
}

function setClusterDefaultInformation() {

	var defaultInformation = $('<div>')
			.attr("class", "visInfoBOX")
			.append(
					$('<p>')
							// .attr("class", "defaultInformation")
							.text(
									"Hover over a text label to highlight the elements relationships. Click on one or more text labels to either select or deselect it and its relationships."))

			.append(
					$('<p>')
							// .attr("class", "defaultInformation")
							.text(
									"This panel then shows detailed information about the selected element."));
	$('#visRightContent').append(defaultInformation);

}

function setClusterSettings() {

	var clearHighlight = $('<div>').attr("class", "visInfoBOX").append(
			$('<div>').attr("class", "visInfoHeaderBOX").append(
					$('<h4>').text("Clear Highlights")).append(
					$('<div>').attr("class", "visInfoHeaderToogle").append(
							$('<a>').attr("href", "#").attr("class",
									"visInfoHeaderToogleLink").append(
									$('<span>').attr("class",
											"glyphicon glyphicon-minus"))))
					.append($('<div>').attr("class", "clearfix")))

	.append(
			$('<div>').attr("class", "visInfoContentBOX")

			.append(
					$('<div>').attr("class", "visInputBox").append(
							$('<button>').attr("type", "button").attr("class",
									"btn btn-default btn-sm btn-block").attr(
									"id", "clearClusterHighlights").text(
									"Clear Highlights"))));

	$('#visPanelSettingsContent').prepend(clearHighlight);

	// Register Events
	$('#clearClusterHighlights').click(function() {
		clearClusterHighligths();
	});

	$('.visInfoHeaderToogleLink').click(function() {
		visInfoHeaderToogle($(this));
	});

}

function clearClusterHighligths() {
	// Clear all highlights in force layout
	layoutSVG
			.selectAll(
					'.noteHighlighted, .clusterHighlightedTextNode, .clusterAffectationLinkClick, .clusterInfluenceLinkClick')
			.classed("noteHighlighted", false).classed(
					"clusterHighlightedTextNode", false).classed(
					"clusterAffectationLinkClick", false).classed(
					"clusterInfluenceLinkClick", false);

	clearVisRightContent();
	hideInfoLabel();
}

function mouseNodeClickCluster(n) {

	// Set Info Label
	setInfoLabel(n);

	// Clear rest of content
	clearVisRightContent();

	// Set Node Information
	if ("decision" == n.type) {
		var nodeInfos = $('<div>')
				.attr("class", "visInfoBOX")
				.append(
						$('<div>')
								.attr("class", "visInfoHeaderBOX")
								.append($('<h4>').text("Node Details"))
								.append(
										$('<div>')
												.attr("class",
														"visInfoHeaderToogle")
												.append(
														$('<a>')
																.attr("href",
																		"#")
																.attr("class",
																		"visInfoHeaderToogleLink")
																.append(
																		$(
																				'<span>')
																				.attr(
																						"class",
																						"glyphicon glyphicon-minus"))))
								.append($('<div>').attr("class", "clearfix")))

				.append(
						$('<div>')
								.attr("class", "visInfoContentBOX")
								.append(
										$('<ul>')
												.attr("class",
														"visInfoNodeInformationUL")
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Decision Point:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.label)))
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Classification:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.classification)))));
		$('#visRightContent').append(nodeInfos);
	}

	// Set Tasks Relations

	var relatedTasks = layoutSVG.selectAll(
			"path.clusterLink.source-" + n.id + ", path.clusterLink.target-"
					+ n.id).filter(function(d) {
		return "task" == d.source.type || "task" == d.target.type;
	});

	var relatedTasksUL = $('<ul>').attr("class", "visInfoRelatedNodesUL");

	relatedTasks.each(function(d) {

		relatedTasksUL.append($('<li>').append(
				$('<span>').attr(
						"class",
						function() {

							if (d.source.id != n.id) {
								if ("task" == d.source.type)
									return "bordercolorTask";
								if ("decision" == d.source.type)
									return "bordercolorDecision"
											+ d.source.id.toString()[0];
							} else {
								if ("task" == d.target.type)
									return "bordercolorTask";
								if ("decision" == d.target.type)
									return "bordercolorDecision"
											+ d.target.id.toString()[0];
							}
						}).text(
						function() {
							return d.source.id != n.id ? d.source.label
									: d.target.label;
						}).append(
						$('<span>').attr("class", "affectDirection small")
								.text(function() {
									if ("auto" == d.dir) {
										if (d.source.id != n.id) {
											return "is affecting";
										} else {
											return "is affected";
										}
									} else if ("both" == d.dir) {
										return "is bidirectional affected";
									}
								}))));

	});

	var relatedLabel = "";
	if ("decision" == n.type)
		relatedLabel = "Related Tasks";
	if ("task" == n.type)
		relatedLabel = "Related Decisions";

	var relatedTasksInfoBOX = $('<div>').attr("class", "visInfoBOX").append(
			$('<div>').attr("class", "visInfoHeaderBOX").append(
					$('<h4>').text(relatedLabel)).append(
					$('<div>').attr("class", "visInfoHeaderToogle").append(
							$('<a>').attr("href", "#").attr("class",
									"visInfoHeaderToogleLink").append(
									$('<span>').attr("class",
											"glyphicon glyphicon-minus"))))
					.append($('<div>').attr("class", "clearfix")))

	.append(
			$('<div>').attr("class", "visInfoContentBOX")
					.append(relatedTasksUL));
	$('#visRightContent').append(relatedTasksInfoBOX);

	// Set Influence Relations
	if ("decision" == n.type) {

		// Influenced Decisions
		var influencedDecisions = layoutSVG.selectAll(
				"path.clusterLink.source-" + n.id).filter(function(d) {
			return "DecRel" == d.type;
		});

		var influencedDecisionsUL = $('<ul>').attr("class",
				"visInfoRelatedNodesUL");

		var show = false;
		influencedDecisions.each(function(d) {

			influencedDecisionsUL.append($('<li>').append(
					$('<span>').text(d.target.label).attr(
							"class",
							function() {
								return "bordercolorDecision"
										+ d.target.id.toString()[0];
							})));
			show = true;

		});

		if (show) {
			var influencedDecisionsInfos = $('<div>')
					.attr("class", "visInfoBOX")
					.append(
							$('<div>')
									.attr("class", "visInfoHeaderBOX")
									.append(
											$('<h4>').text(
													"Influenced Decisions"))
									.append(
											$('<div>')
													.attr("class",
															"visInfoHeaderToogle")
													.append(
															$('<a>')
																	.attr(
																			"href",
																			"#")
																	.attr(
																			"class",
																			"visInfoHeaderToogleLink")
																	.append(
																			$(
																					'<span>')
																					.attr(
																							"class",
																							"glyphicon glyphicon-minus"))))
									.append(
											$('<div>')
													.attr("class", "clearfix")))

					.append(
							$('<div>').attr("class", "visInfoContentBOX")
									.append(influencedDecisionsUL));
			$('#visRightContent').append(influencedDecisionsInfos);
		}

		// Influencing Decisions
		var testInfluencing = [];
		var influencingDecisions = layoutSVG.selectAll(
				"path.clusterLink.target-" + n.id).filter(function(d) {
			if ("DecRel" == d.type) {

				if (testInfluencing > 0) {
					if ($.inArray(d.source.id, testInfluencing) == -1) {
						testInfluencing.push(d.source.id);
						return true;
					} else {
						return false;
					}
				} else {
					testInfluencing.push(d.source.id);
					return true;
				}

			}
		});

		var influencingDecisionsUL = $('<ul>').attr("class",
				"visInfoRelatedNodesUL");

		var show = false;
		influencingDecisions.each(function(d) {

			influencingDecisionsUL.append($('<li>').append(
					$('<span>').text(d.source.label).attr(
							"class",
							function() {
								return "bordercolorDecision"
										+ d.source.id.toString()[0];
							})));
			show = true;
		});

		if (show) {
			var influencingDecisionsInfos = $('<div>')
					.attr("class", "visInfoBOX")
					.append(
							$('<div>')
									.attr("class", "visInfoHeaderBOX")
									.append(
											$('<h4>').text(
													"Influencing Decisions"))
									.append(
											$('<div>')
													.attr("class",
															"visInfoHeaderToogle")
													.append(
															$('<a>')
																	.attr(
																			"href",
																			"#")
																	.attr(
																			"class",
																			"visInfoHeaderToogleLink")
																	.append(
																			$(
																					'<span>')
																					.attr(
																							"class",
																							"glyphicon glyphicon-minus"))))
									.append(
											$('<div>')
													.attr("class", "clearfix")))

					.append(
							$('<div>').attr("class", "visInfoContentBOX")
									.append(influencingDecisionsUL));
			$('#visRightContent').append(influencingDecisionsInfos);
		}

	}

	// Register Toogle
	$('.visInfoHeaderToogleLink').click(function() {
		visInfoHeaderToogle($(this));
	});

	// Node Highlight
	if (layoutSVG.select("#n-" + n.id).classed("noteHighlighted")) {
		layoutSVG.select("#n-" + n.id).classed("noteHighlighted", false);
	} else {
		layoutSVG.select("#n-" + n.id).classed("noteHighlighted", true);
	}

	// Highlight Paths
	var selLinks = layoutSVG.selectAll(
			"path.clusterLink.source-" + n.id + ", path.clusterLink.target-"
					+ n.id).classed(
			"clusterInfluenceLinkClick",
			function(d) {
				return "DecRel" == d.type
						&& layoutSVG.select("#n-" + n.id).classed(
								"noteHighlighted") ? true : false;
			}).classed(
			"clusterAffectationLinkClick",
			function(d) {
				return "taskRel" == d.type
						&& layoutSVG.select("#n-" + n.id).classed(
								"noteHighlighted") ? true : false;
			});

	// Highlight Text
	layoutSVG.select("#n-" + n.id).select("text").classed(
			"clusterHighlightedTextNode",
			function(d) {
				return layoutSVG.select("#n-" + n.id)
						.classed("noteHighlighted") ? true : false;
			});
}

/* Force Layout */
/* ========================================= */
function drawForceLayout() {

	/* === Get layout settings === */
	var forceSettings = getAllSettings();

	/* === Set default information === */
	setForceDefaultInformation();

	/* === Call Data - JSON === */
	// $.ajax({
	// url : "./data/elaboratedDSF.json",
	// dataType : 'json',
	// async : false,
	// success : function(json) {
	// New Root
	forceNodesTree = {
		id : -2,
		type : "root",
		parent : null,
		children : []
	};

	var forceLayoutData = JSON.parse(JSON.stringify(visualizationData));
	forceLayoutData.decisionTree.type = "decRoot";
	forceNodesTree.children = forceNodesTree.children
			.concat(forceLayoutData.decisionTree.children);
	forceNodesTree.children = forceNodesTree.children
			.concat(forceLayoutData.taskTree.children);
	var helperC = d3.layout.cluster();
	forceNodesArray = helperC.nodes(forceNodesTree);

	forceNodesArray = forceNodesArray
			.filter(function(d) {
				return ("decisionPoint" == d.type || "decision" == d.type || "task" == d.type);
			});
	forceLinksArray = helperC.links(forceNodesArray);
	forceRelatedLinks = forceLayoutData.linksArray;
	forceRelatedLinks = nodedLinksArray(forceRelatedLinks, forceNodesArray);
	forceLinksArray = forceLinksArray.concat(forceRelatedLinks);
	// }
	// });

	/* === Force Vars === */
	var forceSVGWidth = SVGWidth;
	var forceSVGHeight = SVGHeight;
	var dpRectHeight = 35;
	var dpRectWidth = forceSVGWidth * 0.6;
	var decRecHeight = 70;
	var decRecWidth = forceSVGWidth * 0.1;
	var taskCircleRadius = 40;
	var recRadius = 15;

	/* === Init SVG === */
	layoutSVG = d3.select("#" + visContentID).append("svg").attr("width",
			forceSVGWidth).attr("height", forceSVGHeight);

	/* === Init Force === */
	layoutForce = d3.layout.force().size([ forceSVGWidth, forceSVGHeight ])
			.linkDistance(50).charge(-5000).gravity(1).on("tick", onTick);

	/* === Set VisLabel === */
	var forceVisLabel = "Network Visualization";
	var forceVisLabelInfo = "This representation shows the network structure of how decisions and tasks affect each other within the CloudDSF.";
	setVisLabel(forceVisLabel, forceVisLabelInfo);
	setForceLegend();

	/* === Set Nodes and Links === */
	layoutForce.nodes(forceNodesArray);
	layoutForce.links(forceLinksArray);
	layoutForce.start();
	var subDecCount = new Array();
	subDecCount[1] = layoutForce.nodes().filter(function(d) {
		return "decision" == d.type && d.id.toString()[0] == 1;
	}).length;
	subDecCount[2] = layoutForce.nodes().filter(function(d) {
		return "decision" == d.type && d.id.toString()[0] == 2;
	}).length;
	subDecCount[3] = layoutForce.nodes().filter(function(d) {
		return "decision" == d.type && d.id.toString()[0] == 3;
	}).length;
	subDecCount[4] = layoutForce.nodes().filter(function(d) {
		return "decision" == d.type && d.id.toString()[0] == 4;
	}).length;
	// TaskCount
	subDecCount[9] = layoutForce.nodes().filter(function(d) {
		return "task" == d.type;
	}).length;

	/* d3.svg.diagonal.radial Blueprint */
	var diagonal = d3.svg.diagonal.radial().projection(function(d) {
		return [ d.x, d.y ];
	});

	/* Define Marker */
	layoutSVG.append("defs").selectAll("marker").data(
			[ "influenceStart", "influenceEnd", "affectStartDec",
					"affectEndDec", "affectStartTask", "affectEndTask" ])
			.enter().append("marker").attr("id", function(d) {
				return d;
			}).attr("viewBox", "0 -5 10 10").attr("refX", function(d) {
				if (d.indexOf("Dec") != -1) {
					return 60;
				} else if (d.indexOf("StartTask") != -1) {
					return -44;
				} else if (d.indexOf("EndTask") != -1) {
					return 54;
				} else {
					return -50;
				}
			}).attr("refY", 0).attr("markerWidth", 9).attr("markerHeight", 9)
			.attr("orient", "auto").append("path").attr("class", function(d) {
				if (d.indexOf("influence") != -1) {
					return "influenceMarker";
				} else if (d.indexOf("affect") != -1) {
					return "affectMarker";
				}
			}).attr("d", function(d) {
				if (d.indexOf("Start") != -1) {
					return "M10,5 L0,0 L10,-5";
				} else if (d.indexOf("End") != -1) {
					return "M0,-5 L10,0 L0,5";
				}
			});

	/* === Append Path Links === */
	var pathLinksTaskRels = layoutSVG.append("g").selectAll(".forceLink").data(
			layoutForce.links().filter(function(d) {
				return "taskRel" == d.type;
			})).enter().append("svg:line").attr(
			"class",
			function(d) {
				return "forceLink forceLinkSource-" + d.source.id
						+ " forceLinkTarget-" + d.target.id;
			}).attr("id", function(d) {
		return "forceLink-" + d.source.id + "-" + d.target.id;
	}).attr("marker-start", function(d) {
		if ("both" == d.dir) {
			if ("decision" == d.source.type)
				return "url(#affectStartDec)";
			if ("task" == d.source.type)
				return "url(#affectStartTask)";
		} else {
			return null;
		}
	}).attr("marker-end", function(d) {
		if ("decision" == d.target.type)
			return "url(#affectEndDec)";
		if ("task" == d.target.type)
			return "url(#affectEndTask)";
	});

	var lineLinkHierarchy = layoutSVG.append("g").selectAll(".forceLineLink")
			.data(
					layoutForce.links().filter(
							function(d) {
								return !d.type && d.source.type != "outcome"
										&& d.target.type != "outcome";
							})).enter().append("svg:line").attr("class",
					"forceLineLink");

	/* === Append Nodes === */
	// All nodes
	var forceNodes = layoutSVG.selectAll(".forceNode");
	forceNodes = forceNodes.data(layoutForce.nodes()).enter().append("svg:g")
			.attr("id", function(d, i) {
				return "n-" + d.id;
			}).attr("class", function(d, i) {
				return "forceNode node " + d.type;
			}).call(layoutForce.drag).on("mouseover", mouseOverForce).on(
					"mouseout", mouseOutForce).on("click", mouseNodeClickForce);

	// Decision Point nodes
	var decisionPoints = forceNodes.filter(function(d) {
		return "decisionPoint" == d.type;
	});
	decisionPoints.append("svg:rect").attr("id", function(d, i) {
		return "dp-" + d.id;
	}).attr("class", function(d) {
		return "forceDecisionPoint decisionPoint" + d.id.toString()[0];
	}) // decisionPoint"+d.id.toString()[0]
	.attr("width", function(d) {
		return (d.id % 2) == 0 ? dpRectHeight : dpRectWidth;
	}).attr("height", function(d) {
		return (d.id % 2) == 0 ? dpRectWidth : dpRectHeight;
	}).attr("rx", recRadius).attr("ry", recRadius);
	decisionPoints.append("svg:g").attr(
			"transform",
			function(d) {
				return (d.id % 2) == 0 ? "rotate(90)translate(0,-"
						+ dpRectHeight * 0.8 + ")" : "translate(0,"
						+ dpRectHeight * 0.2 + ")";
			}).append("foreignObject").attr("width", function(d) {
		return dpRectWidth;
	}).attr("height", function(d) {
		return dpRectHeight;
	}).append("xhtml:div").attr("width", function(d) {
		return dpRectWidth;
	}).attr("height", function(d) {
		return dpRectHeight;
	}).append("xhtml:p").attr("class", "forceTextCenter forceTextDP").html(
			function(d) {
				return d.label;
			});

	// Decision nodes
	var decisions = forceNodes.filter(function(d) {
		return "decision" == d.type;
	});
	decisions.append("svg:rect").attr("id", function(d, i) {
		return "d-" + d.id;
	}).attr("class", function(d) {
		return "forceDecision decision" + d.id.toString()[0];
	}).attr("width", function(d) {
		return decRecWidth;
	}).attr("height", function(d) {
		return decRecHeight;
	}).attr("rx", recRadius).attr("ry", recRadius);
	decisions.append("svg:g").append("foreignObject").attr("width",
			function(d) {
				return decRecWidth;
			}).attr("height", function(d) {
		return decRecHeight;
	}).append("xhtml:div").attr("width", "100%").attr("height", "100%").attr(
			"style", "display: inline-block;").append("xhtml:p").attr("class",
			"forceTextCenter forceTextDec").html(function(d) {
		return d.label;
	});

	// Task nodes
	var tasks = forceNodes.filter(function(d) {
		return "task" == d.type;
	});
	tasks.append("svg:circle").attr("id", function(d, i) {
		return "t-" + d.id;
	}).attr("class", "forceTask task").attr("r", taskCircleRadius);
	tasks.append("svg:g").attr("transform",
			"translate(-" + taskCircleRadius + ",-" + taskCircleRadius + ")")
			.append("foreignObject").attr("width", taskCircleRadius * 2).attr(
					"height", taskCircleRadius * 2).append("xhtml:div").attr(
					"width", "100%").attr("height", "100%").attr("style",
					"display: inline-block;").append("xhtml:p").attr("class",
					"forceTextCenter forceTextTask").html(function(d) {
				return d.label;
			});

	/* === Functions forceLayout === */
	function onTick() {
		// Transform nodes
		forceNodes.attr("transform", transformNodes);

		// Transform pathLinksTaskRels
		// pathLinksTaskRels.attr("d", diagonal);

		pathLinksTaskRels
				.attr(
						"x1",
						function(d) {
							return ("decision" == d.source.type) ? (d.source.x + decRecWidth / 2)
									: d.source.x;
						})
				.attr(
						"y1",
						function(d) {
							return ("decision" == d.source.type) ? (d.source.y + decRecHeight / 2)
									: d.source.y;
						})
				.attr(
						"x2",
						function(d) {
							return ("decision" == d.target.type) ? (d.target.x + decRecWidth / 2)
									: d.target.x;
						})
				.attr(
						"y2",
						function(d) {
							return ("decision" == d.target.type) ? (d.target.y + decRecHeight / 2)
									: d.target.y;
						});

		// Hierarchy Links
		lineLinkHierarchy.attr("x1", function(d) {
			if ("decisionPoint" == d.source.type) {
				if ((d.source.id % 2) != 0) {
					return d.source.x + dpRectWidth / 2;
				} else if ((d.source.id % 2) == 0) {
					return d.source.x + dpRectHeight / 2;
				}
			} else if ("decision" == d.source.type) {
				return d.source.x + decRecWidth / 2;
			} else {
				return d.source.x;
			}
		}).attr("y1", function(d) {
			if ("decisionPoint" == d.source.type) {
				if ((d.source.id % 2) != 0) {
					return d.source.y + dpRectHeight / 2;
				} else if ((d.source.id % 2) == 0) {
					return d.source.y + dpRectWidth / 2;
				}
			} else {
				return d.source.y;
			}
		}).attr("x2", function(d) {
			if ("decision" == d.target.type) {
				return d.target.x + decRecWidth / 2;
			} else {
				return d.target.x;
			}
		}).attr("y2", function(d) {
			if ("decision" == d.target.type) {
				return d.target.y + decRecHeight / 2;
			} else {
				return d.target.y;
			}
		});

	}

	function transformNodes(d) {

		// Position DecisionPoint Rect
		var dpPadding = 10;
		if ("decisionPoint" == d.type) {
			if ((d.id % 2) == 0) {
				d.y = forceSVGHeight / 2 - forceSVGHeight * 0.6 / 2;
				if (d.id == 2)
					d.x = forceSVGWidth - dpPadding - dpRectHeight;
				if (d.id == 4)
					d.x = dpPadding;
			} else {
				d.x = forceSVGWidth / 2 - forceSVGWidth * 0.6 / 2;
				if (d.id == 1)
					d.y = dpPadding;
				if (d.id == 3)
					d.y = forceSVGHeight - dpPadding - dpRectHeight;
			}

		}

		// decision BOX
		var decisionPadding = 65;
		var decisionPaddingHorizontal = decisionPadding + decRecWidth / 2;
		var decisionPaddingVertical = decisionPadding + decRecHeight / 2;
		if ("decision" == d.type) {

			if ((d.parent.id % 2) != 0) {
				var minRange = forceSVGWidth / 2 - dpRectWidth / 2;
				var maxRange = forceSVGWidth / 2 + dpRectWidth / 2;
				var totalRange = maxRange - minRange;
				if (d.parent.id == 1)
					d.y = decisionPaddingVertical;
				if (d.parent.id == 3)
					d.y = forceSVGHeight - decisionPaddingVertical;

				// Fix Positioning
				if (d.parent.id == 1) {
					var partitions1 = totalRange / subDecCount[1];
					if (d.id == 101)
						d.x = minRange + partitions1 / 2;
					if (d.id == 102)
						d.x = minRange + partitions1 + partitions1 / 2;
					if (d.id == 103)
						d.x = minRange + partitions1 * 2 + partitions1 / 2;
					if (d.id == 104)
						d.x = minRange + partitions1 * 3 + partitions1 / 2;
				}

				if (d.parent.id == 3) {
					var partitions3 = totalRange / subDecCount[3];
					if (d.id == 301)
						d.x = minRange + partitions3 / 2;
					if (d.id == 302)
						d.x = minRange + partitions3 + partitions3 / 2;
				}

				// Dynamic Positioning
				// d.x = Math.max(minRange, Math.min(maxRange, d.x));

			} else if ((d.parent.id % 2) == 0) {
				var minRange = forceSVGHeight / 2 - dpRectWidth / 2;
				var maxRange = forceSVGHeight / 2 + dpRectWidth / 2;
				var totalRange = maxRange - minRange;
				if (d.parent.id == 2)
					d.x = forceSVGWidth - decisionPaddingHorizontal;
				if (d.parent.id == 4)
					d.x = decisionPaddingHorizontal;

				// Fix Positioning
				if (d.parent.id == 2) {
					var partitions2 = totalRange / subDecCount[2];
					if (d.id == 201)
						d.y = minRange + partitions2 / 2;
					if (d.id == 202)
						d.y = minRange + partitions2 + partitions2 / 2;
					if (d.id == 203)
						d.y = minRange + partitions2 * 2 + partitions2 / 2;
					if (d.id == 204)
						d.y = minRange + partitions2 * 3 + partitions2 / 2;
				}

				if (d.parent.id == 4) {
					var partitions4 = totalRange / subDecCount[4];
					if (d.id == 401)
						d.y = minRange + partitions4 / 2;
					if (d.id == 402)
						d.y = minRange + partitions4 + partitions4 / 2;
					if (d.id == 403)
						d.y = minRange + partitions4 * 2 + partitions4 / 2;
					if (d.id == 404)
						d.y = minRange + partitions4 * 3 + partitions4 / 2;
					if (d.id == 405)
						d.y = minRange + partitions4 * 4 + partitions4 / 2;
					if (d.id == 406)
						d.y = minRange + partitions4 * 5 + partitions4 / 2;
					if (d.id == 407)
						d.y = minRange + partitions4 * 6 + partitions4 / 2;
				}

				// Dynamic Positioning

			}

			// Fix offset
			d.x = d.x - decRecWidth / 2;
			d.y = d.y - decRecHeight / 2;

		}

		// tasks
		if ("task" == d.type) {
			var taskBoxPadding = 10;
			var taskCirclePartion = 2 * Math.PI / subDecCount[9];
			var taskCircleCenterX = forceSVGWidth / 2;
			var taskCircleCenterY = forceSVGHeight / 2;
			var taskCircleD = dpRectWidth * 0.75 - taskBoxPadding * 2;
			var taskCircleRadius = taskCircleD / 2;

			function calcCircleX(taskD, circlePartition) {
				return taskCircleCenterX + taskCircleRadius
						* Math.cos(circlePartition);
			}

			function calcCircleY(taskD, circlePartition) {
				return taskCircleCenterY + taskCircleRadius
						* Math.sin(circlePartition);
			}

			// Fix Positioning
			d.x = calcCircleX(d, taskCirclePartion
					* parseInt(d.id.toString().substr(1, 2)));
			d.y = calcCircleY(d, taskCirclePartion
					* parseInt(d.id.toString().substr(1, 2)));

		}

		return "translate(" + d.x + "," + d.y + ")";
	}

	function setForceLegend() {

		var legendItems = $('<div>').attr("id", "layoutLegend");

		legendItems.append($('<span>').attr("class", "legendItem small")
				.append($('<img>').attr("src", "./img/legends/force-dp.png"))
				.append($('<span>').text("Decision Point Node")));
		legendItems.append($('<span>').attr("class", "legendItem small")
				.append($('<img>').attr("src", "./img/legends/force-dec.png"))
				.append($('<span>').text("Decision Node")));
		legendItems.append($('<span>').attr("class", "legendItem small")
				.append($('<img>').attr("src", "./img/legends/force-task.png"))
				.append($('<span>').text("Task Node")));
		legendItems.append($('<span>').attr("class", "legendItem small")
				.append(
						$('<img>').attr("src",
								"./img/legends/force-dpDecLink.png")).append(
						$('<span>').text("Decision Point - Decision Link")));
		legendItems.append($('<span>').attr("class", "legendItem small")
				.append(
						$('<img>').attr("src",
								"./img/legends/force-affectationLink.png"))
				.append($('<span>').text("Affectation Link")));
		legendItems
				.append($('<span>')
						.attr("class", "legendItem small")
						.append(
								$('<img>')
										.attr("src",
												"./img/legends/force-affectationLinkHighlight.png"))
						.append(
								$('<span>')
										.text("Highlighted Affectation Link")));
		// $('#visContentDIV').append(legendItems);
		$('#visContent').append(legendItems);

	}

}
// function updateForceLayout() {}
function clearForceLayout() {
	$("svg").remove();
	layoutSVG = null;
	layoutForce = null;

	clearVisRightContent();
	hideInfoLabel();
	removeLegend();
}
function setForceDefaultInformation() {

	var defaultInformation = $('<div>')
			.attr("class", "visInfoBOX")
			.append(
					$('<p>')
							// .attr("class", "defaultInformation")
							.text(
									"Hover over an element to highlight their relationships and related elements. Click on one or more elements to either select or deselect it and its relationships."))

			.append(
					$('<p>')
							// .attr("class", "defaultInformation")
							.text(
									"This panel then shows detailed information about the selected element."));
	$('#visRightContent').append(defaultInformation);

}
function setForceSettings() {

	var displayedNodes = $('<div>')
			.attr("class", "visInfoBOX")
			.append(
					$('<div>')
							.attr("class", "visInfoHeaderBOX")
							.append($('<h4>').text("Displayed Nodes"))
							.append(
									$('<div>')
											.attr("class",
													"visInfoHeaderToogle")
											.append(
													$('<a>')
															.attr("href", "#")
															.attr("class",
																	"visInfoHeaderToogleLink")
															.append(
																	$('<span>')
																			.attr(
																					"class",
																					"glyphicon glyphicon-minus"))))
							.append($('<div>').attr("class", "clearfix")))

			.append(
					$('<div>')
							.attr("class", "visInfoContentBOX")

							.append(
									$('<div>')
											.attr("class",
													"input-group input-group-sm visInputBox")
											.append(
													$('<span>')
															.attr("class",
																	"input-group-addon")
															.append(
																	$('<input>')
																			.attr(
																					"type",
																					"checkbox")
																			.attr(
																					"name",
																					"showDecisions")
																			.attr(
																					"id",
																					"showDecisions")
																			.attr(
																					"checked",
																					function() {
																						return layoutForceDefaultSettings["showDecisions"];
																					})))
											.append(
													$('<span>').attr("class",
															"form-control")
															.text("Decisions")))
							.append(
									$('<div>')
											.attr("class",
													"input-group input-group-sm visInputBox")
											.append(
													$('<span>')
															.attr("class",
																	"input-group-addon")
															.append(
																	$('<input>')
																			.attr(
																					"type",
																					"checkbox")
																			.attr(
																					"name",
																					"showTasks")
																			.attr(
																					"id",
																					"showTasks")
																			.attr(
																					"checked",
																					function() {
																						return layoutForceDefaultSettings["showTasks"];
																					})))
											.append(
													$('<span>').attr("class",
															"form-control")
															.text("Tasks")))

			);

	var displayedLinks = $('<div>')
			.attr("class", "visInfoBOX")
			.append(
					$('<div>')
							.attr("class", "visInfoHeaderBOX")
							.append($('<h4>').text("Displayed Links"))
							.append(
									$('<div>')
											.attr("class",
													"visInfoHeaderToogle")
											.append(
													$('<a>')
															.attr("href", "#")
															.attr("class",
																	"visInfoHeaderToogleLink")
															.append(
																	$('<span>')
																			.attr(
																					"class",
																					"glyphicon glyphicon-minus"))))
							.append($('<div>').attr("class", "clearfix")))

			.append(
					$('<div>')
							.attr("class", "visInfoContentBOX")

							.append(
									$('<div>')
											.attr("class",
													"input-group input-group-sm visInputBox")
											.append(
													$('<span>')
															.attr("class",
																	"input-group-addon")
															.append(
																	$('<input>')
																			.attr(
																					"type",
																					"checkbox")
																			.attr(
																					"name",
																					"showInfluenceLinks")
																			.attr(
																					"id",
																					"showInfluenceLinks")
																			.attr(
																					"checked",
																					function() {
																						return layoutForceDefaultSettings["showInfluenceLinks"];
																					})))
											.append(
													$('<span>').attr("class",
															"form-control")
															.text("Influences")))
							.append(
									$('<div>')
											.attr("class",
													"input-group input-group-sm visInputBox")
											.append(
													$('<span>')
															.attr("class",
																	"input-group-addon")
															.append(
																	$('<input>')
																			.attr(
																					"type",
																					"checkbox")
																			.attr(
																					"name",
																					"showAffectLinks")
																			.attr(
																					"id",
																					"showAffectLinks")
																			.attr(
																					"checked",
																					function() {
																						return layoutForceDefaultSettings["showAffectLinks"];
																					})))
											.append(
													$('<span>')
															.attr("class",
																	"form-control")
															.text("Affectation")))

							.append(
									$('<div>')
											.attr("class",
													"btn-group btn-group-sm btn-group-justified")
											.append(
													$('<div>')
															.attr("class",
																	"btn-group btn-group-sm")
															.append(
																	$(
																			'<button>')
																			.attr(
																					"type",
																					"button")
																			.attr(
																					"class",
																					"btn btn-default")
																			.attr(
																					"name",
																					"btn")
																			.attr(
																					"id",
																					"btn")
																			.text(
																					"Affectation")))
											.append(
													$('<div>')
															.attr("class",
																	"btn-group btn-group-sm")
															.append(
																	$(
																			'<button>')
																			.attr(
																					"type",
																					"button")
																			.attr(
																					"class",
																					"btn btn-default active")
																			.attr(
																					"name",
																					"btn")
																			.attr(
																					"id",
																					"btn")
																			.text(
																					"Influences"))))

			);

	var clearHighlight = $('<div>').attr("class", "visInfoBOX").append(
			$('<div>').attr("class", "visInfoHeaderBOX").append(
					$('<h4>').text("Clear Highlights")).append(
					$('<div>').attr("class", "visInfoHeaderToogle").append(
							$('<a>').attr("href", "#").attr("class",
									"visInfoHeaderToogleLink").append(
									$('<span>').attr("class",
											"glyphicon glyphicon-minus"))))
					.append($('<div>').attr("class", "clearfix")))

	.append(
			$('<div>').attr("class", "visInfoContentBOX")

			.append(
					$('<div>').attr("class", "visInputBox").append(
							$('<button>').attr("type", "button").attr("class",
									"btn btn-default btn-sm btn-block").attr(
									"id", "clearForceHighlights").text(
									"Clear Highlights"))));

	var information = $('<div>')
			.attr("class", "visInfoBOX")
			.append(
					$('<div>')
							.attr("class", "visInfoHeaderBOX")
							.append($('<h4>').text("Information"))
							.append(
									$('<div>')
											.attr("class",
													"visInfoHeaderToogle")
											.append(
													$('<a>')
															.attr("href", "#")
															.attr("class",
																	"visInfoHeaderToogleLink")
															.append(
																	$('<span>')
																			.attr(
																					"class",
																					"glyphicon glyphicon-minus"))))
							.append($('<div>').attr("class", "clearfix")))

			.append(
					$('<div>')
							.attr("class", "visInfoContentBOX")

							.append(
									$('<div>')
											.attr("class",
													"input-group input-group-sm visInputBox")
											.append(
													$('<span>')
															.attr("class",
																	"input-group-addon")
															.append(
																	$('<input>')
																			.attr(
																					"type",
																					"checkbox")
																			.attr(
																					"name",
																					"showLabels")
																			.attr(
																					"id",
																					"showLabels")
																			.attr(
																					"checked",
																					function() {
																						return layoutForceDefaultSettings["showLabels"];
																					})))
											.append(
													$('<span>')
															.attr("class",
																	"form-control")
															.text("Show Labels"))));

	$('#visPanelSettingsContent').prepend(information);
	$('#visPanelSettingsContent').prepend(clearHighlight);
	// $('#visPanelSettingsContent').prepend(displayedLinks);
	// $('#visPanelSettingsContent').prepend(displayedNodes);

	// Register Events
	$('#clearForceHighlights').click(function() {
		clearForceHighligths();
	});

	$('.visInfoHeaderToogleLink').click(function() {
		visInfoHeaderToogle($(this));
	});

	$('#showLabels').change(
			function() {
				if ($(this).prop("checked")) {
					$('.forceTextDP, .forceTextDec, .forceTextTask').css(
							"display", "block");
				} else {
					$('.forceTextDP, .forceTextDec, .forceTextTask').css(
							"display", "none");
				}
			});

}
function mouseNodeClickForce(n) {

	// Set Info Label
	setInfoLabel(n);

	// Clear rest of content
	clearVisRightContent();

	// Set Node Information
	if ("decisionPoint" == n.type) {

		var dpNodeInfosUL = $('<ul>').attr("class", "visInfoRelatedNodesUL");

		$.each(n.children, function(i, v) {

			dpNodeInfosUL.append($('<li>').append(
					$('<span>').attr("class", function() {
						return "bordercolorDecision" + v.id.toString()[0];
					}).text(v.label)));

		});

		var nodeInfos = $('<div>').attr("class", "visInfoBOX").append(
				$('<div>').attr("class", "visInfoHeaderBOX").append(
						$('<h4>').text("Decisions")).append(
						$('<div>').attr("class", "visInfoHeaderToogle").append(
								$('<a>').attr("href", "#").attr("class",
										"visInfoHeaderToogleLink").append(
										$('<span>').attr("class",
												"glyphicon glyphicon-minus"))))
						.append($('<div>').attr("class", "clearfix")))

		.append(
				$('<div>').attr("class", "visInfoContentBOX").append(
						dpNodeInfosUL));
		$('#visRightContent').append(nodeInfos);

	} else if ("decision" == n.type) {
		var nodeInfos = $('<div>')
				.attr("class", "visInfoBOX")
				.append(
						$('<div>')
								.attr("class", "visInfoHeaderBOX")
								.append($('<h4>').text("Node Details"))
								.append(
										$('<div>')
												.attr("class",
														"visInfoHeaderToogle")
												.append(
														$('<a>')
																.attr("href",
																		"#")
																.attr("class",
																		"visInfoHeaderToogleLink")
																.append(
																		$(
																				'<span>')
																				.attr(
																						"class",
																						"glyphicon glyphicon-minus"))))
								.append($('<div>').attr("class", "clearfix")))

				.append(
						$('<div>')
								.attr("class", "visInfoContentBOX")
								.append(
										$('<ul>')
												.attr("class",
														"visInfoNodeInformationUL")
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Decision Point:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.label)))
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Classification:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.classification)))));
		$('#visRightContent').append(nodeInfos);
	}

	// Set Related Tasks
	var relTasks = layoutForce.links().filter(
			function(d) {
				return ("task" == d.source.type || "task" == d.target.type)
						&& (d.source.id == n.id || d.target.id == n.id);
			});
	if (relTasks.length > 0) {
		var relatedTasksLIs = $('<ul>').attr("class", "visInfoRelatedNodesUL");

		$.each(relTasks, function(i, v) {

			relatedTasksLIs.append($('<li>').append(
					$('<span>').text(
							function() {
								return v.source.id != n.id ? v.source.label
										: v.target.label;
							}).attr(
							"class",
							function() {
								if (v.source.id != n.id) {
									if ("task" == v.source.type)
										return "bordercolorTask";
									if ("decision" == v.source.type)
										return "bordercolorDecision"
												+ v.source.id.toString()[0];
								} else {
									if ("task" == v.target.type)
										return "bordercolorTask";
									if ("decision" == v.target.type)
										return "bordercolorDecision"
												+ v.target.id.toString()[0];
								}
							}).append(
							$('<span>').attr("class", "affectDirection small")
									.text(function() {
										if ("auto" == v.dir) {
											if (v.source.id != n.id) {
												return "is affecting";
											} else {
												return "is affected";
											}
										} else if ("both" == v.dir) {
											return "is bidirectional affected";
										}
									}))));
		});

		var relatedLabel = "";
		if ("decision" == n.type)
			relatedLabel = "Related Tasks";
		if ("task" == n.type)
			relatedLabel = "Related Decisions";

		var relatedNodesInfos = $('<div>').attr("class", "visInfoBOX").append(
				$('<div>').attr("class", "visInfoHeaderBOX").append(
						$('<h4>').text(relatedLabel)).append(
						$('<div>').attr("class", "visInfoHeaderToogle").append(
								$('<a>').attr("href", "#").attr("class",
										"visInfoHeaderToogleLink").append(
										$('<span>').attr("class",
												"glyphicon glyphicon-minus"))))
						.append($('<div>').attr("class", "clearfix")))

		.append(
				$('<div>').attr("class", "visInfoContentBOX").append(
						relatedTasksLIs));
		$('#visRightContent').append(relatedNodesInfos);

	}

	// Register Toogle
	$('.visInfoHeaderToogleLink').click(function() {
		visInfoHeaderToogle($(this));
	});

	// Node Highlight
	if (layoutSVG.select("#n-" + n.id).classed("noteHighlighted")) {
		layoutSVG.select("#n-" + n.id).classed("noteHighlighted", false);
	} else {
		layoutSVG.select("#n-" + n.id).classed("noteHighlighted", true);
	}

	var selLinks = layoutSVG.selectAll(".forceLinkSource-" + n.id
			+ ", .forceLinkTarget-" + n.id);

	selLinks.classed("forceAffectationLinkHighlightClick", function(d) {
		if ("taskRel" == d.type) {
			if (layoutSVG.select("#n-" + n.id).classed("noteHighlighted")) {
				return true;
			} else {
				return false;
			}
		} else {
			return null;
		}
	});
	selLinks.each(function(d) {

		if ("taskRel" == d.type) {
			if (layoutSVG.select("#n-" + n.id).classed("noteHighlighted")) {
				if ("decision" == d.source.type)
					layoutSVG.select("#d-" + d.source.id).classed(
							"forceHighlightNode", true);
				if ("decision" == d.target.type)
					layoutSVG.select("#d-" + d.target.id).classed(
							"forceHighlightNode", true);
				if ("task" == d.source.type)
					layoutSVG.select("#t-" + d.source.id).classed(
							"forceHighlightNode", true);
				if ("task" == d.target.type)
					layoutSVG.select("#t-" + d.target.id).classed(
							"forceHighlightNode", true);
			} else {
				if ("decision" == d.source.type)
					layoutSVG.select("#d-" + d.source.id).classed(
							"forceHighlightNode", false);
				if ("decision" == d.target.type)
					layoutSVG.select("#d-" + d.target.id).classed(
							"forceHighlightNode", false);
				if ("task" == d.source.type)
					layoutSVG.select("#t-" + d.source.id).classed(
							"forceHighlightNode", false);
				if ("task" == d.target.type)
					layoutSVG.select("#t-" + d.target.id).classed(
							"forceHighlightNode", false);
			}
		}
	});

}

function clearForceHighligths() {
	// Clear all highlights in force layout
	layoutSVG
			.selectAll(
					'.forceHighlightNode, .noteHighlighted, .forceAffectationLinkHighlightClick, .forceAffectationLinkHighlightHover')
			.classed("forceHighlightNode", false).classed("noteHighlighted",
					false).classed("forceAffectationLinkHighlightClick", false)
			.classed("forceAffectationLinkHighlightHover", false);

	clearVisRightContent();
	hideInfoLabel();
}

function mouseOverForce(d) {
	layoutSVG.selectAll(
			".forceLinkSource-" + d.id + ", .forceLinkTarget-" + d.id).classed(
			"forceAffectationLinkHighlightHover", function(d) {
				return "taskRel" == d.type ? true : null;
			});
	// .classed("forceAffectationLinkHighlight", function(d){return "taskRel" ==
	// d.type ? true : null;})
}

function mouseOutForce(d) {
	layoutSVG.selectAll(
			".forceLinkSource-" + d.id + ", .forceLinkTarget-" + d.id).classed(
			"forceAffectationLinkHighlightHover", function(d) {
				return "taskRel" == d.type ? false : null;
			});
}

/* Treemap Layout */
/* ========================================= */
function drawTreemapLayout() {

	/* === Set default information === */
	setTreemapDefaultInformation();

	var margin = {
		top : 30,
		right : 0,
		bottom : 0,
		left : 0
	}, width = SVGWidth, height = SVGHeight - margin.top - margin.bottom, formatNumber = d3
			.format(",d"), transitioning;

	var x = d3.scale.linear().domain([ 0, width ]).range([ 0, width ]);

	var y = d3.scale.linear().domain([ 0, height ]).range([ 0, height ]);

	var treemap = d3.layout.treemap().children(function(d, depth) {
		return depth ? null : d._children;
	}).sort(function(a, b) {
		// @Metz Sort entries after id to keep order as in knowledge base dp1 >
		// dp2 ...
		return b.id - a.id;
		// return a.value - b.value;
	}).ratio(height / width * 0.5 * (1 + Math.sqrt(5))).round(false);

	/* === Nodes / Links === */
	var treemapVisLabel = "Decision Tree Visualization";
	var treemapVisLabelInfo = "This representation shows the hierarchical structure of decision points, decisions, and outcomes of the CloudDSF visualized by a treemap layout.";
	setVisLabel(treemapVisLabel, treemapVisLabelInfo);

	var svg = d3.select("#" + visContentID).append("svg").attr("class",
			"overflowHidden").attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.bottom + margin.top).style(
					"margin-left", -margin.left + "px").style("margin.right",
					-margin.right + "px").append("g").attr("transform",
					"translate(" + margin.left + "," + margin.top + ")").style(
					"shape-rendering", "crispEdges");

	var grandparent = svg.append("g").attr("class", "grandparent");

	grandparent.append("rect").attr("y", -margin.top).attr("width", width)
			.attr("height", margin.top);

	grandparent.append("text").attr("x", 6).attr("y", 6 - margin.top).attr(
			"dy", ".9em");

	// d3
	// .json(
	// "./data/elaboratedDSF.json",
	// function(root) {
	var treeMapLayoutData = JSON.parse(JSON.stringify(visualizationData));
	initialize(treeMapLayoutData.decisionTree);
	accumulate(treeMapLayoutData.decisionTree);
	layout(treeMapLayoutData.decisionTree);
	display(treeMapLayoutData.decisionTree);

	function initialize(root) {
		root.x = root.y = 0;
		root.dx = width;
		root.dy = height;
		root.depth = 0;
	}

	function accumulate(d) {
		return (d._children = d.children) ? d.value = d.children.reduce(
				function(p, v) {
					return p + accumulate(v);
				}, 0) : d.value = 1; // d.weight;
	}

	function layout(d) {
		if (d._children) {
			treemap.nodes({
				_children : d._children
			});

			d._children.forEach(function(c) {
				c.x = d.x + c.x * d.dx;
				c.y = d.y + c.y * d.dy;
				c.dx *= d.dx;
				c.dy *= d.dy;
				c.parent = d;
				layout(c);
			});
		}
	}

	function display(d) {
		grandparent.datum(d.parent).on("click", function(d) {
			transition(d);
			mouseNodeClickTreemap(d);
		}).select("text").text(name(d));

		var g1 = svg.insert("g", ".grandparent").datum(d)
				.attr("class", "depth");

		var g = g1.selectAll("g").data(d._children).enter().append("g");

		g.filter(function(d) {
			return d._children;
		}).classed("children", true).on("click", function(d) {
			transition(d);
			mouseNodeClickTreemap(d);
		});

		g.append("rect").attr("class", function(d) {
			if ("decisionPoint" == d.type) {
				return "parent decisionPoint" + d.id.toString()[0];
			} else if ("decision" == d.type) {
				return "parent decision" + d.id.toString()[0];
			} else if ("outcome" == d.type) {
				return "parent outcome" + d.id.toString()[0];
			} else if ("task" == d.type) {
				return "parent task";
			} else if ("decRoot" == d.type || "taskRoot" == d.type) {
				return "parent subRoot";
			} else {
				return "parent";
			}
		}).call(rect);

		g.selectAll(".child").data(function(d) {
			return d._children || [ d ];
		}).enter().append("rect").attr("class", "child").call(rect);

		g.append("text").attr("dy", ".75em").attr(
				"class",
				function(d) {
					return "decisionPoint" == d.type ? "treemapDPNodeText"
							: "treemapNodeText";
				}).text(function(d) {
			return d.label;
		}).call(text);

		function transition(d) {
			if (transitioning || !d)
				return;
			transitioning = true;

			var g2 = display(d), t1 = g1.transition().duration(750), t2 = g2
					.transition().duration(750);

			// Update the domain only after entering new
			// elements.
			x.domain([ d.x, d.x + d.dx ]);
			y.domain([ d.y, d.y + d.dy ]);

			// Enable anti-aliasing during the transition.
			svg.style("shape-rendering", null);

			// Draw child nodes on top of parent nodes.
			svg.selectAll(".depth").sort(function(a, b) {
				return a.depth - b.depth;
			});

			// Fade-in entering text.
			g2.selectAll("text").style("fill-opacity", 0);

			// Transition to the new view.
			t1.selectAll("text").call(text).style("fill-opacity", 0);
			t2.selectAll("text").call(text).style("fill-opacity", 1);
			t1.selectAll("rect").call(rect);
			t2.selectAll("rect").call(rect);

			// Remove the old node when the transition is
			// finished.
			t1.remove().each("end", function() {
				svg.style("shape-rendering", "crispEdges");
				transitioning = false;
			});
		}

		return g;
	}

	function text(text) {
		text.attr("x", function(d) {
			return x(d.x) + 6;
		}).attr("y", function(d) {
			return y(d.y) + 6;
		});
	}

	function rect(rect) {

		rect.attr("x", function(d) {
			return x(d.x);
		}).attr("y", function(d) {
			return y(d.y);
		}).attr("width", function(d) {
			return x(d.x + d.dx) - x(d.x);
		}).attr("height", function(d) {
			return y(d.y + d.dy) - y(d.y);
		});
	}

	function name(d) {
		return d.parent ? name(d.parent) + " > " + d.label : d.label;
	}
	// });
}

// function updateTreemapLayout() {}
function clearTreemapLayout() {
	$("svg").remove();
	layoutTreemap = null;
	layoutSVG = null;

	clearVisRightContent();
	hideInfoLabel();
}

function setTreemapDefaultInformation() {
	var defaultInformation = $('<div>')
			.attr("class", "visInfoBOX")
			.append(
					$('<p>')
							// .attr("class", "defaultInformation")
							.text(
									"Hover and click on the treemap visualization to zoom in on this element. Click on the top gray bar to zoom out."))

			.append(
					$('<p>')
							// .attr("class", "defaultInformation")
							.text(
									"This panel then shows detailed information about the selected element."));
	$('#visRightContent').append(defaultInformation);

}

function setTreemapSettings() {
	var information = $('<div>')
			.attr("class", "visInfoBOX")
			.append(
					$('<div>')
							.attr("class", "visInfoHeaderBOX")
							.append($('<h4>').text("Information"))
							.append(
									$('<div>')
											.attr("class",
													"visInfoHeaderToogle")
											.append(
													$('<a>')
															.attr("href", "#")
															.attr("class",
																	"visInfoHeaderToogleLink")
															.append(
																	$('<span>')
																			.attr(
																					"class",
																					"glyphicon glyphicon-minus"))))
							.append($('<div>').attr("class", "clearfix")))

			.append(
					$('<div>')
							.attr("class", "visInfoContentBOX")

							.append(
									$('<div>')
											.attr("class",
													"input-group input-group-sm visInputBox")
											.append(
													$('<span>')
															.attr("class",
																	"input-group-addon")
															.append(
																	$('<input>')
																			.attr(
																					"type",
																					"checkbox")
																			.attr(
																					"name",
																					"showLabels")
																			.attr(
																					"id",
																					"showLabels")
																			.attr(
																					"checked",
																					function() {
																						return layoutTreemapDefaultSettings["showLabels"];
																					})))
											.append(
													$('<span>')
															.attr("class",
																	"form-control")
															.text("Show Labels"))));
	$('#visPanelSettingsContent').prepend(information);

	// Register Events
	$('.visInfoHeaderToogleLink').click(function() {
		visInfoHeaderToogle($(this));
	});

	$('#showLabels').change(function() {
		if ($(this).prop("checked")) {
			$('.treemapNodeText').css("display", "block");
		} else {
			$('.treemapNodeText').css("display", "none");
		}
	});
}

function mouseNodeClickTreemap(n) {

	// Exiting node Catch
	if ("decRoot" == n.type || "root" == n.type) {
		clearVisRightContent();
		hideInfoLabel();
		setTreemapDefaultInformation();
		return;
	}

	// Set Info Label
	setInfoLabel(n);

	// Clear rest of content
	clearVisRightContent();

	// Set Node Information
	if ("decisionPoint" == n.type) {

		var dpNodeInfosUL = $('<ul>').attr("class", "visInfoRelatedNodesUL");

		$.each(n._children, function(i, v) {

			dpNodeInfosUL.append($('<li>').append(
					$('<span>').attr("class", function() {
						return "bordercolorDecision" + v.id.toString()[0];
					}).text(v.label)));

		});
		var nodeInfos = $('<div>').attr("class", "visInfoBOX").append(
				$('<div>').attr("class", "visInfoHeaderBOX").append(
						$('<h4>').text("Decisions")).append(
						$('<div>').attr("class", "visInfoHeaderToogle").append(
								$('<a>').attr("href", "#").attr("class",
										"visInfoHeaderToogleLink").append(
										$('<span>').attr("class",
												"glyphicon glyphicon-minus"))))
						.append($('<div>').attr("class", "clearfix")))

		.append(
				$('<div>').attr("class", "visInfoContentBOX").append(
						dpNodeInfosUL));
		$('#visRightContent').append(nodeInfos);

	} else if ("decision" == n.type) {
		// Node Info
		var nodeInfos = $('<div>')
				.attr("class", "visInfoBOX")
				.append(
						$('<div>')
								.attr("class", "visInfoHeaderBOX")
								.append($('<h4>').text("Node Details"))
								.append(
										$('<div>')
												.attr("class",
														"visInfoHeaderToogle")
												.append(
														$('<a>')
																.attr("href",
																		"#")
																.attr("class",
																		"visInfoHeaderToogleLink")
																.append(
																		$(
																				'<span>')
																				.attr(
																						"class",
																						"glyphicon glyphicon-minus"))))
								.append($('<div>').attr("class", "clearfix")))

				.append(
						$('<div>')
								.attr("class", "visInfoContentBOX")
								.append(
										$('<ul>')
												.attr("class",
														"visInfoNodeInformationUL")
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Decision Point:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.label)))
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Classification:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.classification)))));
		$('#visRightContent').append(nodeInfos);

		// Outcomes
		var decOutcomeUL = $('<ul>').attr("class", "visInfoRelatedNodesUL");

		$.each(n._children, function(i, v) {

			decOutcomeUL.append($('<li>').append(
					$('<span>').attr("class", function() {
						return "bordercolorOutcome" + v.id.toString()[0];
					}).text(v.label)));

		});

		var decOutcomeInfos = $('<div>').attr("class", "visInfoBOX").append(
				$('<div>').attr("class", "visInfoHeaderBOX").append(
						$('<h4>').text("Possible Outcomes")).append(
						$('<div>').attr("class", "visInfoHeaderToogle").append(
								$('<a>').attr("href", "#").attr("class",
										"visInfoHeaderToogleLink").append(
										$('<span>').attr("class",
												"glyphicon glyphicon-minus"))))
						.append($('<div>').attr("class", "clearfix")))

		.append(
				$('<div>').attr("class", "visInfoContentBOX").append(
						decOutcomeUL));
		$('#visRightContent').append(decOutcomeInfos);

	} else if ("outcome" == n.type) {

		// Node Info
		var nodeInfos = $('<div>')
				.attr("class", "visInfoBOX")
				.append(
						$('<div>')
								.attr("class", "visInfoHeaderBOX")
								.append($('<h4>').text("Node Details"))
								.append(
										$('<div>')
												.attr("class",
														"visInfoHeaderToogle")
												.append(
														$('<a>')
																.attr("href",
																		"#")
																.attr("class",
																		"visInfoHeaderToogleLink")
																.append(
																		$(
																				'<span>')
																				.attr(
																						"class",
																						"glyphicon glyphicon-minus"))))
								.append($('<div>').attr("class", "clearfix")))

				.append(
						$('<div>')
								.attr("class", "visInfoContentBOX")
								.append(
										$('<ul>')
												.attr("class",
														"visInfoNodeInformationUL")
												.append(
														$('<li>')
																.append(
																		$(
																				'<span>')
																				.text(
																						"Decision:"))
																.append(
																		$(
																				'<span>')
																				.text(
																						n.parent.label)))));
		$('#visRightContent').append(nodeInfos);

	}

	// Register Toogle
	$('.visInfoHeaderToogleLink').click(function() {
		visInfoHeaderToogle($(this));
	});
}

/* Layout Rendering - Helper */
/* ======================================================================== */

/* Function nodedLinksArray */
function nodedLinksArray(inputLinksArray, inputNodesArray) {
	inputLinksArray.forEach(function(d) {
		var sourceNode = inputNodesArray.filter(function(j) {
			return j.id == d.source;
		});
		var targetNode = inputNodesArray.filter(function(j) {
			return j.id == d.target;
		});
		d.source = sourceNode[0];
		d.target = targetNode[0];
	});
	return inputLinksArray;
}

/* Function getArrayFromNodesTree */
// function getArrayFromNodesTree(inputTree, deleteChildren) {
// var nodesArray = [];
//    
// processNode(inputTree);
//    
// function processNode(node) {
// if(node.children) {
// $.each(node.children, function(i,v){ processNode(v); });
// }
// nodesArray.push(node);
// }
//    
// if(deleteChildren) {
// $.each(nodesArray, function(i,v){
// if(v.children) delete v.children;
// });
// }
//    
// return nodesArray;
// }
/* Function filterTree */
// function filterTree(inputTree, filterType) {
// check(inputTree);
// function check(inTree) {
// if(inTree.children) {
// inTree.children = $.grep(inTree.children, function(e,i){
// return e.type != filterType;
// });
// if(inTree.children) {
// $.each(inTree.children, function(i,v){
// check(v);
// });
// }
// }
// }
// }
/* Function setInfoLabel */
function setInfoLabel(d) {
	var visInfoLabelBOX = $('#visInfoLabelBOX');
	visInfoLabelBOX.find('#visInfoLabelTextBOX h4').text(d.label).addClass(
			function() {
				$(this).removeClass();
				if ("decisionPoint" == d.type) {
					return "textcolorDecisionPoint" + d.id.toString()[0];
				} else if ("decision" == d.type) {
					return "textcolorDecision" + d.id.toString()[0];
				} else if ("outcome" == d.type) {
					return "textcolorOutcome" + d.id.toString()[0];
				}
			});
	visInfoLabelBOX.find('#visInfoLabelTypeBOX span').text(function() {
		if ("decisionPoint" == d.type) {
			return "Decision Point";
		} else if ("decision" == d.type) {
			return "Decision";
		} else if ("task" == d.type) {
			return "Task";
		} else if ("outcome" == d.type) {
			return "Outcome";
		} else {
			return "";
		}
	});
	visInfoLabelBOX.css("display", "block");
}

/* Function hideInfoLabel */
function hideInfoLabel() {
	$('#visInfoLabelBOX').css("display", "none");
}

/* Function clearVisRightContent */
function clearVisRightContent() {
	$('#visRightContent').children().not('#visInfoLabelBOX').remove();
}

/* Function clearVisPanelSettingsContent */
function clearVisPanelSettingsContent() {
	$('#visPanelSettingsContent').children().remove();
}

function removeLegend() {
	$('#layoutLegend').remove();
}

/* Function setVisLabel */
function setVisLabel(visLabelText, visLabelInfoText) {
	$('#visLabel h3').text(visLabelText);

	$('#vislabelInfo').popover('destroy');

	$('#vislabelInfo').popover({
		placement : "bottom",
		title : "Visualization Information",
		content : visLabelInfoText
	});
	if (showVislabelInfo) {
		$('#vislabelInfo').popover('show');
		setTimeout(function() {
			$('#vislabelInfo').popover('hide');
		}, 3000);
		showVislabelInfo = false;
	}
}

/* Function visInfoHeaderToogle */
function visInfoHeaderToogle(input) {
	input.closest('.visInfoBOX').children('.visInfoContentBOX').slideToggle(
			'fast',
			function() {
				if ($(this).is(":hidden")) {
					input.children('.glyphicon').removeClass("glyphicon-minus")
							.addClass("glyphicon-plus");
				} else {
					input.children('.glyphicon').removeClass("glyphicon-plus")
							.addClass("glyphicon-minus");
				}
			});
}

/* Function getAllSettings */
function getAllSettings() {
	var settings = {};

	$('#visPanelSettingsContent input[type=checkbox]').each(function() {
		settings[$(this).attr("id")] = $(this).prop("checked");
	});

	if (settings["showLabels"] != null) {
		showLabels = settings["showLabels"];
	} else {
		showLabels = false;
	}
	if (settings["showTooltips"] != null) {
		showTooltips = settings["showTooltips"];
	} else {
		showTooltips = false;
	}

	return settings;
}
