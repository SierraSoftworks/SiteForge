var SiteForge = require('../'),
	should = require('should'),
	path = require('path'),
	fs = require('fs');

describe('generator', function() {
	var forge = new SiteForge({
		views: './test/resources/views',
		static: './test/resources/static',
		output: './test/output'
	});

	it('should correctly provide all generator methods and properties', function(done) {
		forge.routes = {
			'/': function() {
				this.should.have.ownProperty('path', '/');
				this.should.have.ownProperty('forge', forge);
				this.should.have.ownProperty('locals', forge.locals);

				['json', 'render', 'send', 'file', 'outputPath'].forEach((function(method) {
					this.should.have.property(method).with.type('function');
				}).bind(this));

				done();
			}
		};

		forge.compileDynamic();
	});

	describe('outputPath', function() {
		it('should correctly handle the base path', function(done) {
			forge.routes = {
				'/': function() {
					this.outputPath('.html').should.eql(path.resolve(forge.options.output, 'index.html'));
					this.outputPath('.json').should.eql(path.resolve(forge.options.output, 'index.json'));

					done();
				}
			};

			forge.compileDynamic();
		});

		it('should correctly handle full paths', function(done) {
			forge.routes = {
				'output.json': function() {
					this.outputPath('.json').should.eql(path.resolve(forge.options.output, 'output.json'));

					done();
				}
			};

			forge.compileDynamic();
		});

		it('should correctly handle partial paths', function(done) {
			forge.routes = {
				'output': function() {
					this.outputPath('.json').should.eql(path.resolve(forge.options.output, 'output.json'));
					this.outputPath('.html').should.eql(path.resolve(forge.options.output, 'output/index.html'));

					done();
				}
			};

			forge.compileDynamic();
		});
	});

	describe('outputs', function() {
		it('should render json correctly to file', function(done) {
			forge.routes = {
				'/output': function() {
					this.json({ valid: true });
					fs.existsSync(path.resolve(forge.options.output, 'output.json')).should.be.true;
					fs.readFileSync(path.resolve(forge.options.output, 'output.json'), { encoding: 'utf8' }).should.eql('{"valid":true}');
					done();
				}
			};

			forge.compileDynamic();
		});

		it('should render direct content to file', function(done) {
			forge.routes = {
				'/files/output.txt': function() {
					this.send("valid: true");
					fs.existsSync(path.resolve(forge.options.output, 'files/output.txt')).should.be.true;
					fs.readFileSync(path.resolve(forge.options.output, 'files/output.txt'), { encoding: 'utf8' }).should.eql('valid: true');
					done();
				}
			};

			forge.compileDynamic();
		});

		it('should render files correctly', function(done) {
			forge.routes = {
				'/stylesheet': function() {
					this.file('test/resources/static/style.less');
					fs.existsSync(path.resolve(forge.options.output, 'stylesheet.less')).should.be.true;
					var expected = fs.readFileSync(path.resolve(process.cwd(), 'test/resources/static/style.less'), { encoding: 'utf8' });
					fs.readFileSync(path.resolve(forge.options.output, 'stylesheet.less'), { encoding: 'utf8' }).should.eql(expected);
					done();
				}
			};

			forge.compileDynamic();
		});

		it('should correctly render views', function(done) {
			forge.routes = {
				'/': function() {
					this.render('index');
					fs.existsSync(path.resolve(forge.options.output, 'index.html')).should.be.true;
					var expected = fs.readFileSync(path.resolve(process.cwd(), 'test/resources/expected/index.html'), { encoding: 'utf8' });
					fs.readFileSync(path.resolve(forge.options.output, 'index.html'), { encoding: 'utf8' }).should.eql(expected);
					done();
				}
			};

			forge.compileDynamic();
		});
	});
});