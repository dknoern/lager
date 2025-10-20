(function() {
  'use strict';

  /**
   * Angular Module Factory
   * Provides utilities for creating standardized Angular modules with common dependencies
   */

  // Standard dependencies used across most modules
  var STANDARD_DEPENDENCIES = [
    'ui.router',
    'ui.event',
    'ngResource',
    'singApp.components.dropzone',
    'ui.select'
  ];

  /**
   * Create a standard Angular module with common dependencies
   * @param {string} moduleName - Name of the module (e.g., 'singApp.customer')
   * @param {Array} additionalDeps - Additional dependencies specific to this module
   * @returns {Object} Angular module
   */
  function createStandardModule(moduleName, additionalDeps) {
    additionalDeps = additionalDeps || [];
    var allDeps = STANDARD_DEPENDENCIES.concat(additionalDeps);
    return angular.module(moduleName, allDeps);
  }

  /**
   * Create a simple state configuration with parameter injection
   * @param {string} stateName - Name of the state (e.g., 'app.customer')
   * @param {string} url - URL pattern for the state
   * @param {string} templateUrl - Path to the template
   * @param {Array} paramNames - Names of parameters to inject into scope
   * @returns {Object} State configuration object
   */
  function createSimpleState(stateName, url, templateUrl, paramNames) {
    paramNames = paramNames || [];
    
    var stateConfig = {
      url: url,
      templateUrl: templateUrl
    };

    if (paramNames.length > 0) {
      stateConfig.controller = function($scope, $stateParams, $location) {
        // Inject state parameters into scope
        paramNames.forEach(function(paramName) {
          if ($stateParams[paramName]) {
            $scope[paramName] = $stateParams[paramName];
          }
        });

        // Handle query parameters for special cases
        var queryParams = $location.search();
        Object.keys(queryParams).forEach(function(key) {
          if (queryParams[key]) {
            $scope[key] = queryParams[key];
          }
        });
      };
    }

    return stateConfig;
  }

  /**
   * Configure a module with multiple states using a simplified configuration
   * @param {Object} module - Angular module
   * @param {Array} stateConfigs - Array of state configuration objects
   * Each config should have: { name, url, templateUrl, params }
   */
  function configureStates(module, stateConfigs) {
    module.config(['$stateProvider', function($stateProvider) {
      stateConfigs.forEach(function(config) {
        var stateConfig = createSimpleState(
          config.name,
          config.url,
          config.templateUrl,
          config.params
        );
        
        // Allow custom controller override
        if (config.controller) {
          stateConfig.controller = config.controller;
        }
        
        $stateProvider.state(config.name, stateConfig);
      });
    }]);
  }

  /**
   * Create a complete module with states in one call
   * @param {string} moduleName - Name of the module
   * @param {Array} stateConfigs - Array of state configurations
   * @param {Array} additionalDeps - Additional module dependencies
   * @returns {Object} Configured Angular module
   */
  function createModuleWithStates(moduleName, stateConfigs, additionalDeps) {
    var module = createStandardModule(moduleName, additionalDeps);
    configureStates(module, stateConfigs);
    return module;
  }

  // Export utilities to global scope for use in module files
  window.ModuleFactory = {
    createStandardModule: createStandardModule,
    createSimpleState: createSimpleState,
    configureStates: configureStates,
    createModuleWithStates: createModuleWithStates,
    STANDARD_DEPENDENCIES: STANDARD_DEPENDENCIES
  };

})();
