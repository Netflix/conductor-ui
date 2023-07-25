import React from "react";
import DockLayout from "rc-dock";
import ReactJson from "../../components/rc-dock.css";

export default function RCDockTest() {
  const contentJson = Array.from(Array(100).keys()).map((v) => ({ key: v }));

  const defaultLayout = {
    dockbox: {
      mode: "horizontal",
      children: [
        {
          tabs: [
            {
              id: "id2",
              title: "change",
              content: <ReactJson src={contentJson} />,
            },
          ],
        },
        {
          tabs: [
            {
              id: "id1",
              title: "context consumer",
              content: <ReactJson src={contentJson} />,
            },
          ],
        },
      ],
    },
  };

  return (
    <DockLayout
      defaultLayout={defaultLayout}
      style={{ height: "100%", width: "100%" }}
    />
  );
}

/*
     
  */
