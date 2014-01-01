var fs = require('fs');

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
	///<summary>Renders the given view and saves the output to the expected file</summary>
	///<param name="view" type="Object">The name of the view file to render</param>

	var compiler = this.forge.options.compilers[this.forge.options.engine];

	var viewPath = this.forge.options.views + '/' + view + '.' + this.forge.options.engine;
	var outputPath = this.forge.options.output + this.path + compiler.extension;
	compiler.compile(viewPath, outputPath, this.locals);
};