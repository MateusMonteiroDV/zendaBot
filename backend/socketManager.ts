import { createSocket } from "./bayle.js";

export async function addNumber(number:string):Promise<void>{
    await createSocket(number)

}
