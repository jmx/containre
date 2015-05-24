var Promise = require("bluebird");
var sqlite3 = require("sqlite3").verbose();

var db = new sqlite3.Database("../peeps.sqlite3");
var intited = null;

function getPeep(name) {
	var peep = null;
	return new Promise( function (resolve, reject) {
		db.each("SELECT * from peeps WHERE key = ?", [name], function (err, row) {
			if (err) throw err;
			peep = row;
		}, function () {
			if (peep===null) {
				reject(404);
			} else {
				resolve(peep);
			}
		});
	});
}

function getTable(table) {
	var results = [];
	return new Promise( function (resolve, reject) {
		var statement = "SELECT * from " + table;
		db.each(statement, function (err, row) {
			if (err) throw err;
			results.push(row);
		}, function () {
			if (results === null) {
				reject(404);
			} else {
				resolve(results);
			}
		});
	});
}

function savePeep(data) {
	return new Promise( function (resolve, reject) {
		db.run("INSERT INTO peeps (key, value) VALUES (?, ?)", [data.name, JSON.stringify(data)], function (err) {
			if (err) throw err;
			resolve(data);
		});
	});
}

function updatePeep(name, data) {
	return new Promise( function (resolve, reject) {
		db.run("UPDATE peeps SET value = ? WHERE key = ?", [JSON.stringify(data), name], function (err) {
			if (err) throw err;
			resolve(data);
		});
	});
}

function init() {
	if (intited === null) {
		intited =  new Promise( function (resolve, reject) {
			db.serialize(function() {
				db.run("CREATE TABLE IF NOT EXISTS peeps (key TEXT, value TEXT, PRIMARY KEY (key))", function (err) {
					if (err) throw err;
					resolve();
				});
			});
		});
	}

	return intited;
}

module.exports = {
	init: init,
	getPeep: getPeep,
	savePeep: savePeep,
	updatePeep: updatePeep,
	getTable: getTable
}