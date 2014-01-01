var less = require('less'),
	path = require('path'),
	fs = require('fs');

module.exports = {
	extension: '.min.css',
	compile: function(source, target, locals) {
		source = fs.readFileSync(source, { encoding: 'utf8' });

		var parser = new (less.Parser)({
			paths: ['.'],
			filename: path.basename(source)
		});

		parser.parse(source, function(err, tree) {
			if(err) throw err;

			var css = tree.toCSS({
				compress: true
			});

			fs.writeFileSync(target, css);
		});
	}
}