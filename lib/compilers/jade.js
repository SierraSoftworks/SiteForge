var jade = require('jade');

module.exports = {
	extension: 'html',
	compile: jade.render
};