var google = require('googleapis');
var calendar = google.calendar('v3');


var SERVICE_ACCOUNT_EMAIL = '591251157405-nc3h4o1fr5vks4m7o90brt69n1stibsc@developer.gserviceaccount.com';
var SERVICE_ACCOUNT_KEY_FILE = './keys/googleapi-privatekey.pem';
var jwtClient = new google.auth.JWT(
    SERVICE_ACCOUNT_EMAIL,
    SERVICE_ACCOUNT_KEY_FILE,
    null,
    ['https://www.googleapis.com/auth/analytics.readonly']);

function getEvents(auth) {
    calendar.events.list({
        auth: auth,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, function(err, response) {
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
};

jwtClient.authorize(function(err, tokens) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Auth tokens:', tokens);
});

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

app.get('/hook', function(req, res) {
    events.push(req.body);
    res.send(200);
});

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});