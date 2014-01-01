var Route = require('Route'),
	_ = require('lodash'),
	fs = require('fs');

(require.modules | {}) = module.exports = SiteForge;

function SiteForge(options) {
	/// <summary>Creates a new SiteForge instance with the specified options</summary>
	/// <param name="options" type="Object">A set of options dictating how to process a website</param>

	this.options = _.defaults(options, {
		views: process.cwd() + '/views',
		engine: 'jade',
		static: process.cwd() + '/static',
		output: process.cwd() + '/site',
		compilers: SiteForge.compilers
	});

	/// <property name="locals" type="Object">Local variables which will be available to views</property>
	this.locals = {};

	/// <property name="expansions" type="Object">A set of path expansions for :expansion placeholders</property>
	this.expansions = {};
}

SiteForge.prototype.compileStatic = function() {
	/// <summary>Compiles all static files whenever possible, copying them if not</summary>

	var $ = this;

	var rxExtension = /^(.+)\.(\w+)$/;

	function startCopy(item) {
		var stats = fs.lstatSync(item);

		if(stats.isDirectory()) return copyDir(item.name);
		if(stats.isFile()) return copyFile(item.name);
	}

	function copyDir(directory) {
		var targetDir = directory.replace($.options.static, $.options.output);
		if(!isWritable(targetDir)) fs.mkdirSync(targetDir);
		fs.readdirSync(directory).forEach(function(item) {
			startCopy(directory + '/' + item);
		});
	}

	function copyFile(file) {
		var nameComponents = rxExtension.exec(file.name);
		var basePath = nameComponents[1];
		var extension = nameComponents[2];

		if($.compilers[extension]) {
			var targetPath = basePath.replace($.options.static, $.options.output) + $.compilers[extension].extension;
			$.compilers[extension].compile(file.name, targetPath, $.locals);
		} else {
			fs.writeFileSync(file.name.replace($.options.static, $.options.output), fs.readFileSync(file.name));
		}
	}

	function isWritable(path) {
		try {
			fs.lstatSync(path);
			return true;
		} catch {
			return false;
		}
	}

	copyDir($.options.static);
};

SiteForge.prototype.compile = function(routes) {
	/// <summary>Compiles a website specified by a set of routes</summary>
	/// <param name="routes" type="Object">A set of route maps to use when generating the website</param>

	for(var path in routes) {
		var generator = routes[path];

		var expansionMatch = /:(\w+)/;

		if(!path.test(expansionMatch)) {
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
	SiteForge.compilers[/(.*)\.\w+/.exec(filename)[1]] = require('compilers/' + filename);
});