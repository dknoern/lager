(function() {
    'use strict';

    angular
        .module('singApp', [
        'auth0.auth0',
        'ui.router',
        'singApp.core',
        //'singApp.dashboard',
        //'singApp.form.elements',
        //'singApp.maps.google',
        //'singApp.maps.vector',
        //'singApp.grid',
        //'singApp.tables.basic',
        //'singApp.tables.dynamic',
        //'singApp.extra.calendar',
        //'singApp.extra.invoice',

        //'singApp.error',
        //'singApp.extra.gallery',
        //'singApp.extra.search',
        //'singApp.extra.timeline',
        //'singApp.ui.components',
        //'singApp.ui.notifications',
        //'singApp.ui.icons',
        //'singApp.ui.buttons',
        //'singApp.ui.tabs-accordion',
        //'singApp.ui.list-groups',
        //'singApp.inbox',
        //'singApp.profile',
        //'singApp.widgets',
        //'singApp.charts',
        'singApp.customers',
        'singApp.customer',
        'singApp.inventory',
        'singApp.item',
        'singApp.invoices',
        'singApp.invoice',
        'singApp.returns',
        'singApp.repairs',
        'singApp.reports',
        //'singApp.admin',
        'singApp.form.validation',
        'singApp.form.wizard'

  ]).config(config);

        config.$inject = [
          '$stateProvider',
          '$locationProvider',
          '$urlRouterProvider',
          'angularAuth0Provider'
        ];

        function config(
          $stateProvider,
          $locationProvider,
          $urlRouterProvider,
          angularAuth0Provider
        ) {


            $stateProvider
            /*.state('home', {
              url: '/',
              controller: 'HomeController',
              templateUrl: 'app/home/home.html',
              controllerAs: 'vm'
            })*/
            .state('callback', {
              url: '/callback',
              controller: 'CallbackController',
              templateUrl: 'app/callback/callback.html',
                controllerAs: 'vm'
              });



          // Initialization for the angular-auth0 library

          angularAuth0Provider.init({
            clientID: AUTH0_CLIENT_ID,
            domain: AUTH0_DOMAIN,
            responseType: 'token id_token',
            audience: 'https://' + AUTH0_DOMAIN + '/userinfo',
            redirectUri: AUTH0_CALLBACK_URL,
            scope: 'openid profile',
            icon: 'https://www.demesy.com/media/wysiwyg/footer-logo.png'
          });

        // $urlRouterProvider.otherwise('/');

          $locationProvider.hashPrefix('');

          /// Comment out the line below to run the app
          // without HTML5 mode (will use hashes in routes)
        //  $locationProvider.html5Mode(true);
        }

      })();
