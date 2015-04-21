var google = require('googleapis');
var calendar = google.calendar('v3');

/*
 * @desc Watch for changes to Events resources.
 *
 * @param  {object} params - parameters for new object
 * @param  {object=} params.auth - auth parameters
 * @param  {object=} params.auth.serviceAccount - service email address from privateKey.txt file
 * @param  {object=} params.auth.certificatePath - certificate file in pem format
 * @param  {array=} params.auth.scope - required scope
 * @param  {object=} params.debug - enable answer on path /debug, with array of notifications
 */
function GoogleapisCalendarWatch (params) {
    var google = require('googleapis');
    var calendar = google.calendar('v3');
    this.params = params;

    //Validate params
    if (!params)
        throw new Error('Unable to read first argument with parameters.');

    if (!params.auth)
        throw new Error('Unable to read auth param.');

    if (!params.auth.serviceAccount)
        throw new Error('Unable to read serviceAccount param.');

    if (!params.auth.certificatePath)
        throw new Error('Unable to read certificatePath param.');

    if (!params.auth.scope)
        throw new Error('Unable to read scope param.');

    if (params.debug)
        this.list = [];
    this.hooks = [];

    //Create auth object
    this.auth = new google.auth.JWT(params.auth.serviceAccount,
        params.auth.certificatePath, null, params.auth.scope);
    this.token = null;

    //Create webserver
    this.http = require("http");

    this.http.createServer(function onRequest(request, response) {
        var url = require("url").parse(request.url);

        if (url.path === '/hook') {
            console.log("Request for " + url.pathname + " received. Result: 200");
            console.log("headers:", request.headers);
            console.log("body:", request.body);

            if (params.debug)
                this.list.push({"headers:": request.headers, "body:": request.body});

            if (this.on)
                this.on(null, request.headers, request.body);
            response.writeHead(200, {"Content-Type": "application/json"});
            response.write('');
            response.end();
        } else {
            if ((params.debug) && (url.path === '/debug')) {
                if (url.path === '/debug') {
                    console.log("Request for " + url.pathname + " received. Result: 200");
                    response.writeHead(200, {"Content-Type": "text/json"});
                    response.write(JSON.stringify(this.list));
                    response.end();
                } else {
                    console.log("Request for " + url.pathname + " received. Result: 404");
                    response.writeHead(404, {"Content-Type": "text/json"});
                    response.write(JSON.stringify({Error: "Not found"}));
                    response.end();
                }
            } else {
                console.log("Request for " + url.pathname + " received. Result: 404");
                response.writeHead(404, {"Content-Type": "text/json"});
                response.write(JSON.stringify({Error: "Not found"}));
                response.end();
            }
        }
    }.bind(this)).listen(this.params.listen);
}

GoogleapisCalendarWatch.prototype.on = function (argument) {
  this.on = argument;
};

/*
 * @desc
 *
 * @param  {object} params - parameters for request
 * @param  {string=} params.id - uuid format
 * @param  {number=} params.expire - seconds
 * @param  {string=} params.calendar - calendar(email)
 * @param  {string=} params.hook - hook address for google notification
 */
GoogleapisCalendarWatch.prototype.watch = function (params, callback) {
    this.auth.authorize(function(err, tokens) {
        if (err)
            return callback(err);
        this.token = tokens;
        var options = {
            auth: this.auth,
            calendarId: params.calendar,
            resource: {
                id: params.id,
                type: 'web_hook',
                address: params.hook,
                params: {}
            }
        };
        if (params.expire)
            options.resource.params = {"ttl": params.expire.toString()};

        calendar.events.watch(options, function(err, res) {
            return callback(err, res);
        });
    }.bind(this));
};

module.exports = GoogleapisCalendarWatch;