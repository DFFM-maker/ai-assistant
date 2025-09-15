"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const passport_gitlab2_1 = require("passport-gitlab2");
const CLIENT_ID = 'a3745bcb6294200e3d68cee33c263a26fddea15fd817b36d93595fb7b8c3796c';
const CLIENT_SECRET = 'gloas-e0e92261d75c2e31e3f42b6471433db57804bf18758792c4fd29e0ab75f3bd4d';
const GITLAB_BASE_URL = 'https://gitlab.dffm.it'; // Cambia se il tuo dominio GitLab è diverso.
const CALLBACK_URL = process.env.NODE_ENV === 'production'
    ? 'https://ai-assistant.dffm.it/api/auth/gitlab/callback'
    : 'http://localhost:4000/api/auth/gitlab/callback';
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((obj, done) => {
    done(null, obj);
});
passport_1.default.use(new passport_gitlab2_1.Strategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    baseURL: GITLAB_BASE_URL,
    scope: ['read_user'],
}, (accessToken, refreshToken, profile, done) => {
    // Qui puoi salvare altre info dell'utente se vuoi
    return done(null, {
        id: profile.id,
        username: profile.username,
        name: profile.displayName,
        avatar: profile.avatarUrl,
        accessToken
    });
}));
const router = express_1.default.Router();
// Sessione
router.use((0, express_session_1.default)({
    secret: 'cambia-questa-stringa-con-una-complessa',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true solo in https
        sameSite: 'lax',
    },
}));
router.use(passport_1.default.initialize());
router.use(passport_1.default.session());
// Avvia login
router.get('/auth/gitlab', passport_1.default.authenticate('gitlab', { scope: ['read_user'] }));
// Callback dopo login
router.get('/auth/gitlab/callback', passport_1.default.authenticate('gitlab', {
    failureRedirect: '/', // O una pagina di errore custom
    session: true,
}), (req, res) => {
    // Dopo login reindirizza al frontend
    res.redirect('/'); // o dove vuoi tu
});
// Logout
router.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});
// API per sapere chi è loggato
router.get('/user', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.json(req.user);
    }
    else {
        res.status(401).json({ error: 'not authenticated' });
    }
});
exports.default = router;
//# sourceMappingURL=gitlabAuth.js.map