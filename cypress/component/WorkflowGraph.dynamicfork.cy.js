import WorkflowGraph from "../../src/components/diagram/WorkflowGraph";
import {
  dagDynamicForkSuccess,
  dagDynamicForkFailure,
  dagDynamicForkRetries,
  dagDynamicForkUnexecuted,
  dagDynamicForkNoneSpawned,
  dagDynamicForkDefOnly,
} from "../../src/utils/test/dagDynamicFork";
import React from "react";

describe("Dynamic Fork", () => {
  describe("Definition Only", () => {
    const dag = dagDynamicForkDefOnly();

    it("DF top bar is present and has no color", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("svg").should("be.visible");

      cy.get("#dynamic_fork").should("have.class", "bar");
      cy.get("#dynamic_fork").should("have.class", "type-FORK_JOIN_DYNAMIC");
      cy.get("#dynamic_fork").should("not.have.class", "status_COMPLETED");
    });

    it("Spawned task placeholder is a stack of cards and has no color", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("svg").should("be.visible");

      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "type-DF_CHILDREN_PLACEHOLDER",
      );
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "not.have.class",
        "status_COMPLETED",
      );
    });

    it("Spawned task placeholder has placeholder text", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("svg").should("be.visible");

      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "contain.text",
        "Dynamically spawned tasks",
      );
    });

    it("DF bottom bar is present and has no color", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#dynamic_fork_join").should("have.class", "bar");
      cy.get("#dynamic_fork_join").should("have.class", "type-JOIN");
      cy.get("#dynamic_fork_join").should("not.have.class", "status_COMPLETED");
    });

    it("start and end not dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#__start").should("not.have.class", "dimmed");
      cy.get("#__final").should("not.have.class", "dimmed");
    });

    it("Click on top bar selects FORK_JOIN_DYNAMIC", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={false}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#dynamic_fork > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "dynamic_fork",
      });
    });

    it("Click on bottom bar selects JOIN", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={false}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#dynamic_fork_join > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "dynamic_fork_join",
      });
    });

    it("no dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
    });
  });

  describe("Unexecuted", () => {
    const dag = dagDynamicForkUnexecuted();

    it("DF top bar is dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork").should("have.class", "dimmed");
    });

    it("Spawned task placeholder is a stack of cards and is dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "type-DF_CHILDREN_PLACEHOLDER",
      );
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "dimmed",
      );
    });

    it("DF bottom bar is present and is dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_join").should("have.class", "dimmed");
    });

    it("start not dimmed and end is dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#__start").should("not.have.class", "dimmed");
      cy.get("#__final").should("have.class", "dimmed");
    });

    it("4 dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 4);
    });
  });

  describe("None Spawned", () => {
    const dag = dagDynamicForkNoneSpawned();

    it("DF top bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork").should("have.class", "bar");
      cy.get("#dynamic_fork").should("have.class", "type-FORK_JOIN_DYNAMIC");
      cy.get("#dynamic_fork").should("have.class", "status_COMPLETED");
    });

    it("Placeholder is a stack of cards and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "type-DF_CHILDREN_PLACEHOLDER",
      );
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "status_COMPLETED",
      );
    });

    it("Spawned task placeholder has placeholder text", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={false} />);
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "contain.text",
        "No tasks spawned",
      );
    });

    it("JOIN bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_join").should("have.class", "bar");
      cy.get("#dynamic_fork_join").should("have.class", "type-JOIN");
      cy.get("#dynamic_fork_join").should("have.class", "status_COMPLETED");
    });

    it("no dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
    });

    it("Click on placeholder is ignored.", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get(
        "#dynamic_fork_DF_CHILDREN_PLACEHOLDER > .label-container",
      ).click();
      cy.get("@onClickSpy").should("not.have.been.called");
    });
  });

  describe("High fanout - Success", () => {
    const dag = dagDynamicForkSuccess(5);
    it("DF top bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork").should("have.class", "bar");
      cy.get("#dynamic_fork").should("have.class", "type-FORK_JOIN_DYNAMIC");
      cy.get("#dynamic_fork").should("have.class", "status_COMPLETED");
    });

    it("DF top bar contains ref and name in parentheses", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork").should("contain.text", "dynamic_fork");
      cy.get("#dynamic_fork").should("contain.text", "(dynamic_fork_name)");
    });

    it("Placeholder is a stack of cards and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "type-DF_CHILDREN_PLACEHOLDER",
      );
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "status_COMPLETED",
      );
    });

    it("Placeholder has correct count of succeeded tasks", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "contain.text",
        "5 of 5 tasks succeeded",
      );
    });

    it("JOIN bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_join").should("have.class", "bar");
      cy.get("#dynamic_fork_join").should("have.class", "type-JOIN");
      cy.get("#dynamic_fork_join").should("have.class", "status_COMPLETED");
    });

    it("JOIN bar contains ref and name in parentheses", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_join").should("contain.text", "dynamic_fork_join");
      cy.get("#dynamic_fork_join").should(
        "contain.text",
        "(dynamic_fork_join_name)",
      );
    });

    it("no dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
    });

    it("Click on placeholder selects first child", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get(
        "#dynamic_fork_DF_CHILDREN_PLACEHOLDER > .label-container",
      ).click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "dynamic_fork_child_0",
      });
    });

    it("Click on top bar selects FORK_JOIN_DYNAMIC", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#dynamic_fork > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "dynamic_fork",
      });
    });

    it("Click on bottom bar selects JOIN", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#dynamic_fork_join > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "dynamic_fork_join",
      });
    });
  });

  describe("High fanout - Failure", () => {
    const dag = dagDynamicForkFailure(5);
    it("DF top bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork").should("have.class", "bar");
      cy.get("#dynamic_fork").should("have.class", "type-FORK_JOIN_DYNAMIC");
      cy.get("#dynamic_fork").should("have.class", "status_COMPLETED");
    });

    it("Placeholder is a stack of cards and FAILED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "type-DF_CHILDREN_PLACEHOLDER",
      );
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "status_FAILED",
      );
    });

    it("Placeholder has correct count of succeeded tasks", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "contain.text",
        "4 of 5 tasks succeeded",
      );
    });

    it("JOIN bar is present and FAILED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_join").should("have.class", "bar");
      cy.get("#dynamic_fork_join").should("have.class", "type-JOIN");
      cy.get("#dynamic_fork_join").should("have.class", "status_FAILED");
    });

    it("start not dimmed but final is", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#__start").should("not.have.class", "dimmed");
      cy.get("#__final").should("have.class", "dimmed");
    });

    it("1 dimmed edge", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 1);
    });
  });

  describe("High Fanout - Retries", () => {
    const dag = dagDynamicForkRetries(5);

    it("DF top bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork").should("have.class", "bar");
      cy.get("#dynamic_fork").should("have.class", "type-FORK_JOIN_DYNAMIC");
      cy.get("#dynamic_fork").should("have.class", "status_COMPLETED");
    });

    it("Placeholder is a stack of cards and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "type-DF_CHILDREN_PLACEHOLDER",
      );
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "have.class",
        "status_COMPLETED",
      );
    });

    it("Placeholder has correct count of succeeded tasks", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should(
        "contain.text",
        "5 of 5 tasks succeeded",
      );
    });

    it("JOIN bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_join").should("have.class", "bar");
      cy.get("#dynamic_fork_join").should("have.class", "type-JOIN");
      cy.get("#dynamic_fork_join").should("have.class", "status_COMPLETED");
    });

    it("start and final not dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#__start").should("not.have.class", "dimmed");
      cy.get("#__final").should("not.have.class", "dimmed");
    });

    it("no dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
    });
  });

  describe("Low fanout - Success", () => {
    const dag = dagDynamicForkSuccess(2);

    it("DF top bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork").should("have.class", "bar");
      cy.get("#dynamic_fork").should("have.class", "type-FORK_JOIN_DYNAMIC");
      cy.get("#dynamic_fork").should("have.class", "status_COMPLETED");
    });

    it("Placeholder does not exist", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_DF_CHILDREN_PLACEHOLDER").should("not.exist");
    });

    it("Children displayed explicitly", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_child_0").should("have.class", "status_COMPLETED");
      cy.get("#dynamic_fork_child_1").should("have.class", "status_COMPLETED");
    });

    it("Children has ref and name labels", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_child_0").should(
        "contain.text",
        "dynamic_fork_child_0",
      );
      cy.get("#dynamic_fork_child_1").should(
        "contain.text",
        "(dynamic_fork_child)",
      );
    });

    it("JOIN bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_join").should("have.class", "bar");
      cy.get("#dynamic_fork_join").should("have.class", "type-JOIN");
      cy.get("#dynamic_fork_join").should("have.class", "status_COMPLETED");
    });

    it("no dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
    });

    it("Click on child is handled", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#dynamic_fork_child_0 > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "dynamic_fork_child_0",
      });
    });
  });

  describe("Low fanout - Failure", () => {
    const dag = dagDynamicForkFailure(2);
    it("DF top bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork").should("have.class", "bar");
      cy.get("#dynamic_fork").should("have.class", "type-FORK_JOIN_DYNAMIC");
      cy.get("#dynamic_fork").should("have.class", "status_COMPLETED");
    });

    it("One child is in failed state", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_child_0").should("have.class", "status_COMPLETED");
      cy.get("#dynamic_fork_child_1").should("have.class", "status_FAILED");
    });

    it("JOIN bar is present and FAILED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_join").should("have.class", "bar");
      cy.get("#dynamic_fork_join").should("have.class", "type-JOIN");
      cy.get("#dynamic_fork_join").should("have.class", "status_FAILED");
    });

    it("start not dimmed but final is", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#__start").should("not.have.class", "dimmed");
      cy.get("#__final").should("have.class", "dimmed");
    });

    it("1 dimmed edge", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 1);
    });
  });

  describe("Low Fanout - Retries", () => {
    const dag = dagDynamicForkRetries(2);

    it("DF top bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork").should("have.class", "bar");
      cy.get("#dynamic_fork").should("have.class", "type-FORK_JOIN_DYNAMIC");
      cy.get("#dynamic_fork").should("have.class", "status_COMPLETED");
    });

    it("JOIN bar is present and COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_join").should("have.class", "bar");
      cy.get("#dynamic_fork_join").should("have.class", "type-JOIN");
      cy.get("#dynamic_fork_join").should("have.class", "status_COMPLETED");
    });

    it("Retried task is COMPLETED", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_child_1").should("have.class", "status_COMPLETED");
    });

    it("Retried task states attempts", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#dynamic_fork_child_1").should("contain.text", "2 Attempts");
    });

    it("start and final not dimmed", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get("#__start").should("not.have.class", "dimmed");
      cy.get("#__final").should("not.have.class", "dimmed");
    });

    it("no dimmed edges", () => {
      cy.mount(<WorkflowGraph dag={dag} executionMode={true} />);
      cy.get(".edgePath.dimmed").should("have.length", 0);
    });

    it("Click on retried child is handled", () => {
      const onClickSpy = cy.spy().as("onClickSpy");

      cy.mount(
        <WorkflowGraph
          dag={dag}
          executionMode={true}
          onTaskSelect={onClickSpy}
        />,
      );

      cy.get("#dynamic_fork_child_1 > .label-container").click();
      cy.get("@onClickSpy").should("have.been.calledWith", {
        ref: "dynamic_fork_child_1",
      });
    });
  });
});
