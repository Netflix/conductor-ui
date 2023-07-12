import React, { useState } from "react";
import { Form, Formik } from "formik";
import {
  Checkbox,
  Grid,
  Switch,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Toolbar,
  LinearProgress,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
  ButtonGroup,
  SplitButton,
  DropdownButton,
  Paper,
  Tab,
  Tabs,
  Heading,
  Text,
  Input,
  Select,
  Button,
  Pill,
} from "../../components";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import * as Yup from "yup";
import EnhancedTable from "./EnhancedTable";
import DataTableDemo from "./DataTableDemo";
import RCDTable from "./RDGTable";

import sharedStyles from "../styles";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import FormikInput from "../../components/formik/FormikInput";
import FormikJsonInput from "../../components/formik/FormikJsonInput";
import Dropdown from "./Dropdown";
import { ContextMenu } from "mui-nested-menu";

const useStyles = makeStyles(sharedStyles);

export default function KitchenSink() {
  const classes = useStyles();
  return (
    <div className={clsx([classes.wrapper, classes.padded])}>
      <Grid container spacing={5}>
        <Grid item xs={12}>
          <p>This is a Hawkins-like theme based on vanilla Material-UI.</p>
        </Grid>

        <Grid item xs={12}>
          <HeadingSection />
        </Grid>
        <Grid item xs={12}>
          <TabsSection />
        </Grid>
        <Grid item xs={12}>
          <Buttons />
        </Grid>
        <Grid item xs={12}>
          <Toggles />
        </Grid>
        <Grid item xs={12}>
          <Progress />
        </Grid>
        <Grid item xs={12}>
          <ContextMenuSection />
        </Grid>
        <Grid item xs={12}>
          <Checkboxes />
        </Grid>
        <Grid item xs={12}>
          <Inputs />
        </Grid>
        <Grid item xs={12}>
          <Dropdown />
        </Grid>
        <Grid item xs={12}>
          <ToolbarSection />
        </Grid>
        <Grid item xs={12}>
          <EnhancedTable />
        </Grid>
        <Grid item xs={12}>
          <DataTableDemo />
        </Grid>
        <Grid item xs={12}>
          <FormikSection />
        </Grid>
        <Grid item xs={12}>
          <RCDTable />
        </Grid>
      </Grid>
    </div>
  );
}

const ContextMenuSection = () => {
  return (
    <Paper padded>
      <Heading level={3}>Context Menu</Heading>
      <ContextMenu menuItemsData={menuItemsData}>
        <div
          style={{ height: 400, width: 400, border: "solid black 1px" }}
        ></div>
      </ContextMenu>
    </Paper>
  );
};

const menuItemsData = [
  {
    label: "New",
    callback: (event, item) => console.log("New clicked", event, item),
  },
  {
    label: "Save",
    callback: (event, item) => console.log("Save clicked", event, item),
  },
  {
    label: "Save As",
    items: [
      {
        label: "Option 1",
        callback: (event, item) =>
          console.log("Save As > Option 1 clicked", event, item),
      },
      {
        label: "Option 2",
        callback: (event, item) =>
          console.log("Save As > Option 2 clicked", event, item),
      },
    ],
  },
  {
    label: "Export",

    items: [
      {
        label: "File Type 1",
        items: [
          {
            label: "Option 1",
            callback: (event, item) =>
              console.log("Export > FT1 > O1 clicked", event, item),
          },
          {
            label: "Option 2",
            callback: (event, item) =>
              console.log("Export > FT1 > O2 clicked", event, item),
          },
        ],
      },
      {
        label: "File Type 2",
        callback: (event, item) =>
          console.log("Export > FT2 clicked", event, item),
      },
    ],
  },
];

const FormikSection = () => {
  const [formState, setFormState] = useState();
  return (
    <Paper padded>
      <Heading level={3}>Formik</Heading>
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          description: "",
        }}
        validationSchema={Yup.object({
          firstName: Yup.string()
            .min(15, "Must be 15 characters or more")
            .required("Required"),
        })}
        onSubmit={(values) => setFormState(values)}
      >
        <Form>
          <FormikInput label="First Name" name="firstName" />
          <FormikInput label="Last Name" name="lastName" />
          <FormikJsonInput label="Description" name="description" />
          <Button type="submit">Submit</Button>
        </Form>
      </Formik>
      <code>
        <pre>{JSON.stringify(formState)}</pre>
      </code>
    </Paper>
  );
};

const ToolbarSection = () => {
  return (
    <Paper padded>
      <Heading level={3} gutterBottom>
        Toolbar
      </Heading>

      <Toolbar>
        <Text>Label</Text>
        <Select value={10}>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>{" "}
        <Button>Primary</Button>
        <IconButton size="large">
          <ZoomInIcon />
        </IconButton>
      </Toolbar>
    </Paper>
  );
};

const HeadingSection = () => {
  return (
    <Paper padded>
      <Heading level={0}>Heading Level Zero</Heading>
      <Heading level={1}>Heading Level One</Heading>
      <Heading level={2}>Heading Level Two</Heading>
      <Heading level={3}>Heading Level Three</Heading>
      <Heading level={4}>Heading Level Four</Heading>
      <Heading level={5}>Heading Level Five</Heading>
      <Text level={0}>Text Level Zero</Text>
      <Text level={1}>Text Level One</Text>
      <Text level={2}>Text Level Two</Text>

      <div>Default &lt;div&gt;</div>
      <p>Default &lt;p&gt;</p>
      <div>
        Pill: <Pill label="Default" tooltip="tooltip" />{" "}
        <Pill color="red" label="Red" /> <Pill color="green" label="Green" />{" "}
        <Pill color="yellow" label="Yellow" />{" "}
        <Pill color="blue" label="Blue" />
      </div>
      <div>
        Outline Pill: <Pill label="Default" variant="outlined" />{" "}
        <Pill color="red" label="Red" variant="outlined" />{" "}
        <Pill color="green" label="Green" variant="outlined" />{" "}
        <Pill color="yellow" label="Yellow" variant="outlined" />{" "}
        <Pill color="blue" label="Blue" variant="outlined" />
      </div>
    </Paper>
  );
};

const TabsSection = () => {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Paper padded>
      <Heading level={3} gutterBottom>
        Tabs
      </Heading>
      <Heading level={2} gutterBottom>
        Page Level
      </Heading>
      <Heading level={1} gutterBottom>
        Full Width
      </Heading>
      <Paper variant="outlined" style={{ width: 800, marginBottom: 30 }}>
        <Tabs value={tabIndex} variant="fullWidth">
          <Tab label="Tab A" onClick={() => setTabIndex(0)} />
          <Tab label="Tab B" onClick={() => setTabIndex(1)} />
          <Tab label="Tab C" onClick={() => setTabIndex(2)} />
          <Tab label="Tab D" onClick={() => setTabIndex(3)} />
        </Tabs>
        <div style={{ padding: 15 }}>Tab content {tabIndex}</div>
      </Paper>

      <Heading level={1} gutterBottom>
        Fixed Width
      </Heading>
      <Paper variant="outlined" style={{ width: 800, marginBottom: 30 }}>
        <Tabs value={tabIndex}>
          <Tab label="Tab A" onClick={() => setTabIndex(0)} />
          <Tab label="Tab B" onClick={() => setTabIndex(1)} />
          <Tab label="Tab C" onClick={() => setTabIndex(2)} />
          <Tab label="Tab D" onClick={() => setTabIndex(3)} />
        </Tabs>
        <div style={{ padding: 15 }}>Tab content {tabIndex}</div>
      </Paper>

      <Heading level={2} gutterBottom>
        Contextual
      </Heading>

      <Heading level={1} gutterBottom>
        Full Width
      </Heading>
      <Paper variant="outlined" style={{ width: 500, marginBottom: 30 }}>
        <Tabs value={tabIndex} variant="fullWidth" contextual>
          <Tab label="Tab A" onClick={() => setTabIndex(0)} />
          <Tab label="Tab B" onClick={() => setTabIndex(1)} />
          <Tab label="Tab C" onClick={() => setTabIndex(2)} />
          <Tab label="Tab D" onClick={() => setTabIndex(3)} />
        </Tabs>
        <div style={{ padding: 15 }}>Tab content {tabIndex}</div>
      </Paper>
      <Heading level={1} gutterBottom>
        Fixed Width
      </Heading>

      <Paper variant="outlined" style={{ width: 800 }}>
        <Tabs value={tabIndex} contextual>
          <Tab label="Tab A" onClick={() => setTabIndex(0)} />
          <Tab label="Tab B" onClick={() => setTabIndex(1)} />
          <Tab label="Tab C" onClick={() => setTabIndex(2)} />
          <Tab label="Tab D" onClick={() => setTabIndex(3)} />
        </Tabs>
        <div style={{ padding: 15 }}>Tab content {tabIndex}</div>
      </Paper>
    </Paper>
  );
};

const Buttons = () => {
  const [formats, setFormats] = React.useState(() => ["bold", "italic"]);

  const handleFormat = (event, newFormats) => {
    setFormats(newFormats);
  };

  return (
    <Paper style={{ padding: 15 }}>
      <Heading level={3} gutterBottom>
        Button
      </Heading>

      <Grid container spacing={4}>
        <Grid item>
          <PrimaryButton>Primary</PrimaryButton>
        </Grid>
        <Grid item>
          <SecondaryButton>Secondary</SecondaryButton>
        </Grid>
        <Grid item>
          <TertiaryButton>Tertiary</TertiaryButton>
        </Grid>
        <Grid item>
          <ButtonGroup
            options={[{ label: "One" }, { label: "Two" }, { label: "Three" }]}
          />
        </Grid>
        <Grid item>
          <SplitButton
            options={[
              {
                label: "Create a merge commit",
                handler: () => alert("you clicked 1"),
              },
              {
                label: "Squash and merge",
                handler: () => alert("you clicked 2"),
              },
              {
                label: "Rebase and merge",
                handler: () => alert("you clicked 3"),
              },
            ]}
            onPrimaryClick={() => alert("main button")}
          >
            Split Button
          </SplitButton>
        </Grid>
        <Grid item>
          <ToggleButtonGroup
            value={formats}
            onChange={handleFormat}
            size="small"
          >
            <ToggleButton value="bold" aria-label="bold">
              <FormatBoldIcon />
            </ToggleButton>
            <ToggleButton value="italic" aria-label="italic">
              <FormatItalicIcon />
            </ToggleButton>
            <ToggleButton value="underlined" aria-label="underlined">
              <FormatUnderlinedIcon />
            </ToggleButton>
            <ToggleButton value="color" aria-label="color" disabled>
              <FormatColorFillIcon />
              <ArrowDropDownIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item>
          <DropdownButton
            options={[
              {
                label: "Create a merge commit",
                handler: () => alert("you clicked 1"),
              },
              {
                label: "Squash and merge",
                handler: () => alert("you clicked 2"),
              },
              {
                label: "Rebase and merge",
                handler: () => alert("you clicked 3"),
              },
            ]}
          >
            Dropdown Button
          </DropdownButton>
        </Grid>
        <Grid item>
          Small{" "}
          <IconButton size="small">
            <DeleteIcon fontSize="inherit" />
          </IconButton>
          Medium{" "}
          <IconButton size="medium">
            <DeleteIcon fontSize="inherit" />
          </IconButton>
          Large{" "}
          <IconButton size="large">
            <DeleteIcon fontSize="inherit" />
          </IconButton>
          <DropdownButton
            icon={<DeleteIcon />}
            options={[
              {
                label: "Create a merge commit",
                handler: () => alert("you clicked 1"),
              },
              {
                label: "Squash and merge",
                handler: () => alert("you clicked 2"),
              },
              {
                label: "Rebase and merge",
                handler: () => alert("you clicked 3"),
              },
            ]}
          />
        </Grid>
        <Grid item xs={12}>
          <ButtonGroup
            label="Button Group with Label"
            options={[{ label: "One" }, { label: "Two" }, { label: "Three" }]}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

const Toggles = () => {
  const [toggleChecked, setToggleChecked] = useState(false);

  return (
    <Paper style={{ padding: 15 }}>
      <Heading level={3} gutterBottom>
        Toggle
      </Heading>
      <Switch
        checked={toggleChecked}
        onChange={() => setToggleChecked(!toggleChecked)}
        color="primary"
      />
    </Paper>
  );
};

const Checkboxes = () => {
  const [toggleChecked, setToggleChecked] = useState(false);

  return (
    <Paper style={{ padding: 15 }}>
      <Heading level={3} gutterBottom>
        Checkbox
      </Heading>
      <Checkbox
        checked={toggleChecked}
        onChange={() => setToggleChecked(!toggleChecked)}
        color="primary"
      />
    </Paper>
  );
};

const Inputs = () => (
  <Paper style={{ padding: 15 }}>
    <Heading level={3} gutterBottom>
      Input
    </Heading>

    <Input
      label="Input Label via label attribute"
      style={{ marginBottom: 20 }}
    />

    <Input label="Disabled" disabled style={{ marginBottom: 20 }} />

    <Input label="Fullwidth" fullWidth style={{ marginBottom: 20 }} />

    <Input label="Clearable" clearable style={{ marginBottom: 20 }} />

    <FormControl style={{ display: "block", marginBottom: 20 }}>
      <InputLabel>Input Label via FormControl/InputLabel</InputLabel>
      <Input />
    </FormControl>

    <Input label="DateTime" type="datetime-local" />
  </Paper>
);

const Progress = () => {
  return (
    <Paper style={{ padding: 15 }}>
      <Heading level={3} gutterBottom>
        Progress
      </Heading>
      <LinearProgress />
      <div
        style={{
          height: 200,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    </Paper>
  );
};
