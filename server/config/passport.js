const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const SlackStrategy = require('passport-slack-oauth2').Strategy;
const User = require('../models/User');
const crypto = require('crypto');


// Set default values if environment variables are missing
const googleClientId = process.env.GOOGLE_CLIENT_ID || 'dummy_google_client_id';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_client_secret';
const slackClientId = process.env.SLACK_CLIENT_ID || 'dummy_slack_client_id';
const slackClientSecret = process.env.SLACK_CLIENT_SECRET || 'dummy_slack_client_secret';

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      console.error('Error in deserializeUser:', error);
      done(error, null);
    }
  });

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // If user exists but was registered with credentials, update with Google info
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }
        
        // If no user found, create a new one
        const newUser = new User({
          googleId: profile.id,
          firstName: profile.name.givenName || profile.displayName.split(' ')[0],
          lastName: profile.name.familyName || profile.displayName.split(' ')[1] || '',
          email: profile.emails[0].value,
          // Set a random password since it's required in schema but not used for OAuth
          password: crypto.randomBytes(16).toString('hex'),
          role: 'Viewer' // Default role
        });
        
        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Slack OAuth Strategy
passport.use(
  new SlackStrategy(
    {
      clientID: slackClientId,
      clientSecret: slackClientSecret,
      skipUserProfile: false,
      callbackURL: '/api/auth/slack/callback',
      scope: ['identity.basic', 'identity.email', 'identity.avatar']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.user.email });
        
        if (user) {
          // If user exists but was registered with credentials, update with Slack info
          if (!user.slackId) {
            user.slackId = profile.user.id;
            await user.save();
          }
          return done(null, user);
        }
        
        // If no user found, create a new one
        const nameParts = profile.user.name.split(' ');
        const newUser = new User({
          slackId: profile.user.id,
          firstName: nameParts[0] || 'Slack',
          lastName: nameParts.slice(1).join(' ') || 'User',
          email: profile.user.email,
          // Set a random password since it's required in schema but not used for OAuth
          password: crypto.randomBytes(16).toString('hex'),
          role: 'Viewer' // Default role
        });
        
        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport; 