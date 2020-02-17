var express = require('express');
var router = express.Router();

var controller = require('./mbrmgtController.js');

//Register
router.route('/DGU101')
  .get(controller.getRegister)
  .post(controller.postRegister);

//Register Complete
router.route('/DGU101/complete')
  .get(controller.getRegisterComplete);

//
router.route('/findCompany')
  .get(controller.getFindCompany)
  .post(controller.postFindCompany);

//
router.route('/createCompany')
  .get(controller.getCreateCompany)
  .post(controller.postCreateCompany);



//Register auth
router.route('/auth')
  .get(controller.getAuth);




//Mypage
router.route('/DGU111')
  .get(controller.getMypage);

//Mypage Edit
router.route('/DGU111/edit')
  .get(controller.getMypageEdit)
  .post(controller.postMypageEdit);

//
router.route('/DGU111/pwChange')
  .post(controller.postPwChange);


//Login
router.route('/DGU121')
  .get(controller.getLogin)
  .post(controller.postLogin);

//
router.route('/DGU121/forgotPw')
  .post(controller.postForgotPw);




//User Tracking
router.route('/DGU131')
  .get(controller.getUserInfo);




//Logout
router.route('/DGU141')
  .get(controller.getLogout);

module.exports = router;
