const express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    passport = require("passport"),
    async = require('async'),
    nodemailer = require('nodemailer'),
    crypto = require('crypto');

router.get("/", function (req, res) {
    res.render("landing");
});

//show register form
router.get("/register", (req, res) => {
    res.render("register", { page: 'register' });
});

//register a user
router.post("/register", (req, res) => {
    let newUser = new User(
        {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            avatar: req.body.avatar,
            username: req.body.username,
            email: req.body.email,
            isAdmin: req.body.adminAccessCode
        })
    if (req.body.adminAccessCode === process.env.ADMIN_CODE) {
        newUser.isAdmin = true;
    }
    else {
        newUser.isAdmin = false;
    }
    //passport method ".register()" will take the password field and create a hash to store in the DB
    //    
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render("register", { error: err.message })
        }
        passport.authenticate("local")(req, res, () => {
            req.flash('success', "Sign-up Successful! Welcome " + req.body.username + " !")
            res.redirect('/campgrounds');
        });
    })
});

//login a user
router.get("/login", function (req, res) {
    res.render("login", { page: 'login' });
});

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true
    }));

//logout
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", 'Logged you out!')
    res.redirect("/campgrounds");
});

//forgot get view
router.get('/forgot', (req, res) => {
    res.render('forgot')
})

//forgot post
router.post('/forgot', (req, res, next) => {
    async.waterfall([
        (done) => {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                done(err, token);
            });
        },
        (token, done) => {
            User.findOne({ email: req.body.email }, (err, user) => {
                if (!user) {
                    req.flash('error', 'No account with that email exists')
                    return res.redirect('/forgot')
                }
                user.resetPasswordToken = token;
                user.resetTokenExpires = Date.now() + 3600000;

                user.save((err) => {
                    done(err, token, user)
                });
            });
        },
        (token, user, done) => {
            let transporter = nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                auth: {
                    user: 'apikey',
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
            let message = {
                to: user.email,
                from: 'tents+support@gmail.com',
                subject: 'Tents.com password reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            transporter.sendMail(message, (err) => {
                console.log('email sent');
                req.flash('success', 'An email has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            })
        }
    ], (err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetTokenExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired')
            res.redirect('/forgot');
        }
        res.render('reset', { token: req.params.token });
    });
});

router.post('/reset/:token', (req, res) => {
    async.waterfall([
        (done) => {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordToken: { $gt: Date.now() } }, (err, user) => {
                if (!user) {
                    req.flash('error', "Password reset token is invalid or has expired");
                    return res.redirect('/forgot')
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, (err) => {
                        user.resetPasswordToken = undefined;
                        user.resetTokenExpires = undefined;

                        user.save((err) => {
                            req.logIn(user, (err) => {
                                done(err, user)
                            });
                        });
                    })
                }
                req.flash('error', 'Passwords do not match');
                return res.redirect('back');
            })
        },
        (user, done) => {
            let transporter = nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                auth: {
                    user: 'apikey',
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
            let message = {
                to: user.email,
                from: 'tents+support@gmail.com',
                subject: 'Tents.com password has been changed',
                text: 'Hello.\n\n' +
                'This is confirmation that your password for account ' + user.email + ' has successfully changed'
            };
            transporter.sendMail(message, (err) => {
                req.flash('success', 'An email has been sent to ' + user.email + ' with further instructions.');
                done(err);
            })
        }
    ], (err) => {
        if(err)
        res.redirect('/campgrounds');
    })
});

module.exports = router;