var SiteForge = require('../'),
	should = require('should'),
	path = require('path'),
	fs = require('fs');

describe('sitemap', function() {
	var forge = new SiteForge({
		views: './test/resources/views',
		static: './test/resources/static',
		output: './test/output'
	});

	it('should correctly generate a sitemap for basic routes', function(done) {
		forge.routes = {
			'/': function() { },
			'/home': function() { }
		};

		forge.compileSiteMap('http://localhost:3000/', function(err) {
			if(err) return done(err);
			fs.existsSync(path.resolve(forge.options.output, 'sitemap.xml')).should.be.true;
			fs.readFileSync(path.resolve(forge.options.output, 'sitemap.xml'), { encoding: 'utf8' }).should.eql([
				'<?xml version="1.0" encoding="UTF-8"?>',
				'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
				'<url>','<loc>http://localhost:3000/</loc>','</url>',
				'<url>','<loc>http://localhost:3000/home</loc>','</url>',
				'</urlset>'
			].join('\r\n'));

			done();
		})
	});

	it('should correctly generate a sitemap for expanded routes', function(done) {
		forge.expansions.route = ['test1','test2'];
		forge.routes = {
			'/:route': function() { }
		};

		forge.compileSiteMap('http://localhost:3000/', function(err) {
			if(err) return done(err);
			fs.existsSync(path.resolve(forge.options.output, 'sitemap.xml')).should.be.true;
			fs.readFileSync(path.resolve(forge.options.output, 'sitemap.xml'), { encoding: 'utf8' }).should.eql([
				'<?xml version="1.0" encoding="UTF-8"?>',
				'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
				'<url>','<loc>http://localhost:3000/test1</loc>','</url>',
				'<url>','<loc>http://localhost:3000/test2</loc>','</url>',
				'</urlset>'
			].join('\r\n'));

			done();
		})
	});

	it('should allow correct preprocessing of routes', function(done) {
		forge.routes = {
			'/': function() { },
			'/home': function() { }
		};

		forge.compileSiteMap(function(route) {
			return {
				loc: 'http://localhost:3000' + route,
				priority: 0.5,
				changefreq: 'daily'
			}
		}, done, function(err) {
			if(err) return done(err);
			fs.existsSync(path.resolve(forge.options.output, 'sitemap.xml')).should.be.true;
			fs.readFileSync(path.resolve(forge.options.output, 'sitemap.xml'), { encoding: 'utf8' }).should.eql([
				'<?xml version="1.0" encoding="UTF-8"?>',
				'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
				'<url>','<loc>http://localhost:3000/</loc>', '<priority>0.5</priority>', '<changefreq>daily</changefreq>','</url>',
				'<url>','<loc>http://localhost:3000/home</loc>', '<priority>0.5</priority>', '<changefreq>daily</changefreq>','</url>',
				'</urlset>'
			].join('\r\n'));

			done();
		})
	});
});