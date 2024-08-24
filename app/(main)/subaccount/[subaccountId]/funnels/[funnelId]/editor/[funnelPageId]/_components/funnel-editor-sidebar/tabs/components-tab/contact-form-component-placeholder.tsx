import { EditorBtns } from "@/lib/constant";
import { Contact2Icon } from "lucide-react";
import React from "react";

const ContactFormComponentPlaceholder = () => {
    const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
        if (type === null) return;
        e.dataTransfer.setData("type", type);
    };
    return (
        <div draggable onDragStart={(e) => handleDragStart(e, "contactForm")} className=" h-14 w-14 bg-muted rounded-lg flex items-center justify-center">
            <Contact2Icon size={40} className="text-muted-foreground" />
        </div>
    );
};

export default ContactFormComponentPlaceholder;
