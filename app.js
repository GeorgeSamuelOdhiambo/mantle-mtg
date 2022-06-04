var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cronJob = require("./helpers/cronJob")

var indexRouter = require('./routes/index');
var imagesRouter = require('./routes/images');
var yughioRouter = require('./routes/yughio');
var yughioImgRouter = require('./routes/yughio_images');
var pokemonRouter = require('./routes/pokemon');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/', indexRouter);
app.use('/images', imagesRouter);
app.use('/yugioh', yughioRouter);
app.use('/yugioh_images', yughioImgRouter);
app.use('/pokemon', pokemonRouter);

app.listen(2020,async()=> {
    console.info("Started")
    cronJob.initCronJobs()
})
module.exports = app;
