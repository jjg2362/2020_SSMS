//pj controller

//use mysqlPool
var mysqlPool = require("../../middlewares/mysqlPool.js");
var moment = require("moment");
var fileUpload = require("../../middlewares/fileUpload.js");
var logger = require("../../middlewares/logger.js");

var query_where = "";
var flag = false;

//show informationn of "My project"
exports.getMyproject = (req, res) => {
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
    var query = "select p.*,t.*,m.* from project as p, team as t, mentor as m";
    query +=
      " where p.mentor_id = m.mentor_id and p.prj_id = t.prj_id and p.prj_id = '" +
      req.params.PJId +
      "';";
    query +=
      " select * from project_plan_report where prj_id = '" +
      req.params.PJId +
      "';";
    query += " select prj_plan_apdx from apdx_file_info where use_yn = 1;";

    // console.log(query);
    connection.query(query, (error, results, fields) => {
      connection.release();
      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }
      logger.putLogDetail(req, "Project Detail Page: " + req.params.PJId);
      //use results and field
      if (results.length > 0) {
        logger.putLogDetail(req, "lookup project success.");
        res.render("pjmng/DGU501", {
          pjInfo: results,
          moment: moment,
          userInfo: req.session.userInfo,
        });
      } else {
        res.redirect("/");
      }
    });
  });
};

exports.postprjplan = (req, res) => {
  logger.putLog(req);
  var fileInfo = {
    path: "/ssmsdata/ProjectPlan/",
    namePrefix: "PRJPL",
    viewNames: ["ProjectPlanFile"],
  };
  fileUpload(fileInfo).multipartForm(req, res, (err) => {
    if (err) {
      logger.putLogDetail(req, "file upload error : " + err);
      return;
    }
    if (!req.session.userId) {
      console.log("do not have a session.");
      res.redirect("/");
      return;
    }

    if (req.params.formType == "PostReport") {
      var project_plan_report = {
        prj_id: req.body.PJId,
        mentor_id: req.body.MENTORId,
        team_id: req.body.TEAMId,
        leader_id: req.session.userId,
        sub_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
        amender: req.session.userId,
        amend_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
        registrant: req.session.userId,
        regis_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
      };
      if (req.files["ProjectPlanFile"] !== undefined) {
        project_plan_report.prj_plan_report =
          req.files["ProjectPlanFile"][0].path;
        logger.putLogDetail(req, "Project Plan Report file upload success.");
      }
      //get connection from pool
      mysqlPool.pool.getConnection((err, connection) => {
        if (err) {
          //throw err;
          console.error("getConnection err : " + err);
          return;
        }

        var query = "insert into project_plan_report ";
        query += " set ?";
        //use connection
        connection.query(
          query,
          project_plan_report,
          (error, results, fields) => {
            connection.release();

            if (error) {
              //throw error;
              console.error("query error : " + error);
              return;
            }

            logger.putLogDetail(req, "Project Plan Report Submitted.");
            var way = "/pjmng/DGU501/" + req.body.PJId;
            res.redirect(way);
          }
        );
      });
    } else if (req.params.formType == "DeleteReport") {
      var query = "delete from project_plan_report";
      query += " where prj_id = '" + req.body.PJId + "'";
      logger.putLogDetail(
        req,
        "Delete project plan Report: " +
          req.body.PJId +
          ", id: " +
          req.session.userId
      );
      mysqlPool.pool.getConnection((err, connection) => {
        if (err) {
          //throw err;
          console.error("getConnection err : " + err);
          return;
        }

        //use connection
        connection.query(query, (error, results, fields) => {
          connection.release();

          if (error) {
            //throw error;
            console.error("query error : " + error);
            return;
          }

          logger.putLogDetail(req, "Project Plan Report Deleted.");
          var way = "/pjmng/DGU501/" + req.body.PJId;
          res.redirect(way);
        });
      });
    }
  });
};
exports.getSearchproject1 = (req, res) => {
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

    var query = "";

    if (req.session.userInfo.userType == "mentor") {
      query +=
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id, sti.*, st.major, st.email_ad, st.std_name, st.phone_num  from project as p, admin_settings as s, team as t, std_team_info as sti, student as st";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id and sti.team_id = t.team_id and p.mentor_id = '" +
        req.session.userId +
        "' and st.std_id = sti.std_id";
      query += " order by p.prj_id;";
      // console.log(query);
    } else if (req.session.userInfo.userType == "student") {
      query +=
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id, sti.std_id, sti.team_id from project as p, admin_settings as s, team as t, std_team_info as sti";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id and sti.team_id = t.team_id and sti.std_id = '" +
        req.session.userId +
        "'";
      query += " order by p.prj_id;";
      // console.log(query);
    } else if (req.session.userInfo.userType == "admin") {
      query =
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id from project as p, admin_settings as s, team as t";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id";
      query += " order by p.prj_id;";
      // console.log(query);
    } else if (req.session.userInfo.userType == "assistant") {
      query =
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id, c.* from project as p, admin_settings as s, team as t, class_info as c";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id and c.class_num = t.class_num and c.settings_id = t.settings_id and c.assis_id = '" +
        req.session.userId +
        "'";
      query += " order by p.prj_id;";
      // console.log(query);

      // 권한 받은 과목의 프로젝트 포함해서 목록 가져오기
      // query += " select * from ";
      // query += "(select s.settings_id as settings_id2, s.term_chk, c.* from admin_settings as s, class_info as c, class_inst_authority as cia\n" +
      //     "where cia.sub_user_id = '"+req.session.userId+"' and cia.class_num = c.class_num and cia.settings_id = s.settings_id) as t1 ";
      // query += "left join ";
      // query += "(select p.*, t.team_name, t.class_num from project as p, team as t\n" +
      //     "where p.use_yn = 1 and t.prj_id = p.prj_id) as t2 ";
      // query += "on t1.class_num = t2.class_num and t1.settings_id2 = t2.settings_id;";
    } else if (req.session.userInfo.userType == "instructor") {
      query =
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id, c.* from project as p, admin_settings as s, team as t, class_info as c";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id and c.class_num = t.class_num and c.settings_id = t.settings_id and c.inst_id = '" +
        req.session.userId +
        "'";
      query += " order by p.prj_id;";
      // console.log(query);

      // 권한 받은 과목의 프로젝트 목록 가져오기
      // query += " select * from ";
      // query += "(select s.settings_id as settings_id2, s.term_chk, c.* from admin_settings as s, class_info as c, class_inst_authority as cia\n" +
      //     "where cia.sub_user_id = '"+req.session.userId+"' and cia.class_num = c.class_num and cia.settings_id = s.settings_id) as t1 ";
      // query += "left join ";
      // query += "(select p.*, t.team_name, t.class_num from project as p, team as t\n" +
      //     "where p.use_yn = 1 and t.prj_id = p.prj_id) as t2 ";
      // query += "on t1.class_num = t2.class_num and t1.settings_id2 = t2.settings_id;";
    }

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }
      console.log(results);
      //use results and fields
      res.render("pjmng/DGU502", {
        PJList: results,
        userId: req.session.userId,
        userType: req.session.userType,
        userInfo: req.session.userInfo,
        moment: moment,
        curDate: new Date(),
      });
    });
  });
};

exports.postSearchproject = (req, res) => {
  logger.putLog(req);
  query_where = " where ";
  var cnt = 0;
  if (req.body.selectTerm != "0") {
    if (cnt != 0) {
      query_where += " AND prj_term = '" + req.body.selectTerm + "'";
    } else {
      query_where += " prj_term = '" + req.body.selectTerm + "'";
    }
    cnt++;
  }

  if (req.body.selectDevelopment != "0") {
    if (cnt != 0) {
      query_where +=
        " AND prj_dev_field = '" + req.body.selectDevelopment + "'";
    } else {
      query_where += " prj_dev_field = '" + req.body.selectDevelopment + "'";
    }
    cnt++;
  }

  if (req.body.SearchContent != "") {
    if (cnt != 0) {
      query_where += " AND prj_name LIKE '" + req.body.SearchContent + "%'";
    } else {
      query_where += " prj_name LIKE '%" + req.body.SearchContent + "%'";
    }
    cnt++;
  }

  flag = true;

  res.redirect("/pjmng/DGU512");
};
exports.getSearchproject = (req, res) => {
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

    var query = "";

    if (req.session.userInfo.userType == "mentor") {
      query +=
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id from project as p, admin_settings as s, team as t";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id and p.mentor_id = '" +
        req.session.userId +
        "'";
      query += " order by p.prj_id;";
      // console.log(query);
    } else if (req.session.userInfo.userType == "student") {
      query +=
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id, sti.std_id, sti.team_id from project as p, admin_settings as s, team as t, std_team_info as sti";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id and sti.team_id = t.team_id and sti.std_id = '" +
        req.session.userId +
        "'";
      query += " order by p.prj_id;";
      // console.log(query);
    } else if (req.session.userInfo.userType == "admin") {
      query =
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id from project as p, admin_settings as s, team as t";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id";
      query += " order by p.prj_id;";
      // console.log(query);
    } else if (req.session.userInfo.userType == "assistant") {
      query =
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id, c.* from project as p, admin_settings as s, team as t, class_info as c";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id and c.class_num = t.class_num and c.settings_id = t.settings_id and c.assis_id = '" +
        req.session.userId +
        "'";
      query += " order by p.prj_id;";
      // console.log(query);
    } else if (req.session.userInfo.userType == "instructor") {
      query =
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id, c.* from project as p, admin_settings as s, team as t, class_info as c";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id and c.class_num = t.class_num and c.settings_id = t.settings_id and c.inst_id = '" +
        req.session.userId +
        "'";
      query += " order by p.prj_id;";
      // console.log(query);

      // 권한 받은 과목의 프로젝트 목록 가져오기
      // query += " select * from ";
      // query += "(select s.settings_id as settings_id2, s.term_chk, c.* from admin_settings as s, class_info as c, class_inst_authority as cia\n" +
      //     "where cia.sub_user_id = '"+req.session.userId+"' and cia.class_num = c.class_num and cia.settings_id = s.settings_id) as t1 ";
      // query += "left join ";
      // query += "(select p.*, t.team_name, t.class_num from project as p, team as t\n" +
      //     "where p.use_yn = 1 and t.prj_id = p.prj_id) as t2 ";
      // query += "on t1.class_num = t2.class_num and t1.settings_id2 = t2.settings_id;";
    }
    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      res.render("pjmng/DGU512", {
        PJList: results,
        userId: req.session.userId,
        userType: req.session.userType,
        userInfo: req.session.userInfo,
        moment: moment,
        curDate: new Date(),
      });
    });
  });
};
exports.getSearchproject2 = (req, res) => {
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

    var query = "";

    if (req.session.userInfo.userType == "mentor") {
      query +=
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id from project as p, admin_settings as s, team as t";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id and p.mentor_id = '" +
        req.session.userId +
        "'";
      query += " order by p.prj_id;";
      // console.log(query);
    } else if (req.session.userInfo.userType == "student") {
      query +=
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id, sti.std_id, sti.team_id from project as p, admin_settings as s, team as t, std_team_info as sti";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn=1 and t.prj_id = p.prj_id and sti.team_id = t.team_id and sti.std_id = '" +
        req.session.userId +
        "'";
      query += " order by p.prj_id;";
      // console.log(query);
    } else if (req.session.userInfo.userType == "admin") {
      query =
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id from project as p, admin_settings as s, team as t";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id";
      query += " order by p.prj_id;";
      // console.log(query);
    } else if (req.session.userInfo.userType == "assistant") {
      query =
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id, c.* from project as p, admin_settings as s, team as t, class_info as c";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id and c.class_num = t.class_num and c.settings_id = t.settings_id and c.assis_id = '" +
        req.session.userId +
        "'";
      query += " order by p.prj_id;";
      // console.log(query);
    } else if (req.session.userInfo.userType == "instructor") {
      query =
        "select p.*, s.settings_id, s.term_chk, t.team_name, t.prj_id, c.* from project as p, admin_settings as s, team as t, class_info as c";
      query +=
        " where p.settings_id = s.settings_id and p.use_yn = 1 and t.prj_id = p.prj_id and c.class_num = t.class_num and c.settings_id = t.settings_id and c.inst_id = '" +
        req.session.userId +
        "'";
      query += " order by p.prj_id;";
      // console.log(query);

      // 권한 받은 과목의 프로젝트 목록 가져오기
      // query += " select * from ";
      // query += "(select s.settings_id as settings_id2, s.term_chk, c.* from admin_settings as s, class_info as c, class_inst_authority as cia\n" +
      //     "where cia.sub_user_id = '"+req.session.userId+"' and cia.class_num = c.class_num and cia.settings_id = s.settings_id) as t1 ";
      // query += "left join ";
      // query += "(select p.*, t.team_name, t.class_num from project as p, team as t\n" +
      //     "where p.use_yn = 1 and t.prj_id = p.prj_id) as t2 ";
      // query += "on t1.class_num = t2.class_num and t1.settings_id2 = t2.settings_id;";
    }
    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      res.render("pjmng/DGU522", {
        PJList: results,
        userId: req.session.userId,
        userType: req.session.userType,
        userInfo: req.session.userInfo,
        moment: moment,
        curDate: new Date(),
      });
    });
  });
};
exports.getSearchproject3 = (req, res) => {
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }
  var query =
    "select p.prj_id, a.prj_year, a.prj_semes, a.term_chk, p.prj_name, f.*,t.*, pp.prj_plan_report from final_product as f, team as t, project_plan_report as pp, project as p, admin_settings as a";
  query +=
    " where t.team_id = f.team_id and pp.team_id = t.team_id and t.use_yn = 1 and t.prj_id = p.prj_id and a.settings_id = p.settings_id;";
  query += "select a.settings_id, a.prj_year, a.prj_semes, a.term_chk from admin_settings as a where a.use_yn=1;"

  connection.query(query, (error, results, fields) => {
    connection.release();

    if (error) {
      //throw error;
      console.error("query error : " + error);
      return;
    }

    //use results and fields
    res.render("pjmng/DGU532", {
      FinalLists: results[0],
      Options1: results[1],
      userInfo: req.session.userInfo,
    });
  });
  });
};

exports.postSearchproject3 = (req, res) => {
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }
  var query =
    "select p.prj_id, a.prj_year, a.prj_semes, a.term_chk, p.prj_name, f.*,t.*, pp.prj_plan_report from final_product as f, team as t, project_plan_report as pp, project as p, admin_settings as a";
  query +=
    " where t.team_id = f.team_id and pp.team_id = t.team_id and t.use_yn = 1 and t.prj_id = p.prj_id and a.settings_id = p.settings_id;";
  query += "select a.settings_id, a.prj_year, a.prj_semes, a.term_chk from admin_settings as a where a.use_yn=1;"

  connection.query(query, (error, results, fields) => {
    connection.release();

    if (error) {
      //throw error;
      console.error("query error : " + error);
      return;
    }

    //use results and fields
    res.render("pjmng/DGU532", {
      FinalLists: results[0],
      Options1: results[1],
      userInfo: req.session.userInfo,
    });
  });
  });
};

//show Mentoring Report lists
exports.getMentoringReport = (req, res) => {
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
    if (req.session.userInfo.userType == "student") {
      var query =
        "select m.*,sti.* from mentoring_report as m, std_team_info as sti";
      query +=
        " where sti.team_id = m.team_id and sti.std_id = '" +
        req.session.userId +
        "'";
      query += " order by m.sub_date;";
      query += "select t.*,sti.* from team as t, std_team_info as sti";
      query +=
        " where sti.team_id = t.team_id and sti.std_id = '" +
        req.session.userId +
        "';";
    } else if (req.session.userInfo.userType == "mentor") {
      var query = "select m.*,sti.* from mentoring_report as m, team as sti";
      query +=
        " where sti.team_id = m.team_id and sti.mentor_id = '" +
        req.session.userId +
        "'";
      query += " order by m.sub_date;";
      query += "select t.* from team as t";
      query += " where t.mentor_id = '" + req.session.userId + "';";
    }
    // console.log(query);

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }
      //console.log(results);
      //use results and field
      if (results.length > 0) {
        logger.putLogDetail(req, "lookup mentoring report success.");
        res.render("pjmng/DGU511", {
          mtrInfo: results,
          moment: moment,
          userInfo: req.session.userInfo,
        });
      } else {
        res.redirect("/");
      }
    });
  });
};
exports.getMentoringReport1 = (req, res) => {
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
    var query = "select m.* from mentoring_report as m";
    query += " where m.prj_id = '" + req.params.PJId + "'; ";
    if (req.session.userInfo.userType == "student") {
      query +=
        "select sti.*,t.*,p.settings_id, ad.mentoring_limit from std_team_info as sti, project as p, team as t, admin_settings as ad";
      query +=
        " where sti.std_id = '" +
        req.session.userId +
        "'and t.prj_id = '" +
        req.params.PJId +
        "' and p.prj_id = t.prj_id and t.team_id = sti.team_id and p.settings_id = ad.settings_id; ";
    } else {
      query +=
        "select t.*, ad.mentoring_limit,p.settings_id from team as t, admin_settings as ad, project as p";
      query +=
        " where t.prj_id = '" +
        req.params.PJId +
        "' and p.prj_id = t.prj_id and p.settings_id = ad.settings_id; ";
    }
    query += "select prj_plan_report from project_plan_report";
    query += " where prj_id = '" + req.params.PJId + "'; ";

    // console.log(query);

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }
      //console.log(results);
      //use results and field
      logger.putLogDetail(req, "lookup mentoring report success.");
      res.render("pjmng/DGU511", {
        mtrInfo: results,
        moment: moment,
        userInfo: req.session.userInfo,
      });
    });
  });
};
exports.postMentoringReport1 = (req, res) => {
  logger.putLog(req);

  if (req.session.userInfo.userType == "student") {
    if (req.params.PJId == "DeleteReport1") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt1 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt1 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport2") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt2 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt2 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport3") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt3 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt3 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport4") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt4 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt4 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport5") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt5 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt5 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport6") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt6 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt6 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport7") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt6 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt7 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport8") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt7 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt8 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport9") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt8 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt9 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport10") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt10 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt10 +
          ", id: " +
          req.session.userId
      );
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

        logger.putLogDetail(req, "Mentoring Report Deleted.");
        var way = "/pjmng/DGU511/" + req.body.PJId;
        res.redirect(way);
      });
    });
  } else if (req.session.userInfo.userType == "mentor") {
    if (req.params.PJId == "DeleteReport1") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt1 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt1 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport2") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt2 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt2 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport3") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt3 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt3 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport4") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt4 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt4 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport5") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt5 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt5 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport6") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt6 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt6 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport7") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt7 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt7 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport8") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt8 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt8 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport9") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt9 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt9 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport10") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt10 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt10 +
          ", id: " +
          req.session.userId
      );
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

        logger.putLogDetail(req, "Mentoring Report Updated.");
        var way = "/pjmng/DGU511/" + req.body.PJId;
        res.redirect(way);
      });
    });
  }
};

exports.postMentoringReport3 = (req, res) => {
  logger.putLog(req);
  if (req.session.userInfo.userType == "student") {
    if (req.params.PJId == "DeleteReport1") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt1 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt1 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport2") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt2 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt2 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport3") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt3 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt3 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport4") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt4 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt4 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport5") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt5 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt5 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport6") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt6 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt6 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport7") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt6 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt7 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport8") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt7 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt8 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport9") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt8 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt9 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport10") {
      var query = "delete from mentoring_report";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt10 +
        "'";
      logger.putLogDetail(
        req,
        "Delete Mentoring Report: " +
          req.body.MTDt10 +
          ", id: " +
          req.session.userId
      );
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

        logger.putLogDetail(req, "Mentoring Report Deleted.");
        var way = "/pjmng/DGU511/" + req.body.PJId;
        res.redirect(way);
      });
    });
  } else if (req.session.userInfo.userType == "mentor") {
    if (req.params.PJId == "DeleteReport1") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt1 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt1 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport2") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt2 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt2 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport3") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt3 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt3 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport4") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt4 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt4 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport5") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt5 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt5 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport6") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt6 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt6 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport7") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt7 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt7 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport8") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt8 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt8 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport9") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt9 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt9 +
          ", id: " +
          req.session.userId
      );
    } else if (req.params.PJId == "DeleteReport10") {
      var query = "update mentoring_report";
      query += " set ment_report_mtr = null";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt10 +
        "'";
      logger.putLogDetail(
        req,
        "Update Mentoring Report: " +
          req.body.MTDt10 +
          ", id: " +
          req.session.userId
      );
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

        logger.putLogDetail(req, "Mentoring Report Updated.");
        var way = "/pjmng/DGU511/" + req.body.PJId;
        res.redirect(way);
      });
    });
  }
};

exports.postManagechk = (req, res) => {
  logger.putLog(req);
  if (req.params.PJId == "confirmchk1") {
    var query = "update mentoring_report";
    query += " set chk_yn = 1";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt1 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt1 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "confirmchk2") {
    var query = "update mentoring_report";
    query += " set chk_yn = 1";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt2 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt2 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "confirmchk3") {
    var query = "update mentoring_report";
    query += " set chk_yn = 1";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt3 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt3 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "confirmchk4") {
    var query = "update mentoring_report";
    query += " set chk_yn = 1";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt4 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt4 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "confirmchk5") {
    var query = "update mentoring_report";
    query += " set chk_yn = 1";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt5 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt5 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "confirmchk6") {
    var query = "update mentoring_report";
    query += " set chk_yn = 1";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt6 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt6 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "confirmchk7") {
    var query = "update mentoring_report";
    query += " set chk_yn = 1";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt6 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt7 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "confirmchk8") {
    var query = "update mentoring_report";
    query += " set chk_yn = 1";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt7 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt8 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "confirmchk9") {
    var query = "update mentoring_report";
    query += " set chk_yn = 1";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt8 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt9 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "confirmchk10") {
    var query = "update mentoring_report";
    query += " set chk_yn = 1";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt10 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt10 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "cancelchk1") {
    var query = "update mentoring_report";
    query += " set chk_yn = 0";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt1 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt1 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "cancelchk2") {
    var query = "update mentoring_report";
    query += " set chk_yn = 0";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt2 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt2 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "cancelchk3") {
    var query = "update mentoring_report";
    query += " set chk_yn = 0";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt3 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt3 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "cancelchk4") {
    var query = "update mentoring_report";
    query += " set chk_yn = 0";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt4 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt4 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "cancelchk5") {
    var query = "update mentoring_report";
    query += " set chk_yn = 0";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt5 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt5 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "cancelchk6") {
    var query = "update mentoring_report";
    query += " set chk_yn = 0";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt6 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt6 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "cancelchk7") {
    var query = "update mentoring_report";
    query += " set chk_yn = 0";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt6 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt7 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "cancelchk8") {
    var query = "update mentoring_report";
    query += " set chk_yn = 0";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt7 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt8 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "cancelchk9") {
    var query = "update mentoring_report";
    query += " set chk_yn = 0";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt8 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt9 + ", id: " + req.session.userId
    );
  } else if (req.params.PJId == "cancelchk10") {
    var query = "update mentoring_report";
    query += " set chk_yn = 0";
    query +=
      " where prj_id = '" +
      req.body.PJId +
      "' and meeting_date = '" +
      req.body.MTDt10 +
      "'";
    logger.putLogDetail(
      req,
      "Update Payment check: " + req.body.MTDt10 + ", id: " + req.session.userId
    );
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

      logger.putLogDetail(req, "Mentoring Report Deleted.");
      var way = "/pjmng/DGU511/" + req.body.PJId;
      res.redirect(way);
    });
  });
};

exports.postMentoringReport4 = (req, res) => {
  logger.putLog(req);
  var fileInfo = {
    path: "/ssmsdata/mentoringReport/",
    namePrefix: "MTR",
    viewNames: [
      "appendix1",
      "appendix2",
      "appendix3",
      "appendix4",
      "appendix5",
      "appendix6",
      "appendix7",
      "appendix8",
      "appendix9",
      "appendix10",
    ],
  };

  fileUpload(fileInfo).multipartForm(req, res, (err) => {
    if (err) {
      logger.putLogDetail(req, "file upload error : " + err);
      return;
    }
    if (!req.session.userId) {
      logger.putLogDetail(req, "do not have a session.");
      res.redirect("/");
      return;
    }

    var mentoring_report = {};

    if (req.params.PJId == "AddReport1") {
      var query =
        "update mentoring_report set ment_report_mtr = '" +
        req.files["appendix1"][0].path +
        "'";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt1 +
        "'";
      console.log(
        "Update Mentoring Report: " +
          req.files["appendix1"][0].path +
          ", id: " +
          req.session.userId
      );
      if (req.files["appendix1"] !== undefined) {
        mentoring_report.ment_report_mtr = req.files["appendix1"][0].path;
        console.log(
          "submit Mentoring Report: " +
            req.files["appendix1"][0].path +
            ", id: " +
            req.session.userId
        );
        console.log("file upload success.");
      }
    } else if (req.params.PJId == "AddReport2") {
      var query =
        "update mentoring_report set ment_report_mtr = '" +
        req.files["appendix2"][0].path +
        "'";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt2 +
        "'";
      console.log(
        "Update Mentoring Report: " +
          req.files["appendix2"][0].path +
          ", id: " +
          req.session.userId
      );
      if (req.files["appendix2"] !== undefined) {
        mentoring_report.ment_report_mtr = req.files["appendix2"][0].path;
        console.log(
          "submit Mentoring Report: " +
            req.files["appendix2"][0].path +
            ", id: " +
            req.session.userId
        );
        console.log("file upload success.");
      }
    } else if (req.params.PJId == "AddReport3") {
      var query =
        "update mentoring_report set ment_report_mtr = '" +
        req.files["appendix3"][0].path +
        "'";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt3 +
        "'";
      console.log(
        "Update Mentoring Report: " +
          req.files["appendix3"][0].path +
          ", id: " +
          req.session.userId
      );
      if (req.files["appendix3"] !== undefined) {
        mentoring_report.ment_report_mtr = req.files["appendix3"][0].path;
        console.log(
          "submit Mentoring Report: " +
            req.files["appendix3"][0].path +
            ", id: " +
            req.session.userId
        );
        console.log("file upload success.");
      }
    } else if (req.params.PJId == "AddReport4") {
      var query =
        "update mentoring_report set ment_report_mtr = '" +
        req.files["appendix4"][0].path +
        "'";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt4 +
        "'";
      console.log(
        "Update Mentoring Report: " +
          req.files["appendix4"][0].path +
          ", id: " +
          req.session.userId
      );
      if (req.files["appendix4"] !== undefined) {
        mentoring_report.ment_report_mtr = req.files["appendix4"][0].path;
        console.log(
          "submit Mentoring Report: " +
            req.files["appendix4"][0].path +
            ", id: " +
            req.session.userId
        );
        console.log("file upload success.");
      }
    } else if (req.params.PJId == "AddReport5") {
      var query =
        "update mentoring_report set ment_report_mtr = '" +
        req.files["appendix5"][0].path +
        "'";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt5 +
        "'";
      console.log(
        "Update Mentoring Report: " +
          req.files["appendix5"][0].path +
          ", id: " +
          req.session.userId
      );
      if (req.files["appendix5"] !== undefined) {
        mentoring_report.ment_report_mtr = req.files["appendix5"][0].path;
        console.log(
          "submit Mentoring Report: " +
            req.files["appendix5"][0].path +
            ", id: " +
            req.session.userId
        );
        console.log("file upload success.");
      }
    } else if (req.params.PJId == "AddReport6") {
      var query =
        "update mentoring_report set ment_report_mtr = '" +
        req.files["appendix6"][0].path +
        "'";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt6 +
        "'";
      console.log(
        "Update Mentoring Report: " +
          req.files["appendix6"][0].path +
          ", id: " +
          req.session.userId
      );
      if (req.files["appendix6"] !== undefined) {
        mentoring_report.ment_report_mtr = req.files["appendix6"][0].path;
        console.log(
          "submit Mentoring Report: " +
            req.files["appendix6"][0].path +
            ", id: " +
            req.session.userId
        );
        console.log("file upload success.");
      }
    } else if (req.params.PJId == "AddReport7") {
      var query =
        "update mentoring_report set ment_report_mtr = '" +
        req.files["appendix7"][0].path +
        "'";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt7 +
        "'";
      console.log(
        "Update Mentoring Report: " +
          req.files["appendix7"][0].path +
          ", id: " +
          req.session.userId
      );
      if (req.files["appendix7"] !== undefined) {
        mentoring_report.ment_report_mtr = req.files["appendix7"][0].path;
        console.log(
          "submit Mentoring Report: " +
            req.files["appendix7"][0].path +
            ", id: " +
            req.session.userId
        );
        console.log("file upload success.");
      }
    } else if (req.params.PJId == "AddReport8") {
      var query =
        "update mentoring_report set ment_report_mtr = '" +
        req.files["appendix8"][0].path +
        "'";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt8 +
        "'";
      console.log(
        "Update Mentoring Report: " +
          req.files["appendix8"][0].path +
          ", id: " +
          req.session.userId
      );
      if (req.files["appendix8"] !== undefined) {
        mentoring_report.ment_report_mtr = req.files["appendix8"][0].path;
        console.log(
          "submit Mentoring Report: " +
            req.files["appendix8"][0].path +
            ", id: " +
            req.session.userId
        );
        console.log("file upload success.");
      }
    } else if (req.params.PJId == "AddReport9") {
      var query =
        "update mentoring_report set ment_report_mtr = '" +
        req.files["appendix9"][0].path +
        "'";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt9 +
        "'";
      console.log(
        "Update Mentoring Report: " +
          req.files["appendix9"][0].path +
          ", id: " +
          req.session.userId
      );
      if (req.files["appendix9"] !== undefined) {
        mentoring_report.ment_report_mtr = req.files["appendix9"][0].path;
        console.log(
          "submit Mentoring Report: " +
            req.files["appendix9"][0].path +
            ", id: " +
            req.session.userId
        );
        console.log("file upload success.");
      }
    } else if (req.params.PJId == "AddReport10") {
      var query =
        "update mentoring_report set ment_report_mtr = '" +
        req.files["appendix10"][0].path +
        "'";
      query +=
        " where prj_id = '" +
        req.body.PJId +
        "' and meeting_date = '" +
        req.body.MTDt10 +
        "'";
      console.log(
        "Update Mentoring Report: " +
          req.files["appendix10"][0].path +
          ", id: " +
          req.session.userId
      );
      if (req.files["appendix10"] !== undefined) {
        mentoring_report.ment_report_mtr = req.files["appendix10"][0].path;
        console.log(
          "submit Mentoring Report: " +
            req.files["appendix10"][0].path +
            ", id: " +
            req.session.userId
        );
        console.log("file upload success.");
      }
    }

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if (err) {
        //throw err;
        console.error("getConnection err : " + err);
        return;
      }

      //use connection

      connection.query(query, mentoring_report, (error, results, fields) => {
        connection.release();

        if (error) {
          //throw error;
          console.error("query error : " + error);
          return;
        }
        logger.putLogDetail(req, "Mentors Mentoring Report Submitted.");
        var way = "/pjmng/DGU511/" + req.body.PJId;
        res.redirect(way);
      });
    });
  });
};

exports.postMentoringReport = (req, res) => {
  logger.putLog(req);
  var query = "select m.* from mentoring_report as m";
  query += " where m.prj_id = '" + req.params.PJId + "'; ";
  if (req.session.userInfo.userType == "student") {
    query += "select sti.*,t.* from std_team_info as sti, team as t";
    query +=
      " where sti.std_id = '" +
      req.session.userId +
      "'and t.prj_id = '" +
      req.params.PJId +
      "' and t.team_id = sti.team_id; ";
  } else {
    query += "select t.* from team as t";
    query += " where t.prj_id = '" + req.params.PJId + "'; ";
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

      logger.putLogDetail(req, "Register success.");
      var way = "/pjmng/DGU511/" + req.params.PJId;
      res.redirect(way);
    });
  });
};

//show Final Report Lists
exports.getFinalReport = (req, res) => {
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }
  var projectId = req.params.PJId;
  // 최종보고서
  var query = "select f.*,t.* from final_product as f, team as t";
  query +=
    " where f.prj_id = '" + projectId + "' and t.team_id = f.team_id; ";
  query += "select * from apdx_file_info where use_yn = 1;";
  query += "select * from agmt where use_yn = 1;";
  //수행계획서
  query +=
  " select prj_plan_report from project_plan_report where prj_id = '" +
  projectId +
  "';";
  // 멘토링보고서
  query += "select m.* from mentoring_report as m";
  query += " where m.prj_id = '" + projectId + "'";
  query += " order by m.sub_date;";

  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(query, (error, results, fields) => {
      connection.release();

      console.log(results);

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      res.render("pjmng/DGU521", {
        FinalLists: results,
        moment: moment,
        userInfo: req.session.userInfo,
      });
    });
  });
};
//post Files
exports.postFinalReport = (req, res) => {
  //get connection from pool
};
exports.deleteFinalLists = (req, res) => {};
exports.postFinalLists = (req, res) => {
  logger.putLog(req);

  var fileInfo = {
    path: "/ssmsdata/FinalProductFile/",
    namePrefix: "FINAL_",
    viewNames: [
      "FinalReportFile",
      "ProductFile",
      "VideoFile",
      "PatentFile",
      "ProgramFile",
      "ManualFile",
      "ThesisFile",
      "Other1File",
      "Other2File",
      "Other3File",
    ],
  };
  fileUpload(fileInfo).multipartForm(req, res, (err) => {
    if (err) {
      logger.putLogDetail(req, "file upload error : " + err);
      return;
    }
    if (!req.session.userId) {
      logger.putLogDetail(req, "do not have a session.");
      res.redirect("/");
      return;
    }

    var final_product = {};

    var query = "";

    if (req.params.formType == "PostReport") {
      query +=
        "update final_product set fin_report = '" +
        req.files["FinalReportFile"][0].path +
        "',";
      if (req.body.RegisterReportCheck == "true") {
        console.log(
          "submit Report: " +
            req.files["FinalReportFile"][0].path +
            ", id: " +
            req.session.userId
        );
        query += " fin_report_agrmnt = 1 ";
      } else {
        query += " fin_report_agrmnt = 0 ";
      }
      query += " where prj_id = '" + req.body.PJId + "'";
    } else if (req.params.formType == "DeleteReport") {
      query += "update final_product";
      query += " set fin_report = null and fin_report_agrmnt = null";
      query += " where prj_id = '" + req.body.PJId + "'";
    }
    if (req.params.formType == "PostProduct") {
      console.log(
        "submit Product: " +
          req.files["ProductFile"][0].path +
          ", id: " +
          req.session.userId
      );
      query +=
        "update final_product set product1 = '" +
        req.files["ProductFile"][0].path +
        "',";
      if (req.body.RegisterProductCheck == "true") {
        query += " product1_agrmnt = 1 ";
      } else {
        query += " product1_agrmnt = 0 ";
      }
      query += " where prj_id = '" + req.body.PJId + "'";
    } else if (req.params.formType == "DeleteProductFile") {
      query += "update final_product";
      query += " set product1 = null and product1_agrmnt = null";
      query += " where prj_id = '" + req.body.PJId + "'";
    }
    if (req.params.formType == "PostManual") {
      console.log(
        "submit Manual: " +
          req.files["ManualFile"][0].path +
          ", id: " +
          req.session.userId
      );
      query +=
        "update final_product set manual = '" +
        req.files["Manual"][0].path +
        "',";
      if (req.body.RegisterManualCheck == "true") {
        query += " manual_agrmt = 1 ";
      } else {
        query += " manual_agrmt = 0 ";
      }
      query += " where prj_id = '" + req.body.PJId + "'";
    } else if (req.params.formType == "DeleteManualFile") {
      query += "update final_product";
      query += " set manual = null and manual_agrmt = null";
      query += " where prj_id = '" + req.body.PJId + "'";
    }
    if (req.params.formType == "PostVideo") {
      console.log(
        "submit Video File: " +
          req.files["VideoFile"][0].path +
          ", id: " +
          req.session.userId
      );
      query +=
        "update final_product set demo_vid = '" +
        req.files["VideoFile"][0].path +
        "',";
      if (req.body.RegisterVideoCheck == "true") {
        query += " demo_vid_agrmnt = 1 ";
      } else {
        query += " demo_vid_agrmnt = 0 ";
      }
      query += " where prj_id = '" + req.body.PJId + "'";
    } else if (req.params.formType == "DeleteVideo") {
      query += "update final_product";
      query += " set demo_vid = null and demo_vid_agrmnt = null";
      query += " where prj_id = '" + req.body.PJId + "'";
    }
    if (req.params.formType == "PostPatent") {
      console.log(
        "submit Patent File: " +
          req.files["PatentFile"][0].path +
          ", id: " +
          req.session.userId
      );
      query +=
        "update final_product set patent_doc = '" +
        req.files["PatentFile"][0].path +
        "',";
      if (req.body.RegisterPatentCheck == "true") {
        query += " patent_agrmt = 1 ";
      } else {
        query += " patent_agrmt = 0 ";
      }
      query += " where prj_id = '" + req.body.PJId + "'";
    } else if (req.params.formType == "DeletePatent") {
      query += "update final_product";
      query += " set patent_doc = null and patent_agrmt = null";
      query += " where prj_id = '" + req.body.PJId + "'";
    }
    if (req.params.formType == "PostProgram") {
      console.log(
        "submit Program File: " +
          req.files["ProgramFile"][0].path +
          ", id: " +
          req.session.userId
      );
      query +=
        "update final_product set prg_regis = '" +
        req.files["ProgramFile"][0].path +
        "',";
      if (req.body.RegisterProgramCheck == "true") {
        query += " prg_regis_agrmt = 1 ";
      } else {
        query += " prg_regis_agrmt = 0 ";
      }
      query += " where prj_id = '" + req.body.PJId + "'";
    } else if (req.params.formType == "DeleteProgram") {
      query += "update final_product";
      query += " set prg_regis = null and prg_regis_agrmt = null";
      query += " where prj_id = '" + req.body.PJId + "'";
    }
    if (req.params.formType == "PostThesis") {
      console.log(
        "submit Thesis File: " +
          req.files["ThesisFile"][0].path +
          ", id: " +
          req.session.userId
      );
      query +=
        "update final_product set thesis_file = '" +
        req.files["ThesisFile"][0].path +
        "',";
      if (req.body.RegisterThesisCheck == "true") {
        query += " thesis_agrmt = 1 ";
      } else {
        query += " thesis_agrmt = 0 ";
      }
      query += " where prj_id = '" + req.body.PJId + "'";
    } else if (req.params.formType == "DeleteThesis") {
      query += "update final_product";
      query += " set thesis_file = null and thesis_agrmt = null";
      query += " where prj_id = '" + req.body.PJId + "'";
    }
    if (req.params.formType == "PostOther1") {
      console.log(
        "submit Other1 File: " +
          req.files["Other1File"][0].path +
          ", id: " +
          req.session.userId
      );
      query +=
        "update final_product set other1 = '" +
        req.files["Other1File"][0].path +
        "',";
      if (req.body.RegisterOther1Check == "true") {
        query += " other1_agrmt = 1 ";
      } else {
        query += " other1_agrmt = 0 ";
      }
      query += " where prj_id = '" + req.body.PJId + "'";
    } else if (req.params.formType == "DeleteOther1") {
      query += "update final_product";
      query += " set other1 = null and other1_agrmt = null";
      query += " where prj_id = '" + req.body.PJId + "'";
    }
    if (req.params.formType == "PostOther2") {
      console.log(
        "submit Other2 File: " +
          req.files["Other2File"][0].path +
          ", id: " +
          req.session.userId
      );
      query +=
        "update final_product set other2 = '" +
        req.files["Other2File"][0].path +
        "',";
      if (req.body.RegisterOther2Check == "true") {
        query += " other2_agrmt = 1 ";
      } else {
        query += " other2_agrmt = 0 ";
      }
      query += " where prj_id = '" + req.body.PJId + "'";
    } else if (req.params.formType == "DeleteOther2") {
      query += "update final_product";
      query += " set other2 = null and other2_agrmt = null";
      query += " where prj_id = '" + req.body.PJId + "'";
    }
    if (req.params.formType == "PostOther3") {
      console.log(
        "submit Other3 File: " +
          req.files["Other3File"][0].path +
          ", id: " +
          req.session.userId
      );
      query +=
        "update final_product set other3 = '" +
        req.files["Other3File"][0].path +
        "',";
      if (req.body.RegisterOther3Check == "true") {
        query += " other3_agrmt = 1 ";
      } else {
        query += " other3_agrmt = 0 ";
      }
      query += " where prj_id = '" + req.body.PJId + "'";
    } else if (req.params.formType == "DeleteOther3") {
      query += "update final_product";
      query += " set other3 = null and other3_agrmt = null";
      query += " where prj_id = '" + req.body.PJId + "'";
    }

    if (req.files["FinalReportFile"] !== undefined) {
      final_product.fin_report = req.files["FinalReportFile"][0].path;
      console.log("file upload success.");
    }
    if (req.files["ProductFile"] !== undefined) {
      final_product.product1 = req.files["ProductFile"][0].path;
      console.log("file upload success.");
    }
    if (req.files["VideoFile"] !== undefined) {
      final_product.demo_vid = req.files["VideoFile"][0].path;
      console.log("file upload success.");
    }
    if (req.files["PatentFile"] !== undefined) {
      final_product.patent_doc = req.files["PatentFile"][0].path;
      console.log("file upload success.");
    }
    if (req.files["ProgramFile"] !== undefined) {
      final_product.prg_regis = req.files["ProgramFile"][0].path;
      console.log("file upload success.");
    }
    if (req.files["ManualFile"] !== undefined) {
      final_product.manual = req.files["ManualFile"][0].path;
      console.log("file upload success.");
    }
    if (req.files["ThesisFile"] !== undefined) {
      final_product.thesis_file = req.files["ThesisFile"][0].path;
      console.log("file upload success.");
    }
    if (req.files["Other1File"] !== undefined) {
      final_product.other1 = req.files["Other1File"][0].path;
      console.log("file upload success.");
    }
    if (req.files["Other2File"] !== undefined) {
      final_product.other2 = req.files["Other2File"][0].path;
      console.log("file upload success.");
    }
    if (req.files["Other3File"] !== undefined) {
      final_product.other3 = req.files["Other3File"][0].path;
      console.log("file upload success.");
    }
    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if (err) {
        //throw err;
        console.error("getConnection err : " + err);
        return;
      }

      //use connection
      connection.query(query, final_product, (error, results, fields) => {
        connection.release();

        if (error) {
          //throw error;
          console.error("query error : " + error);
          return;
        }

        logger.putLogDetail(req, "Register success.");
        var way = "/pjmng/DGU521/page/" + req.body.PJId;
        res.redirect(way);
      });
    });
  });
};

exports.getMentoringReport2 = (req, res) => {
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

    var query = "select * from team";
    query += " where prj_id = '" + req.params.PJId + "' ;";
    query += "select mtr_report_apdx from apdx_file_info where use_yn = 1;";

    // console.log(query);

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      if (results.length > 0) {
        logger.putLogDetail(req, "Mentoring Report submission page");
        res.render("pjmng/DGU513", {
          TeamInfo: results,
          moment: moment,
          userInfo: req.session.userInfo,
        });
      } else {
        res.redirect("/");
      }
    });
  });
};

exports.postMentoringReport2 = (req, res) => {
  logger.putLog(req);

  var fileInfo = {
    // path: 'public/mentoringReport/',
    path: "/ssmsdata/mentoringReport/",
    namePrefix: "MTR",
    viewNames: ["appendix"],
  };

  fileUpload(fileInfo).multipartForm(req, res, (err) => {
    if (err) {
      console.log("file upload error : " + err);
      return;
    }
    if (!req.session.userId) {
      console.log("do not have a session.");
      res.redirect("/");
      return;
    }

    var postings = {
      meeting_date: req.body.meetingdate,
      prj_id: req.body.PJId,
      mentor_id: req.body.MENTORId,
      team_id: req.body.TEAMId,
      leader_id: req.session.userId,
      sub_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
      amender: req.session.userId,
      amend_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
      registrant: req.session.userId,
      regis_date: moment(Date()).format("YYYY-MM-DD hh:mm:ss"),
    };

    if (req.files["appendix"] !== undefined) {
      postings.ment_report_std = req.files["appendix"][0].path;
      console.log(
        "submit Mentoring Report: " +
          req.files["appendix"][0].path +
          ", id: " +
          req.session.userId
      );
      console.log("file upload success.");
    }
    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if (err) {
        //throw err;
        console.error("getConnection err : " + err);
        return;
      }

      //use connection
      var query = "insert into mentoring_report ";
      query += " set ?";

      connection.query(query, postings, (error, results, fields) => {
        connection.release();

        if (error) {
          //throw error;
          console.error("query error : " + error);
          return;
        }
        logger.putLogDetail(req, "Mentoring Report Submitted.");
        var way = "/pjmng/DGU511/" + req.body.PJId;
        res.redirect(way);
      });
    });
  });
};

exports.showClassPage = (req, res) => {
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
    var query =
      "select s.settings_id, s.prj_year, s.prj_semes, s.term_chk, c.class_num, c.class_name, i.major, i.inst_name ";
    query += " from class_info as c, instructor as i, admin_settings as s ";
    query +=
      "where c.inst_id = i.inst_id and c.settings_id = s.settings_id and c.inst_id = '" +
      req.session.userId +
      "'";
    query +=
      " and (prj_year = DATE_FORMAT(now(), '%Y') or (prj_year = DATE_FORMAT(now(), '%Y')-1 and prj_semes = \"2학기\" and term_chk like \"%장%\")) ; ";

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      res.render("pjmng/DGU500", {
        ClassList: results,
        userId: req.session.userId,
        userType: req.session.userType,
        userInfo: req.session.userInfo,
        moment: moment,
      });
    });
  });
};
