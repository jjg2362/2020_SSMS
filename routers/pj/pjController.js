//pj controller

//use mysqlPool
var mysqlPool = require('../../middlewares/mysqlPool.js');
var moment = require('moment');
var logger = require('../../middlewares/logger.js')
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

      var query = "select * from project where prj_id = '" + req.params.pjId + "';";
      query += "select * from mentor where mentor_id = (select mentor_id from project where prj_id = '" + req.params.pjId + "');";

      //use connection
      connection.query(query, (error, results, fields) => {
        connection.release();

        if(error) { //throw error;
          console.error('query error : ' + error);
          return;
        }

        // console.log("detail Pj");

        res.render('pj/detailPj', {pjInfo: results, moment : moment,userInfo: req.session.userInfo});
      });
    });
};
