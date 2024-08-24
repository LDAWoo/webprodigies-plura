"use client";
import ContactForm from "@/components/forms/contact-form";
import { toast } from "@/components/ui/use-toast";
import { getFunnel, saveActivityLogsNotification, upsertContact } from "@/lib/queries";
import { ContactUserFormSchema } from "@/lib/types";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import { Badge, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { z } from "zod";

type Props = {
    element: EditorElement;
};
const ContactFormComponent = ({ element }: Props) => {
    const { state, dispatch, subaccountId, funnelId, pageDetails } = useEditor();
    const { id, styles, content } = element;
    const router = useRouter();

    const handleDragStart = (e: React.DragEvent, type: string) => {
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

    const goToNextPage = async () => {
        // TODO: Implement logic to navigate to the next page
        if (!state.editor.liveMode) return;
        const funnelPages = await getFunnel(funnelId);
        if (!funnelPages || !pageDetails) return;
        if (funnelPages.FunnelPages.length > pageDetails.order + 1) {
            const nextPage = funnelPages.FunnelPages.find((page) => page.order == pageDetails.order + 1);

            if (!nextPage) return;
            router.replace(`${process.env.NEXT_PUBLIC_SCHEME}${funnelPages.subDomainName}.${process.env.NEXT_PUBLIC_DOMAIN}/${nextPage.pathName}`);
        }
    };

    const onFormSubmit = async (values: z.infer<typeof ContactUserFormSchema>) => {
        if (!state.editor.liveMode) return;

        try {
            const response = await upsertContact({
                ...values,
                subAccountId: subaccountId,
            });
            //WIP Call trigger endpoint
            await saveActivityLogsNotification({
                agencyId: undefined,
                description: `A New contact signed up | ${response?.name}`,
                subAccountId: subaccountId,
            });
            toast({
                title: "Success",
                description: "Successfully Saved your info",
            });
            await goToNextPage();
        } catch (e) {
            toast({
                variant: "destructive",
                title: "Failed",
                description: "Could not save your information",
            });
        }
    };

    return (
        <div
            style={styles}
            draggable
            onDragStart={(e) => handleDragStart(e, "contactForm")}
            onClick={handleOnClickBody}
            className={clsx("p-[2px] w-full relative text-[16px] transition-all flex items-center justify-center", {
                "!border-blue-500": state.editor.selectedElement.id === id,
                "!border-solid": state.editor.selectedElement.id === id,
                "border-dashed border-[1px] border-slate-300": !state.editor.liveMode,
            })}
        >
            {state.editor.selectedElement.id === id && !state.editor.liveMode && <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg ">{state.editor.selectedElement.name}</Badge>}
            <ContactForm subTitle="Contact Us" title="Want a free quote? We can help you" apiCall={onFormSubmit} />
            {state.editor.selectedElement.id === id && !state.editor.liveMode && (
                <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold  -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
                    <Trash className="cursor-pointer" size={16} onClick={handleDeleteElement} />
                </div>
            )}
        </div>
    );
};

export default ContactFormComponent;
