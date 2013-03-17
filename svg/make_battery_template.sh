#!/bin/bash

svg_plot_gen --x-text "Time" --y-text "Battery Voltage (V)" -tc > "`dirnanme $0`/plot_battery_template.svg"
