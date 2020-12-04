const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const passport = require('passport');
const mongoose = require('mongoose');
require('./passport-init');
require("dotenv").config();
const Report = require('./Report');
const Logging = require('./Logging');

app.use(cors());

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(cookieSession({
    name: 'session-name',
    keys: ['key1', 'key2']
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_CONNECTION, 
    {useNewUrlParser: true, useUnifiedTopology:true}, 
    ()=> console.log('connected to DB'));


const checkUserLoggedIn = (req, res, next) => {
    req.user ? next(): res.sendStatus(401);
}

app.get('/', (req,res)=> res.send('Arigato!'));

app.get('/welcome', checkUserLoggedIn,(req,res)=> {
        let log = new Logging({email:req.user.emails[0].value, date: Date.now, apicalled:'Welcome'});
        log.save();
        res.send(`Wilkommen ${req.user.displayName}, ${req.user.emails[0].value}`);
});

app.get('/failed', (req,res)=> res.send('Failed to login'));

app.get('/login',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/login/callback', 
  passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect.
    res.redirect('/welcome');
  });

app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Running on port ${PORT}`));