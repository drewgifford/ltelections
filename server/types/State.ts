import States from "../utils/States";

export default class State {

    postalCode?: string
    fipsCode?: string
    name?: string

    constructor(props?: Partial<State> | string){

        if(typeof props === "string"){

            // Get state data
            let stateData = States;
            let state = stateData.find(x => x.apId == props);

            if(state){
                Object.assign(this, state);
            }

        } else {
            Object.assign(this, props);
        }
        
    }
}