require('dotenv').config()
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var request = require('request');

const HttpsProxyAgent = require('https-proxy-agent');
const cors = require('cors')
const proxy = new HttpsProxyAgent(process.env.http_proxy || 'http://proxy.charite.de:8080');

const teamsHook = 'https://charitede.webhook.office.com/webhookb2/05cdecbb-03b1-4cf7-934e-d6e1853711be@afe91939-923e-432c-bc66-cbc3ec18d02c/IncomingWebhook/0e943482864140a8a8a396ca284f9601/ed938071-d67b-4ba0-82fc-652e714d5056';

const responseMessage = 'Vielen Dank für dein Feedback. Schreib uns gerne weiter, wenn dir noch etwas auffällt.'

var teamsOptions = {
    uri: teamsHook,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}

app.use(cors({ origin: '*', allowedHeaders: [ 'Authorization', 'Content-Type' ] }))
app.use(express.json())

io.on('connection', function(socket){

	socket.on('message', data => {

		var teamsMessage = {
			...teamsOptions, 
			body: JSON.stringify({'text': 'Absender: ' 
				+ (data.email || socket.id) + '\nNachricht: ' 
				+ data.message}),
		};

		request(teamsMessage, (error, response) => {
			if (!error) socket.emit('message', responseMessage)
			else console.log(error)
		})
	})

	socket.on('join', data => {
		socket.join(data)
	})
});

http.listen(process.env.PORT || 8001, function(){
	console.log('feedbackbot listening on *:8001');
});
