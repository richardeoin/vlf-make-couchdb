/* Richard Meadows 2013 */

/* Generates list functions for our CouchDB */

exports = module.exports = function() {
	/* ======== Includes ======== */

	var fs = require('fs');

	/* ======== Plot Function ======== */

	/**
	 * A function for converting energy measurement values into graph coordinates.
	 */
	var em_get_coords = function(row, req, px_per_second) {
		return {
			x: (row.key-req.query.startkey) * px_per_second,
			// y: ((Math.log(row.value) / Math.log(10))-5) * 95
			y: (row.value / 100000) * 0.71
		};
	}
	/**
	 * A function for converting envelope measurement value into graph coordinates.
	 */
	var envelope_get_coords = function(row, req, px_per_second) {
		return {
			x: (row.key-req.query.startkey) * px_per_second,
			y: (row.value / 1000) * 8.14
		};
	}
	/**
 	* A function for converting battery voltage values into graph coordinates.
 	*/
	var battery_get_coords = function(row, req, px_per_second) {
		return {
			x: (row.key-req.query.startkey) * px_per_second,
			y: row.value * 57
		};
	}
	/**
	 * A function for converting rx power values into graph coordinates.
	 */
	var rx_power_get_coords = function(row, req, px_per_second) {
		return {
			x: (row.key-req.query.startkey) * px_per_second,
			y: (row.value+100) * 3.17
		};
	}
	/**
 	* A CouchDB list function that handles plotting graphs as SVG. The function is strigified and
 	* any "<TEMPLATEn>" tags replaced before being written to the design document.
 	*/
	var plot_function = function (head, req) {
		start ({
			"headers": {
				"Content-Type": "image/svg+xml"
			}
		});
		send("<TEMPLATE1>");

		var size = {
			x: 835,
			y: 285
		};

		var px_per_x_div = 69.58;
		var px_per_second = px_per_x_div/7200; /* Each divison is 2 hours */

		/**
	 	* Gets a single pair of coordinates that are within the graph.
	 	*/
		function get_coords() {
			var row;

			if (row = getRow()) { /* If we can get a row */
				var coords = coords_function(row, req, px_per_second);

				/* Make sure the y-coordinate is within bounds */
				coords.y = (coords.y >= 0) ? coords.y : 0;
				coords.y = (coords.y <= size.y) ? coords.y : size.y;

				/* If the x-coordinate is within bounds */
				if (coords.x <= size.x && coords.x >= 0) {
					return coords; /* Return a valid set of coordinates */
				}
			}
			return null;
		}
		function round_to_one(val) {
			return Math.round(val*10)/10;
		}

		var this_coords, coords;
		if (this_coords = get_coords()) { /* Get the first row */
			do {
				coords = this_coords;

				/* Send a absolute position followed by the start of a relative position line */
				send(['M', coords.x.toFixed(1), ' ', coords.y.toFixed(1), ' l'].join(''));

				while(this_coords = get_coords()) {
					/* If the next coordinates are from a different line */
					if (this_coords.x - coords.x > size.x*0.05) { break; }

					/* Get the relative position of this point to 1 dp */
					var dx = round_to_one(this_coords.x - coords.x);
					coords.x += dx;
					var dy = round_to_one(this_coords.y - coords.y);
					coords.y += dy;

					/* Move by this relative position */
					send([dx.toString(10), ' ', dy.toString(10), ' '].join(''));
				}
			} while (this_coords);

			send("<TEMPLATE2>");
			send("none"); /* We don't display the no data found message */
		} else {
			send("<TEMPLATE2>");
			send("inline"); /* We do display the no data found message */
		}
		send("<TEMPLATE3>");
	};
	/**
 	* Reads in an svg file template.
 	*/
	function get_plot_template(filename) {
		var pt = fs.readFileSync(filename, 'utf-8');
		pt = pt.replace(/"/g, '\\"'); /* Escape quotes */
		pt = pt.replace(/\n/g, '\\n'); /* Escape newlines */

		return pt.split(/\s*\[SPLIT\]\s*/);
	}
	/**
 	* Returns a complete plot function as a string.
 	*/
	function get_plot_function(filename, get_coords_function) {
		var template = get_plot_template(filename);
		/* Add our get_coords_function into the plot function */
		var func = plot_function.toString().replace(/coords_function/g, get_coords_function.toString());

		var i = 1;
		/* Add the SVG templates to the plot function */
		for (var t in template) {
			var replace_regex = new RegExp('<TEMPLATE'+(i++)+'>', 'g')
			func = func.replace(replace_regex, template[t]);
		}

		/* We now have a complete CouchDB list function for outputting SVGs */
		return func;
	}

	/* ======== Today Function ======== */

	/**
 	* A CouchDB list function that redirects to another list with the startkey and endkey equal to the
 	* unix times for the current day. The function is stringified and any "<LIST_NAME>" tags replaced
 	* before being written to the design document.
 	*/
	var today_func = function(head, req) {
		var t = new Date();
		t.setUTCHours(0,0,0,0); /* Set the time to the start of today */
		var unix_t = parseInt(t.getTime()/1000);

		/* Compile a path */
		var path = "/" + req.path.slice(0, 4).join('/');
		path += "/" + "<LIST_NAME>";
		path += "/" + req.path[5] + "?startkey="+unix_t+"&endkey="+(unix_t+3600*24);

		/* Output HTTP Headers */
		start({
			code: 307, /* Temporary Redirect */
			headers: {
				"Location": path
			}
		});
	}
	/**
 	* Returns a complete today function as a string.
 	*/
	function get_today_function(list_name) {
		return today_func.toString().replace(/<LIST_NAME>/g, list_name);
	}

	/* ======== Main  ======== */

	return {
		plot_em: get_plot_function('svg/plot_em_template.svg', em_get_coords),
		plot_em_today: get_today_function('plot_em'),
		plot_envelope: get_plot_function('svg/plot_envelope_template.svg', envelope_get_coords),
		plot_envelope_today: get_today_function('plot_envelope'),
		plot_battery: get_plot_function('svg/plot_battery_template.svg', battery_get_coords),
		plot_battery_today: get_today_function('plot_battery'),
		plot_rx_power: get_plot_function('svg/plot_rx_power_template.svg', rx_power_get_coords),
		plot_rx_power_today: get_today_function('plot_rx_power')
	};
}();
