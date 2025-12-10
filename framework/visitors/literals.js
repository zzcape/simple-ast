const t = require('@babel/types');

module.exports = {
    "NumericLiteral|StringLiteral"(path) {
        if (path.node.extra) delete path.node.extra;
    }
};
