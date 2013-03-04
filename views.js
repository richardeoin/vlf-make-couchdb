/* Richard Meadows 2013 */

/* Generates view functions for our CouchDB */

exports = module.exports = function() {

	/* ======== Main ======== */

	return {
		left: {
			map: function (doc) {
				/* If this is a record for the left em channel */
				if (doc.left && doc.time) {
					/* If the time is still in hex format from a direct upload */
					if (typeof doc.time === 'string') {
						/*
						 * Parse the time to a number. Note the loss of precision in representing 64 bit time
						 * in javascript. Will become a problem around the year 300 million.
						 */
						doc.time = parseInt(doc.time, 16);
					}
					/* If everything is as we expect */
					if (typeof doc.time === 'number' && doc.left.value && typeof doc.left.value === 'number') {
						emit(doc.time, doc.left.value);
					}
				}
			}
		},
		right: {
			map: function (doc) {
				/* If this is a record for the right em channel */
				if (doc.right && doc.time) {
					/* If the time is still in hex format from a direct upload */
					if (typeof doc.time === 'string') {
						/*
						 * Parse the time to a number. Note the loss of precision in representing 64 bit time
						 * in javascript. Will become a problem around the year 300 million.
						 */
						doc.time = parseInt(doc.time, 16);
					}
					/* If everything is as we expect */
					if (typeof doc.time === 'number' && doc.right.value && typeof doc.right.value === 'number') {
						emit(doc.time, doc.right.value);
					}
				}
			}
		},
		battery: {
			map: function (doc) {
				/* If this is a record for the battery */
				if (doc.battery && doc.time) {
					/* If the time is still in hex format from a direct upload */
					if (typeof doc.time === 'string') {
						/*
						 * Parse the time to a number. Note the loss of precision in representing 64 bit time
						 * in javascript. Will become a problem around the year 300 million.
						 */
						doc.time = parseInt(doc.time, 16);
					}
					/* If everything is as we expect */
					if (typeof doc.time === 'number' && doc.battery.value && typeof doc.battery.value === 'number') {
						/* Compensate for the averaging */
						var adc_value = doc.battery.value/10;
						/* Determine the voltage at the adc pin, given a 1.8V ref and a 10-bit adc */
						var pin_voltage = (adc_value*1.8)/1024;
						/* Compensate for the resistor divider */
						var battery_voltage = pin_voltage*11;
						/* Output to 3 decimal places */
						emit(doc.time, Math.round(pin_voltage*1000)/1000);
					}
				}
			}
		}
	};
}();
