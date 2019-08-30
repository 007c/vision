import { isPlainObject } from './utils';
import { Dep } from './dep';
export function observer(_data: any) {
    if (!isPlainObject(_data) && !Array.isArray(_data)) {
        return _data;
    }

    if (Array.isArray(_data)) {
        _data.forEach((item, index) => {
            _data[index] = observer(item);
        })
    }

    if (isPlainObject(_data)) {
        for (const key of Object.keys(_data)) {
            _data[key] = observer(_data[key]);
        }
    }

    return defineProxy(_data);
}


export function defineProxy(target: any): ProxyConstructor | any {
    if (typeof target !== 'object' || target == null) {
        return target;
    }

    const dep = new Dep();

    const pro = new Proxy(target, {
        get(tar: any, name) {
            if (Dep.target) {
                dep.depend();
            }

            if (tar.hasOwnProperty(name)) {
                return tar[name]
            }
        },
        set(tar: any, name, newVal) {
            if (newVal !== tar[name]) {
                tar[name] = newVal;
                dep.notify();
            }
            return true;
        }
    })

    return pro;
}