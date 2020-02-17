var express = require('express');
var router = express.Router();

var controller = require('./indexController.js');

router.route('/')
  .get(controller.showIndexPage);

module.exports = router;
