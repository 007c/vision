import { AstElement } from './parse';

export interface VnodeData {
    attrs?: { [props: string]: string },
    text?: string;
    key?: any;
}

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