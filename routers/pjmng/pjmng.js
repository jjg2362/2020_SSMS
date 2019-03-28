var express = require('express');
var router = express.Router();

var controller = require('./pjmngController.js');

//Register
router.route('/DGU501/:PJId')
  .get(controller.getMyproject);

router.route('/DGU501/file/:formType')
  .post(controller.postprjplan);

router.route('/DGU511')
  .get(controller.getMentoringReport)
  .post(controller.postMentoringReport);

router.route('/DGU511/:PJId')
  .get(controller.getMentoringReport1)
  .post(controller.postMentoringReport1);

router.route('/delete/:PJId')
  .post(controller.postMentoringReport3);

router.route('/makechk/:PJId')
  .post(controller.postManagechk);

router.route('/add/:PJId')
  .post(controller.postMentoringReport4);

router.route('/DGU512')
  .get(controller.getSearchproject)
  .post(controller.postSearchproject);

router.route('/DGU502')
  .get(controller.getSearchproject1);

router.route('/DGU522')
  .get(controller.getSearchproject2);

router.route('/DGU521/page/:PJId')
  .get(controller.getFinalReport)
  .post(controller.postFinalReport);

router.route('/DGU513/:PJId')
  .get(controller.getMentoringReport2);

router.route('/DGU513')
  .post(controller.postMentoringReport2);

router.route('/DGU521/:formType')
  .post(controller.postFinalLists);

router.route('/DGU500')
    .get(controller.showClassPage);

module.exports = router;
