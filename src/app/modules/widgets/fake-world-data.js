(function() {
  'use strict';

  angular.module('singApp.widgets')
    .factory('fakeWorldData', fakeWorldDataFactory)
  ;

  fakeWorldDataFactory.$inject = [];
  function fakeWorldDataFactory () {
    return fakeWorldData;
  }

  // Fake data for countries and cities from 2003 to 2013
  var fakeWorldData = {
    "2008": {
      "areas": {
        "AF": {
          "value": 19880820,
          "tooltip": {
            "content": "<span style=\"font-weight:bold;\">Afghanistan</span><br />Population : 19880820"
          }
        },
        "ZA": {
          "value": 25183856,
          "tooltip": {
            "content": "<span style=\"font-weight:bold;\">South Africa</span><br />Population : 25183856"
          }
        },
        "AL": {
          "value": 51947647,
          "tooltip": {
            "content": "<span style=\"font-weight:bold;\">Albania</span><br />Population : 51947647"
          }
        },
        "DZ": {
          "value": 25677417,
          "tooltip": {
            "content": "<span style=\"font-weight:bold;\">Algeria</span><br />Population : 25677417"
          }
        },
        "ZW": {
          "value": 28205545,
          "tooltip": {
            "content": "<span style=\"font-weight:bold;\">Zimbabwe</span><br />Population : 28205545"
          }
        }
      }
    }
  };

})();
