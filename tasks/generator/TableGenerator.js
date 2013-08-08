var Generator = require('./Generator');

module.exports = TableGenerator = require('typedef')

// Table classes from the IS dox
.class('TableGenerator') .extends(Generator) .define({

    // Get that mess ready on constrUCT
    __constructor__: function(table)
    {
        var moduleName = this.moduleName = table.tableName;
        this.append('module.exports = ' + moduleName +
            ' = require(\'typedef\')');
        this.addBreak(2);
        this.addDisclaimer();
        this.addBreak();
        this.append('.class(\'' + moduleName + '\') .define({');
        this.addBreak(2);

        var _this = this;
        table.fields.forEach(function(field, n) {
            var name   = field.name;
            var type   = field.type.toLowerCase();

            // dont add that weird shit
            if (name.indexOf('.') != -1) {
                return;
            }

            if (n) _this.append(',\n');

            if (type == 'long' || type == 'double' || type == 'integer')
                type = 'number';

            if (type == 'date')
                type = 'datetime';

            _this.append('    __field__' + type + '__');

            field.access.forEach(function(ac) {
                _this.append(ac + '__');
            });

            _this.append(name + ': undefined');

        });

        this.addBreak(2);
        this.append('});');
    }

});
