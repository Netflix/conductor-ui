import { useState } from "react";
import { FileCopy } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

const ClipboardButton = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Tooltip
      title={isCopied ? "Copied" : "Copy to clipboard"}
      placement="bottom"
    >
      <IconButton onClick={() => handleCopyToClipboard(textToCopy)}>
        <FileCopy style={{ fontSize: "16px" }} />
      </IconButton>
    </Tooltip>
  );
};

export default ClipboardButton;
