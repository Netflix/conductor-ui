import React, { useState } from "react";
import { FileCopy } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

const ClipboardButton = ({ textToCopy }) => {
  const [timeoutId, setTimeoutId] = useState(null);

  const handleCopyToClipboard = () => {
    clearTimeout(timeoutId); // Clear the previous timeout
    navigator.clipboard.writeText(textToCopy);
    const newTimeoutId = setTimeout(() => {
      setTimeoutId(null); // Set timeoutId to null after 2 seconds
    }, 2000);
    setTimeoutId(newTimeoutId); // Store the new timeout ID
  };

  // Use !!timeoutId to infer the value of isCopied
  const isCopied = !!timeoutId;

  return (
    <Tooltip
      title={isCopied ? "Copied" : "Copy to clipboard"}
      placement="bottom"
    >
      <IconButton onClick={handleCopyToClipboard}>
        <FileCopy style={{ fontSize: "16px" }} />
      </IconButton>
    </Tooltip>
  );
};

export default ClipboardButton;
