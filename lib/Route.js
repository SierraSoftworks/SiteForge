var fs = require('fs'),
	path = require('path'),
	_ = require('lodash');

var Route = module.exports = function (forge, path) {
	this.forge = forge;
	this.locals = _.cloneDeep(forge.locals);
	this.path = path;
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

	var outputPath = this.outputPath('.json');
	ensureDirectory(outputPath);
	fs.writeFileSync(outputPath, JSON.stringify.apply(this, arguments));
};

Route.prototype.render = function(view) {
	/// <summary>Renders the given view and saves the output to the expected file</summary>
	/// <param name="view" type="Object">The name of the view file to render</param>

	var compiler = this.forge.options.compilers[this.forge.options.engine];
	var viewPath = path.resolve(this.forge.options.views, view + '.' + this.forge.options.engine);

	var outputPath = this.outputPath(compiler.extension);
	ensureDirectory(outputPath);
	compiler.compile(viewPath, outputPath, this.locals);
};

Route.prototype.send = function(content) {	
	/// <summary>Writes a file with the given content to disk</summary>
	/// <param name="content" type="String">The string data to write to the file</param>

	var outputPath = this.outputPath('');
	ensureDirectory(outputPath);
	fs.writeFileSync(outputPath, content);
};

Route.prototype.file = function(filepath) {
	/// <summary>Writes a copy of the given file to the disk in place of this response</summary>
	/// <param name="filepath" type="String">The path to the file which should be copied</param>


	var outputPath = this.outputPath(path.extname(filepath));
	var dir = path.dirname(outputPath);
	if(!fs.existsSync(dir)) fs.mkdirSync(dir);

	fs.writeFileSync(outputPath, fs.readFileSync(path.resolve(process.cwd(), filepath)));
};