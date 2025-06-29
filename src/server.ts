import app from "./app";
import { PrismaClient } from "@prisma/client";
import { importCharacters } from "./scripts/importCharacters";

const prisma = new PrismaClient()
// importCharacters
const port = process.env.PORT 

app.listen(port, ()=> {
    console.log(`Server is running on http://localhost:${port}`)
})