# Richard Meadows 2013
# Generates the SVG for a graph
require 'nokogiri'
require 'color'
require 'trollop'

# Command line options
opts = Trollop::options do
	opt :template, "Output a template SVG file without an example plot", :default => false
	opt :width, "The width of the output plot in pixels", :default => 960
	opt :height, "The height of the output plot in pixels", :default => 380
	opt :x_margin, "The distance that is left between the edge of the image and the x-axis", :default => 70
	opt :y_margin, "The distance that is left between the edge of the image and the y-axis", :default => 100
	opt :margins, "The distance that is left between the edge of the image and the plot on sides that do not have labels", :default => 25
	opt :long_tick_len, "The length of the long ticks on the graph", :default => 10
	opt :short_tick_len, "The length of the short ticks on the graph", :default => 5
	opt :font_size, "The size of font used for the plot", :default => 12
	opt :label_font_size, "The size of font used for the axis labels", :default => 14
	opt :scale, "The scale that is going to be used on the y axis", :default => 'em'
end

axis_padding = 6

# Define the solarized colours
base03 = Color::RGB.from_html('002b36')
base02 = Color::RGB.from_html('073642')
base01 = Color::RGB.from_html('586e75')
base00 = Color::RGB.from_html('657b83')
base0 = Color::RGB.from_html('839496')
base1 = Color::RGB.from_html('93a1a1')
base2 = Color::RGB.from_html('eee8d5')
base3 = Color::RGB.from_html('fdf6e3')
yellow = Color::RGB.from_html('b58900')
orange = Color::RGB.from_html('cb4b16')
red = Color::RGB.from_html('dc322f')
magenta = Color::RGB.from_html('d33682')
violet = Color::RGB.from_html('6c71c4')
blue = Color::RGB.from_html('268bd2')
cyan = Color::RGB.from_html('2aa198')
green = Color::RGB.from_html('859900')

# Calculate the coordinates for the actual graph itself
xstart = opts.y_margin
xend = opts.width - opts.margins
xlen = xend - xstart
ystart = opts.margins
yend = opts.height - opts.x_margin
ylen = yend - ystart

# Read in the CSS for our font
font_css = File.read(File.dirname($0) + '/' + 'font.css')

# Load in the javascript for the cursor line script
cursor_line_js = File.read(File.dirname($0) + '/' + 'cursor_line.js')
# Replace the [XSTART] and [XEND] placeholders in the javascript
cursor_line_js = cursor_line_js.gsub(/\[XSTART\]/, xstart.to_s).gsub(/\[XEND\]/, xend.to_s)

# Work out what we're actually going to plot
if !opts.template
	# Load in the example plot
	plot = File.read(File.dirname($0) + '/' + 'path_example.dat')
	no_data_display = 'none'
else
	# Put in a split marker when the data actully goes
	plot = "[SPLIT]"
	no_data_display = "[SPLIT]"
end

# Work out the x-positions of our vertical lines and ticks
xlines_step = xlen.to_f / 24
xlines = Hash[(xstart..xend).step(xlines_step).map { |x| x.round(1) }.zip((0..24).map { |x| (x%2 == 0) })]
# Build up our x-axis labels for a 24 hour period
xlabels = (0..24).step(2).map { |hour| [['00', (hour%24).to_s].join[-2..-1], ':00'].join }.zip(xlines.select { |k, v| v }.map { |k, v| k })

# Generates the values for a logarithmic scale
if opts.scale == 'em'
	# Work out the y-positions of the horizonal lines and ticks
	ylines = Hash[(0..5).map { |y| (y < 5 ? [1, 2.5, 5, 7.5] : [1]).map { |m| [Math.log10((10**y)*m), m==1] } }.flatten(1).map { |y| [(yend - y[0]*(ylen.to_f/5)).round(1), y[1]] }]
	# Build up our y-axis labels
	ylabels = ['1000', '10000', '100000', '1e+06', '1e+07', '1e+08'].zip(ylines.select { |k ,v| v }.map { |k, v| k })
	# Set the text label
	y_text = 'Received Signal Strength'
end
# Generate the values for a linear scale
if opts.scale == 'battery'
	# Work out the y-positions of the horizonal lines and ticks
	ylines = Hash[(0..5).map { |y| (y < 5 ? [0, 0.25, 0.5, 0.75] : [0]).map { |m| [y+m, m==0] } }.flatten(1).map { |y| [(yend - y[0]*(ylen.to_f/5)).round(1), y[1]] }]
	# Build up our y-axis labels
	ylabels = (0..5).zip(ylines.select { |k ,v| v }.map { |k, v| k })
	# Set the text label
	y_text = 'Battery Voltage (V)'
end

# Output some useful info about the plot we're generating to stderr
$stderr.puts ["X Origin       ", xstart].join
$stderr.puts ["Y Origin       ", yend].join
$stderr.puts ["X Length       ", xlen].join
$stderr.puts ["Y Length       ", ylen].join
$stderr.puts ["Px per second  ", (xlen.to_f/(24*3600)).round(6)].join
$stderr.puts ["Px per decade  ", (ylen.to_f/5).round(2)].join

# Create the XML object
builder = Nokogiri::XML::Builder.new(:encoding => 'UTF-8') do |xml|
	xml.doc.create_internal_subset( # Create the DOCTYPE
		'svg',
		'-//W3C//DTD SVG 1.1//EN',
		'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'
	)
	xml.svg(:viewbox => [0, 0, opts.width, opts.height].join(' '),
		:width => opts.width,
		:height => opts.height,
		:xmlns => "http://www.w3.org/2000/svg",
		'xmlns:xlink' => "http://www.w3.org/1999/xlink",
		:onmousemove => "on_mouse_move(event)",
		:style => "font-family: 'Exo'") do
		# Font
		xml.defs do
			xml.style(:type => 'text/css') do
				xml.cdata(font_css)
			end
		end
		# Cursor Line Script
		xml.script(:type => 'text/javascript') do
			xml.cdata(cursor_line_js)
		end
		# The cursor line itself
		xml.path(:id => 'cursor_line',
			:d => ['M0,', ystart, 'l0,', ylen].join,
			:stroke => orange.html,
			'stroke-width' => '1.5',
			:display => 'none')
		# X-Axis - Vertical Lines
		xml.g(:style => "color:grey",
			:stroke => "currentColor",
			:transform => ['translate(0,', ystart, ')'].join) do

			xlines.each do |x, tl|
				xml.path(:d => ['m', x, ' 0v', ylen].join)
			end
		end
		# X-Axis - Ticks
		xml.g(:style => "color:black",
			:stroke => "currentColor",
			:transform => ['translate(0,', ystart, ')'].join) do

			xlines.each do |x, mm|
				tl = mm ? opts.long_tick_len : opts.short_tick_len # The tick length to set based on if the division is a major one
				xml.path(:d => ['m', x, ' 0v', tl, 'm0 ', ylen-(2*tl), 'v', tl].join)
			end
		end
		# X-Axis - Labels
		xml.g(:style => 'text-anchor:middle',
			:stroke => 'none',
			:transform => ['translate(0,', yend+2*opts.font_size, ')'].join,
			'font-size' => [opts.font_size, 'pt'].join,
			:fill => "#000") do

			xlabels.each do |label|
		  		xml.g(:transform => ['translate(', label[1], ')'].join) do
		  			xml.text_ label[0]
		  		end
		  	end
		end
		# X-Axis Text Label
		xml.g(:style => 'text-anchor: middle',
			:transform => ['translate(', xstart + xlen/2, ' ', opts.height - (opts.margins - opts.font_size), ')'].join,
			'font-size' => [opts.label_font_size, 'pt'].join,
			:fill => '#000') do

			xml.text_ 'Time'
		end
		# Y-Axis - Horizontal Lines
		xml.g(:style => "color:grey",
			:stroke => "currentColor",
			:transform => ['translate(', xstart, ',0)'].join) do

			ylines.each do |y, mm|
				if mm  # Only draw lines for major divisions
					xml.path(:d => ['m0 ', y, 'h', xlen].join)
				end
			end
		end
		# Y-Axis - Ticks
		xml.g(:style => "color:black",
			:stroke => "currentColor",
			:transform => ['translate(', xstart, ',0)'].join) do

			ylines.each do |y, mm|
				tl = mm ? opts.long_tick_len : opts.short_tick_len # The tick length to set based on if the division is a major one
				xml.path(:d => ['m0 ', y, 'h', tl, 'm', xlen-(2*tl), ' 0h', tl].join)
			end
		end
		# Y-Axis - Labels
		xml.g(:style => 'text-anchor:end',
			:stroke => 'none',
			:transform => ['translate(', xstart-axis_padding, ',0)'].join,
			'font-size' => [opts.font_size, 'pt'].join,
			:fill => "#000") do

			ylabels.each do |label|
		  		xml.g(:transform => ['translate(0,', label[1]+(opts.font_size/2), ')'].join) do
		  			xml.text_ label[0]
		  		end
		  	end
		end
		# Y-Axis text label
		xml.g(:style => 'text-anchor:middle',
			:transform => ['translate(', opts.margins, ' ', ystart + ylen/2, ') rotate(-90)'].join,
			'font-size' => [opts.label_font_size, 'pt'].join,
			:fill => '#000') do

		   	xml.text_ y_text
		end
		# Bounding Box
		xml.g(:stroke => "#333",
			:fill => "none") do
			xml.path(:d => ['m', xstart, ' ', ystart, 'v', ylen, 'h', xlen, 'v', -ylen , 'h', -xlen, 'z'].join)
		end
		# Plots
		xml.a('xlink:title' => 'Plot #1') do
			xml.g('stroke-width' => 1.4,
				'stroke-linejoin' => 'bevel',
				:fill => 'none') do
				xml.path(:stroke => red.html, :d => plot)
			end
		end
		xml.g(:style => 'text-anchor:middle',
			:stroke => red.html,
			:transform => ['translate(', xstart + xlen/2, ',', ystart + ylen/2, ')'].join,
			'font-size' => [opts.label_font_size+16, 'pt'].join,
			:display => no_data_display,
			:fill => red.html) do

			xml.text_ 'No Data Found'
		end
		# An invisible rectangle
		xml.rect(:x => 0, :y => 0,
			:width => opts.width,
			:height => opts.height,
			:fill => 'white',
			'fill-opacity' => 0,
			:stroke => 'none',
			'stroke-width' => 0,
			:onclick => 'null_handler')
	end

end
# Output the XML
puts builder.to_xml
