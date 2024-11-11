import { RaceParameters } from "../race/VoteParameters";

interface ReportingUnitParameters extends RaceParameters {
    precinctsReportingActual?: number,
    precinctsReportingProportional?: number
}
export default ReportingUnitParameters;