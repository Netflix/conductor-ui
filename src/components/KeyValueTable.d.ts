import { FC } from "react";
export type KeyValueTableEntry = {
  label: string;
  value: any;
  type?: string;
};
declare const KeyValueTable: FC<{
  data: KeyValueTableEntry[];
  loading: boolean;
}>;
export default KeyValueTable;
