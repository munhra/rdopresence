var express = require('express');
var bodyParser = require('body-parser');
var onoff = require('onoff');
var url = require('url');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var app = express();
var Gpio = onoff.Gpio;

var SDI   = new Gpio(17, 'out');//physical pin 11
var RCLK  = new Gpio(18, 'out');//physical pin 12
var SRCLK = new Gpio(27, 'out');//physical pin 13


var gpio = [
	new Gpio(6, 'out'),
	new Gpio(13, 'out'),
	new Gpio(19, 'out'),
	new Gpio(26, 'out'),
	// new Gpio(7, 'out') //GAMBIARRA
]

//TODO: bind mac address to room
var homeJSON = [
	// {
	// "room": "kitchen",
	// "mac": "5C:CF:7F:8F:77:E4",
	// "presence": 0
	// },
	{
	"room": "kitchen",
	"mac": "5C:CF:7F:8F:72:BE",
	"presence": 0
	},
	// {
	// "room": "livingroom",
	// "mac": "5C:CF:7F:8F:74:CF",
	// "presence": 0
	// },
	{
	"room": "livingroom",
	"mac": "5C:CF:7F:8F:77:E4",
	"presence": 0
	},
	// {
	// "room": "livingroom",
	// "mac": "5C:CF:7F:8F:6D:7C",
	// "presence": 0
	// },
	// {
	// "room": "bathroom",
	// "mac": "5C:CF:7F:8F:6D:7C",
	// "presence": 0
	// },
	{
	"room": "bathroom",
	"mac": "5C:CF:7F:D5:D0:56",
	"presence": 0
	},
	// {
	// "room": "bedroom",
	// "mac": "5C:CF:7F:0D:D9:4F",
	// "presence": 0
	// }
	{
	"room": "bedroom",
	"mac": "5C:CF:7F:D5:D0:35",
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

app.post('/api/sensor/register',function (req, res) {
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var deviceMAC = query.mac;
	var ip = query.ip;
	var roomName = query.roomName;

	homeJSON.forEach(function(roomJSON, i) {
		if (roomName == roomJSON.room) {
			roomJSON.mac = deviceMAC;
		}
	})

	console.log('Register from the HuzzaFeather ip '+ip+' with MAC '+deviceMAC+' room '+roomName);
	res.send('200');
});

app.post('/api/sensor',function (req, res) {

	///api/sensor?mac=00:00:00:00&presence=1
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var deviceMAC = query.mac;
	var presence = query.presence;
	var ip = query.ip;
	var roomName = query.roomName;
	var value = presence > 0 ? 1 : 0;
	console.log('Update presence from the HuzzaFeather ip '+ip+' with MAC '+deviceMAC+' room '+roomName+' presence detected ' + presence);
	if (value == 1) {
		homeJSON.forEach(function(roomJSON, i) {
			if (deviceMAC == roomJSON.mac) {
				roomJSON.presence = value;
				gpio[i].write(value, function() {
					//console.log('Post from the HuzzaFeather with MAC '+deviceMAC+ ' presence detected ' + value)
				});
				

			} else {
				roomJSON.presence = 0;
				gpio[i].write(0, function() {});
			}
		})

		io.emit('message', homeJSON);
	}

	if (deviceMAC == "5C:CF:7F:8F:77:E4") {
		RCLK.write(0, function() {});
		hc595_in(value);
		sleep(1).then(hc595_out());
	}

	res.send('200');
});

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function hc595_in(dat) {
	for(i = 0; i < 8; i++) {
		SDI.write(dat, function() {});
		SRCLK.write(1, function() {});
		SRCLK.write(0, function() {});
	}
}

function hc595_out() {
	RCLK.write(1, function() {});
	sleep(1).then(() => {
		RCLK.write(0, function() {});
	});
}

io.on('connection', function (client) {
    console.log('cliente connected');
	client.emit('message', homeJSON);
	
})

http.listen(3001, function(){
  console.log('listening on *:3001');
});


process.on('SIGINT', function() {
	gpio.forEach(function(gpioPin) {
		gpioPin.write(0, function() {});
		gpioPin.unexport();
	});
	process.exit();
});
