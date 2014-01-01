# SiteForge Library API
SiteForge's library consists of the Forge "class" which is responsible for generating a website from your website definition. This class provides two methods which execute (mostly) synchronously, with some exceptions.

## SiteForge([options])
The SiteForge constructor accepts an optional `options` argument which allows you to customize some of SiteForge's behaviour, including which compilers are used, which directories are searched for files and your final website's output directory.

```javascript
var forge = new SiteForge({
	views: './views',
	static: './static',
	output: './site',

	engine: 'jade',
	compilers: SiteForge.compilers
});
```

## Static Properties

### SiteForge.compilers
The `SiteForge.compilers` collection allows you to customize the compilers available for static content generation. The `options.engine` parameter also uses this collection to determine the compiler to use (and the correct file extension to make use of for views).

An example of a compiler is the following (it simply replaces any static .hw files with a 'Hello World!' page).

```javascript
SiteForge.compilers.hw = {
	extension: '.html',
	compile: function(source, target, locals) {
		fs.writeFileSync(target, '<h1>Hello World</h1>');
	}
};
```

## Instance Properties

### options
This property returns the `options` object that was passed to the `SiteForge` constructor, with any missing properties replaced with their defaults and all paths expanded to their full form.

### locals
This property allows you to globally set variables that will be available to all compilers, they are used to allow views to access runtime information (for example, content from a database or web service).

### expansions
SiteForge allows you to generate pages for non-static paths using common generators through the use of path expansions. These work similarly to Express.js' `params` with the exception that (since the content is static) all valid possibilities need to be known beforehand.

If you wish to use a `:name` expansion in one of your paths, you need to set the relevant `expansions.name` to an array of strings representing each valid expansion. These expansions are passed to the generator as parameters in the order they appear, allowing you to taylor the content to the path.

For example, a website with a number of different projects might use a route like this:

```javascript
var projects = {
	project1: { ... },
	project2: { ... }
};

forge.expansions.project = Object.keys(projects);
forge.compile({
	'/:project': function(project) { ... }
})
```

### compileStatic()
This method can be used on a SiteForge instance, and instructs this instance to compile all static site resources. This process consists of recursively scanning the `options.static` directory for files, compiling those for which a valid compiler is present in `options.compilers` and copying directly for those for which a compiler is not present. The output files will be placed in the `options.output` directory, with the same directory structure as `options.static`.

#### Example
```
./static/
  - css/
    - bootstrap.min.css
    - style.less
  - js/
    - jquery.min.js
    - bootstrap.min.js
  logo.png

./site
  - css/
    - bootstrap.min.css
    - style.min.css
  - js/
    - jquery.min.js
    - bootstrap.min.js
  logo.png
```

### compile(routes)
This method works similarly to `SiteForge.prototype.compileStatic()` however it is designed to allow the generation of vastly more complex content through the use of generator functions and path component expansions. Because of the way it is designed, it is possible to generate a complex website from a dynamic data store - allowing you to serve static content while allowing faster content creation.

The `routes` parameter represents a map of paths to their generator functions, and allows the use of path expansions to generate exponentially more routes than are defined.

You can manipulate the output path (and effective URL) of the file by changing `this.path` within the generator prior to calling an output function like `this.render`, `this.json`, `this.send` or `this.file`. 

Similarly, you can locally manipulate the `locals` passed to a view by changing `this.locals` prior to the `this.render` call. Take note that changing `this.locals` will **not** affect the instance's `locals`.

**Important**, routes should always begin with a `'/'`, or set `this.path = '/' + ...` at some point within their generator, for them to work correctly.

```javascript
forge.compile({
	'/': function() {
		this.locals.title = 'SiteForge';
		this.render('index');
	},
	'/about': function() {
		this.locals.title = 'About | SiteForge';
		this.render('about');
	},
	'/humans': function() {
		this.path = '/humans.txt';
		this.send([
			'# Authors',
			'**Benjamin Pannell** @[Sierra Softworks](https://sierrasoftworks.com)'
		].join('\r\n'));
	}
})
```