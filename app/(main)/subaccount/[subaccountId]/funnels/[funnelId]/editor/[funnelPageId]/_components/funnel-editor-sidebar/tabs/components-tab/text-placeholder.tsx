import { EditorBtns } from "@/lib/constant";
import { TypeIcon } from "lucide-react";
import React from "react";

const TextPlaceholder = () => {
    const handleDragState = (e: React.DragEvent, type: EditorBtns) => {
        if (type === null) return;
        e.dataTransfer.setData("type", type);
    };
    return (
        <div
            draggable
            onDragStart={(e) => {
                handleDragState(e, "text");
            }}
            className=" h-14 w-14 bg-muted rounded-lg flex items-center justify-center"
        >
            <TypeIcon size={40} className="text-muted-foreground" />
        </div>
    );
};

export default TextPlaceholder;
