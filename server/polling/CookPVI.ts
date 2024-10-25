import { parsePolls } from "../plugins/updatePolling";
import ApiResponse from "../types/ApiResponse";
import Race, { OfficeType } from "../types/Race";
import { ReportingCandidate } from "../types/ReportingUnit";
import { getPollingAverage, PollingAverageType } from "../utils/PollingAverage";
import { HistoricalCounty, parseHistoricalData } from "./HistoricalResult";
import Poll from "./Poll";




const HOUSE_PVI: any = {"AL-01": 16.47, "AL-02": 17.32, "AL-03": 19.36, "AL-04": 33.24, "AL-05": 16.67, "AL-06": 18.39, "AL-07": -14.11, "AK-01": 8.02, "AZ-01": 2.01, "AZ-02": 6.35, "AZ-03": -24.02, "AZ-04": -2.27, "AZ-05": 11.11, "AZ-06": 2.66, "AZ-07": -14.98, "AZ-08": 9.69, "AZ-09": 15.64, "AR-01": 22.37, "AR-02": 9.03, "AR-03": 14.91, "AR-04": 19.55, "CA-01": 12.21, "CA-02": -23.19, "CA-03": 3.72, "CA-04": -16.71, "CA-05": 8.73, "CA-06": -7.39, "CA-07": -17.4, "CA-08": -26.09, "CA-09": -4.58, "CA-10": -17.91, "CA-11": -36.7, "CA-12": -39.7, "CA-13": -3.85, "CA-14": -21.7, "CA-15": -27.74, "CA-16": -25.63, "CA-17": -23.31, "CA-18": -21.38, "CA-19": -18.46, "CA-20": 15.59, "CA-21": -8.7, "CA-22": -5.07, "CA-23": 7.69, "CA-24": -12.57, "CA-25": -6.18, "CA-26": -7.96, "CA-27": -4.05, "CA-28": -15.55, "CA-29": -25.79, "CA-30": -22.67, "CA-31": -14.83, "CA-32": -19.53, "CA-33": -11.71, "CA-34": -32.46, "CA-35": -13.32, "CA-36": -20.81, "CA-37": -36.63, "CA-38": -14.33, "CA-39": -11.86, "CA-40": 1.86, "CA-41": 3.17, "CA-42": -22.37, "CA-43": -31.98, "CA-44": -24.0, "CA-45": -2.14, "CA-46": -14.93, "CA-47": -3.28, "CA-48": 9.33, "CA-49": -3.14, "CA-50": -14.38, "CA-51": -11.56, "CA-52": -18.28, "CO-01": -28.92, "CO-02": -17.5, "CO-03": 7.06, "CO-04": 12.85, "CO-05": 8.94, "CO-06": -9.01, "CO-07": -3.89, "CO-08": 0.45, "CT-01": -11.75, "CT-02": -2.86, "CT-03": -7.32, "CT-04": -13.07, "CT-05": -2.66, "DE-01": -6.74, "FL-01": 19.31, "FL-02": 7.7, "FL-03": 9.24, "FL-04": 5.88, "FL-05": 10.86, "FL-06": 13.98, "FL-07": 5.1, "FL-08": 11.37, "FL-09": -8.05, "FL-10": -14.3, "FL-11": 8.04, "FL-12": 16.58, "FL-13": 5.58, "FL-14": -8.13, "FL-15": 3.67, "FL-16": 6.99, "FL-17": 10.15, "FL-18": 13.39, "FL-19": 12.91, "FL-20": -25.1, "FL-21": 6.86, "FL-22": -7.26, "FL-23": -4.81, "FL-24": -24.64, "FL-25": -9.2, "FL-26": 8.41, "FL-27": -0.15, "FL-28": 2.37, "GA-01": 9.19, "GA-02": -3.11, "GA-03": 17.99, "GA-04": -26.63, "GA-05": -31.65, "GA-06": 11.08, "GA-07": -9.64, "GA-08": 16.38, "GA-09": 22.26, "GA-10": 14.6, "GA-11": 11.03, "GA-12": 7.52, "GA-13": -27.87, "GA-14": 21.77, "HI-01": -13.6, "HI-02": -13.7, "ID-01": 22.18, "ID-02": 14.5, "IL-01": -20.38, "IL-02": -18.75, "IL-03": -19.8, "IL-04": -22.46, "IL-05": -18.34, "IL-06": -3.27, "IL-07": -35.72, "IL-08": -6.0, "IL-09": -19.44, "IL-10": -10.98, "IL-11": -5.3, "IL-12": 23.97, "IL-13": -3.44, "IL-14": -3.56, "IL-15": 21.95, "IL-16": 13.46, "IL-17": -1.91, "IN-01": -2.77, "IN-02": 13.95, "IN-03": 17.97, "IN-04": 17.72, "IN-05": 11.21, "IN-06": 19.18, "IN-07": -18.95, "IN-08": 19.03, "IN-09": 16.18, "IA-01": 3.49, "IA-02": 4.28, "IA-03": 2.52, "IA-04": 15.52, "KS-01": 17.87, "KS-02": 10.78, "KS-03": 1.0, "KS-04": 13.99, "KY-01": 24.02, "KY-02": 21.15, "KY-03": -8.6, "KY-04": 19.33, "KY-05": 32.24, "KY-06": 8.52, "LA-01": 22.76, "LA-02": -24.91, "LA-03": 21.25, "LA-04": 14.15, "LA-05": 16.97, "LA-06": 19.48, "ME-01": -8.76, "ME-02": 5.57, "MD-01": 10.6, "MD-02": -7.47, "MD-03": -9.62, "MD-04": -39.51, "MD-05": -15.08, "MD-06": -1.97, "MD-07": -30.11, "MD-08": -29.49, "MA-01": -8.68, "MA-02": -13.08, "MA-03": -11.41, "MA-04": -11.94, "MA-05": -23.35, "MA-06": -11.01, "MA-07": -35.0, "MA-08": -15.25, "MA-09": -6.29, "MI-01": 12.59, "MI-02": 16.48, "MI-03": -1.28, "MI-04": 4.74, "MI-05": 14.56, "MI-06": -10.89, "MI-07": 2.12, "MI-08": 1.07, "MI-09": 17.54, "MI-10": 3.05, "MI-11": -7.38, "MI-12": -22.54, "MI-13": -23.47, "MN-01": 7.41, "MN-02": -0.61, "MN-03": -7.54, "MN-04": -16.61, "MN-05": -29.73, "MN-06": 11.99, "MN-07": 19.26, "MN-08": 8.04, "MS-01": 18.35, "MS-02": -11.19, "MS-03": 14.74, "MS-04": 21.74, "MO-01": -27.32, "MO-02": 7.1, "MO-03": 16.03, "MO-04": 22.62, "MO-05": -10.78, "MO-06": 21.19, "MO-07": 23.76, "MO-08": 28.11, "MT-01": 6.23, "MT-02": 16.3, "NE-01": 8.67, "NE-02": -0.17, "NE-03": 28.89, "NV-01": -2.61, "NV-02": 8.05, "NV-03": -1.46, "NV-04": -2.59, "NH-01": -0.06, "NH-02": -1.71, "NJ-01": -10.32, "NJ-02": 4.81, "NJ-03": -4.61, "NJ-04": 14.13, "NJ-05": -3.72, "NJ-06": -7.95, "NJ-07": 1.33, "NJ-08": -21.95, "NJ-09": -8.31, "NJ-10": -30.01, "NJ-11": -5.8, "NJ-12": -12.09, "NM-01": -4.7, "NM-02": -1.12, "NM-03": -3.59, "NY-01": 2.93, "NY-02": 3.4, "NY-03": -1.78, "NY-04": -5.09, "NY-05": -30.42, "NY-06": -14.73, "NY-07": -31.1, "NY-08": -25.83, "NY-09": -25.11, "NY-10": -34.69, "NY-11": 5.89, "NY-12": -34.23, "NY-13": -38.29, "NY-14": -27.94, "NY-15": -34.85, "NY-16": -20.14, "NY-17": -2.88, "NY-18": -1.31, "NY-19": 0.43, "NY-20": -6.94, "NY-21": 8.82, "NY-22": -1.15, "NY-23": 11.75, "NY-24": 11.45, "NY-25": -7.39, "NY-26": -9.02, "NC-01": -2.05, "NC-02": -11.89, "NC-03": 14.99, "NC-04": -15.76, "NC-05": 13.0, "NC-06": -4.08, "NC-07": 8.49, "NC-08": 19.63, "NC-09": 6.08, "NC-10": 22.16, "NC-11": 7.83, "NC-12": -12.7, "NC-13": 1.64, "NC-14": -5.54, "ND-01": 19.85, "OH-01": -1.75, "OH-02": 24.87, "OH-03": -19.71, "OH-04": 20.49, "OH-05": 15.48, "OH-06": 16.11, "OH-07": 6.98, "OH-08": 13.74, "OH-09": 3.22, "OH-10": 4.12, "OH-11": -27.63, "OH-12": 17.58, "OH-13": 0.64, "OH-14": 9.45, "OH-15": 5.92, "OK-01": 13.88, "OK-02": 28.89, "OK-03": 24.38, "OK-04": 18.55, "OK-05": 12.4, "OR-01": -17.74, "OR-02": 15.21, "OR-03": -22.18, "OR-04": -4.05, "OR-05": -1.82, "OR-06": -4.06, "PA-01": 0.13, "PA-02": -20.46, "PA-03": -38.99, "PA-04": -7.01, "PA-05": -13.97, "PA-06": -4.76, "PA-07": 2.12, "PA-08": 4.12, "PA-09": 21.03, "PA-10": 4.85, "PA-11": 13.42, "PA-12": -7.85, "PA-13": 25.12, "PA-14": 18.07, "PA-15": 20.79, "PA-16": 12.71, "PA-17": -0.37, "RI-01": -12.39, "RI-02": -4.24, "SC-01": 7.24, "SC-02": 8.27, "SC-03": 21.15, "SC-04": 12.22, "SC-05": 11.53, "SC-06": -14.33, "SC-07": 11.48, "SD-01": 16.05, "TN-01": 30.06, "TN-02": 17.82, "TN-03": 18.8, "TN-04": 21.77, "TN-05": 8.56, "TN-06": 17.3, "TN-07": 10.05, "TN-08": 21.23, "TN-09": -22.39, "TX-01": 25.53, "TX-02": 14.84, "TX-03": 10.92, "TX-04": 16.39, "TX-05": 14.24, "TX-06": 15.12, "TX-07": -13.29, "TX-08": 16.44, "TX-09": -25.68, "TX-10": 12.59, "TX-11": 22.83, "TX-12": 12.26, "TX-13": 26.05, "TX-14": 16.52, "TX-15": 1.36, "TX-16": -17.06, "TX-17": 14.32, "TX-18": -23.16, "TX-19": 25.92, "TX-20": -14.88, "TX-21": 13.16, "TX-22": 11.05, "TX-23": 5.27, "TX-24": 9.81, "TX-25": 18.66, "TX-26": 13.04, "TX-27": 13.32, "TX-28": -3.2, "TX-29": -18.44, "TX-30": -26.8, "TX-31": 13.72, "TX-32": -14.05, "TX-33": -23.68, "TX-34": -8.6, "TX-35": -20.97, "TX-36": 18.29, "TX-37": -24.29, "TX-38": 12.38, "UT-01": 12.3, "UT-02": 11.24, "UT-03": 13.08, "UT-04": 15.94, "VT-01": -15.54, "VA-01": 6.34, "VA-02": 2.05, "VA-03": -17.04, "VA-04": -15.75, "VA-05": 6.62, "VA-06": 13.83, "VA-07": -0.88, "VA-08": -26.27, "VA-09": 23.32, "VA-10": -5.92, "VA-11": -18.29, "WA-01": -13.31, "WA-02": -9.29, "WA-03": 4.62, "WA-04": 11.41, "WA-05": 7.74, "WA-06": -6.31, "WA-07": -36.5, "WA-08": -1.05, "WA-09": -21.11, "WA-10": -6.66, "WV-01": 23.23, "WV-02": 21.52, "WI-01": 3.1, "WI-02": -18.93, "WI-03": 4.36, "WI-04": -24.76, "WI-05": 14.29, "WI-06": 10.24, "WI-07": 12.27, "WI-08": 10.16, "WY-01": 25.27}




export async function attachPVI(races: Race[]){

    const PRESIDENT_POLLS = (await useStorage("redis").getItem("polls.president")) as { [key: string]: Poll[]; };
    const SENATE_POLLS = (await useStorage("redis").getItem("polls.senate")) as { [key: string]: Poll[]; };
    const COUNTY_DATA = (await useStorage("redis").getItem("polls.countyData")) as HistoricalCounty[];


    for(let race of races){

        // Calculate State Cook PVI
        let keys = Object.keys(HOUSE_PVI).filter(x => (x.includes(race.state?.name || 'I AM NOT IN HERE LOL')));
        let statePvi = keys.length > 0 ? keys.reduce((prev: number, curr: string) => {
            return prev + HOUSE_PVI[curr];
        }, 0) / keys.length : 0;

        for(let reportingUnit of race.reportingUnits){
            

            if(reportingUnit.reportingunitLevel == 1){

                if(race.officeID == OfficeType.House){
                    let seatNum = Number(race.seatNum) < 10 ? '0'+race.seatNum : race.seatNum;

                    let seatId = race.state?.postalCode + "-" + seatNum;

                    let districtPvi = HOUSE_PVI[seatId];

                    reportingUnit.cookPVI = districtPvi;
                }
                else {
                    reportingUnit.cookPVI = statePvi;
                }

                if (race.officeID == OfficeType.President){

                    race.pollingAverage = await getPollingAverage(race, PollingAverageType.President, PRESIDENT_POLLS);

                }
                else if (race.officeID == OfficeType.Senate){

                    race.pollingAverage = await getPollingAverage(race, PollingAverageType.Senate, SENATE_POLLS);

                }
                else {


                    


                }

            }

            if(reportingUnit.reportingunitLevel == 2){
                // County



            }


        }


    }

    // Attach probabilities
    for(let race of races){
        let probabilities = getRaceProbabilities(race, COUNTY_DATA);

        race.candidates = race.candidates.sort((a: ReportingCandidate, b:ReportingCandidate) => {

            if((a.voteCount || 0) > (b.voteCount || 0)) return -1;
            if((a.voteCount || 0) < (b.voteCount || 0)) return 1;

            let polIDa = a.polID;
            let polIDb = b.polID;

            (probabilities[polIDa || ''] || 0 > (probabilities[polIDb || ''] || 0)) ? -1 : 1;

            return 0;

        });

        if(Object.keys(probabilities).length > 0){

            for(let key of Object.keys(probabilities)){
                let cand = race.candidates.find(x => x.polID == key);

                if(cand) cand.probability = probabilities[key];
            }
            race.hasProjectomatic = true;
        }

    }
}