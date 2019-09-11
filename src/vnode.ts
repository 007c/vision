import { createTextNode, createElement } from './utils';
import Vision, { Options } from "./index";
import { initComponentEvents } from "./init";
export interface Vnode {
    tag?: string;
    attrs?: Dict<string>;
    children: Vnode[];
    key?: any;
    text?: string;
    isComment: boolean;
    elm?: HTMLElement | Node;
    events?: Dict<EventListener>;
    isComponent?: boolean;
    componentOptions?: Options;
    componentInstance?: Vision;
    parentComponent?: Vision;
}

export function createListVnode(target: Array<any> | Object | number, render: Function) {
    let ret = [];
    if (Array.isArray(target)) {
        for (let i = 0; i < target.length; i++) {
            ret.push(render(target[i], i))
        }
    } else if (typeof target === "object" && target !== null) {
        const keys = Object.keys(target) as Array<keyof typeof target>;
        for (const key of keys) {
            ret.push(render(target[key], key))
        }
    } else if (typeof target === "number") {
        for (let i = 0; i < target; i++) {
            ret.push(render(i, i));
        }
    }

    return ret;
}

const normalizeChildren = function (children: Vnode[]) {
    let _children = [];
    for (let child of children) {
        if (Array.isArray(child)) {
            _children.push(...child)
        } else {
            _children.push(child);
        }
    }

    return _children;
}

export function createVnode(
    tag: string,
    children?: Vnode[],
    data?: {
        attrs: Dict<string>,
        key: number,
        text: string,
        events: Dict<EventListener>,
    }
): Vnode {
    const { attrs = undefined, text = undefined, events = undefined } = data || {};

    children = normalizeChildren(children);

    const vnode: Vnode = {
        tag,
        attrs: attrs || {},
        events: events,
        children,
        key: attrs ? attrs.key : undefined,
        text,
        isComment: false
    }

    if (this.$options.components && this.$options.components[tag]) {
        vnode.isComponent = true;
        vnode.componentOptions = this.$options.components[tag];
        vnode.parentComponent = this;
    }

    return vnode;
}

export function cloneVnode(node: Vnode): Vnode {
    const newNode: Vnode = {
        isComment: node.isComment,
        tag: node.tag,
        children: [],
        text: node.text,
        key: node.key,
        elm: node.elm,
        events: node.events,
        attrs: node.attrs ? JSON.parse(JSON.stringify(node.attrs)) : undefined,
    }

    for (let item of node.children) {
        newNode.children.push(cloneVnode(item));
    }

    return newNode
}

export function render(parentElm: HTMLElement, vnode: Vnode) {

    if (vnode.isComponent) {
        const child = new Vision(vnode.componentOptions);
        child.$mount(parentElm)
        initComponentEvents(child, vnode.events);
        vnode.parentComponent && vnode.parentComponent.$children.push(child);

        const childVnode = child._vnode;
        vnode.attrs = childVnode.attrs;
        // vnode.children = childVnode.children;
        vnode.text = childVnode.text;
        vnode.elm = child.$el;
        vnode.componentInstance = child;
        return
    }

    let elm: HTMLElement | Node;
    if (vnode.tag) {
        elm = createElement(vnode);
    } else if (vnode.text) {
        elm = createTextNode(vnode);
    }

    if (elm instanceof HTMLElement) {
        for (let child of vnode.children) {
            render(elm, child);
        }
    }
    if (elm) {
        vnode.elm = elm;
        parentElm.appendChild(elm);
    }

    return elm;
}   