describe("Landing Page", () => {
  beforeEach(() => {
    cy.intercept("/api/workflow/search?**", { fixture: "workflowSearch.json" });
    cy.intercept("/api/tasks/search?**", { fixture: "taskSearch.json" });
    cy.intercept("/api/metadata/workflow", {
      fixture: "metadataWorkflow.json",
    });
    cy.intercept("/api/metadata/taskdefs", { fixture: "metadataTasks.json" });
    cy.intercept("/api/metadata/workflow/names-and-versions", {
      fixture: "namesAndVersions.json",
    });
  });

  it("Homepage preloads with default query", () => {
    cy.visit("/");
    cy.contains("Search Execution");
    cy.contains("Page 1 of 1");
    cy.get(".rdt_TableCell").contains("feature_value_compute_workflow");
  });

  it("Workflow name dropdown", () => {
    cy.visit("/");
    cy.get(".MuiAutocomplete-inputRoot input")
      .first()
      .should("be.enabled", { timeout: 5000 })
      .click();
    cy.get("li.MuiAutocomplete-option")
      .contains("Do_While_Workflow_Iteration_Fix")
      .click();
    cy.get(".MuiAutocomplete-tag").contains("Do_While_Workflow_Iteration_Fix");
  });

  it("Switch to Task Tab - No results", () => {
    cy.visit("/");
    cy.get("a.MuiTab-root").contains("Tasks").click();
    cy.contains("Task Name");
    cy.contains("There are no records to display");
  });

  it("Task Name Dropdown", () => {
    cy.visit("/");
    cy.get(".MuiAutocomplete-inputRoot input").first().click();
    cy.get(".MuiAutocomplete-option").contains("19test009").click();
    cy.get(".MuiAutocomplete-tag").contains("19test009");
  });

  it("Execute Task Search", () => {
    cy.visit("/");
    cy.get("button").contains("Search").click();
    cy.contains("Page 1 of 1");
    cy.get(".rdt_TableCell").contains("9a6438c5-60a4-4af6-b530-f2bf3a2dd859");
  });
});
