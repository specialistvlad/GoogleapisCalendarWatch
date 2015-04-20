
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

var notifications = {list:[], hooks:[]};

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

function watchEvents(auth, callback) {
    var request = require('request');
    var options = {
        method: 'POST',
        uri: 'https://www.googleapis.com/calendar/v3/calendars/stoneleaf.test%40gmail.com/events/watch',
        headers: {
            'Authorization': 'Bearer '+auth,
            'content-type': 'application/json'
        },
        json: {
            id: 'my-unique-id-00000220001',
            type: 'web_hook',
            address: 'https://secure-mountain-3276.herokuapp.com/hook',
            "params": {
                "ttl": "3000"
            }
        }
    };
    request(options,
        function (error, response, body) {
            callback(error, response, body);
        });
}

jwtClient.authorize(function(err, tokens) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Auth tokens:', tokens);

    /*getEvents(jwtClient, function callback(err, response) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }
        //console.log('events:', response);
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
    });*/

    watchEvents(tokens.access_token, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body); // Show the HTML for the Google homepage.
        } else
            console.log(error, response.statusCode, body);
    });

    /*calendar.events.watch({
        auth: jwtClient,
        calendarId: 'stoneleaf.test@gmail.com',
        id: 'my-unique-id-00000220001',
        token: "my_token",
        type: 'web_hook',
        address: 'https://secure-mountain-3276.herokuapp.com/hook',
        "params": {
            "ttl": "3000"
        }

    }, function(err, res) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('Calendar.events.watch:', res);
    });*/
});


//*****************************************
//         Temporary web server
//*****************************************
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
    console.log(req.body);
    res.status(400).send({error: "Тут ничего нет, сорри :)"});
});

app.get(['/results','/result'], function(req, res) {
    res.status(200).send(JSON.stringify(notifications));
});

app.post('/hook', function(req, res) {
    console.log({header: req.headers, body:req.body});
    notifications.list.push({header: req.headers, body:req.body});
    res.status(200).send('');
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