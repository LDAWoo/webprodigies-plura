import { EditorBtns } from "@/lib/constant";
import { Link2Icon } from "lucide-react";
import React from "react";

const LinkPlaceholder = () => {
    const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
        if (type === null) return;
        e.dataTransfer.setData("type", type);
    };
    return (
        <div draggable onDragStart={(e) => handleDragStart(e, "link")} className=" h-14 w-14 bg-muted rounded-lg flex items-center justify-center">
            <Link2Icon size={40} className="text-muted-foreground" />
        </div>
    );
};

export default LinkPlaceholder;
