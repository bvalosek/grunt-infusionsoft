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

        var d = Q.defer();

        // Need to create an array of promises for all the pages and their hash
        Q.nfcall(request, url + '/api-docs').then(function(data) {
            var $        = cheerio.load(data);
            var list     = $('ul.nav-list li a');
            var requests = [];

            list.each(function() {
                var href = $(this).attr('href');

                // If a service, get the promise for the scraped data and
                // notify when we've got it
                if (/service$/.test(href)) {
                    var p = _this.getServiceInterface(url + href);
                    p.then(function(s) { d.notify(s.serviceName); });
                    requests.push(p);
                }
            });

            // Spread out over all of the promises, when they're all done,
            // we've got the data in the arguments var, iterate over that and
            // build the hash to return
            Q.spread(requests, function() {
                d.resolve(_(arguments).toArray());
            });
        });

        return d.promise;
    },

    // Load all the tables up
    scrapeTables: function()
    {
        var url       = this.tableUrl;
        var _this     = this;
        var d         = new Q.defer();
        var tableInfo;

        this.getTableInfo()
        .then(function(info) {
            tableInfo = info;
            return Q.nfcall(request, url + '/index.html');
        })
        .then(function(data) {
            var $        = cheerio.load(data);
            var list     = $('#tables li');
            var requests = [];

            list.each(function() {
                var $this = this;
                var title = $this.find('a').text();
                var link  = $this.find('a').attr('href');

                // Once we've got the table, add the description and fire an
                // update back on the promise
                var p = _this.getTableFields(url + '/' + link);
                p.then(function(t) { t.description = tableInfo[t.tableName]; });
                p.then(function(s) { d.notify(s.tableName); });
                requests.push(p);
            });

            Q.spread(requests, function() {
                d.resolve(_(arguments).toArray());
            });

        });

        return d.promise;
    },

    __hidden__getTableInfo: function()
    {
        var url = this.docsUrl + '/developers/tables';

        return Q.nfcall(request, url).then(function(data) {
            var $ = cheerio.load(data);

            var ret = {};

            $('.views-row').each(function() {
                var $row = $(this);
                var title = $row.find('h2').text();
                var description = $row.find('p').text();

                ret[title] = description;
            });

            return ret;
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
                description: '',
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

                // Fix for documentation not having api keys
                if (serviceName == 'DiscountService')
                    methodInfo.params.push('apiKey');

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
