/**
 * 
 */
var modals = (function() {
	var lookup = dynamicGraph.getLookup();
	var strong = "<strong>";
	var endStrong = "</strong>";
	var br = "<br>";
	/**
	 * @memberOf modals
	 */
	function changeOutcomeWihtinDecision(tempNode) {
		var outcome = lookup[tempNode.id];
		var parent = lookup[outcome.parent];
		var text = "Only one outcome per decision can be selected. Do you really want to change the outcome to "
				+ strong
				+ outcome.label
				+ endStrong
				+ " of the "
				+ strong
				+ parent.label
				+ endStrong
				+ +" decision?"
				+ br
				+ br
				+ "Description: " + outcome.description;
		bootbox.dialog({
			message : text,
			title : "Change outcome of decision " + parent.label + "?",
			buttons : {
				success : {
					label : "Yes!",
					className : "btn-danger",
					callback : function() {
						dynamicGraph.selectDecisionOutcome(tempNode);
					}
				},
				danger : {
					label : "Hell No!",
					className : "btn-default",
					callback : function() {
						return;
					}
				}
			}
		});
	}
	/**
	 * @memberOf modals
	 */
	function forceExcludedOutcome(tempNode, selectable) {
		var outcome = lookup[tempNode.id];
		var parent = lookup[outcome.parent];
		var restrictingNodes = tempNode.getRestrictingNodes();

		var text = "The outcome " + strong + outcome.label + endStrong
				+ " is already restricted by the following ";
		if (restrictingNodes.length > 1) {
			text += "outcomes that will be deselected: " + br + br;
		} else {
			text += "outcome that will be deselected: " + br + br;
		}

		$.each(restrictingNodes, function(index, value) {
			text += strong + (index + 1) + ". " + value.label + endStrong + br;
		});

		if (selectable === false) {
			text += '<hr><div class="bg-danger"><p>Since only one outcome per decision can be selected, the outcome '
					+ strong
					+ outcome.label
					+ endStrong
					+ ' of the '
					+ strong
					+ parent.label
					+ endStrong
					+ ' decision will be replaced by '
					+ strong
					+ tempNode.label + endStrong + '</p></div>';
		}

		bootbox
				.dialog({
					message : text,
					title : "Force Outcome Selection of " + parent.label
							+ " decision?",
					buttons : {
						success : {
							label : "Yes!",
							className : "btn-danger",
							callback : function() {
								dynamicGraph
										.forceExcludedSelectableOutcome(tempNode);
							}
						},
						danger : {
							label : "Hell No!",
							className : "btn-default",
							callback : function() {
								return;
							}
						}
					}
				});
	}

	return {
		changeOutcomeWihtinDecision : changeOutcomeWihtinDecision,
		forceExcludedOutcome : forceExcludedOutcome,
	};

})();