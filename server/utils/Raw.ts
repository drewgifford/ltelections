export type Raw<T> = {
    [P in keyof T]: T[P];
};

export type CanPin = {
    pinned: boolean
}