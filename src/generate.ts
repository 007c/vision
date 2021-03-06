import { AstElement } from './parse';


function normalizeText(text: string): string {
    const bracketsReg = /{{([^{{]*)}}/;
    const lineBreakRE = /[\r\n\s]+/g;
    text = text.replace(lineBreakRE, ' ');
    let bracketMatch = text.match(bracketsReg);
    if (!bracketMatch) {
        return `'${text}'`;
    }
    const texts: string[] = [];
    while (bracketMatch) {
        let startIndex = bracketMatch.index, lastIndex = 0;
        if (startIndex > lastIndex) {
            texts.push(`'${text.slice(lastIndex, startIndex)}'`);
        }
        texts.push(bracketMatch[1]);
        lastIndex = startIndex + bracketMatch[0].length;
        text = text.slice(lastIndex)
        bracketMatch = text.match(bracketsReg);
    }

    if (text) {
        texts.push(`'${text}'`);
    }

    return texts.join("+");

}

const genEvents = function (events: Dict<string>): string {
    let eventStr = "";
    for (let key of Object.keys(events)) {
        eventStr += `${key}: ${events[key]},`
    }

    return eventStr.slice(0, -1);
}

const genAttrs = function (attrs: Dict<string>, dynamicAttrs: Dict<string>): string {
    let attrStr = "";

    const attrKeys = Object.keys(attrs), dynamicAttrsKeys = Object.keys(dynamicAttrs);

    for (const key of dynamicAttrsKeys) {
        if (attrs[key]) {
            attrStr += `${key}:'${attrs[key]}' + ' ' + ${dynamicAttrs[key]},`
            attrs[key] = undefined;
        } else {
            attrStr += `${key}:${dynamicAttrs[key]},`
        }
    }

    for (const key of attrKeys) {
        if (attrs[key] !== undefined) {
            attrStr += `${key}:'${attrs[key]}',`
        }
    }

    return `{${attrStr.slice(0, -1)}}`
}

const genData = function (ast: AstElement): string {
    let data = "";

    if (ast.attrs || ast.dynamicAttrs) {
        if (ast.attrs.key || ast.dynamicAttrs.key) {
            data += `key: ${ast.dynamicAttrs.key || ast.attrs.key},`
            delete ast.attrs.key;
            delete ast.dynamicAttrs.key;
        }
        data += `attrs: ${genAttrs(ast.attrs, ast.dynamicAttrs)},`;
    }

    if (ast.text) {
        data += `text:${normalizeText(ast.text)},`;
    }

    if (ast.events) {
        data += `events:{${genEvents(ast.events)}},`
    }
    data = data.slice(0, -1);
    return `{${data}}`;
}

const genElement = function (ast: AstElement): string {
    let res = "_c(";
    if (ast.tag) {
        res += `"${ast.tag}",`
    } else {
        res += `"",`
    }
    if (ast.children) {
        res += '[';
        for (let child of ast.children) {
            res += generate(child);
            res += ','
        }
        res = res.slice(0, -1);
        res += '],';
    } else {
        res += `[],`;
    }
    res += `${genData(ast)},`;

    return res.slice(0, -1) + ')';
}

// const genFor = function(ast: AstElement): string {
//     let res = "_l("
// } 

export function generate(ast: AstElement): string {
    if (!ast) {
        return "_c('div')";
    }

    if (ast.for && !ast.forProcessed) {
        ast.forProcessed = true;
        return `_l(${ast.for.target}, function(${ast.for.params[0]},${ast.for.params[1]}){return ${generate(ast)}})`
    }

    if (ast.if) {
        return `${ast.if} ? ${genElement(ast)} : _e()`
    }
    return genElement(ast);

}