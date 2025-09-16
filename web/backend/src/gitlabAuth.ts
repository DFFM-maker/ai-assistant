import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import passport from 'passport';
import session from 'express-session';
import { Strategy as GitLabStrategy } from 'passport-gitlab2';

// Usa variabili d'ambiente dal file .env
const CLIENT_ID = process.env.GITLAB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITLAB_CLIENT_SECRET!;
const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL!;
const CALLBACK_URL = process.env.GITLAB_CALLBACK_URL!;
const SCOPES = process.env.GITLAB_SCOPES?.split(',') ?? ['read_user'];

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user);
});
passport.deserializeUser((obj: any, done: (err: any, user?: any) => void) => {
  done(null, obj);
});

passport.use(
  new GitLabStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      baseURL: GITLAB_BASE_URL,
      scope: SCOPES,
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (error: any, user?: any) => void
    ) => {
      return done(null, {
        id: profile.id,
        username: profile.username,
        name: profile.displayName,
        avatar: profile.avatarUrl,
        accessToken,
      });
    }
  )
);

const router = express.Router();

// Sessione
router.use(
  session({
    secret: process.env.SECRET_KEY || 'cambia-questa-stringa-con-una-complessa',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true solo in https
      sameSite: 'lax',
    },
  })
);

router.use(passport.initialize());
router.use(passport.session());

// Avvia login
router.get('/auth/gitlab', passport.authenticate('gitlab', { scope: SCOPES }));

// Callback dopo login
router.get(
  '/auth/gitlab/callback',
  passport.authenticate('gitlab', {
    failureRedirect: '/', // O una pagina di errore custom
    session: true,
  }),
  (req: Request, res: Response) => {
    res.redirect('/'); // o dove vuoi tu
  }
);

// Logout
router.get('/auth/logout', (req: Request, res: Response) => {
  // @ts-ignore: proprietà aggiunta da passport
  req.logout(() => {
    res.redirect('/');
  });
});

// API per sapere chi è loggato
router.get('/user', (req: Request, res: Response) => {
  // @ts-ignore: proprietà aggiunta da passport
  if (req.isAuthenticated() && req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'not authenticated' });
  }
});

export default router;
