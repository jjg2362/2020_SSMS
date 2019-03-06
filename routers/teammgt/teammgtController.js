//teammgtController

//use mysqlPool
var mysqlPool = require('../../middlewares/mysqlPool.js');

//use multer
var fileUpload = require('../../middlewares/fileUpload.js');
var logger = require('../../middlewares/logger.js');

var moment = require('moment');

//show register page
exports.getTeam = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  var query = "select team_name from team where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = 1 and team_yn = 1 and use_yn = 1);";
  query += "select team_name from team where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = 2 and team_yn = 1 and use_yn = 1);";
  query += "select team_name from team where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = 3 and team_yn = 1 and use_yn = 1);";
  // results[3]: 현재 활성화된 팀 타입 목록
  query += "select s.settings_id, s.prj_year, s.prj_semes, s.term_chk from admin_settings as s  " ;
  query += "where use_yn = 1 order by s.settings_id desc ;";
  // results[4]: 학생이 소속한 팀의 팀 이름, 팀 타입 번호, 프로젝트 연도, 학기, 팀 타입
  query += "select team_name, team.settings_id, prj_year, prj_semes, term_chk from team, admin_settings ";
  query += "where team_id in (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and use_yn = 1) ";
  query += "and team.settings_id = admin_settings.settings_id;";

  console.log("지우자 getTeam:")
  console.log(query);
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
      console.log(results);
      res.render('teammgt/DGU201', {myTeamName: results, userInfo: req.session.userInfo, teamType: results[3], myTeamList: results[4]});
    });
  });
};

//
exports.postTeamCreate = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  var checkQuery = "select std_id, class_type from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = " + req.body.teamCreateType + ";";
  checkQuery += "select team_name from team where team_name = '" + req.body.teamName + "';";
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    connection.query(checkQuery, (checkError, checkResults, checkFields) => {
      if(checkError) { //throw error;
        console.error('query error : ' + checkError);
        res.send('teamNameError');
        return;
      }

      // console.log("지우자 postTeamCreate:");
      // console.log(checkResults)

      if(checkResults[0].length > 0) {
        connection.release();
        console.log('team creation failed.');
        res.send('dupTeam');
      } else if(checkResults[1].length > 0) {
        connection.release();
        console.log('team creation failed.');
        res.send('dupTeamName');
      } else {
        var query = "insert into team(team_name, leader_id, settings_id) values('" + req.body.teamName + "', '" + req.session.userInfo.userId + "', '" + req.body.teamCreateType + "');";
        query += "insert into std_team_info(std_id, team_id, leader_id, team_yn, class_type, use_yn) values('" + req.session.userInfo.userId + "', LAST_INSERT_ID(), '" + req.session.userInfo.userId + "', 1, " + req.body.teamCreateType + ", 1);";
        query += "insert into project_cart(team_id) values(LAST_INSERT_ID());";

        connection.query(query, (error, results, fields) => {
          connection.release();

          if(error) { //throw error;
            console.error('query error : ' + error);
            return;
	  }
	  console.log('team created!');
          res.send('tOk');
        });
      }
    });
  });
};


//
exports.postTeamDelete = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    var checkQuery = "select std_id, leader_id from std_team_info where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = " + req.body.teamDeleteType + " and team_yn = 1 and use_yn = 1) and team_yn = 1 and use_yn = 1;";

    connection.query(checkQuery, (checkError, checkResults, checkFields) => {

      if(checkError) { //throw error;
        console.error('query error : ' + checkError);
        return;
      }

      var addQuery = "";

      if(checkResults[0].leader_id != req.session.userInfo.userId) {
        addQuery += "delete from std_team_info where std_id = '" + req.session.userInfo.userId +"' and class_type = " + req.body.teamDeleteType + " and team_yn = 1 and use_yn = 1;";
      } else if(checkResults.length > 1) {
        console.log('team member exist');
        connection.release();
        res.send("tmE");
        return;
      } else {
        addQuery += "delete from team where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = " + req.body.teamDeleteType + " and team_yn = 1 and use_yn = 1) and use_yn = 1;";
        addQuery += "delete from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = " + req.body.teamDeleteType + " and team_yn = 1 and use_yn = 1;";
      }

      connection.query(addQuery, (error, results, fields) => {
        connection.release();

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }

        console.log('team delete!');
        res.send('tdOk');
      });
    });
  });
};


//get teamSearchPage
exports.getTeamMember = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }


  var query = "select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = 1;";
  query += "select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = 2;";


  query += "select std_id, std_name, major from student where std_id in (select std_id from std_team_info where leader_id = '" + req.session.userInfo.userId + "' and class_type='1' and team_yn = 0) and std_id <> '" + req.session.userInfo.userId + "';";
  query += "select std_id, std_name, major from student where std_id in (select std_id from std_team_info where leader_id = '" + req.session.userInfo.userId + "' and class_type='2' and team_yn = 0) and std_id <> '" + req.session.userInfo.userId + "';";
  query += "select std_id, std_name, major from student where std_id in (select std_id from std_team_info where leader_id = '" + req.session.userInfo.userId + "' and class_type='3' and team_yn = 0) and std_id <> '" + req.session.userInfo.userId + "';";

  // results[16]: 현재 활성화된 팀 타입 목록
  query += "select s.settings_id, s.prj_year, s.prj_semes, s.term_chk from admin_settings as s  " ;
  query += "where use_yn = 1 order by s.settings_id desc ;";

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

      // console.log(results);
      //use results and fields
      res.render('teammgt/DGU251', {myTeamLeader: results, userInfo: req.session.userInfo, teamType: results[5]});
    });
  });
};


//
exports.postTeamSearch = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    var info = {

    };

    var query = "select std_id, std_name, major from student where std_name = '" + req.body.stdName + "';"

    connection.query(query, (error, results, fields) => {
      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      if(results.length == 0) {
        connection.release();
        console.log('not found student info');
        res.send('noStd');
      } else {
        var addQuery = "";
        for(var i in results) {
          addQuery += "select team_id, team_yn from std_team_info where std_id = '" + results[i].std_id + "' and use_yn = 1 and class_type = " + req.body.teamSearchType + ";";
        }

        connection.query(addQuery, (addError, addResults, addFields) => {
          connection.release();

          if(addError) { //throw error;
            console.error('query error : ' + addError);
            return;
          }

          for(var i in results) {
            info[results[i].std_id] = {name: results[i].std_name, major: results[i].major, class: addResults[i]};
          }

          console.log('find student info');
          res.send(info);
        });
      }
    });
  });
};


//
exports.postTeamAdd = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  var query = "insert into std_team_info(std_id, team_id, leader_id, team_yn, class_type, use_yn) values('" + req.body.stdId + "', (select b.team_id from (select team_id from std_team_info as a where a.std_id = '" + req.session.userInfo.userId + "' and a.class_type = " + req.body.addType + ") as b), '" + req.session.userInfo.userId + "', 0, " + req.body.addType + ", 1);";
  //var query = "insert into std_team_info(std_id, team_id, leader_id, team_yn, class_type, use_yn) values('" + req.body.stdId + "', (select b.team_id from (select team_id from std_team_info as a where a.std_id = '" + req.session.userInfo.userId + "' and a.class_type = " + req.body.addType + ") as b), '" + req.session.userInfo.userId + "', 0, " + req.body.addType + ", 1);";


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

      console.log("team add success.");
      res.send('taOk');
    });
  });
};

// 내가 초대한 학생 정보 가져오는 API, class_type을 필요로
exports.getMemberOfMyInvitation = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }

  var query = "select std_id, std_name, major from student ";
     query += "where std_id in (select std_id from std_team_info where leader_id = '" + req.session.userInfo.userId + "' and class_type='" + req.query.classType + "' and team_yn = 0) ";
     query += "and std_id <>  '" + req.session.userInfo.userId + "' ;";

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

      // console.log(results);
      //use results and fields
      //res.render('teammgt/DGU251', {myTeamLeader: results, userInfo: req.session.userInfo, teamType: results[5]});
      res.send(results)
    });
  });
};

//
exports.getMyTeam = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  // var query = "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 0 and class_type = 1);";
  // query += "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 0 and class_type = 2);";
  // query += "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 0 and class_type = 3);";
  //
  //
  // query += "select team_name from team where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 1);";
  // query += "select team_name from team where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 2);";
  // query += "select team_name from team where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 3);";
  //
  //
  // query += "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 1);";
  // query += "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 2);";
  // query += "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 3);"
  //
  // query += "select student.std_id, std_name, major, std_team_info.std_resume from student left join std_team_info on student.std_id = std_team_info.std_id and std_team_info.class_type = 1 where student.std_id in (select std_id from std_team_info where team_id = (select team_id from std_team_info where std_id = '" + req.ses$
  // query += "select student.std_id, std_name, major, std_team_info.std_resume from student left join std_team_info on student.std_id = std_team_info.std_id and std_team_info.class_type = 2 where student.std_id in (select std_id from std_team_info where team_id = (select team_id from std_team_info where std_id = '" + req.ses$
  // query += "select student.std_id, std_name, major, std_team_info.std_resume from student left join std_team_info on student.std_id = std_team_info.std_id and std_team_info.class_type = 3 where student.std_id in (select std_id from std_team_info where team_id = (select team_id from std_team_info where std_id = '" + req.ses$
  //
  // query += "select student.std_id, std_name, major, std_team_info.std_resume from student left join std_team_info on student.std_id = std_team_info.std_id and std_team_info.class_type = 1 where student.std_id in (select std_id from std_team_info where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 1) and std_id <> leader_id and team_yn = 1);";
  // query += "select student.std_id, std_name, major, std_team_info.std_resume from student left join std_team_info on student.std_id =std_team_info.std_id and std_team_info.class_type = 2 where student.std_id in (select std_id from std_team_info where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 2) and std_id <> leader_id and team_yn = 1);";
  //
  //
  // query += "select std_resume from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = 1 and std_resume is not null;";
  // query += "select std_resume from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = 2 and std_resume is not null;";
  // query += "select std_resume from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = 3 and std_resume is not null;";
  // query += "select prj_aply_apdx from apdx_file_info where use_yn = 1";

  // results[0]~[2]: 현재 사용자를 초대한 팀 리더의 정보
  var query = "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 0 and class_type = 1);";
  query += "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 0 and class_type = 2);";
  query += "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 0 and class_type = 3);";

  // results[3]~[5]: 나의팀(팀명)
  query += "select team_name from team where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 1);";
  query += "select team_name from team where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 2);";
  query += "select team_name from team where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 3);";

  // results[6]~[8]: 나의팀(팀장)
  query += "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 1);";
  query += "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 2);";
  query += "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 3);";
  // results[9]~[11]: 나의팀(팀)
  query += "select student.std_id, std_name, major, std_team_info.std_resume from student left join std_team_info on student.std_id = std_team_info.std_id and std_team_info.class_type = 1 where student.std_id in (select std_id from std_team_info where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 1) and std_id <> leader_id and team_yn = 1);";
  query += "select student.std_id, std_name, major, std_team_info.std_resume from student left join std_team_info on student.std_id = std_team_info.std_id and std_team_info.class_type = 2 where student.std_id in (select std_id from std_team_info where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 2) and std_id <> leader_id and team_yn = 1);";
  query += "select student.std_id, std_name, major, std_team_info.std_resume from student left join std_team_info on student.std_id = std_team_info.std_id and std_team_info.class_type = 3 where student.std_id in (select std_id from std_team_info where team_id = (select team_id from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 1 and class_type = 3) and std_id <> leader_id and team_yn = 1);";
  // results[12]~[14]
  query += "select std_resume from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = 1 and std_resume is not null;";
  query += "select std_resume from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = 2 and std_resume is not null;";
  query += "select std_resume from std_team_info where std_id = '" + req.session.userInfo.userId + "' and class_type = 3 and std_resume is not null;";
  // results[15]
  query += "select prj_aply_apdx from apdx_file_info where use_yn = 1;";

  // results[16]: 현재 활성화된 팀 타입 목록
  query += "select s.settings_id, s.prj_year, s.prj_semes, s.term_chk from admin_settings as s  " ;
  query += "where use_yn = 1 order by s.settings_id desc ;";

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
      console.log('get My Team Info');
      console.log(results);
      console.log('팀 타입 목록');
      console.log(results[16]);
      res.render('teammgt/DGU211', {myTeamInfo: results, userInfo: req.session.userInfo, teamType: results[16]});
    });
  });
};


//get PersonalCompetence file
exports.postPCFile = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  var fileInfo = {
    path: 'public/PCUpload/',
    namePrefix: 'PCUPLOADFILE_',
    viewNames: ['teamPersonalCompetenceFile']
  };

  fileUpload(fileInfo).multipartForm(req, res, (err) => {
    if(err) {
      console.log('file upload error : ' + err);
      return;
    }

    var uploadPCFIle = {

    }

    if(req.files['teamPersonalCompetenceFile'] !== undefined) {
      uploadPCFIle.std_resume = req.files['teamPersonalCompetenceFile'][0].path;
      console.log("file upload success.");
    }

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if(err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      var query = "update std_team_info set std_resume = '" + uploadPCFIle.std_resume + "' where std_id = '" + req.session.userInfo.userId + "' and class_type = " + req.body.pfType + ";";

      connection.query(query, uploadPCFIle, (error, results, fields) => {
        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }
        connection.release();

        res.redirect('/teammgt/DGU211');
      });
    });
  });
};



//
exports.postTeamInvite = (req, res) => {
  //session check

  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    var query = "";

    if(req.params.type == 'accept')  {
      query += "update std_team_info set team_yn = 1 where std_id = '" + req.session.userInfo.userId + "' and leader_id = '" + req.body.acId + "' and class_type = " + req.body.acType + ";";
      query += "delete from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 0;";
    } else if(req.params.type == 'reject') {
      query += "delete from std_team_info where std_id = '" + req.session.userInfo.userId + "' and team_yn = 0 and leader_id = '" + req.body.rjId + "' and class_type = " + req.body.rjType + ";";
    }

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      if(req.params.type == 'accept') {
        console.log('team accept');
        res.send('acOk');
      } else if(req.params.type == 'reject') {
        console.log('team reject');
        res.send('rjOk');
      }
    });
  });

};


//
exports.postTeamOut = (req, res) => {
  // //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    var query = "delete from std_team_info where std_id = '" + req.body.outId + "' and class_type = " + req.body.outType + ";";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      console.log('out success');

      res.send('outOk');
    });
  });
};

// DGU211(나의 팀): 선택한 팀 타입에 대해 현재 사용자를 초대한 학생들(리더)의 정보
exports.getMyInvitation = (req, res) => {
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }

  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    let userId = req.session.userInfo.userId;
    var query = "select std_id, std_name, major from student where std_id in (select leader_id from std_team_info where std_id = '" + userId + "' and team_yn = 0 and class_type='" + req.query.classType + "');";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      console.log('DGU211(나의 팀): 현재 사용자를 초대한 학생들(리더)의 정보');
      console.log(results)

      res.send(results);
    });
  });
};

// DGU211(나의 팀): 현재 사용자의 나의 팀 정보(팀명, 팀장, 팀원)
exports.getMyTeamInfo = (req, res) => {
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }

  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    let userId = req.session.userInfo.userId;
    let classType = req.query.classType;

    var query = "";
    /* 팀명 */
    query += "select team_name from team where team_id = (select team_id from std_team_info where std_id = '" + userId + "' and team_yn = 1 and class_type = '" + classType  + "');";
    /* 팀장 */
    query += "select std_id, std_name, major from student where std_id = (select leader_id from std_team_info where std_id = '" + userId + "' and team_yn = 1 and class_type = '" + classType  + "');";
    /* 팀원 */
    query += "select student.std_id, std_name, major, std_team_info.std_resume from student left join std_team_info on student.std_id = std_team_info.std_id and std_team_info.class_type = '" + classType  + "' where student.std_id in (select std_id from std_team_info where team_id = (select team_id from std_team_info where std_id = '" + userId + "' and team_yn = 1 and class_type = '" + classType  + "') and std_id <> leader_id and team_yn = 1);";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      console.log('DGU211(나의 팀): 현재 사용자의 나의 팀 정보(팀명, 팀장, 팀원)');
      console.log(results);

      res.send(results);
    });
  });
};

// DGU211(나의 팀): 현재 사용자의 개인역량표
exports.getMyResume = (req, res) => {
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }

  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    let userId = req.session.userInfo.userId;
    let classType = req.query.classType;
    var query = "select std_resume from std_team_info where std_id = '" + userId + "' and class_type = '" + classType + "' and std_resume is not null;";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      console.log('DGU211(나의 팀): 현재 사용자의 개인역량표');
      console.log(results);

      res.send(results);
    });
  });
};

// DGU211(나의 팀): 현재 사용자의 팀 이름(팀 탈퇴에서 쓰임)
exports.getMyTeamName = (req, res) => {
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
    logger.putLog(req);
  }

  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    var query = "";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      console.log('out success');

      res.send('outOk');
    });
  });
};

//show Team Select page
exports.getTeamSelectPj = (req, res) => {
  // //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  var info = {};

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    var pjQuery = "select prj_id, prj_name from project left join admin_settings on project.settings_id = admin_settings.settings_id where mentor_id = '" + req.session.userInfo.userId + "' and project.use_yn = 1 and prj_id not in (select distinct prj_id from team where use_yn = 1 and prj_id is not null) and now() < mtch_cls_date;";


    connection.query(pjQuery, (pjError, pjResults, pjFields) => {
      if(pjError) { //throw error;
        console.error('pjQuery error : ' + pjError);
        return;
      }

      //no project
      if(pjResults.length == 0) {
        console.log('No Project');
        connection.release();
        res.render('teammgt/DGU221', {pjInfo: 'noPj', userInfo: req.session.userInfo});
      } else {
        //want1 team select query
        var teamQuery = "";
        for(var i in pjResults) {
          teamQuery += "select team_id, team_name from team where team_id in (select distinct team_id from project_cart where project1 = '" + pjResults[i].prj_id + "' and use_yn = 1);";
        }

        connection.query(teamQuery, (teamError, teamResults, teamFields) => {
          if(teamError) { //throw error;
            console.error('teamQuery error : ' + teamError);
            return;
          }
          connection.release();

          if(pjResults.length == 1) {
            info[pjResults[0].prj_id] = {prjName: pjResults[0].prj_name, want1: teamResults};
          } else {
            for(var i in pjResults) {
              info[pjResults[i].prj_id] = {prjName: pjResults[i].prj_name, want1: teamResults[i]};
            }
          }

          res.render('teammgt/DGU221', {pjInfo: info, userInfo: req.session.userInfo});
        });
      }
    });
  });
};



//show Team Select page
exports.postTeamSelectStd = (req, res) => {
  // //session check
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

    var stdQuery = "select a.std_id, a.std_name, a.major, b.leader_id, b.std_resume from student as a, std_team_info as b where b.team_id = '" + req.body.t_id + "' and a.std_id = b.std_id;";

    connection.query(stdQuery, (stdError, stdResults, stdFields) => {
      connection.release();

      if(stdError) { //throw error;
        console.error('stdQuery error : ' + stdError);
        return;
      }

      console.log('find std');
      res.send(stdResults);
    });
  });
};

//team select
exports.postTeamAccept = (req, res) => {
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

    var query = "update team set prj_id = '" + req.body.p_id + "', mentor_id = '" + req.session.userInfo.userId + "' where team_id = '" + req.body.t_id + "';";
    query += "insert into final_product(team_id, prj_id, mentor_id, use_yn) values('" + req.body.t_id + "', '" + req.body.p_id + "', '" + req.session.userInfo.userId +"', 1);";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      console.log('team select OK');
      res.send('sOk');
    });
  });
};


//
exports.postStdDown = (req, res) => {
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

    var query = "select std_resume from std_team_info where std_id = '" + req.body.s_id + "';";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      if(results[0].std_resume == null) {
        console.log('download no');
        res.send('noF');
      } else {
        console.log('download ok');
        res.send(results[0].std_resume);
      }
    });
  });
};




//all team info -> DGU231
exports.getAllTeamInfo = (req, res) => {
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
  var query = "select b.class_type, d.class_num, b.team_id, d.team_name, a.std_id , d.leader_id, a.std_grade , a.std_name , a.major ,   ";
  query += "a.email_ad ,a.phone_num , b.std_resume , ";
  query += "e.prj_name as pc1_name, f.prj_name as pc2_name, g.prj_name as pc3_name , d.mentor_id , p.prj_name "
  query +="from student as a ";
  query +="left join std_team_info as b on a.std_id = b.std_id ";
  query +="left join project_cart as c on b.team_id= c.team_id  ";
  query +="left join team as d on d.team_id = b.team_id ";
  query +="left join project as p on p.prj_id=d.prj_id ";
  query +="left join (select prj_id,prj_name from project) as e on e.prj_id=c.project1 ";
  query +="left join (select prj_id,prj_name from project) as f on f.prj_id=c.project2 ";
  query +="left join (select prj_id,prj_name from project) as g on g.prj_id=c.project3 where d.use_yn=1 order by b.class_type, b.team_id desc;";

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
      // console.log('lookup all team.');
      res.render('teammgt/DGU231', {teamInfo: results, userInfo: req.session.userInfo});
    });
  });
}

//all team info -> DGU281
exports.getAllTeamInfoma = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  } else if(req.session.userType != "instructor") {
    console.log('do not match admin type.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  //use connection
  var query = "select d.class_num, d.team_name, a.std_id , d.leader_id, a.std_grade , a.std_name , a.major ,   ";
  query += "a.email_ad ,a.phone_num , b.std_resume ,  p.prj_name, i.class_name ";
  query +="from student as a ";
  query +="left join std_team_info as b on a.std_id = b.std_id ";
  query +="left join team as d on d.team_id = b.team_id ";
  query +="left join project as p on p.prj_id=d.prj_id ";
  query +="left join (select class_num, class_name, inst_id from class_info) as i on d.class_num = i.class_num ";
  query +="where i.inst_id ='"+ req.session.userId +"' order by d.class_num, b.team_id desc;";

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
      // console.log('lookup all team.');
      res.render('teammgt/DGU281', {teamInfo: results, userInfo: req.session.userInfo});
    });
  });
}

//all team info -> DGU291
exports.getAllTeamInfoAS = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  } else if(req.session.userType != "assistant") {
    console.log('do not match assistant type.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  //use connection
  var query = "select d.class_num, d.team_name, a.std_id , d.leader_id, a.std_grade , a.std_name , a.major ,   ";
  query += "a.email_ad ,a.phone_num , b.std_resume ,  p.prj_name, i.class_name ";
  query +="from student as a ";
  query +="left join std_team_info as b on a.std_id = b.std_id ";
  query +="left join team as d on d.team_id = b.team_id ";
  query +="left join project as p on p.prj_id=d.prj_id ";
  query +="left join (select class_num, class_name, assis_id from class_info) as i on d.class_num = i.class_num ";
  query +="where i.assis_id ='"+ req.session.userId +"' order by d.class_num, b.team_id desc;";

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
      // console.log('lookup all team.');
      res.render('teammgt/DGU291', {teamInfo: results, userInfo: req.session.userInfo});
    });
  });
}

//all project info -> DGU271
exports.getAllProjectInfo = (req, res) => {
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
  var query = "select p.prj_id, p.prj_name, p.mentor_id , m.mentor_name, m.company_name, m.phone_num, m.email_ad,t.team_name as fixed_team, ";
  query += "pj1_team.teams as team1, pj2_team.teams as team2, pj3_team.teams as team3 ";
  query += "from project as p left join mentor as m on p.mentor_id = m.mentor_id and p.use_yn='1' ";
  query += "left join team as t on t.prj_id = p.prj_id ";
  query += "left join (select pjcart.project1, group_concat(t.team_name separator ', ') as teams from project_cart as pjcart ";
  query += "left outer join team as t on t.team_id = pjcart.team_id group by pjcart.project1) as pj1_team ";
  query += "on pj1_team.project1 = p.prj_id ";
  query += "left join (select pjcart.project2, group_concat(t.team_name separator ', ') as teams from project_cart as pjcart ";
  query += "left outer join team as t on t.team_id = pjcart.team_id group by pjcart.project2) as pj2_team ";
  query += "on pj2_team.project2 = p.prj_id ";
  query += "left join (select pjcart.project3, group_concat(t.team_name separator ', ') as teams from project_cart as pjcart ";
  query += "left outer join team as t on t.team_id = pjcart.team_id group by pjcart.project3) as pj3_team ";
  query += "on pj3_team.project3 = p.prj_id ";
  query += "where p.use_yn = 1;";

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
      // console.log('lookup all team.');
      res.render('teammgt/DGU271', {PjInfo: results, userInfo: req.session.userInfo});
    });
  });
}


exports.getTeamPjInfo = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  var query = "select t.team_id, t.team_name from team as t ";
  query += "where t.use_yn = '1' and t.prj_id is null; " ;

  query += "select distinct p.prj_id, p.prj_name, p.mentor_id from project as p ";
  query += "where p.use_yn ='1' and p.prj_id not in (select distinct prj_id from team where use_yn ='1' and prj_id is not null); ";

  query += "select t.*, p.prj_name from team as t , project as p  " ;
  query += "where t.use_yn ='1' and t.prj_id is not null and p.prj_id=t.prj_id ";
  query += "order by t.amend_date desc; ";


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
      res.render('teammgt/DGU241', {TeamPjName: results,userInfo: req.session.userInfo});
    });
  });
};

//get PersonalCompetence file
exports.postTeamPjMatching = (req, res) => {
    var PjMentor = req.body.ProjectMentorID.split(',',2);
    console.log(PjMentor[0]);
    console.log(PjMentor[1]);

    var query = "update team set ";
    query += "prj_id = '"+PjMentor[0]+"', mentor_id = '"+PjMentor[1]+"', ";
    query += " amend_date ='" +moment(Date()).format('YYYY-MM-DD hh:mm:ss')+ "', amender = '" +req.session.userId+"' ";
    query +=  " where team_id = '" + req.body.TeamID +"'; ";

    query += "insert into final_product (team_id, prj_id, mentor_id) "
    query += "values ('"+req.body.TeamID+"' , '"+PjMentor[0] +"','"+PjMentor[1]+"'); "
    // console.log(query);

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

        console.log('Team - Project Matching success.');
        res.redirect('DGU241');

      });
    });
  };

exports.getTeamPjDelete = (req, res) => {
    //session check
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }

    var query ="Update team set prj_id = NULL, mentor_id = NULL where team_id ="+req.params.teamId+";";

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
            res.redirect('/teammgt/DGU241');
        });
    });
};

exports.getTeamClassInfo = (req, res) => {
  //session check
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  var query = "select t.* from team as t where t.use_yn='1' order by t.team_name ; ";

  query += "select cinfo.*, i.major, i.inst_name from class_info as cinfo, instructor as i ";
  query += "where cinfo.use_yn='1'and cinfo.inst_id = i.inst_id; ";

  query += "select t.*, i.major, i.inst_name from team as t , instructor as i, class_info as cinfo ";
  query += "where t.use_yn ='1' and t.class_num is not null and cinfo.class_num=t.class_num and cinfo.inst_id = i.inst_id  ";
  query += "order by t.amend_date desc; ";

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
      res.render('teammgt/DGU261', {TeamClassName: results,userInfo: req.session.userInfo});
    });
  });
};
exports.postTeamClassMatching = (req, res) => {

      var classSetting = req.body.ClassInfo.split(',',2);
      console.log(req.body.TeamID);
      console.log(classSetting[0]);
      console.log(classSetting[1]);

      var query = "update team set ";
      query += "class_num = '"+classSetting[0]+"', settings_id = '"+classSetting[1]+"', ";
      query += " amend_date ='" +moment(Date()).format('YYYY-MM-DD hh:mm:ss')+ "', amender = '" +req.session.userId+"' ";
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

          console.log('Team - Project Matching success.');
          res.redirect('DGU261');

        });
      });
    };



