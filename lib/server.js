var express = require("express");
var bodyParser = require('body-parser');
var banner = require("./banner");

var peepDB = require("./peepsDB");

var app = express();

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

app.get("/", function (req, res) {
	res.send("<pre>" + banner + "</pre>");
});

app.get("/peeps/**", function (req, res) {
	var peepURL = req.url.match(/peeps\/([A-Za-z0-9].*)/);
	var peepName = (peepURL && peepURL[1]) ? peepURL[1] : null;
	peepDB.
		init().
		then(function () {
			return peepDB.getPeep(peepName);
		}).
		then(function (c) {
			console.log("Fetched peep: " + peepName);
			res.status(200).send(JSON.stringify(c));
	}).catch(function () {
		console.log("Failed to fetch: " + peepName);
		res.status(404).send("{success: false}");
	});
	
});

app.post("/peeps/", function (req, res) {
	peepDB.
		init().
		then(peepDB.savePeep(req.body)).
		then(function (result) {
			console.log("Created peep: " + req.body.name);
			res.status(201).send(JSON.stringify(req.body));
		}).catch(function (reason) {
			console.log("Error creating peep: " + reason);
			res.status(500).send("{reason: " + reason);
		})
});

app.post("/peeps/**", function (req, res) {
	var peepURL = req.url.match(/peeps\/([A-Za-z0-9].*)/);
	var peepName = (peepURL && peepURL[1]) ? peepURL[1] : null;
	peepDB.
		init().
		then(peepDB.updatePeep(peepName, req.body)).
		then(function (result) {
			console.log("Updated peep: " + req.body.name);
			res.status(201).send(JSON.stringify(req.body));
		}).catch(function (reason) {
			res.status(500).send("{reason: " + reason);
		})
});

console.log("Server started");

app.listen(3000);