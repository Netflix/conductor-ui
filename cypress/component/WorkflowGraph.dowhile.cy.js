import WorkflowGraph from "../../src/components/diagram/WorkflowGraph";
import {
  dagDoWhileDefOnly,
  dagDoWhileSuccess,
  dagDoWhileUnexecuted,
  dagDoWhileFailure,
  dagDoWhileRetries,
} from "../../src/utils/test/dagDoWhile";
import React from "react";

describe("Do While", () => {
  describe("Success", () => {
    const dag = dagDoWhileSuccess();

    it("Do-While top bar is present and is COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#loop_task").should("have.class", "bar");
      cy.get("#loop_task").should("have.class", "type-DO_WHILE");
      cy.get("#loop_task").should("have.class", "status_COMPLETED");
    });

    it("Do-While top bar contains ref and special label", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#loop_task").should("contain.text", "loop_task");
      cy.get("#loop_task").should("contain.text", "[DO_WHILE]");
    });

    it("Placeholder is a stack of cards and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#loop_task_LOOP_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "type-LOOP_CHILDREN_PLACEHOLDER",
      );
      cy.get("#loop_task_LOOP_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "status_COMPLETED",
      );
    });

    it("Placeholder has correct count", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#loop_task_LOOP_CHILDREN_PLACEHOLDER").should(
        "contain.text",
        "10 tasks in loop",
      );
    });

    it("Decorative loop is present and executed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.reverse").should("have.class", "executed");
      cy.get(".edgeLabel").should("contain.text", "LOOP");
    });

    it("All edges executed and not dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath")
        .should("have.length", 5)
        .should("have.class", "executed")
        .should("not.have.class", "dimmed");
    });

    it("DF bottom bar is present and is COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#loop_task-END").should("have.class", "bar");
      cy.get("#loop_task-END").should("have.class", "type-DO_WHILE_END");
      cy.get("#loop_task-END").should("have.class", "status_COMPLETED");
    });

    it("Bottom bar contains ref and special label", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#loop_task").should("contain.text", "loop_task");
      cy.get("#loop_task").should("contain.text", "[DO_WHILE]");
    });

    it("Click on placeholder selects first task of first iteration", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#loop_task_LOOP_CHILDREN_PLACEHOLDER > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "loop_task_child0",
      });
    });

    it("Click on top bar selects DO_WHILE", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#loop_task > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "loop_task",
      });
    });

    it("Click on bottom bar also selects DO_WHILE", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#loop_task-END > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "loop_task",
      });
    });
  });

  describe("Definition Only", () => {
    const dag = dagDoWhileDefOnly();

    it("DF top bar is present and has no color", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#loop_task").should("have.class", "bar");
      cy.get("#loop_task").should("have.class", "type-DO_WHILE");
      cy.get("#loop_task").should("not.have.class", "status_COMPLETED");
    });

    it("Loop tasks listed individually and have no color", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#loop_task_child0").should("not.have.class", "status_COMPLETED");
      cy.get("#loop_task_child1").should("not.have.class", "status_COMPLETED");
    });

    it("Loop tasks labeled", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#loop_task_child0").should("contain.text", "loop_task_child0");
      cy.get("#loop_task_child0").should("contain.text", "loop_task_child0");
    });

    it("DF bottom bar is present and has no color", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#loop_task-END").should("have.class", "bar");
      cy.get("#loop_task-END").should("have.class", "type-DO_WHILE_END");
      cy.get("#loop_task-END").should("not.have.class", "status_COMPLETED");
    });

    it("start and end not dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#__start").should("not.have.class", "dimmed");
      cy.get("#__final").should("not.have.class", "dimmed");
    });

    it("Click on top bar selects DO_WHILE", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#loop_task > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "loop_task",
      });
    });

    it("Click on bottom bar also selects DO_WHILE", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#loop_task-END > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "loop_task",
      });
    });

    it("Click on bottom bar also selects DO_WHILE", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#loop_task-END > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "loop_task",
      });
    });

    it("No edges dimmed or executed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
      cy.get(".edgePath.executed").should("have.length", 0);
    });
  });
  describe("Unexecuted", () => {
    const dag = dagDoWhileUnexecuted();

    it("All nodes dimmed except START", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".node.dimmed").should("have.length", 5);
      cy.get("#__start").should("not.have.class", "dimmed");
      cy.get(".status_COMPLETED").should("have.length", 0);
    });

    it("Loop tasks listed individually and have no color", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#loop_task_child0")
        .should("not.have.class", "status_COMPLETED")
        .should("not.have.class", "dimmed");
      cy.get("#loop_task_child1")
        .should("not.have.class", "status_COMPLETED")
        .should("not.have.class", "dimmed");
    });

    it("All edges dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath")
        .should("have.length", 6)
        .should("have.class", "dimmed")
        .should("not.have.class", "executed");
    });
  });

  describe("Failure", () => {
    const dag = dagDoWhileFailure();

    it("START is not dimmed ", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#__start").should("not.have.class", "dimmed");
    });

    it("Top bar is failed ", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#loop_task").should("have.class", "status_FAILED");
    });

    it("Placeholder is a stack of cards and FAILED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#loop_task_LOOP_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "type-LOOP_CHILDREN_PLACEHOLDER",
      );
      cy.get("#loop_task_LOOP_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "status_FAILED",
      );
    });

    it("Placeholder shows failure count", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#loop_task_LOOP_CHILDREN_PLACEHOLDER").should(
        "contain.text",
        "1 failed",
      );
    });

    it("Click on placeholder selects first task of first iteration", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#loop_task_LOOP_CHILDREN_PLACEHOLDER > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "loop_task_child0",
      });
    });

    it("Bottom bar is failed ", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#loop_task-END").should("have.class", "status_FAILED");
    });

    it("final bubble is dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#__final").should("have.class", "dimmed");
    });

    it("Oee edge dimmed, rest executed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 1);
      cy.get(".edgePath.executed").should("have.length", 4);
    });
  });

  describe("Retries", () => {
    const dag = dagDoWhileRetries();

    it("All edges executed and not dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath")
        .should("have.length", 5)
        .should("have.class", "executed")
        .should("not.have.class", "dimmed");
    });

    it("Placeholder has correct count", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#loop_task_LOOP_CHILDREN_PLACEHOLDER").should(
        "contain.text",
        "11 tasks in loop1 failed",
      );
    });
  });
});
