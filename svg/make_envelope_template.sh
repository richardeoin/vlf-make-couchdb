#!/bin/bash

svg_plot_gen --x-text "Time" --y-text "ADC Value (1000s)" --y-first 0 --y-last 35 --y-step 5 -tc > "`dirname $0`/plot_envelope_template.svg"

