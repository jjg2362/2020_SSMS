var express = require('express');
var router = express.Router();

var controller = require('./settingController.js');

router.route('/DGU901')
  .get(controller.getPastListPage);

router.route('/DGU901/downloadProjectFile')
    .post(controller.downloadProjectFile);

router.route('/DGU902')
  .get(controller.getMovingListPage);

router.route('/DGU902/transfer')
    .post(controller.transferSemester);

router.route('/DGU902/transferCancel')
    .post(controller.transferCancelSemester);

router.route('/DGU903/:PJId')
  .get(controller.getSearchproject1);


router.route('/semes_list')
  .get(controller.getSettingListPage);

router.route('/edit/:SettingsId')
  .get(controller.getEditSettings);

router.route('/Editsetting')
  .post(controller.postEditSettings);

router.route('/setting')
  .get(controller.getSettingPage)
  .post(controller.postSettingPage);

router.route('/delete/Editsetting')
  .post(controller.postDeleteSetting);

router.route('/class_list')
  .get(controller.getClassListPage);

router.route('/AddClass')
  .get(controller.getAddClassPage)
  .post(controller.postAddClassPage);

router.route('/edit/class/:classnum')
  .get(controller.getEditClass);

router.route('/EditClass')
  .post(controller.postEditClass);

router.route('/EditClass/cancel')
  .get(controller.getCancelEdit);

router.route('/Agmt')
  .get(controller.getAgmtPage)
  .post(controller.postAgmt);

router.route('/surveylink')
  .get(controller.getEval)
  .post(controller.postEvalLink);

router.route('/reportsample')
  .get(controller.getSample)
  .post(controller.postSample);

router.route('/MainNotice')
  .get(controller.getNotice);

router.route('/MainNotice/upload/:formtype')
  .post(controller.postNotice);

router.route('/MainNotice/:formtype')
  .post(controller.deleteImage);

module.exports = router;

