/**
 * 声明对象中的指定字段是必填的
 */
export declare type RequiredField<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;
//# sourceMappingURL=RequiredFiled.d.ts.map