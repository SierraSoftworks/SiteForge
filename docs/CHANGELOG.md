### v1.2.3
 - Added example NGINX config to README

### v1.2.2
 - Allow SiteMap preprocessor to return falsey values for no output

### v1.2.1
 - Fixed compileStatic never calling done()

### v1.2.0
 - Added SiteMap compiler option

### v1.1.12
 - Fixed static content compilation
 - Fixed LESS compiler references

### v1.1.11
 - Fixed extension generation for static content

### v1.1.10
 - Fixed invalid `this.compilers` reference for compileStatic

### v1.1.9
 - Fixed invalid `this` reference for compileStatic 

### v1.1.7, v1.1.8
 - Switched to a custom ncp with support for renaming of files

### v1.1.6
 - Fixed extension handling for Render.outputPath

### v1.1.5
 - Improved Route.render output path selection logic

### v1.1.4
 - Fixed Route.render with nested view paths

### v1.1.3
 - Fix Route.render compiler calls
 - Revert some changes to content compiler API

### v1.1.2
 - Fix Route.render behaviour

### v1.1.1
 - Allow rendering of a view without writing a file (for partial views)

### v1.1.0
 - Switched to async compilation API
 - Simpler content generator API (file handling is handled internally now)

### v1.0.5
 - Allow view render to specify file extension for converter selection

### v1.0.3, v1.0.4
 - Further improved directory tree creation for Routes

### v1.0.2
 - All .html generated files for routes are rendered to {name}/index.html for consistency

### v1.0.1
 - Fixed Jade local variables reference
 - Fixed Less @import path references

### v1.0.0
 - Initial Version