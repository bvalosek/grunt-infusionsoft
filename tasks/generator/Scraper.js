var typedef = require('typedef');
var _       = require('underscore');
var Q       = require('q');
var request = require('request');
var cheerio = require('cheerio');

module.exports = Scraper = require('typedef')

// Scrape the Infusionsoft docs and create an object representing the
// information
.class('Scraper') .define({

    __constructor__: function(opts)
    {
        opts = opts || {};

        this.docsUrl  = opts.docsUrl ||
            'http://help.infusionsoft.com';
        this.tableUrl = opts.tableUrl ||
            'http://developers.infusionsoft.com/dbDocs';

        // Keep track of the modules
        this.tables   = [];
        this.services = [];
    },

    // Get a promise representing an eventua lhash for all the infusionsoft API
    // service calls
    scrapeServices: function()
    {
        var url   = this.docsUrl;
        var _this = this;

        // Need to create an array of promises for all the pages and their hash
        return Q.nfcall(request, url + '/api-docs').then(function(data) {
            var $        = cheerio.load(data);
            var list     = $('ul.nav-list li a');
            var requests = [];

            list.each(function() {
                var href = $(this).attr('href');

                if (/service$/.test(href))
                    requests.push(_this.getServiceInterface(url + href));
            });

            // Spread out over all of the promises, when they're all done,
            // we've got the data in the arguments var, iterate over that and
            // build the hash to return
            return Q.spread(requests, function() {
                return _(arguments).toArray();
            });
        });
    },

    // Load all the tables up
    scrapeTables: function()
    {
        var url   = this.tableUrl;
        var _this = this;

        return Q.nfcall(request, url + '/index.html').then(function(data) {
            var $        = cheerio.load(data);
            var list     = $('#tables li');
            var requests = [];

            list.each(function() {
                var $this       = this;
                var title       = $this.find('a').text();
                var link        = $this.find('a').attr('href');

                requests.push(_this.getTableFields(url + '/' + link));
            });

            return Q.spread(requests, function() {
                return _(arguments).toArray();
            });

        });
    },

    // Scrape the actual table page to get the individiual fields
    __hidden__getTableFields: function(tableUrl)
    {
        var _this = this;

        return Q.nfcall(request, tableUrl).then(function(data) {
            var $     = cheerio.load(data);
            var title = $('h2').first().text();
            var $rows = $('table tr');

            _this.tables.push(title);

            var ret = {
                tableName: title,
                fields: []
            };

            $rows.each(function() {
                var $row = $(this);
                var name = $row.find('td').first().text();
                var type = $row.find('td:nth-child(2)').text();
                var access = $row.find('td:nth-child(3)')
                    .text().toLowerCase().trim().split(' ');

                if (!name) return;

                ret.fields.push({
                    name: name,
                    type: type,
                    access: access
                });
            });

            return ret;
        });
    },

    // Given a URL, parse all of the methods and corresponding parameter names
    // for a Service API endpoint, return promise for node of information
    __hidden__getServiceInterface: function(href)
    {
        var _this = this;

        return Q.nfcall(request, href).then(function(data) {
            var $ = cheerio.load(data);

            var serviceName =
                $('.content h1').text().replace(/API/g, '').trim();
            var serviceDescription =
                $('h1').nextAll('p').first().text();

            _this.services.push(serviceName);

            var ret = {
                serviceName: serviceName,
                description: serviceDescription,
                methods: []
            };

            // Extract method information
            $('.full_method').each(function() {
                var $el         = $(this);
                var collection  = $el.find('.collection')
                    .text().replace('.','').trim();
                var method      = $el.find('.method').text().trim();
                var description = $el.nextAll('p').first().text();
                var $table      = $el.nextAll('table.table-striped').first();

                var methodInfo = {
                    name: method,
                    description: description,
                    params: []
                };

                // iterate over all the paramters
                $table.find('tbody tr').each(function() {
                    var td = $(this).find('td').first().text().trim();
                    if (td != 'Key' && td != 'privateKey' && td != 'key')
                        methodInfo.params.push(td);
                    else
                        methodInfo.params.push('apiKey');
                });

                ret.methods.push(methodInfo);
            });

            return ret;
        });
    }

});
