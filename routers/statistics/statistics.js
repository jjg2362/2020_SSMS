var express = require('express');
var router = express.Router();

var controller = require('./statisticsController.js');

router.route('/AddTuple')
    .get(controller.getAddTuplePage);

// router.route('/AddTuple')
//     .post(controller.downloadProjectFile);

module.exports = router;

