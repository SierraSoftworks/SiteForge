var less = require('less'),
	path = require('path'),
	fs = require('fs');

module.exports = {
	extension: 'min.css',
	compile: function(source, locals, done) {
		var parser = new (less.Parser)({
			paths: ['.', path.dirname(source)],
			filename: path.basename(source)
		});

		parser.parse(source, function(err, tree) {
			if(err) return done(err);

			var css = tree.toCSS({
				compress: true
			});

			return done(null, css);
		});
	}
}