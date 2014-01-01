var jade = require('jade'),
	fs = require('fs');

module.exports = {
	extension: '.html',
	compile: function(source, target, locals) {
		var html = jade.renderFile(source, {
			global: locals
		});

		fs.writeFileSync(target, html);
	}
};