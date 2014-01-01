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

	it('should correctly compile static files', function() {
		forge.compileStatic();

		var basePath = path.resolve(process.cwd(), './test/output');

		fs.existsSync(path.resolve(basePath, './bootstrap.min.css')).should.be.true;
		fs.existsSync(path.resolve(basePath, './style.min.css')).should.be.true;
	});
});