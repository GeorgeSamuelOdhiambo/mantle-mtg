var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cronJob = require("./helpers/cronJob")
var C = require('./helpers/cardscsv')


var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/', indexRouter);

<<<<<<< HEAD
app.listen(2020,()=> {
    // D.dwnExtract()
    // C.readCardsFiles()
=======
app.listen(2020,async()=> {

    console.info("Started")
    cronJob.initCronJobs()
>>>>>>> 944ef6f83a91ed486514688156f887ed0db1d768
})
module.exports = app;
