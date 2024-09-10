import Party from "./Party";

type Candidate = {

    NPID: string,

    Party: Party
    First_Name: string,
    Last_Name: string,
    Incumbent: boolean,

    Senate_Class: string,
    Status: string,
    Notes: string,

}

export default Candidate;