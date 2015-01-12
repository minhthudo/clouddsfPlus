var resizeId;

// var decRelGraph, outRelGraph, hierRelGraph;

$(window).load(function() {

	setSubnavButtons();
	setToolbarButtons();
	$(window).on('resize.treeResize', function() {
		clearTimeout(resizeId);
		resizeId = setTimeout(treeGraph.resizeLayout, 500);
	});
	// treeGraph.initialize();
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

	$('#showAll').on('click', function(event) {
		outcomeGraph.showAllRelations();
	});
	$('#hideAll').on('click', function(event) {
		outcomeGraph.hideAllRelations();
	});
	$('#fixLayout').on('click', function(event) {
		outcomeGraph.fixLayout();
	});

	$('#looseLayout').on('click', function(event) {
		outcomeGraph.looseLayout();
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
		buttonWidth : "100%",
		nonSelectedText : 'Select relationship type(s)',
		selectAllText : 'Select All',
		allSelectedText : 'Influencing, Requiring, Affecting, Binding',
		includeSelectAllOption : true,
	});
	
	$('#outcomeRelationTypes').multiselect({
		onChange : function(event) {
			var data = [];
			$("#outcomeRelationTypes option:selected").each(function() {
				data.push($(this).val());
			});
			console.log(data);
			outcomeGraph.setRelationTypes(data);
		},
		numberDisplayed : 5,
		buttonWidth : "100%",
		nonSelectedText : 'Select relationship type(s)',
		selectAllText : 'Select All',
		allSelectedText : 'Including, Excluding, Allowing, Affecting, Binding',
		includeSelectAllOption : true,
	});
}

function setSubnavButtons() {
	var btnList_DecRel = $('#btnList_DecRel');
	var btnList_OutRel = $('#btnList_OutRel');
	var toolbarDec = $('#toolbarDecisions');
	var toolbarTree = $('#toolbarTree');
	var btnList_treeLayout = $('#btnList_treeLayout');
	var toolbarOut = $("#toolbarOutcomes");

	btnList_treeLayout.on('click', function(event) {
		$(".subnav li").removeClass("active");
		btnList_treeLayout.parent().addClass("active");
		toolbarDec.addClass("hidden");
		toolbarOut.addClass("hidden");
		toolbarTree.removeClass("hidden");
		$(window).off('resize.decResize');
		treeGraph.initialize();
		$(window).on('resize.treeResize', function() {
			clearTimeout(resizeId);
			resizeId = setTimeout(treeGraph.resizeLayout, 500);
		});
	});

	btnList_DecRel.on('click', function(event) {
		$(".subnav li").removeClass("active");
		btnList_DecRel.parent().addClass("active");
		toolbarOut.addClass("hidden");
		toolbarDec.removeClass("hidden");
		toolbarTree.addClass("hidden");
		$(window).off('resize.treeResize');
		var data = [];
		$("#relationTypes option:selected").each(function() {
			data.push($(this).val());
		});
		decisionGraph.initialize(data);
		$(window).on('resize.decResize', function() {
			var data = [];
			$("#relationTypes option:selected").each(function() {
				data.push($(this).val());
			});
			clearTimeout(resizeId);
			resizeId = setTimeout(decisionGraph.resizeLayout(data), 500);
		});
	});

	btnList_OutRel.on('click', function(event) {
		$(".subnav li").removeClass("active");
		btnList_OutRel.parent().addClass("active");
		toolbarDec.addClass("hidden");
		toolbarTree.addClass("hidden");
		toolbarOut.removeClass("hidden");

		$(window).off('resize.treeResize');
		$(window).off('resize.decResize');
		// eventuell neues objekt und nicht gleich instanzieren lassen
		outcomeGraph.initialize();
	});
}