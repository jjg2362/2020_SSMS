
//use mysqlPool
var mysqlPool = require('../../middlewares/mysqlPool.js');
var express = require('express');
var app = express().use('/public', express.static('public'));
var moment = require('moment');

//use multer
var fileUpload = require('../../middlewares/fileUpload.js');
var logger = require('../../middlewares/logger.js')

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
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }
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
  };

  var today = moment(Date()).format('YYYY-MM-DD hh:mm:ss');
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    //use connection

    var query = "insert into parm set ?;";
    query += "insert into parm_auth(parm_id, sub_user_id, regis_date, registrant, type) ";
    query += "values((select MAX(parm_id) from parm), '" + req.body.instructor + "' , now() , '" + req.session.userId + "','instructor');";

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

    var query = "select p.parm_id, p.parm_name, p.parm_prof, i.inst_name, p.parm_cate, p.parm_cate2, p.parm_cate3 from parm as p left outer join instructor as i";
    query += " on p.parm_prof = i.inst_id order by parm_id desc; " ;

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
  var type = "instructor";

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
    parm_dev : req.body.parm_dev,
    amend_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
    amender : req.session.userId
  };

  console.log(req.body.origin_id);

  var subUserId = req.body.sub_user_id;
  if (typeof subUserId === "string") subUserId = [subUserId];
  else if (typeof subUserId === "undefined") subUserId = [];
  var records = [];
  var arr = [parm_id, "", moment(Date()).format('YYYY-MM-DD hh:mm:ss'), req.session.userInfo.userId,type];
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

    var query = "insert into parm_auth (parm_id, sub_user_id, regis_date, registrant, type) values ?";
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

exports.getUserInfo = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  } else{
    logger.putLog(req);
  }

  //use connection
  var query = "select parm_id from parm where parm_id="+req.query.parm_id+";";
  query += "select ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락' , ps.parm_id as '팜'  from parm_std as ps where ps.perm_yn = 1 and ps.parm_id ="+req.query.parm_id+" order by ps.std_id; ";
  query += "select pt.team_name as '팀명', pt.team_sub as '주제', pt.team_bckgrd as '생성배경', pt.team_ncst as '동향기술', pt.team_id as '팀번호' from parm_team as pt where pt.parm_id ="+req.query.parm_id+" order by pt.team_id; ";
  query += "select pm.mat_name as '과제명', pm.mat_cat as '분야', pm.mat_team as '담당팀', pm.mat_recom as '추천인', pm.mat_date as '최종기간', pm.mat_id as '과제번호' from parm_mat as pm left outer join parm_std as ps on pm.mat_registrant = ps.std_id where pm.parm_id ="+req.query.parm_id+" order by pm.mat_id; ";
  query += "select ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락', ps.parm_id as '팜' from parm_std as ps where ps.perm_yn = 0 and ps.parm_id ="+req.query.parm_id+" order by ps.std_id ;";
  query += "SELECT parm_id from parm_auth where sub_user_id = '"+req.session.userId+"';";

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


exports.deleteTeamMem = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }

  // console.log(req.body);
  var query = "delete from parm_team_std where team_id = " + req.params.team_id + " and std_id = '" + req.params.std_id + "';";

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
      res.redirect('back');

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

    query += "(select pa.sub_user_id, i.inst_name from parm_auth as pa left outer join instructor as i on pa.sub_user_id=i.inst_id where pa.parm_id = '" + req.params.parm_id +"' and pa.type='instructor');";


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


    var query = "select parm_id, parm_name, parm_prof, parm_cate, parm_cate2, parm_cate3 from parm order by parm_id desc; " ;
    query += "SELECT IFNULL(parm_id,0) AS 'id', perm_yn from parm_std where std_id='"+req.session.userId+"';";
    query += "SELECT pt.team_name, pt.team_sub, pt.team_bckgrd, pt.team_ncst, pt.team_id from parm_team as pt where pt.std_id='"+req.session.userId+"' ";
    query += "and pt.parm_id =(select parm_id from parm_std where std_id='"+req.session.userId+"' and perm_yn = 1) ";
    query += "UNION select pt.team_name, pt.team_sub, pt.team_bckgrd, pt.team_ncst, pt.team_id from parm_team as pt left outer join parm_team_std as pts on pt.team_id = pts.team_id where ";
    query += "pt.team_id = (select pts.team_id from parm_team_std as pts where pts.std_id = '"+req.session.userId+"');";


    query += "SELECT pm.mat_name, pm.mat_cat, pm.mat_team, pm.mat_recom, pm.mat_date, pm.mat_id from parm_mat as pm where pm.mat_id in (SELECT pm.mat_id from parm_mat as pm where pm.mat_user='"+req.session.userId+"' union SELECT pms.mat_id from parm_mat_std as pms where pms.s_user='"+req.session.userId+"');";


    query += "SELECT parm_id from parm_auth where sub_user_id = '"+req.session.userId+"';";


    query += "SELECT ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락' , ps.parm_id as '팜'  from parm_std as ps where ps.perm_yn = 1 and ps.parm_id =(select parm_id from parm_auth where sub_user_id='"+req.session.userId+"') order by ps.std_id ;";
    query += "SELECT pt.team_name as '팀명', pt.team_sub as '주제', pt.team_bckgrd as '생성배경', pt.team_ncst as '동향기술', pt.team_id as '팀번호' from parm_team as pt where pt.parm_id =(select parm_id from parm_auth where sub_user_id='"+req.session.userId+"') order by pt.team_id ;";
    query += "SELECT pm.mat_name as '과제명', pm.mat_cat as '분야', pm.mat_team as '담당팀', pm.mat_recom as '추천인', pm.mat_date as '최종기간', pm.mat_id as '과제번호' from parm_mat as pm left outer join parm_std as ps on pm.mat_registrant = ps.std_id where pm.parm_id =(select parm_id from parm_auth where sub_user_id='"+req.session.userId+"')  order by pm.mat_id ;";
    query += "SELECT ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락', ps.parm_id as '팜' from parm_std as ps where ps.perm_yn = 0 and ps.parm_id =(select parm_id from parm_auth where sub_user_id='"+req.session.userId+"') order by ps.std_id ;";


    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      res.render('parm/JoinParm', {PJCodeList: results, allUserInfosFields: fields, userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
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

      res.redirect('back');
    });
  });
};

exports.joinMem2 = (req, res) => {
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

    var query = "insert into parm_std (select "+req.params.parm_id+" as parm_id, m.mentor_id, m.mentor_name, m.company_name, m.business_field, m.phone_num, m.email_ad, false as perm_yn from mentor as m where m.mentor_id='"+req.params.std_id+"');" ;


    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields

      res.redirect('back');
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
    query += "select pt.team_name as '팀명', pt.team_sub as '주제', pt.team_bckgrd as '생성배경', pt.team_ncst as '동향기술', pt.team_id as '팀번호' from parm_team as pt where pt.parm_id ="+req.params.parm_id+" order by pt.team_id ;";
    query += "select pm.mat_name as '과제명', pm.mat_cat as '분야', pm.mat_team as '담당팀', pm.mat_recom as '추천인', pm.mat_date as '최종기간', pm.mat_id as '과제번호' from parm_mat as pm left outer join parm_std as ps on pm.mat_registrant = ps.std_id where pm.parm_id ="+req.params.parm_id+" order by pm.mat_id ;";
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

    var query = "delete from parm_std where std_id = '"+req.params.std_id+"' and parm_id = "+req.params.parm_id+"; " ;


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


exports.deleteTeam = (req, res) => {
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
    var query = "delete from parm_team where team_id = "+req.query.team_id+"; " ;
    query += "select ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락' , ps.parm_id as '팜'  from parm_std as ps where ps.perm_yn = 1 and ps.parm_id ="+req.query.parm_id+" order by ps.std_id; ";
    query += "select pt.team_name as '팀명', pt.team_sub as '주제', pt.team_bckgrd as '생성배경', pt.team_ncst as '동향기술', pt.team_id as '팀번호' from parm_team as pt where pt.parm_id ="+req.query.parm_id+" order by pt.team_id; ";
    query += "select pm.mat_name as '과제명', pm.mat_cat as '분야', pm.mat_team as '담당팀', pm.mat_recom as '추천인', pm.mat_date as '최종기간', pm.mat_id as '과제번호' from parm_mat as pm left outer join parm_std as ps on pm.mat_registrant = ps.std_id where pm.parm_id ="+req.query.parm_id+" order by pm.mat_id; ";
    query += "select ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락', ps.parm_id as '팜' from parm_std as ps where ps.perm_yn = 0 and ps.parm_id ="+req.query.parm_id+" order by ps.std_id ;";
    query += "SELECT parm_id from parm_auth where sub_user_id = '"+req.session.userId+"';";



    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      res.render('parm/PARMMAIN', {allUserInfos: results, allUserInfosFields: fields, userInfo: req.session.userInfo, parm_id: req.query.parm_id, moment: moment, curDate: new Date()});
    });
  });
};

exports.deleteMat = (req, res) => {
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
    var query = "delete from parm_mat where mat_id = "+req.query.mat_id+"; " ;
    query += "select ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락' , ps.parm_id as '팜'  from parm_std as ps where ps.perm_yn = 1 and ps.parm_id ="+req.query.parm_id+" order by ps.std_id; ";
    query += "select pt.team_name as '팀명', pt.team_sub as '주제', pt.team_bckgrd as '생성배경', pt.team_ncst as '동향기술', pt.team_id as '팀번호' from parm_team as pt where pt.parm_id ="+req.query.parm_id+" order by pt.team_id; ";
    query += "select pm.mat_name as '과제명', pm.mat_cat as '분야', pm.mat_team as '담당팀', pm.mat_recom as '추천인', pm.mat_date as '최종기간', pm.mat_id as '과제번호' from parm_mat as pm left outer join parm_std as ps on pm.mat_registrant = ps.std_id where pm.parm_id ="+req.query.parm_id+" order by pm.mat_id; ";
    query += "select ps.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_grade as '학년', ps.std_phone as '전화번호', ps.std_email as '메일', ps.perm_yn as '수락', ps.parm_id as '팜' from parm_std as ps where ps.perm_yn = 0 and ps.parm_id ="+req.query.parm_id+" order by ps.std_id ;";
    query += "SELECT parm_id from parm_auth where sub_user_id = '"+req.session.userId+"';";



    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      res.render('parm/PARMMAIN', {allUserInfos: results, allUserInfosFields: fields, userInfo: req.session.userInfo, parm_id: req.query.parm_id, moment: moment, curDate: new Date()});
    });
  });
};


exports.getAddTeam = (req, res) => {
  logger.putLog(req);
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }
  res.render('parm/AddTeam', { userId: req.session.userId, parm_id: req.params.parm_id, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment, curDate: new Date()});

};

exports.postAddTeam = (req, res) => {
  logger.putLog(req);
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }
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

  var query = "select parm_id from parm_team as pt where pt.parm_id ='"+req.params.parm_id+"';";

  query += "INSERT INTO parm_team set ? ;";

  query += "select pt.team_id, pt.team_name, pt.team_sub, pt.team_bckgrd, pt.team_ncst, pt.team_cate, pt.team_cate2, pt.team_cate3, pt.std_id from parm_team as pt where pt.team_id = (select MAX(team_id) from parm_team);";
  query += "select pts.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_phone as '번호', ps.std_email as '메일' from parm_team_std as pts left outer join parm_std as ps on pts.std_id = ps.std_id where pts.team_id = (select MAX(team_id) from parm_team);";
  query += "SELECT parm_id from parm_auth where sub_user_id = '"+req.session.userId+"';";


  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    //use connection

    connection.query(query, project, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      logger.putLogDetail(req,'Register success.');
      res.render('parm/DetailTeam', {ClassInfo: results, allUserInfosFields: fields, parm_id: parseInt(req.params.parm_id), userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
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

  var team_id = req.body.team_id;

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
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }
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
    amend_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
    amender : req.session.userId
  };

  var team_id = req.body.team_id;
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    //use connection
    var query = "update parm_team set ? where team_id="+team_id+";";

    connection.query(query, project, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      console.log('ClassInfo Register success.');

      res.redirect('../DetailTeam/'+team_id);
    });
  });
};

exports.detailTeam = (req, res) => {
  logger.putLog(req);
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    //use connection
    var query = "select parm_id from parm_team as pt where pt.team_id ='"+req.params.team_id+"';";
    query += "select team_id from parm_team as pt where pt.team_id ='"+req.params.team_id+"';";
    query += "select pt.team_id, pt.team_name, pt.team_sub, pt.team_bckgrd, pt.team_ncst, pt.team_cate, pt.team_cate2, pt.team_cate3, pt.std_id, ps.std_name, ps. from parm_team as pt left outer join parm_std as ps on pt.std_id = ps.std_id where pt.team_id ='"+req.params.team_id+"';";
    query += "select pts.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_phone as '번호', ps.std_email as '메일', ps.std_id as '탈퇴' from parm_team_std as pts left outer join parm_std as ps on pts.std_id = ps.std_id where pts.team_id = '"+req.params.team_id+"';";
    query += "SELECT parm_id from parm_auth where sub_user_id = '"+req.session.userId+"';";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      logger.putLogDetail(req, 'Register success.');
      res.render('parm/DetailTeam', {ClassInfo: results, parm_id: req.query.parm_id, allUserInfosFields: fields, userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
    });
  });
};

exports.postAddTeamMem = (req, res) => {

  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }

  var std_id = "";
  var team_id = req.body.team_id;
  var Class_num= req.body.Classnum;

  var query = "";

  for (var i=0; i<=Class_num; i++){
    if (i==1){
      std_id = req.body.std_id1;
    }else if (i==2){
      std_id = req.body.std_id2;
    } else if (i==3){
      std_id = req.body.std_id3;
    } else if (i==4){
      std_id = req.body.std_id4;
    } else if (i==5){
      std_id = req.body.std_id5;
    } else if (i==6){
      std_id = req.body.std_id6;
    } else if (i==7){
      std_id = req.body.std_id7;
    } else if (i==8){
      std_id = req.body.std_id8;
    } else if (i==9){
      std_id = req.body.std_id9;
    } else if (i==0){
      std_id = req.body.std_id0;
    }
    query += "insert into parm_team_std (std_id, team_id) values ('"+std_id+"','"+team_id+"'); ";

  }

  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    //use connection

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      console.log('ClassInfo Register success.');

      res.redirect('DetailTeam/'+team_id);
    });
  });
};


exports.getAddMat = (req, res) => {
  logger.putLog(req);
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }

  var query = "select type_name from parm_mat_type;";

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

      res.render('parm/AddMat', { ClassInfo: results, userId: req.session.userId, parm_id: req.params.parm_id, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment, curDate: new Date()});
    });
  });
};

exports.postAddMat = (req, res) => {
  logger.putLog(req);

  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }

  var fileInfo = {
    path: 'public/MaterialFile/',
    namePrefix: 'MAT',
    viewNames: ['mat_pdf']
  };

  fileUpload(fileInfo).multipartForm(req, res, (err) => {
    if (err) {
      logger.putLogDetail(req, 'file upload error : ' + err);
      return;
    }

    if (!req.session.userId) {
      console.log('do not have a session.');
      res.redirect('/');
      return;
    }

    var math_info = {
      parm_id: parseInt(req.params.parm_id),
      mat_name: req.body.mat_name,
      mat_cat: req.body.mat_cat,
      mat_cat2: req.body.mat_cat2,
      mat_cat3: req.body.mat_cat3,
      mat_comm: req.body.mat_comm,
      mat_pub: req.body.mat_pub,
      mat_url: req.body.mat_url,
      mat_pdf: req.body.mat_pdf,
      mat_recom: req.body.mat_recom,
      mat_team: req.body.mat_team,
      mat_type: req.body.mat_type,
      mat_heb: req.body.mat_heb,
      mat_date: req.body.mat_date,
      mat_regDate: moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
      mat_registrant: req.session.userId,
      mat_amdDate: moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
      mat_amender: req.session.userId
    };

    if (req.files['mat_pdf'] !== undefined) {
      math_info.mat_pdf = req.files['mat_pdf'][0].path;
      logger.putLogDetail(req, "Material file upload success.");
    }

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if (err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      var query = "INSERT INTO parm_mat set ? ;";

      query += "select pm.parm_id, pm.mat_id, pm.mat_name, pm.mat_cat, pm.mat_cat2, pm.mat_cat3, pm.mat_comm, pm.mat_pub, pm.mat_url, pm.mat_pdf, ps.std_name, pm.mat_recom, pm.mat_team, pm.mat_heb, pm.mat_date, pm.mat_type from parm_mat as pm left outer join parm_std as ps on pm.mat_registrant = ps.std_id where pm.mat_id = (select MAX(mat_id) from parm_mat);";
      query += "select pts.std_id as '학번', ps.std_name as '이름', ps.std_major as '전공', ps.std_phone as '번호', ps.std_email as '메일' from parm_team_std as pts left outer join parm_std as ps on pts.std_id = ps.std_id where pts.team_id = (select MAX(team_id) from parm_team);";
      query += "SELECT parm_id from parm_auth where sub_user_id = '"+req.session.userId+"';";

      //use connection
      connection.query(query, math_info, (error, results, fields) => {
        connection.release();

        if (error) { //throw error;
          console.error('query error : ' + error);
          return;
        }

        logger.putLogDetail(req, 'Material PDF Submitted.');
        res.render('parm/DetailMat', {
          ClassInfo: results,
          allUserInfosFields: fields,
          userId: req.session.userId,
          userType: req.session.userType,
          userInfo: req.session.userInfo,
          parm_id: parseInt(req.params.parm_id),
          moment: moment,
          curDate: new Date()
        });
      });
    });
  });
};

exports.getSetMat = (req, res) => {

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

    var query = "select pm.parm_id, pm.mat_id, pm.mat_name, pm.mat_cat, pm.mat_cat2, pm.mat_cat3, pm.mat_comm, pm.mat_pub, pm.mat_url, pm.mat_pdf, ps.std_name, pm.mat_team, pm.mat_type, pm.mat_date, pm.mat_heb, pm.mat_recom, pm.mat_registrant from parm_mat as pm left outer join parm_std as ps on pm.mat_registrant = ps.std_id where pm.mat_id = "+req.params.mat_id+";";
    query += "select type_name from parm_mat_type;";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      // console.log(results[0]);

      //use results and fields
      res.render('parm/SetMat', {ClassInfo: results, moment : moment, userInfo: req.session.userInfo, ClassInformation: results[0], ClassSubUserIdList: results[4]});

    });
  });
};

exports.postSetMat = (req, res) => {

  //session check
  if (!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  } else {
    logger.putLog(req);
  }
  logger.putLog(req);

  var fileInfo = {
    path: 'public/MaterialFile/',
    namePrefix: 'MAT',
    viewNames: ['mat_pdf']
  };

  fileUpload(fileInfo).multipartForm(req, res, (err) => {
    if (err) {
      logger.putLogDetail(req, 'file upload error : ' + err);
      return;
    }
    if (!req.session.userId) {
      console.log('do not have a session.');
      res.redirect('/');
      return;
    }
    var math_info = {
      parm_id: parseInt(req.body.parm_id),
      mat_name: req.body.mat_name,
      mat_cat: req.body.mat_cat,
      mat_cat2: req.body.mat_cat2,
      mat_cat3: req.body.mat_cat3,
      mat_comm: req.body.mat_comm,
      mat_pub: req.body.mat_pub,
      mat_url: req.body.mat_url,
      mat_pdf: req.body.mat_pdf,
      mat_team: req.body.mat_team,
      mat_date: parseInt(req.body.mat_date),
      mat_type: req.body.mat_type,
      mat_heb: req.body.mat_heb,
      mat_recom: req.body.mat_recom,
      mat_amdDate: moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
      mat_amender: req.session.userId
    };
    if (req.files['mat_pdf'] !== undefined) {
      math_info.mat_pdf = req.files['mat_pdf'][0].path;
      logger.putLogDetail(req, "Material file upload success.");
    }
    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if (err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      var query = "update parm_mat set ? where mat_id=" + req.params.mat_id + ";";
       //use connection
      connection.query(query, math_info, (error, results, fields) => {
        connection.release();

        if (error) { //throw error;
          console.error('query error : ' + error);
          return;
        }

        logger.putLogDetail(req, 'Material PDF Submitted.');
        res.redirect('../DetailMat/'+ req.params.mat_id);
      });
    });

  });
};

exports.detailMat = (req, res) => {

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

    var query = "select parm_id, mat_id from parm_mat where mat_id = '"+req.params.mat_id+"';";
    query += "select pm.parm_id, pm.mat_id, pm.mat_name, pm.mat_cat, pm.mat_cat2, pm.mat_cat3, pm.mat_comm, pm.mat_pub, pm.mat_url, pm.mat_pdf, ps.std_name, pm.mat_team, pm.mat_type, pm.mat_date, pm.mat_heb, pm.mat_recom, pm.mat_registrant from parm_mat as pm left outer join parm_std as ps on pm.mat_registrant = ps.std_id where pm.mat_id = "+req.params.mat_id+";";
    query += "select pms.mat_id, pms.mat_s_id, pms.s_name, pms.s_pdf, pms.s_url, pms.s_comm, pms.s_pub, pms.s_registrant, ps.std_name from parm_mat_std as pms left outer join parm_std as ps on pms.s_registrant = ps.std_id where pms.mat_id = '"+req.params.mat_id+"';";
    query += "SELECT parm_id from parm_auth where sub_user_id = '"+req.session.userId+"';";

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
        res.render('parm/DetailMat', {ClassInfo: results, parm_id:req.query.parm_id, moment : moment, userInfo: req.session.userInfo, ClassInformation: results[0], ClassSubUserIdList: results[4]});
      } else {
        res.redirect('/');
      }
    });
  });
};


exports.getAddSubMat = (req, res) => {
  logger.putLog(req);
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }
  res.render('parm/AddSubMat', { userId: req.session.userId, mat_id: req.params.mat_id, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment, curDate: new Date()});

};

exports.postAddSubMat = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  } else {
    logger.putLog(req);
  }
  logger.putLog(req);

  var fileInfo = {
    path: 'public/SubMaterialFile/',
    namePrefix: 'SubMAT',
    viewNames: ['s_pdf']
  };

  fileUpload(fileInfo).multipartForm(req, res, (err) => {
    if (err) {
      logger.putLogDetail(req, 'file upload error : ' + err);
      return;
    }
    if (!req.session.userId) {
      console.log('do not have a session.');
      res.redirect('/');
      return;
    }
    var math_info = {
      mat_id: parseInt(req.params.mat_id),
      s_name: req.body.s_name,
      s_comm: req.body.s_comm,
      s_pub: req.body.s_pub,
      s_url: req.body.s_url,
      s_pdf: req.body.s_pdf,
      s_regisDate: moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
      s_registrant: req.session.userId,
      s_amenDate: moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
      s_amender: req.session.userId
    };
    if (req.files['s_pdf'] !== undefined) {
      math_info.s_pdf = req.files['s_pdf'][0].path;
      logger.putLogDetail(req, "Material file upload success.");
    }
    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if (err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      var query = "insert into parm_mat_std set ? ;";

      //use connection
      connection.query(query, math_info, (error, results, fields) => {
        connection.release();

        if (error) { //throw error;
          console.error('query error : ' + error);
          return;
        }

        logger.putLogDetail(req, 'SubMaterial PDF Submitted.');
        res.redirect('../DetailMat/'+req.params.mat_id);
      });
    });
  });
};

exports.getSetSubMat = (req, res) => {

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

    var query = "select pms.mat_id, pms.mat_s_id, pms.s_name, pms.s_comm, pms.s_pub, pms.s_url, pms.s_pdf from parm_mat_std as pms where pms.mat_s_id = "+req.params.mat_s_id+";";


    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      // console.log(results[0]);

      //use results and fields
      res.render('parm/SetSubMat', {ClassInfo: results, moment : moment, userInfo: req.session.userInfo, ClassInformation: results[0], ClassSubUserIdList: results[4]});

    });
  });
};

exports.postSetSubMat = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  } else {
    logger.putLog(req);
  }
  logger.putLog(req);

  var fileInfo = {
    path: 'public/SubMaterialFile/',
    namePrefix: 'SubMAT',
    viewNames: ['s_pdf']
  };

  fileUpload(fileInfo).multipartForm(req, res, (err) => {
    if (err) {
      logger.putLogDetail(req, 'file upload error : ' + err);
      return;
    }
    if (!req.session.userId) {
      console.log('do not have a session.');
      res.redirect('/');
      return;
    }
    var math_info = {
      mat_id: parseInt(req.body.mat_id),
      s_name: req.body.s_name,
      s_comm: req.body.s_comm,
      s_pub: req.body.s_pub,
      s_url: req.body.s_url,
      s_pdf: req.body.s_pdf,
      s_amenDate: moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
      s_amender: req.session.userId
    };
    if (req.files['s_pdf'] !== undefined) {
      math_info.s_pdf = req.files['s_pdf'][0].path;
      logger.putLogDetail(req, "Material file upload success.");
    }
    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if (err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      var query = "update parm_mat_std set ? where mat_s_id="+req.params.mat_s_id+";";

      //use connection
      connection.query(query, math_info, (error, results, fields) => {
        connection.release();

        if (error) { //throw error;
          console.error('query error : ' + error);
          return;
        }

        logger.putLogDetail(req, 'SubMaterial PDF Submitted.');
        res.redirect('../DetailMat/'+req.body.mat_id);
      });
    });
  });
};


