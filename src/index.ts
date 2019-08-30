import { generate } from "./generate";

import { parse } from "./parse";
import { update } from './update';
import { createVnode, Vnode } from "./vnode";
import { Watcher } from "./watcher";
import { initState } from './init'

export interface Options {
    template: string;
    render?: Function;
    data?: (() => object) | object;
    methods?: { [prop: string]: Function };
    components?: { [prop: string]: Options };
    mounted?: Function;
}

const toFunction = function (body: string): Function {
    return new Function(`with(this._vi){return ${body}}`);
}


const mergeOptions = function (options: Options) {
    const keys = Object.keys(options);
    return {
        ...options
    }
}









export default class Vision {
    _data?: { [prop: string]: ProxyConstructor | any };
    _vi: ProxyConstructor;
    private $el: HTMLElement
    public _vnode: Vnode;
    private _render: Function;
    $options: Options;
    constructor(elm: HTMLElement, options: Options) {
        this.$options = mergeOptions(options);
        this.init(options);
    }

    private update = update;

    private init(options: Options) {
        initState(this, options);
    }
    private _c = createVnode;
    $mount(el: HTMLElement) {
        const options = this.$options;
        const ast = parse(options.template);
        const render = toFunction(generate(ast));
        this._render = render;

        new Watcher(this, function () {
            try {
                this.update(el, this._render())
            } catch (ex) {
                console.log(ex.message)
            }
        });


        if (options.mounted) {
            options.mounted.apply(this._vi);
        }

    }
}