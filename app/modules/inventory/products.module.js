(function() {
  'use strict';

  // Create module with DataTables dependencies using the factory
  // Renamed from singApp.inventory to singApp.products for consistency
  ModuleFactory.createModuleWithStates('singApp.products', [
    {
      name: 'app.products',
      url: '/products',
      templateUrl: 'app/modules/inventory/inventory.html',
      controller: 'AngularWayCtrl',
      controllerAs: 'vm'
    }
  ], ['datatables', 'datatables.bootstrap']);

})();
