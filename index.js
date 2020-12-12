const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const mongoose = require('mongoose');
require('./passport-init');
require("dotenv").config();
const Report = require('./Report');
const Logging = require('./Logging');

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  credentials: true
}));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(cookieSession({
    name: 'session',
    keys: ['key'],
    maxAge: 24 * 60 * 60 * 100
}))
app.use(cookieParser());

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

app.get('/login/success', (req,res)=>{
  if (req.user) {
    res.json({
      success: true,
      message: "autentikasi berhasil",
      user: req.user,
      cookies: req.cookies
    });
  }
});
app.get('/login/failed', (req,res)=>{
  res.status(401).json({
    success: false,
    message: "autentikasi gagal"
  });
});

app.get('/login',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/login/callback', 
  passport.authenticate('google', { failureRedirect: '/login/failed' }),
  function(req, res) {
    // Successful authentication, redirect.
    res.redirect(process.env.CLIENT_URL);
    //res.redirect('/login/success');
  });

app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect(process.env.CLIENT_URL);
});

app.post('/report', checkUserLoggedIn, async (req,res)=>{
  let log = new Logging({email:req.user.emails[0].value, date: Date.now, apicalled:'Post Report'});
  log.save();
  try {
    let report = await new Report({
      laporan: req.body.laporan,
      lokasi: req.body.lokasi,
      status: 'Laporan terkirim',
      nama: req.user.displayName,
      email: req.user.emails[0].value
    });
    report.save(function(err, newReport) {
      console.log(newReport._id);
    }); 
    res.status(201).send(report);
  } catch (error) {
    res.json({message:error});
  }
});

app.get('/report', checkUserLoggedIn, async (req,res)=>{
  let log = new Logging({email:req.user.emails[0].value, date: Date.now, apicalled:'Get Report'});
  log.save();
  console.log(req);
  try {
    const report = await Report.find();
    res.json(report);  
  } catch (error) {
    res.json({message:error});
  }
});

app.get('/report/:_id', checkUserLoggedIn, async (req,res)=>{
  let log = new Logging({email:req.user.emails[0].value, date: Date.now, apicalled:'Get Report by id'});
  log.save();
  try {
    const idparam = mongoose.Types.ObjectId(req.params._id);
    const report = await Report.findById(idparam);
    res.json(report);
  } catch (error) {
    res.json(null);
  }  
});

app.patch('/report/:_id', checkUserLoggedIn, async (req,res)=>{
  let log = new Logging({email:req.user.emails[0].value, date: Date.now, apicalled:'Patch Report'});
  log.save();
  try {
    const patch = await Report.updateOne(
      {_id: req.params._id},
      {$set:{status:req.body.status}},
      {upsert:true}
    );
    res.status(201).send(patch);
  } catch (error) {
    res.json({message:error});
  }
});

app.delete('/report/:_id', checkUserLoggedIn, async (req,res)=>{
  let log = new Logging({email:req.user.emails[0].value, date: Date.now, apicalled:'Delete Report'});
  log.save();
  try {
    const del = await Report.deleteOne({_id: req.params._id});
    res.json(del);
  } catch (error) {
    res.json({message:error});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Running on port ${PORT}`));