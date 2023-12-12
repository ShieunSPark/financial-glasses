const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");

const User = require("./models/user");

// Authentication
passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      const user = await User.findOne({ username: username });
      const match = await bcrypt.compare(password, user.password);
      if (!user || !match) {
        return cb(null, false, {
          message: "Incorrect username and/or password",
        });
      }
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser(function (user, cb) {
  // process.nextTick(function () {
  console.log("serializing user...");
  cb(null, {
    id: user.id,
  });
  // });
});

passport.deserializeUser(async function (user, cb) {
  // process.nextTick(function () {
  console.log("Deserializing user...");
  return cb(null, user);
  // });
});

// Authorization
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
    },
    (jwt_payload, cb) => {
      const user = User.findById(jwt_payload.id);

      if (user) {
        return cb(null, user);
      }

      return cb(null, false);
    }
  )
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
