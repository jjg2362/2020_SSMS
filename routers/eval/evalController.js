//use mysql
var mysqlPool = require('../../middlewares/mysqlPool.js');
//use moment
var moment = require('moment');

var logger = require('../../middlewares/logger.js')

exports.getEval = (req,res)=>{
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

    var query = "select eval_url_mtr, eval_url_std from apdx_file_info";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if(error) { //throw error;
        console.error('query error : ' + error);
        return;
      }


      //use results and fields
      if(results.length > 0) {
        logger.putLogDetail(req,'Access Evaluation page');
        res.render('eval/DGU601', {EvalInfo: results, moment : moment, userInfo: req.session.userInfo});
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
      logger.putLogDetail(req,'Editing EvalInfo success.');
      res.redirect('DGU601');

    });
  });
};
