# SiteForge
**Powerful Static Website Generator**

## What Is SiteForge?
SiteForge is a static website generator tool built around a set of assumptions around how a website is structured. It aims to provide more flexibility than previous solutions while still providing much of the power available in templating solutions.

SiteForge websites consist of a number of components, their design will be similar to those used in dynamic websites built using Jade and Express. Namely, a routing table, view templates and static resources.

## Advantages
SiteForge gives you the advantages usually only available with dynamic websites, namely the ability to generate content using templates and backing data stores, while still being able to serve static content - reducing server overhead and response times. It has been designed to be easily usable by anyone with experience using common web frameworks like Express.js, and integrates beautifully into your Continuous Deployment toolchain when paired with rsync.

## Features
 - **Flexible Content Generation** SiteForge makes it possible to generate complex static websites using generator functions, allowing you to generate static websites from dynamic data sources.
 - **Static Resource Compilation** Want to develop in LESS and deploy minified CSS? Do so easily using SiteForge's powerful static resource compilation framework with bundled support for LESS and Jade.

## Example Website
```javascript
var SiteForge = require('siteforge');

var forge = new SiteForge({
	views: './views',
	static: './static',
	output: './site'
});

forge.locals.menu = [
	{ title: 'Home', url: '/' },
	{ title: 'Projects', url: '/projects' }
];

var projects = {
	project1: { title: 'Project One', abstract: 'projects/project1/abstract' , view: 'projects/project1/page' }
};

// Expands :project path components into the array's values
forge.expansions.project = Object.keys(projects);

forge.routes = {
	'/': function() {
		this.render('index');
	},
	'/projects': function() {
		this.locals.projects = projects;
		this.render('projects');
	},
	'/:project': function(project) {
		this.locals.project = projects[project];
		this.render('project');
	}
};

// Compile website (static and "dynamic" content)
forge.compile();
```