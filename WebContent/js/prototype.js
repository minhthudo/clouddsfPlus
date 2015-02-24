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
 * Set event listeners for the kb navigator and intitialize switch controls.
 * 
 * @author Metz
 * @module kbNavigatorStartup
 */
var kbNavigatorStartup = (function() {

  /**
   * Add event listeners to toolbar
   */
  var setToolbarButtons = function() {
    // switch buttons
    $("[name='toggleBinding']").bootstrapSwitch({
      'labelText': "Binding",
      'state': false,
      'size': 'small'
    }).on('switchChange.bootstrapSwitch', function(event, state) {
      setRelations(state, "eb");
    });

    $("[name='toggleAllowing']").bootstrapSwitch({
      'labelText': "Allowing",
      'state': false,
      'size': 'small'
    }).on('switchChange.bootstrapSwitch', function(event, state) {
      setRelations(state, "a");
    });

    $("[name='toggleAffecting']").bootstrapSwitch({
      'labelText': "Affecting",
      'state': false,
      'size': 'small'
    }).on('switchChange.bootstrapSwitch', function(event, state) {
      setRelations(state, "aff");
    });

    $("[name='toggleLastOutcome']").bootstrapSwitch({
      'labelText': "Relations of Last Selection",
      'state': true,
      'size': 'small'
    }).on('switchChange.bootstrapSwitch', function(event, state) {
      kbNavigator.setLastNode(state);
    });

    $("[name='toggleRequiring']").bootstrapSwitch({
      'labelText': "Overlay Requiring Relations",
      'state': false,
      'size': 'small'
    }).on('switchChange.bootstrapSwitch', function(event, state) {
      kbNavigator.setRequiring(state);
    });

    $('#resetAll').on('click', function(event) {
      kbNavigator.resetSelection();
    });

    $("#store").on('click', function() {
      this.download = "cloudDsfPlus.json";
      this.href = kbNavigator.getData();
    });

    $('#loadSelection').on('change', function() {
      var file = this.files[0];
      var reader = new FileReader();
      reader.onload = function(e) {
        var text = reader.result;
        var json = JSON.parse(text);
        kbNavigator.setData(json);
      };
      reader.readAsText(file);
      // reset file input to fire onchange event in case same file is selected
      this.value = null;
    });
  }();

  /**
   * Add or remove relation from outcomeGraph
   * 
   * @memberOf kbNavigatorStartup
   * @param state
   *          true or false for add or remove
   * @param type
   *          relationship type
   */
  function setRelations(state, type) {
    if (state === true) {
      kbNavigator.addRelationType(type);
    } else {
      kbNavigator.removeRelationType(type);
    }
  }

  return {
    setToolbarButtons: setToolbarButtons,
  };
})();