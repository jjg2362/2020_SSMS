var express = require('express');
var router = express.Router();

var controller = require('./parmController.js');

//use multer
var multer = require('multer');
var moment = require('moment');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/ssmsdata/MaterialFile');
    }, filename: (req, file, cb) => {
        cb(null, moment().format('YYYYMMDDHHmmss') + file.originalname);
    }
});

var upload = multer({ storage: storage});

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

router.route('/subTeamMem/:std_id/:team_id')
    .get(controller.deleteTeamMem);

router.route('/JoinParm')
    .get(controller.joinUser);

router.route('/DetailParm/:parm_id')
    .get(controller.detailParm);

router.route('/DetailMat/:mat_id')
    .get(controller.detailMat);

router.route('/DetailTeam/:team_id')
    .get(controller.detailTeam);

router.route('/DeleteUser/:std_id/:parm_id')
    .get(controller.deleteUser);

router.route('/DeleteTeam')
    .get(controller.deleteTeam);

router.route('/DeleteMat')
    .get(controller.deleteMat);

router.route('/joinUser/:std_id/:parm_id')
    .get(controller.joinMem);

router.route('/joinUser2/:std_id/:parm_id')
    .get(controller.joinMem2);

router.route('/AddUser/:std_id/:parm_id')
    .get(controller.addUser);

router.route('/AddMat/:parm_id')
    .get(controller.getAddMat)
    .post(controller.postAddMat);

router.route('/AddSubMat/:mat_id')
    .get(controller.getAddSubMat)
    .post(controller.postAddSubMat);

router.route('/AddTeam/:parm_id')
    .get(controller.getAddTeam)
    .post(controller.postAddTeam);

router.route('/AddTeamMem')
    .post(controller.postAddTeamMem);

router.route('/SetTeam/:team_id')
    .get(controller.getSetTeam)
    .post(controller.postSetTeam);

router.route('/SetMat/:mat_id')
    .get(controller.getSetMat)
    .post(controller.postSetMat);

router.route('/SetSubMat/:mat_s_id')
    .get(controller.getSetSubMat)
    .post(controller.postSetSubMat);

module.exports = router;
