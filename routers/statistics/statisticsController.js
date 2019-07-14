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

    res.render('statistics/AddThesis', {
        userId: req.session.userId,
        userType: req.session.userType,
        userInfo: req.session.userInfo,
        moment: moment
    });
};

exports.postAddThesis = (req, res) => {
    //session check
    if (!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    } else {
        logger.putLog(req);
    }

    const statistic_info = Object.keys(req.body)
        .filter(key => req.body[key] !== "")
        .reduce((obj, key) => {
            obj[key] = req.body[key];
            return obj;
        }, {});
    console.log(req.body);
    console.log(statistic_info);

    let query = 'insert into statistics set ?';

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
        if (err) { //throw err;
            console.error('getConnection err : ' + err);
            connection.release();
            return;
        }

        connection.query(query, statistic_info, (error, results, fields) => {
            connection.release();

            console.log(query)
            console.log(results)
            console.log(fields)

            if (error) { //throw error;
                console.error('query error : ' + error);
                return;
            }

            console.log('Statistic Register success.');
            res.redirect('thesisList');
        });
    });

};

exports.getThesisList = (req, res) => {
    //session check
    if (!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    } else {
        logger.putLog(req);
    }

    const query = 'select * from Thesis';

    mysqlPool.pool.getConnection((err, connection) => {
        if (err) { //throw err;
            console.error('getConnection err : ' + err);
            connection.release();
            return;
        }

        connection.query(query, (error, results, fields) => {
            connection.release();

            if (error) { //throw error;
                console.error('query error : ' + error);
                return;
            }

            console.log('Thesis list get success.');
            res.render('statistics/thesisList', {
                userId: req.session.userId,
                userType: req.session.userType,
                userInfo: req.session.userInfo,
                moment: moment,
                thesisList: results
            });
        });
    });
};

exports.getThesis = (req, res) => {
    //session check
    if (!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    } else {
        logger.putLog(req);
    }

    const thesisId = req.params.id;
    const query = 'select * from Thesis where thesis_id=' + thesisId;

    mysqlPool.pool.getConnection((err, connection) => {
        if (err) { //throw err;
            console.error('getConnection err : ' + err);
            connection.release();
            return;
        }

        connection.query(query, (error, results, fields) => {
            connection.release();

            if (error) { //throw error;
                console.error('query error : ' + error);
                return;
            }

            console.log('Thesis get success.');
            res.render('statistics/modifyThesis', {
                userId: req.session.userId,
                userType: req.session.userType,
                userInfo: req.session.userInfo,
                moment: moment,
                thesis: results[0]
            });
        });
    });
};

exports.modifyThesis = (req, res) => {
//session check
    if (!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    } else {
        logger.putLog(req);
    }

    const thesis_info = Object.keys(req.body)
        .filter(key => req.body[key] !== "")
        .reduce((obj, key) => {
            obj[key] = req.body[key];
            return obj;
        }, {});

    thesis_info.ammend_date = moment(Date()).format('YYYY-MM-DD hh:mm:ss');

    if (req.file) {
        thesis_info.file_path = req.file.path;
        console.log("inputThesisFile upload success." + req.file.path);
    }

    let query = 'update Thesis set ? where thesis_id=' + thesis_info["thesis_id"];

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
        if (err) { //throw err;
            console.error('getConnection err : ' + err);
            connection.release();
            return;
        }

        connection.query(query, thesis_info, (error, results, fields) => {
            connection.release();

            if (error) { //throw error;
                console.error('query error : ' + error);
                return;
            }

            console.log('Thesis modify success.');
            res.redirect('thesis/' + thesis_info["thesis_id"]);
        });
    });
};

exports.deleteThesis = (req, res) => {
    if (!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    } else {
        logger.putLog(req);
    }

    const thesisId = req.body.thesis_id;
    const query = 'delete from Thesis where thesis_id=' + thesisId;

    mysqlPool.pool.getConnection((err, connection) => {
        if (err) { //throw err;
            console.error('getConnection err : ' + err);
            connection.release();
            return;
        }

        connection.query(query, (error, results, fields) => {
            connection.release();

            if (error) { //throw error;
                console.error('query error : ' + error);
                return;
            }

            console.log('Thesis get success.');
            res.redirect('thesisList');
        });
    });
};