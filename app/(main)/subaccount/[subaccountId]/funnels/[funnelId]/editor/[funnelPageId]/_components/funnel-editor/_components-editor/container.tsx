import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import { Badge, Trash } from "lucide-react";
import React from "react";
import Recursive from "./recursive";
import { defaultStyles, EditorBtns } from "@/lib/constant";
import { v4 } from "uuid";

type Props = { element: EditorElement };

const Container = ({ element }: Props) => {
    const { id, name, type, styles, content } = element;
    const { dispatch, state } = useEditor();

    const handleOnDrop = (e: React.DragEvent, type: string) => {
        e.stopPropagation();

        const componentType = e.dataTransfer.getData("type") as EditorBtns;

        switch (componentType) {
            case "text":
                dispatch({
                    type: "ADD_ELEMENT",
                    payload: {
                        containerId: id,
                        elementDetails: {
                            id: v4(),
                            name: "Text",
                            content: {
                                innerText: "Text Element",
                            },
                            styles: {
                                ...defaultStyles,
                            },
                            type: "text",
                        },
                    },
                });
                break;
            case "container":
                dispatch({
                    type: "ADD_ELEMENT",
                    payload: {
                        containerId: id,
                        elementDetails: {
                            id: v4(),
                            name: "Container",
                            content: [],
                            styles: {
                                ...defaultStyles,
                            },
                            type: "container",
                        },
                    },
                });
                break;
            case "contactForm":
                dispatch({
                    type: "ADD_ELEMENT",
                    payload: {
                        containerId: id,
                        elementDetails: {
                            id: v4(),
                            name: "Contact Form",
                            content: [],
                            styles: {},
                            type: "contactForm",
                        },
                    },
                });
                break;
            case "paymentForm":
                dispatch({
                    type: "ADD_ELEMENT",
                    payload: {
                        containerId: id,
                        elementDetails: {
                            content: [],
                            id: v4(),
                            name: "Contact Form",
                            styles: {},
                            type: "paymentForm",
                        },
                    },
                });
                break;
            case "video":
                dispatch({
                    type: "ADD_ELEMENT",
                    payload: {
                        containerId: id,
                        elementDetails: {
                            id: v4(),
                            name: "Video",
                            content: {
                                src: "https://www.youtube.com/embed/A3l6YYkXzzg?si=zbcCeWcpq7Cwf8W1",
                            },
                            styles: {},
                            type: "video",
                        },
                    },
                });
                break;
            case "link":
                dispatch({
                    type: "ADD_ELEMENT",
                    payload: {
                        containerId: id,
                        elementDetails: {
                            id: v4(),
                            name: "Link",
                            content: {
                                href: "#",
                                innerText: "Link Element",
                            },
                            styles: {
                                ...defaultStyles,
                            },
                            type: "link",
                        },
                    },
                });
                break;

            case "2Col":
                dispatch({
                    type: "ADD_ELEMENT",
                    payload: {
                        containerId: id,
                        elementDetails: {
                            content: [
                                {
                                    content: [],
                                    id: v4(),
                                    name: "Container",
                                    styles: {
                                        width: "1-0%",
                                        ...defaultStyles,
                                    },
                                    type: "container",
                                },
                                {
                                    content: [],
                                    id: v4(),
                                    name: "Container",
                                    styles: {
                                        width: "1-0%",
                                        ...defaultStyles,
                                    },
                                    type: "container",
                                },
                            ],
                            id: v4(),
                            name: "Two Columns",
                            styles: {
                                display: "flex",
                                ...defaultStyles,
                            },
                            type: "2Col",
                        },
                    },
                });
                break;
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDragStart = (e: React.DragEvent, type: string) => {
        if (type === "__body") return;
        e.dataTransfer.setData("type", type);
    };

    const handleOnClickBody = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({
            type: "CHANGE_CLICKED_ELEMENT",
            payload: {
                elementDetails: element,
            },
        });
    };

    const handleDeleteElement = () => {
        dispatch({
            type: "DELETE_ELEMENT",
            payload: {
                elementDetails: element,
            },
        });
    };

    return (
        <div
            style={styles}
            className={clsx("relative p-6 transition-all group", {
                "max-w-full w-full": type === "container" || type === "2Col",
                "h-fit": type === "container",
                "h-full": type === "__body",
                "overflow-y-auto ": type === "__body",
                "flex flex-col md:!flex-row": type === "2Col",
                "!border-blue-500": state.editor.selectedElement.id === id && !state.editor.liveMode && state.editor.selectedElement.type !== "__body",
                "!border-yellow-400 !border-4": state.editor.selectedElement.id === id && !state.editor.liveMode && state.editor.selectedElement.type === "__body",
                "!border-solid": state.editor.selectedElement.id === id && !state.editor.liveMode,
                "border-dashed border-[1px] border-slate-300": !state.editor.liveMode,
            })}
            onDrop={(e) => handleOnDrop(e, id)}
            onDragOver={handleDragOver}
            draggable={type !== "__body"}
            onClick={handleOnClickBody}
            onDragStart={(e) => handleDragStart(e, "container")}
        >
            <Badge
                className={clsx("absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg hidden", {
                    block: state.editor.selectedElement.id === element.id && !state.editor.liveMode,
                })}
            >
                {element.name}
            </Badge>

            {Array.isArray(content) && content.map((childElement) => <Recursive key={childElement.id} element={childElement} />)}

            {state.editor.selectedElement.id === element.id && !state.editor.liveMode && state.editor.selectedElement.type !== "__body" && (
                <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold -top-[25px] -right-[1px] rounded-none rounded-t-lg ">
                    <Trash size={16} onClick={handleDeleteElement} />
                </div>
            )}
        </div>
    );
};

export default Container;
