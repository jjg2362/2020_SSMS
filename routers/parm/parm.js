var express = require('express');
var router = express.Router();

var controller = require('./parmController.js');

//Make project
router.route('/PARM101')
  .get(controller.getParm)
  .post(controller.postParm);

router.route('/PARM102')
    .get(controller.getSearchparm)
    .post(controller.postSearchparm);

router.route('/SetPARM/:parm_id')
    .get(controller.getEditParm);

router.route('/SetPARM')
    .post(controller.postEditParm);

router.route('/PARMMAIN')
    .get(controller.getUserInfo)
    .post(controller.getUserInfo);

router.route('/subUser')
    .delete(controller.deleteSubUser);

router.route('/JoinParm')
    .get(controller.joinUser);

router.route('/DetailParm/:parm_id')
    .get(controller.detailParm);

router.route('/AddUser/:std_id/:parm_id')
    .get(controller.addUser);

router.route('/DeleteUser/:std_id/:parm_id')
    .get(controller.deleteUser);

router.route('/joinUser/:std_id/:parm_id')
    .get(controller.joinMem);

router.route('/AddMat')
    .get(controller.addMat);

router.route('/AddTeam/:parm_id')
    .get(controller.getAddTeam)
    .post(controller.postAddTeam);

router.route('/SetTeam/:team_id')
    .get(controller.getSetTeam)
    .post(controller.postSetTeam);

router.route('/DetailTeam/:team_id')
    .get(controller.detailTeam);

module.exports = router;
