// Point d’entrée du serveur
// =========================

// Le mode strict c’est le bien…
'use strict';

// On dope `String` avec des accesseurs de coloration, par exemple `.green`,
// pour avoir de jolis affichages en console…
require('colors');

console.log("Server started".green);

var express       = require('express');
var http          = require('http');
var path          = require('path');
var serveStatic   = require('serve-static');

// Noyau de l'appli
// ----------------

// 1. On crée une « appli » serveur, grâce à [Express](http://expressjs.com/)
var app = express();
// 2. On crée un serveur HTTP qui lui délègue l'applicatif
var server = http.createServer(app);

// Config de base
// --------------

// Le port d'écoute sera celui défini en environnement ou, à défaut, 3000.
app.set('port', process.env.PORT || 3000);

// Tout fichier statique présent dans le sous-dossier `public/` peut être servi automatiquement,
// avec le bon type MIME et tout…  Merci [serve-static](https://github.com/expressjs/serve-static).
app.use(serveStatic(path.join(__dirname, 'public')));

var io = require('socket.io').listen(server);

var socketViewer;
var socketController;
// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
	socket.on('identification', function (message) {
		if(message=="controller"){
			socketController = socket;
		}else if(message=="viewer"){
			socketViewer = socket;
		}
	    console.log(message + " connected");
	});
    socket.emit('message', 'Vous êtes bien connecté !');
	socket.on('orientation', function (message) {
		if(socketViewer){
		    console.log(message.alphaOrientation + " | " + message.betaOrientation);
		    socketViewer.emit('orientation', message);
		}
	});
});


// Démarrage du serveur
// --------------------
// on lance le serveur HTTP sur le port qui va bien.
// Un simple Ctrl+C (ou signal SIGINT passé autrement) arrêtera tout ça proprement.
server.listen(app.get('port'), function() {
	console.log('✔ Express server listening on http://localhost:%d/'.green, app.get('port'));
});
