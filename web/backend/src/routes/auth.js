const express = require('express');
const router = express.Router();

// Route di logout sicura: Passport + distruzione sessione
router.get('/api/auth/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            }
            // Assicurati di cancellare il cookie con la stessa 'path' usata da express-session!
            res.clearCookie('connect.sid', { path: '/' }); // <-- AGGIUNTO path
            res.status(200).json({ message: 'Logout completato e sessione distrutta.' });
        });
    });
});

module.exports = router;