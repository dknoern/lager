(function () {

  'use strict';

    angular
        .module('singApp')
        .service('authService', authService);

  authService.$inject = ['$state', 'angularAuth0', '$timeout'];

  function authService($state, angularAuth0, $timeout) {

    var userProfile;
    var tokenRenewalTimeout;

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
        var expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
        //var expiresAt = JSON.stringify((authResult.expiresIn * 1000)  / 4.0 + new Date().getTime());
        // if 2 hours, set to 30 min
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);
      console.log("new expires at: "+ expiresAt);
      scheduleRenewal();

    //  alert("access_token="+ authResult.accessToken + ", id_token="+authResult.idToken);
    }

    function logout() {
      // Remove tokens and expiry time from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');
      clearTimeout(tokenRenewalTimeout);
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
      var expiresAt = JSON.parse(localStorage.getItem('expires_at'));

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

      function renewToken() {

          console.log("SCHEDULING RENEWAL!!!");

          angularAuth0.checkSession({},
              function(err, result) {
                  if (err) {
                      console.log( 'Could not get a new token. ' + JSON.stringify(err));
                  } else {
                      setSession(result);
                      console.log( 'Successfully renewed auth!');
                  }
              }
          );
      }

      function scheduleRenewal() {
         console.log("Scheduling token renewal");

          var expiresAt = JSON.parse(localStorage.getItem('expires_at'));

          var delay = expiresAt - Date.now();

          console.log("expire DELAY IS "+ delay + ", " + delay/1000/60 + ' minutes');

          if (delay > 0) {
              tokenRenewalTimeout = setTimeout(function() {
                  renewToken();
              }, delay);
          }
      }

    return {
      login: login,
      getProfile: getProfile,
      getCachedProfile: getCachedProfile,
      handleAuthentication: handleAuthentication,
      logout: logout,
      isAuthenticated: isAuthenticated,
        scheduleRenewal: scheduleRenewal
    }
  }
})();
