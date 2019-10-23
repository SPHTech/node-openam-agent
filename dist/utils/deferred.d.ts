export declare class Deferred<R = any> {
    promise: Promise<R>;
    resolve: (result: R) => any;
    reject: (error: any) => any;
    constructor();
}
