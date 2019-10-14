import { parse } from '../src/parse';
import { generate } from '../src/generate';
import { toFunction } from '../src/index'
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import { FunctionDeclaration, ExportDefaultDeclaration, ObjectExpression, Property, BlockStatement, ReturnStatement, CallExpression, Identifier, MemberExpression, Expression, BaseExpression } from 'estree';

declare type Dict = { [props: string]: any }

const templateMatchReg = /<template>(.+)<\/template>/s;
const scriptMatchReg = /<script>(.+)<\/script>/s;
const insert: Dict = {
    "type": "MemberExpression",
    "computed": false,
    "object": {
        "type": "ThisExpression"
    },
    "property": {
        "type": "Identifier",
        "name": "vi"
    }
}


export default function (resource: string) {
    const htmlMatch = resource.match(templateMatchReg);
    const scriptMatch = resource.match(scriptMatchReg);
    if (htmlMatch) {
        let [matched, html] = htmlMatch;
        let [src, script] = scriptMatch;
        html = html.trim();
        let ast = parse(html);
        let code = generate(ast);
        const sourceProgram = esprima.parseModule(script);
        const parseResult = esprima.parseScript(`function render(){with(this._vi){return ${code}}}`);

        const renderAstBody = (parseResult.body[0] as FunctionDeclaration).body;
        const sourceBody = sourceProgram.body[0] as ExportDefaultDeclaration;
        const delcarations = sourceBody.declaration as ObjectExpression;
        console.log(JSON.stringify(renderAstBody))

        const property: Property = {
            type: "Property",
            key: {
                type: "Identifier",
                name: "render",

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
        }
        delcarations.properties.push(property);
        return escodegen.generate(sourceProgram)

    }
}