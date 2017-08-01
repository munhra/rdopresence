require('console-stamp')(console, '[HH:MM:ss.l]');
var express = require('express');
var bodyParser = require('body-parser');
//var onoff = require('onoff');
var url = require('url');

var app = express();
//var Gpio = onoff.Gpio;

/*
var gpio = [
	new Gpio(6, 'out'),
	new Gpio(13, 'out'),
	new Gpio(19, 'out'),
	new Gpio(26, 'out')
]*/

//TODO: bind mac address to room

var homeJSON = [
	{
	"room": "kitchen",
	"mac": "0",
	"presence": 0
	},
	{
	"room": "livingroom",
	"mac": "1",
	"presence": 0
	},
	{
	"room": "bathroom",
	"mac": "2",
	"presence": 0
	},
	{
	"room": "bedroom",
	"mac": "3",
	"presence": 0
	}
]

app.use(bodyParser.json());

app.listen(3000, function(err) {
	console.log('Server started');
});

app.get('/', function(req, res) {
	res.send(homeJSON);
});

app.post('/api/sensor',function (req, res) {

	///api/sensor?mac=00:00:00:00&presence=1
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var deviceMAC = query.mac;
	var presence = query.presence;
	console.log('Post from the HuzzaFeather with MAC '+deviceMAC+ ' presence detected ' + presence)
	homeJSON.forEach(function(roomJSON, i) {
		if (deviceMAC == roomJSON.mac) {
			var value = presence > 0 ? 1 : 0;
			roomJSON.presence = value;

			//gpio[i].write(value, function() {
				//console.log('Post from the HuzzaFeather with MAC '+deviceMAC+ ' presence detected ' + value)
			//});
		}
	})

	res.send('200')
});


/*
process.on('SIGINT', function() {
	gpio.forEach(function(gpioPin) {
		gpioPin.write(0, function() {});
		gpioPin.unexport();
	});
	process.exit();
});*/
