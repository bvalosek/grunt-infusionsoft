var _ = require('underscore');

module.exports = NamespaceGenerator = require('typedef')

.class('NamespaceGenerator') .extends(Generator) .define({

    __constructor__: function(scraper)
    {
        this.append('module.exports = api =');
        this.addBreak(2);
        this.addDisclaimer();
        this.addBreak();
        this.append('{\n\n');

        this.addReqs('services', scraper.services);
        this.append(',\n\n');
        this.addReqs('tables', scraper.tables);

        this.append('\n\n}');
    },

    __hidden__addReqs: function(title, reqs)
    {
        this.append('    ' + title + ':\n    {\n');

        reqs = _(reqs).sortBy(function(x) { return x; });

        var _this = this;
        reqs.forEach(function(r, n) {
            if (n) _this.append(',\n');
            if (title == 'services') r = 'I' + r;
            _this.append('        ');
            _this.append(r + ': require(\'./' + title + '/' + r + '\')');
        });

        this.append('\n    }');
    },

});
