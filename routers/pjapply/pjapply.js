var express = require('express');
var router = express.Router();

var controller = require('./pjapplyController.js');

//Apply project
// router.route('/DGU400')
//   .get(controller.getTeamList);

// router.route('/TeamSelect/:TeamID')
//   .get(controller.getSearchproject2);

router.route('/DGU401')
  .get(controller.getSearchproject)
  .post(controller.postSearchproject);

router.route('/detail/:pjId')
  .get(controller.getDetailPj);

router.route('/cancel/:pjId/:TeamID')
  .get(controller.getCancelProject);

router.route('/DGU402')
  .post(controller.postProjectCart);

  //Apply list
router.route('/DGU411')
    .get(controller.getProjectCart);

router.route('/DGU412')
    .get(controller.getCancelProject)
    .post(controller.postCancelProjectCart);


module.exports = router;
