var SiteForge = null,
	should = require('should');

it('should correctly allow loading of the module', function() {
	(function() { SiteForge = require('../'); }).should.not.throwError();
	should.exist(SiteForge);
});

it('should correctly allow instantiation of a forge', function() {
	var forge = new SiteForge();
	should.exist(forge);
	forge.should.be.instanceOf(SiteForge);

	var forge2 = SiteForge();
	should.exist(forge2);
	forge2.should.be.instanceOf(SiteForge);
});