var SiteForge = require('../'),
	should = require('should'),
	path = require('path'),
	fs = require('fs');

describe('routes', function() {
	var forge = new SiteForge({
		views: './test/resources/views',
		static: './test/resources/static',
		output: './test/output'
	});

	it('should correctly dispatch routes', function(done) {
		forge.compile({
			'/': function() {
				this.path.should.eql('/');
				done();
			}
		});
	});

	it('should correctly inherit locals', function(done) {
		forge.locals.expected = true;

		forge.compile({
			'/': function() {
				this.locals.should.eql({ expected: true });
				done();
			}
		})
	});
});