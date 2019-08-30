import Vision from "./index";
import { pushTarget, popTarget } from './dep';
let uid = 0;

export class Watcher {
    id: number;
    private value: any;
    constructor(private vi: Vision, private getter: Function) {
        this.id = uid++;
        this.value = this.get();
    }

    get() {
        pushTarget(this);
        const value = this.getter.call(this.vi);
        popTarget();
        return value;
    }

    run() {
        this.get();
    }
}