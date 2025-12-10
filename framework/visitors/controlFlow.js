const t = require('@babel/types');

module.exports = {
    WhileStatement(path) {
        const { test, body } = path.node;
        
        let isTrue = false;
        if (t.isBooleanLiteral(test, { value: true })) isTrue = true;
        // 也可以用 evaluate
        if (!isTrue) {
             const evalResult = path.get('test').evaluate();
             if (evalResult.confident && evalResult.value === true) isTrue = true;
        }

        if (!isTrue) return;
        if (!t.isBlockStatement(body)) return;

        const switchStmt = body.body.find(node => t.isSwitchStatement(node));
        if (!switchStmt) return;

        const discriminant = switchStmt.discriminant;
        if (!t.isMemberExpression(discriminant) || !t.isUpdateExpression(discriminant.property)) return;

        const arrayName = discriminant.object.name;
        const binding = path.scope.getBinding(arrayName);
        if (!binding) return;

        const init = binding.path.node.init;
        if (!t.isCallExpression(init) || 
            !t.isMemberExpression(init.callee) || 
            (init.callee.property.value !== 'split' && init.callee.property.name !== 'split')) {
            return;
        }

        const splitString = init.callee.object.value;
        const separator = init.arguments[0].value;
        if (typeof splitString !== 'string' || typeof separator !== 'string') return;

        const dispatchOrder = splitString.split(separator);

        const cases = switchStmt.cases;
        const caseMap = {};
        cases.forEach(c => {
            if (t.isStringLiteral(c.test)) {
                caseMap[c.test.value] = c.consequent;
            }
        });

        let newBody = [];
        dispatchOrder.forEach(key => {
            const statements = caseMap[key];
            if (statements) {
                const filtered = statements.filter(stmt => 
                    !t.isContinueStatement(stmt) && !t.isBreakStatement(stmt)
                );
                newBody = newBody.concat(filtered);
            }
        });

        path.replaceWithMultiple(newBody);
        binding.path.remove();
    }
};
