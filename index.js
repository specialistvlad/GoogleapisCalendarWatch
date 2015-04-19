//*****************************************
//             Google calendar
//*****************************************
var google = require('googleapis');
var calendar = google.calendar('v3');

var jwtClient = new google.auth.JWT(
    '591251157405-nc3h4o1fr5vks4m7o90brt69n1stibsc@developer.gserviceaccount.com',
    './keys/googleapi-privatekey.pem',
    null,
    ['https://www.googleapis.com/auth/calendar']);
var pathParams = { calendarId: 'stoneleaf.test@gmail.com' };
var bodyParams = {
    id: 'my-unique-id-00001',
    type: 'web_hook',
    address: 'https://secure-mountain-3276.herokuapp.com/hook'
};

/**
 * Gets the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getEvents(auth, callback) {
    calendar.events.list({
        auth: auth,
        calendarId: 'stoneleaf.test@gmail.com',
        /*timeMin: (new Date()).toISOString(),*/
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, function(err, response) {
        callback(err, response);
    });
}


jwtClient.authorize(function(err, tokens) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Auth tokens:', tokens);

    getEvents(jwtClient, function callback(err, response) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }
        var events = response.items;
        if (events.length == 0) {
            console.log('No upcoming events found.');
        } else {
            console.log('Upcoming 10 events:');
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
            }
        }
    });

    calendar.events.watch({
        auth: jwtClient,
        calendarId: 'stoneleaf.test@gmail.com',
        id: 'my-unique-id-000000001',
        type: 'web_hook',
        address: 'https://secure-mountain-3276.herokuapp.com/hook',
        params: {
            "ttl": 3600
        }
    }, function(err, res) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('Calendar.events.watch:', res);
    });
});


//*****************************************
//         Temporary web server
//*****************************************
var events = [];
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// parse application/json
app.use(bodyParser.raw({limit : 5000}));
// parse application/json
app.use(bodyParser.json());
// parse application/vnd.api+json as json with limit ~5Mb
app.use(bodyParser.json({type : 'application/vnd.api+json', limit : 5000}));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended : true}));

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.send(events);
});

app.post('/hook', function(req, res) {
    console.log(req.body);
    events.push(req.body);
    res.send(200);
});

app.use(function (req, res, next) {
    res.status(404);
    console.log('Not found URL: %s', req.url);

    res.send({error : 'Not found'});
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    console.log('Internal error(%d): %s', res.statusCode, err.toString());
    res.send({error : err.toString()});
});

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});