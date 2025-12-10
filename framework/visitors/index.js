const moduleExports = {
    literals: require('./literals'),
    constants: require('./constants'),
    deadCode: require('./deadCode'),
    controlFlow: require('./controlFlow'),
    proxyFunctions: require('./proxyFunctions'),
    stringArray: require('./stringArray'),
    simplify: require('./simplify'),
    evalRestore: require('./evalRestore'),
    sequenceExpr: require('./sequenceExpr'),
    renameVars: require('./renameVars')
};

module.exports = moduleExports;
