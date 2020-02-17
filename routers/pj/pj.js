var express = require('express');
var router = express.Router();

var controller = require('./pjController.js');

//show detail pj info
router.route('/:pjId')
  .get(controller.getDetailPj);

module.exports = router;
