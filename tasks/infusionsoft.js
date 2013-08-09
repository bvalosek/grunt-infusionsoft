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
            var ps = scraper.scrapeServices()
            .progress(function(d) {
                grunt.log.writelns('Parsed service: ' + d.green.bold);
            })
            .then(function(services) {
                services.forEach(function(service) {
                    var g = new ServiceGenerator(service);
                    var filepath = f.dest + '/services/' + g.moduleName + '.js';
                    grunt.file.write(filepath, g.code);
                });
            });

            // Scrape and output all of the Tables from the dox
            var pt = scraper.scrapeTables()
            .progress(function(d) {
                grunt.log.writelns('Parsed table: ' + d.cyan.bold);
            })
            .then(function(tables) {
                tables.forEach(function(table) {
                    var g = new TableGenerator(table);
                    var filepath = f.dest + '/tables/' + g.moduleName + '.js';
                    grunt.file.write(filepath, g.code);
                });
            });

            // Write all the files out to the namespace file
            Q.all([ps, pt]).done(function() {
                var g = new NamespaceGenerator(scraper);
                var filepath = f.dest + '/api.js';
                grunt.file.write(filepath, g.code);
            });

        });

    });

};
