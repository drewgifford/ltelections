import Party from "./Party";

type Candidate = {

    first: string,
    last: string,
    party: string,
    candidateID: string,
    ballotOrder: number,
    polId: string,
    polNum: string,
    voteCount: number,

    partyData: Party | undefined,
    percent: number | undefined,

}

export default Candidate;