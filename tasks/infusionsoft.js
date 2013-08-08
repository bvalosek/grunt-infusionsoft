var Scraper          = require('./generator/Scraper');
var ServiceGenerator = require('./generator/ServiceGenerator');
var TableGenerator   = require('./generator/TableGenerator');

module.exports = function(grunt) {

    grunt.registerMultiTask(
        'infusionsoft',
        'Create classes and interfaces for Infusionsoft\'s XML-RPC API ' +
        'from their online documentation.', function() {

        var done = this.async();

        // Dump n chump
        this.files.forEach(function(f) {
            var dest = f.dest;

            var scraper = new Scraper();

            // Scrape and output all of the Service API endpoints
            scraper.scrapeServices().done(function(services) {
                services.forEach(function(service) {
                    var g = new ServiceGenerator(service);
                    grunt.file.write(
                        f.dest + '/services/' + g.moduleName + '.js', g.code);
                });
            });

            // Scrape and output all of the Tables from the dox
            scraper.scrapeTables().done(function(tables) {
                tables.forEach(function(table) {
                    var g = new TableGenerator(table);
                    grunt.file.write(
                        f.dest + '/tables/' + g.moduleName + '.js', g.code);

                });
            });

            // Create the overall namespace API

        });

    });

};
