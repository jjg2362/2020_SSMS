//index controller

//use moment
var moment = require("moment");

//use mysql
var mysqlPool = require("../middlewares/mysqlPool.js");
var logger = require("../middlewares/logger.js");

exports.showIndexPage = (req, res) => {
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    } else {
      logger.putLog(req);
    }

    //use connection
    var query = "select posting_id, posting_title, post_date from msgbrd_info ";
    query += "order by post_date desc limit 7;";

    query +=
      "select p.prj_id, IFNULL(pc1.pj1,0) as pc1, IFNULL(pc2.pj2,0) as pc2, IFNULL(pc3.pj3,0) as pc3, ";
    query +=
      "p.prj_name, p.prj_content, ads.cls_date, ads.strt_date, p.keyword1, p.keyword2, p.keyword3, p.recommended_Prof, m.mentor_name, m.company_name,team_pj.team_name as team_id,";
    query +=
      'p.settings_id, CONCAT(ads.prj_year," ",ads.prj_semes," ", ads.term_chk)as term_chk from project as p ';
    query +=
      "left outer join admin_settings as ads on p.settings_id = ads.settings_id ";
    query +=
      "left outer join mentor as m on p.mentor_id = m.mentor_id and p.use_yn=1 ";
    query +=
      "left outer join (select p1.prj_id as prj_id, count(project1) as pj1 from project as p1, project_cart as pjcart ";
    query +=
      "where p1.prj_id = pjcart.project1 group by p1.prj_id) as pc1 on p.prj_id = pc1.prj_id ";
    query +=
      "left outer join (select p2.prj_id as prj_id, count(project2) as pj2 from project as p2, project_cart as pjcart2 ";
    query +=
      "where p2.prj_id = pjcart2.project2 group by p2.prj_id) as pc2 on p.prj_id = pc2.prj_id ";
    query +=
      "left outer join (select p3.prj_id as prj_id, count(project3) as pj3 from project as p3, project_cart as pjcart3 ";
    query +=
      "where p3.prj_id = pjcart3.project3 group by p3.prj_id) as pc3 on p.prj_id = pc3.prj_id ";
    query +=
      "left outer join (select t.team_name,t.prj_id from team as t) as team_pj on team_pj.prj_id = p.prj_id where p.use_yn=1 group by p.prj_id order by ads.prj_year, ads.prj_semes, ads.term_chk; ";

    query += "select * from main_notice; ";
    query +=
      "SELECT ads.term_chk, ads.prj_year, ads.prj_semes, COUNT(ads.settings_id) as count from admin_settings as ads LEFT OUTER JOIN project on ads.settings_id=project.settings_id WHERE project.use_yn=1 GROUP BY ads.settings_id;";
    // s.prj_year = '" + moment(Date()).format("YYYY") + "' "

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }
      // console.log('main page loaded');
      //use results and fields
      // console.log('PJList has been loaded.');

      res.render("index", {
        NoticePost: results[0],
        ProjectList: results[1],
        NoticePJImgList: results[2],
        ProjectCounter: results[3],
        userInfo: req.session.userInfo,
        moment: moment,
        curDate: new Date()
      });
    });
  });
};
