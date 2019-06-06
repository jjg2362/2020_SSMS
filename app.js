var express = require('express');
var bodyParser = require('body-parser');
var cookieParser   = require('cookie-parser');
var session = require('express-session');
var sessionconfig = require('./config/sessionconfig.js');
//var dbconfig = require('../../config/dbconfig.js');
//var MySQLStore = require('express-mysql-session')(session);

var app = express();

//set port number
app.set('port', 80);

//set site domain
global.domain = 'ssms.dongguk.edu';

//use middlewares
//use bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//use cookieParser
app.use(cookieParser());

//set session time
var time = 1000 * 60 * 100;;
sessionconfig.cookie.expires = new Date(Date.now() + time);
sessionconfig.cookie.maxAge = time;
//set session-mysql
// sessionconfig.store = new MySQLStore(dbconfig('mysql-session').local);
//use session
app.use(session(sessionconfig));

// use view engine(ejs)
app.set("view engine", 'ejs');
app.set('views', './views');
//app.engine('html', require('ejs').renderFile);

//use public
app.use(express.static(__dirname + '/public'));

//use routers
app.use('/', require('./routers/index.js'));
app.use('/setting', require('./routers/setting/setting.js'));
app.use('/fileDownload', require('./routers/fileDownload.js'));
app.use('/pj', require('./routers/pj/pj.js'));
app.use('/mbrmgt', require('./routers/mbrmgt/mbrmgt.js'));
app.use('/teammgt', require('./routers/teammgt/teammgt.js'));
app.use('/pjmake', require('./routers/pjmake/pjmake.js'));
app.use('/pjapply', require('./routers/pjapply/pjapply.js'))
app.use('/pjmng', require('./routers/pjmng/pjmng.js'));
app.use('/eval', require('./routers/eval/eval.js'));
app.use('/msgbrd', require('./routers/msgbrd/msgbrd.js'));

// run server
app.listen(app.get('port'), () => {
  console.log('app listening on port test cicd 2' + app.get('port'));
});
