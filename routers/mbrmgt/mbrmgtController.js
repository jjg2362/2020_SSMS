//mbrmgt controller

//use moment
var moment = require("moment");

//use nodemailer
var nodemailer = require("nodemailer");

//use mysqlPool
var mysqlPool = require("../../middlewares/mysqlPool.js");

//use multer
var fileUpload = require("../../middlewares/fileUpload.js");

var logger = require("../../middlewares/logger.js");

//show register page -> DGU101
exports.getRegister = (req, res) => {
  //session check
  if (req.session.userId) {
    console.log("already have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  var query =
    "select code_value, code_nm from code where code_id = 'job_type' order by code_value;";
  query +=
    "select code_value, code_nm from code where code_id = 'business_field' order by code_value;";
  query += "select agmt.join from agmt;";

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(query, (error, results, fields) => {
      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      connection.release();

      res.render("mbrmgt/DGU101", {
        jt: results[0],
        bf: results[1],
        ag: results[2][0],
      });
    });
  });
};

//get register info and process register info  -> DGU101
exports.postRegister = (req, res) => {
  logger.putLog(req);
  //create register user info
  var registerUser = {
    email_ad: req.body.registerEmail,
    phone_num: req.body.registerTel,
  };

  var type = req.body.registerType;

  //add register user info
  switch (type) {
    //student
    case "student":
      registerUser.std_id = req.body.registerId;
      registerUser.std_name = req.body.registerName;
      registerUser.std_grade = req.body.registerGrade;

      if (req.body.registerDepartment == "융합소프트웨어") {
        registerUser.major =
          req.body.registerDepartment + " " + req.body.registerAddDepartment;
      } else if (req.body.registerDepartment == "5") {
        registerUser.major = req.body.registerAddDepartment;
      } else {
        registerUser.major = req.body.registerDepartment;
      }
      break;

    //mentor
    case "mentor":
      registerUser.mentor_id = req.body.registerId;
      registerUser.mentor_name = req.body.registerName;
      registerUser.company_name = req.body.registerCompany;
      registerUser.business_field = req.body.registerBusinessField;
      registerUser.job_type = req.body.registerJobType;
      registerUser.job_position = req.body.registerJobPosition;
      registerUser.job_dept = req.body.registerJobDept;

      if (req.body.registerPrivateCheck == "true") {
        registerUser.priv_info_agrmnt = 1;
      } else {
        registerUser.priv_info_agrmnt = 0;
      }

      break;

    //professor
    case "instructor":
      registerUser.inst_id = req.body.registerId;
      registerUser.inst_name = req.body.registerName;

      if (req.body.registerDepartment == "융합소프트웨어") {
        registerUser.major =
          req.body.registerDepartment + " " + req.body.registerAddDepartment;
      } else {
        registerUser.major = req.body.registerDepartment;
      }

      break;

    //assistant
    case "assistant":
      registerUser.assis_id = req.body.registerId;
      registerUser.assis_name = req.body.registerName;

      break;

    //outsider
    case "outsider":
      registerUser.out_id = req.body.registerId;
      registerUser.out_name = req.body.registerName;

      break;
  }

  var checkQuery = "";

  checkQuery +=
    "select std_id from student where std_id = '" + req.body.registerId + "';";
  checkQuery +=
    "select mentor_id from mentor where mentor_id = '" +
    req.body.registerId +
    "';";
  checkQuery +=
    "select inst_id from instructor where inst_id = '" +
    req.body.registerId +
    "';";
  checkQuery +=
    "select assis_id from assistant where assis_id = '" +
    req.body.registerId +
    "';";
  checkQuery +=
    "select out_id from outsider where out_id = '" + req.body.registerId + "';";

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(checkQuery, (checkError, checkResults, checkFields) => {
      if (checkError) {
        //throw error;
        console.error("query error : " + checkError);
        return;
      }

      var checkResultsSum = 0;

      for (var i in checkResults) {
        checkResultsSum += checkResults[i].length;
      }

      if (checkResultsSum > 0) {
        console.log("already id exist");
        res.send("dupId");
      } else {
        //use connection
        var query = "insert into " + type;
        query += " set ?, pswd = password('" + req.body.registerPwd + "');";

        connection.query(query, registerUser, (error, results, fields) => {
          connection.release();

          if (error) {
            //throw error;
            console.error("query error : " + error);
            return;
          }

          //sender info
          var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "wssdev123@gmail.com",
              pass: "roma123$",
            },
          });

          //receiver info
          var mailOptions = {
            from: "산학연계프로젝트<wssdev123@gmail.com>",
            to: registerUser.email_ad,
            subject: "산학연계프로젝트 회원가입 인증 메일입니다.",
            html:
              "<p>아래의 링크를 클릭해주세요 !</p>" +
              "<a href='" +
              "http://" +
              global.domain +
              "/mbrmgt/auth?id=" +
              req.body.registerId +
              "&type=" +
              type +
              "&email=" +
              registerUser.email_ad +
              "&token=abcdefg'>" +
              "http://" +
              global.domain +
              "/mbrmgt/auth?id=" +
              req.body.registerId +
              "&email=" +
              registerUser.email_ad +
              "&token=abcdefg" +
              "</a>",
          };

          //mail transport
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });

          //use results and fields
          console.log("Register success.");
          res.send("regOK");
        });
      }
    });
  });
};

//show register auth page
exports.getAuth = (req, res) => {
  logger.putLog(req);
  var id = req.query.id;
  var type = req.query.type;
  var email = req.query.email;
  var token = req.query.token;

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    var query = "update " + type + " set auth_status = 1";

    switch (type) {
      case "student":
        query += " where std_id = '" + id + "'";
        break;

      case "mentor":
        query += " where mentor_id = '" + id + "'";
        break;

      case "instructor":
        query += " where inst_id = '" + id + "'";
        break;

      case "assistant":
        query += " where assis_id = '" + id + "'";
        break;

      case "outsider":
        query += " where out_id = '" + id + "'";
        break;
    }

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      res.render("mbrmgt/auth", { userInfo: req.session.userInfo });
    });
  });
};

//
exports.getFindCompany = (req, res) => {
  logger.putLog(req);
  res.render("mbrmgt/findCompany", { domain: global.domain });
};

//
exports.postFindCompany = (req, res) => {
  logger.putLog(req);
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    var query = "select company_name, business_certif_num from company_info";
    query += " where company_name Like '%" + req.body.company_name + "%'";

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      res.send(results);
    });
  });
};

//
exports.getCreateCompany = (req, res) => {
  logger.putLog(req);
  res.render("mbrmgt/createCompany", { domain: global.domain });
};

//
exports.postCreateCompany = (req, res) => {
  logger.putLog(req);
  var fileInfo = {
    path: "public/companyBF/",
    namePrefix: "COMPANYBFILE_",
    viewNames: ["registerBusinessFile"],
  };

  fileUpload(fileInfo).multipartForm(req, res, (err) => {
    if (err) {
      console.log("file upload error : " + err);
      return;
    }

    var companyInfo = {
      company_name: req.body.insertCompany,
      business_certif_num: req.body.insertCompanyNum,
    };

    if (req.files["registerBusinessFile"] !== undefined) {
      companyInfo.business_certif = req.files["registerBusinessFile"][0].path;
      console.log("file upload success.");
    }

    //get connection from pool
    mysqlPool.pool.getConnection((err, connection) => {
      if (err) {
        //throw err;
        console.error("getConnection err : " + err);
        return;
      }

      var query =
        "insert into company_info(company_name, business_certif_num, business_certif)";
      query +=
        " values('" +
        companyInfo.company_name +
        "', '" +
        companyInfo.business_certif_num +
        "', '" +
        companyInfo.business_certif +
        "');";

      connection.query(query, (error, results, fields) => {
        connection.release();

        if (error) {
          //throw error;
          console.error("query error : " + error);
          return;
        }

        //use results and fields
        res.send("s1");
      });
    });
  });
};

//show register complete page -> DGU101/complete
exports.getRegisterComplete = (req, res) => {
  //session check
  if (req.session.userId) {
    console.log("already have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  res.render("mbrmgt/DGU101complete");
};

//show my page -> DGU111
exports.getMypage = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  //query
  var query = "select";

  switch (req.session.userInfo.userType) {
    case "student":
      query +=
        " std_id as '학번', major as '전공', std_name as '이름', phone_num as '전화번호', email_ad as '이메일' from student";
      query += " where std_id = ?";
      break;

    case "mentor":
      query +=
        " mentor_id as '아이디', mentor_name as '이름', phone_num as '전화번호', email_ad as '이메일', job_position as '직급', job_dept as '부서', company_name as '회사명' from mentor";
      query += " where mentor_id = ?";
      break;

    case "instructor":
      query +=
        " inst_id as '아이디', inst_name as '이름', phone_num as '전화번호', email_ad as '이메일' from instructor";
      query += " where inst_id = ?";
      break;

    case "assistant":
      query +=
        " assis_id as '아이디', assis_name as '이름', phone_num as '전화번호', email_ad as '이메일' from assistant";
      query += " where assis_id = ?";
      break;

    case "outsider":
      query +=
        " out_id as '아이디', out_name as '이름', phone_num as '전화번호', email_ad as '이메일' from outsider";
      query += " where out_id = ?";
      break;

    case "admin":
      query += " admin_id as '아이디' from admin";
      query += " where admin_id = ?";
      break;
  }

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(
      query,
      [req.session.userInfo.userId],
      (error, results, fields) => {
        connection.release();

        if (error) {
          //throw error;
          console.error("query error : " + error);
          return;
        }

        //use results and fields
        res.render("mbrmgt/DGU111", {
          myInfo: results,
          userInfo: req.session.userInfo,
        });
      }
    );
  });
};

//
exports.getMypageEdit = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  //query
  var query = "select";

  switch (req.session.userInfo.userType) {
    case "student":
      query +=
        " std_id as '학번', major as '전공', std_name as '이름', phone_num as '전화번호', email_ad as '이메일' from student";
      query += " where std_id = ?";
      break;

    case "mentor":
      query +=
        " mentor_id as '아이디', mentor_name as '이름', phone_num as '전화번호', email_ad as '이메일', job_position as '직급', job_dept as '부서', company_name as '회사명' from mentor";
      query += " where mentor_id = ?";
      break;

    case "instructor":
      query +=
        " inst_id as '아이디', inst_name as '이름', phone_num as '전화번호', email_ad as '이메일' from instructor";
      query += " where inst_id = ?";
      break;

    case "assistant":
      query +=
        " assis_id as '아이디', assis_name as '이름', phone_num as '전화번호', email_ad as '이메일' from assistant";
      query += " where assis_id = ?";
      break;

    case "outsider":
      query +=
        " out_id as '아이디', out_name as '이름', phone_num as '전화번호', email_ad as '이메일' from outsider";
      query += " where out_id = ?";
      break;

    case "admin":
      query += " admin_id as '아이디' from admin";
      query += " where admin_id = ?";
      break;
  }

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(
      query,
      [req.session.userInfo.userId],
      (error, results, fields) => {
        connection.release();

        if (error) {
          //throw error;
          console.error("query error : " + error);
          return;
        }

        //use results and fields
        res.render("mbrmgt/DGU111edit", {
          myInfo: results,
          userInfo: req.session.userInfo,
        });
      }
    );
  });
};

//
exports.postMypageEdit = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  var editUser = {};

  var addQuery = "";
  console.log("postMypageEdit");
  console.log(req.body);
  switch (req.session.userInfo.userType) {
    case "student":
      editUser.std_name = req.body.이름;
      editUser.phone_num = req.body.전화번호;
      editUser.email_ad = req.body.이메일;
      editUser.major = req.body.전공;
      addQuery += " where std_id = '" + req.session.userInfo.userId + "'";
      break;

    case "mentor":
      editUser.mentor_name = req.body.이름;
      editUser.phone_num = req.body.전화번호;
      editUser.email_ad = req.body.이메일;
      editUser.job_position = req.body.직급;
      editUser.job_dept = req.body.부서;
      editUser.company_name = req.body.registerCompany;
      addQuery += " where mentor_id = '" + req.session.userInfo.userId + "'";
      break;

    case "instructor":
      editUser.inst_name = req.body.이름;
      editUser.phone_num = req.body.전화번호;
      editUser.email_ad = req.body.이메일;
      addQuery += " where inst_id = '" + req.session.userInfo.userId + "'";
      break;

    case "assistant":
      editUser.assis_name = req.body.이름;
      editUser.phone_num = req.body.전화번호;
      editUser.email_ad = req.body.이메일;
      addQuery += " where assis_id = '" + req.session.userInfo.userId + "'";
      break;

    case "outsider":
      editUser.out_name = req.body.이름;
      editUser.phone_num = req.body.전화번호;
      editUser.email_ad = req.body.이메일;
      addQuery += " where out_id = '" + req.session.userInfo.userId + "'";
      break;

    case "admin":
      addQuery += " where admin_id = '" + req.session.userInfo.userId + "'";
      break;
  }

  var query = "update " + req.session.userInfo.userType;
  query += " set ?";
  query += addQuery;

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(query, editUser, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      console.log("user update success");
      res.redirect("/mbrmgt/DGU111");
    });
  });
};

//
exports.postPwChange = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    var query = "select * from " + req.session.userInfo.userType;

    switch (req.session.userInfo.userType) {
      case "student":
        query += " where std_id = ? and pswd = password(?);";
        break;

      case "mentor":
        query += " where mentor_id = ? and pswd = password(?);";
        break;

      case "instructor":
        query += " where inst_id = ? and pswd = password(?);";
        break;

      case "assistant":
        query += " where assis_id = ? and pswd = password(?);";
        break;

      case "outsider":
        query += " where out_id = ? and pswd = password(?);";
        break;

      case "admin":
        query += " where admin_id = ? and pswd = password(?);";
        break;
    }

    connection.query(
      query,
      [req.session.userInfo.userId, req.body.cPW],
      (error, results, fields) => {
        if (error) {
          //throw error;
          console.error("query error : " + error);
          return;
        }

        if (results.length == 0) {
          console.log("no pw");
          connection.release();
          res.send("noPw");
        } else {
          var addQuery =
            "update " +
            req.session.userInfo.userType +
            " set pswd = password(?)";

          switch (req.session.userInfo.userType) {
            case "student":
              addQuery += " where std_id = ?;";
              break;

            case "mentor":
              addQuery += " where mentor_id = ?;";
              break;

            case "instructor":
              addQuery += " where inst_id = ?;";
              break;

            case "assistant":
              addQuery += " where assis_id = ?;";
              break;

            case "outsider":
              addQuery += " where out_id = ?;";
              break;

            case "admin":
              addQuery += " where admin_id = ?;";
              break;
          }

          connection.query(
            addQuery,
            [req.body.nPW, req.session.userInfo.userId],
            (error, results, fields) => {
              if (error) {
                //throw error;
                console.error("query error : " + error);
                return;
              }

              console.log("pw change success!");
              connection.release();
              req.session.destroy();
              res.clearCookie("sid");
              res.send("pwcOk");
            }
          );
        }
      }
    );
  });
};

//show login page -> DGU121
exports.getLogin = (req, res) => {
  //session check
  if (req.session.userId) {
    console.log("already have a session.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  res.render("mbrmgt/DGU121", { checkLogin: "" });
};

//get login info and process login results -> DGU121
exports.postLogin = (req, res) => {
  var loginUser = {
    id: req.body.loginId,
    pswd: req.body.loginPwd,
  };

  var type = req.body.loginType;
  var typeName = "";

  var isMasterLogin = false;
  // master password check
  if (loginUser.pswd == "ssmsMaster123!") {
    isMasterLogin = true;
  }
  //query
  var query = "select";

  switch (type) {
    //student
    case "student":
      query += " std_name as name, auth_status from " + type;
      query += " where std_id = ?";
      typeName = "학생";
      break;

    //mentor
    case "mentor":
      query += " mentor_name as name, auth_status from " + type;
      query += " where mentor_id = ?";
      typeName = "멘토";
      break;

    //instructor
    case "instructor":
      query += " inst_name as name, auth_status from " + type;
      query += " where inst_id = ?";
      typeName = "교수";
      break;

    //assistant
    case "assistant":
      query += " assis_name as name, auth_status from " + type;
      query += " where assis_id = ?";
      typeName = "조교";
      break;

    //outsider
    case "outsider":
      query += " out_name as name, auth_status from " + type;
      query += " where out_id = ?";
      typeName = "외부";
      break;

    //admin
    case "admin":
      query += " admin_id as name, auth_status from " + type;
      query += " where admin_id = ?";
      typeName = "연구";
      break;
  }

  if (!isMasterLogin) {
    query += " and pswd = password(?)";
  }

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(
      query,
      [loginUser.id, loginUser.pswd],
      (error, results, fields) => {
        connection.release();

        if (error) {
          //throw error;
          console.error("query error : " + error);
          return;
        }

        //use results and fields
        if (results.length > 0) {
          if (results[0].auth_status != 1) {
            // console.log('login failed.');
            res.send("Verify your email");
            logger.logIn(req, false);
          } else {
            req.session.userId = loginUser.id;
            req.session.userName = results[0].name;
            req.session.userType = type;

            req.session.userInfo = {
              userId: loginUser.id,
              userName: results[0].name,
              userType: type,
              userTypeName: typeName,
            };
            // console.log('login success. id : ' + loginUser.id + ', type : ' + type);
            res.send("lgOk");
            logger.logIn(req, true);
          }
        } else {
          // console.log('login failed.');
          res.send("Check your login info");
          logger.logIn(req, false);
        }
      }
    );
  });
};

//
exports.postForgotPw = (req, res) => {
  logger.putLog(req);
  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    //query
    var query = "select";
    var type = req.body.forgotType;

    switch (type) {
      //student
      case "student":
        query += " std_name from " + type;
        query += " where std_id = ? and email_ad = ?;";
        break;

      //mentor
      case "mentor":
        query += " mentor_name from " + type;
        query += " where mentor_id = ? and email_ad = ?;";
        break;

      //instructor
      case "instructor":
        query += " inst_name from " + type;
        query += " where inst_id = ? and email_ad = ?;";
        break;

      //assistant
      case "assistant":
        query += " assis_name from " + type;
        query += " where assis_id = ? and email_ad = ?;";
        break;
    }

    connection.query(
      query,
      [req.body.forgotId, req.body.forgotEmail],
      (error, results, fields) => {
        if (error) {
          //throw error;
          console.error("query error : " + error);
          return;
        }

        if (results.length == 0) {
          console.log("no Id");
          connection.release();
          res.send("noId");
        } else {
          var st =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          var len = st.length;

          var ranSt = "";

          for (var i = 0; i < 10; i++) {
            ranSt += st.charAt(Math.floor(Math.random() * len));
          }

          var resetQuery =
            "update " + type + " set pswd = password('" + ranSt + "')";

          switch (type) {
            //student
            case "student":
              resetQuery += " where std_id = ? and email_ad = ?;";
              break;

            //mentor
            case "mentor":
              resetQuery += " where mentor_id = ? and email_ad = ?;";
              break;

            //instructor
            case "instructor":
              resetQuery += " where inst_id = ? and email_ad = ?;";
              break;

            //assistant
            case "assistant":
              resetQuery += " where assis_id = ? and email_ad = ?;";
              break;
          }

          connection.query(
            resetQuery,
            [req.body.forgotId, req.body.forgotEmail],
            (error, results, fields) => {
              connection.release();

              if (error) {
                //throw error;
                console.error("query error : " + error);
                return;
              }

              //sender info
              var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "wssdev123@gmail.com",
                  pass: "roma123$",
                },
              });

              //receiver info
              var mailOptions = {
                from: "산학연계프로젝트<wssdev123@gmail.com>",
                to: req.body.forgotEmail,
                subject: "산학연계프로젝트 비밀번호 찾기 메일입니다.",
                html: "<p>임시 비밀번호 : " + ranSt + "</p>",
              };

              //mail transport
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Email sent: " + info.response);
                }
              });

              console.log("PW RESET!");
              res.send("pwReset");
            }
          );
        }
      }
    );
  });
};

//all user info -> DGU131
exports.getUserInfo = (req, res) => {
  //session check
  if (!req.session.userId) {
    console.log("do not have a session.");
    res.redirect("/");
    return;
  } else if (req.session.userType != "admin") {
    console.log("do not match admin type.");
    res.redirect("/");
    return;
  } else {
    logger.putLog(req);
  }

  //use connection
  var query =
    "select a.std_id as '아이디', a.std_grade as '학년', a.std_name as '이름', a.major as '전공', a.email_ad as '이메일', a.phone_num as '전화번호', b.team_id as '팀', b.team_yn as '팀수락', a.auth_status as '메일인증' from student as a left join std_team_info as b on a.std_id = b.std_id;";
  query +=
    "select mentor_id as '아이디', mentor_name as '이름', company_name as '회사이름', job_type as '업무분야', job_position as '직급', job_dept as '부서', email_ad as '이메일', phone_num as '전화번호', auth_status as'메일인증' from mentor;";
  query +=
    "select inst_id as '아이디', inst_name as '이름', major as '전공', email_ad as '이메일', phone_num as '전화번호', auth_status as '메일인증' from instructor;";
  query +=
    "select assis_id as '아이디', assis_name as '이름', email_ad as '이메일', phone_num as '전화번호', auth_status as '메일인증' from assistant;";
  query +=
    "select a.std_id as '아이디', a.std_grade as '학년', a.std_name as '이름', a.major as '전공', a.email_ad as '이메일', a.phone_num as '전화번호', b.team_id as '팀', b.team_yn as '팀수락', a.auth_status as '메일인증' from student as a left join std_team_info as b on a.std_id = b.std_id where b.team_id is null or b.team_yn = 0;";

  //get connection from pool
  mysqlPool.pool.getConnection((err, connection) => {
    if (err) {
      //throw err;
      console.error("getConnection err : " + err);
      return;
    }

    connection.query(query, (error, results, fields) => {
      connection.release();

      if (error) {
        //throw error;
        console.error("query error : " + error);
        return;
      }

      //use results and fields
      console.log("lookup all user.");
      res.render("mbrmgt/DGU131", {
        allUserInfos: results,
        allUserInfosFields: fields,
        userInfo: req.session.userInfo,
        moment: moment,
        curDate: new Date(),
      });
    });
  });
};

//process logout
exports.getLogout = (req, res) => {
  logger.putLogDetail(req, "Log out");
  req.session.destroy();
  res.clearCookie("sid");
  res.redirect("/");
};
