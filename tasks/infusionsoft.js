var Scraper            = require('./generator/Scraper');
var ServiceGenerator   = require('./generator/ServiceGenerator');
var TableGenerator     = require('./generator/TableGenerator');
var NamespaceGenerator = require('./generator/NamespaceGenerator');
var Q                  = require('q');

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
            var ps = scraper.scrapeServices().then(function(services) {
                services.forEach(function(service) {
                    var g = new ServiceGenerator(service);
                    grunt.file.write(
                        f.dest + '/services/' + g.moduleName + '.js', g.code);
                });
            });

            // Scrape and output all of the Tables from the dox
            var pt = scraper.scrapeTables().then(function(tables) {
                tables.forEach(function(table) {
                    var g = new TableGenerator(table);
                    grunt.file.write(
                        f.dest + '/tables/' + g.moduleName + '.js', g.code);

                });
            });

            // Write all the files out to the namespace file
            Q.all([ps, pt]).done(function() {
                var g = new NamespaceGenerator(scraper);
                grunt.file.write(f.dest + '/api.js', g.code);
            });

        });

    });

};
