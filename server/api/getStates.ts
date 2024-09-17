export default defineEventHandler(async (event) => {
  
  let date = process.env.ELECTION_DATE || "";
  let states = await useStorage("redis").getItem(`${date}-states`);

  return states;

})
