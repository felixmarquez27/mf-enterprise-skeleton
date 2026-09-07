import { useEffect } from "react";
import { Button, Badge } from "design-system";
import "./App.css";
import Counter from "./components/Counter";

export default () => {
  useEffect(() => {
    console.log("Remote useEffect");
  }, []);

  return (
    <section className="remote">
      <div className="remote-card">
        <div className="eyebrow">Remote · Federated</div>
        <div className="title">Payload bay</div>
        <p className="copy">Microfrontend</p>
        <Counter />
        <div className="mt-4 flex gap-2">
          <Button variant="default">Shadcn Button</Button>
          <Button variant="outline">Outline</Button>
        </div>
        <div className="mt-3">
          <Badge variant="secondary">Remote Microfrontend</Badge>
        </div>
      </div>
    </section>
  );
};
