var Scraper    = require('./generator/Scraper');

module.exports = function(grunt) {

    grunt.registerMultiTask(
        'infusionsoft',
        'Create classes and interfaces for Infusionsoft\'s XML-RPC API ' +
        'from their online documentation.', function() {

        var done = this.async();

        // Dump n chump
        this.files.forEach(function(f) {
            var dest = f.dest;

            new Scraper().scrapeServices().done(function(data) {
                console.log(
                    require('util')
                        .inspect(data, { depth: null, colors: true }));
            });
        });

    });

};
