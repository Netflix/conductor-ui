import { Layout, Model } from "flexlayout-react";
import "flexlayout-react/style/light.css";
import "./FlexLayoutTest.css";
import ReactJson from "../../components/ReactJson";
import { useRef } from "react";

const contentJson = Array.from(Array(100).keys()).map((v) => ({ key: v }));

const json = {
  global: { tabEnableFloat: true },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 50,
        enableTabStrip: false,
        children: [
          {
            type: "tab",
            name: "Sender",
            component: "sender",
          },
        ],
      },
      {
        type: "tabset",
        weight: 50,
        enableTabStrip: false,
        children: [
          {
            type: "tab",
            name: "Receiver",
            component: "receiver",
          },
        ],
      },
    ],
  },
};
const factory = (node) => {
  return <ReactJson src={contentJson} />;
};

function FlexLayoutTest() {
  const layoutRef = useRef(null);
  const modelRef = useRef(Model.fromJson(json));

  return <Layout ref={layoutRef} model={modelRef.current} factory={factory} />;
}

export default FlexLayoutTest;
