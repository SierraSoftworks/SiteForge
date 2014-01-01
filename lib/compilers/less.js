var less = require('less'),
	fs = require('fs');

module.exports = {
	extension: '.min.css',
	compile: function(source, target, locals) {
		source = fs.readFileSync(source, { encoding: 'utf8' });
		less.render(source, function(err, css) {
			if(err) throw err;
			fs.writeFileSync(target, css);
		})
	}
}