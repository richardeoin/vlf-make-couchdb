#!/bin/bash

# svg_plot_gen --log --x-text "Time" --y-text "Relative Signal Strength" --y-first 5 --y-last 8 -tc > "`dirname $0`/plot_em_template.svg"
svg_plot_gen --x-text "Time" --y-text "Relative Signal Strength" --y-first 0 --y-last 400 --y-step 100 -tc > "`dirname $0`/plot_em_template.svg"

