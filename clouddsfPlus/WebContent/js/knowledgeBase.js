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
 * Set event listenser for kb visualizer toolbars their functionalities and
 * enable subnavigation.
 *
 * @author Metz
 * @module kbVisualizerStartup
 */
var kbVisualizerStartup = (function() {
    var btnList_DecRel = $('#btnList_DecRel');
    var btnList_OutRel = $('#btnList_OutRel');
    var toolbarDec = $('#toolbarDecisions');
    var toolbarTree = $('#toolbarTree');
    var btnList_treeLayout = $('#btnList_treeLayout');
    var toolbarOut = $("#toolbarOutcomes");

    /**
     * Add event listener to Hierarchical Layout
     */
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

    /**
     * Add event listener to Decision Relations Layout
     */
    var setDecisionGraphToolbar = (function() {
        $("[name='toggleBinding']").bootstrapSwitch({
            'labelText': "Binding",
            'state': false,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            setDecisionRelations(state, "binding");
        });

        $("[name='toggleAffecting']").bootstrapSwitch({
            'labelText': "Affecting",
            'state': false,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            setDecisionRelations(state, "affecting");
        });

        $("[name='toggleInfluencing']").bootstrapSwitch({
            'labelText': "Influencing",
            'state': false,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            setDecisionRelations(state, "influencing");
        });

        $("[name='toggleRequiring']").bootstrapSwitch({
            'labelText': "Requiring",
            'state': false,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            setDecisionRelations(state, "requiring");
        });

        $("[name='toggleAll']").bootstrapSwitch({
            'labelText': "All",
            'state': false,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            $('.toggle-state-switch').each(function(index) {
                $(this).bootstrapSwitch('state', state, true);
            });
            if (state === true) {
                var relations = ["binding", "affecting", "influencing", "requiring"];
                decisionGraph.setAllRelations(relations);
            } else
                decisionGraph.removeAllRelations();
        });
    })();

    /**
     * Add event listener to Outcome Relations Layout
     */
    var setOutcomeGraphToolbar = (function() {

        $("[name='showHideAllRelations']").bootstrapSwitch({
            'labelText': "Highlight all Outcomes",
            'labelWidth': "134",
            'state': false,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            if (state === true) {
                outcomeGraph.showAllRelations();
            } else {
                outcomeGraph.hideAllRelations();
            }
        });

        $("[name='fixLooseLayout']").bootstrapSwitch({
            'labelText': "Fixed Layout",
            'labelWidth': "80",
            'state': true,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            if (state === true) {
                outcomeGraph.fixLayout();
            } else {
                outcomeGraph.looseLayout();
            }
        });

        $("[name='outIncluding']").bootstrapSwitch({
            'labelText': "Including",
            'state': true,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            setOutcomeRelations(state, "in");
        });

        $("[name='outExcluding']").bootstrapSwitch({
            'labelText': "Excluding",
            'state': true,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            setOutcomeRelations(state, "ex");
        });

        $("[name='outAllowing']").bootstrapSwitch({
            'labelText': "Allowing",
            'state': false,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            setOutcomeRelations(state, "a");
        });

        $("[name='outConditionalAllowing']").bootstrapSwitch({
            'labelText': "Conditional Allowing",
            'labelWidth': "120",
            'state': false,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            setOutcomeRelations(state, "ca");
        });

        $("[name='outAllowingPlus']").bootstrapSwitch({
            'labelText': "Allowing Plus",
            'state': false,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            setOutcomeRelations(state, "ap");
        });

        $("[name='outArbitraryAllowing']").bootstrapSwitch({
            'labelText': "Arbitrary Allowing",
            'labelWidth': "120",
            'state': false,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            setOutcomeRelations(state, "aa");
        });

        $("[name='outcomeToggleAll']").bootstrapSwitch({
            'labelText': "All",
            'state': false,
            'size': 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            $('.out-state-switch').each(function(index) {
                $(this).bootstrapSwitch('state', state, true);
            });
            if (state === true) {
                var relations = ["in", "ex", "a", "ca", "ap", "aa"];
                outcomeGraph.setAllRelations(relations);
            } else
                outcomeGraph.removeAllRelations();
        });
    })();

    /**
     * Add event listener to subnavigation
     */
    var setSubnavButtons = (function() {
        btnList_DecRel.on('click', activateDecisionGraphLayout);
        btnList_OutRel.on('click', activateOutcomeGraphLayout);
        btnList_treeLayout.on('click', activateTreeLayout);
    })();

    /**
     * Set resize listener for Hierarchical Layout
     */
    var setResizeListener = (function() {
        $(window).on('resize.treeResize', function() {
            setTimeout(hierarchicalLayout.resizeLayout, 500);
        });
    })();

    /**
     * Add or remove relation from decisionGraph
     *
     * @param state
     *          true or false for add or remove
     * @param type
     *          relationship type
     */
    function setDecisionRelations(state, type) {
        if (state === true) {
            decisionGraph.addRelationType(type);
        } else {
            decisionGraph.removeRelationType(type);
        }
    }

    /**
     * Add or remove relation from outcomeGraph
     *
     * @param state
     *          true or false for add or remove
     * @param type
     *          relationship type
     */
    function setOutcomeRelations(state, type) {
        if (state === true) {
            outcomeGraph.addRelationType(type);
        } else {
            outcomeGraph.removeRelationType(type);
        }
    }

    /**
     * Switch to Hierarchical Layout (subnav)
     */
    function activateTreeLayout(event) {
        $(".subnav li").removeClass("active");
        btnList_treeLayout.parent().addClass("active");
        toolbarDec.addClass("hidden");
        toolbarOut.addClass("hidden");
        toolbarTree.removeClass("hidden");
        $(window).off('resize.decResize');
        hierarchicalLayout.initialize(false);
        $(window).on('resize.treeResize', function() {
            setTimeout(hierarchicalLayout.resizeLayout, 500);
        });
    }

    /**
     * Switch to Decision Relations Layout (subnav)
     */
    function activateDecisionGraphLayout(event) {
        $(".subnav li").removeClass("active");
        btnList_DecRel.parent().addClass("active");
        toolbarOut.addClass("hidden");
        toolbarDec.removeClass("hidden");
        toolbarTree.addClass("hidden");
        $(window).off('resize.treeResize');
        decisionGraph.initialize(false);
        $(window).on('resize.decResize', function() {
            setTimeout(decisionGraph.resizeLayout, 500);
        });
    }

    /**
     * Switch to Outcome Relations Layout (subnav)
     */
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
