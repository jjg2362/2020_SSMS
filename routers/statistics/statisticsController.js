//index controller

//use moment
var moment = require('moment');
//use mysql
var mysqlPool = require('../../middlewares/mysqlPool.js');
var fileUpload = require('../../middlewares/fileUpload.js');
var logger = require('../../middlewares/logger.js');

var query_where = "";
var flag = false;
var path = require('path');


var fs = require('fs');

var zipFolder = require('zip-folder');

exports.getAddTuplePage = (req, res) => {
    //session check
    if (!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    } else {
        logger.putLog(req);
    }

    res.render('statistics/AddTuple', {
        userId: req.session.userId,
        userType: req.session.userType,
        userInfo: req.session.userInfo,
        moment: moment
    });
};

exports.postAddTuplePage = (req, res) => {
    //session check
    if (!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    } else {
        logger.putLog(req);
    }

    var Class_num = req.body.Classnum;

    var query = "";

    for (var i = 0; i <= Class_num; i++) {
        if (i == 1) {
            var settings_id = req.body.settings_id1;
            var class_num = req.body.class_num1;
            var class_name = req.body.class_name1;
            var inst_id = req.body.inst_id1;
            var assis_id = req.body.assis_id1;
        } else if (i == 2) {
            var settings_id = req.body.settings_id2;
            var class_num = req.body.class_num2;
            var class_name = req.body.class_name2;
            var inst_id = req.body.inst_id2;
            var assis_id = req.body.assis_id2;
        } else if (i == 3) {
            var settings_id = req.body.settings_id3;
            var class_num = req.body.class_num3;
            var class_name = req.body.class_name3;
            var inst_id = req.body.inst_id3;
            var assis_id = req.body.assis_id3;
        } else if (i == 4) {
            var settings_id = req.body.settings_id4;
            var class_num = req.body.class_num4;
            var class_name = req.body.class_name4;
            var inst_id = req.body.inst_id4;
            var assis_id = req.body.assis_id4;
        } else if (i == 5) {
            var settings_id = req.body.settings_id5;
            var class_num = req.body.class_num5;
            var class_name = req.body.class_name5;
            var inst_id = req.body.inst_id5;
            var assis_id = req.body.assis_id5;
        } else if (i == 6) {
            var settings_id = req.body.settings_id6;
            var class_num = req.body.class_num6;
            var class_name = req.body.class_name6;
            var inst_id = req.body.inst_id6;
            var assis_id = req.body.assis_id6;
        } else if (i == 7) {
            var settings_id = req.body.settings_id7;
            var class_num = req.body.class_num7;
            var class_name = req.body.class_name7;
            var inst_id = req.body.inst_id7;
            var assis_id = req.body.assis_id7;
        } else if (i == 8) {
            var settings_id = req.body.settings_id8;
            var class_num = req.body.class_num8;
            var class_name = req.body.class_name8;
            var inst_id = req.body.inst_id8;
            var assis_id = req.body.assis_id8;
        } else if (i == 9) {
            var settings_id = req.body.settings_id9;
            var class_num = req.body.class_num9;
            var class_name = req.body.class_name9;
            var inst_id = req.body.inst_id9;
            var assis_id = req.body.assis_id9;
        } else if (i == 0) {
            var settings_id = req.body.settings_id0;
            var class_num = req.body.class_num0;
            var class_name = req.body.class_name0;
            var inst_id = req.body.inst_id0;
            var assis_id = req.body.assis_id0;
        }

        query += "insert into class_info (settings_id, class_num, class_name, inst_id, assis_id,  registrant, regis_date, amender, amend_date) ";
        query += "values ('" + settings_id + "', '" + class_num + "','" + class_name + "', '" + inst_id + "','" + assis_id + "','";
        query += req.session.userId + "', '" + moment(Date()).format('YYYY-MM-DD hh:mm:ss') + "', '" + req.session.userId + "', '" + moment(Date()).format('YYYY-MM-DD hh:mm:ss') + "'); ";

    }
    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
        if (err) { //throw err;
            console.error('getConnection err : ' + err);
            return;
        }

        connection.query(query, (error, results, fields) => {
            connection.release();

            if (error) { //throw error;
                console.error('query error : ' + error);
                return;
            }

            console.log('ClassInfo Register success.');
            res.redirect('class_list');

        });
    });
};

