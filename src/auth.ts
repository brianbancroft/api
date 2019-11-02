import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import * as https from 'https';

const client = jwksClient({
  jwksUri: 'https://fieldmaps.eu.auth0.com/.well-known/jwks.json',
});

const options = {
  audience: 'https://api.fieldmaps.io/',
  issuer: 'https://fieldmaps.eu.auth0.com/',
  algorithms: ['RS256'],
};

const getKey = (header, cb) => {
  client.getSigningKey(header.kid, (_, key) => {
    const signingKey = key ? key.publicKey || key.rsaPublicKey : '';
    cb(null, signingKey);
  });
};

const getUserOptions = token => ({
  host: 'fieldmaps.eu.auth0.com',
  port: 443,
  path: '/userinfo',
  method: 'GET',
  headers: { authorization: 'Bearer ' + token },
});

const context = ({ event }) => {
  let token = event.headers.Authorization || event.headers.authorization || '';
  if (token.startsWith('Bearer ')) token = token.substring(7);
  if (token) {
    const auth = new Promise(resolve => {
      jwt.verify(token, getKey, options, (err, decoded) => {
        if (err) resolve(null);
        resolve(decoded);
      });
    });
    const user = new Promise((resolve, reject) => {
      const req = https.request(getUserOptions(token), res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          if (data === 'Unauthorized') resolve(null);
          else resolve(JSON.parse(data));
        });
      });
      req.on('error', error => reject(error));
      req.end();
    });
    return { auth, user };
  }
  return {};
};

export default context;
