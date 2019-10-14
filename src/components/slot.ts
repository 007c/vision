import Vision, { Options } from '../index';
import { createVnode, Vnode } from '../vnode';

const options: Options = {
    render(_c: createVnode): any {
        const parent: Vision = this.$parent;
        return parent.$slots[0];
    },
}

export default options;