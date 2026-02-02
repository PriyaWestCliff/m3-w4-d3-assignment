const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');

// Basic auth (uses users.htpasswd)
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

// HOME
router.get('/', (req, res) => {
  res.render('index', { title: 'Simple Kitchen' });
});

// REGISTER PAGE (GET)
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register to subscribe' });
});

// REGISTER (POST)
router.post(
  '/register',
  [
    check('name').isLength({ min: 1 }).withMessage('Please enter a name'),
    check('email').isLength({ min: 1 }).withMessage('Please enter an email'),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const registration = new Registration(req.body);

      registration
        .save()
        .then(() => res.redirect('/thankyou'))
        .catch((err) => {
          console.log(err);
          res.status(500).send('Sorry! Something went wrong.');
        });
    } else {
      res.render('register', {
        title: 'Register to subscribe',
        errors: errors.array(),
        data: req.body,
      });
    }
  }
);

// THANK YOU
router.get('/thankyou', (req, res) => {
  res.render('thankyou', { title: 'Thank you for your registration!' });
});

// REGISTRANTS (protected)
router.get('/registrants', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('registrants', { title: 'Listing registrations', registrations });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Sorry! Something went wrong.');
    });
}));

module.exports = router;
