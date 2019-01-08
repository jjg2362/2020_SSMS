var express = require('express');
var router = express.Router();

var controller = require('./teammgtController.js');

//show Team Create page
router.route('/DGU201')
  .get(controller.getTeam);

//post team create
router.route('/DGU201/team/create')
  .post(controller.postTeamCreate);



//show team Search Page
router.route('/DGU251')
  .get(controller.getTeamMember);

//get Team page
router.route('/DGU251/search')
  .post(controller.postTeamSearch);

//get Team page
router.route('/DGU251/member/stdAdd')
  .post(controller.postTeamAdd);

//
router.route('/DGU211')
  .get(controller.getMyTeam)
  .post(controller.postPCFile);

//
router.route('/DGU211/invite/:type')
  .post(controller.postTeamInvite);

//
router.route('/DGU211/teamOut')
  .post(controller.postTeamOut);





//show Team Select page
router.route('/DGU221')
  .get(controller.getTeamSelectPj);

//show Team Select page
router.route('/DGU221/std')
  .post(controller.postTeamSelectStd);

//select team
router.route('/DGU221/select')
  .post(controller.postTeamAccept);

//select team
router.route('/DGU221/fd')
  .post(controller.postStdDown);

//post team delete
router.route('/DGU221/team/delete')
  .post(controller.postTeamDelete);



//Team Tracking
router.route('/DGU231')
  .get(controller.getAllTeamInfo);

router.route('/DGU281')
  .get(controller.getAllTeamInfoma);

router.route('/DGU291')
  .get(controller.getAllTeamInfoAS);

//Project Tracking
router.route('/DGU271')
  .get(controller.getAllProjectInfo);

//admin : Team-Project Matching
router.route('/DGU241')
  .get(controller.getTeamPjInfo)
  .post(controller.postTeamPjMatching);

//admin :Team-Project Delete
router.route('/DGU241/deleteTeamPJ/:teamId')
  .get(controller.getTeamPjDelete);
  
//admin : Team-Class Matching
router.route('/DGU261')
  .get(controller.getTeamClassInfo)
  .post(controller.postTeamClassMatching);

module.exports = router;
