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

var cdsfPlus = (function() {

  var colorPalette3d = d3.scale.ordinal().domain(
          ["root", "dp1", "dec1", "out1", "dp2", "dec2", "out2", "dp3", "dec3",
              "out3", "dp4", "dec4", "out4"]).range([
  // cat20c dark (green, orange, purple, blue)
  "#bdbdbd",
  // dp1
  "#9ecae1", "#6baed6", "#3182bd",
  // dp2
  "#fdae6b", "#fd8d3c", "#e6550d",
  // dp3
  "#bcbddc", "#9e9ac8", "#756bb1",
  // dp4
  "#a1d99b", "#74c476", "#31a354", ]);

  var getColor = (function(d) {
    return colorPalette3d(d);
  });

  var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  };

  var marginConvention = (function marginConvention(padding, height, width) {
    $("body").css("min-width", "");
    var oWidth = parseInt($('#visContent').width());
    var oHeight = height;
    if (oWidth < width) {
      oWidth = width;
      $("body").css("min-width", oWidth + 30);
    } else {
      $("body").css("min-width", "");
    }

    var iWidth = oWidth - margin.left - margin.right;
    var iHeight = oHeight - margin.top - margin.bottom;
    var panelWidth = iWidth - padding.left - padding.right;
    var panelHeight = iHeight - padding.top - padding.bottom;

    return {
      "panelWidth": panelWidth,
      "panelHeight": panelHeight,
      "oWidth": oWidth,
      "oHeight": oHeight,
      "iWidth": iWidth,
      "iHeight": iHeight,
      "marginTop": margin.top,
      "marginRight": margin.right,
      "marginBottom": margin.bottom,
      "marginLeft": margin.left
    };
  });

  return {
    getColor: getColor,
    marginConvention: marginConvention,
  };
})();
