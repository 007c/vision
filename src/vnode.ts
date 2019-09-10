import { createTextNode, createElement } from './utils';
import Vision, { Options } from "./index";
import { initComponentEvents } from "./init";
export interface Vnode {
    tag?: string;
    attrs?: { [props: string]: string };
    children: Vnode[];
    key?: any;
    text?: string;
    isComment: boolean;
    elm?: HTMLElement | Node;
    events?: { [props: string]: EventListener };
    isComponent?: boolean;
    componentOptions?: Options;
    componentInstance?: Vision;
    parentComponent?: Vision;
}

export function createVnode(
    tag: string,
    children?: Vnode[],
    data?: {
        attrs: { [props: string]: string },
        key: number,
        text: string,
        events: { [props: string]: EventListener },
    }
): Vnode {
    const { attrs = undefined, text = undefined, events = undefined } = data || {};
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