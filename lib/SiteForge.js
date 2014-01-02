var Route = require('./Route'),
	_ = require('lodash'),
	async = require('async'),
	path = require('path'),
	fs = require('fs'),
	ncp = require('ncp').ncp;

var SiteForge = (require.modules || {}).SiteForge = module.exports = function (options) {
	/// <summary>Creates a new SiteForge instance with the specified options</summary>
	/// <param name="options" type="Object">A set of options dictating how to process a website</param>

	if(!(this instanceof SiteForge)) return new SiteForge(options);

	this.options = _.defaults(options || {}, {
		views: './views',
		engine: 'jade',
		static: './static',
		output: './site',
		compilers: SiteForge.compilers
	});

	// Ensure that all paths are absolute
	['views', 'static', 'output'].forEach((function(option) {
		this.options[option] = path.resolve(process.cwd(), this.options[option]);
	}).bind(this));

	/// <property name="locals" type="Object">Local variables which will be available to views</property>
	this.locals = {};

	/// <property name="expansions" type="Object">A set of path expansions for :expansion placeholders</property>
	this.expansions = {};

	/// <property name="routes" type="Object">A set of routes used to generate dynamic content</property>
	this.routes = {};
}

SiteForge.prototype.compileStatic = function(done) {
	/// <summary>Compiles all static files whenever possible, copying them if not</summary>

	ncp(this.options.static, this.options.output, {
		clobber: true,
		rename: (function(file) {
			var extension = path.extname(file);
			if(!extension) return file;
			extension = extension.substring(1);

			var compiler = this.compilers[extension];
			if(!compiler) return file;

			return path.resolve(path.dirname(file), path.basename(file, '.' + extension) + compiler.extension);
		}).bind(this),
		transform: (function(read, write, file) {
			var extension = path.extname(file);
			if(!extension) return read.pipe(write);
			extension = extension.substring(1);

			var compiler = this.compilers[extension];
			if(!compiler) return read.pipe(write);
			
			compiler.compile(file, {}, function(err, output) {
				if(err) throw err;
				write.write(output, 'utf8');
			});
		}).bind(this)
	}, done);
};

SiteForge.prototype.compileDynamic = function(done) {
	/// <summary>Compiles a website specified by a set of routes</summary>

	async.parallel(_.map(this.routes, (function(generator, path) {
		return (function(done) {
			var expansionMatch = /:(\w+)/g;
			if(!expansionMatch.test(path)) {
				var route = new Route(this, path, done);
				generator.call(route);
			} else {
				expansionMatch = /:(\w+)/g;
				var components = [];

				// Load path components which need to be expanded
				var match = null;
				while(match = expansionMatch.exec(path));
				while(match = expansionMatch.exec(path))
					components.push({ placeholder: match[1], expansions: this.expansions[match[1]] });
			
				var paths = [];
				var path_arguments = [];
				var expandPath = (function(path, current, nextIndex) {
					current.expansions.forEach((function(expansion) {
						path_arguments.push(expansion);

						var childPath = path.replace(':' + current.placeholder, expansion);
						if(nextIndex == components.length) {
							paths.push({ route: childPath, args: _.cloneDeep(path_arguments) });
						} else
							expandPath(childPath, components[nextIndex], nextIndex + 1);					

						path_arguments.pop();
					}).bind(this));
				});
				expandPath(path, components[0], 1);

				async.series(_.map(paths, (function(path) {
					return (function(done) {
						var route = new Route(this, path.route, done);
						generator.apply(route, path.args);
					}).bind(this);
				}).bind(this)), done);
			}
		}).bind(this);
	}).bind(this)), done);
};

SiteForge.prototype.compile = function(done) {
	/// <summary>Compiles both static and dynamic content for the relevant website</summary>

	this.compileDynamic((function(err) {
		if(err) return done(err);
		this.compileStatic(done);
	}).bind(this));	
}

/*
 * LOAD STATIC FILE COMPILERS
 */
SiteForge.compilers = {};
fs.readdirSync(__dirname + '/compilers').forEach(function(filename) {
	SiteForge.compilers[/(.*)\.\w+/.exec(filename)[1]] = require('./compilers/' + filename);
});