#!/bin/bash

svg_plot_gen --log --x-text "Time" --y-text "Relative Signal Strength" --y-first 3 --y-last 8 -tc > "`dirname $0`/plot_em_template.svg"

