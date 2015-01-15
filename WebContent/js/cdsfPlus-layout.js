//var colorPalette1 = d3.scale.ordinal().domain(
//		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
//				"out3", "dp4", "dec4", "out4" ]).range([
//// cat20b light (blue, green, brown, pink)
//"#636363",
//
//"#5254a3", "#6b6ecf", "#9c9ede",
//
//"#8ca252", "#b5cf6b", "#cedb9c",
//
//"#bd9e39", "#e7ba52", "#e7cb94",
//
//"#a55194", "#ce6dbd", "#de9ed6" ]);
//
//var colorPalette2 = d3.scale.ordinal().domain(
//		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
//				"out3", "dp4", "dec4", "out4" ]).range([
//// cat20b light (blue, green, brown, red)
//"#636363",
//
//"#5254a3", "#6b6ecf", "#9c9ede",
//
//"#8ca252", "#b5cf6b", "#cedb9c",
//
//"#bd9e39", "#e7ba52", "#e7cb94",
//
//"#ad494a", "#d6616b", "#e7969c" ]);
//
//var colorPalette3a = d3.scale.ordinal().domain(
//		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
//				"out3", "dp4", "dec4", "out4" ]).range([
//// cat20c dark (blue, orange, green, purple)
//"#636363",
//
//"#3182bd", "#6baed6", "#9ecae1",
//
//"#e6550d", "#fd8d3c", "#fdae6b",
//
//"#31a354", "#74c476", "#a1d99b",
//
//"#756bb1", "#9e9ac8", "#bcbddc" ]);
//
//var colorPalette3b = d3.scale.ordinal().domain(
//		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
//				"out3", "dp4", "dec4", "out4" ]).range([
//// cat20c dark (green, orange, purple, blue)
//"#636363",
//
//"#31a354", "#74c476", "#a1d99b",
//
//"#e6550d", "#fd8d3c", "#fdae6b",
//
//"#756bb1", "#9e9ac8", "#bcbddc",
//
//"#3182bd", "#6baed6", "#9ecae1", ]);
//
//var colorPalette3c = d3.scale.ordinal().domain(
//		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
//				"out3", "dp4", "dec4", "out4" ]).range([
//// cat20c dark (purple, green, orange, blue)
//"#636363",
//
//"#756bb1", "#9e9ac8", "#bcbddc",
//
//"#31a354", "#74c476", "#a1d99b",
//
//"#e6550d", "#fd8d3c", "#fdae6b",
//
//"#3182bd", "#6baed6", "#9ecae1", ]);

var colorPalette3d = d3.scale.ordinal().domain(
		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
				"out3", "dp4", "dec4", "out4" ]).range([
// cat20c dark (green, orange, purple, blue)
"#636363",

"#9ecae1", "#6baed6", "#3182bd",

"#fdae6b", "#fd8d3c", "#e6550d",

"#bcbddc", "#9e9ac8", "#756bb1",

"#a1d99b", "#74c476", "#31a354", ]);

// var colorPalette4 = d3.scale.ordinal().domain(
// [ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
// "out3", "dp4", "dec4", "out4" ]).range([
// // cat20c light (blue, green, brown, red)
// "#636363",
//
// "#6baed6", "#9ecae1", "#c6dbef",
//
// "#fd8d3c", "#fdae6b", "#fdd0a2",
//
// "#74c476", "#a1d99b", "#c7e9c0",
//
// "#9e9ac8", "#bcbddc", "#dadaeb" ]);

var getColor = function(d) {
	return colorPalette3d(d);
};

var marginConvention = (function marginConvention(padding, height, width) {

	var margin = {
		top : 10,
		right : 10,
		bottom : 10,
		left : 10
	};

	var oWidth = parseInt($('#visContent').width());
	console.log(oWidth);
	var oHeight = height || 900;
	oWidth = oWidth < 900 ? 900 : oWidth;
	if (typeof width !== "undefined") {
		if (oWidth < width) {
			oWidth = width;
		}
	}

	var iWidth = oWidth - margin.left - margin.right;
	var iHeight = oHeight - margin.top - margin.bottom;
	var panelWidth = iWidth - padding.left - padding.right;
	var panelHeight = iHeight - padding.top - padding.bottom;

	return {
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
	};
});

// var decRelGraph, outRelGraph, hierRelGraph;

// $(document).ready(function() {
// todo move to own file

// $('#buttonGroupRelations .btn.active input').each(function(index) {
// $(this).prop("checked", true);
// });

// setSidebar();
// setSidebarButtons();

// });

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