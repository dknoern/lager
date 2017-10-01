
var AUTH0_SECRET = 'HiJJdbxFKjpv-CU6wClauloQTC3AfeapS6-12OKSII2_cPwTy1T0_STz8pcJHuAQ';
var AUTH0_CLIENT_ID = 'fx1IXEmo604JcplftES6HHhoooX_ic5p';

const jwtAuthz = require('express-jwt-authz');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

exports.checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://seattleweb.auth0.com/.well-known/jwks.json"
  }),

  // Validate the audience and the issuer.
  audience: "https://demesyinventory/api",
  issuer: "https://seattleweb.auth0.com/",
  algorithms: ['RS256']
});

exports.checkScopes = jwtAuthz([ 'read:messages' ]);
