const jwtAuthz = require('express-jwt-authz');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const config = require('../config');
exports.checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://seattleweb.auth0.com/.well-known/jwks.json"
  }),

  // Validate the audience and the issuer.
  audience: "https://lager/api",
  issuer: "https://seattleweb.auth0.com/",
  algorithms: ['RS256']
});

exports.checkScopes = jwtAuthz([ 'read:messages' ]);
