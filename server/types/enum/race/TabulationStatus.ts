enum TabulationStatus {

    AwaitingClose = "Awaiting Poll Close",
    PollsClosed = "Polls Closed/Waiting First Report",
    ActiveTabulation = "Active Tabulation",
    TabulationPaused = "Tabulation Paused",
    EndOfTabulation = "End of AP Tabulation",
    GatheringResults = "Gathering Certified Results",
    Certified = "Vote Certified"

}
export default TabulationStatus;