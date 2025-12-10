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
    renameVars: require('./renameVars'),
    removeUnusedVariables: require('./removeUnusedVariables'),
    removeEmptyStatement: require('./removeEmptyStatement'),
    blockStatement: require('./blockStatement'),
    removeDebugger: require('./removeDebugger')
};

module.exports = moduleExports;
