import {
  AccountTree,
  AutoFixNormal,
  AutoFixHigh,
  Code,
  HourglassEmpty,
  MiscellaneousServices,
  Shortcut,
  Stop,
  Person,
  AttachMoney,
  PlayArrow,
  NotificationsActive,
  Loop,
  SvgIconComponent,
  AltRoute,
} from "@mui/icons-material";
import JqIcon from "./JqIcon";
import BaseHttpIcon from "./HttpIcon";

export const SimpleIcon = MiscellaneousServices;
export const HttpIcon = BaseHttpIcon as SvgIconComponent;
export const InlineIcon = Code;
export const JqTransformIcon = JqIcon as SvgIconComponent;
export const SwitchIcon = AltRoute;
export const ForkIcon = AccountTree;
export const DynamicForkIcon = AutoFixHigh;
export const TerminateIcon = Stop;
export const EventIcon = NotificationsActive;
export const HumanIcon = Person;
export const WaitIcon = HourglassEmpty;
export const SetVariableIcon = AttachMoney;
export const SubWorkflowIcon = Shortcut;
export const DynamicIcon = AutoFixNormal;
export const StartWorkflowIcon = PlayArrow;
export const DoWhileIcon = Loop;
