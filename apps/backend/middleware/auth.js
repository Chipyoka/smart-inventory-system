const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
require('dotenv').config();
const db = require('../config/db');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [jwt_payload.id]);
      if (rows.length > 0) return done(null, rows[0]);
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

module.exports = passport;
// This middleware uses Passport.js to authenticate JWT tokens.
// It extracts the token from the Authorization header and verifies it using the secret key.