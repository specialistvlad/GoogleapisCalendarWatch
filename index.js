
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

var calendarId = 'stoneleaf.test@gmail.com';
var bodyParams = {
    id: 'my-unique-id-00000220001',
    type: 'web_hook',
    address: 'https://secure-mountain-3276.herokuapp.com/hook',
    params: {
        "ttl": "3000"
    }
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

jwtClient.authorize(function(err, tokens) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Auth success');

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

    /*watchEvents(tokens.access_token, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body); // Show the HTML for the Google homepage.
        } else
            console.log(error, response.statusCode, body);
    });*/

    calendar.events.watch({
        auth: jwtClient,
        calendarId: calendarId,
        resource: bodyParams
    }, function(err, res) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('Calendar.events.watch:', res);
    });
});


var http = require("http");

function onRequest(request, response) {
    var url = require("url").parse(request.url);
    if (url.path === '/hook') {
        console.log("Request for " + url.pathname + " received. Result: 200");
        console.log("headers:",request.headers);
        console.log("body:",request.body);
        notifications.list.push({"headers:": request.headers, "body:": request.body});
        response.writeHead(200, {"Content-Type": "application/json"});
        response.write('');
    } else if (url.path === '/result') {
        console.log("Request for " + url.pathname + " received. Result: 200");
        response.writeHead(200, {"Content-Type": "text/json"});
        response.write(JSON.stringify(notifications));
    } else {
        console.log("Request for " + url.pathname + " received. Result: 404");
        response.writeHead(404, {"Content-Type": "text/json"});
        response.write(JSON.stringify({Error: "Not found"}));
    }
    response.end();
}

http.createServer(onRequest).listen(process.env.PORT || 5000);
console.log("Server has started:", process.env.PORT || 5000);