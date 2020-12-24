// apply project Controller

//use moment
var moment = require('moment');
var mysqlPool = require('../../middlewares/mysqlPool.js');
var logger = require('../../middlewares/logger.js')

var query_where ="";
var flag = false;

// exports.getTeamList = (req, res) => {
//   //session check
//   if(!req.session.userId) {
//     console.log('do not have a session.');
//     res.redirect('/');
//     return;
//   }
//   //get connection from pool
//   mysqlPool.pool.getConnection((err, connection) => {
//     if(err) { //throw err;
//       console.error('getConnection err : ' + err);
//       return;
//     }
//     //use connection
//
//     var query = " select s.prj_aply_cls_date, p.* from project as p , admin_settings as s where p.settings_id = s.settings_id ";
//     query += " order by prj_id desc; " ;
//
//     query += "select c.code_nm from code as c , code_category as cc "
//     query += " where cc.code_id='prj_dev_field' and cc.code_id=c.code_id order by c.code_value ; ";
//
//     query += "select  tinfo.leader_id , t.team_name , t.team_id ";
//     query += "from std_team_info as tinfo, team as t ";
//     query += "where tinfo.std_id = '"+req.session.userId+"' and tinfo.leader_id = '"+req.session.userId+"' and t.team_id = tinfo.team_id and tinfo.use_yn = '1' ;";
//
//     connection.query(query, null, (error, results, fields) => {
//       connection.release();
//
//       console.log(results[2]);
//
//       if(error) { //throw error;
//         console.error('query error : ' + error);
//         return;
//       }
//       // if(results[2].length>1){
//       //   res.render('pjapply/DGU400', {PJCodeList: results, userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
//       //
//       // }else{
//       //     res.render('pjapply/DGU401', {PJCodeList: results,userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
//       // }
//       res.render('pjapply/DGU401', {PJCodeList: results,userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
//       //use results and fields
//
//     });
//   });
// };


exports.getSearchproject = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }
    //use connection

    var query = "select p.prj_id, IFNULL(pc1.pj1,0) as pc1, IFNULL(pc2.pj2,0) as pc2, IFNULL(pc3.pj3,0) as pc3, "
    query += "p.prj_name, p.prj_content, p.cls_date, p.start_date, p.keyword1, p.keyword2, p.keyword3, p.prj_dev_field, m.mentor_name, m.company_name,team_pj.team_name as team_id,"
    query += "p.settings_id, CONCAT(ads.prj_year,\" \",ads.prj_semes,\" \", ads.term_chk)as term_chk from project as p "
    query += "left outer join admin_settings as ads on p.settings_id = ads.settings_id "
    query += "left outer join mentor as m on p.mentor_id = m.mentor_id and p.use_yn=1 "
    query += "left outer join (select p1.prj_id as prj_id, count(project1) as pj1 from project as p1, project_cart as pjcart "
    query += "where p1.prj_id = pjcart.project1 group by p1.prj_id) as pc1 on p.prj_id = pc1.prj_id "
    query += "left outer join (select p2.prj_id as prj_id, count(project2) as pj2 from project as p2, project_cart as pjcart2 "
    query += "where p2.prj_id = pjcart2.project2 group by p2.prj_id) as pc2 on p.prj_id = pc2.prj_id "
    query += "left outer join (select p3.prj_id as prj_id, count(project3) as pj3 from project as p3, project_cart as pjcart3 "
    query += "where p3.prj_id = pjcart3.project3 group by p3.prj_id) as pc3 on p.prj_id = pc3.prj_id "
    query +="left outer join (select t.team_name,t.prj_id from team as t) as team_pj on team_pj.prj_id = p.prj_id where p.use_yn=1 group by p.prj_id order by p.prj_id DESC;"

    // var query = "select prj_id, prj_name, prj_dev_field, keyword1, keyword2, keyword3 from project  where use_yn=1 ";
    // if(flag){
    //   query += query_where;
    // }
    // query += " order by prj_id desc; " ;

    // var query = "select p.prj_id, p.prj_name, p.prj_dev_field, p.keyword1, p.keyword2, p.keyword3";
    // query += " from project as p, team as t";
    // query += " where p.use_yn=1 and p.prj_id=t.prj_id ; ";

    query += "select c.code_nm from code as c , code_category as cc "
    query += " where cc.code_id='prj_dev_field' and cc.code_id=c.code_id order by c.code_value ; ";

    flag = false;

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      res.render('pjapply/DGU401', {PJCodeList: results, userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
    });
  });
};

//show register page
exports.getDetailPj = (req, res) => {
    //session check
    if(!req.session.userId) {
      console.log('do not have a session.');
      res.redirect('/');
      return;
    }else{
        logger.putLog(req);
    }

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if(err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      //use connection
      var query = "select  s.prj_aply_cls_date, p.* from project as p , admin_settings as s where prj_id = '"+req.params.pjId+"' and  p.settings_id = s.settings_id; ";

      query += "select m.* from mentor as m , project as p where p.mentor_id = m.mentor_id and p.prj_id ='"+req.params.pjId+"';";

      query += "select tinfo.std_id, tinfo.class_type, tinfo.leader_id, t.team_name, pc.team_id, pc.project1, pc.project2, pc.project3 ";
      query += "from project_cart as pc , std_team_info as tinfo, team as t ";
      query += "where tinfo.std_id = '"+req.session.userId+"' and tinfo.leader_id = '"+req.session.userId+"' ";
      query += "and tinfo.team_id = pc.team_id and tinfo.team_id=t.team_id and tinfo.team_yn='1' and  tinfo.use_yn = '1' and t.prj_id is NULL ;";

      query += "select t.team_name, t.team_id,  tinfo.std_id, tinfo.leader_id, tinfo.std_resume ";
      query += "from std_team_info as tinfo, team as t ";
      query += "where tinfo.leader_id = '"+req.session.userId+"' ";
      query += "and tinfo.team_id=t.team_id and tinfo.team_yn='1' and  tinfo.use_yn = '1' ; " ;
      connection.query(query, (error, results, fields) => {

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }

        logger.putLogDetail(req,'lookup project detail success.');

        if(results[2].length == 0){
          res.render('pjapply/DGU402_0', {PjMentorInfo: results, userId: req.session.userId, moment : moment,userInfo: req.session.userInfo,curDate: new Date()});
        }else if(results[2].length == 1){
          res.render('pjapply/DGU402_1', {PjMentorInfo: results, userId: req.session.userId, moment : moment,userInfo: req.session.userInfo ,curDate: new Date()});
        }else if(results[2].length == 2){
          res.render('pjapply/DGU402_2', {PjMentorInfo: results, userId: req.session.userId, moment : moment,userInfo: req.session.userInfo ,curDate: new Date()});
        }else if(results[2].length == 3){
          res.render('pjapply/DGU402_3', {PjMentorInfo: results, userId: req.session.userId, moment : moment,userInfo: req.session.userInfo ,curDate: new Date()});
        }else{
          res.redirect('/');
        }


        // //use results and fields
        // if(results[2].length > 0) {
        //   console.log("=============project detail page ==================");
        //   console.log('lookup project detail success.');
        //   res.render('pjapply/DGU402', {PjMentorInfo: results,userId: req.session.userId, moment : moment,userInfo: req.session.userInfo});
        // }
        // else {
        //   var query2 = "select * from project where prj_id = '"+req.params.pjId+"'; ";
        //   query2 += "select m.* from mentor as m , project as p where p.mentor_id = m.mentor_id and p.prj_id ='"+req.params.pjId+"';";
        //
        //   connection.query(query2, (error2, results2, fields2) => {
        //
        //     if(error2) { //throw error;
        //       console.error('query error : ' + error2);
        //       return;
        //     }
        //     if (results2.length > 0){
        //       console.log("=============project detail page ==================");
        //       console.log('lookup project detail success.');
        //       res.render('pjapply/DGU402', {PjMentorInfo: results2,userId: req.session.userId, moment : moment,userInfo: req.session.userInfo});
        //     }else{
        //       res.redirect('/');
        //     }
        //   });
        // }
        connection.release();
      });
    });
};

exports.getCancelProject = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    //use connection
    var query = "select p.*, m.* from project as p, mentor as m";
    query += " where p.prj_id = '" + req.params.pjId + "' and p.mentor_id = m.mentor_id ;";

    query += "select tinfo.std_id, tinfo.team_id, tinfo.leader_id, pc.project1, pc.project2, pc.project3  "
    query +=" from std_team_info as tinfo, project_cart as pc , team as t ";
    query += "where tinfo.std_id= '"+req.session.userId+ "' and tinfo.team_id = '"+req.params.TeamID+"' and tinfo.team_id = t.team_id and tinfo.team_id = pc.team_id; ";

    query +="select s.prj_aply_cls_date from admin_settings as s, project as p ";
    query +="where p.prj_id= '"+req.params.pjId+ "' and p.settings_id = s.settings_id; ";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      if(results.length > 0) {
        res.render('pjapply/DGU412', {PjPcInfo: results,userId: req.session.userId, moment:moment, userInfo: req.session.userInfo ,curDate: new Date()});
      } else {
        res.redirect('/');
      }
    });
  });

};


exports.postSearchproject = (req, res) => {
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }

    query_where = " ";
    var cnt = 0;

    if (req.body.selectDevelopment != "0"){
      if(req.body.selectDevelopment == "기타"){
        if (cnt!=0){  query_where += " AND prj_dev_field not in (select code_nm from code where code_id = \"prj_dev_field\" )" ;}
        else {query_where += " AND prj_dev_field not in (select code_nm from code where code_id = \"prj_dev_field\" )" ;}
      }else{
        if (cnt!=0){  query_where += " AND prj_dev_field = '" + req.body.selectDevelopment +"'" ;}
        else {query_where += " AND prj_dev_field = '" + req.body.selectDevelopment+"'" ;}
      }

      cnt ++ ;
    }

    if (req.body.SearchContent !=''){
      if (cnt!=0){
        query_where += " AND  ((prj_name LIKE '%" + req.body.SearchContent + "%') or (keyword1 LIKE '%"+ req.body.SearchContent + "%') ";
        query_where += " or (keyword2 LIKE '%"+ req.body.SearchContent + "%') or (keyword3 LIKE '%"+ req.body.SearchContent + "%'))  ";
      }
      else {
        query_where += " AND ((prj_name LIKE '%" + req.body.SearchContent + "%') or (keyword1 LIKE '%"+ req.body.SearchContent + "%') ";
        query_where += " or (keyword2 LIKE '%"+ req.body.SearchContent + "%') or (keyword3 LIKE '%"+ req.body.SearchContent + "%'))  ";
      }
      cnt ++ ;
    }

    flag = true;

    res.redirect('/pjapply/DGU401');

  };

exports.postProjectCart = (req, res) => {
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }
      var query = "";
      query += "update project_cart set ";
      // var _inputChoice = "req.body.inputChoice"+req.body.TeamID ;
      // // var Choice = req.body.+_inputChoice;
      // console.log(_inputChoice);

      if (req.body.input_Choice =="1"){
        query+= "project1 = '" +req.body.projectID+"' " ;
      }else if (req.body.input_Choice =="2"){
        query+= "project2 = '" +req.body.projectID+"' " ;
      } else if (req.body.input_Choice =="3"){
        query+= "project3 = '" +req.body.projectID+"' " ;
      }
      query += ", amend_date ='" +moment(Date()).format('YYYY-MM-DD hh:mm:ss')+ "', amender = '" +req.session.userId+"' ";
      query +=  " where team_id = '" + req.body.TeamID +"'; ";

      //get connection from pool
      mysqlPool.pool.getConnection((err, connection) => {
        if(err) { //throw err;
          console.error('getConnection err : ' + err);
          return;
        }
        connection.query(query, null, (error, results, fields) => {
          connection.release();

          if(error) { //throw error;
            console.error('query error : ' + error);
            return;
          }

          logger.putLogDetail(req,'Project_cart Register success.');
          res.redirect('DGU411');

        });
      });
    };

exports.getProjectCart = (req, res) => {
    //session check
    if(!req.session.userId) {
      console.log('do not have a session.');
      res.redirect('/');
      return;
    }else{
        logger.putLog(req);
    }

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if(err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }
      //use connection

      var query = "select p.prj_id, p.prj_name,p.prj_dev_field, p.keyword1, p.keyword2, p.keyword3 from project as p where p.use_yn='1'; ";
      query += "select t.team_id, t.team_name , tinfo.leader_id , pc.project1,pc.project2, pc.project3 ";
      query += "from project_cart as pc, std_team_info as tinfo ,team as t ";
      query += "where tinfo.std_id = '"+req.session.userId+"' and tinfo.team_id = pc.team_id and tinfo.team_id=t.team_id and tinfo.use_yn ='1' ; ";

      connection.query(query, null, (error, results, fields) => {
        connection.release();

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }
        //use results and fields

        logger.putLogDetail(req,'project_Cart success.');
        res.render('pjapply/DGU411', {TeamPJList: results, userId: req.session.userId, userType: req.session.userType, userInfo: req.session.userInfo,moment: moment, curDate: new Date()});
      });
    });
  };


exports.postCancelProjectCart = (req, res) => {
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }
    var query = "";
    query += "update project_cart set ";

    if (req.body.projectID ==req.body.project1){
      query+= "project1 = null, " ;
    }else if (req.body.projectID ==req.body.project2){
      query+= "project2 = null, " ;
    } else if (req.body.projectID ==req.body.project3){
      query+= "project3 = null, " ;
    }
    query += " amend_date ='" +moment(Date()).format('YYYY-MM-DD hh:mm:ss')+ "', amender = '" +req.session.userId+"' ";
    query +=  " where team_id = '" + req.body.teamID +"' ;";

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if(err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      connection.query(query, null, (error, results, fields) => {
        connection.release();

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }

        logger.putLogDetail(req,'Project_cart Cancel success.');
        res.redirect('DGU411');

      });
    });
  };
