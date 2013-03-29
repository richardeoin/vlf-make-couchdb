# Generates the SVG templates for all the graphs

all: em battery envelope rx_power

em:
	@echo "\n---- Em ----\n"
	@# svg_plot_gen --log --x-text "Time" --y-text "Relative Signal Strength" --y-first 5 --y-last 8 -tc > "`dirname $0`/plot_em_template.svg"
	svg_plot_gen --x-text "Time" --y-text "Relative Signal Strength" --y-first 0 --y-last 400 --y-step 100 -tc > plot_em_template.svg

battery:
	@echo "\n---- Battery ----\n"
	svg_plot_gen --x-text "Time" --y-text "Battery Voltage (V)" --y-first 0 --y-last 5 -tc > plot_battery_template.svg

envelope:
	@echo "\n---- Envelope ----\n"
	svg_plot_gen --x-text "Time" --y-text "ADC Value (1000s)" --y-first 0 --y-last 35 --y-step 5 -tc > plot_envelope_template.svg

rx_power:
	@echo "\n---- Rx Power ----\n"
	svg_plot_gen --x-text "Time" --y-text "Received Power (dBm)" --y-first -100 --y-last -10 --y-step 15 -tc > plot_rx_power_template.svg

clean:
	rm -rf *svg

