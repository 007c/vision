import { patch, Patch, PatchType } from './patch';
import { Vnode, render } from './vnode';
import { bindListener } from "./utils";

function getParent(patch: Patch): HTMLElement | Node | null {
    if (patch.parentVNode) {
        return patch.parentVNode.elm;
    }
    if (!patch.oldVnode) {
        return null;
    }

    return patch.oldVnode.elm ? patch.oldVnode.elm.parentNode : null
}

function insert(parentNode: HTMLElement | Node, patch: Patch) {
    if (parentNode instanceof HTMLElement) {
        const elm = render(parentNode, patch.newVnode);
    }
}

function remove(parent: HTMLElement | Node, patch: Patch) {
    parent.removeChild(patch.oldVnode.elm);
}

function inserBefore(parent: HTMLElement | Node, patch: Patch) {
    parent.insertBefore(patch.newVnode.elm, patch.oldVnode.elm);
}

function updateAttrs(patch: Patch) {
    let node = patch.newVnode.elm;
    if (node instanceof HTMLElement) {
        const { oldVnode, newVnode } = patch;
        const oldAttrs = oldVnode ? oldVnode.attrs : {};
        const newAttrs = newVnode.attrs;
        const attrKeys = Object.keys(newAttrs);
        const oldAttrKeys = Object.keys(oldAttrs);
        for (const key of attrKeys) {
            node.setAttribute(key, newAttrs[key]);
        }

        for (const key of oldAttrKeys) {
            if (!newAttrs[key]) {
                node.removeAttribute(key);
            }
        }

        updateEvents(oldVnode, newVnode);

    }
}

function updateEvents(oldVnode: Vnode, newVnode: Vnode) {
    if (newVnode.elm instanceof HTMLElement) {
        const oldEvents = (oldVnode && oldVnode.events) || {}, newEvents = newVnode.events || {};
        for (const key of Object.keys(newEvents)) {
            if (oldEvents[key]) {
                if (oldEvents[key] !== newEvents[key]) {
                    updateListener(newVnode.elm, key, oldEvents[key], newEvents[key]);
                }
            } else {
                bindListener(newVnode.elm, key, newEvents[key]);
            }
        }

        for (const key of Object.keys(oldEvents)) {
            if (!newEvents[key]) {
                removeListener(newVnode.elm, key, oldEvents[key]);
            }
        }
    }

}

export function updateListener(elm: HTMLElement, eventName: string, oldHandler: EventListener, handler: EventListener) {
    removeListener(elm, eventName, oldHandler);
    bindListener(elm, eventName, handler);
}


export function removeListener(elm: HTMLElement, eventName: string, handler: EventListener) {
    elm.removeEventListener(eventName, handler);
}

function updateText(patch: Patch) {
    const elm = patch.oldVnode.elm;
    if (elm instanceof Node) {
        elm.textContent = patch.newVnode.text;
    }
}

export function update(el: HTMLElement, newVnode: Vnode) {
    const patches: Patch[] = [];

    const preVnode = this._vnode;
    this._vnode = newVnode;

    patch(null, preVnode, newVnode, patches);
    for (let item of patches) {
        const parent = getParent(item) || el;
        switch (item.type) {
            case PatchType.INSERT:
                insert(parent, item);
                break;
            case PatchType.REMOVE:
                remove(parent, item);
                break;
            case PatchType.REORDER:
                inserBefore(parent, item);
                break;
            case PatchType.UPDATEPROPS:
                updateAttrs(item);
                break;
            case PatchType.UPDATETEXT:
                updateText(item);
                break;
        }
    }

    if (!this.$el) {
        this.$el = newVnode.elm;
        el.appendChild(newVnode.elm)
    }
}
