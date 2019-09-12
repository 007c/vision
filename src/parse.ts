interface StructFor {
    exp: string;
    target: string;
    params: string[];
}

export interface AstElement {
    tag?: string;
    attrs?: Dict<string>;
    children?: AstElement[];
    text?: string;
    events?: Dict<string>;
    dynamicAttrs?: Dict<string>;
    if?: string;
    for?: StructFor;
    forProcessed?: boolean;
}

const matchStart = /^<(\w+)\s*/;
const matchAttrs = /^([^<=>]+)\s*=\s*['"]([^<=>]*)['"]/;
//const matchAttrsWithoutWhite = /([^<>]+)\s*=\s*['"]([^<>]*)['"]/;
const matchInnerText = /([^<]*)/;
const matchStartTagEnd = /^\s*>/;
const matchEndTag = /^<\/([^>]+)>/
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
            processDynamicAttrs(dynamicAttrs, dynamicAttrsMatch[1], value);
        } else {
            attrs[name] = value;

        }

        html = html.slice(matched.length);
    }

    function processDynamicAttrs(dynamicAttrs: Dict<string>, key: string, value: any) {
        if (isBuiltInDirs(key)) {
            processDirs(curentAstElement, key, value);
        } else {
            dynamicAttrs[key] = value;
        }
    }

    function processFor(ast: AstElement, exp: string) {
        exp = exp.trim();
        const expReg = /^(\w+)\s+in\s+(\w+)$|^\(\s*(\w+)\s*,\s*(\w+)\)\s+in\s+(\w+)$/;
        const matches = exp.match(expReg);
        if (!matches) {
            console.error("parseing statements ", exp, "error while compiling processing!");
            return;
        }

        const [matched, param1, target1, param2, param3, target2] = matches;
        let params, target;
        if (param1) {
            params = [param1];
            target = target1;
        } else {
            params = [param2, param3];
            target = target2;
        }

        ast.for = {
            target,
            params,
            exp
        }
    }

    function processDirs(ast: AstElement, key: string, value: string) {
        switch (key) {
            case "if": ast.if = value; break;
            case "for": processFor(ast, value); break;
        }
    }

    function processInnerText(match: string[]) {
        const [matched, text] = match;
        if(!text) {
            return;
        }
        html = html.slice(text.length);
        let textEl = createAstElement(null, text);
        if (parent) {
            let children = parent.children || (parent.children = []);
            children.push(textEl);
        }
    }

    return root;
}