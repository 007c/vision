import { AstElement } from './parse';

export interface VnodeData {
    attrs?: { [props: string]: string },
    text?: string;
    key?: any;
}

function normalizeText(text: string) {
    const bracketsReg = /{{(.*)}}/;
    const lineBreakRE = /[\r\n]/g;
    text = text.replace(lineBreakRE, ' ');
    const bracketMatch = text.match(/{{(.*)}}/);
    if (!bracketMatch) {
        return `'${text}'`;
    }

    let replaceStr = bracketMatch[1];
    let inEnd = true;
    let inStart = true;

    if (bracketMatch.index !== 0) {
        replaceStr = "'+" + replaceStr;
        inStart = false;
    }

    if (bracketMatch.index + bracketMatch[1].length !== text.length) {
        replaceStr += "+'"
        inEnd = false;
    }

    return `${inStart ? '' : "'"}${text.replace(bracketsReg, replaceStr)}` + (inEnd ? '' : "'");
}

const genEvents = function (events: { [props: string]: string }): string {
    let eventStr = "";
    for (let key of Object.keys(events)) {
        eventStr += `${key}: ${events[key]},`
    }

    return eventStr.slice(0, -1);
}

const genData = function (ast: AstElement): string {
    let data = "";

    if (ast.attrs) {
        data += `attrs:${JSON.stringify(ast.attrs)},`;
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

export function generate(ast: AstElement): string {
    let res = ast ? "_c(" : "_c('div')";
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


    const data: VnodeData = {};

    res += `${genData(ast)},`;
    return res.slice(0, -1) + ')';
}