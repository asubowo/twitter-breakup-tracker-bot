/**
 * This is the main application for the Twitter bot that tracks tweets supposedly about breakups in live time.
 * Granted, you'll most likely get false positive. At one point the bot ended up tracking tweets about the Bank of Canada breaking up or something along those lines.
 *
 * I'm not responsible for relationship problems as result of collected data.
 * Best served with a SQL database of your choosing, with a single column of TYPE: TIMESTAMP.
 * 
 * @author Andrew Subowo
 * @version 1.0
 */
require('dotenv').config();
const express = require('express');
const app = express();
const Pool = require('pg').Pool
const pool = new Pool({
        user: process.env.POSTGRES_USER,
        host: '/var/run/postgresql',
        database: 'breakup',
        port: 5432,
})

var async = require('async');
var date_ob = new Date();
let date = formatDate(date_ob);

// Query definitions -- to be implemented at a later time. Right now we just track from whenever the earliest entry in our DB is.
let past7Date = formatDate(new Date(date_ob.getTime() - (7 * 24 * 60 * 60 * 1000)));
let past7days = "date_trunc('day', TO_TIMESTAMP('${past7Date}', 'YYY-MM-DD HH24:MI:SS'))";
let allDays = "(SELECT MIN(date) FROM breakups)";

/**
 * Variable filter for editing. I decided the more specific the more interesting the resulting dataset would be.
 * Tracking 'single' would give you people trying to link me their Soundcloud account.
 **/
var filter = '#breakup, broke up, no longer together, #brokeup, #ex, exbf, exgf, #begonethot, #dumped, broken up';

var Twitter = require('twitter-stream-api')
const keys = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    token: process.env.TOKEN,
    token_secret: process.env.TOKEN_SECRET
}
var TwitterInstance = new Twitter(keys, false);

function formatDate(date) {
    var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();
    hours = d.getHours();
    minutes = d.getMinutes();
    seconds = d.getSeconds();
    
    if (month.length < 2)
    month = '0' + month;
    if (day.length < 2)
    day = '0' + day;
    if (seconds.length < 2)
    seconds = '0' + seconds;
    
    return (year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds);
}

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function (req, res) {
    let breakupData = [];
    let dateRange = [];
    let breakups = 0;
    async.series({
        new: function(cb) {
            var myDate = new Date();
            var currDate = formatDate(myDate);
            var sql = `SELECT COUNT(*) total,date_trunc('day', date) FROM breakups b WHERE b.date >= (SELECT MIN(date) FROM breakups) AND b.date <= date_trunc('day', TO_TIMESTAMP('${currDate}', 'YYY-MM-DD HH24:MI:SS') + INTERVAL '1 day') GROUP BY date_trunc('day', date) ORDER BY date_trunc`;
            pool.query(sql, (error, result) => {
                if (error) {
                    console.log(error);    
                }
        
                for (let row of result.rows) {
                    breakupData.push(row.total);
                    dateRange.push(row.date_trunc);
                    breakups = breakups + parseInt(row.total);
                }  
              cb(error, result);
            });
            
        }
    }, function(error, result) {
        var lastRecordedDate = dateRange[0];
        res.render('index', {breakups, date, breakupData, dateRange, lastRecordedDate});    
    })
});

app.listen(3000, function() {
    console.log('Server is now RUNNING');
});

TwitterInstance.stream('statuses/filter', {
    track: filter
});

TwitterInstance.on('connection success', function(uri) {
    console.log('connected to', uri);
});

TwitterInstance.on('connection aborted', function() {
    console.log('connection aborted or closed');
});

TwitterInstance.on('connection error stall', function() {
    console.log('connection stalled');
});

TwitterInstance.on('connection error network', function(error) {
    console.log('connection error network', error);
});

TwitterInstance.on('connection error http', function(statusCode) {
    console.log('connection error occured', statusCode);
});

TwitterInstance.on('connection rate limit', function(statusCode) {
    console.log('connection rate limited', statusCode);
});

TwitterInstance.on('connection error unknown', function(error) {
    console.log('connection error');
    TwitterInstance.close();
});

/**
 * On every tweet that matches our search, throw it into postgres
 */
TwitterInstance.on('data', function(tweet) {
    var newDate = new Date();
    let currDate = formatDate(newDate);
    var sql = `INSERT INTO breakups VALUES (TO_TIMESTAMP('${currDate}', 'YYY-MM-DD HH24:MI:SS'))`;
    pool.query(sql, (error) => {
	    if (error) {
		       console.log(error);
               console.log('error!');
        }
    });
});


TwitterInstance.on('data keep-alive', function() {
    console.log('keep alive received');
});

TwitterInstance.on('data error', function(error) {
    console.log('error parsing data or not understood', error);
});
