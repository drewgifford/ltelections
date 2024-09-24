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
    }


]


export default class State {

    postalCode?: string
    fipsCode?: string
    name?: string

    constructor(props?: Partial<State> | string){

        if(typeof props === "string"){

            // Get state data


        } else {
            Object.assign(this, props);
        }
        
    }
}