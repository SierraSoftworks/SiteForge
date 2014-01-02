var fs = require('fs'),
	path = require('path'),
	_ = require('lodash');

var Route = module.exports = function (forge, path, done) {
	this.forge = forge;
	this.locals = _.cloneDeep(forge.locals);
	this.path = path;
	this.done = done;
}

var ensureDirectory = function (directory) {
	var parent = path.dirname(directory);
	if(!fs.existsSync(parent)) ensureDirectory(parent);
	if(!fs.existsSync(directory)) fs.mkdirSync(directory);
}

Route.prototype.outputPath = function(extension) {
	/// <summary>Gets the output path for the current route given the specified file extension</summary>

	var _path = this.path;
	if(_path[0] === '/') _path = _path.substring(1);

	if(extension[0] !== '.') extension = '.' + extension;

	if(!_path) return path.resolve(this.forge.options.output, 'index' + extension);
	if(path.extname(_path)) return path.resolve(this.forge.options.output, _path); 

	var filename = path.basename(_path, extension);
	var directory = path.dirname(_path);

	if(extension == '.html')
		return path.resolve(this.forge.options.output, directory, filename, 'index.html');
	return path.resolve(this.forge.options.output, directory || './', filename + extension);
};

Route.prototype.json = function(object, replacer, spaces) {
	/// <summary>Converts the given object to its JSON representation and saves it to file</summary>
	/// <param name="object" type="Object">The JSON object to serialize to file</param>
	/// <param name="replacer" type="Function">A function to use for replacing JSON contents</param>
	/// <param name="spaces" type="Number">The number of spaces to be used for indenting JSON</param>

	if(!this.done) return;

	var outputPath = this.outputPath('.json');
	ensureDirectory(path.dirname(outputPath));
	fs.writeFile(outputPath, JSON.stringify.apply(this, arguments), this.done);
	this.done = null;
};

Route.prototype.render = function(view, done) {
	/// <signature>
	/// <summary>Renders the given view and saves the output to the expected file</summary>
	/// <param name="view" type="Object">The name of the view file to render</param>
	/// </signature>
	/// <signature>
	/// <summary>Renders the given view and returns the output in the callback</summary>
	/// <param name="view" type="Object">The name of the view file to render</param>
	/// <param name="done" type="Function">A function to be called once the view has been rendered</param>
	/// </signature>

	if(!this.done) return;
	
	var extension = path.extname(view) || ('.' + this.forge.options.engine);
	var directory = path.dirname(view);
	var filename = path.basename(view, extension);
	
	if(extension[0] === '.') extension = extension.substring(1);

	var compiler = this.forge.options.compilers[extension];
	var viewPath = path.resolve(this.forge.options.views, directory, filename + '.' + extension);

	if(!done) {
		done = this.done;
		this.done = null;
		
		if(compiler) {			
			var outputPath = this.outputPath(compiler.extension);
			ensureDirectory(path.dirname(outputPath));
			compiler.compile(viewPath,  this.locals, (function(err, result) {
				if(err) return done(err);
				fs.writeFile(outputPath, result, done);
			}).bind(this));
		}
		else {
			var outputPath = this.outputPath('');
			ensureDirectory(path.dirname(outputPath));
			fs.readFile(viewPath, { encoding: 'utf8' }, (function(err, viewData) {
				fs.writeFile(outputPath, viewData, done);
			}).bind(this));
		}	
	} else {		
		if(compiler) {
			compiler.compile(viewPath,  this.locals, (function(err, result) {
				if(err) return done(err);
				done(null, result);
			}).bind(this));
		}
		else
			fs.readFile(viewPath, { encoding: 'utf8' }, (function(err, viewData) {	
				done(null, viewData)
			}).bind(this));	
	}
};

Route.prototype.send = function(content) {	
	/// <summary>Writes a file with the given content to disk</summary>
	/// <param name="content" type="String">The string data to write to the file</param>

	if(!this.done) return;
	
	var outputPath = this.outputPath('');
	ensureDirectory(path.dirname(outputPath));
	fs.writeFile(outputPath, content, this.done);
	this.done = null;
};

Route.prototype.file = function(filepath) {
	/// <summary>Writes a copy of the given file to the disk in place of this response</summary>
	/// <param name="filepath" type="String">The path to the file which should be copied</param>

	if(!this.done) return;
	var done = this.done;
	this.done = null;	

	var outputPath = this.outputPath(path.extname(filepath));
	ensureDirectory(path.dirname(outputPath));
	fs.readFile(path.resolve(process.cwd(), filepath), (function(err, originalFile) {
		if(err) return this.done(err);
		fs.writeFile(outputPath, originalFile, done);
	}).bind(this));
};