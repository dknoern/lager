(function () {
  "use strict";

  angular.module("singApp").service("authService", authService);

  authService.$inject = ["$state", "angularAuth0", "$timeout"];

  function authService($state, angularAuth0, $timeout) {
    var userProfile;
    var tokenRenewalTimeout;

    function login() {
      angularAuth0.authorize();
    }

    function handleAuthentication() {
      angularAuth0.parseHash(function (err, authResult) {
        if (authResult && authResult.accessToken && authResult.idToken) {
          setSession(authResult);
          $state.go("app.inventory");
        } else if (err) {
          console.error("Authentication error:", err);

          // Show error message using Messenger if available
          if (typeof Messenger !== "undefined") {
            Messenger().post({
              message: "Login must be enabled by admin. Please request access.",
              type: "error",
              showCloseButton: true,
            });
          }

          $timeout(function () {
            $state.go("app.inventory");
          });
        }
      });
    }

    function setSession(authResult) {
      // Set the time that the access token will expire at
      var expiresAt = JSON.stringify(
        authResult.expiresIn * 1000 + new Date().getTime()
      );
      // if 2 hours, set to 30 min
      localStorage.setItem("access_token", authResult.accessToken);
      localStorage.setItem("id_token", authResult.idToken);
      localStorage.setItem("expires_at", expiresAt);
      scheduleRenewal();
    }

    function logout() {
      // Remove tokens and expiry time from localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("id_token");
      localStorage.removeItem("expires_at");
      localStorage.removeItem("user_profile");
      userProfile = null;
      clearTimeout(tokenRenewalTimeout);
      $state.go("app.inventory");
    }

    function isAuthenticated() {
      // Check whether the current time is past the
      // access token's expiry time
      var expiresAt = JSON.parse(localStorage.getItem("expires_at"));

      return new Date().getTime() < expiresAt;
    }

    function getProfile(cb) {
      var accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
      } else {
        angularAuth0.client.userInfo(accessToken, function (err, profile) {
          if (profile) {
            setUserProfile(profile);
          }
          cb(err, profile);
        });
      }
    }

    function setUserProfile(profile) {
      userProfile = profile;
      // Persist profile to localStorage
      if (profile) {
        localStorage.setItem("user_profile", JSON.stringify(profile));
      }
    }

    function getCachedProfile() {
      // First check memory cache
      if (userProfile) {
        return userProfile;
      }

      // Then check localStorage
      var storedProfile = localStorage.getItem("user_profile");
      if (storedProfile) {
        try {
          userProfile = JSON.parse(storedProfile);
          return userProfile;
        } catch (e) {
          // If parsing fails, remove corrupted data
          localStorage.removeItem("user_profile");
        }
      }

      return null;
    }

    function renewToken() {
      angularAuth0.checkSession({}, function (err, result) {
        if (err) {
          console.log("Could not get a new token. " + JSON.stringify(err));
          // Force logout on renewal failure
          logout();
        } else {
          setSession(result);
        }
      });
    }

    function scheduleRenewal() {
      // Clear any existing renewal timeout
      clearTimeout(tokenRenewalTimeout);
      
      var expiresAtString = localStorage.getItem("expires_at");
      if (!expiresAtString) return;
      
      var expiresAt = JSON.parse(expiresAtString);
      var now = Date.now();
      
      // Schedule renewal 5 minutes before expiration (300000ms = 5 min)
      var renewalTime = expiresAt - 300000;
      var delay = renewalTime - now;

      // Only schedule if we have at least 1 minute until renewal time
      if (delay > 60000) {
        tokenRenewalTimeout = setTimeout(function () {
          renewToken();
        }, delay);
      } else if (delay > 0) {
        // If less than 1 minute, renew immediately
        renewToken();
      }
    }

    return {
      login: login,
      getProfile: getProfile,
      getCachedProfile: getCachedProfile,
      handleAuthentication: handleAuthentication,
      logout: logout,
      isAuthenticated: isAuthenticated,
      scheduleRenewal: scheduleRenewal,
    };
  }
})();
