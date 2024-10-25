import Poll from "../polling/Poll";
import Race from "../types/Race";

const PRESIDENT_RESULTS: any = {"AL": {"2012": {"GOP": 0.6055, "Dem": 0.3836}, "2016": {"GOP": 0.6208, "Dem": 0.3436}, "2020": {"Dem": 0.3657, "GOP": 0.6203}}, "AK": {"2012": {"GOP": 0.548, "Dem": 0.4081}, "2016": {"GOP": 0.5128, "Dem": 0.3655}, "2020": {"Dem": 0.4277, "GOP": 0.5283}}, "AZ": {"2012": {"GOP": 0.5365, "Dem": 0.4459}, "2016": {"GOP": 0.4867, "Dem": 0.4513}, "2020": {"Dem": 0.4936, "GOP": 0.4906}}, "AR": {"2012": {"GOP": 0.6057, "Dem": 0.3688}, "2016": {"GOP": 0.6057, "Dem": 0.3365}, "2020": {"Dem": 0.3478, "GOP": 0.624}}, "CA": {"2012": {"Dem": 0.6024, "GOP": 0.3712}, "2016": {"Dem": 0.6173, "GOP": 0.3162}, "2020": {"Dem": 0.6348, "GOP": 0.3432}}, "CO": {"2012": {"Dem": 0.5149, "GOP": 0.4613}, "2016": {"Dem": 0.4816, "GOP": 0.4325}, "2020": {"Dem": 0.5501, "GOP": 0.416}}, "CT": {"2012": {"Dem": 0.5809, "GOP": 0.4075}, "2016": {"Dem": 0.5457, "GOP": 0.4093}, "2020": {"Dem": 0.5926, "GOP": 0.3919}}, "DE": {"2012": {"Dem": 0.5861, "GOP": 0.3998}, "2016": {"Dem": 0.5335, "GOP": 0.4192}, "2020": {"Dem": 0.5874, "GOP": 0.3977}}, "DC": {"2012": {"Dem": 0.9091, "GOP": 0.0728}, "2016": {"Dem": 0.9048, "GOP": 0.0407}, "2020": {"Dem": 0.9215, "GOP": 0.054}}, "FL": {"2012": {"Dem": 0.5001, "GOP": 0.4913}, "2016": {"GOP": 0.4902, "Dem": 0.4782}, "2020": {"Dem": 0.4786, "GOP": 0.5122}}, "GA": {"2012": {"GOP": 0.5333, "Dem": 0.4551}, "2016": {"GOP": 0.5077, "Dem": 0.4564}, "2020": {"Dem": 0.4947, "GOP": 0.4924}}, "HI": {"2012": {"Dem": 0.7015, "GOP": 0.2768}, "2016": {"Dem": 0.6098, "GOP": 0.2944}, "2020": {"Dem": 0.6315, "GOP": 0.3395}}, "ID": {"2012": {"GOP": 0.6453, "Dem": 0.3262}, "2016": {"GOP": 0.5926, "Dem": 0.2749}, "2020": {"Dem": 0.3307, "GOP": 0.6384}}, "IL": {"2012": {"Dem": 0.576, "GOP": 0.4073}, "2016": {"Dem": 0.5583, "GOP": 0.3876}, "2020": {"Dem": 0.5754, "GOP": 0.4055}}, "IN": {"2012": {"GOP": 0.5413, "Dem": 0.4393}, "2016": {"GOP": 0.5694, "Dem": 0.3777}, "2020": {"Dem": 0.4096, "GOP": 0.5702}}, "IA": {"2012": {"Dem": 0.5199, "GOP": 0.4618}, "2016": {"GOP": 0.5116, "Dem": 0.4175}, "2020": {"GOP": 0.528, "Dem": 0.4465}}, "KS": {"2012": {"GOP": 0.5971, "Dem": 0.3799}, "2016": {"GOP": 0.5665, "Dem": 0.3605}, "2020": {"GOP": 0.5621, "Dem": 0.4156}}, "KY": {"2012": {"GOP": 0.6049, "Dem": 0.378}, "2016": {"GOP": 0.6252, "Dem": 0.3268}, "2020": {"GOP": 0.6209, "Dem": 0.3615}}, "LA": {"2012": {"GOP": 0.5778, "Dem": 0.4058}, "2016": {"GOP": 0.5809, "Dem": 0.3845}, "2020": {"Dem": 0.3985, "GOP": 0.5846}}, "ME": {"2012": {"Dem": 0.5537, "GOP": 0.4033}, "2016": {"Dem": 0.4635, "GOP": 0.4348}, "2020": {"Dem": 0.5253, "GOP": 0.4355}}, "MD": {"2012": {"Dem": 0.6197, "GOP": 0.359}, "2016": {"Dem": 0.0, "GOP": 0.0001}, "2020": {"GOP": 0.3215, "Dem": 0.6536}}, "MA": {"2012": {"Dem": 0.6034, "GOP": 0.3732}, "2016": {"Dem": 0.5905, "GOP": 0.3229}, "2020": {"Dem": 0.6512, "GOP": 0.3191}}, "MI": {"2012": {"Dem": 0.5421, "GOP": 0.4471}, "2016": {"GOP": 0.475, "Dem": 0.4727}, "2020": {"Dem": 0.5062, "GOP": 0.4784}}, "MN": {"2012": {"Dem": 0.5265, "GOP": 0.4496}, "2016": {"Dem": 0.4645, "GOP": 0.4493}, "2020": {"GOP": 0.4528, "Dem": 0.524}}, "MS": {"2012": {"GOP": 0.5529, "Dem": 0.4379}, "2016": {"GOP": 0.5794, "Dem": 0.4011}, "2020": {"Dem": 0.4106, "GOP": 0.576}}, "MO": {"2012": {"GOP": 0.5376, "Dem": 0.4438}, "2016": {"GOP": 0.5677, "Dem": 0.3814}, "2020": {"GOP": 0.568, "Dem": 0.4141}}, "MT": {"2012": {"GOP": 0.5535, "Dem": 0.417}, "2016": {"GOP": 0.5647, "Dem": 0.3594}, "2020": {"GOP": 0.5692, "Dem": 0.4055}}, "NE": {"2012": {"GOP": 0.598, "Dem": 0.3803}, "2016": {"GOP": 0.5875, "Dem": 0.337}, "2020": {"GOP": 0.5822, "Dem": 0.3917}}, "NV": {"2012": {"Dem": 0.5236, "GOP": 0.4568}, "2016": {"Dem": 0.4792, "GOP": 0.455}, "2020": {"GOP": 0.4767, "Dem": 0.5006}}, "NH": {"2012": {"Dem": 0.5198, "GOP": 0.464}, "2016": {"Dem": 0.4683, "GOP": 0.4646}, "2020": {"GOP": 0.4536, "Dem": 0.5271}}, "NJ": {"2012": {"Dem": 0.5834, "GOP": 0.4062}, "2016": {"Dem": 0.5545, "GOP": 0.4135}, "2020": {"GOP": 0.414, "Dem": 0.5733}}, "NM": {"2012": {"Dem": 0.5299, "GOP": 0.4284}, "2016": {"Dem": 0.4826, "GOP": 0.4004}, "2020": {"Dem": 0.5429, "GOP": 0.435}}, "NY": {"2012": {"Dem": 0.6076, "GOP": 0.3124}, "2016": {"Dem": 0.5614, "GOP": 0.3239}, "2020": {"Dem": 0.6039, "GOP": 0.3746}}, "NC": {"2012": {"GOP": 0.5039, "Dem": 0.4835}, "2016": {"GOP": 0.4983, "Dem": 0.4617}, "2020": {"GOP": 0.4993, "Dem": 0.4859}}, "ND": {"2012": {"GOP": 0.5832, "Dem": 0.387}, "2016": {"GOP": 0.6296, "Dem": 0.2723}, "2020": {"GOP": 0.6511, "Dem": 0.3176}}, "OH": {"2012": {"Dem": 0.5067, "GOP": 0.4769}, "2016": {"GOP": 0.5169, "Dem": 0.4356}, "2020": {"GOP": 0.5327, "Dem": 0.4524}}, "OK": {"2012": {"GOP": 0.6677, "Dem": 0.3323}, "2016": {"GOP": 0.6532, "Dem": 0.2893}, "2020": {"GOP": 0.6537, "Dem": 0.3229}}, "OR": {"2012": {"Dem": 0.5424, "GOP": 0.4215}, "2016": {"Dem": 0.5007, "GOP": 0.3909}, "2020": {"GOP": 0.4037, "Dem": 0.5645}}, "PA": {"2012": {"Dem": 0.5208, "GOP": 0.4668}, "2016": {"GOP": 0.4858, "Dem": 0.4785}, "2020": {"GOP": 0.4884, "Dem": 0.5001}}, "RI": {"2012": {"Dem": 0.627, "GOP": 0.3524}, "2016": {"Dem": 0.5441, "GOP": 0.389}, "2020": {"Dem": 0.5948, "GOP": 0.3867}}, "SC": {"2012": {"GOP": 0.5456, "Dem": 0.4409}, "2016": {"GOP": 0.5494, "Dem": 0.4067}, "2020": {"GOP": 0.5509, "Dem": 0.4342}}, "SD": {"2012": {"GOP": 0.5789, "Dem": 0.3987}, "2016": {"GOP": 0.6153, "Dem": 0.3174}, "2020": {"GOP": 0.6177, "Dem": 0.3561}}, "TN": {"2012": {"GOP": 0.5948, "Dem": 0.3908}, "2016": {"GOP": 0.6072, "Dem": 0.3472}, "2020": {"GOP": 0.6066, "Dem": 0.3745}}, "TX": {"2012": {"GOP": 0.5717, "Dem": 0.4138}, "2016": {"GOP": 0.5223, "Dem": 0.4324}, "2020": {"GOP": 0.5206, "Dem": 0.4648}}, "UT": {"2012": {"GOP": 0.7279, "Dem": 0.2475}, "2016": {"GOP": 0.4554, "Dem": 0.2746}, "2020": {"Dem": 0.3765, "GOP": 0.5813}}, "VT": {"2012": {"Dem": 0.6657, "GOP": 0.3097}, "2016": {"Dem": 0.5572, "GOP": 0.2976}, "2020": {"Dem": 0.6546, "GOP": 0.3038}}, "VA": {"2012": {"Dem": 0.5116, "GOP": 0.4728}, "2016": {"Dem": 0.4975, "GOP": 0.4443}, "2020": {"Dem": 0.5411, "GOP": 0.44}}, "WA": {"2012": {"Dem": 0.5616, "GOP": 0.4129}, "2016": {"Dem": 0.5254, "GOP": 0.3683}, "2020": {"Dem": 0.5797, "GOP": 0.3877}}, "WV": {"2012": {"GOP": 0.623, "Dem": 0.3554}, "2016": {"GOP": 0.6863, "Dem": 0.2648}, "2020": {"Dem": 0.297, "GOP": 0.6863}}, "WI": {"2012": {"Dem": 0.5278, "GOP": 0.4594}, "2016": {"GOP": 0.4722, "Dem": 0.4645}, "2020": {"Dem": 0.4945, "GOP": 0.4882}}, "WY": {"2012": {"GOP": 0.6819, "Dem": 0.2764}, "2016": {"GOP": 0.674, "Dem": 0.2163}, "2020": {"Dem": 0.2639, "GOP": 0.695}}}
const SENATE_RESULTS: any = {"AZ": {"2012": {"GOP": 0.4923, "Dem": 0.462}, "2016": {"Dem": 0.4075, "GOP": 0.5371}, "2018": {"GOP": 0.4761, "Dem": 0.4996}, "2020": {"GOP": 0.4881, "Dem": 0.5116}}, "CA": {"2012": {"Dem": 0.6252, "GOP": 0.3748}, "2016": {"Dem": 0.616}, "2018": {"Dem": 0.4584}}, "CT": {"2012": {"Dem": 0.5245, "GOP": 0.3999}, "2016": {"Dem": 0.5768, "GOP": 0.3462}, "2018": {"Dem": 0.568, "GOP": 0.3935}}, "DE": {"2012": {"Dem": 0.6642, "GOP": 0.2895}, "2014": {"GOP": 0.4223, "Dem": 0.5583}, "2018": {"Dem": 0.5995, "GOP": 0.3782}, "2020": {"Dem": 0.5944, "GOP": 0.379}}, "FL": {"2012": {"Dem": 0.5523, "GOP": 0.4223}, "2016": {"Dem": 0.4431, "GOP": 0.5198}, "2018": {"GOP": 0.5005, "Dem": 0.4993}}, "HI": {"2012": {"GOP": 0.3683, "Dem": 0.6165}, "2014": {"GOP": 0.2651, "Dem": 0.6676}, "2016": {"Dem": 0.7005, "GOP": 0.2117}, "2018": {"Dem": 0.7115, "GOP": 0.2885}}, "IN": {"2012": {"GOP": 0.4428, "Dem": 0.5004}, "2016": {"Dem": 0.4241, "GOP": 0.5211}, "2018": {"GOP": 0.5073, "Dem": 0.4484}}, "ME": {"2012": {"OTHER": 0.5113, "Dem": 0.1282}, "2014": {"GOP": 0.6702, "Dem": 0.3084}, "2018": {"GOP": 0.3523, "Dem": 0.1045}, "2020": {"GOP": 0.5042, "Dem": 0.4192}}, "MD": {"2012": {"Dem": 0.5598, "GOP": 0.2633, "OTHER": 0.1637}, "2016": {"Dem": 0.6089, "GOP": 0.3567}, "2018": {"GOP": 0.3031, "Dem": 0.6486}}, "MA": {"2012": {"GOP": 0.4579, "Dem": 0.5327}, "2014": {"GOP": 0.3622, "Dem": 0.5899}, "2018": {"Dem": 0.6034, "GOP": 0.3617}, "2020": {"Dem": 0.6446, "GOP": 0.322}}, "MI": {"2012": {"Dem": 0.588, "GOP": 0.3798}, "2014": {"GOP": 0.4133, "Dem": 0.5461}, "2018": {"GOP": 0.4576, "Dem": 0.5226}, "2020": {"Dem": 0.499, "GOP": 0.4822}}, "MN": {"2012": {"GOP": 0.3053, "Dem": 0.6523}, "2014": {"GOP": 0.4291, "Dem": 0.5315}, "2018": {"GOP": 0.4235, "Dem": 0.5297}, "2020": {"GOP": 0.435, "Dem": 0.4874}}, "MS": {"2012": {"GOP": 0.5716}, "2014": {"Dem": 0.3789, "GOP": 0.599}, "2018": {"Dem": 0.4637, "GOP": 0.5363}, "2020": {"Dem": 0.4413, "GOP": 0.5411}}, "MO": {"2012": {"GOP": 0.3911, "Dem": 0.5481}, "2016": {"GOP": 0.4918, "Dem": 0.4639}, "2018": {"GOP": 0.5138, "Dem": 0.4557}}, "MT": {"2012": {"Dem": 0.4858, "GOP": 0.4486}, "2014": {"GOP": 0.5779, "Dem": 0.4007}, "2018": {"Dem": 0.5033, "GOP": 0.4678}, "2020": {"Dem": 0.4499, "GOP": 0.5501}}, "NE": {"2012": {"Dem": 0.4223, "GOP": 0.5777}, "2014": {"Dem": 0.3149, "GOP": 0.6434}, "2018": {"GOP": 0.5769, "Dem": 0.3862}, "2020": {"GOP": 0.6274, "Dem": 0.2443}}, "NV": {"2012": {"GOP": 0.4587, "Dem": 0.4471}, "2016": {"GOP": 0.4467, "Dem": 0.471}, "2018": {"Dem": 0.5041, "GOP": 0.4538}}, "NJ": {"2012": {"Dem": 0.5887, "GOP": 0.3937}, "2014": {"Dem": 0.5584, "GOP": 0.4233}, "2018": {"Dem": 0.5401, "GOP": 0.4283}, "2020": {"Dem": 0.5723, "GOP": 0.4092}}, "NM": {"2012": {"Dem": 0.5101, "GOP": 0.4528}, "2014": {"GOP": 0.4444, "Dem": 0.5556}, "2018": {"Dem": 0.5409, "LIBERTARIAN": 0.1538, "GOP": 0.3053}, "2020": {"GOP": 0.4562, "Dem": 0.5173}}, "NY": {"2012": {"GOP": 0.2128, "Dem": 0.6211}, "2016": {"GOP": 0.221, "Dem": 0.6133}, "2018": {"Dem": 0.6202, "GOP": 0.2858}}, "ND": {"2012": {"GOP": 0.4932, "Dem": 0.5024}, "2016": {"GOP": 0.7848, "Dem": 0.1697}, "2018": {"GOP": 0.5511, "Dem": 0.4427}}, "OH": {"2012": {"GOP": 0.447, "Dem": 0.507}, "2016": {"Dem": 0.3716, "GOP": 0.5803}, "2018": {"Dem": 0.5341, "GOP": 0.4657}}, "PA": {"2012": {"GOP": 0.4459}, "2016": {"Dem": 0.4734, "GOP": 0.4877}, "2018": {"Dem": 0.5561, "GOP": 0.4274}}, "RI": {"2012": {"Dem": 0.6481, "GOP": 0.3497}, "2014": {"Dem": 0.7058, "GOP": 0.2925}, "2018": {"Dem": 0.6144}, "2020": {"Dem": 0.6648, "GOP": 0.3335}}, "TN": {"2012": {"GOP": 0.6489, "Dem": 0.3041}, "2014": {"Dem": 0.3187, "GOP": 0.6187}, "2018": {"GOP": 0.5471, "Dem": 0.4392}, "2020": {"GOP": 0.622, "Dem": 0.3516}}, "TX": {"2012": {"GOP": 0.5646, "Dem": 0.4062}, "2014": {"GOP": 0.6156, "Dem": 0.3436}, "2018": {"GOP": 0.5089, "Dem": 0.4833}, "2020": {"GOP": 0.5351, "Dem": 0.4387}}, "UT": {"2012": {"GOP": 0.6531, "Dem": 0.2998}, "2016": {"GOP": 0.6815, "Dem": 0.2706}, "2018": {"GOP": 0.6259, "Dem": 0.3091}}, "VT": {"2012": {"GOP": 0.249, "OTHER": 0.71}, "2016": {"GOP": 0.3234, "Dem": 0.5999}, "2018": {"OTHER": 0.6732, "GOP": 0.2739}}, "VA": {"2012": {"GOP": 0.4696, "Dem": 0.5287}, "2014": {"GOP": 0.4834, "Dem": 0.4915}, "2018": {"GOP": 0.4101, "Dem": 0.57}, "2020": {"Dem": 0.5599, "GOP": 0.4391}}, "WA": {"2012": {"Dem": 0.6045, "GOP": 0.3955}, "2016": {"GOP": 0.4099, "Dem": 0.5901}, "2018": {"Dem": 0.5843, "GOP": 0.4157}}, "WV": {"2012": {"Dem": 0.6057, "GOP": 0.3647}, "2014": {"Dem": 0.3446, "GOP": 0.6212}, "2018": {"Dem": 0.4955, "GOP": 0.463}, "2020": {"GOP": 0.7028, "Dem": 0.27}}, "WI": {"2012": {"Dem": 0.5141, "GOP": 0.4586}, "2016": {"Dem": 0.4681, "GOP": 0.5017}, "2018": {"Dem": 0.5542, "GOP": 0.4458}}, "WY": {"2012": {"GOP": 0.7389, "Dem": 0.2115}, "2014": {"GOP": 0.7102, "Dem": 0.1716}, "2018": {"GOP": 0.6696, "Dem": 0.301}, "2020": {"OTHER": 0.2613}}, "AL": {"2014": {"GOP": 0.9725}, "2016": {"Dem": 0.3587, "GOP": 0.6396}, "2020": {"Dem": 0.3974, "GOP": 0.601}}, "AK": {"2014": {"Dem": 0.4583, "GOP": 0.4796}, "2016": {"LIBERTARIAN": 0.2916, "Dem": 0.1162, "OTHER": 0.1323, "GOP": 0.4436}, "2020": {"Dem": 0.4119, "GOP": 0.539}}, "AR": {"2014": {"GOP": 0.565, "Dem": 0.3943}, "2016": {"GOP": 0.5977, "Dem": 0.3617}, "2020": {"LIBERTARIAN": 0.3347, "GOP": 0.6653}}, "CO": {"2014": {"GOP": 0.482, "Dem": 0.4626}, "2016": {"Dem": 0.4997, "GOP": 0.4431}, "2020": {"Dem": 0.535, "GOP": 0.4418}}, "GA": {"2014": {"GOP": 0.5289, "Dem": 0.4521}, "2016": {"Dem": 0.4103, "GOP": 0.5478}, "2020": {"GOP": 0.2591, "Dem": 0.329}, "2021": {"GOP": 0.4938, "Dem": 0.5062}}, "ID": {"2014": {"Dem": 0.3467, "GOP": 0.6533}, "2016": {"GOP": 0.6613, "Dem": 0.2773}, "2020": {"Dem": 0.3325, "GOP": 0.6262}}, "IL": {"2014": {"Dem": 0.5355, "GOP": 0.4269}, "2016": {"GOP": 0.3978, "Dem": 0.5486}, "2020": {"Dem": 0.5493, "GOP": 0.3887}}, "IA": {"2014": {"GOP": 0.521, "Dem": 0.4376}, "2016": {"GOP": 0.6009, "Dem": 0.3566}, "2020": {"GOP": 0.5088, "Dem": 0.444}}, "KS": {"2014": {"OTHER": 0.4253, "GOP": 0.5315}, "2016": {"Dem": 0.3224, "GOP": 0.6218}, "2020": {"GOP": 0.5322, "Dem": 0.4179}}, "KY": {"2014": {"Dem": 0.4072, "GOP": 0.5619}, "2016": {"GOP": 0.5727, "Dem": 0.4272}, "2020": {"GOP": 0.5776, "Dem": 0.3823}}, "LA": {"2014": {"GOP": 0.486, "Dem": 0.4431}, "2016": {"GOP": 0.2685, "Dem": 0.1742}, "2020": {"GOP": 0.5932, "Dem": 0.1902}}, "NH": {"2014": {"Dem": 0.5146, "GOP": 0.4821}, "2016": {"GOP": 0.4784, "Dem": 0.4798}, "2020": {"GOP": 0.4099, "Dem": 0.5664}}, "NC": {"2014": {"Dem": 0.4726, "GOP": 0.4882}, "2016": {"Dem": 0.4537, "GOP": 0.5106}, "2020": {"GOP": 0.4869, "Dem": 0.4694}}, "OK": {"2014": {"Dem": 0.2855, "GOP": 0.6785}, "2016": {"Dem": 0.2458, "GOP": 0.6774}, "2020": {"GOP": 0.6291, "Dem": 0.3275}}, "OR": {"2014": {"Dem": 0.5573, "GOP": 0.3687}, "2016": {"Dem": 0.566, "GOP": 0.3335}, "2020": {"GOP": 0.3932, "Dem": 0.5691}}, "SC": {"2014": {"Dem": 0.3709, "GOP": 0.6112}, "2016": {"Dem": 0.3437, "GOP": 0.6057}, "2020": {"GOP": 0.5444, "Dem": 0.4417}}, "SD": {"2014": {"GOP": 0.5037, "OTHER": 0.1709, "Dem": 0.2951}, "2016": {"GOP": 0.7183, "Dem": 0.2817}, "2020": {"GOP": 0.6574, "Dem": 0.3426}}}

const RESULT_WEIGHTS: any = {
    "2012": 0.05,
    "2014": 0.1,
    "2016": 0.5,
    "2018": 0.75,
    "2020": 1,
    "2021": 1.5,
    "2022": 1.5,
}

export enum PollingAverageType {
    
    Senate = "S",
    President = "P"

}

export type PollingAverage = {
    [polID: string]: {
        average: number,
        includedPolls: number
    }
}

export async function getPollingAverage(race: Race, type: PollingAverageType, POLLS: { [key: string]: Poll[] }){

    const INCLUDED_POLLS = 10;

    let stateName = race.state?.name || "";

    let includedPolls: Poll[] = [];

    if(Object.keys(POLLS).includes(stateName)){
        includedPolls = POLLS[stateName].filter(
            poll => {
                if(type == PollingAverageType.Senate) return true;
                
                if(!(poll.results.find(x => x.party == "DEM") && poll.results.find(x => x.party == "REP"))) return false;

                return true;
            }


        ).slice(0, 10);
    }

    let candidateAverages: PollingAverage = {}
    let candidates = race.candidates;

    for(let i = 0; i < includedPolls.length; i++){

        // For each poll
        let poll = includedPolls[i];
        let results = poll.results;

        for(let result of results){

            let party = result.party;

            if(party == "DEM") party = "Dem";
            else if (party == "REP") party = "GOP"; 
            else if (party == "LIB") party = "Lib";
            else if (party == "GRE") party = "Grn";
            else if (party == "IDP") party = "Ind";
            else if (party == "IND") party = "Ind";


            let cand = candidates.find(x => x.party == party && x.last == result.answer);

            if(!cand) {
                cand = candidates.find(x => x.last == result.answer);

                if(!cand) continue;

            };
            let key = cand.polID || 'undefined';

            if(!Object.keys(candidateAverages).includes(key)) {
                candidateAverages[key] = {
                    includedPolls: 0,
                    average: 0
                }
            }

            candidateAverages[key].average += Number(result.pct)/100;
            candidateAverages[key].includedPolls += 1;
        }
    }

    // Historical results

    // Historical results
    let stateResults = (type == PollingAverageType.President ? PRESIDENT_RESULTS : SENATE_RESULTS)[race.state?.postalCode || ''];
    let historicalAverages: any = {}

    
    for(let year of Object.keys(stateResults)){

        let results = stateResults[year];

        for(let party in results){

            let parsedParty = party;
            if(party == "OTHER") parsedParty = "Ind";
            else if(party == "LIBERTARIAN") parsedParty = "Lib";
            else if(party == "GREEN") parsedParty = "Grn";

            let cand = candidates.find(x => x.party == parsedParty);

            

            if(!cand) {
                continue;
            };
            let key = cand.polID || "undefined";

            if(!Object.keys(historicalAverages).includes(key)) {
                historicalAverages[key] = {
                    average: 0,
                    totalWeight: 0,
                };
            }

            let yearWeight = RESULT_WEIGHTS[year];
            historicalAverages[key].average += (results[party] * yearWeight);
            historicalAverages[key].totalWeight += yearWeight;

        }
    
    }

    for(let candName of Object.keys(historicalAverages)){
        historicalAverages[candName].average /= historicalAverages[candName].totalWeight;
    }

    for(let candName of Object.keys(historicalAverages)){

        if(!Object.keys(candidateAverages).includes(candName)) {
            candidateAverages[candName] = {
                average: 0,
                includedPolls: 0
            }
        }
        let includedPolls = candidateAverages[candName].includedPolls;

        if(includedPolls < INCLUDED_POLLS){
            let addedPolls = INCLUDED_POLLS - includedPolls;
            candidateAverages[candName].average += addedPolls * historicalAverages[candName].average;
            candidateAverages[candName].includedPolls = INCLUDED_POLLS;
        }

    }

    for(let candName of Object.keys(candidateAverages)){
        candidateAverages[candName].average /= candidateAverages[candName].includedPolls;
    }

    return candidateAverages;

}