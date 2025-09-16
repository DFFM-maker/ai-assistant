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
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logout completato e sessione distrutta.' });
        });
    });
});

module.exports = router;