const LocalStrategy = require("passport-local").Strategy;
// const JwtStrategy = require("passport-jwt").Strategy;
// const ExtractJwt = require("passport-jwt").ExtractJwt;
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");

const User = require("./models/user");

module.exports = function (passport) {
  // Set up LocalStrategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username: username });
        if (!user) {
          return done(null, false, {
            message: "The username does not exist in the database",
          });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // // Set up GoogleStrategy
  // passport.use(
  //   new GoogleStrategy(
  //     {
  //       clientID: process.env.GOOGLE_CLIENT_ID,
  //       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //       callbackURL: "/oauth2/redirect/google",
  //       scope: ["profile"],
  //     },
  //     // "cb" stands for "callback"
  //     function verify(accessToken, refreshToken, profile, cb) {
  //       // Perform any additional verification or user lookup here
  //       // and return the user object
  //       console.log(profile);
  //       return cb(null, profile);
  //     }
  //   )
  // );

  passport.serializeUser(function (user, cb) {
    console.log("serializing user...");
    process.nextTick(function () {
      cb(null, { id: user.id, username: user.username });
    });
  });

  passport.deserializeUser(function (user, cb) {
    console.log("deserializing user...");
    process.nextTick(function () {
      return cb(null, user);
    });
  });
};
