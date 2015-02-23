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

var kbStartup = (function() {
  var btnList_DecRel = $('#btnList_DecRel');
  var btnList_OutRel = $('#btnList_OutRel');
  var toolbarDec = $('#toolbarDecisions');
  var toolbarTree = $('#toolbarTree');
  var btnList_treeLayout = $('#btnList_treeLayout');
  var toolbarOut = $("#toolbarOutcomes");

  var setTreeGraphToolbar = (function() {
    $('#showDps').on('click', function(event) {
      hierarchicalLayout.showDps();
    });
    $('#showDecs').on('click', function(event) {
      hierarchicalLayout.showDecisions();
    });
    $('#showOutcomes').on('click', function(event) {
      hierarchicalLayout.showOutcomes();
    });
  })();

  var setDecisionGraphToolbar = (function() {
    $("[name='toggleBinding']").bootstrapSwitch('labelText', "Binding")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              setDecisionRelations(state, "binding");
            });

    $("[name='toggleInfluencing']").bootstrapSwitch('labelText', "Influencing")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              setDecisionRelations(state, "influencing");
            });
    $("[name='toggleAffecting']").bootstrapSwitch('labelText', "Affecting")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              setDecisionRelations(state, "affecting");
            });
    $("[name='toggleRequiring']").bootstrapSwitch('labelText', "Requiring")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              setDecisionRelations(state, "requiring");
            });
    $("[name='toggleAll']").bootstrapSwitch('labelText', "All")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on(
                    'switchChange.bootstrapSwitch',
                    function(event, state) {
                      $('.toggle-state-switch').each(function(index) {
                        $(this).bootstrapSwitch('state', state, true);
                      });
                      if (state === true) {
                        var relations = ["requiring", "influencing",
                            "affecting", "binding"];
                        decisionGraph.setAllRelations(relations);
                      } else
                        decisionGraph.removeAllRelations();
                    });
  })();

  var setOutcomeGraphToolbar = (function() {
    // $('#showAll').on('click', function(event) {
    // outcomeGraph.showAllRelations();
    // });
    // $('#hideAll').on('click', function(event) {
    // outcomeGraph.hideAllRelations();
    // });
    // $('#fixLayout').on('click', function(event) {
    // outcomeGraph.fixLayout();
    // });
    //
    // $('#looseLayout').on('click', function(event) {
    // outcomeGraph.looseLayout();
    // });

    $("[name='showHideAllRelations']").bootstrapSwitch('labelText',
            "Highlight all Outcomes").bootstrapSwitch('labelWidth', "134")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              console.log(event);
              if (state === true) {
                outcomeGraph.showAllRelations();
              } else {
                outcomeGraph.hideAllRelations();
              }
            });

    $("[name='fixLooseLayout']").bootstrapSwitch('labelText', "Fixed Layout")
            .bootstrapSwitch('labelWidth', "80").bootstrapSwitch('state', true)
            .bootstrapSwitch('size', 'small').on(
                    'switchChange.bootstrapSwitch', function(event, state) {
                      if (state === true) {
                        outcomeGraph.fixLayout();
                      } else {
                        outcomeGraph.looseLayout();
                      }
                    });

    $("[name='outBinding']").bootstrapSwitch('labelText', "Binding")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              setOutcomeRelations(state, "eb");
            });

    $("[name='outExcluding']").bootstrapSwitch('labelText', "Excluding")
            .bootstrapSwitch('state', true).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              setOutcomeRelations(state, "ex");
            });

    $("[name='outAffecting']").bootstrapSwitch('labelText', "Affecting")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              setOutcomeRelations(state, "aff");
            });

    $("[name='outAllowing']").bootstrapSwitch('labelText', "Allowing")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              setOutcomeRelations(state, "a");
            });

    $("[name='outIncluding']").bootstrapSwitch('labelText', "Including")
            .bootstrapSwitch('state', true).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              setOutcomeRelations(state, "in");
            });

    $("[name='outcomeToggleAll']").bootstrapSwitch('labelText', "All")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              $('.out-state-switch').each(function(index) {
                $(this).bootstrapSwitch('state', state, true);
              });
              if (state === true) {
                var relations = ["ex", "in", "aff", "a", "eb"];
                outcomeGraph.setAllRelations(relations);
              } else
                outcomeGraph.removeAllRelations();
            });
  })();

  var setSubnavButtons = (function() {
    btnList_DecRel.on('click', activateDecisionGraphLayout);
    btnList_OutRel.on('click', activateOutcomeGraphLayout);
    btnList_treeLayout.on('click', activateTreeLayout);
  })();

  var setResizeListener = (function() {
    $(window).on('resize.treeResize', function() {
      setTimeout(hierarchicalLayout.resizeLayout, 500);
    });
  })();

  function setDecisionRelations(state, type) {
    if (state === true) {
      decisionGraph.addRelationType(type);
    } else {
      decisionGraph.removeRelationType(type);
    }
  }

  function setOutcomeRelations(state, type) {
    if (state === true) {
      outcomeGraph.addRelationType(type);
    } else {
      outcomeGraph.removeRelationType(type);
    }
  }

  function activateTreeLayout(event) {
    $(".subnav li").removeClass("active");
    btnList_treeLayout.parent().addClass("active");
    toolbarDec.addClass("hidden");
    toolbarOut.addClass("hidden");
    toolbarTree.removeClass("hidden");
    $(window).off('resize.decResize');
    hierarchicalLayout.initialize(false);
    $(window).on('resize.treeResize', function() {
      clearTimeout(resizeId);
      resizeId = setTimeout(hierarchicalLayout.resizeLayout, 500);
    });
  }

  function activateDecisionGraphLayout(event) {
    $(".subnav li").removeClass("active");
    btnList_DecRel.parent().addClass("active");
    toolbarOut.addClass("hidden");
    toolbarDec.removeClass("hidden");
    toolbarTree.addClass("hidden");
    $(window).off('resize.treeResize');
    decisionGraph.initialize(false);
    $(window).on('resize.decResize', function() {
      clearTimeout(resizeId);
      resizeId = setTimeout(decisionGraph.resizeLayout, 500);
    });
  }

  function activateOutcomeGraphLayout(event) {
    $(".subnav li").removeClass("active");
    btnList_OutRel.parent().addClass("active");
    toolbarDec.addClass("hidden");
    toolbarTree.addClass("hidden");
    toolbarOut.removeClass("hidden");
    $(window).off('resize.treeResize');
    $(window).off('resize.decResize');
    outcomeGraph.initialize();
  }

  return {
    setSubnavButtons: setSubnavButtons,
    setOutcomeGraphToolbar: setOutcomeGraphToolbar,
    setDecisionGraphToolbar: setDecisionGraphToolbar,
    setTreeGraphToolbar: setTreeGraphToolbar,
  };
})();