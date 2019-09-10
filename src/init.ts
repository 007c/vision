
import Vision, { Options } from "./index";
import { defineProxy, observer } from './observe';
const initData = function (vi: any, data: object | (() => object)) {
    const _data = typeof data === "function" ? data() : data;
    observer(_data);
    for (const key of Object.keys(_data)) {
        vi[key] = defineProxy(_data[key]);
    }
}

const toBoundFn = function (fn: Function, context: ProxyConstructor): Function {
    return function bound() {
        const args = [].slice.call(arguments);
        return fn.apply(context, args);
    }
}

const initMethods = function (vi: any) {
    const methods = vi.$options.methods;
    for (const key of Object.keys(methods)) {
        if (vi.hasOwnProperty(key)) {
            console.error('method ', key, "has defined on data or props, please check!")
        }
        vi[key] = toBoundFn(methods[key], vi._vi);
    }
}

export function initState(vi: Vision, options: Options) {
    vi._vi = defineProxy(vi);

    if (options.data) {
        initData(vi, options.data);
    }

    if (options.methods) {
        initMethods(vi)
    }
}

export function initComponentEvents(vi: Vision, events: Dict<EventListener>) {
    if (!events) {
        return;
    }
    const eventNames = Object.keys(events);
    for (const name of eventNames) {
        if (!vi._events[name]) {
            vi._events[name] = [];
        }

        vi._events[name].push(toBoundFn(events[name], vi._vi));
    }
}