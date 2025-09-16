import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GitLabStrategy } from 'passport-gitlab2';

export const userCache: Record<string, any> = {};

const CLIENT_ID = process.env.GITLAB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITLAB_CLIENT_SECRET!;
const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL!;
const CALLBACK_URL = process.env.GITLAB_CALLBACK_URL!;
const SCOPES = process.env.GITLAB_SCOPES?.split(',') ?? ['read_user'];

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
      accessToken: any,
      refreshToken: any,
      profile: any,
      done: any
    ) => {
      userCache[profile.id] = {
        id: profile.id,
        username: profile.username,
        name: profile.displayName,
        avatar: profile.avatarUrl,
        accessToken,
      };
      return done(null, userCache[profile.id]);
    }
  )
);

const router = express.Router();

router.get('/auth/gitlab', passport.authenticate('gitlab', { scope: SCOPES }));

router.get(
  '/auth/gitlab/callback',
  passport.authenticate('gitlab', {
    failureRedirect: 'http://192.168.1.250:3000/',
    session: true,
  }),
  (req: Request, res: Response) => {
    console.log('LOGIN CALLBACK USER:', req.user);
    console.log('LOGIN CALLBACK SESSION:', req.session);
    res.redirect('http://192.168.1.250:3000/');
  }
);

router.get('/auth/logout', (req: Request, res: Response) => {
  req.logout(() => {
    res.redirect('http://192.168.1.250:3000/');
  });
});

router.get('/user', (req: Request, res: Response) => {
  console.log('USER:', req.user);
  console.log('SESSION:', req.session);
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'not authenticated' });
  }
});

export default router;
