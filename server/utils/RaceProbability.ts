export function roundPercentage(pct: number, fixed?: number){

    if(fixed == null) fixed = 2;

    if(pct > 0.99){
        return ">99%";
    }
    if(pct < 0.01){
        return "<1%";
    }

    return (pct*100).toFixed(fixed) + "%";

}