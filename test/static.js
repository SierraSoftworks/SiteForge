var SiteForge = require('../'),
	should = require('should'),
	path = require('path'),
	fs = require('fs');

describe('static files', function() {
	var forge = new SiteForge({
		views: './test/resources/views',
		static: './test/resources/static',
		output: './test/output'
	});

	it('should correctly compile static files', function(done) {
		forge.compileStatic(function() {
			fs.existsSync(path.resolve(forge.options.output, 'bootstrap.min.css')).should.be.true;
			fs.existsSync(path.resolve(forge.options.output, 'style.min.css')).should.be.true;
			done();
		});
	});
});