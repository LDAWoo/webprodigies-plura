import { ChildrenProps } from "@/@types";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React from "react";

const Layout = ({ children }: ChildrenProps) => {
    return <ClerkProvider appearance={{ baseTheme: dark }}>{children}</ClerkProvider>;
};

export default Layout;
