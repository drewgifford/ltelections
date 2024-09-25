import Candidate from "../types/Candidate";

export default defineEventHandler(async (event) => {
  
    type BodyRes = {
        id: string,
      }

    const query: BodyRes = getQuery(event);
    
    let candidates = await useStorage().getItem("candidates");
  
  })
  