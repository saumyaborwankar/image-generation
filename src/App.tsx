import { Tabs, type TabsProps } from "antd";
import "./App.css";
import { CardComponent } from "./components/Card";
import { History } from "./components/History";
import { useState } from "react";

function App() {
  const [generatedImages, setGeneratedImages] = useState<
    { prompt: string; image: string }[]
  >([]);
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Generate",
      children: <CardComponent setGeneratedImages={setGeneratedImages} />,
    },
    {
      key: "2",
      label: "History",
      children: <History generatedImages={generatedImages} />,
    },
  ];
  return (
    <>
      <Tabs defaultActiveKey="1" items={items} style={{ color: "white" }} />
    </>
  );
}

export default App;
