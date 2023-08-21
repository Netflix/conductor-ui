import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Text, Button } from "../../components";

type ResetConfirmationDialogProps = {
  onClose: () => void;
  onConfirm: (version: number | undefined) => void;
  version: number | undefined | false;
};

export default function ResetConfirmationDialog({
  onClose,
  onConfirm,
  version,
}: ResetConfirmationDialogProps) {
  return (
    <Dialog fullWidth maxWidth="sm" open={version !== false} onClose={onClose}>
      <DialogTitle>Confirmation</DialogTitle>
      <DialogContent>
        <Text>
          You will lose all changes made in the editor. Are you sure to proceed?
        </Text>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onConfirm(version as number | undefined)}>
          Confirm
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
