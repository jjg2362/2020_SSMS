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
