var Route = require('./Route'),
	_ = require('lodash'),
	path = require('path'),
	fs = require('fs');

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
}

SiteForge.prototype.compileStatic = function() {
	/// <summary>Compiles all static files whenever possible, copying them if not</summary>

	var $ = this;

	function startCopy(item) {
		var stats = fs.lstatSync(item);

		if(stats.isDirectory()) return copyDir(item);
		if(stats.isFile()) return copyFile(item);
	}

	function copyDir(directory) {
		var targetDir = directory.replace($.options.static, $.options.output);
		if(!isWritable(targetDir)) fs.mkdirSync(targetDir);
		fs.readdirSync(directory).forEach(function(item) {
			startCopy(directory + '/' + item);
		});
	}

	function copyFile(file) {
		var extension = path.extname(file);
		var basePath = path.dirname(file) + '/' + path.basename(file, extension);

		// Remove the initial '.'
		extension = extension.substring(1);

		if($.options.compilers[extension]) {
			var targetPath = basePath.replace($.options.static, $.options.output) + $.options.compilers[extension].extension;
			$.options.compilers[extension].compile(file, targetPath, $.locals);
		} else {
			fs.writeFileSync(file.replace($.options.static, $.options.output), fs.readFileSync(file));
		}
	}

	function isWritable(path) {
		try {
			fs.lstatSync(path);
			return true;
		} catch(ex) {
			return false;
		}
	}

	startCopy($.options.static);
};

SiteForge.prototype.compile = function(routes) {
	/// <summary>Compiles a website specified by a set of routes</summary>
	/// <param name="routes" type="Object">A set of route maps to use when generating the website</param>

	for(var path in routes) {
		var generator = routes[path];

		var expansionMatch = /:(\w+)/;

		if(!expansionMatch.test(path)) {
			var route = new Route(this, path);
			generator.call(route);
		} else {
			var components = [];

			// Load path components which need to be expanded
			var match = null;
			while(match = expansionMatch.exec(path))
				components.push({ placeholder: match[1], expansions: this.expansions[match[1]] });

			var path_arguments = [];
			var expand = function(path, current, nextIndex) {
				current.expansions.forEach((function(expansion) {
					path_arguments.push(expansion);

					var childPath = path.replace(':' + current.placeholder, expansion);
					if(nextIndex === components.length) {
						var route = new Route(this, childPath);
						generator.apply(this, path_arguments);
					} else
						expand(childPath, components[nextIndex], nextIndex + 1);					

					path_arguments.pop();
				}).bind(this));
			};

			expand(path, components[0], 1);
		}
	}
};

/*
 * LOAD STATIC FILE COMPILERS
 */
SiteForge.compilers = {};
fs.readdirSync(__dirname + '/compilers').forEach(function(filename) {
	SiteForge.compilers[/(.*)\.\w+/.exec(filename)[1]] = require('./compilers/' + filename);
});