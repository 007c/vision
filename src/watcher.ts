import Vision from "./index";
import { pushTarget, popTarget } from './dep';
import { nextTick } from "./next-tick"
let uid = 0;

export interface WatcherOptions {
    lazy?: boolean
}


const updateQueue: Watcher[] = [];

let flushing = false, waiting = false;

let has: Dict<boolean> = {};

let runIndex: number;

const runUpdateQueue = function () {
    updateQueue.sort((a, b) => a.id - b.id);
    for (runIndex = 0; runIndex < updateQueue.length; runIndex++) {
        const watcher = updateQueue[runIndex];
        has[watcher.id] = null;
        watcher.run();
    }

    has = {};
    waiting = flushing = false;
    updateQueue.length = runIndex = 0;
}


const queueWatcher = function (watcher: Watcher) {
    if (has[watcher.id]) {
        return;
    }
    has[watcher.id] = true;

    if (!flushing) {
        flushing = true;
        updateQueue.push(watcher);
    } else {
        // it's already have a running update queue, we need push it to right position;
        // basicly a new wathcer be pushed will run immediely 
        let i = updateQueue.length - 1;
        if (i > runIndex && updateQueue[i].id > watcher.id) {
            i--;
        }
        updateQueue.splice(i + 1, 0, watcher);
    }

    if (!waiting) {
        waiting = true;
        nextTick(runUpdateQueue)
    }
}



export class Watcher {
    id: number;
    private value: any;
    private lazy: boolean = true;
    constructor(private vi: Vision, private getter: Function, options?: WatcherOptions) {
        if (options) {
            this.lazy = options.lazy;
        }
        this.id = uid++;
        this.value = this.get();
    }

    get() {
        pushTarget(this);
        const value = this.getter.call(this.vi);
        popTarget();
        return value;
    }
    update() {
        if (!this.lazy) {
            this.run();
        } else {
            queueWatcher(this);
        }
    }
    run() {
        try {
            this.get();
        } catch (ex) {
            console.error(ex.message);
        }
    }
}