import React, { ReactNode } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Link } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import Url from "url-parse";
import useAppContext from "../hooks/useAppContext";
// 1. Strip `navigate` from props to prevent error
// 2. Preserve stack param

type NavLinkProps = {
  path: string;
  newTab?: boolean;
  children?: ReactNode;
  className?: string;
};

export default React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  (props, ref) => {
    const { path, newTab, children, ...rest } = props;
    const { stack, defaultStack } = useAppContext();

    const url = new Url(path, {}, true);
    if (stack !== defaultStack) {
      url.query.stack = stack;
    }

    if (!newTab) {
      return (
        <Link ref={ref} component={RouterLink} to={url.toString()} {...rest}>
          {children}
        </Link>
      );
    } else {
      return (
        <Link
          ref={ref}
          target="_blank"
          href={url.toString()}
          className={rest.className}
        >
          {children}
          &nbsp;
          <LaunchIcon
            fontSize={"12px" as any}
            style={{ verticalAlign: "middle" }}
          />
        </Link>
      );
    }
  },
);

export function usePushHistory() {
  const navigate = useNavigate();
  const { stack, defaultStack } = useAppContext();

  return (path: string) => {
    const url = new Url(path, {}, true);
    if (stack !== defaultStack) {
      url.query.stack = stack;
    }

    navigate(url.toString());
  };
}
