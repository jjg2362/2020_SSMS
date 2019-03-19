//index controller

//use moment
var moment = require('moment');
//use mysql
var mysqlPool = require('../../middlewares/mysqlPool.js');
var fileUpload = require('../../middlewares/fileUpload.js');
var logger = require('../../middlewares/logger.js');

var query_where ="";
var flag = false;
var path = require('path');


var fs = require('fs');

var zipFolder = require('zip-folder');

exports.downloadProjectFile = (req,res)=>{
    //session check
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }

    console.log('got dgu901 post')
    console.log('\n\n')

    var prj_id = req.body['prj_id']
    var query_temp = '(';
    for(var id in prj_id){
        if(id!=prj_id.length-1){
            query_temp+=prj_id[id]+','
        }else {
            query_temp += prj_id[id]
        }
    }
    query_temp+=')'

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
        if(err) { //throw err;
            console.error('getConnection err : ' + err);
            return;
        }
        var query = "select p.prj_id,p.prj_name, p.appendix, fp.fin_report, fp.product1, fp.demo_vid, fp.patent_doc, fp.prg_regis, fp.thesis_file, fp.other1, fp.other2, fp.other3 from project as p ";
        query += "left outer join (select fp.prj_id , fp.team_id, fp.fin_report, fp.product1, fp.demo_vid, fp.patent_doc, fp.prg_regis, fp.thesis_file, fp.other1, fp.other2, ";
        query += "fp.other3 from final_product as fp, project as p1 where p1.prj_id = fp.prj_id) as fp on p.prj_id = fp.prj_id ";
        query += "where p.prj_id in "+query_temp+" order by p.prj_id;";

        query += "select p.prj_id, sti.std_resume from project as p, std_team_info as sti, team as t";
        query += " where p.prj_id in "+query_temp+" and p.prj_id = t.prj_id and t.team_id = sti.team_id order by p.prj_id;";

        query += "select m.prj_id, m.ment_report_mtr, m.ment_report_std from mentoring_report as m";
        query += " where m.prj_id in "+query_temp+" order by m.prj_id;";


        connection.query(query, null, (error, results, fields) => {
            connection.release();

            if(error) { //throw error;
                console.error('query error : ' + error);
                return;
            }

            results = JSON.parse(JSON.stringify(results))

            var fileArr = new Array();

            for(var i in prj_id){

                var tempArr = new Array();
                var tempPrjID = prj_id[i];

                for(var r in results){//세 개의 쿼리 결과를 하나씩 확인
                    for(var rr in results[r]){ // 한 쿼리 결과의 한 줄씩 본다.
                        if(results[r][rr].prj_id==tempPrjID){ //
                            var keys = Object.keys(results[r][rr]); //key 값들을 가져오고
                            keys.splice(keys.indexOf('prj_id'),1) //key 값 중 prj_id 삭제
                            for (var k in keys){
                                var tempKey = keys[k];
                                if(results[r][rr][tempKey]){
                                    tempArr.push(results[r][rr][tempKey])
                                }
                            }
                        }
                    }
                }
                fileArr.push(tempArr);
            }
            // console.log(fileArr,fileArr[0][0])
            var topDirName = '/home/dev/sd/public/transferedFileDownload/'+moment().format('YYMMDD_kkmmss')+'_transferedProject';
            fs.mkdirSync(topDirName,{recursive:true})
            // console.log(fileArr[9])
            for(var i in fileArr){
                var dirName = i.toString()+'_'+fileArr[i].splice(0,1)[0];
                // console.log(dirName);
                dirName = dirName.replace('/','_');
                fs.mkdirSync(topDirName+'/'+dirName,function(err){
                    if(err){
                        console.log(err);
                    }
                });
                // console.log(dirName)
                // console.log(__dirname)
                // console.log(i,'th files:',fileArr[i])
                for(var j in fileArr[i]){
                    filePath = '/home/dev/sd/'+fileArr[i][j]
                    destPath = topDirName + '/' + dirName+'/'+fileArr[i][j].split('/')[2]
                    // console.log(filePath,destPath)
                    if(fs.existsSync(filePath)) {
                        fs.copyFileSync(filePath, destPath, (err) => {
                            if (err) throw err;
                            console.log("error:", err)
                        });
                    }
                }
            }
            console.log(topDirName)
            console.log(topDirName.substr(17))
            res.set('Content-type', 'text/plain')
            zipFolder(topDirName, topDirName+'.zip', function(err) {
                if(err) {
                    res.send('public/PersonalCompetence/PersonalCompetenceFile.hwp')
                } else {
                    res.send(topDirName.substr(10)+'.zip')
                }
            });

        });
    });
};


exports.getPastListPage = (req, res) => {
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
        var query = "select ads.prj_year, ads.prj_semes, ads.term_chk, ads.transfer_date from admin_settings as ads ";
        query += " where ads.transfer_date is not null"
        query += " order by prj_year desc, prj_semes desc; "

        query += "select distinct p.prj_id, ads.prj_year, ads.prj_semes, ads.term_chk, ads.transfer_date, p.prj_name, p.prj_id, ct_me.cnt as mentor_cnt, t.team_name, ";
        query += "t.class_num, ins.major, ins.inst_name, me.company_name, me.mentor_name, me.phone_num ";
        query += "from admin_settings as ads, project as p ";
        query += "left outer join (select count(*) as cnt, mr.prj_id from mentoring_report as mr, project as p1 where mr.prj_id = p1.prj_id group by p1.prj_id) as ct_me on p.prj_id = ct_me.prj_id ";
        query += "left outer join (select t.team_name, t.class_num, t.prj_id from team as t, project as p2 where t.prj_id = p2.prj_id group by p2.prj_id) as t on p.prj_id = t.prj_id ";
        query += "left outer join (select ins.inst_name, ins.inst_id, ins.major, ci.class_num from instructor as ins, class_info as ci where ins.inst_id = ci.inst_id) as ins on t.class_num = ins.class_num ";
        query += "left outer join (select me.mentor_id, me.company_name , me.mentor_name, me.phone_num from mentor as me, project as p3 where p3.mentor_id = me.mentor_id ) as me on p.mentor_id = me.mentor_id ";
        query += "where ads.settings_id = p.settings_id and p.use_yn = 0 ";
        query += "order by prj_year desc, prj_semes desc;";

        connection.query(query, null, (error, results, fields) => {
            connection.release();

            if(error) { //throw error;
                console.error('query error : ' + error);
                return;
            }

            //use results and fields
            res.render('setting/DGU901', {PastList: results, userId: req.session.userId, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment});
        });

    });
};

exports.getMovingListPage = (req, res) => {
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
    var query = "select settings_id,prj_year, prj_semes, term_chk, DATE_FORMAT(transfer_date,\"%Y-%m-%d %T\") as transfer_date from admin_settings ";
    query += " order by settings_id desc;"

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      res.render('setting/DGU902', {SemesList: results, userId: req.session.userId, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment});
    });
  });
};

exports.getSearchproject1 = (req,res)=>{
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
    var query = "";

    query += "select p.prj_name, t.team_name, t.prj_id, sti.*, st.major, st.email_ad, st.std_name, st.phone_num from project as p, team as t, std_team_info as sti, student as st";
    query += " where p.use_yn = 0 and t.prj_id = p.prj_id and sti.team_id = t.team_id and p.prj_id = " + req.params.PJId + " and st.std_id = sti.std_id";
    query += " order by p.prj_id;";

    query += "select m.* from mentoring_report as m";
    query += " where m.prj_id = "+ req.params.PJId+"; ";

    query += "select t.*, ad.mentoring_limit,p.settings_id from team as t, admin_settings as ad, project as p";
    query += " where t.prj_id = "+ req.params.PJId+" and p.prj_id = t.prj_id and p.settings_id = ad.settings_id; ";

    query += "select prj_plan_report from project_plan_report";
    query += " where prj_id = "+ req.params.PJId+"; ";

    query += "select f.*,t.* from final_product as f, team as t";
    query += " where f.prj_id = " + req.params.PJId + " and t.team_id = f.team_id; " ;

    query += "select p.*, m.* from project as p, mentor as m";
    query += " where p.prj_id = '" + req.params.PJId + "' and p.mentor_id = m.mentor_id ;";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      // console.log(results);

      //use results and fields
      res.render('setting/DGU903', {PJList: results, userId: req.session.userId, userType: req.session.userType,userInfo: req.session.userInfo, moment: moment, curDate: new Date()});

    });
  });
};


exports.transferSemester = (req,res)=>{
    //session check
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }


    var semes_id = req.body['semes_id']
    var query_temp = '(';
    for(var id in semes_id){
      if(id!=semes_id.length-1){
          query_temp+=semes_id[id]+','
      }else {
          query_temp += semes_id[id]
      }
    }
    query_temp+=')'
    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
        if(err) { //throw err;
            console.error('getConnection err : ' + err);
            return;
        }

        //use connection
        var query = `update admin_settings set transfer_date=now() where settings_id in ${query_temp};`;
        query+= `update admin_settings set use_yn=0 where settings_id in ${query_temp};`;
        query+= `update project set use_yn=0 where settings_id in ${query_temp};`;
        query+= `update team set use_yn=0 where settings_id in ${query_temp};`;
        query+= `update class_info set use_yn=0 where settings_id in ${query_temp};`;
        query+= `update project_cart set use_yn = 0 where team_id in (select team_id from team where use_yn=0);`;

        // console.log(query);
        connection.query(query, null, (error, results, fields) => {
            connection.release();

            if(error) { //throw error;
                console.error('query error : ' + error);
                return;
            }

            //use results and fields
            res.redirect('/');
        });
    });
};
exports.transferCancelSemester = (req,res)=>{
    //session check
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }

    var semes_id = req.body['semes_id']
    var query_temp = '(';
    for(var id in semes_id){
        if(id!=semes_id.length-1){
            query_temp+=semes_id[id]+','
        }else {
            query_temp += semes_id[id]
        }
    }
    query_temp+=')'
    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
        if(err) { //throw err;
            console.error('getConnection err : ' + err);
            return;
        }

        //use connection
        var query = `update admin_settings set transfer_date=NULL where settings_id in ${query_temp};`;
        query+= `update admin_settings set use_yn=1 where settings_id in ${query_temp};`;
        query+= `update project set use_yn=1 where settings_id in ${query_temp};`;
        query+= `update team set use_yn=1 where settings_id in ${query_temp};`;
        query+= `update class_info set use_yn=1 where settings_id in ${query_temp};`;
        query+= `update project_cart set use_yn=1 where team_id in (select team_id from team where use_yn=0);`;
        // console.log(query);
        connection.query(query, null, (error, results, fields) => {
            connection.release();

            if(error) { //throw error;
                console.error('query error : ' + error);
                return;
            }

            //use results and fields
            res.redirect('/');
        });
    });
};


exports.getSettingListPage = (req, res) => {
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
    var query = "select * from admin_settings ";
    query += " order by settings_id desc;"

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      res.render('setting/semes_list', {SemesList: results, userId: req.session.userId, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment});
    });
  });
};

exports.getEditSettings = (req, res) => {
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

    var query = "select * from admin_settings";
    query += " where settings_id = '" + req.params.SettingsId + "' ;";
    // console.log(query);

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }


      //use results and fields
      if(results.length > 0) {
        console.log('lookup project success.');
        res.render('setting/EditSetting', {SettingInfo: results, moment : moment, userInfo: req.session.userInfo});
      } else {
        res.redirect('/');
      }
    });
  });
};

exports.postEditSettings = (req, res) => {
    //session check
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }

    var project = {

      prj_year: req.body.prj_year,
      prj_semes: req.body.prj_semes,
      term_chk : req.body.term_chk,
      strt_date : req.body.strt_date,
      cls_date : req.body.cls_date,
      prj_make_cls_date: req.body.prj_make_cls_date,
      mtch_date: req.body.mtch_date,
      prj_aply_cls_date: req.body.prj_aply_cls_date,
      mtch_cls_date: req.body.mtch_cls_date,
      mentoring_limit: req.body.mentoring_limit,
      prj_plan_ddl: req.body.prj_plan_ddl,
      prj_rpt_ddl: req.body.prj_rpt_ddl,
      prj_prst_date: req.body.prj_prst_date

    }


    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if(err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      //use connection
      var query = "update admin_settings ";
      query += " set ? ";
      query += " where settings_id = '"+req.body.settingID +"'; "

      // console.log(query);

      connection.query(query, project, (error, results, fields) => {
        connection.release();

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }
        console.log('Admin Edit Setting success.');
        res.redirect('semes_list');

      });
    });
};

exports.getSettingPage = (req, res) => {
    //session check
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }
  res.render('setting/setting', {userId: req.session.userId, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment});

};

exports.postSettingPage = (req, res) => {
    //session check
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }

    var project = {

      prj_year: req.body.prj_year,
      prj_semes: req.body.prj_semes,
      term_chk : req.body.term_chk,
      strt_date : req.body.strt_date,
      cls_date : req.body.cls_date,
      prj_make_cls_date: req.body.prj_make_cls_date,
      mtch_date: req.body.mtch_date,
      prj_aply_cls_date: req.body.prj_aply_cls_date,
      mtch_cls_date: req.body.mtch_cls_date,
      mentoring_limit: req.body.mentoring_limit,
      prj_plan_ddl: req.body.prj_plan_ddl,
      prj_rpt_ddl: req.body.prj_rpt_ddl,
      prj_prst_date: req.body.prj_prst_date

    }


    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if(err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      //use connection
      var query = "insert into admin_settings ";
      query += " set ?";

      connection.query(query, project, (error, results, fields) => {
        connection.release();

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }
        console.log('Admin Setting success.');
        res.redirect('/');

      });
    });
};

exports.postDeleteSetting = (req, res) =>{

    if(!req.session.userId) {
      console.log('do not have a session.');
      res.redirect('/');
      return;
   }else{
        logger.putLog(req);
    }

    var query = "";
    query +="delete from admin_settings where settings_id = '" +req.body.settingID+"' ; " ;

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

        console.log('delete Setting success.');
        res.redirect('/setting/semes_list');

      });
    });
};

exports.getClassListPage = (req, res) => {
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
    var query = "select s.settings_id, s.prj_year, s.prj_semes, s.term_chk, c.class_num, c.class_name, i.major, i.inst_name ";
    query += " from class_info as c, instructor as i, admin_settings as s "
    query += "where c.inst_id = i.inst_id and c.settings_id = s.settings_id "
    query += "and (prj_year = DATE_FORMAT(now(), '%Y') or (prj_year = DATE_FORMAT(now(), '%Y')-1 and prj_semes = \"2학기\" and term_chk like \"%장%\")) ; ";

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      res.render('setting/class_list', {ClassList: results, userId: req.session.userId, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment});
    });
  });
};

exports.getAddClassPage = (req, res) => {
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
    var query1 = "select s.settings_id, s.prj_year, s.prj_semes, s.term_chk from admin_settings as s ";
      query1 += "where (s.prj_year = DATE_FORMAT(now(), '%Y') or (s.prj_year = DATE_FORMAT(now(), '%Y')-1 and s.prj_semes = \"2학기\" and s.term_chk like \"%장%\")) ";
      query1 += " order by settings_id desc; "

    query1 += "select i.inst_id, i.inst_name, i.major from instructor as i ";
    query1 += " order by major desc ; ";

    query1 += "select assis_id, assis_name from assistant ;" ;

    connection.query(query1, null, (error, results1, fields) => {

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      connection.release();
      //use results and fields
      res.render('setting/AddClass', {SettingInstList: results1, userId: req.session.userId, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment});
    });
  });
};

exports.postAddClassPage = (req, res) => {
    //session check
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }

    var Class_num= req.body.Classnum;

    var query ="";

    for (var i=0; i<=Class_num; i++){
      if (i==1){
        var settings_id= req.body.settings_id1;
        var class_num = req.body.class_num1;
        var class_name = req.body.class_name1;
        var inst_id = req.body.inst_id1;
        var assis_id = req.body.assis_id1;
      }else if (i==2){
        var settings_id= req.body.settings_id2;
        var class_num = req.body.class_num2;
        var class_name = req.body.class_name2;
        var inst_id = req.body.inst_id2;
        var assis_id = req.body.assis_id2;
      } else if (i==3){
        var settings_id= req.body.settings_id3;
        var class_num = req.body.class_num3;
        var class_name = req.body.class_name3;
        var inst_id = req.body.inst_id3;
        var assis_id = req.body.assis_id3;
      } else if (i==4){
        var settings_id= req.body.settings_id4;
        var class_num = req.body.class_num4;
        var class_name = req.body.class_name4;
        var inst_id = req.body.inst_id4;
        var assis_id = req.body.assis_id4;
      } else if (i==5){
        var settings_id= req.body.settings_id5;
        var class_num = req.body.class_num5;
        var class_name = req.body.class_name5;
        var inst_id = req.body.inst_id5;
        var assis_id = req.body.assis_id5;
      } else if (i==6){
        var settings_id= req.body.settings_id6;
        var class_num = req.body.class_num6;
        var class_name = req.body.class_name6;
        var inst_id = req.body.inst_id6;
        var assis_id = req.body.assis_id6;
      } else if (i==7){
        var settings_id= req.body.settings_id7;
        var class_num = req.body.class_num7;
        var class_name = req.body.class_name7;
        var inst_id = req.body.inst_id7;
        var assis_id = req.body.assis_id7;
      } else if (i==8){
        var settings_id= req.body.settings_id8;
        var class_num = req.body.class_num8;
        var class_name = req.body.class_name8;
        var inst_id = req.body.inst_id8;
        var assis_id = req.body.assis_id8;
      } else if (i==9){
        var settings_id= req.body.settings_id9;
        var class_num = req.body.class_num9;
        var class_name = req.body.class_name9;
        var inst_id = req.body.inst_id9;
        var assis_id = req.body.assis_id9;
      } else if (i==0){
        var settings_id= req.body.settings_id0;
        var class_num = req.body.class_num0;
        var class_name = req.body.class_name0;
        var inst_id = req.body.inst_id0;
        var assis_id = req.body.assis_id0;
      }

      query += "insert into class_info (settings_id, class_num, class_name, inst_id, assis_id,  registrant, regis_date, amender, amend_date) ";
      query += "values ('"+settings_id+"', '"+class_num+"','"+class_name+"', '"+inst_id+"','"+assis_id+"','";
      query += req.session.userId+ "', '"+moment(Date()).format('YYYY-MM-DD hh:mm:ss') +"', '"+ req.session.userId +"', '"+moment(Date()).format('YYYY-MM-DD hh:mm:ss') +"'); ";

    }
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

          console.log('ClassInfo Register success.');
          res.redirect('class_list');

        });
      });
  };


exports.getEditClass = (req, res) => {

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

      var query = "Select adse.prj_year, adse.prj_semes, adse.term_chk, c.settings_id, c.class_num, c.class_name, c.inst_id, i.inst_name, i.major, c.assis_id, a.assis_name "
        query += "From class_info c ";
        query += "LEFT JOIN admin_settings as adse ON c.settings_id = adse.settings_id ";
        query += "LEFT JOIN instructor as i ON i.inst_id = c.inst_id ";
        query += "LEFT JOIN assistant as a ON a.assis_id = c.assis_id ";
        query += "WHERE c.class_num = '" + req.params.classnum + "' AND c.settings_id = '" + req.params.settings_id +"';";

      query += "select s.settings_id, s.prj_year, s.prj_semes, s.term_chk from admin_settings as s ";
      query += " order by settings_id desc; ";

      query += "select i.inst_id, i.inst_name, i.major from instructor as i ";
      query += " order by major desc ; ";

      query += "select assis_id, assis_name from assistant ;";





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
          console.log(results);
          res.render('setting/EditClass', {ClassInfo: results, moment : moment, userInfo: req.session.userInfo, ClassInformation: results[0]});
        } else {
          res.redirect('/');
        }
      });
    });
};

exports.postEditClass = (req, res) => {

    //session check
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }

  var project = {
    settings_id :req.body.Settings_id,
    class_num :req.body.class_num,
    class_name :req.body.class_name,
    inst_id:req.body.inst_id,
    assis_id:req.body.assis_id,
    amender:req.session.userInfo.userId,
    amend_date:moment(Date()).format('YYYY-MM-DD hh:mm:ss')
  };

    console.log(project);

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    //use connection
    var query = "update class_info ";
    query += " set ? ";
    query += " where class_num = '" + req.body.originClassNum + "' and settings_id = '" + req.body.originSettingsId + "'; " ;

    console.log("postEditClass: ", query);

    connection.query(query, project, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      console.log('Admin Edit Class success.');
      res.redirect('class_list');

    });
  });
};

exports.getCancelEdit = (req, res) => {
      //session check
      if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
      }else{
          logger.putLog(req);
      }
      res.redirect('/setting/class_list');
};

exports.getAgmtPage = (req, res) => {
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

    var query = "select * from agmt; " ;

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      console.log('lookup project success.');
      // console.log(results);
      res.render('setting/Agmt' , {AgmtList: results, userId: req.session.userId, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment});

    });
  });
};

exports.postAgmt = (req, res) => {
    //session check
    if(!req.session.userId) {
        console.log('do not have a session.');
        res.redirect('/');
        return;
    }else{
        logger.putLog(req);
    }
    var project = {
      join: req.body.join,
      fin_agmt: req.body.fin_agmt,
      manual_agmt: req.body.manual_agmt,
      demo_agmt: req.body.demo_agmt,
      patent_agmt: req.body.patent_agmt,
      prg_agmt: req.body.prg_agmt,
      thesis_agmt: req.body.thesis_agmt,
      ect_agmt: req.body.ect_agmt,

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
      var query = "update agmt";
      query += " set ? ";

      connection.query(query, project, (error, results, fields) => {
        connection.release();

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }
        console.log('Register success.');
        res.redirect('Agmt');

      });
    });
};

exports.getEval = (req,res)=>{
    logger.putLog(req);
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    var query = "select eval_url_mtr, eval_url_std from apdx_file_info";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }


      //use results and fields
      if(results.length > 0) {
        console.log('Access Evaluation page');
        res.render('setting/surveylink', {EvalInfo: results, moment : moment, userInfo: req.session.userInfo});
      } else {
        res.redirect('/');
      }
    });
  });
};
exports.postEvalLink = (req, res) => {

  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  var evals = {
    eval_url_std : req.body.std_eval_link,
    eval_url_mtr : req.body.mtr_eval_link,
    amender : req.session.userId,
    amend_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss')
  }
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    //use connection
    var query = "update apdx_file_info ";
    query += " set ? ";

    connection.query(query, evals, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      console.log('Editing EvalInfo success.');
      res.redirect('/setting/surveylink');

    });
  });
};

exports.getSample = (req,res)=>{
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
    var query = "select * from apdx_file_info";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      //use results and field
      if(results.length > 0) {
        console.log('Managing Report Sample Page');
        res.render('setting/ReportSample', {apdxInfo: results, moment : moment, userInfo: req.session.userInfo});
      } else {
        res.redirect('/');
      }
    });
  });

};
exports.postSample = (req,res)=>{
  logger.putLog(req);
  var fileInfo = {
    path: 'public/ReportSample/',
    namePrefix: 'SMP',
    viewNames: ['PrjAply','TopicSgst','MtrReport','FinReport','PatentDoc','IvtAply','IvtAgrmt','PrjPlan','PrgRegis','Usermanul']
  };
  fileUpload(fileInfo).multipartForm(req, res, (err) => {
    if(err) {
      console.log('file upload error : ' + err);
      return;
    }
    if(!req.session.userId) {
      console.log('do not have a session.');
      res.redirect('/');
      return;
    }
    var apdx_file_info = {
      amender : req.session.userId,
      amend_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
      registrant : req.session.userId,
      regis_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss')
    };
    if(req.files['PrjAply'] !== undefined) {
      apdx_file_info.prj_aply_apdx = req.files['PrjAply'][0].path;
      console.log("Project Apply Sample file upload success."+req.files['PrjAply'][0].path);
    }
    if(req.files['TopicSgst'] !== undefined) {
      apdx_file_info.topic_sgst_apdx = req.files['TopicSgst'][0].path;
      console.log("Topic Sample file upload success.");
    }
    if(req.files['PrjPlan'] !== undefined) {
      apdx_file_info.prj_plan_apdx = req.files['PrjPlan'][0].path;
      console.log("Project Plan Sample file upload success.");
    }
    if(req.files['MtrReport'] !== undefined) {
      apdx_file_info.mtr_report_apdx = req.files['MtrReport'][0].path;
      console.log("Mentoring Report Sample file upload success.");
    }
    if(req.files['FinReport'] !== undefined) {
      apdx_file_info.fin_report_apdx = req.files['FinReport'][0].path;
      console.log("Final Report Sample file upload success.");
    }
    if(req.files['PatentDoc'] !== undefined) {
      apdx_file_info.patent_doc_apdx = req.files['PatentDoc'][0].path;
      console.log("Patent Document Sample file upload success.");
    }
    if(req.files['PrgRegis'] !== undefined) {
      apdx_file_info.prg_regis_apdx = req.files['PrgRegis'][0].path;
      console.log("Program Register Sample file upload success.");
    }
    if(req.files['IvtAply'] !== undefined) {
      apdx_file_info.ivt_aply_apdx = req.files['IvtAply'][0].path;
      console.log("Invention Apply Sample file upload success.");
    }
    if(req.files['IvtAgrmt'] !== undefined) {
      apdx_file_info.ivt_agrmt_apdx = req.files['IvtAgrmt'][0].path;
      console.log("Invention Agreement Sample file upload success.");
    }
    if(req.files['Usermanul'] !== undefined) {
      apdx_file_info.user_manual = req.files['Usermanul'][0].path;
      console.log("User Manual Sample file upload success.");
    }
    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if(err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      var query = "update apdx_file_info ";
      query += " set ?";
      query += " where use_yn = 1";

      //use connection
      connection.query(query, apdx_file_info, (error, results, fields) => {
        connection.release();

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }

        console.log('Report Samples Editted.');
        res.redirect('/setting/ReportSample');
      });
    });

  });

};

exports.getNotice = (req,res)=>{
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
    var query = "select * from main_notice where use_yn = 1";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }
      //use results and field
      if(results.length > 0) {
        console.log('Main Notice Page');
        res.render('setting/MainNotice', {MainInfo: results, moment : moment, userInfo: req.session.userInfo});
      } else {
        res.redirect('/');
      }
    });
  });

};
exports.postNotice = (req,res)=>{
  logger.putLog(req);

  var fileInfo = {
    path: 'public/MainImage/',
    namePrefix: 'IMG',
    viewNames: ['Image1','Image2','Image3','Image4','Image5']
  };
  fileUpload(fileInfo).multipartForm(req, res, (err) => {
    if(err) {
      console.log('file upload error : ' + err);
      return;
    }
    if(!req.session.userId) {
      console.log('do not have a session.');
      res.redirect('/');
      return;
    }
    var main_notice = {
      amender : req.session.userId,
      amend_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
      registrant : req.session.userId,
      regis_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss')
    };
    var query = "";
    if(req.params.formtype == 'image1') {
      query += "update main_notice set image1 = '" + req.files['Image1'][0].path+ "'";
      query += " where use_yn = 1";
    }
    if(req.params.formtype == 'image2') {
      query += "update main_notice set image2 = '" + req.files['Image2'][0].path+ "'";
      query += " where use_yn = 1";
    }
    if(req.params.formtype == 'image3') {
      query += "update main_notice set image3 = '" + req.files['Image3'][0].path+ "'";
      query += " where use_yn = 1";
    }
    if(req.params.formtype == 'image4') {
      query += "update main_notice set image4 = '" + req.files['Image4'][0].path+ "'";
      query += " where use_yn = 1";
    }
    if(req.params.formtype == 'image5') {
      query += "update main_notice set image5 = '" + req.files['Image5'][0].path+ "'";
      query += " where use_yn = 1";
    }

    if(req.files['Image1'] !== undefined) {
      main_notice.image1 = req.files['Image1'][0].path;
      console.log("Image1 file upload success."+req.files['Image1'][0].path);
    }
    if(req.files['Image2'] !== undefined) {
      main_notice.image2 = req.files['Image2'][0].path;
      console.log("Image2 file upload success."+req.files['Image2'][0].path);
    }
    if(req.files['Image3'] !== undefined) {
      main_notice.image3 = req.files['Image3'][0].path;
      console.log("Image3 file upload success."+req.files['Image3'][0].path);
    }
    if(req.files['Image4'] !== undefined) {
      main_notice.image4 = req.files['Image4'][0].path;
      console.log("Image4 file upload success."+req.files['Image4'][0].path);
    }
    if(req.files['Image5'] !== undefined) {
      main_notice.image5 = req.files['Image5'][0].path;
      console.log("Image5 file upload success."+req.files['Image5'][0].path);
    }
    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if(err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      //use connection
      connection.query(query, main_notice, (error, results, fields) => {
        connection.release();

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }

        console.log('Mainpage Images Editted.');
        res.redirect('/setting/MainNotice');
      });
    });

  });

};
exports.deleteImage = (req,res)=>{
  if(!req.session.userId) {
    console.log('do not have a session.');
    res.redirect('/');
    return;
  }else{
      logger.putLog(req);
  }

  var main_notice = {
    amender : req.session.userId,
    amend_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss')
  };

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if(err) { //throw err;
      console.error('getConnection err : ' + err);
      return;
    }

    var query = "update main_notice";
    query += " set "+req.params.formtype+"=null";
    query += " where use_yn = 1";
    // console.log(query);
    //use connection
    connection.query(query, main_notice, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      console.log('Mainpage Image Deleted.');
      res.redirect('/setting/MainNotice');
    });
  });


};
