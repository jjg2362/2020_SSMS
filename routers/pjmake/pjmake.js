var express = require('express');
var router = express.Router();

var controller = require('./pjmakeController.js');

//Make project
router.route('/DGU301')
  .get(controller.getMakeproject)
  .post(controller.postMakeproject);


//Mentoring schd
router.route('/DGU302')
  .get(controller.getMentoringproject)
  .post(controller.postMentoringSchd);


//Management Project
router.route('/DGU311')
  .get(controller.getManageproject);

router.route('/:pjId')
  .get(controller.getDetailPj);

router.route('/addition/:pjId')
    .get(controller.getAdditionPj);
router.route('/addition')
    .post(controller.postAdditionPj);

router.route('/edit/DGU312')
  .post(controller.getEditPj);

router.route('/delete/DGU312')
  .post(controller.postDeletePj);

router.route('/DGU313')
  .post(controller.postEditproject);

router.route('/DGU313/cancel')
  .get(controller.getCancelEdit);

router.route('/DGU315/pjmentor')
  .get(controller.getPjMentor)
  .post(controller.postPjMentorMatching);

module.exports = router;
