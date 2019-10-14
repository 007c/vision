"use strict";
exports.__esModule = true;
var parse_1 = require("../src/parse");
var generate_1 = require("../src/generate");
var esprima = require("esprima");
var escodegen = require("escodegen");
var templateMatchReg = /<template>(.+)<\/template>/s;
var scriptMatchReg = /<script>(.+)<\/script>/s;
var insert = {
    "type": "MemberExpression",
    "computed": false,
    "object": {
        "type": "ThisExpression"
    },
    "property": {
        "type": "Identifier",
        "name": "vi"
    }
};
function default_1(resource) {
    var htmlMatch = resource.match(templateMatchReg);
    var scriptMatch = resource.match(scriptMatchReg);
    if (htmlMatch) {
        var matched = htmlMatch[0], html = htmlMatch[1];
        var src = scriptMatch[0], script = scriptMatch[1];
        html = html.trim();
        var ast = parse_1.parse(html);
        var code = generate_1.generate(ast);
        var sourceProgram = esprima.parseModule(script);
        var parseResult = esprima.parseScript("function render(){with(this._vi){return " + code + "}}");
        var renderAstBody = parseResult.body[0].body;
        var sourceBody = sourceProgram.body[0];
        var delcarations = sourceBody.declaration;
        console.log(JSON.stringify(renderAstBody));
        var property = {
            type: "Property",
            key: {
                type: "Identifier",
                name: "render"
            },
            value: {
                type: "FunctionExpression",
                params: [],
                id: null,
                body: renderAstBody
            },
            kind: "init",
            method: false,
            computed: false,
            shorthand: false
        };
        delcarations.properties.push(property);
        return escodegen.generate(sourceProgram);
    }
}
exports["default"] = default_1;
