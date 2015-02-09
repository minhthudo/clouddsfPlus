/**
 * 
 */
var prototypeStartup = (function() {

  var setToolbarButtons = function() {
    
    

    $("[name='toggleBinding']").bootstrapSwitch('labelText', "Binding")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              setRelations(state, "eb");
            });

    $("[name='toggleAllowing']").bootstrapSwitch('labelText', "Allowing")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              setRelations(state, "a");
            });
    $("[name='toggleAffecting']").bootstrapSwitch('labelText', "Affecting")
            .bootstrapSwitch('state', false).bootstrapSwitch('size', 'small')
            .on('switchChange.bootstrapSwitch', function(event, state) {
              setRelations(state, "aff");
            });

    $("[name='toggleLastOutcome']").bootstrapSwitch('labelText',
            "Relations of Last Selection").bootstrapSwitch('state', true)
            .bootstrapSwitch('size', 'small').on(
                    'switchChange.bootstrapSwitch', function(event, state) {
                      dynamicGraph.setLastNode(state);
                    });

    
    $("[name='toggleRequiring']").bootstrapSwitch('labelText',
    "Overlay Requiring Relations").bootstrapSwitch('state', false)
    .bootstrapSwitch('size', 'small').on(
            'switchChange.bootstrapSwitch', function(event, state) {
              dynamicGraph.setRequiring(state);
            });

    
    $('#resetAll').on('click', function(event) {
      dynamicGraph.resetSelection();
    });

    $("#store").on('click', function() {
      // hope the server sets Content-Disposition: attachment!
      this.download = "cloudDsfPlus.json";
      this.href = dynamicGraph.getData();
    });

    $('#loadSelection').on('change', function() {
      var file = this.files[0];
      var reader = new FileReader();
      reader.onload = function(e) {
        var text = reader.result;
        var json = JSON.parse(text);
        dynamicGraph.setData(json);
      };
      reader.readAsText(file);
    });
  };

  function setRelations(state, type) {
    if (state === true) {
      dynamicGraph.addRelationType(type);
    } else {
      dynamicGraph.removeRelationType(type);
    }
  }

  return {
    setToolbarButtons: setToolbarButtons,
  };
})();

$(window).load(function() {
  prototypeStartup.setToolbarButtons();
});
