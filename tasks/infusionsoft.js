var Scraper          = require('./generator/Scraper');
var ServiceGenerator = require('./generator/ServiceGenerator');

module.exports = function(grunt) {

    grunt.registerMultiTask(
        'infusionsoft',
        'Create classes and interfaces for Infusionsoft\'s XML-RPC API ' +
        'from their online documentation.', function() {

        var done = this.async();

        // Dump n chump
        this.files.forEach(function(f) {
            var dest = f.dest;

            // Scrape and output all of the Service API endpoints
            new Scraper().scrapeServices().done(function(services) {
                services.forEach(function(service) {
                    var g = new ServiceGenerator(service);
                    grunt.file.write(
                        f.dest + '/services/' + g.moduleName + '.js', g.code);
                });
            });

            // Scrape and output all of the Tables from the dox

            // Create the overall namespace API


        });

    });

};
