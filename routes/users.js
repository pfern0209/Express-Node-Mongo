const express=require('express');
const router=express.Router({mergeParams:true});
const User=require('../models/user')
const passport=require('passport');
const users = require('../controllers/users')


const catchAsync=require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError');

router.route('/register')
  .get(users.renderRegister)
  .post(catchAsync(users.registerUser))

router.route('/login')
  .get(users.renderLogin)
  .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.loginUser)

router.get('/logout',users.logoutUser)

module.exports = router;