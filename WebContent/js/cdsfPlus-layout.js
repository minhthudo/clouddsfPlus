var colorPalette3d = d3.scale.ordinal().domain(
		[ "root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
				"out3", "dp4", "dec4", "out4" ]).range([
// cat20c dark (green, orange, purple, blue)
"#636363",

"#9ecae1", "#6baed6", "#3182bd",

"#fdae6b", "#fd8d3c", "#e6550d",

"#bcbddc", "#9e9ac8", "#756bb1",

"#a1d99b", "#74c476", "#31a354", ]);

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