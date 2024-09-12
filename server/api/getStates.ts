export default defineEventHandler(async (event) => {
  
  let date = "2024-11-05";
  let states = await useStorage("redis").getItem(`${date}-states`);

  return states;

})
