import { Vnode } from "./vnode";

export enum PatchType {
    REMOVE,
    INSERT,
    UPDATEPROPS,
    UPDATETEXT,
    REORDER
}

export interface Patch {
    type: PatchType,
    oldVnode?: Vnode,
    newVnode?: Vnode,
    parentVNode?: Vnode
}

function isSameVnode(oldVnode: Vnode, newVnode: Vnode) {
    return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
}

function createKeyMap(vnodes: Vnode[]): Dict<number> {
    let dict: Dict<number> = {};
    vnodes.forEach((node: Vnode, index: number) => {
        dict[node.key] = index;
    })
    return dict;
}

function patchChildren(parentVNode: Vnode, oldChildren: Vnode[], newChildren: Vnode[], patches: Patch[]) {
    const oldKeyMap = createKeyMap(oldChildren);

    let oldStart = 0, oldEnd = oldChildren.length - 1, newStart = 0, newEnd = newChildren.length - 1;
    while (oldStart <= oldEnd && newStart <= newEnd) {
        let oldNode = oldChildren[oldStart],
            newNode = newChildren[newStart];
        if (!oldNode) {
            oldStart++;
            continue;
        } else if (isSameVnode(oldNode, newNode)) {
            oldStart++;
            newStart++;
        } else {
            const oldIdx = oldKeyMap[newNode.key];
            oldNode = oldChildren[oldIdx];
            if (oldNode) {
                patches.push({
                    type: PatchType.REORDER,
                    oldVnode: oldChildren[oldStart],
                    newVnode: oldNode,
                })
                oldChildren[oldIdx] = null; //clear patched nodes;
            }

            newStart++;
        }
        patch(parentVNode, oldNode, newNode, patches);
    }

    if (oldStart <= oldEnd) {
        for (let i = oldStart; i <= oldEnd; i++) {
            oldChildren[i] && patches.push({
                type: PatchType.REMOVE,
                oldVnode: oldChildren[i],
            })
        }
    } else if (newStart <= newEnd) {
        for (let i = newStart; i <= newEnd; i++) {
            patches.push({
                parentVNode,
                type: PatchType.INSERT,
                newVnode: newChildren[i],
            })
        }
    }

}

export function patch(parentVNode: Vnode, oldVnode: Vnode | undefined, newVnode: Vnode, patches: Patch[]) {
    if (!oldVnode && newVnode) {
        patches.push({
            parentVNode,
            type: PatchType.INSERT,
            oldVnode,
            newVnode,
        })
    } else if (oldVnode && !newVnode) {
        patches.push({
            type: PatchType.REMOVE,
            oldVnode,
        })
    } else if (isSameVnode(oldVnode, newVnode)) {
        newVnode.elm = oldVnode.elm;
        if (oldVnode.tag) {
            patches.push({
                type: PatchType.UPDATEPROPS,
                oldVnode,
                newVnode,
            });
        } else if (oldVnode.text !== newVnode.text) {
            patches.push({
                type: PatchType.UPDATETEXT,
                oldVnode,
                newVnode
            })
        }
        patchChildren(oldVnode, oldVnode.children, newVnode.children, patches);

    } else {
        patches.push({
            type: PatchType.REMOVE,
            oldVnode,
        })

        patches.push({
            parentVNode,
            type: PatchType.INSERT,
            newVnode,
        })
        patchChildren(oldVnode, oldVnode.children, newVnode.children, patches);

    }


    // return patches;
}