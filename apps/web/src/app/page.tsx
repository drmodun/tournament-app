"use client";

import { useEffect, useState, ChangeEvent, FormEvent, useContext } from "react";
import Button from "components/button";
import Input from "components/input";
import Chip from "components/chip";
import Carousel from "components/carousel";
import Toast from "components/toast";
import RadioGroup from "components/radioGroup";
import { ToastContext } from "utils/context/toastContext";
import ToastList from "components/toastList";
import CheckboxGroup from "components/checkboxGroup";
import MultilineInput from "components/multilineInput";
import Dropdown from "components/dropdown";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

export default function Web() {
  const [name, setName] = useState<string>("");
  const [response, setResponse] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | undefined>();

  const toastContext = useContext(ToastContext);
  useEffect(() => {
    setResponse(null);
    setError(undefined);
    console.log(toastContext);
  }, [name, toastContext]);

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
            "success",
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
      <MultilineInput
        placeholder="hi guys"
        variant="danger"
        onChange={(e) => console.log(e.target.value)}
        label="RIDE THE LIGHTNINGGGGGGG"
      />
      <Chip label="hi guys" variant="dark" />
      <Chip label="hi guys" variant="light" />
      <Chip label="hi guys" variant="primary" />
      <Chip label="hi guys" variant="secondary" />
      <Chip label="hi guys" variant="warning" />
      <Chip label="hi guys" variant="danger" />
      <Toast message="HOLD MY BREATH AS I WISH FOR DEATHHHH" />
      <RadioGroup
        radioButtons={[
          {
            label: "test",
            variant: "dark",
            onSelect: () => {
              console.log("HEAVEN YEAHHH!!!1");
            },
            disabled: true,
          },
          {
            label: "test2",
            variant: "light",
            onSelect: () => {
              console.log("HEAVEN YEAHHH!!!2");
            },
          },
          {
            label: "test2",
            variant: "primary",
            onSelect: () => {
              console.log("HEAVEN YEAHHH!!!3");
            },
          },
          {
            label: "test2",
            variant: "secondary",
            onSelect: () => {
              console.log("HEAVEN YEAHHH!!!4");
            },
          },
          {
            label: "test2",
            variant: "warning",
            onSelect: () => {
              console.log("HEAVEN YEAHHH!!!5");
            },
          },
          {
            label: "test2",
            variant: "danger",
            onSelect: () => {
              console.log("HEAVEN YEAHHH!!!6");
            },
          },
        ]}
      />

      <CheckboxGroup
        checkboxes={[
          {
            label: "test",
            variant: "dark",
            onSelect: () => {
              console.log("HEAVEN YEAHHH!!!1");
            },
            disabled: true,
          },
          {
            label: "test2",
            variant: "light",
            onSelect: () => {
              console.log("HEAVEN YEAHHH!!!2");
            },
          },
          {
            label: "test2",
            variant: "primary",
            onSelect: () => {
              console.log("HEAVEN YEAHHH!!!3");
            },
          },
          {
            label: "test2",
            variant: "secondary",
            onSelect: () => {
              console.log("HEAVEN YEAHHH!!!4");
            },
          },
          {
            label: "test2",
            variant: "warning",
            onSelect: () => {
              console.log("HEAVEN YEAHHH!!!5");
            },
          },
          {
            label: "test2",
            variant: "danger",
            onSelect: () => {
              console.log("HEAVEN YEAHHH!!!6");
            },
          },
        ]}
      />
      <Carousel
        data={[
          {
            image:
              "https://prairieblossomnursery.com/cdn/shop/products/Hibiscusfiesta_6b1a41c4-9fdd-42e5-95bf-1fd610fe0c9c_1200x1200.png?v=1671389287",
            description:
              "The hibiscus flower  is a genus of flowering plants in the mallow family, Malvaceae.",
            title: "Hibiscus flower 1",
          },
          {
            image:
              "https://www.dispatch.com/gcdn/-mm-/2887f5d7d58a75a6437c45e987fd994202334aff/c=0-156-3000-1844/local/-/media/Visalia/2014/07/30/vtd0731mastergarderner2.jpg?width=3000&height=1688&fit=crop&format=pjpg&auto=webp",
            description:
              "The hibiscus flower  is a genus of flowering plants in the mallow family, Malvaceae.",
            title: "Hibiscus flower 2",
          },
        ]}
        variant="danger"
      ></Carousel>

      <ToastList />

      <div style={{ width: 300 }}>
        <Dropdown
          options={[
            {
              label: "NO MORE LIESSSSSSSS",
              variant: "dark",
              onClick: () => console.log("hi"),
            },
            {
              label: "NO MORE LIESSSSSSSSSSSSSSSSSSSSSSSSssS2",
              variant: "primary",
              onClick: () => console.log("hi2"),
            },
          ]}
          label="hi guys"
        />
        <Dropdown
          options={[
            {
              label: "NO MORE LIESSSSSSSS",
              variant: "dark",
              onClick: () => console.log("hi"),
            },
            {
              label: "NO MORE LIESSSSSSSSSSSSSSSSSSSSSSSSssS2",
              variant: "primary",
              onClick: () => console.log("hi2"),
            },
          ]}
          label="hi guys"
          variant="dark"
        />
        <Dropdown
          options={[
            {
              label: "NO MORE LIESSSSSSSS",
              variant: "dark",
              onClick: () => console.log("hi"),
            },
            {
              label: "NO MORE LIESSSSSSSSSSSSSSSSSSSSSSSSssS2",
              variant: "primary",
              onClick: () => console.log("hi2"),
            },
          ]}
          label="hi guys"
          variant="primary"
        />
        <Dropdown
          options={[
            {
              label: "NO MORE LIESSSSSSSS",
              variant: "dark",
              onClick: () => console.log("hi"),
            },
            {
              label: "NO MORE LIESSSSSSSSSSSSSSSSSSSSSSSSssS2",
              variant: "primary",
              onClick: () => console.log("hi2"),
            },
          ]}
          label="hi guys"
          variant="secondary"
        />
        <Dropdown
          options={[
            {
              label: "NO MORE LIESSSSSSSS",
              variant: "dark",
              onClick: () => console.log("hi"),
            },
            {
              label: "NO MORE LIESSSSSSSSSSSSSSSSSSSSSSSSssS2",
              variant: "primary",
              onClick: () => console.log("hi2"),
            },
          ]}
          label="hi guys"
          variant="warning"
        />
        <Dropdown
          options={[
            {
              label: "NO MORE LIESSSSSSSS",
              variant: "dark",
              onClick: () => console.log("hi"),
            },
            {
              label: "NO MORE LIESSSSSSSSSSSSSSSSSSSSSSSSssS2",
              variant: "primary",
              onClick: () => console.log("hi2"),
            },
          ]}
          label="hi guys"
          variant="danger"
        />
      </div>

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
