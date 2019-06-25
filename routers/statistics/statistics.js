var express = require('express');
var router = express.Router();
var controller = require('./statisticsController.js');

//use multer
var multer = require('multer');
var moment = require('moment');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/ssmsdata/ThesisFile');
    }, filename: (req, file, cb) => {
        cb(null, moment().format('YYYYMMDDHHmmss') + file.originalname);
    }
});

var upload = multer({ storage: storage});

router.route('/AddThesis')
    .get(controller.getAddTuplePage)
    .post(upload.single('inputThesisFile'), controller.postAddThesis);

router.route('/thesisList')
    .get(controller.getThesisList);

router.route('/thesis/:id')
    .get(controller.getThesis);

router.route('/thesis')
    .put(upload.single('inputThesisFile'), controller.modifyThesis)
    .delete(upload.single('inputThesisFile'), controller.deleteThesis);

module.exports = router;

