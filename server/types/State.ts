let states = [

    {
        name: "Alabama",
        postalCode: "AL",
        fipsCode: "01"
    },
    {
        name: "Alaska",
        postalCode: "AK",
        fipsCode: "02"
    },
    {
        name: "Arizona",
        postalCode: "AZ",
        fipsCode: "04"
    },
    {
        name: "Arkansas",
        postalCode: "AR",
        fipsCode: "05"
    },
    {
        name: "California",
        postalCode: "CA",
        fipsCode: "06"
    },
    {
        name: "Colorado",
        postalCode: "CO",
        fipsCode: "08"
    },
    {
        name: "Connecticut",
        postalCode: "CT",
        fipsCode: "09"
    },
    {
        name: "Delaware",
        postalCode: "DE",
        fipsCode: "10"
    },
    {
        name: "District of Columbia",
        postalCode: "DC",
        fipsCode: "11"
    },
    {
        name: "Florida",
        postalCode: "FL",
        fipsCode: "12"
    },
    {
        name: "Georgia",
        postalCode: "GA",
        fipsCode: "13"
    },
    {
        name: "Hawaii",
        postalCode: "HI",
        fipsCode: "15"
    },
    {
        name: "Idaho",
        postalCode: "ID",
        fipsCode: "16"
    },
    {
        name: "Illinois",
        postalCode: "IL",
        fipsCode: "17"
    },
    {
        name: "Indiana",
        postalCode: "IN",
        fipsCode: "18"
    },
    {
        name: "Iowa",
        postalCode: "IA",
        fipsCode: "19"
    },
    {
        name: "Kansas",
        postalCode: "KS",
        fipsCode: "20"
    },
    {
        name: "Kentucky",
        postalCode: "KY",
        fipsCode: "21"
    },
    {
        name: "Louisiana",
        postalCode: "LA",
        fipsCode: "22"
    },
    {
        name: "Maine",
        postalCode: "ME",
        fipsCode: "23"
    },
    {
        name: "Maryland",
        postalCode: "MD",
        fipsCode: "24"
    },
    {
        name: "Massachusetts",
        postalCode: "MA",
        fipsCode: "25"
    },
    {
        name: "Michigan",
        postalCode: "MI",
        fipsCode: "26"
    },
    {
        name: "Minnesota",
        postalCode: "MN",
        fipsCode: "27"
    },
    {
        name: "Mississippi",
        postalCode: "MS",
        fipsCode: "28"
    },
    {
        name: "Missouri",
        postalCode: "MO",
        fipsCode: "29"
    },
    {
        name: "Montana",
        postalCode: "MT",
        fipsCode: "30"
    },
    {
        name: "Nebraska",
        postalCode: "NE",
        fipsCode: "31"
    },
    {
        name: "Nevada",
        postalCode: "NV",
        fipsCode: "32"
    },
    {
        name: "New Hampshire",
        postalCode: "NH",
        fipsCode: "33"
    },
    {
        name: "New Jersey",
        postalCode: "NJ",
        fipsCode: "34"
    },
    {
        name: "New Mexico",
        postalCode: "NM",
        fipsCode: "35"
    },
    {
        name: "New York",
        postalCode: "NY",
        fipsCode: "36"
    },
    {
        name: "North Carolina",
        postalCode: "NC",
        fipsCode: "37"
    },
    {
        name: "North Dakota",
        postalCode: "ND",
        fipsCode: "38"
    },
    {
        name: "Ohio",
        postalCode: "OH",
        fipsCode: "39"
    },
    {
        name: "Oklahoma",
        postalCode: "OK",
        fipsCode: "40"
    },
    {
        name: "Oregon",
        postalCode: "OR",
        fipsCode: "41"
    },
    {
        name: "Pennsylvania",
        postalCode: "PA",
        fipsCode: "42"
    },
    {
        name: "Rhode Island",
        postalCode: "RI",
        fipsCode: "44"
    },
    {
        name: "South Carolina",
        postalCode: "SC",
        fipsCode: "45"
    },
    {
        name: "South Dakota",
        postalCode: "SD",
        fipsCode: "46"
    },
    {
        name: "Tennessee",
        postalCode: "TN",
        fipsCode: "47"
    },
    {
        name: "Texas",
        postalCode: "TX",
        fipsCode: "48"
    },
    {
        name: "Utah",
        postalCode: "UT",
        fipsCode: "49"
    },
    {
        name: "Vermont",
        postalCode: "VT",
        fipsCode: "50"
    },
    {
        name: "Virginia",
        postalCode: "VA",
        fipsCode: "51"
    },
    {
        name: "Washington",
        postalCode: "WA",
        fipsCode: "53"
    },
    {
        name: "West Virginia",
        postalCode: "WV",
        fipsCode: "54"
    },
    {
        name: "Wisconsin",
        postalCode: "WI",
        fipsCode: "55"
    },
    {
        name: "Wyoming",
        postalCode: "WY",
        fipsCode: "56"
    }
]

function getStateData(){
    return states;
}

export default class State {

    postalCode?: string
    fipsCode?: string
    name?: string

    constructor(props?: Partial<State> | string){

        if(typeof props === "string"){

            // Get state data
            let stateData = getStateData();
            let state = stateData.find(x => x.fipsCode == props);

            if(state){
                Object.assign(this, state);
            }

        } else {
            Object.assign(this, props);
        }
        
    }
}