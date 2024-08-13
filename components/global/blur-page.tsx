import { ChildrenProps } from "@/@types";

const BlurPage = ({ children }: ChildrenProps) => {
    return (
        <div className="h-screen overflow-auto backdrop-blur-[32px] dark:bg-muted/40 bg-muted/60 dark:shadow-2xl dark:shadow-black  mx-auto pt-24 p-4 absolute top-0 right-0 left-0 bottom-0 z-[11]" id="blur-page">
            {children}
        </div>
    );
};

export default BlurPage;
