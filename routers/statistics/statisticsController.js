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

    const query = 'select * from statistics';

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
            console.log(results)
            console.log('Thesis list get success.');
            res.render('statistics/thesisList', {
                userId: req.session.userId,
                userType: req.session.userType,
                userInfo: req.session.userInfo,
                moment: moment,
                statistics: results
            });
        });
    });
};

exports.getThesisListField = (req, res) => {
    //session check
    if (!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    } else {
        logger.putLog(req);
    }

    const year = req.query.year;
    const field = req.query.field;
    let fieldStr = field === "instructor" ? "": ", "+field;
    fieldStr = field === "class_name" ? "": ", "+field;

    const query = `select instructor, major, class_name${fieldStr} from statistics where year=${year}`;
    console.log(query)

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
            console.log(results)
            console.log('Thesis list get success.');
            res.render('statistics/thesisListField', {
                userId: req.session.userId,
                userType: req.session.userType,
                userInfo: req.session.userInfo,
                moment: moment,
                statistics: results,
                year: year,
                field: field
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

//

function sessionCheck(req) {
    if (!req.session.userId) {
        console.log('do not have a session.');
        return false;
    } else {
        return true;
    }
}

exports.getAllStatistic = (req, res) => {
    // session check
    if(!sessionCheck(req)) res.redirect('/');
    else logger.putLog(req);

    // get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
        if (err) { //throw err;
            console.error('getConnection err : ' + err);
            connection.release();
            return;
        }

        // write query / use connection
        let query = "";

        // #1 진행 프로젝트 수 참여 팀수 참여 교수수 개설 수업수 참여 회사수 참여 멘토수 멘토링 진행수
        query += "select distinct p.prj_id, ads.prj_year, ads.prj_semes, ads.term_chk, ads.transfer_date, p.prj_name, p.prj_id, ct_me.cnt as mentor_cnt, t.team_name, ";
        query += "t.class_num, ins.major, ins.inst_name, me.company_name, me.mentor_name, me.phone_num ";
        query += "from admin_settings as ads, project as p ";
        query += "left outer join (select count(*) as cnt, mr.prj_id from mentoring_report as mr, project as p1 where mr.prj_id = p1.prj_id group by p1.prj_id) as ct_me on p.prj_id = ct_me.prj_id ";
        query += "left outer join (select t.team_name, t.class_num, t.prj_id from team as t, project as p2 where t.prj_id = p2.prj_id group by p2.prj_id) as t on p.prj_id = t.prj_id ";
        query += "left outer join (select ins.inst_name, ins.inst_id, ins.major, ci.class_num from instructor as ins, class_info as ci where ins.inst_id = ci.inst_id) as ins on t.class_num = ins.class_num ";
        query += "left outer join (select me.mentor_id, me.company_name , me.mentor_name, me.phone_num from mentor as me, project as p3 where p3.mentor_id = me.mentor_id ) as me on p.mentor_id = me.mentor_id ";
        query += "where ads.settings_id = p.settings_id and p.use_yn = 0 ";
        query += "order by prj_year desc, prj_semes desc;";

        // #2 논문등재수
        query += "select thesis_file from final_product;";

        // #3 참여학생수 
        query += "select distinct ads.prj_year, sti.std_id";
        query += " from admin_settings as ads, team as t, std_team_info as sti";
        query += " where t.team_id = sti.team_id and ads.settings_id = t.settings_id and sti.use_yn = 1;";

        connection.query(query, (error, results, fields) => {
            connection.release();

            if (error) { //throw error;
                console.error('query error : ' + error);
                return;
            }

            res.render('statistics/allStatistic', {statisticInfo: results, userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
        });
    });
};

exports.getStatisticField = (req, res) => {
    // session check
    if (!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    } else {
        logger.putLog(req);
    }

    const year = req.query.year;
    const field = req.query.field;

    // write query / use connection
    let query = "";

    query += "select distinct p.prj_id, ads.prj_year, ads.prj_semes, ads.term_chk, ads.transfer_date, p.prj_name, p.prj_id, ct_me.cnt as mentor_cnt, t.team_name, ";
    query += "t.class_num, ins.major, ins.inst_name, me.company_name, me.mentor_name, me.phone_num ";
    query += "from admin_settings as ads, project as p ";
    query += "left outer join (select count(*) as cnt, mr.prj_id from mentoring_report as mr, project as p1 where mr.prj_id = p1.prj_id group by p1.prj_id) as ct_me on p.prj_id = ct_me.prj_id ";
    query += "left outer join (select t.team_name, t.class_num, t.prj_id from team as t, project as p2 where t.prj_id = p2.prj_id group by p2.prj_id) as t on p.prj_id = t.prj_id ";
    query += "left outer join (select ins.inst_name, ins.inst_id, ins.major, ci.class_num from instructor as ins, class_info as ci where ins.inst_id = ci.inst_id) as ins on t.class_num = ins.class_num ";
    query += "left outer join (select me.mentor_id, me.company_name , me.mentor_name, me.phone_num from mentor as me, project as p3 where p3.mentor_id = me.mentor_id ) as me on p.mentor_id = me.mentor_id ";
    query += "where ads.settings_id = p.settings_id and p.use_yn = 0 ";
    query += "order by prj_year desc, prj_semes desc;";

    if(field === 'class_name') {
        
        query += "select class_num, class_name from class_info;";
    } else if(field === 'student_num') {

        query += "select class_num, class_name from class_info;";

        // 참여 학생목록
        query += "select p.prj_name, t.team_name, t.class_num, t.prj_id, sti.*, st.major, st.email_ad, st.std_name, st.phone_num, ads.prj_year";
        query += " from project as p, team as t, std_team_info as sti, student as st, admin_settings as ads";
        query += " where p.use_yn = 0 and t.prj_id = p.prj_id and sti.team_id = t.team_id and st.std_id = sti.std_id and ads.settings_id = p.settings_id";
        query += " order by p.prj_id;";
    } else if(field === 'instructor') {

    } else if(field === 'company_num') {

        query += "select class_num, class_name from class_info;";
    } else if(field === 'team_num') {

        query += "select class_num, class_name from class_info;";
    } else if(field === 'project_num') {

        query += "select class_num, class_name from class_info;";
    } else if(field === 'mentoring_num') {

        query += "select class_num, class_name from class_info;";
    } else if(field === 'mentor_num') {

        query += "select class_num, class_name from class_info;";
    } else if(field === 'thesis_num') {

        query += "select class_num, class_name from class_info;";

        // 논문등재수
        query += "select t.class_num, f.thesis_file ";
        query += "from final_product as f, team as t ";
        query += "where f.team_id = t.team_id;";
    }

    // get connection from pool
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

            res.render('statistics/statisticField', {
                fieldInfo: results, 
                year: year,
                field: field,
                userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
        });
    });
};