var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session  = require('express-session')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'html');
// app.engine('.html',require('ejs').__express);

//设置模板引擎为ejs

app.set('views', path.join(__dirname, 'views'));
//运行ejs模板 __express 表示要渲染的文件扩展名
app.engine('html', require('ejs').renderFile);
app.set('view engine','html')

//上传图片大小
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb',extended:true}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/js')));
//app.use(express.static(path.join(__dirname, '/js/3rdparty')));
app.use(express.static(path.join(__dirname, '/routes')));
app.use(express.static(path.join(__dirname, '/css')));
app.use(express.static(path.join(__dirname, '/layer')));
app.use(express.static(path.join(__dirname, '/uploads/photo')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(session({
    secret: 'wxpushjohn2016', // 建议使用 128 个字符的随机字符串
    cookie: { maxAge: 60 * 1000 * 60 * 24},
    resave: true,
    saveUninitialized: true
}));





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
