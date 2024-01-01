const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");

const User = require("./models/user");

// Authentication
passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return cb(null, false, {
          message: "Incorrect username and/or password",
        });
      }
      // The reason for separating finding user and checkiing password logic
      // is because the database might try to find the user's password
      // when the user doesn't exist. So check user first before checking their password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
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

// Authorization
// passport.use(
//   new JwtStrategy(
//     {
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: process.env.JWT_SECRET_KEY,
//     },
//     (jwt_payload, cb) => {
//       const user = User.findById(jwt_payload.id);

//       if (user) {
//         return cb(null, user);
//       }
//       return cb(null, false);
//     }
//   )
// );

// Set up GoogleStrategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.SERVER_DOMAIN + "/auth/google/callback",
      scope: ["profile"],
    },
    async function verify(accessToken, refreshToken, profile, cb) {
      // Perform any additional verification or user lookup here
      // and return the user object
      const user = await User.findOneAndUpdate(
        {
          firstName: profile._json.given_name,
          lastName: profile._json.family_name,
          username: profile._json.email,
        },
        { googleID: profile.id }
      );
      if (!user) {
        const newUser = new User({
          googleID: profile.id,
          firstName: profile._json.given_name,
          lastName: profile._json.family_name,
          username: profile._json.email,
          status: "user",
        });
        await newUser.save();
        return cb(null, newUser);
      }
      return cb(null, user);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (user, cb) {
  try {
    const userInDB = User.findById(user);
    cb(null, userInDB);
  } catch (err) {
    cb(err);
  }
});
