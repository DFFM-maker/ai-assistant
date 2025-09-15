const express = require('express');
const session = require('express-session');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(session({ secret: "your_secret", resave: false, saveUninitialized: true }));

app.get('/auth/gitlab', (req, res) => {
  const redirect = `https://gitlab.dffm.it/oauth/authorize?client_id=${process.env.GITLAB_CLIENT_ID}&redirect_uri=${process.env.GITLAB_CALLBACK_URL}&response_type=code&scope=read_user+openid+profile+email+api`;
  res.redirect(redirect);
});

app.get('/auth/gitlab/callback', async (req, res) => {
  const code = req.query.code;
  const tokenRes = await axios.post("https://gitlab.dffm.it/oauth/token", {
    client_id: process.env.GITLAB_CLIENT_ID,
    client_secret: process.env.GITLAB_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.GITLAB_CALLBACK_URL
  });
  req.session.token = tokenRes.data.access_token;
  res.redirect('/');
});

app.listen(4000, () => console.log("OAuth server listening on 4000"));
