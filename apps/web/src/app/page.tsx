"use client";

import { useEffect, useState, ChangeEvent, FormEvent, useContext } from "react";
import Button from "../components/button/button";
import Input from "../components/input/input";
import Chip from "../components/chip/chip";
import Toast from "../components/toast/toast";
import ToastList from "../components/toast_list/toast_list";
import { ToastContext } from "../context/toastContext";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

export default function Web() {
  const [name, setName] = useState<string>("");
  const [response, setResponse] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | undefined>();

  const toastContext = useContext(ToastContext);
  useEffect(() => {
    setResponse(null);
    setError(undefined);
  }, [name]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setName(e.target.value);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const result = await fetch(`${API_HOST}/message/${name}`);
      const response = await result.json();
      setResponse(response);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch response");
    }
  };

  const onReset = () => {
    setName("");
  };

  return (
    <div>
      <h1>Web</h1>
      <Button
        label="hi guys"
        variant="dark"
        onClick={() =>
          toastContext.addToast("DIRTY DEEDSSSS DONE DIRT CHEAP!!!!", "warning")
        }
      />
      <Button
        label="hi guys"
        variant="light"
        onClick={() =>
          toastContext.addToast(
            "DIRTY DEEDSSSS DONE DIRT CHEAPPPPPPPPPPPPPPPPPPPPPPPPPp!!!!",
            "success"
          )
        }
      />
      <Button
        label="hi guys"
        variant="primary"
        onClick={() => console.log("DIRTY DEEDSSSS DONE DIRT CHEAP!!!!")}
      />
      <Button
        label="hi guys"
        variant="secondary"
        onClick={() => console.log("DIRTY DEEDSSSS DONE DIRT CHEAP!!!!")}
      />
      <Button
        label="hi guys"
        variant="warning"
        onClick={() => console.log("DIRTY DEEDSSSS DONE DIRT CHEAP!!!!")}
      />
      <Button
        label="hi guys"
        variant="danger"
        onClick={() => console.log("DIRTY DEEDSSSS DONE DIRT CHEAP!!!!")}
      />
      <Input
        placeholder="hi guys"
        variant="dark"
        onChange={(e) => console.log(e.target.value)}
        doesSubmit={true}
        onSubmit={(val: string) => console.log(val)}
        submitLabel="Submit"
        label="RIDE THE LIGHTNINGGGGGGG"
        labelVariant="dark"
      />
      <Input
        placeholder="hi guys"
        variant="light"
        onChange={(e) => console.log(e.target.value)}
        doesSubmit={true}
        onSubmit={(val: string) => console.log(val)}
        submitLabel="Submit"
        label="RIDE THE LIGHTNINGGGGGGG"
      />
      <Input
        placeholder="hi guys"
        variant="primary"
        onChange={(e) => console.log(e.target.value)}
        doesSubmit={true}
        onSubmit={(val: string) => console.log(val)}
        submitLabel="Submit"
        label="RIDE THE LIGHTNINGGGGGGG"
      />
      <Input
        placeholder="hi guys"
        variant="secondary"
        onChange={(e) => console.log(e.target.value)}
        doesSubmit={true}
        onSubmit={(val: string) => console.log(val)}
        submitLabel="Submit"
        label="RIDE THE LIGHTNINGGGGGGG"
      />
      <Input
        placeholder="hi guys"
        variant="warning"
        onChange={(e) => console.log(e.target.value)}
        doesSubmit={true}
        onSubmit={(val: string) => console.log(val)}
        submitLabel="Submit"
        label="RIDE THE LIGHTNINGGGGGGG"
      />
      <Input
        placeholder="hi guys"
        variant="danger"
        onChange={(e) => console.log(e.target.value)}
        doesSubmit={true}
        onSubmit={(val: string) => console.log(val)}
        submitLabel="Submit"
        label="RIDE THE LIGHTNINGGGGGGG"
      />
      <Chip label="hi guys" variant="dark" />
      <Chip label="hi guys" variant="light" />
      <Chip label="hi guys" variant="primary" />
      <Chip label="hi guys" variant="secondary" />
      <Chip label="hi guys" variant="warning" />
      <Chip label="hi guys" variant="danger" />
      <Toast message="HOLD MY BREATH AS I WISH FOR DEATHHHH" />
      <ToastList
        data={[
          {
            message: "AYYYYYY",
            type: "warning",
          },
          {
            message: "AYYYYYY",
            type: "warning",
          },
        ]}
      />
      <form onSubmit={onSubmit}>
        <label htmlFor="name">Name </label>
        <input
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={onChange}
        ></input>
        <button type="submit">Submit</button>
      </form>
      {error && (
        <div>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
      {response && (
        <div>
          <h3>Greeting</h3>
          <p>{response.message}</p>
          <button onClick={onReset}>Reset</button>
        </div>
      )}
    </div>
  );
}
