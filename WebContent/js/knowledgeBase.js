var resizeId;

// var decRelGraph, outRelGraph, hierRelGraph;

$(window).load(function() {

	setSubnavButtons();
	setToolbarButtons();
	treeGraph.initialize();
});

function setToolbarButtons() {
	$('#showDps').on('click', function(event) {
		treeGraph.showDps();
	});
	$('#showDecs').on('click', function(event) {
		treeGraph.showDecisions();
	});
	$('#showOutcomes').on('click', function(event) {
		treeGraph.showOutcomes();
	});

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
}

function setSubnavButtons() {
	var btnList_DecRel = $('#btnList_DecRel');
	var btnList_OutRel = $('#btnList_OutRel');
	var toolbarDec = $('#toolbarDecisions');
	var toolbarTree = $('#toolbarTree');
	var btnList_treeLayout = $('#btnList_treeLayout');
	
	btnList_treeLayout.on('click', function(event) {
		$(".subnav li").removeClass("active");
		btnList_treeLayout.parent().addClass("active");
		toolbarDec.addClass("hidden");
		toolbarTree.removeClass("hidden");
		treeGraph.initialize();
		$(window).on('resize.treeResize', function() {
			clearTimeout(resizeId);
			resizeId = setTimeout(treeGraph.resizeLayout, 500);
		});
	});

	btnList_DecRel.on('click', function(event) {
		$(".subnav li").removeClass("active");
		btnList_DecRel.parent().addClass("active");
		toolbarDec.removeClass("hidden");
		toolbarTree.addClass("hidden");
		$(window).off('resize.treeResize');
		// eventuell neues objekt und nicht gleich instanzieren
		var data = [];
		// todo
		var data = [];
		$("#relationTypes option:selected").each(function() {
			data.push($(this).val());
		});
		decisionGraph.initialize(data);
	});

	btnList_OutRel.on('click', function(event) {
		$(".subnav li").removeClass("active");
		btnList_OutRel.parent().addClass("active");
		toolbarDec.addClass("hidden");
		toolbarTree.addClass("hidden");
		// eventuell neues objekt und nicht gleich instanzieren lassen
		outcomeGraph.initialize();
	});
}