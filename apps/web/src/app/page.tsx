"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import Button from "components/button";
import Input from "components/input";
import Chip from "components/chip";
import Carousel from "components/carousel";
import Toast from "components/toast";
import RadioGroup from "components/radioGroup";
import ToastList from "components/toastList";
import CheckboxGroup from "components/checkboxGroup";
import MultilineInput from "components/multilineInput";
import Dropdown from "components/dropdown";
import ProgressWheel from "components/progressWheel";
import Tooltip from "components/tooltip";
import Dialog from "components/dialog";
import Navbar from "components/navbar";
import TableData from "components/tableData";
import TableRow from "components/tableRow";
import Table from "components/table";
import Card from "components/card";
import { useToastContext } from "utils/hooks/useToastContext";
import CardExpanded from "components/cardExpanded";
import RichEditor from "components/richEditor/richEditor";
import SlideButton from "components/slideButton";
import ImagePicker from "components/imagePicker";
import AddIcon from "@mui/icons-material/Add";
import ImageDrop from "components/imageDrop";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

export default function Web() {
  const [name, setName] = useState<string>("");
  const [response, setResponse] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [dialogActive, setDialogActive] = useState<boolean>(false);
  const [file, setFile] = useState<File>();
  const toastContext = useToastContext();
  useEffect(() => {
    setResponse(null);
    setError(undefined);
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
      <Navbar variant="dark" />
      <h1 style={{ marginBottom: 64 }}>Web</h1>
      <RichEditor />
      <RichEditor variant="light" />
      <SlideButton
        options={["HIIII", "hiIII GUYSSSS", "I HOLD THE WHEELLLLLLL"]}
      />
      <div>
        <ImageDrop onFile={setFile} variant="light" />
        <ImagePicker file={file} onChange={(e) => console.log(e)} />
      </div>

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
        onClick={() => setDialogActive(true)}
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
        placeholder="search..."
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
        placeholder="search..."
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
        placeholder="search..."
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
        placeholder="search..."
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
        placeholder="search..."
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
        placeholder="search..."
      />
      <Tooltip
        message="the world has turned and left me here"
        variant="light"
        direction="right"
      >
        <ProgressWheel
          variant="light"
          label="LOVERRRRRRRRR YOU SHOULD'VE COME OVER"
        />
      </Tooltip>

      <Tooltip
        message="the world has turned and left me here"
        variant="dark"
        direction="bottom"
      >
        <ProgressWheel variant="dark" />
      </Tooltip>

      <Tooltip
        message="the world has turned and left me here"
        variant="primary"
        direction="left"
      >
        <ProgressWheel variant="primary" />
      </Tooltip>
      <Tooltip
        message="the world has turned and left me here"
        variant="secondary"
        direction="right"
      >
        <ProgressWheel variant="secondary" />
      </Tooltip>
      <Tooltip
        message="the world has turned and left me here"
        variant="warning"
      >
        <ProgressWheel variant="warning" />
      </Tooltip>
      <Tooltip message="the world has turned and left me here" variant="danger">
        <ProgressWheel variant="danger" />
      </Tooltip>

      <Dialog
        active={dialogActive}
        onClose={() => setDialogActive(false)}
        variant="light"
      >
        <h3>Dialog</h3>
        <p>Are you sure you want to continue?</p>
        <Button
          label="Yes"
          variant="primary"
          onClick={() => {
            console.log("Yes");
            setDialogActive(false);
          }}
        />
        <Button
          label="No"
          variant="danger"
          onClick={() => {
            console.log("No");
            setDialogActive(false);
          }}
        />
      </Dialog>
      <Table variant="light" isNumbered={true}>
        <TableRow>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>testdsadsadasdsa</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
      </Table>

      <Table variant="dark" isNumbered={true}>
        <TableRow>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>testdsadsadasdsa</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
      </Table>

      <Table variant="primary" isNumbered={true}>
        <TableRow>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>testdsadsadasdsa</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
      </Table>

      <Table variant="secondary" isNumbered={true}>
        <TableRow>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>testdsadsadasdsa</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
      </Table>

      <Table variant="warning" isNumbered={true}>
        <TableRow>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>testdsadsadasdsa</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
      </Table>

      <Table variant="danger" isNumbered={true}>
        <TableRow>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
          <TableData isHeader={true}>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>testdsadsadasdsa</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
        <TableRow>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
          <TableData>test</TableData>
        </TableRow>
      </Table>

      <Card
        variant="light"
        image="https://prairieblossomnursery.com/cdn/shop/products/Hibiscusfiesta_6b1a41c4-9fdd-42e5-95bf-1fd610fe0c9c_1200x1200.png?v=1671389287"
        label="HI GUYSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS"
        participants={32189312}
      />
      <Card
        variant="dark"
        image="https://prairieblossomnursery.com/cdn/shop/products/Hibiscusfiesta_6b1a41c4-9fdd-42e5-95bf-1fd610fe0c9c_1200x1200.png?v=1671389287"
        label="HI "
        participants={32189321}
      />
      <CardExpanded
        variant="dark"
        image="https://prairieblossomnursery.com/cdn/shop/products/Hibiscusfiesta_6b1a41c4-9fdd-42e5-95bf-1fd610fe0c9c_1200x1200.png?v=1671389287"
        label="HI "
        participants={32189321}
        registrationTillDate={Date.now()}
        startDate={Date.now()}
        endDate={Date.now()}
        organizerName={"Queens of the Stone Age"}
        tags={["beginner friendly", "databases", "machine learning/ai"]}
        category={"programming"}
      />
      <CardExpanded
        variant="light"
        image="https://prairieblossomnursery.com/cdn/shop/products/Hibiscusfiesta_6b1a41c4-9fdd-42e5-95bf-1fd610fe0c9c_1200x1200.png?v=1671389287"
        label="HI "
        participants={32189321}
        registrationTillDate={Date.now()}
        startDate={Date.now()}
        endDate={Date.now()}
        organizerName={"Queens of the Stone Age"}
        tags={["beginner friendly", "databases", "machine learning/ai"]}
        category={"programming"}
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
