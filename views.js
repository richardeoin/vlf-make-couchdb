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
	  var time;
	  if (typeof doc.time === 'string') {
	    /*
	     * Parse the time to a number. Note the loss of precision in representing 64 bit time
	     * in javascript. Will become a problem around the year 300 million.
	     */
	    time = parseInt(doc.time, 16);
	  } else {
	    time = doc.time;
	  }
	  /* If everything is as we expect */
	  if (typeof time === 'number' && doc.left.value && typeof doc.left.value === 'number') {
	    emit(time, doc.left.value);
	  }
	}
      }
    },
    right: {
      map: function (doc) {
	/* If this is a record for the right em channel */
	if (doc.right && doc.time) {
	  /* If the time is still in hex format from a direct upload */
	  var time;
	  if (typeof doc.time === 'string') {
	    /*
	     * Parse the time to a number. Note the loss of precision in representing 64 bit time
	     * in javascript. Will become a problem around the year 300 million.
	     */
	    time = parseInt(doc.time, 16);
	  } else {
	    time = doc.time;
	  }
	  /* If everything is as we expect */
	  if (typeof time === 'number' && doc.right.value && typeof doc.right.value === 'number') {
	    emit(time, doc.right.value);
	  }
	}
      }
    },
    left_envelope: {
      map: function (doc) {
	/* If this is a record for the left envelope */
	if (doc.left_envelope && doc.time) {
	  /* If the time is still in hex format from a direct upload */
	  var time;
	  if (typeof doc.time === 'string') {
	    /*
	     * Parse the time to a number. Note the loss of precision in representing 64 bit time
	     * in javascript. Will become a problem around the year 300 million.
	     */
	    time = parseInt(doc.time, 16);
	  } else {
	    time = doc.time;
	  }
	  /* If everything is as we expect */
	  if (typeof time === 'number' && doc.left_envelope.value && typeof doc.left_envelope.value === 'number') {
	    emit(time, doc.left_envelope.value);
	  }
	}
      }
    },
    right_envelope: {
      map: function (doc) {
	/* If this is a record for the right envelope */
	if (doc.right_envelope && doc.time) {
	  /* If the time is still in hex format from a direct upload */
	  var time;
	  if (typeof doc.time === 'string') {
	    /*
	     * Parse the time to a number. Note the loss of precision in representing 64 bit time
	     * in javascript. Will become a problem around the year 300 million.
	     */
	    time = parseInt(doc.time, 16);
	  } else {
	    time = doc.time;
	  }
	  /* If everything is as we expect */
	  if (typeof time === 'number' && doc.right_envelope.value && typeof doc.right_envelope.value === 'number') {
	    emit(time, doc.right_envelope.value);
	  }
	}
      }
    },
    battery: {
      map: function (doc) {
	/* If this is a record for the battery */
	if (doc.battery && doc.time) {
	  /* If the time is still in hex format from a direct upload */
	  var time;
	  if (typeof doc.time === 'string') {
	    /*
	     * Parse the time to a number. Note the loss of precision in representing 64 bit time
	     * in javascript. Will become a problem around the year 300 million.
	     */
	    time = parseInt(doc.time, 16);
	  } else {
	    time = doc.time;
	  }
	  /* If everything is as we expect */
	  if (typeof time === 'number' && doc.battery.value && typeof doc.battery.value === 'number') {
	    /* Compensate for the averaging */
	    var adc_value = doc.battery.value/10;
	    /* Determine the voltage at the adc pin, given a 1.8V ref and a 10-bit adc */
	    var pin_voltage = (adc_value*1.8)/1024;
	    /* Compensate for the resistor divider */
	    var battery_voltage = pin_voltage*11;
	    /* Output to 3 decimal places */
	    emit(time, Math.round(battery_voltage*1000)/1000);
	  }
	}
      }
    },
    rx_power: {
      map: function (doc) {
	/* If this is a record for the recieved signal strength indicator (rssi) */
	if (doc.rssi && doc.time) {
	  /* If the time is still in hex format from a direct upload */
	  var time;
	  if (typeof doc.time === 'string') {
	    /*
	     * Parse the time to a number. Note the loss of precision in representing 64 bit time
	     * in javascript. Will become a problem around the year 300 million.
	     */
	    time = parseInt(doc.time, 16);
	  } else {
	    time = doc.time;
	  }
	  /* If everything is as we expect */
	  if (typeof time === 'number' && doc.rssi.value && typeof doc.rssi.value === 'number') {
	    /* Compensate for the averaging */
	    var rssi = doc.rssi.value/1;
	    /**
	     * Determine the receiver input power. See §6.5.3 of the AT86RF212 datasheet.
	     */
	    var rx_power = -98 + (1.03*rssi);
	    /* Output to 2 decimal places */
	    emit(time, Math.round(rx_power*100)/100);
	  }
	}
      }
    }
  };
}();
