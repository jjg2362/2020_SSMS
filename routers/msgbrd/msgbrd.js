var express = require('express');
var router = express.Router();

var controller = require('./msgbrdController.js');


router.route('/DGU701')
  .get(controller.getPostingListPage);

router.route('/edit')
  .post(controller.getEditPostings);

router.route('/DGU703')
  .post(controller.postEditPostings);

router.route('/DGU702')
  .get(controller.getPostingPage)
  .post(controller.postPostingPage);

router.route('/show/:PostingsId')
  .get(controller.getShowPostingPage);

router.route('/delete/Editposting')
  .post(controller.postDeletePosting);

module.exports = router;
