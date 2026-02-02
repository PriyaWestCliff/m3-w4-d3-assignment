const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');

// Basic Auth using users.htpasswd
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

/* =========================
   1) HOME PAGE – SimpleKitchen
   ========================= */
router.get('/', (req, res) => {
  res.render('index', { title: 'Simple Kitchen' });
});

/* =========================
   2) SHOW REGISTRATION FORM
   ========================= */
router.get('/register', (req, res) => {
  res.render('form', { title: 'Registration form' });
});

/* =========================
   3) THANK YOU PAGE
   ========================= */
router.get('/thankyou', (req, res) => {
  res.render('thankyou', { title: 'Thank you' });
});

/* =========================
   4) PROTECTED REGISTRATIONS LIST
   ========================= */
router.get('/registrations', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('registrations', {
        title: 'Listing registrations',
        registrations
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Sorry! Something went wrong.');
    });
}));

/* =========================
   5) SUBMIT REGISTRATION FORM
   ========================= */
router.post(
  '/register',
  [
    check('name')
      .isLength({ min: 1 })
      .withMessage('Please enter a name'),

    check('email')
      .isLength({ min: 1 })
      .withMessage('Please enter an email'),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const registration = new Registration(req.body);

      registration.save()
        .then(() => {
          res.redirect('/thankyou');
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send('Sorry! Something went wrong.');
        });

    } else {
      res.render('form', {
        title: 'Registration form',
        errors: errors.array(),
        data: req.body,
      });
    }
  }
);

module.exports = router;
