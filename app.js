const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.post('/api/sensor',function (req, res) {
	///api/sensor?mac=00:00:00:00&presence=1
	var deviceMAC = req.param('mac');
	var presence = req.param('presence');
	console.log('Post from the HuzzaFeather with MAC '+deviceMAC+ ' presence detected '+presence)
	res.send('200')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})