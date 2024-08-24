"use client";
import { EditorBtns } from "@/lib/constant";
import { FunnelPage } from "@prisma/client";
import { createContext, Dispatch, useContext, useReducer } from "react";
import { EditorAction } from "./editor-actions";

export type DeviceTypes = "Desktop" | "Mobile" | "Tablet";

export type EditorElement = {
    id: string;
    styles: React.CSSProperties;
    name: string;
    type: EditorBtns;
    content: EditorElement[] | { href?: string; innerText?: string; src?: string };
};

export type Editor = {
    liveMode: boolean;
    elements: EditorElement[];
    selectedElement: EditorElement;
    device: DeviceTypes;
    previewMode: boolean;
    funnelPageId: string;
};

export type HistoryState = {
    history: Editor[];
    currentIndex: number;
};

export type EditorState = {
    editor: Editor;
    history: HistoryState;
};

const initialEditorState: EditorState["editor"] = {
    elements: [
        {
            content: [],
            id: "__body",
            name: "Body",
            styles: {},
            type: "__body",
        },
    ],
    selectedElement: {
        content: [],
        id: "__body",
        name: "Body",
        styles: {},
        type: "__body",
    },
    liveMode: false,
    device: "Desktop",
    previewMode: false,
    funnelPageId: "",
};

const initialHistoryState: EditorState["history"] = {
    history: [initialEditorState],
    currentIndex: 0,
};

const initialState: EditorState = {
    editor: initialEditorState,
    history: initialHistoryState,
};

// Add element editor
const addAnElement = (editorArray: EditorElement[], action: EditorAction): EditorElement[] => {
    if (action.type !== "ADD_ELEMENT") throw Error("You sent the wrong action type on the ADD_ELEMENT editor State");

    return editorArray.map((item) => {
        if (item.id === action.payload.containerId && Array.isArray(item.content)) {
            return {
                ...item,
                content: [...item.content, action.payload.elementDetails],
            };
        } else if (item.content && Array.isArray(item.content)) {
            return {
                ...item,
                content: addAnElement(item.content, action),
            };
        }

        return item;
    });
};

const updateAnElement = (editorArray: EditorElement[], action: EditorAction): EditorElement[] => {
    if (action.type !== "UPDATE_ELEMENT") throw Error("You sent the wrong action type on the UPDATE_ELEMENT editor State");

    return editorArray.map((item) => {
        if (item.id === action.payload.elementDetails.id) {
            return {
                ...item,
                ...action.payload.elementDetails,
            };
        } else if (item.content && Array.isArray(item.content)) {
            return {
                ...item,
                content: updateAnElement(item.content, action),
            };
        }
        return item;
    });
};

const deleteAnElement = (editorArray: EditorElement[], action: EditorAction) => {
    if (action.type !== "DELETE_ELEMENT") throw Error("You sent the wrong action type on the DELETE_ELEMENT editor State");

    return editorArray.filter((item) => {
        if (item.id === action.payload.elementDetails.id) {
            return false;
        } else if (item.content && Array.isArray(item.content)) {
            item.content = deleteAnElement(item.content, action);
        }
        return true;
    });
};

const handleClickedElement = (state: EditorState, action: EditorAction): EditorState => {
    if (action.type !== "CHANGE_CLICKED_ELEMENT") throw Error("You sent the wrong action type on the CHANGE_CLICKED_ELEMENT editor State");
    return {
        ...state,
        editor: {
            ...state.editor,
            selectedElement: action.payload.elementDetails || {
                id: "",
                name: "",
                styles: {},
                type: null,
                content: [],
            },
        },
        history: {
            ...state.history,
            history: [
                ...state.history.history.slice(0, state.history.currentIndex + 1),
                {
                    ...state.editor,
                },
            ],
            currentIndex: state.history.currentIndex + 1,
        },
    };
};

// Change device editor
const handleChangeDevice = (state: EditorState, action: EditorAction) => {
    if (action.type !== "CHANGE_DEVICE") throw Error("You sent the wrong action type on the CHANGE_DEVICE editor State");

    return {
        ...state,
        editor: {
            ...state.editor,
            device: action.payload.device,
        },
    };
};

const handleTogglePreviewMode = (state: EditorState, action: EditorAction): EditorState => {
    if (action.type !== "TOGGLE_PREVIEW_MODE") throw Error("You sent the wrong action type on the TOGGLE_PREVIEW_MODE editor State");

    return {
        ...state,
        editor: {
            ...state.editor,
            previewMode: !state.editor.previewMode,
        },
    };
};

const handleToggleLiveMode = (state: EditorState, action: EditorAction): EditorState => {
    if (action.type !== "TOGGLE_LIVE_MODE") throw Error("You sent the wrong action type on the TOGGLE_LIVE_MODE editor State");

    return {
        ...state,
        editor: {
            ...state.editor,
            liveMode: action.payload ? action.payload.value : !state.editor.liveMode,
        },
    };
};

const handleRedoState = (state: EditorState, action: EditorAction): EditorState => {
    if (action.type !== "REDO") throw Error("You sent the wrong action type on the REDO editor State");

    if (state.history.currentIndex < state.history.history.length - 1) {
        const nextIndex = state.history.currentIndex + 1;
        const nextEditorState = {
            ...state.history.history[nextIndex],
        };

        return {
            ...state,
            editor: nextEditorState,
            history: {
                ...state.history,
                currentIndex: nextIndex,
            },
        };
    }
    return state;
};

const handleUndoState = (state: EditorState, action: EditorAction): EditorState => {
    if (action.type !== "UNDO") throw Error("You sent the wrong action type on the UNDO editor State");

    if (state.history.currentIndex > 0) {
        const previousIndex = state.history.currentIndex - 1;
        const previousEditorState = {
            ...state.history.history[previousIndex],
        };

        return {
            ...state,
            editor: previousEditorState,
            history: {
                ...state.history,
                currentIndex: previousIndex,
            },
        };
    }
    return state;
};

const handleSetFunnelPageIdState = (state: EditorState, action: EditorAction): EditorState => {
    if (action.type !== "SET_FUNNEL_PAGE_ID") throw Error("You sent the wrong action type on the SET_FUNNEL_PAGE_ID editor State");

    const { funnelPageId } = action.payload;

    const updatedEditorStateWithFunnelPageId = {
        ...state.editor,
        funnelPageId,
    };

    const updateHistoryWithFunnelPageId = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        {
            ...updatedEditorStateWithFunnelPageId,
        },
    ];

    return {
        ...state,
        editor: updatedEditorStateWithFunnelPageId,
        history: {
            ...state.history,
            currentIndex: updateHistoryWithFunnelPageId.length - 1,
        },
    };
};

const handleLoadData = (initialState: EditorState, initialEditorState: EditorState["editor"], action: EditorAction): EditorState => {
    if (action.type !== "LOAD_DATA") throw Error("You sent the wrong action type on the LOAD_DATA editor State");

    return {
        ...initialState,
        editor: {
            ...initialState.editor,
            elements: action.payload.elements || initialEditorState.elements,
            liveMode: !!action.payload.withLive,
        },
    };
};

const editorReducer = (state: EditorState = initialState, action: EditorAction): EditorState => {
    switch (action.type) {
        case "ADD_ELEMENT":
            const updatedEditorState = {
                ...state.editor,
                elements: addAnElement(state.editor.elements, action),
            };

            const updatedHistory = [...state.history.history.slice(0, state.history.currentIndex + 1), { ...updatedEditorState }];

            const newEditorState = {
                ...state,
                editor: updatedEditorState,
                history: {
                    ...state.history,
                    history: updatedHistory,
                    currentIndex: updatedHistory.length - 1,
                },
            };
            return newEditorState;

        case "UPDATE_ELEMENT":
            const updateElements = updateAnElement(state.editor.elements, action);

            const updatedElementIsSelected = state.editor.selectedElement.id === action.payload.elementDetails.id;

            const updatedEditorStateWithUpdate = {
                ...state.editor,
                elements: updateElements,
                selectedElement: updatedElementIsSelected
                    ? action.payload.elementDetails
                    : {
                          id: "",
                          content: [],
                          name: "",
                          styles: {},
                          type: null,
                      },
            };

            const updatedHistoryWithUpdate = [
                ...state.history.history.slice(0, state.history.currentIndex + 1),
                {
                    ...updatedEditorStateWithUpdate,
                },
            ];

            const updateEditor = {
                ...state,
                editor: updatedEditorStateWithUpdate,
                history: {
                    ...state.history,
                    history: updatedHistoryWithUpdate,
                    currentIndex: updatedHistoryWithUpdate.length - 1,
                },
            };

            return updateEditor;
        case "DELETE_ELEMENT":
            const updatedElementsAfterDelete = deleteAnElement(state.editor.elements, action);

            const updatedEditorStateAfterDelete = {
                ...state.editor,
                elements: updatedElementsAfterDelete,
            };
            const updatedHistoryAfterDelete = [
                ...state.history.history.slice(0, state.history.currentIndex + 1),
                {
                    ...updatedEditorStateAfterDelete,
                },
            ];

            const deletedState = {
                ...state,
                editor: updatedEditorStateAfterDelete,
                history: {
                    ...state.history,
                    history: updatedHistoryAfterDelete,
                    currentIndex: updatedHistoryAfterDelete.length - 1,
                },
            };
            return deletedState;
        case "CHANGE_CLICKED_ELEMENT":
            const clickedState = handleClickedElement(state, action);
            return clickedState;
        case "CHANGE_DEVICE":
            const changedDeviceState = handleChangeDevice(state, action);
            return changedDeviceState;
        case "TOGGLE_PREVIEW_MODE":
            const togglePreviewMode = handleTogglePreviewMode(state, action);
            return togglePreviewMode;
        case "TOGGLE_LIVE_MODE":
            const toggleLiveMode = handleToggleLiveMode(state, action);
            return toggleLiveMode;
        case "REDO":
            const redoState = handleRedoState(state, action);
            return redoState;
        case "UNDO":
            const undoState = handleUndoState(state, action);
            return undoState;
        case "LOAD_DATA":
            const loadedDataState = handleLoadData(initialState, initialEditorState, action);
            return loadedDataState;
        case "SET_FUNNEL_PAGE_ID":
            const setFunnelPageIdState = handleSetFunnelPageIdState(state, action);
            return setFunnelPageIdState;
        default:
            return state;
    }
};

export type EditorContextData = {
    device: DeviceTypes;
    previewMode: boolean;
    setPreviewMode: (previewMode: boolean) => void;
    setDevice: (device: DeviceTypes) => void;
};

export const EditorContext = createContext<{
    state: EditorState;
    dispatch: Dispatch<EditorAction>;
    subaccountId: string;
    funnelId: string;
    pageDetails: FunnelPage | null;
}>({
    state: initialState,
    dispatch: () => undefined,
    subaccountId: "",
    funnelId: "",
    pageDetails: null,
});

type EditorProps = {
    children: React.ReactNode;
    subaccountId: string;
    funnelId: string;
    pageDetails: FunnelPage;
};

const EditorProvider = (props: EditorProps) => {
    const [state, dispatch] = useReducer(editorReducer, initialState);

    return (
        <EditorContext.Provider
            value={{
                state,
                dispatch,
                subaccountId: props.subaccountId,
                funnelId: props.funnelId,
                pageDetails: props.pageDetails,
            }}
        >
            {props.children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) throw new Error("useEditor Hook must be used within the Editor Provider");
    return context;
};

export default EditorProvider;
