/* Richard Meadows 2013 */

/* Generates view functions for our CouchDB */

exports = module.exports = function() {
	/* ======== Decode Function ======== */

	function get_decode_function() {
	
	}

	/* ======== Main ======== */

	return {
		left: {
			map: (function (doc) {
				if (doc.bin) { /* If the document is still in binary format */
					doc = decode(doc); /* Decode it */
				}
				if (doc.time && doc.left && doc.left.value) {
					emit(doc.time, doc.left.value);
				}
			}).toString().replace(/decode/g, get_decode_function())
		},
		right: {
			map: (function (doc) {
				if (doc.bin) { /* If the document is still in binary format */
					doc = decode(doc); /* Decode it */
				}
				if (doc.right && doc.right.value) {
					emit(doc.time, doc.right.value);
				}
			}).toString().replace(/decode/g, get_decode_function())
		},
		battery: {
			map: function (doc) {
				if (doc.battery && doc.battery.value) {
					var adc_value = doc.battery.value/10;
					var pin_voltage = (adc_value*1.8)/1024;
					emit(doc.time, Math.round(pin_voltage*11*1000)/1000);
				}
			}
		}
	};
}();
