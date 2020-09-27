const fs = require("fs");
(async function () {
    let frP = fs.promises.readFile("f1.txt");
    let data = await frP;

   
    console.log("Data "+data);
    
})()