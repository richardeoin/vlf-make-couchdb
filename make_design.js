/* Richard Meadows 2012/2013 */

/* Inserts a design document into the CouchDB */

/* ======== Includes ======== */

var request = require('request');
var argv = require('optimist')
	.usage('Usage: $0, --database [database] --ddoc [design document] --host [fqhn || localhost] --port [port || 5984] --username [username] --password [password]')
	.demand(['database', 'ddoc'])
	.argv;

/* ======== Helper Functions ======== */

/**
 * Stringify objects into JSON, including converting functions to strings.
 */
var simple_stringify = function (view) {
	return JSON.stringify(view, function (k, val) {
		if (typeof(val) === 'function') {
			/* Make sure indents display nicely in futon */
			return val.toString().replace(/\t/g, ' ');
		} else {
			return val;
		}
	});
};
/**
 * Puts a design document of a given name in our CouchDB.
 */
function put_design_document(uri, username, password, body) {
	var options = {
		uri: uri,
		auth: {
			user: username,
			pass: password,
			sendImmediately: false
		},
		headers: {
			"Content-Type": "application/json"
		},
		body: body
	};

	/* Attempt to get the revision */
	request.head({
		uri: options.uri,
		auth: {
			user: username,
			pass: password,
			sendImmediately: false
		}
	},
	function (err, res) {
		if (res && res.headers && typeof(res.headers.etag) === 'string') {
			/* Add the revision to the body if it's returned */
			options.body._rev = res.headers.etag.slice(1,-1);
		}
		/* Stringify the body */
		options.body = simple_stringify(options.body);
		/* And put the request */
		request.put(options, function (err, res) {
			if (err) {
				console.log(err);
			} else {
				console.log(res.statusCode);
			}
		});
	});
}

/* Default host and port */
argv.host = argv.host || 'localhost';
argv.port = argv.port || 5984;

/*
 * Put our design documents in the database.
 */
put_design_document(['http://', argv.host, ':', argv.port, '/', argv.database, '/_design/', argv.ddoc].join(''),
	argv.username, argv.password, {
	/* View Functions */
	views: require('./views.js'),
	/* List Functions */
	lists: require('./lists.js'),
	/* Valiation Functions */
	validate_doc_update: require('./validation.js')
});
