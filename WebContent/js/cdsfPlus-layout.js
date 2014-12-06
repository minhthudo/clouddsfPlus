var marginConvention = (function marginConvention(padding, height) {

	var margin = {
		top : 10,
		right : 10,
		bottom : 10,
		left : 10
	};

	var oWidth = parseInt($('#visContent').width());
	var oHeight = height || 900;

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

var f1, o1;

$(document).ready(function() {
	setSidebar();
	setSidebarButtons();
	
	// todo move to own file
	$('#bt_treeLayout').on('click', function(event) {
		drawTreeLayout();
	});
	$('#buttonGroupRelations .btn.active input').each(function(index) {
		$(this).prop("checked", true);
	});
	$('#buttonGroupRelations .btn').on('change', function() {
		if ($(this).prop("checked") == true) {
			$(this).prop("checked", false);
		} else {
			$(this).prop("checked", true);
		}
		var data = [];
		$('#buttonGroupRelations .btn input').each(function(index) {
			if ($(this).prop("checked") == true) {
				data.push(this.value);
			}
		});
		f1.setLinks(data);

	});
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
	var toolbar = $('#toolbarDecisions');
	btnList_DecRel.on('click', function(event) {
		btnList_DecRel.addClass("active");
		btnList_OutRel.removeClass("active");
		toolbar.removeClass("hidden");
		// eventuell neues objekt und nicht gleich instanzieren
		o1 = null;
		f1 = null;
		f1 =  new forceGraph();
		f1.initialize();
		var data = [];
		$('#buttonGroupRelations .btn input').each(function(index) {
			if ($(this).prop("checked") == true) {
				data.push(this.value);
			}
		});	
		if(f1!=null){
			f1.setLinks(data);	
		}
	});

	btnList_OutRel.on('click', function(event) {
		btnList_OutRel.addClass("active");
		btnList_DecRel.removeClass("active");
		toolbar.addClass("hidden");
		// eventuell neues objekt und nicht gleich instanizieren lassen
		f1 = null;
		o1 = null;
		o1 = new outcomeGraph();
	});
}