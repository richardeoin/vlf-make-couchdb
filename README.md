**vlf-make-couchdb** is a [node.js](http://nodejs.org/) script that builds a [CouchDB](http://couchdb.apache.org/) [design document](http://guide.couchdb.org/draft/design.html) for the vlf app.

## Installation ##

If you have [npm](https://npmjs.org/) installed, clone the repo and run

```
npm install
```

to grab the dependancies.

## Usage ##

If you were running CouchDB on the default port on the local machine, with the database name `vlf_fft` then you would run it like this

```
node make_design.js --ddoc vlf --database vlf_fft --host localhost --port 5984
```

SVG templates for the graphs need to be generated too, although [default](svg/plot_em_template.svg) [ones](svg/plot_battery_template.svg) already exist.
You'll need [ruby](http://www.ruby-lang.org/) installed, then run

```
ruby svg/gen/gen.rb --help
```

to start with. TODO write some more about this, make a gemfile.

## LICENSE ###

MIT
