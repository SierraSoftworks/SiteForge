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
		forge.routes = {
			'/': function() {
				this.path.should.eql('/');
				done();
			}
		};

		forge.compileDynamic();
	});

	it('should correctly inherit locals', function(done) {
		forge.locals.expected = true;
		forge.routes = {
			'/': function() {
				this.locals.should.eql({ expected: true });
				done();
			}
		};

		forge.compileDynamic();
	});

	it('should not allow child locals to manipulate original locals', function(done) {
		forge.locals.expected = true;
		forge.routes = {
			'/': function() {
				this.locals.should.eql({ expected: true });
				this.locals.expected = false;
				forge.locals.should.eql({ expected: true });
				done();
			}
		};

		forge.compileDynamic();
	});

	it('should correctly expand paths', function(done) {		
		var remaining = ['/test1', '/test2'];

		forge.expansions.expand = ['test1', 'test2'];
		forge.routes = {
			'/:expand': function(expansion) {
				should.exist(expansion);
				this.path.should.eql('/' + expansion);
				remaining.splice(remaining.indexOf(this.path), 1);
				if(remaining.length === 0) done();
			}
		};

		forge.compileDynamic();
	});

	it('should correctly expand nested paths', function(done) {		
		var remaining = ['/x/a', '/x/b', '/y/a', '/y/b'];

		forge.expansions.expand1 = ['x', 'y'];
		forge.expansions.expand2 = ['a', 'b']
		forge.routes = {
			'/:expand1/:expand2': function(exp1, exp2) {
				should.exist(exp1);
				should.exist(exp2);

				this.path.should.eql('/' + exp1 + '/' + exp2);
				remaining.splice(remaining.indexOf(this.path), 1);
				if(remaining.length === 0) done();
			}
		};

		forge.compileDynamic();
	});
});