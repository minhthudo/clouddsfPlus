var colorPalette1 = d3.scale.ordinal().domain(
		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
				"out3", "dp4", "dec4", "out4" ]).range([
// cat20b light (blue, green, brown, pink)
"#636363",

"#5254a3", "#6b6ecf", "#9c9ede",

"#8ca252", "#b5cf6b", "#cedb9c",

"#bd9e39", "#e7ba52", "#e7cb94",

"#a55194", "#ce6dbd", "#de9ed6" ]);

var colorPalette2 = d3.scale.ordinal().domain(
		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
				"out3", "dp4", "dec4", "out4" ]).range([
// cat20b light (blue, green, brown, red)
"#636363",

"#5254a3", "#6b6ecf", "#9c9ede",

"#8ca252", "#b5cf6b", "#cedb9c",

"#bd9e39", "#e7ba52", "#e7cb94",

"#ad494a", "#d6616b", "#e7969c" ]);

var colorPalette3a = d3.scale.ordinal().domain(
		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
				"out3", "dp4", "dec4", "out4" ]).range([
// cat20c dark (blue, orange, green, purple)
"#636363",

"#3182bd", "#6baed6", "#9ecae1",

"#e6550d", "#fd8d3c", "#fdae6b",

"#31a354", "#74c476", "#a1d99b",

"#756bb1", "#9e9ac8", "#bcbddc" ]);

var colorPalette3b = d3.scale.ordinal().domain(
		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
				"out3", "dp4", "dec4", "out4" ]).range([
// cat20c dark (green, orange, purple, blue)
"#636363",

"#31a354", "#74c476", "#a1d99b",

"#e6550d", "#fd8d3c", "#fdae6b",

"#756bb1", "#9e9ac8", "#bcbddc",

"#3182bd", "#6baed6", "#9ecae1", ]);

var colorPalette3c = d3.scale.ordinal().domain(
		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
				"out3", "dp4", "dec4", "out4" ]).range([
// cat20c dark (purple, green, orange, blue)
"#636363",

"#756bb1", "#9e9ac8", "#bcbddc",

"#31a354", "#74c476", "#a1d99b",

"#e6550d", "#fd8d3c", "#fdae6b",

"#3182bd", "#6baed6", "#9ecae1", ]);

var colorPalette3d = d3.scale.ordinal().domain(
		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
				"out3", "dp4", "dec4", "out4" ]).range([
// cat20c dark (green, orange, purple, blue)
"#636363",

"#9ecae1", "#6baed6", "#3182bd",

"#fdae6b", "#fd8d3c", "#e6550d",

"#bcbddc", "#9e9ac8", "#756bb1",

"#a1d99b", "#74c476", "#31a354", ]);

var colorPalette4 = d3.scale.ordinal().domain(
		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
				"out3", "dp4", "dec4", "out4" ]).range([
// cat20c light (blue, green, brown, red)
"#636363",

"#6baed6", "#9ecae1", "#c6dbef",

"#fd8d3c", "#fdae6b", "#fdd0a2",

"#74c476", "#a1d99b", "#c7e9c0",

"#9e9ac8", "#bcbddc", "#dadaeb" ]);

var getColor = function(d) {
	return colorPalette3d(d);
}
var resizeId;

var marginConvention = (function marginConvention(padding, height) {

	var margin = {
		top : 10,
		right : 10,
		bottom : 10,
		left : 10
	};

	var oWidth = parseInt($('#visContent').width());
	var oHeight = height || 900;
	oWidth = oWidth < 800 ? 800 : oWidth;

	var iWidth = oWidth - margin.left - margin.right;
	var iHeight = oHeight - margin.top - margin.bottom;
	var panelWidth = iWidth - padding.left - padding.right;
	var panelHeight = iHeight - padding.top - padding.bottom;

	var marginConvention = {
		"panelWidth" : panelWidth,
		"panelHeight" : panelHeight,
		"oWidth" : oWidth,
		"oHeight" : oHeight,
		"iWidth" : iWidth,
		"iHeight" : iHeight,
		"marginTop" : margin.top,
		"marginRight" : margin.right,
		"marginBottom" : margin.bottom,
		"marginLeft" : margin.left
	}
	return marginConvention;
});

// var decRelGraph, outRelGraph, hierRelGraph;

$(document).ready(function() {
	// todo move to own file

	// $('#buttonGroupRelations .btn.active input').each(function(index) {
	// $(this).prop("checked", true);
	// });

	$('#relationTypes').multiselect({
		onChange : function(event) {
			var data = [];
			$("#relationTypes option:selected").each(function() {
				data.push($(this).val());
			});
			decisionGraph.setLinks(data);
		},
		numberDisplayed : 4,
		nonSelectedText : 'Select relation type(s)',
		selectAllText : '(De)Select All',
		includeSelectAllOption : true,
	});

	$('#showDps').on('click', function(event) {
		treeGraph.showDps();
	});
	$('#showDecs').on('click', function(event) {
		treeGraph.showDecisions();
	});
	$('#showOutcomes').on('click', function(event) {
		treeGraph.showOutcomes();
	});

	setSidebar();
	setSidebarButtons();

});

function setSidebar() {
	$('[data-toggle="offcanvas"]').on(
			'click',
			function() {
				$('.row-offcanvas').toggleClass('active');
				$('#toggleButton > span').toggleClass(
						"glyphicon glyphicon-chevron-left");
				$('#toggleButton > span').toggleClass(
						"glyphicon glyphicon-chevron-right");
			});
}

function setSidebarButtons() {
	var btnList_DecRel = $('#btnList_DecRel');
	var btnList_OutRel = $('#btnList_OutRel');
	var toolbarDec = $('#toolbarDecisions');
	var toolbarTree = $('#toolbarTree');
	var btnList_treeLayout = $('#btnList_treeLayout');

	btnList_treeLayout.on('click', function(event) {
		btnList_treeLayout.addClass("active");
		btnList_DecRel.removeClass("active");
		btnList_OutRel.removeClass("active");
		toolbarDec.addClass("hidden");
		toolbarTree.removeClass("hidden");
		treeGraph.initialize();
		 $(window).on('resize.treeResize', function() {
		 clearTimeout(resizeId);
		 resizeId = setTimeout(treeGraph.resizeLayout, 500);
		 });
	});

	btnList_DecRel.on('click', function(event) {
		btnList_DecRel.addClass("active");
		btnList_OutRel.removeClass("active");
		btnList_treeLayout.removeClass("active");
		toolbarDec.removeClass("hidden");
		toolbarTree.addClass("hidden");
		$(window).off('resize.treeResize');
		// eventuell neues objekt und nicht gleich instanzieren
		var data = [];
		//todo
		var data = [];
		$("#relationTypes option:selected").each(function() {
			data.push($(this).val());
		});
		decisionGraph.initialize(data);
	});

	btnList_OutRel.on('click', function(event) {
		btnList_OutRel.addClass("active");
		btnList_DecRel.removeClass("active");
		btnList_treeLayout.removeClass("active");
		toolbarDec.addClass("hidden");
		toolbarTree.addClass("hidden");
		// eventuell neues objekt und nicht gleich instanzieren lassen
		outcomeGraph.initialize();
	});
}