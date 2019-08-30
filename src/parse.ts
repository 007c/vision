export interface AstElement {
    tag?: string;
    attrs?: { [prop: string]: string };
    children?: AstElement[];
    text?: string;
    events?: { [prop: string]: string }
}

const matchStart = /^<(\w+)\s*/;
const matchAttrs = /(.+)=['"](.+)['"]\s+/;
const matchAttrsWithoutWhite = /(.+)=['"](.+)['"]/;
const matchInnerText = /([^<]*)/;
const matchStartTagEnd = /^>/;
const matchEndTag = /^<\/.+>/
const matchEventAttrs = /^\*(\w+)/

const createAstElement = function (tag: string = "", text?: string): AstElement {
    return {
        tag,
        text,
    }
}

export function parse(html: string): AstElement {
    let root: AstElement;
    let parent: AstElement;
    const stack: AstElement[] = [];
    let curentAstElement: AstElement;


    while (html) {

        const startMatch: Array<string> | null = html.match(matchStart);

        if (startMatch) {
            processStart(startMatch);
            let match;
            while (match = html.match(matchAttrs) || html.match(matchAttrsWithoutWhite)) {
                processAttrs(match);
            }
        }

        if (html.match(matchStartTagEnd)) {
            parent = stack[stack.length - 1];
            html = html.slice(1);
        }

        const textMatch = html.match(matchInnerText);
        if (textMatch) {
            processInnerText(textMatch);
        }
        const endMatch: string[] = html.match(matchEndTag);

        if (endMatch) {
            stack.pop();
            parent = stack[stack.length - 1];
            html = html.slice(endMatch[0].length);
        }
    }

    function processStart(match: string[]) {
        const [matched, tag] = match;
        html = html.slice(matched.length);
        curentAstElement = createAstElement(tag);
        if (!root) {
            root = curentAstElement;
        }
        if (parent) {
            let children = parent.children || (parent.children = []);
            children.push(curentAstElement);
        }
        stack.push(curentAstElement);
    }

    function processAttrs(match: string[]) {
        const [matched, name, value] = match;
        const attrs = curentAstElement.attrs || (curentAstElement.attrs = {});
        const events = curentAstElement.events || (curentAstElement.events = {});
        const eventMatch = name.match(matchEventAttrs);
        if (eventMatch) {
            events[eventMatch[1]] = value
        } else {
            attrs[name] = value;

        }

        html = html.slice(matched.length);
    }

    function processInnerText(match: string[]) {
        const [matched, text] = match;
        html = html.slice(text.length);
        let textEl = createAstElement(null, text);
        if (parent) {
            let children = parent.children || (parent.children = []);
            children.push(textEl);
        }
    }

    return root;
}