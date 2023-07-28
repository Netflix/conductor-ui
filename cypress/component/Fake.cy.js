import React from "react";

describe("Await browser", ()=>{
    it("Wait test", ()=>{
        cy.wait(100000)
    })
})