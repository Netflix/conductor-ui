import { Paper } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import { FormikInput, FormikJsonInput } from "../../components";
import { Form, Formik } from "formik";
import * as Yup from "yup";

const JsonForm = ({ initialState, onApply }) => {
  const [formData, setFormData] = useState(initialState);
  const [showAddInputFields, setShowAddInputFields] = useState(false);
  const [newInputParamKey, setNewInputParamKey] = useState("");
  const [newInputParamValue, setNewInputParamValue] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInputParamChange = (event, key) => {
    const { value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      inputParameters: {
        ...prevData.inputParameters,
        [key]: value,
      },
    }));
  };

  const handleAddInputParam = () => {
    setShowAddInputFields(true);
  };

  const handleConfirmAddInputParam = () => {
    if (newInputParamKey && newInputParamValue) {
      setFormData((prevData) => ({
        ...prevData,
        inputParameters: {
          ...prevData.inputParameters,
          [newInputParamKey]: newInputParamValue,
        },
      }));
      setNewInputParamKey("");
      setNewInputParamValue("");
      setShowAddInputFields(false);
    }
  };

  const handleDeleteInputParam = (paramKey) => {
    const updatedInputParams = { ...formData.inputParameters };
    delete updatedInputParams[paramKey];
    setFormData((prevData) => ({
      ...prevData,
      inputParameters: updatedInputParams,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onApply(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {Object.keys(formData).map(
        (key) =>
          key !== "inputParameters" && ( // Exclude inputParameters from the initial row
            <TextField
              key={key}
              name={key}
              label={key}
              value={formData[key]}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              fullWidth
            />
          ),
      )}
      <h2>Input Parameters:</h2>
      {Object.keys(formData.inputParameters).map((paramKey) => (
        <div key={paramKey}>
          <TextField
            label={`inputParameters.${paramKey}`}
            value={formData.inputParameters[paramKey]}
            onChange={(e) => handleInputParamChange(e, paramKey)}
            margin="normal"
            variant="outlined"
            fullWidth
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleDeleteInputParam(paramKey)}
          >
            Delete
          </Button>
        </div>
      ))}
      {showAddInputFields && (
        <div>
          <TextField
            label="New Parameter Key"
            value={newInputParamKey}
            onChange={(e) => setNewInputParamKey(e.target.value)}
            margin="normal"
            variant="outlined"
            fullWidth
          />
          <TextField
            label="New Parameter Value"
            value={newInputParamValue}
            onChange={(e) => setNewInputParamValue(e.target.value)}
            margin="normal"
            variant="outlined"
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmAddInputParam}
          >
            Confirm Add Input Parameter
          </Button>
        </div>
      )}
      {!showAddInputFields && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddInputParam}
        >
          Add Input Parameter
        </Button>
      )}
      <Button type="submit" variant="contained" color="primary">
        Apply
      </Button>
    </form>
  );
};

export default JsonForm;
