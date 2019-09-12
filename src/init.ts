
import Vision, { Options } from "./index";
import { defineProxy, observe } from './observe';
const initData = function (vi: any, data: object | (() => object)) {
    const _data = typeof data === "function" ? data() : data;
    observe(_data);
    for (const key of Object.keys(_data)) {
        if (vi.hasOwnProperty(key)) {
            console.error('Property ', key, "has defined on props, please check!")
        }
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

const initProps = function (vi: Vision, props: Dict<any>) {
    vi.props = observe(props);
}

export function initState(vi: Vision, options: Options) {
    vi._vi = defineProxy(vi);

    if (options.props) {
        initProps(vi, options.props);
    }

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