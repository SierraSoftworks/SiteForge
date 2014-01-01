# SiteForge
**Powerful Static Website Generator**

## What Is SiteForge?
SiteForge is a static website generator tool built around a set of assumptions around how a website is structured. It aims to provide more flexibility than previous solutions while still providing much of the power available in templating solutions.

SiteForge websites consist of a number of components, their design will be similar to those used in dynamic websites built using Jade and Express. Namely, a routing table, view templates and static resources.

## Example Website
```javascript
var SiteForge = require('siteforge');

var forge = new SiteForge({
	views: __dirname + '/views',
	static: __dirname + '/static',
	output: __dirname + '/site'
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

var routes = {
	'/': function() {
		this.view('index');
	},
	'/projects': function() {
		this.locals.projects = projects;
		this.view('projects');
	},
	'/:project': function(project) {
		this.locals.project = projects[project];
		this.view('project');
	}
};

forge.compile(routes);
```