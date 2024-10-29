import * as fs from "node:fs";
import path from "node:path";

export default defineEventHandler(async (event) => {
  
  const query = getQuery(event);

  let state = query.postalCode;
  let mapType: number | 'counties' | 'cds' = query.mapType as any;

  if(state == null || state == undefined || mapType == null || mapType == undefined){

    throw createError({
      statusCode: 400,
      statusMessage: "Invalid TopoJSON request."
    });

  }


  let fileName = isNaN(mapType as any) ? mapType.toString().toLowerCase() : "cd-" + mapType

  const filePath = path.join(process.cwd(), 'maps', (state as string).toUpperCase(), `${fileName}.json`);
  const data = await fs.promises.readFile(filePath, 'utf-8');

  return JSON.parse(data);

});
