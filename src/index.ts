import { generate } from "./generate";

import { parse } from "./parse";
import { update } from './update';
import { createVnode, Vnode, createListVnode, createEmptyVNode } from "./vnode";
import { Watcher } from "./watcher";
import { initState } from './init'
import EventEmitter from "./event-emitter";
import slot from './components/slot';


declare global {
    interface Dict<T> { [props: string]: T }
}

export interface Options {
    template?: string;
    render?: Function;
    data?: (() => object) | object;
    methods?: { [prop: string]: Function };
    components?: { [prop: string]: Options };
    mounted?: Function;
    destroyed?: Function;
    props?: Dict<any>;
    watch?: Dict<Function>;
    computed?: Dict<Function>;
}

export const toFunction = function (body: string): Function {
    return new Function(`with(this._vi){return ${body}}`);
}


const mergeOptions = function (components: Dict<Options>, options: Options) {
    options.components = {
        ...components,
        ...options.components
    }
    return {
        ...options
    }
}



export function installGlobalComponent(name: string, componentOptions: Options) {
    Vision.components[name] = componentOptions;
}





export default class Vision extends EventEmitter {
    _data?: { [prop: string]: ProxyConstructor | any };
    _computedWatchers?: Dict<Watcher>;
    props?: ProxyConstructor;
    _vi: ProxyConstructor;
    public $el: HTMLElement
    public _vnode: Vnode;
    private _render: Function;
    public $children: Vision[] = [];
    $options: Options;
    $parent?: Vision;
    $slots: Vnode[];
    static components: Dict<Options> = {};
    constructor(options: Options) {
        super();
        this.$options = mergeOptions(Vision.components, options);
        this.init(options);
    }

    public update = update;

    private init(options: Options) {
        initState(this, options);
    }
    private _c = createVnode;
    private _l = createListVnode;
    private _e = createEmptyVNode;
    $mount(el: HTMLElement) {
        const options = this.$options;
        const ast = parse(options.template);
        const render = options.render || toFunction(generate(ast));
        console.log(options.render)
        this._render = render;

        new Watcher(this, () => {
            try {
                this.update(el, this._render(this._c));
            } catch (ex) {
                console.error("update Error: ", ex.message, ex.stack)
            }
        });

        if (options.mounted) {
            options.mounted.apply(this._vi);
        }

    }
}

installGlobalComponent('slot', slot);