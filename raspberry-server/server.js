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

var GPIO_KITCHEN = new Gpio(12, 'out');
var GPIO_LIVING_ROOM = new Gpio(16, 'out');
var GPIO_BATHROOM = new Gpio(20, 'out');
var GPIO_BEDROOM = new Gpio(21, 'out');

var gpioRoomPins = [GPIO_KITCHEN, GPIO_LIVING_ROOM, GPIO_BATHROOM, GPIO_BEDROOM]; 

var homeJSON = [
	{
	"room": "kitchen",
	"mac": ["5C:CF:7F:8F:74:F4","5C:CF:7F:8F:72:BE"],
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

// kitchen
var kitchen1 = false;
var kitchen2 = false;
var kitchenUpdate = false;

// doorIp ESP
var doorIp = "";

//Outdoor JSON - Front door sensor
garageJSON = {
	"room": "garage",
	"mac": ["5C:CF:7F:0D:D9:4F"],
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

//Get garageJSON
app.get('/garage', function(req, res) {
        res.send(garageJSON);
});

//Get doorIp
app.get('/ipDoor',function(req, res){
	res.send(doorIp);
});

// Receive a resgister post from the ESP with the IP
app.post('/api/Door/ip', function(req, res){
	var url_parts = url.parse(req.url, true);
	var query =url_parts.query;
	doorIp = query.ipDoor;
	console.log("ESP IP: "+ doorIp);
	res.send('200');
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
	var averagediameter = query.averagediameter;

        console.log('DEBUG  from the HuzzaFeather ip '+ip+' with MAC '+deviceMAC+' room '+roomName+ ' minDistance '
			+mindistance+' maxDistance '+maxdistance+' averageDistance '+averagedistance+' averageDiameter '+averagediameter);
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

	if(deviceMAC=="5C:CF:7F:8F:74:F4" || deviceMAC== "5C:CF:7F:8F:72:BE"){
		if(value == 1){
			switch(deviceMAC){
				case '5C:CF:7F:8F:74:F4':
				kitchen1 = true;
				console.log("Kitchen1 deteted");
				break;
				case '5C:CF:7F:8F:72:BE':
				kitchen2 = true;
				console.log("Kitchen2 detected");
				break;
			}
			kitchenTimer(query);
		}

	} else {
		
		console.log('Update presence from the HuzzaFeather ip '+ip+' with MAC '+deviceMAC+' room '+roomName+' presence detected ' + presence);
		if (value == 1) {
		kitchenUpdate = false;
			homeJSON.forEach(function(roomJSON, i) {
				var roomMacArray = roomJSON.mac;
				for (var j = 0; j < roomMacArray.length; j++) {
					if (deviceMAC == roomMacArray[j]) {
						roomJSON.presence = value;
						gpioRoomPins[i].write(value,function() {});
						break;
					} else {
						roomJSON.presence = 0;
						gpioRoomPins[i].write(0,function() {});
					}
				}
			})
			for (var i = 0; i < garageJSON.mac.length; i++) {
				if (deviceMAC == garageJSON.mac[i]) {
					if (garageJSON.presence == 0) {
						homeJSON[1].presence = 1;
						gpioRoomPins[1].write(1,function() {});
						garageJSON.presence = 1;
					} else {
						garageJSON.presence = 0;
					}
				}
			}
			io.emit('message', homeJSON);
		}
	}
	res.send('200');
});

function kitchenTimer(vars){
	setTimeout(function(){

		if(kitchen1 == true && kitchen2 == true){
			 kitchen1 = false;
			 kitchen2 = false;
			 var ip = vars.ip;
			 var roomName = vars.roomName;
			 var deviceMAC = vars.mac;
			 var value = vars.presence > 0 ? 1 : 0;
			kitchenUpdate = vars.presence > 0;
		
			console.log('Update presence from the HuzzaFeather ip '+ip+' with MACs kicthen macs room '+roomName+' presence detected ' + value);
			
			homeJSON.forEach(function(roomJSON, i) {
				var roomMacArray = roomJSON.mac;
				for (var j = 0; j < roomMacArray.length; j++) {
					
					if (deviceMAC == roomMacArray[j]) {
						gpioRoomPins[i].write(1,function() {});
						roomJSON.presence = value;
						break;
					} else {
						roomJSON.presence = 0;
						if (i > 0 ){
							gpioRoomPins[i].write(0, function() {});
						}
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

				if(kitchenUpdate==true)
				io.emit('message', homeJSON);
			
		}
		// else is False positive
		kitchen1 = false;
		kitchen2 = false;

	},1500);
}

function sleep (time) {
	return new Promise((resolve) => setTimeout(resolve, time));
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
	gpioRoomPins.forEach(function(gpioRoomPins) {
		gpioRoomPins.write(0, function() {});
		gpioRoomPins.unexport();
	});
	process.exit();
});
