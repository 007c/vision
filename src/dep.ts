import { Watcher } from './watcher';

const targetStack: Watcher[] = [];


export class Dep {
    public static target: Watcher;
    watchers: Watcher[] = [];
    watcherIds: Set<number> = new Set();
    public depend() {
        if (!this.watcherIds.has(Dep.target.id)) {
            this.watcherIds.add(Dep.target.id);
            this.watchers.push(Dep.target);
        }
    }

    public notify() {
        for (const watcher of this.watchers) {
            watcher.update();
        }
    }
}


export function pushTarget(watcher: Watcher) {
    Dep.target = watcher;
    targetStack.push(watcher);
}

export function popTarget() {
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
}