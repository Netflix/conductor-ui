import { createElement } from "react";

const withProps = (WrappedComponent, additionalProps: any = {}) => {
  return (props) => {
    return createElement(WrappedComponent, {
      ...props,
      ...additionalProps,
    });
  };
};

export default withProps;
