export default defineEventHandler(async (event) => {
  return {
    racesActive: (await useStorage().getItem("racesActive"))
  };
})
