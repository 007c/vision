import { isPlainObject } from './utils';
import { Dep } from './dep';
export function observe(_data: any): ProxyConstructor | any {
    if (!isPlainObject(_data) && !Array.isArray(_data)) {
        return _data;
    }

    if (Array.isArray(_data)) {
        _data.forEach((item, index) => {
            _data[index] = observe(item);
        })
    }

    if (isPlainObject(_data)) {
        for (const key of Object.keys(_data)) {
            _data[key] = observe(_data[key]);
        }
    }

    return defineProxy(_data);
}

const hasOwn = Object.prototype.hasOwnProperty;

export function defineProxy(target: any): ProxyConstructor | any {
    if (typeof target !== 'object' || target == null) {
        return target;
    }

    const dep = new Dep();

    const pro = new Proxy(target, {
        has(tar: any, key): boolean {
            const has = key in tar;
            if (!has) {
                console.error('Property ', key, "is not defined on instance but used in template or something else,\n",
                    "make sure you data or props is right defined or look up vision api to make right instance property use!\n",
                    "note vision allows you use property if not exists in objects but still need define a root on data.")
            }
            return has
        },
        get(tar: any, name) {
            if (Dep.target) {
                dep.depend();
            }
            return tar[name]
        },
        set(tar: any, name, newVal) {
            if (newVal !== tar[name]) {
                tar[name] = observe(newVal);
                dep.notify();
            }
            return true;
        }
    })

    return pro;
}