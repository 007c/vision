export interface AstElement {
    tag?: string;
    attrs?: Dict<string>;
    children?: AstElement[];
    text?: string;
    events?: Dict<string>;
    dynamicAttrs?: Dict<string>;
    if?: string;
    for?: string;
}

const matchStart = /^<(\w+)\s*/;
const matchAttrs = /^([^<=>]+)\s*=\s*['"]([^<=>]*)['"]/;
//const matchAttrsWithoutWhite = /([^<>]+)\s*=\s*['"]([^<>]*)['"]/;
const matchInnerText = /([^<]*)/;
const matchStartTagEnd = /^\s*>/;
const matchEndTag = /^<\/(.+)>/
const matchEventAttrs = /^\*(\w+)/

const builtInSingleTags: Set<string> = new Set(['area', 'base', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'])
const builtInDirs = new Set(["if", "for"]);
const isSingleTag = (tag: string): boolean => builtInSingleTags.has(tag);
const isBuiltInDirs = (dir: string): boolean => builtInDirs.has(dir);
const createAstElement = function (tag: string = "", text?: string): AstElement {
    return {
        tag,
        text,
        attrs: {},
        events: {},
        dynamicAttrs: {}
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
            while (match = html.match(matchAttrs)) {
                processAttrs(match);
            }
        }
        const startTagEndMatch = html.match(matchStartTagEnd)
        if (startTagEndMatch) {
            parent = stack[stack.length - 1];
            html = html.slice(startTagEndMatch[0].length);
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
        if (!isSingleTag(tag)) {
            stack.push(curentAstElement);
        }
    }

    function processAttrs(match: string[]) {
        let [matched, name, value] = match;
        name = name.trim();
        value = value.trim();
        const { attrs, events, dynamicAttrs } = curentAstElement;
        const eventMatch = name.match(matchEventAttrs);
        const dynamicAttrsMatch = name.match(/^vi-(.+)/)
        if (eventMatch) {
            events[eventMatch[1]] = value
        } else if (dynamicAttrsMatch) {
            dynamicAttrs[dynamicAttrsMatch[1]] = value;
            processDynamicAttrs(dynamicAttrs, dynamicAttrsMatch[1], value);
        } else {
            attrs[name] = value;

        }

        html = html.slice(matched.length);
    }

    function processDynamicAttrs(dynamicAttrs: Dict<string>, key: string, value: any) {
        if (isBuiltInDirs(key)) {
            curentAstElement[key as keyof AstElement] = value;
        } else {
            dynamicAttrs[key] = value;
        }
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