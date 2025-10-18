const { expressjwt: jwt } = require('express-jwt');
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
  audience: config.auth0.audience || "https://lager/api",
  issuer: config.auth0.issuer || "https://seattleweb.auth0.com/",
  algorithms: ['RS256'],
  requestProperty: 'user' // Store the decoded token in req.user instead of req.auth
});
