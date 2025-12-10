const t = require('@babel/types');

module.exports = {
    BinaryExpression(path) {
        const { left, right, operator } = path.node;
        // 判断左右两边是否都是字面量
        if (t.isNumericLiteral(left) && t.isNumericLiteral(right)) {
            let result;
            // 根据运算符进行计算
            switch (operator) {
                case '+': result = left.value + right.value; break;
                case '-': result = left.value - right.value; break;
                case '*': result = left.value * right.value; break;
                case '/': result = left.value / right.value; break;
                case '%': result = left.value % right.value; break;
                case '**': result = left.value ** right.value; break;
                case '&': result = left.value & right.value; break;
                case '|': result = left.value | right.value; break;
                case '^': result = left.value ^ right.value; break;
                case '<<': result = left.value << right.value; break;
                case '>>': result = left.value >> right.value; break;
                case '>>>': result = left.value >>> right.value; break;
            }
            if (result !== undefined) {
                path.replaceWith(t.numericLiteral(result));
            }
        }
        // 字符串连接: "a" + "b" -> "ab"
        else if (operator === '+' && t.isStringLiteral(left) && t.isStringLiteral(right)) {
             path.replaceWith(t.stringLiteral(left.value + right.value));
        }
    }
};
