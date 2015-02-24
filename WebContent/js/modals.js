/*
 * Copyright 2015 Balduin Metz
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * Provide modals for the KB Navigator to enable feedback and user input.
 * 
 * @author Metz
 * @module kbNavigatorModals
 */
var kbNavigatorModals = (function() {
  // Helper strings
  var strong = "<strong>";
  var endStrong = "</strong>";
  var br = "<br>";

  /**
   * Modal during creation of KB Navigator graph.
   * 
   * @memberOf kbNavigatorModals
   */
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
   * Modal if decision is selected and outcome selection would change the
   * decision.
   * 
   * @memberOf kbNavigatorModals
   * @param tempNode
   *          selected outcome in the kb navigator
   */
  function changeOutcomeWihtinDecision(tempNode) {
    var lookup = kbNavigator.getLookup();
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
          label: "Yes, select outcome!",
          className: "btn-danger",
          // In case of approval change outcome to new selection
          callback: function() {
            kbNavigator.selectDecisionOutcome(tempNode);
          }
        },
        danger: {
          label: "No, do nothing!",
          className: "btn-default",
          // In case of abort do nothing
          callback: function() {
            return;
          }
        }
      },
    });
  }

  /**
   * Modal if selected outcome is already excluded.
   * 
   * @memberOf kbNavigatorModals
   * @param tempNode
   *          selected outcome in the kb navigator
   * @param selectable
   *          Indicator if decision is also selected and outcome will change the
   *          decision as well.
   */
  function forceExcludedOutcome(tempNode, selectable) {
    var lookup = kbNavigator.getLookup();
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

    // Prepare text for all restricting nodes
    $.each(restrictingNodes, function(index, value) {
      text += strong + (index + 1) + ". " + value.label + endStrong + br;
    });

    if (selectable === false) {
      // Decision is already decided thus decision will also be changed.
      text += '<hr><div class="bg-info" style="padding:10px 10px;"><p>Since only one outcome per decision can be selected, the outcome '
              + strong
              + outcome.label
              + endStrong
              + ' will replace the current selected outcome of the '
              + strong
              + parent.label + endStrong + ' decision.</p></div>';
    }

    // Show dialog to user
    bootbox.dialog({
      message: text,
      backdrop: true,
      title: "Force outcome selection of the " + parent.label + " decision?",
      buttons: {
        success: {
          label: "Yes, select outcome!",
          className: "btn-danger",
          callback: function() {
            // Outcome shall be selected and all excluding outcomes resetted
            kbNavigator.forceExcludedSelectableOutcome(tempNode);
          }
        },
        danger: {
          label: "No, do nothing!",
          className: "btn-default",
          callback: function() {
            // User cancels action do nothing
            return;
          }
        }
      }
    });
  }

  function showRequiringSatisfied() {
    bootbox.alert("All requiring relations are currently satisfied.");
  }

  function showConflict(tempNode) {
    var lookup = kbNavigator.getLookup();
    var outcome = lookup[tempNode.id];
    var restrictingNodes = tempNode.getRestrictingNodes();
    var includingNodes = tempNode.getIncludingNodes();

    var textEx = "<h4><u>Excluding</u></h4>";
    var textIn = "<h4><u>Including</u></h4>";

    // Prepare text for all restricting nodes
    $.each(restrictingNodes, function(index, value) {
      textEx += strong + (index + 1) + ". " + value.label + endStrong + br;
    });

    // Prepare text for all restricting nodes
    $.each(includingNodes, function(index, value) {
      textIn += strong + (index + 1) + ". " + value.label + endStrong + br;
    });

    var startText = "The outcome "
            + strong
            + tempNode.label
            + endStrong
            + " cannot be selected because it is in a conflict due to the following including and excluding relations.";
    bootbox.dialog({
      backdrop: true,
      message: startText + br + textEx + textIn,
      title: "Conflict for outcome " + tempNode.label + "!",
      buttons: {
        main: {
          label: "Ok",
          className: "btn-default",
          callback: function() {
            return;
          }
        }
      },
    });
  }

  return {
    changeOutcomeWihtinDecision: changeOutcomeWihtinDecision,
    forceExcludedOutcome: forceExcludedOutcome,
    showProgress: showProgress,
    hideProgress: hideProgress,
    showRequiringSatisfied: showRequiringSatisfied,
    showConflict: showConflict,
  };
})();