const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            where: { provider_id: profile.id, provider: "google" },
          });

          if (!user) {
            user = await User.findOne({
              where: { email: profile.emails[0].value },
            });

            if (user) {
              await user.update({
                provider: "google",
                provider_id: profile.id,
                avatar_url: profile.photos[0]?.value,
                email_verified: true,
              });
            } else {
              user = await User.create({
                email: profile.emails[0].value,
                name: profile.displayName,
                avatar_url: profile.photos[0]?.value,
                provider: "google",
                provider_id: profile.id,
                email_verified: true,
              });
            }
          }

          const token = jwt.sign(
            {
              id: user.id,
              email: user.email,
              name: user.name,
              avatar: user.avatar_url,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" },
          );

          return done(null, { user, token });
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
};
