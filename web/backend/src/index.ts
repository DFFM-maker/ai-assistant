import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import gitlabAuth, { userCache } from './gitlabAuth';
import gitRoutes from './routes/git';

const app = express();

app.use(express.json()); // Add JSON body parser for POST requests

app.use(cors({
  origin: 'http://192.168.1.250:3000',
  credentials: true
}));

app.use(session({
  secret: process.env.SECRET_KEY || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});
passport.deserializeUser((id: string, done) => {
  done(null, userCache[id] || null);
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Backend Express funzionante!');
});

// Endpoint logout API lato server
app.get('/api/auth/logout', (req, res, next) => {
  // Passport >= 0.6.0: logout accetta una callback
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // Risposta OK, non fare redirect!
    res.status(200).json({ message: 'Logout dalla tua app completato.' });
  });
});

app.use('/api', gitlabAuth);
app.use('/api/git', gitRoutes);

app.listen(4000, '0.0.0.0', () => {
  console.log('Backend listening on port 4000');
});