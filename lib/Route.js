var fs = require('fs'),
	_ = require('lodash');

var Route = module.exports = function (forge, path) {
	this.forge = forge;
	this.locals = _.cloneDeep(forge.locals);
	this.path = path;
}

Route.prototype.json = function(object, replacer, spaces) {
	/// <summary>Converts the given object to its JSON representation and saves it to file</summary>
	/// <param name="object" type="Object">The JSON object to serialize to file</param>
	/// <param name="replacer" type="Function">A function to use for replacing JSON contents</param>
	/// <param name="spaces" type="Number">The number of spaces to be used for indenting JSON</param>

	var outputPath = this.forge.options.output + this.path;
	fs.writeFileSync(outputPath, JSON.stringify.apply(this, arguments));
};

Route.prototype.render = function(view) {
	/// <summary>Renders the given view and saves the output to the expected file</summary>
	/// <param name="view" type="Object">The name of the view file to render</param>

	var compiler = this.forge.options.compilers[this.forge.options.engine];

	var viewPath = this.forge.options.views + '/' + view + '.' + this.forge.options.engine;
	var outputPath = this.forge.options.output + this.path + compiler.extension;
	compiler.compile(viewPath, outputPath, this.locals);
};

Route.prototype.send = function(content) {	
	/// <summary>Writes a file with the given content to disk</summary>
	/// <param name="content" type="String">The string data to write to the file</param>

	var outputPath = this.forge.options.output + this.path;
	fs.writeFileSync(outputPath, content);
};

Route.prototype.file = function(path) {
	/// <summary>Writes a copy of the given file to the disk in place of this response</summary>
	/// <param name="path" type="String">The path to the file which should be copied</param>

	var outputPath = this.forge.options.output + this.path;
	fs.writeFileSync(outputPath, fs.readFileSync(path));
};