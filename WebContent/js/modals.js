/**
 * 
 */
var modals = (function() {

  var strong = "<strong>";
  var endStrong = "</strong>";
  var br = "<br>";

  var progressbar = bootbox
          .dialog({

            message: "Please wait until the graph is created"
                    + br
                    + br
                    + '<div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span class="sr-only">100% Complete</span></div></div>',
            title: "Processing...",
            show: false,
            closeButton: false,
            backdrop: false,
            animate: false
          });

  var showProgress = (function() {
    progressbar.modal('show');
  });

  var hideProgress = (function() {
    progressbar.modal('hide');
  });

  /**
   * @memberOf modals
   */
  function changeOutcomeWihtinDecision(tempNode) {
    var lookup = dynamicGraph.getLookup();
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
            + " decision?"
            + br
            + br
            + "Description: " + outcome.description;
    bootbox.dialog({
      backdrop: true,
      message: text,
      title: "Change outcome of decision " + parent.label + "?",
      buttons: {
        success: {
          label: "Yes!",
          className: "btn-danger",
          callback: function() {
            dynamicGraph.selectDecisionOutcome(tempNode);
          }
        },
        danger: {
          label: "Hell No!",
          className: "btn-default",
          callback: function() {
            return;
          }
        }
      },

    });
  }
  /**
   * @memberOf modals
   */
  function forceExcludedOutcome(tempNode, selectable) {
    var lookup = dynamicGraph.getLookup();
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
              + strong + tempNode.label + endStrong + '</p></div>';
    }

    bootbox.dialog({
      message: text,
      backdrop: true,
      title: "Force Outcome Selection of " + parent.label + " decision?",
      buttons: {
        success: {
          label: "Yes!",
          className: "btn-danger",
          callback: function() {
            dynamicGraph.forceExcludedSelectableOutcome(tempNode);
          }
        },
        danger: {
          label: "Hell No!",
          className: "btn-default",
          callback: function() {
            return;
          }
        }
      }
    });
  }

  return {
    changeOutcomeWihtinDecision: changeOutcomeWihtinDecision,
    forceExcludedOutcome: forceExcludedOutcome,
    showProgress: showProgress,
    hideProgress: hideProgress
  };
})();