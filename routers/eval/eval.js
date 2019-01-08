var express = require('express');
var router = express.Router();

var controller = require('./evalController.js');

//Register
router.route('/DGU601')
  .get(controller.getEval)
  .post(controller.postEvalLink);

module.exports = router;
