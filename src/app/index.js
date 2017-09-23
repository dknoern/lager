(function() {
    'use strict';

    angular
        .module('singApp', [
        'auth0.auth0',
        'ui.router',
        'angularFileUpload',
        'singApp.core',
        'singApp.customers',
        'singApp.customer',
        'singApp.components.dropzone',
        'singApp.inventory',
        'singApp.item',
        'singApp.invoices',
        'singApp.invoice',
        'singApp.returns',
        'singApp.return',
        'singApp.repairs',
        'singApp.reports',
        'singApp.form.validation',
        'singApp.form.wizard'

  ]).config(config);

        config.$inject = [
          '$stateProvider',
          '$locationProvider',
          '$urlRouterProvider'
          ,'angularAuth0Provider'
        ];

        function config(
          $stateProvider,
          $locationProvider,
          $urlRouterProvider
         , angularAuth0Provider
        ) {


            $stateProvider
            .state('callback', {
              url: '/callback',
              controller: 'CallbackController',
              templateUrl: 'app/callback/callback.html',
                controllerAs: 'vm'
              });

          angularAuth0Provider.init({
            clientID: AUTH0_CLIENT_ID,
            domain: AUTH0_DOMAIN,
            responseType: 'token id_token',
            audience: 'https://' + AUTH0_DOMAIN + '/userinfo',
            redirectUri: AUTH0_CALLBACK_URL,
            scope: 'openid profile',
            icon: 'https://www.demesy.com/media/wysiwyg/footer-logo.png'
          });

          $locationProvider.hashPrefix('');

          /// Comment out the line below to run the app
          // without HTML5 mode (will use hashes in routes)
        //  $locationProvider.html5Mode(true);
        }

      })();
