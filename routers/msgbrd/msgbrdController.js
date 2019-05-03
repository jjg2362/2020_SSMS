//index controller

//use moment
var moment = require('moment');
//use mysql
var mysqlPool = require('../../middlewares/mysqlPool.js');
//use file uploading
var fileUpload = require('../../middlewares/fileUpload.js');

var logger = require('../../middlewares/logger.js')

exports.getPostingListPage = (req, res) => {
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
    var query = "select * from msgbrd_info ";
    query += " order by post_date desc;"

    connection.query(query, null, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }

      //use results and fields
      res.render('msgbrd/DGU701', {PostingList: results, userId: req.session.userId, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment});
    });
  });
};

exports.getShowPostingPage = (req, res) => {

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

    var query = "select * from msgbrd_info";
    query += " where posting_id = '" + req.params.PostingsId + "' ;";
    console.log(query);

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }


      //use results and fields
      if(results.length > 0) {
        // console.log('Show Posting page');
        res.render('msgbrd/DGU704', {PostingInfo: results, moment : moment, userInfo: req.session.userInfo});
      } else {
        res.redirect('/');
      }
    });
  });
};

exports.getEditPostings = (req, res) => {

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

    var query = "select * from msgbrd_info";
    query += " where posting_id = '" + req.body.PostingsId + "' ;";
    console.log(query);

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }


      //use results and fields
      if(results.length > 0) {
        // console.log('Posting Editing page');
        res.render('msgbrd/DGU703', {PostingInfo: results, moment : moment, userInfo: req.session.userInfo});
      } else {
        res.redirect('/');
      }
    });
  });
};

exports.postEditPostings = (req, res) => {
  logger.putLog(req);
  var fileInfo = {
    path: 'public/MsgBoardApdx/',
    namePrefix: 'MSGBRD',
    viewNames: ['appendix']
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

    var postings = {

      posting_id: req.body.PostingsId,
      posting_title: req.body.posting_name,
      post_content : req.body.content,
      post_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
      post_user : req.session.userId,
      amender : req.session.userId,
      amend_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss')
    }

    if(req.files['appendix'] !== undefined) {
      postings.post_apdx = req.files['appendix'][0].path;
      console.log("file upload success.");
    }
    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if(err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      //use connection
      var query = "update msgbrd_info ";
      query += " set ? ";
      query += " where posting_id = '"+req.body.PostingsId +"'; "

      console.log(query);

      connection.query(query, postings, (error, results, fields) => {
        connection.release();

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }
        // console.log('Editing Posting success.');
        res.redirect('DGU701');

      });
    });
  });
};

exports.getPostingPage = (req, res) => {
    logger.putLog(req);
  res.render('msgbrd/DGU702', {userId: req.session.userId, userType: req.session.userType, userInfo: req.session.userInfo, moment: moment});

};

exports.postPostingPage = (req, res) => {
    logger.putLog(req);
  var fileInfo = {
    path: 'public/MsgBoardApdx/',
    namePrefix: 'MSGBRD',
    viewNames: ['appendix']
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

    var postings = {

      posting_id: req.body.PostingsId,
      posting_title: req.body.posting_name,
      post_content : req.body.content,
      post_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
      post_user : req.session.userId,
      amender : req.session.userId,
      amend_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss'),
      registrant : req.session.userId,
      regis_date : moment(Date()).format('YYYY-MM-DD hh:mm:ss')

    }

    if(req.files['appendix'] !== undefined) {
      postings.post_apdx = req.files['appendix'][0].path;
      console.log('submit Posting Appendix: ' + req.files['appendix'][0].path + ', id: ' + req.session.userId);
      console.log("file upload success.");
    }
    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if(err) { //throw err;
        console.error('getConnection err : ' + err);
        return;
      }

      //use connection
      var query = "insert into msgbrd_info ";
      query += " set ?";

      connection.query(query, postings, (error, results, fields) => {
        connection.release();

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }
        console.log('Posting success.');
        res.redirect('/msgbrd/DGU701');

      });
    });
  });
};

exports.postDeletePosting = (req, res) =>{
    if(!req.session.userId) {
      console.log('do not have a session.');
      res.redirect('/');
      return;
   }else{
        logger.putLog(req);
    }

    var query = "";
    query +="delete from msgbrd_info where posting_id = '" +req.body.PostingsId+"' ; " ;

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
        console.log(query);
        console.log('delete Posting success.');
        res.redirect('/msgbrd/DGU701');

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
        res.render('msgbrd/ReportSampleBoard', {apdxInfo: results, moment : moment, userInfo: req.session.userInfo});
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