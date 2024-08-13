import { ReactNode } from "react";

export type ChildrenProps<T = undefined> = T extends undefined
    ? {
          children?: ReactNode;
      }
    : T & { children: ReactNode };
