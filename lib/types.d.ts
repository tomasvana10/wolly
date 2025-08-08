import { JSX } from "preact/src/index.d.ts";

type HeadlessElementProps<T extends HTMLElement> = {
  className: string;
  props: JSX.HTMLAttributes<T>;
};
