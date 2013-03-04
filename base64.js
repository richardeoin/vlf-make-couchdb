/* Richard Meadows 2013 */

/* Exports a function that decodes 32 characters of Base64 data into an array of 24 octets */

exports = module.exports = function() {
	return function(base64_string) {
		/* Extend string */
		String.prototype.base64At = function(pos) {
			var code = this.charCodeAt(pos);

			if (code > 64 && code < 91) { /* A - Z */
				return code - 65;
			} else if (code > 96 && code < 123) { /* a - z */
				return code - 71;
			} else if (code > 47 && code < 58) { /* 0 - 9 */
				return code + 4;
			} else if (code === 43) { /* + */
				return 62;
			} else if (code === 47) { /* / */
				return 63;
			}

			return null; /* Invalid code */
		};

		var output = new Array();

		var index;
		for (index = 0; index < 32; ) {
			/* Read 4 characters into our quad */
			var quad = 0, q;
			for (q = 0; q < 4; q++) {
				/* Add the decoded character to our triple */
				quad += base64_string.base64At(index);
				/* Shift up 6 places */
				if (q !== 3) { quad *= 64; }
				/* Move along the input string */
				index += 1;
			}

			/* Read this quad into a triple of octets, little endian */
			var triple = [], t;
			for (t = 0; t < 3; t++) {
				/* Add the lower octet to our triple */
				triple.push(quad % 256);
				/* Shift the quad down 8 places */
				quad = Math.floor(quad / 256);
			}

			/* Push each value of our triple to our output, big endian */
			output.push(triple[2], triple[1], triple[0]);
		}

		return output;
	}
}();
