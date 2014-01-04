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

			var compiler = this.options.compilers[extension];
			if(!compiler) return file;

			return path.resolve(path.dirname(file), path.basename(file, '.' + extension) + '.' + compiler.extension);
		}).bind(this),
		transform: (function(read, write, file) {
			var extension = path.extname(file.name);
			if(!extension) return read.pipe(write);
			extension = extension.substring(1);

			var compiler = this.options.compilers[extension];
			if(!compiler) return read.pipe(write);
			
			compiler.compile(file.name, {}, function(err, output) {
				if(err) throw err;
				write.end(output, 'utf8');
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

SiteForge.prototype.compileSiteMap = function(preprocessor, done) {
	/// <signature>
	/// <summary>Compiles a sitemap.xml file which describes all routes</summary>
	/// <param name="host" type="String">The proper base URI of the host on which this site will be hosted</param>
	/// <param name="done" type="Function">A function to be called once the sitemap has been generated</param>
	/// </signature>
	/// <signature>
	/// <summary>Compiles a sitemap.xml file which describes all routes</summary>
	/// <param name="preprocessor" type="Function">A function which preprocesses a path into the sitemap url object</param>
	/// <param name="done" type="Function">A function to be called once the sitemap has been generated</param>
	/// </signature>

	if("string" == typeof preprocessor) {
		var host = preprocessor;
		if(host[host.length - 1] == '/')
			host = host.substring(0, host.length - 1);
		preprocessor = function(rel) {
			return { loc: host + rel };
		};
	}

	var siteMap = [];
	_.each(this.routes, (function(generator, path) {
		var expansionMatch = /:(\w+)/g;
		if(!expansionMatch.test(path)) {
			siteMap.push(path);
		} else {
			expansionMatch = /:(\w+)/g;
			var components = [];

			// Load path components which need to be expanded
			var match = null;
			while(match = expansionMatch.exec(path));
			while(match = expansionMatch.exec(path))
				components.push({ placeholder: match[1], expansions: this.expansions[match[1]] });
			
			var expandPath = (function(path, current, nextIndex) {
				current.expansions.forEach((function(expansion) {
					var childPath = path.replace(':' + current.placeholder, expansion);
					if(nextIndex == components.length) {
						siteMap.push(childPath);
					} else
						expandPath(childPath, components[nextIndex], nextIndex + 1);
				}).bind(this));
			});
			expandPath(path, components[0], 1);				
		}
	}).bind(this));

	var data = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
	];

	siteMap.forEach(function(path) {
		var pathInfo = preprocessor(path);
		if(!pathInfo) return;
		
		if('string' == typeof pathInfo) data.push(pathInfo);
		else {
			data.push('<url>');
			for(var k in pathInfo) {
				data.push('<' + k + '>' + pathInfo[k] + '</' + k + '>');
			}
			data.push('</url>');
		}
	});

	data.push('</urlset>');

	fs.writeFile(path.resolve(this.options.output, 'sitemap.xml'), data.join('\r\n'), { encoding: 'utf8' }, done);
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