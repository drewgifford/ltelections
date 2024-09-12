export type LocalStorageValues = {
    pinnedRaces: string[],
    lastSearch: {
        statePostal: string,
        officeID: string,
    }
}

export type LocalStorageKeys = keyof LocalStorageValues;