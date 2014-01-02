var less = require('less'),
	path = require('path'),
	fs = require('fs');

module.exports = {
	extension: '.min.css',
	compile: function(source, target, locals) {
		var parser = new (less.Parser)({
			paths: ['.', path.dirname(source)],
			filename: path.basename(source)
		});

		source = fs.readFileSync(source, { encoding: 'utf8' });

		parser.parse(source, function(err, tree) {
			if(err) throw err;

			var css = tree.toCSS({
				compress: true
			});

			if(!css) return;

			fs.writeFileSync(target, css);
		});
	}
}