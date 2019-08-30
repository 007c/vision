import { Vnode } from './vnode';


export function bindListener(elm: HTMLElement, eventName: string, handler: EventListener) {
    elm.addEventListener(eventName, handler);
}

export function createElement(vnode: Vnode): HTMLElement {
    const elm: HTMLElement = document.createElement(vnode.tag);
    const attrKeys = Object.keys(vnode.attrs);

    for (let key of attrKeys) {
        elm.setAttribute(key, vnode.attrs[key]);
    }

    if (vnode.events) {
        for (const eventName of Object.keys(vnode.events)) {
            bindListener(elm, eventName, vnode.events[eventName]);
        }
    }

    return elm;
}

 
export function isPlainObject (ob: any) {
    return Object.prototype.toString.call(ob) === "[object Object]";
}


export function createTextNode(vnode: Vnode): Node {
    return document.createTextNode(vnode.text);
}

