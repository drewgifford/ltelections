export type PollCandidate = {

    answer: string,
    candidate_name: string,
    pct: number,
    party: string,

}

type BasicPoll = {
    pollster: string,
    numeric_grade: string,
    state: string,
    start_date: string,
    end_date: string,

    partisan?: string,
    race_id: string,

    sample_size: number,
    population: string,

    election_date: string,

    question_id: string,
}

export type RawPoll = BasicPoll & Partial<PollCandidate>;

export type Poll = BasicPoll & {
    results: PollCandidate[]
}

class PollAverage {

}

export default Poll;