
//use mysqlPool
var mysqlPool = require('../../middlewares/mysqlPool.js');
var express = require('express');
var app = express().use('/public', express.static('public'));
var moment = require('moment');

//use multer
var fileUpload = require('../../middlewares/fileUpload.js');
var logger = require('../../middlewares/logger.js')

//show project make page
exports.getParm = (req, res) => {
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
    var query = "select c.code_nm from code as c , code_category as cc "
    query += " where cc.code_id='prj_dev_field' and cc.code_id=c.code_id order by c.code_value ; ";

    query +="select i.* from instructor as i; ";


    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      res.render('parm/PARM101', {CodeTermList: results, userId: req.session.userId, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
    });
  });
};

exports.postParm = (req, res) => {
  logger.putLog(req);

  var prjName = "";

  var project = {
    parm_name: prjName + req.body.parmname,
    parm_outline: req.body.parmoutline,
    parm_bckgrd: req.body.parmbckgrd,
    parm_ncst: req.body.parmncst,
    parm_expeff: req.body.parmexpeff,
    parm_cate: req.body.keyword1,
    parm_cate2: req.body.keyword2,
    parm_cate3: req.body.keyword3,
    parm_prof : req.body.instructor,
    parm_dev : req.body.development,
    regis_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
    registrant : req.session.userId,
    amend_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
    amender : req.session.userId
  }

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    //use connection
    var query = "insert into parm";
    query += " set ?";

    connection.query(query, project, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
        logger.putLogDetail(req,'Register success.');
      res.redirect('PARM102');

    });
  });
};

exports.getSearchparm = (req, res) => {
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

    var query = "select parm_id, parm_name, parm_prof, parm_cate, parm_cate2, parm_cate3 from parm";
    query += " order by parm_id desc; " ;

    query += "select c.code_nm from code as c , code_category as cc ";
    query += " where cc.code_id='prj_dev_field' and cc.code_id=c.code_id order by c.code_value ; ";

    flag = false;

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      res.render('parm/PARM102', {PJCodeList: results, userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
    });
  });
};

exports.postSearchparm = (req, res) => {
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }

  query_where = " ";
  var cnt = 0;

  if (req.body.development != "0"){
    if(req.body.development == "기타"){
      if (cnt!=0){  query_where += " AND parm_dev not in (select code_nm from code where code_id = "+req.body.developmen+" )" ;}
      else {query_where += " AND parm_dev not in (select code_nm from code where code_id = "+req.body.developmen+" )" ;}
    }else{
      if (cnt!=0){  query_where += " AND parm_dev = '" + req.body.development +"'" ;}
      else {query_where += " AND parm_dev = '" + req.body.development+"'" ;}
    }

    cnt ++ ;
  }

  if (req.body.SearchContent !=''){
    if (cnt!=0){
      query_where += " AND  ((parm_name LIKE '%" + req.body.SearchContent + "%') or (parm_cate LIKE '%"+ req.body.SearchContent + "%') ";
      query_where += " or (parm_cate2 LIKE '%"+ req.body.SearchContent + "%') or (parm_cate3 LIKE '%"+ req.body.SearchContent + "%'))  ";
    }
    else {
      query_where += " AND ((parm_name LIKE '%" + req.body.SearchContent + "%') or (parm_cate LIKE '%"+ req.body.SearchContent + "%') ";
      query_where += " or (parm_cate2 LIKE '%"+ req.body.SearchContent + "%') or (parm_cate3 LIKE '%"+ req.body.SearchContent + "%'))  ";
    }
    cnt ++ ;
  }

  flag = true;

  res.redirect('/parm/PARM102');

};


exports.getEditParm = (req, res) => {

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

    var query = "select p.parm_id, p.parm_name, p.parm_dev, p.parm_prof, p.parm_asst, p.parm_outline, p.parm_bckgrd, p.parm_ncst, p.parm_expeff, p.parm_cate, p.parm_cate2, p.parm_cate3 from parm as p";
    query += " where p.parm_id = " + req.params.parm_id + "; ";

    query += "select c.code_nm from code as c , code_category as cc ";
    query += " where cc.code_id='prj_dev_field' and cc.code_id=c.code_id order by c.code_value ; ";

    query += "select i.inst_id, i.inst_name, i.major from instructor as i order by major desc ; ";

    query += "select assis_id, assis_name from assistant ;";

    query += "select sub_user_id from parm_auth where parm_id = '" + req.params.parm_id +"';";


    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      // console.log(results[0]);

      //use results and fields
      if(results.length > 0) {
        console.log('lookup project success.');
        console.log(results[4]);
        res.render('parm/SetPARM', {ClassInfo: results, moment : moment, userInfo: req.session.userInfo, ClassInformation: results[0], ClassSubUserIdList: results[4]});
      } else {
        res.redirect('/');
      }
    });
  });
};

exports.postEditParm = (req, res) => {

  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }
  var prjName = "";
  var parm_id = req.body.origin_id;

  var project = {
    parm_name: prjName + req.body.class_name,
    parm_outline: req.body.outline,
    parm_bckgrd: req.body.bckgrd,
    parm_ncst: req.body.ncst,
    parm_expeff: req.body.expeff,
    parm_cate: req.body.key_1,
    parm_cate2: req.body.key_2,
    parm_cate3: req.body.key_3,
    parm_prof : req.body.inst_id,
    parm_asst: req.body.assis_id,
    parm_dev : req.body.Settings_id,
    amend_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
    amender : req.session.userId
  };

  console.log(req.body.origin_id);

  var subUserId = req.body.sub_user_id;
  if (typeof subUserId === "string") subUserId = [subUserId];
  else if (typeof subUserId === "undefined") subUserId = [];
  var records = [];
  var arr = [parm_id, "", moment(Date()).format('YYYY-MM-DD hh:mm:ss'), req.session.userInfo.userId];
  for (i = 0; i < subUserId.length; i++) {
    const clone = arr.slice(0);
    clone[1] = subUserId[i];
    records.push(clone)
  }

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    var query = "insert into parm_auth (parm_id, sub_user_id, regis_date, registrant) values ?";
    if (records.length > 0) {
      connection.query(query, [records], (error, results) => {

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }

        //use results and fields
        console.log('subUser insert success.');

      });
    }

    //use connection
    query = "update parm set ? ";
    query += " where parm_id = '" + parm_id + "'; " ;

    console.log(query);

    connection.query(query, project, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      console.log('Admin Edit Class success.');
      res.redirect('DetailParm/'+ parm_id);

    });
  });
};

//all user info -> DGU131
exports.getUserInfo = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  } else if(req.session.userType != "admin") {
    console.log('do not match admin type.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }

  //use connection
  var query = "select ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락' , ps.parm_id as '팜'  from parm_std as ps where ps.perm_yn = 1 and ps.parm_id ="+req.query.parm_id+" order by ps.std_id ;";
  query += "select pt.team_id as '팀번호', pt.team_name as '팀명', ps.std_name as '이름', pt.std_id as '학번' from parm_team as pt left outer join parm_std as ps on pt.std_id = ps.std_id where pt.parm_id ="+req.query.parm_id+" order by pt.team_id ;";
  query += "select pm.mat_id as '자료 번호', pm.mat_name as '자료 이름', pm.mat_recom as '추천인', pm.mat_first as '등록인', pm.mat_cat as '분야1', pm.mat_cat2 as '분야2', pm.mat_cat3 as '분야3' from parm_mat as pm where pm.parm_id ="+req.query.parm_id+" order by pm.mat_id ;";
  query += "select ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락', ps.parm_id as '팜' from parm_std as ps where ps.perm_yn = 0 and ps.parm_id ="+req.query.parm_id+" order by ps.std_id ;";

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      console.log('lookup all user.');
      res.render('parm/PARMMAIN', {allUserInfos: results, allUserInfosFields: fields, userInfo: req.session.userInfo, parm_id: req.query.parm_id, moment: moment, curDate: new Date()});
    });
  });
};

exports.deleteSubUser = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }

  // console.log(req.body);
  var query = "delete from parm_auth where parm_id = '" + req.body.parm_id + "' and sub_user_id = '" + req.body.sub_user_id + "'";

  mysqlPool.pool.getConnection((err, connection) => {
    if (err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      res.send("success");

    });
  });



};

exports.detailParm = (req, res) => {

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

    var query = "select p.parm_id, p.parm_name, p.parm_dev, p.parm_prof, p.parm_asst, p.parm_outline, p.parm_bckgrd, p.parm_ncst, p.parm_expeff, p.parm_cate, p.parm_cate2, p.parm_cate3 from parm as p";
    query += " where p.parm_id = " + req.params.parm_id + "; ";

    query += "(select sub_user_id from parm_auth where parm_id = '" + req.params.parm_id +"') UNION (select p.parm_prof from parm as p where p.parm_id= '" + req.params.parm_id +"');";


    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      // console.log(results[0]);

      //use results and fields
      if(results.length > 0) {
        console.log('lookup project success.');
        console.log(results[4]);
        res.render('parm/DetailParm', {ClassInfo: results, moment : moment, userInfo: req.session.userInfo, ClassInformation: results[0], ClassSubUserIdList: results[4]});
      } else {
        res.redirect('/');
      }
    });
  });
};



exports.joinUser = (req, res) => {
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

    var query = "select parm_id, parm_name, parm_prof, parm_cate, parm_cate2, parm_cate3 from parm order by parm_id desc; " ;


    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      res.render('parm/JoinParm', {PJCodeList: results, userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
    });
  });
};


exports.joinMem = (req, res) => {
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

    var query = "insert into parm_std (select "+req.params.parm_id+" as parm_id, s.std_id, s.std_name, s.major, s.std_grade, s.phone_num, s.email_ad, false as perm_yn from student as s where s.std_id='"+req.params.std_id+"');" ;


    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      res.render('parm/JoinParm', {PJCodeList: results, userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
    });
  });
};


exports.addUser = (req, res) => {
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

    var query = "update parm_std set perm_yn = 1 where std_id = '"+req.params.std_id+"' and parm_id = "+req.params.parm_id+"; " ;
    query += "select ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락' , ps.parm_id as '팜'  from parm_std as ps where ps.perm_yn = 1 and ps.parm_id ="+req.params.parm_id+" order by ps.std_id ;";
    query += "select pt.team_id as '팀번호', pt.team_name as '팀명', ps.std_name as '이름', pt.std_id as '학번' from parm_team as pt left outer join parm_std as ps on pt.std_id = ps.std_id where pt.parm_id ="+req.params.parm_id+" order by pt.team_id ;";
    query += "select pm.mat_id as '자료 번호', pm.mat_name as '자료 이름', pm.mat_recom as '추천인', pm.mat_first as '등록인', pm.mat_cat as '분야1', pm.mat_cat2 as '분야2', pm.mat_cat3 as '분야3' from parm_mat as pm where pm.parm_id ="+req.params.parm_id+" order by pm.mat_id ;";
    query += "select ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락', ps.parm_id as '팜' from parm_std as ps where ps.perm_yn = 0 and ps.parm_id ="+req.params.parm_id+" order by ps.std_id ;";

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      res.redirect('back');
      });
  });
};



exports.deleteUser = (req, res) => {
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

    var query = "delete from parm_std where std_id = "+req.params.std_id+" and parm_id = "+req.params.parm_id+"; " ;
    query += "select ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락' , ps.parm_id as '팜' from parm_std as ps where ps.perm_yn = 1 and ps.parm_id ="+req.params.parm_id+" order by ps.std_id ;";
    query += "select pt.team_id as '팀번호', pt.team_name as '팀명', ps.std_name as '이름', pt.std_id as '학번' from parm_team as pt left outer join parm_std as ps on pt.std_id = ps.std_id where pt.parm_id ="+req.params.parm_id+" order by pt.team_id ;";
    query += "select pm.mat_id as '자료 번호', pm.mat_name as '자료 이름', pm.mat_recom as '추천인', pm.mat_first as '등록인', pm.mat_cat as '분야1', pm.mat_cat2 as '분야2', pm.mat_cat3 as '분야3' from parm_mat as pm where pm.parm_id ="+req.params.parm_id+" order by pm.mat_id ;";
    query += "select ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락' , ps.parm_id as '팜' from parm_std as ps where ps.perm_yn = 0 and ps.parm_id ="+req.params.parm_id+" order by ps.std_id ;";


    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      res.redirect('back');
    });
  });
};

exports.getAddTeam = (req, res) => {
  logger.putLog(req);

    res.render('parm/AddTeam', { userId: req.session.userId, parm_id: req.params.parm_id, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment, curDate: new Date()});

};



exports.postAddTeam = (req, res) => {
  logger.putLog(req);

  var project = {
    parm_id: parseInt(req.params.parm_id),
    team_name: req.body.team_name,
    team_sub: req.body.team_sub,
    team_bckgrd: req.body.team_bckgrd,
    team_ncst: req.body.team_ncst,
    team_cate: req.body.team_cate,
    team_cate2: req.body.team_cate2,
    team_cate3: req.body.team_cate3,
    std_id : req.body.std_id,
    regis_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
    registrant : req.session.userId,
    amend_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
    amender : req.session.userId
  };

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    //use connection
    var query = "INSERT INTO parm_team set ? ;";

    query += "select pt.team_id, pt.team_name, pt.team_sub, pt.team_bckgrd, pt.team_ncst, pt.team_cate, pt.team_cate2, pt.team_cate3, pt.std_id from parm_team as pt where pt.team_id = (select MAX(team_id) from parm_team);";
    query += "select pts.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_phone as '번호', ps.std_email as '메일' from parm_team_std as pts left outer join parm_std as ps on pts.std_id = ps.std_id where pts.team_id = (select MAX(team_id) from parm_team);";

    connection.query(query, project, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      logger.putLogDetail(req,'Register success.');
      res.render('parm/DetailTeam', {ClassInfo: results, allUserInfosFields: fields, userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
    });
  });
};


exports.getSetTeam = (req, res) => {

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

    var query = "select pt.parm_id, pt.team_id, pt.team_name, pt.team_sub, pt.team_bckgrd, pt.team_ncst, pt.team_cate, pt.team_cate2, pt.team_cate3, pt.std_id, ps.std_name from parm_team as pt left outer join parm_std as ps on pt.std_id = ps.std_id where pt.team_id ="+req.params.team_id+";";


    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      // console.log(results[0]);

      //use results and fields
      res.render('parm/SetTeam', {ClassInfo: results, moment : moment, userInfo: req.session.userInfo, ClassInformation: results[0], ClassSubUserIdList: results[4]});

    });
  });
};

exports.postSetTeam = (req, res) => {
  logger.putLog(req);

  var teamName = "";

  var project = {
    parm_id: req.body.parm_id,
    team_name: teamName + req.body.team_name,
    team_sub: req.body.team_sub,
    team_bckgrd: req.body.team_bckgrd,
    team_ncst: req.body.team_ncst,
    team_cate: req.body.team_cate,
    team_cate2: req.body.team_cate2,
    team_cate3: req.body.team_cate3,
    std_id : req.body.std_id,
    regis_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
    registrant : req.session.userId,
    amend_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
    amender : req.session.userId
  };

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    //use connection
    var query = "update parm_team set ? where team_id="+req.params.team_id+";";
    query += "select pt.team_id, pt.team_name, pt.team_sub, pt.team_bckgrd, pt.team_ncst, pt.team_cate, pt.team_cate2, pt.team_cate3, pt.std_id from parm_team as pt where pt.team_id ='"+req.params.team_id+"';";
    query += "select pts.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_phone as '번호', ps.std_email as '메일' from parm_team_std as pts left outer join parm_std as ps on pts.std_id = ps.std_id where pts.team_id = '"+req.params.team_id+"';";

    connection.query(query, project, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      logger.putLogDetail(req,'Register success.');
      res.render('parm/DetailTeam', {ClassInfo: results, allUserInfosFields: fields, userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
    });
  });
};


exports.detailTeam = (req, res) => {
  logger.putLog(req);

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    //use connection
    var query = "select parm_id from parm_team as pt where pt.team_id ='"+req.params.team_id+"';";
    query += "select pt.team_id, pt.team_name, pt.team_sub, pt.team_bckgrd, pt.team_ncst, pt.team_cate, pt.team_cate2, pt.team_cate3, pt.std_id from parm_team as pt where pt.team_id ='"+req.params.team_id+"';";
    query += "select pts.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_phone as '번호', ps.std_email as '메일' from parm_team_std as pts left outer join parm_std as ps on pts.std_id = ps.std_id where pts.team_id = '"+req.params.team_id+"';";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      logger.putLogDetail(req, 'Register success.');
      res.render('parm/DetailTeam', {ClassInfo: results, allUserInfosFields: fields, userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
    });
  });
};


exports.addMat = (req, res) => {

};