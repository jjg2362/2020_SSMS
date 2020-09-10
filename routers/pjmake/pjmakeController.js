//use mysqlPool
var mysqlPool = require("../../middlewares/mysqlPool.js");
var express = require("express");
var app = express().use("/public", express.static("public"));
var moment = require("moment");

//use multer
var fileUpload = require("../../middlewares/fileUpload.js");
var logger = require("../../middlewares/logger.js");

//show project make page
exports.getMakeproject = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }
    //use connection
    var query = "select c.code_nm from code as c , code_category as cc ";
    query +=
      " where cc.code_id='prj_dev_field' and cc.code_id=c.code_id order by c.code_value ; ";

    query +=
      "select s.settings_id, s.prj_year, s.prj_semes, s.term_chk from admin_settings as s";
    query += " where s.use_yn=1 and s.prj_year = '" + moment(Date()).format("YYYY") + "' " ;
    query += " order by s.settings_id desc ; ";

    query += "select topic_sgst_apdx from apdx_file_info; ";

    query += "select m.* from mentor as m; ";

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      res.render("pjmake/DGU301", {
        CodeTermList: results,
        userId: req.session.userId,
        userType: req.session.userType,
        userInfo: req.session.userInfo,
        moment: moment,
        curDate: new Date()
      });
    });
  });
};

exports.postMakeproject = (req, res) => {
  logger.putLog(req);
  var fileInfo = {
    path: "/ssmsdata/mentorProjectFile/",
    namePrefix: "MENTORROJECTFILE_",
    viewNames: ["inputProjectFile","inputProjectVideo","inputProjectVideo2"]
  };

  fileUpload(fileInfo).multipartForm(req, res, err => {
    if (err) {
      logger.putLogDetail(req, "file upload error : " + err);
      return;
    }
    var developmentSelect = "";

    if (req.body.developmentSelect == "기타") {
      developmentSelect = req.body.developmentSelect1;
    } else {
      developmentSelect = req.body.developmentSelect;
    }

    var prjName = "";

    if (req.session.userType == "mentor") {
      var project = {
        prj_name: prjName + req.body.PjName,
        prj_outline: req.body.prj_outline,
        settings_id: req.body.Term,
        prj_bckgrd: req.body.prj_bckgrd,
        prj_ncst: req.body.prj_ncst,
        prj_pri_tech: req.body.prj_pri_tech,
        prj_goal: req.body.prj_goal,
        prj_content: req.body.prj_content,
        prj_exp_eff: req.body.prj_exp_eff,
        keyword1: req.body.inputKeyword1,
        keyword2: req.body.inputKeyword2,
        keyword3: req.body.inputKeyword3,
        prj_dev_field: developmentSelect,
        internship_yn: req.body.internship_yn,
        mentor_id: req.session.userId,
        regis_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
        registrant: req.session.userId,
        amend_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
        amender: req.session.userId,
        pre_matching: req.body.preMat,
        recommended_Prof: req.body.inputProf
      };
    } else if (req.session.userType == "admin") {
      var project = {
        prj_name: prjName + req.body.PjName,
        prj_outline: req.body.prj_outline,
        settings_id: req.body.Term,
        prj_bckgrd: req.body.prj_bckgrd,
        prj_ncst: req.body.prj_ncst,
        prj_pri_tech: req.body.prj_pri_tech,
        prj_goal: req.body.prj_goal,
        prj_content: req.body.prj_content,
        prj_exp_eff: req.body.prj_exp_eff,
        keyword1: req.body.inputKeyword1,
        keyword2: req.body.inputKeyword2,
        keyword3: req.body.inputKeyword3,
        prj_dev_field: developmentSelect,
        internship_yn: req.body.internship_yn,
        mentor_id: req.body.inputMentor,
        regis_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
        registrant: req.session.userId,
        amend_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
        amender: req.session.userId,
        pre_matching: req.body.preMat,
        recommended_Prof: req.body.inputProf
      };
    }

    if (req.files["inputProjectFile"] !== undefined) {
      project.appendix = req.files["inputProjectFile"][0].path;
      logger.putLogDetail(req, "file upload success.");
    }
    if (req.files["inputProjectVideo"] !== undefined) {
      project.appendix_video = req.files["inputProjectVideo"][0].path;
      logger.putLogDetail(req, "video upload success.");
    }
    if (req.files["inputProjectVideo2"] !== undefined) {
      project.appendix_video2 = req.files["inputProjectVideo2"][0].path;
      logger.putLogDetail(req, "video2 upload success.");
    }

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if (err) {
        //throw err;
        console.error("getConnection err : " + err);
        return;
      }

      //use connection
      var query = "insert into project";
      query += " set ?";

      connection.query(query, project, (error, results, fields) => {
        connection.release();

        if (error) {
          //throw error;
          console.error("query error : " + error);
          return;
        }
        logger.putLogDetail(req, "Register success.");
        res.redirect("DGU311");
      });
    });
  });
};

//show register page
exports.getManageproject = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }
    //use connection
    if (req.session.userType == "admin") {
      var query = "select * from project where use_yn=1;";
    } else {
      var query = "select * from project";
      query += " where mentor_id = '" + req.session.userId + "' and use_yn=1 ";
      query += " order by prj_id desc;";
    }

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      res.render("pjmake/DGU311", {
        PJList: results,
        userId: req.session.userId,
        userType: req.session.userType,
        userInfo: req.session.userInfo,
        moment: moment,
        curDate: new Date()
      });
    });
  });
};

//show Mentoring register page
exports.getMentoringproject = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }
    //use connection
    var query = "select * from project";
    query += " where prj_name = '";
    query += req.session.PJname + "'";
    query +=
      " AND mentor_id = '" + req.session.userId + "' order by prj_id desc ;";

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      res.render("pjmake/DGU302", {
        PJList: results,
        userId: req.session.userId,
        userType: req.session.userType,
        userInfo: req.session.userInfo,
        moment: moment,
        curDate: new Date()
      });
    });
  });
};

exports.postMentoringSchd = (req, res) => {
  logger.putLog(req);
  var mentoring_num = req.body.mentoringnum;

  var query = "";
  query +=
    "update project set mentoring_schd = '" +
    mentoring_num +
    "' where prj_id = '" +
    req.body.PJId +
    "' ; ";

  for (var i = 1; i <= mentoring_num; i++) {
    if (i == 1) {
      var Mentoringdate = req.body.MentoringDate1;
      var MentoringDetail = req.body.MentoringDetail1;
    } else if (i == 2) {
      var Mentoringdate = req.body.MentoringDate2;
      var MentoringDetail = req.body.MentoringDetail2;
    } else if (i == 3) {
      var Mentoringdate = req.body.MentoringDate3;
      var MentoringDetail = req.body.MentoringDetail3;
    } else if (i == 4) {
      var Mentoringdate = req.body.MentoringDate4;
      var MentoringDetail = req.body.MentoringDetail4;
    } else if (i == 5) {
      var Mentoringdate = req.body.MentoringDate5;
      var MentoringDetail = req.body.MentoringDetail5;
    } else if (i == 6) {
      var Mentoringdate = req.body.MentoringDate6;
      var MentoringDetail = req.body.MentoringDetail6;
    } else if (i == 7) {
      var Mentoringdate = req.body.MentoringDate7;
      var MentoringDetail = req.body.MentoringDetail7;
    } else if (i == 8) {
      var Mentoringdate = req.body.MentoringDate8;
      var MentoringDetail = req.body.MentoringDetail8;
    } else if (i == 9) {
      var Mentoringdate = req.body.MentoringDate9;
      var MentoringDetail = req.body.MentoringDetail9;
    } else if (i == 10) {
      var Mentoringdate = req.body.MentoringDate10;
      var MentoringDetail = req.body.MentoringDetail10;
    }

    query +=
      "insert into mentoring_schd (registrant, regis_date, mentor_id, prj_id, meeting_date, mentoring_topic) ";
    query +=
      "values ('" +
      req.session.userId +
      "', '" +
      moment(Date()).format("YYYY-MM-DD hh:mm:ss") +
      "', '" +
      req.session.userId +
      "', '" +
      req.body.PJId +
      "', '" +
      Mentoringdate +
      "', '" +
      MentoringDetail +
      "' ); ";
    query +=
      " insert into mentoring_report (registrant, regis_date, amender, amend_date,  mentor_id, prj_id, meeting_date) ";
    query +=
      "values ('" +
      req.session.userId +
      "', '" +
      moment(Date()).format("YYYY-MM-DD hh:mm:ss") +
      "','" +
      req.session.userId +
      "', '" +
      moment(Date()).format("YYYY-MM-DD hh:mm:ss") +
      "','" +
      req.session.userId +
      "', '" +
      req.body.PJId +
      "', '" +
      Mentoringdate +
      "'); ";
  }
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      logger.putLogDetail(req, "Mentoring schd Register success.");
      res.redirect("/");
    });
  });
};

exports.getAdditionPj = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  var query =
    "select p.*  from project as p where p.prj_id = '" +
    req.params.pjId +
    "' ;";

  query += "select c.code_nm from code as c , code_category as cc ";
  query +=
    "where cc.code_id='prj_dev_field' and cc.code_id=c.code_id order by c.code_value; ";

  query +=
    "select s.settings_id, s.prj_year, s.prj_semes, s.term_chk from admin_settings as s  ";
  query += "where s.prj_year = '" + moment(Date()).format("YYYY") + "' ";
  query += "order by s.settings_id desc ;";

  query += "select topic_sgst_apdx from apdx_file_info; ";

  query +=
    "select company_name,mentor_id ,mentor_name from mentor where auth_status='1' order by company_name ; ";
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      if (results.length > 0) {
        logger.putLogDetail(req, "lookup project success.");

        res.render("pjmake/DGU314", {
          PjSettingInfo: results,
          moment: moment,
          userInfo: req.session.userInfo
        });
      } else {
        res.redirect("/");
      }
    });
  });
};
exports.postAdditionPj = (req, res) => {
  logger.putLog(req);
  var fileInfo = {
    path: "public/mentorProjectFile/",
    namePrefix: "MENTORROJECTFILE_",
    viewNames: ["inputProjectFile"]
  };

  fileUpload(fileInfo).multipartForm(req, res, err => {
    if (err) {
      logger.putLogDetail(req, "file upload error : " + err);
      return;
    }
    var developmentSelect = "";

    if (req.body.developmentSelect == "기타") {
      developmentSelect = req.body.developmentSelect1;
    } else {
      developmentSelect = req.body.developmentSelect;
    }

    var mentor_id_Select = "";
    if (req.body.inputmentor == "0") {
      mentor_id_Select = req.body.mentorid;
    } else {
      mentor_id_Select = req.body.inputmentor;
    }

    var prjName = "";

    if (
      req.body.preMat == "1" &&
      req.body.PjName.substring(0, 14) != "[Pre-Matching]"
    ) {
      prjName = "[Pre-Matching] " + req.body.PjName;
    } else if (
      req.body.preMat == "0" &&
      req.body.PjName.substring(0, 14) == "[Pre-Matching]"
    ) {
      prjName = req.body.PjName.substring(15);
    } else {
      prjName = req.body.PjName;
    }

    var project = {
      prj_name: req.body.PjName,
      prj_outline: req.body.prj_outline,
      settings_id: req.body.Term,
      prj_bckgrd: req.body.prj_bckgrd,
      prj_ncst: req.body.prj_ncst,
      prj_pri_tech: req.body.prj_pri_tech,
      prj_goal: req.body.prj_goal,
      prj_content: req.body.prj_content,
      prj_exp_eff: req.body.prj_exp_eff,
      keyword1: req.body.inputKeyword1,
      keyword2: req.body.inputKeyword2,
      keyword3: req.body.inputKeyword3,
      prj_dev_field: developmentSelect,
      internship_yn: req.body.internship_yn,
      mentor_id: mentor_id_Select,
      regis_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
      registrant: req.session.userId,
      amend_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
      amender: req.session.userId,
      pre_matching: req.body.preMat,
      recommended_Prof: req.body.inputProf
    };

    if (req.files["inputProjectFile"] !== undefined) {
      project.appendix = req.files["inputProjectFile"][0].path;
      logger.putLogDetail(req, "file upload success.");
    } else {
      project.appendix = req.body.projectAppendix;
    }

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if (err) {
        //throw err;
        console.error("getConnection err : " + err);
        return;
      }

      //use connection
      var query = "insert into project";
      query += " set ?";

      connection.query(query, project, (error, results, fields) => {
        connection.release();

        if (error) {
          //throw error;
          console.error("query error : " + error);
          return;
        }
        logger.putLogDetail(req, "Register success.");
        res.redirect("DGU311");
      });
    });
  });
};

exports.getDetailPj = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    var query = "select p.*, m.* from project as p, mentor as m";
    query +=
      " where p.prj_id = '" +
      req.params.pjId +
      "' and p.mentor_id = m.mentor_id ;";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      if (results.length > 0) {
        logger.putLogDetail(req, "lookup project success.");
        res.render("pjmake/DGU312", {
          pjInfo: results,
          moment: moment,
          userInfo: req.session.userInfo
        });
      } else {
        res.redirect("/");
      }
    });
  });
};

exports.getEditPj = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  var query =
    "select p.*  from project as p where p.prj_id = '" +
    req.body.projectID +
    "' ;";

  query += "select c.code_nm from code as c , code_category as cc ";
  query +=
    "where cc.code_id='prj_dev_field' and cc.code_id=c.code_id order by c.code_value; ";

  query +=
    "select s.settings_id, s.prj_year, s.prj_semes, s.term_chk from admin_settings as s  ";
  query += "where use_yn = 1 ";
  query += "order by s.settings_id desc ;";

  query += "select topic_sgst_apdx from apdx_file_info; ";

  query +=
    "select m.mentor_id, m.mentor_name, m.company_name from mentor as m; ";
  query +=
    "select t.team_name,t.team_id,p.prj_name,p.prj_id from team as t left join project as p on t.prj_id = p.prj_id and t.use_yn='1'; ";

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      if (results.length > 0) {
        logger.putLogDetail(req, "lookup project success.");

        res.render("pjmake/DGU313", {
          PjSettingInfo: results,
          moment: moment,
          userType: req.session.userType,
          userInfo: req.session.userInfo
        });
      } else {
        res.redirect("/");
      }
    });
  });
};

exports.postEditproject = (req, res) => {
  logger.putLog(req);

  var fileInfo = {
    path: "/ssmsdata/mentorProjectFile/",
    namePrefix: "MENTORROJECTFILE_",
    viewNames: ["inputProjectFile", "inputProjectVideo" ,"inputProjectVideo2"]
  };

  fileUpload(fileInfo).multipartForm(req, res, err => {
    if (err) {
      logger.putLogDetail(req, "file upload error : " + err);
      return;
    }
    var developmentSelect = "";

    if (req.body.developmentSelect == "기타") {
      developmentSelect = req.body.developmentSelect1;
    } else {
      developmentSelect = req.body.developmentSelect;
    }

    var prjName = "";

    if (
      req.body.preMat == "1" &&
      req.body.PjName.substring(0, 14) != "[Pre-Matching]"
    ) {
      prjName = "[Pre-Matching] " + req.body.PjName;
    } else if (
      req.body.preMat == "0" &&
      req.body.PjName.substring(0, 14) == "[Pre-Matching]"
    ) {
      prjName = req.body.PjName.substring(15);
    } else {
      prjName = req.body.PjName;
    }

    var project = {
      prj_name: req.body.PjName,
      prj_outline: req.body.prj_outline,
      prj_bckgrd: req.body.prj_bckgrd,
      prj_ncst: req.body.prj_ncst,
      prj_pri_tech: req.body.prj_pri_tech,
      prj_goal: req.body.prj_goal,
      prj_content: req.body.prj_content,
      prj_exp_eff: req.body.prj_exp_eff,
      keyword1: req.body.inputKeyword1,
      keyword2: req.body.inputKeyword2,
      keyword3: req.body.inputKeyword3,
      prj_dev_field: developmentSelect,
      settings_id: req.body.Term,
      internship_yn: req.body.internship_yn,
      amend_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
      amender: req.session.userId,
      pre_matching: req.body.preMat,
      recommended_Prof: req.body.inputProf
    };

    var project2 = {
      prj_name: req.body.PjName,
      prj_outline: req.body.prj_outline,
      prj_bckgrd: req.body.prj_bckgrd,
      prj_ncst: req.body.prj_ncst,
      prj_pri_tech: req.body.prj_pri_tech,
      prj_goal: req.body.prj_goal,
      prj_content: req.body.prj_content,
      prj_exp_eff: req.body.prj_exp_eff,
      keyword1: req.body.inputKeyword1,
      keyword2: req.body.inputKeyword2,
      keyword3: req.body.inputKeyword3,
      prj_dev_field: developmentSelect,
      settings_id: req.body.Term,
      internship_yn: req.body.internship_yn,
      amend_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
      amender: req.session.userId,
      mentor_id: req.body.selectMentor,
      pre_matching: req.body.preMat,
      recommended_Prof: req.body.inputProf
    };

    var team = {
      prj_id: req.body.projectID,
      mentor_id: req.body.selectMentor
    };

    var team2 = {
      prj_id: "",
      mentor_id: ""
    };

    //
    // if(req.file !== undefined) {
    //   project.appendix = req.file.path;
    //   console.log("file upload success.");
    // }

    if (req.files["inputProjectFile"] !== undefined) {
      project.appendix = req.files["inputProjectFile"][0].path;
      logger.putLogDetail(req, "file upload success.");
    }
    if (req.files["inputProjectVideo"] !== undefined) {
      project.appendix_video = req.files["inputProjectVideo"][0].path;
      logger.putLogDetail(req, "video upload success.");
    }
    if (req.files["inputProjectVideo2"] !== undefined) {
      project.appendix_video = req.files["inputProjectVideo2"][0].path;
      logger.putLogDetail(req, "video2 upload success.");
    }

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if (err) {
        //throw err;
        console.error("getConnection err : " + err);
        return;
      }

      //use connection
      var query = "update project";
      query += " set ? ";
      query += " where prj_id = '" + req.body.projectID + "';";

      var query2 =
        "update team set ? where team_id = '" + req.body.selectTeam + "';";
      var query3 =
        "update team set ? where team_id = '" + req.body.originTeam + "';";

      if (req.body.selectTeam) {
        connection.query(query3, team2, (error, results, fields) => {
          connection.release();
          if (error) {
            //throw error;
            console.error("query error : " + error);
            return;
          }
          logger.putLogDetail(req, "Edit Team success. (originTeam)");
        });

        connection.query(query2, team, (error, results, fields) => {
          if (error) {
            //throw error;
            console.error("query error : " + error);
            return;
          }
          logger.putLogDetail(req, "Edit Team success. (selectTeam)");
        });
      }

      if (req.body.selectMentor) {
        connection.query(query, project2, (error, results, fields) => {
          if (error) {
            //throw error;
            console.error("query error : " + error);
            return;
          }
          req.session.PJname = req.body.PjName;
          logger.putLogDetail(req, "Register success.(selectMentor)");
          res.redirect("DGU311");
        });
      } else {
        connection.query(query, project, (error, results, fields) => {
          connection.release();
          if (error) {
            //throw error;
            console.error("query error : " + error);
            return;
          }
          req.session.PJname = req.body.PjName;
          logger.putLogDetail(req, "Register success.");
          res.redirect("DGU311");
        });
      }
    });
  });
};

exports.getCancelEdit = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }
  res.redirect("/pjmake/DGU311");
};

exports.postDeletePj = (req, res) => {
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }
  var query = "";
  query += "delete from project where prj_id = '" + req.body.projectID + "' ; ";

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      logger.putLogDetail(req, "delete project success.");
      res.redirect("/pjmake/DGU311");
    });
  });
};

exports.getPjMentor = (req, res) => {
  //session check

  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  var query =
    "select p.prj_id, p.prj_name, p.mentor_id, m.mentor_name, m.company_name from project as p ";
  query +=
    "left join mentor as m on p.mentor_id=m.mentor_id and p.use_yn=1 where p.use_yn = 1 order by p.prj_name; ";

  query +=
    "select mentor_id, company_name ,mentor_name from mentor order by company_name; ";

  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }
      //use results and fields
      res.render("pjmake/DGU315", {
        PjMentor: results,
        userInfo: req.session.userInfo
      });
    });
  });
};

exports.postPjMentorMatching = (req, res) => {
  logger.putLog(req);

  var query = `update project set mentor_id ='${req.body.MentorID}'
  , amend_date = '${moment(Date()).format("YYYY-MM-DD hh:mm:ss")}'
  , amender = '${req.session.userId}'
  where prj_id = '${req.body.ProjectID}' ;`;

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }
    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      logger.putLogDetail(req, "Project - Mentor Matching success.");
      res.redirect("pjmentor");
    });
  });
};
