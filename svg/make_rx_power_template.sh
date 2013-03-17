#!/bin/bash

svg_plot_gen --x-text "Time" --y-text "Received Power (dBm)" --y-first -100 --y-last -10 --y-step 15 -tc > "`dirname $0`/plot_rx_power_template.svg"
