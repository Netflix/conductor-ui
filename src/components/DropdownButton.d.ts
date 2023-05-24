import { FC } from "react";

type DropdownOptions = {
  label: string;
  handler: (event: MouseEvent, index: number) => void;
};

interface DropdownProps {
  icon?: JSX.Element;
  size?: string;
  options: DropdownOptions[];
}
declare const Dropdown: FC<DropdownProp>;
export default Dropdown;
