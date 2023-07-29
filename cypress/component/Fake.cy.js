import React from "react";

// describe("Await browser", ()=>{
//     it("Wait test", ()=>{
const syncWait = ms => {
    const end = Date.now() + ms
    while (Date.now() < end) continue
}

syncWait(10000)
//     })
// })