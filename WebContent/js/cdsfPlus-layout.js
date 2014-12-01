$(document).ready(
		function() {
			$('[data-toggle="offcanvas"]').on('click',
					function() {
						$('.row-offcanvas').toggleClass('active');
						$('#toggleButton > span').toggleClass(
								"glyphicon glyphicon-chevron-left");
						$('#toggleButton > span').toggleClass(
								"glyphicon glyphicon-chevron-right");
					});

			$('#buttonTree').on('click', function(event) {
				drawTreeLayout();
			});
			$('#buttonDecisionRelations').on('click', function(event) {
				var toolbar = $('#toolbarDecisions');
				toolbar.removeClass("hidden");
				forceGraph.update();
			});
			// $('#buttonTreeMap').on('click', function(event) {
			// createTreeMap();
			// });
			// $('#buttonPartition').on('click', function(event) {
			// createPartition();
			// });
			// drawTreeLayout();

			$("#updateDecisionRelations").on('click', function() {
				var data = [];
				$('#buttonGroupRelations .btn.active').each(function(index) {
					data.push(this.value);
				});
				forceGraph.setLinks(data);
			});
		});