GoogleapisCalendarWatch = require('./library');

var config = {
    auth: {
        serviceAccount: '591251157405-nc3h4o1fr5vks4m7o90brt69n1stibsc@developer.gserviceaccount.com',
        certificatePath: './keys/googleapi-privatekey.pem',
        scope: ['https://www.googleapis.com/auth/calendar']
    },
    listen: process.env.PORT || 5000,
    debug: true
};

var lib = new GoogleapisCalendarWatch(config);

lib.on(function(err, header, body) {
    console.log(err, header, body);
});

lib.watch({
    id: 'My-id12345678900',
    calendar: 'stoneleaf.test@gmail.com',
    hook: 'https://secure-mountain-3276.herokuapp.com/hook'
}, function (err, res) {
    if (err)
        return console.log('watch', err);
    console.log('watch success', res);
});

lib.getEvents('stoneleaf.test@gmail.com', null, null, function (err, res) {
    if (err)
        return console.log('getEvents', err);
    console.log('getEvents', res);
});

