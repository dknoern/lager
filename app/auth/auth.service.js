(function () {

  'use strict';

  angular
    .module('singApp.inventory')
    .service('authService', authService);

    angular
      .module('singApp.core')
      .service('authService', authService);

  authService.$inject = ['$state', 'angularAuth0', '$timeout'];

  function authService($state, angularAuth0, $timeout) {

    var userProfile;

    function login() {
      angularAuth0.authorize();
    }

    function handleAuthentication() {

      angularAuth0.parseHash(function(err, authResult) {

        if (authResult && authResult.accessToken && authResult.idToken) {
          setSession(authResult);
          $state.go('app.inventory');
        } else if (err) {
          //alert('error');
          $timeout(function() {
            $state.go('app.inventory');
          });
          console.log(err);

          //alert('Error: ' + err.error + '. Check the console for further details.');
          alert('Login must be enabled by admin, please request access');
        }
      });
    }

    function setSession(authResult) {
      // Set the time that the access token will expire at
      let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);
    }

    function logout() {
      // Remove tokens and expiry time from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');
      $state.go('app.inventory');
    }

    function isAuthenticated() {

      //if(userProfile && userProfile.sub) alert("sub:"+ userProfile.sub)

      //if(userProfile && userProfile.sub && userProfile.sub !='facebook|10212774134421457')
      //return false
      //alert('profile='+ JSON.stringify(userProfile));

      // to bypass auth, uncomment the following:
      //return true;

      // Check whether the current time is past the
      // access token's expiry time
      let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      return new Date().getTime() < expiresAt;
    }

    function getProfile(cb) {
      var accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        //throw new Error('Access token must exist to fetch profile');
      }else{
        angularAuth0.client.userInfo(accessToken, function(err, profile) {
          if (profile) {
            setUserProfile(profile);
          }
          cb(err, profile);
        });
      }
    }

    function setUserProfile(profile) {
      userProfile = profile;

    }

    function getCachedProfile() {



      return userProfile;
    }

    return {
      login: login,
      getProfile: getProfile,
      getCachedProfile: getCachedProfile,
      handleAuthentication: handleAuthentication,
      logout: logout,
      isAuthenticated: isAuthenticated
    }
  }
})();
