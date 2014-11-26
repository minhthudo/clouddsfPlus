$(document).ready(
		function() {
			$('[data-toggle="offcanvas"]').click(
					function() {
						$('.row-offcanvas').toggleClass('active');
						$('#toggleButton > span').toggleClass(
								"glyphicon glyphicon-chevron-left");
						$('#toggleButton > span').toggleClass(
								"glyphicon glyphicon-chevron-right");
					});

			$('#buttonTree').on('click', function(event) {
				createTree();
			});
			$('#buttonTreeMap').on('click', function(event) {
				createTreeMap();
			});
			$('#buttonPartition').on('click', function(event) {
				createPartition();
			});
		});