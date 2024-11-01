interface VoteParameters {
    expected: {
        actual: number,
        eevpCap: number
    },
    total: number,
    registered: number
}
export default VoteParameters;

export interface RaceParameters {
    vote?: VoteParameters
}