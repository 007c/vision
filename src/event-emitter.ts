export default class EventEmitter {
    public _events: Dict<Array<Function>> = {};
    $on(eventName: string, handler: Function) {
        if (!this._events[eventName]) {
            this._events[eventName] = [];
        }
        this._events[eventName].push(handler);
    }
    $off(eventName: string, handler?: Function): boolean {
        const handlers = this._events[eventName];
        if (!handlers) {
            return false;
        }

        if (!handler) {
            delete this._events[eventName];
            return true;
        }

        for (let i = 0; i < handlers.length; i++) {
            if (handlers[i] === handler) {
                handlers.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    $emit(eventName: string, ...params: any) {
        const handlers = this._events[eventName];
        if (!handlers) {
            return;
        }

        for (const handler of handlers) {
            handler(...params);
        }
    }
}