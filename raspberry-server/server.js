//Dependencies
require('log-timestamp');
var express = require('express');
var bodyParser = require('body-parser');
var onoff = require('onoff');
var url = require('url');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var arrayUnion = require('array-union');

var app = express();
var Gpio = onoff.Gpio;

// Gpio pins that communicate with sound attenuator
var SDI   = new Gpio(17, 'out');//physical pin 11. Attenuator Data pin
var RCLK  = new Gpio(18, 'out');//physical pin 12. Attenuator Load pin
var SRCLK = new Gpio(27, 'out');//physical pin 13. Attenuator Clock pin

var gpio = [
	new Gpio(5, 'out'),
	new Gpio(6, 'out'),
	new Gpio(13, 'out'),
	new Gpio(19, 'out'),
	new Gpio(26, 'out')
]

var homeJSON = [
	{
	"room": "kitchen",
	"mac": ["5C:CF:7F:8F:72:BE"],
	"presence": 0
	},
	{
	"room": "livingroom",
	"mac": ["5C:CF:7F:8F:77:E4", "5C:CF:7F:8F:74:CF"],
	"presence": 0
	},
	{
	"room": "bathroom",
	"mac": ["5C:CF:7F:D5:D0:56"],
	"presence": 0
	},
	{
	"room": "bedroom",
	"mac": ["5C:CF:7F:D5:D0:35"],
	"presence": 0
	}
]

//Outdoor JSON - Front door sensor
garageJSON = {
	"room": "garage",
	"mac": ["5C:CF:7F:8F:6E:83"],
	"presence": 0
}

app.use(bodyParser.json());

// Sensors port communication
app.listen(3000, function(err) {
	console.log('Server started');
});

//Get homeJSON
app.get('/', function(req, res) {
	res.send(homeJSON);
});

app.post('/api/sensor/debug',function (req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        var deviceMAC = query.mac;
        var ip = query.ip;
        var roomName = query.roomName; 
	var maxdistance = query.maxdistance;
	var mindistance = query.mindistance;
	var averagedistance = query.averagedistance;


        console.log('DEBUG  from the HuzzaFeather ip '+ip+' with MAC '+deviceMAC+' room '+roomName+ ' minDistance '
			+mindistance+' maxDistance '+maxdistance+' averageDistance '+averagedistance);
        res.send('200');
});

//Receive a register post from a new sensor and save mac address
app.post('/api/sensor/register',function (req, res) {
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var deviceMAC = query.mac;
	var ip = query.ip;
	var roomName = query.roomName;
	
	homeJSON.forEach(function(roomJSON, i) {
		if (roomName == roomJSON.room) {
			roomJSON.mac = arrayUnion(roomJSON.mac, deviceMAC);
		}
	})

	if (roomName == garageJSON.room) {
		garageJSON.mac = arrayUnion(garageJSON.mac, deviceMAC);
	}

	console.log('Register from the HuzzaFeather ip '+ip+' with MAC '+deviceMAC+' room '+roomName);
	res.send('200');
});

// Receive a detection post from a registered sensor and save the new homeJSON state.
// If a sensor detect presence 1, then every other room will be set to presence 0.
// The first time front door sensor detect an oppening, then living room will be set to
// presence 1. But, the second time front door sensor detect an oppening, then all rooms
// will be set to presence 0, including living room.
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
			var roomMacArray = roomJSON.mac;
			for (var j = 0; j < roomMacArray.length; j++) {
				if (deviceMAC == roomMacArray[j]) {
					roomJSON.presence = value;
					gpio[i].write(value, function() {
					//console.log('Post from the HuzzaFeather with MAC '+deviceMAC+ ' presence detected ' + value)
					});
					break;
				} else {
					roomJSON.presence = 0;
					gpio[i].write(0, function() {});
				}
			}
		})

		for (var i = 0; i < garageJSON.mac.length; i++) {
			if (deviceMAC == garageJSON.mac[i]) {
				if (garageJSON.presence == 0) {
					homeJSON[1].presence = 1;
					garageJSON.presence = 1;
				} else {
					garageJSON.presence = 0;
				}
			}
		}

		io.emit('message', homeJSON);
	
		if (deviceMAC == "5C:CF:7F:8F:77:E4") {
			RCLK.write(0, function() {});
			hc595_in(value);
			sleep(1).then(hc595_out());
		}
	}

	res.send('200');
});

function sleep (time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

// Sound attenuator bit stream communication with clock
function hc595_in(dat) {
	for(i = 0; i < 8; i++) {
		SDI.write(dat, function() {});
		SRCLK.write(1, function() {});
		SRCLK.write(0, function() {});
	}
}

// Sound attenuator load pin. Set to high then low
function hc595_out() {
	RCLK.write(1, function() {});
	sleep(1).then(() => {
		RCLK.write(0, function() {});
	});
}

// Socket IO connection
io.on('connection', function (client) {
    console.log('client connected');
	client.emit('message', homeJSON);
	
})

// Web client feedback UI port listening
http.listen(3001, function(){
  console.log('listening on *:3001');
});

// Process exit 0
process.on('SIGINT', function() {
	gpio.forEach(function(gpioPin) {
		gpioPin.write(0, function() {});
		gpioPin.unexport();
	});
	process.exit();
});
