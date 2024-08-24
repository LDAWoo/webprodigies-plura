"use client";
import Loading from "@/components/global/loading";
import { toast } from "@/components/ui/use-toast";
import { EditorBtns } from "@/lib/constant";
import { getFunnel, getSubAccountDetails } from "@/lib/queries";
import { getStripe } from "@/lib/stripe/stripe-client";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import clsx from "clsx";
import { Badge, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

type Props = {
    element: EditorElement;
};

const Checkout = ({ element }: Props) => {
    const { state, dispatch, subaccountId, funnelId } = useEditor();
    const { styles, id } = element;
    const router = useRouter();
    const [clientSecret, setClientSecret] = useState("");
    const [livePrices, setLivePrices] = useState([]);
    const [subAccountConnectAccId, setSubAccountConnectAccId] = useState("");
    const options = useMemo(() => ({ clientSecret }), [clientSecret]);

    useEffect(() => {
        if (!subaccountId) return;
        const fetchData = async () => {
            const subaccountDetails = await getSubAccountDetails(subaccountId);
            if (subaccountDetails) {
                if (!subaccountDetails.connectAccountId) return;
                setSubAccountConnectAccId(subaccountDetails.connectAccountId);
            }
        };
        fetchData();
    }, [subaccountId]);

    useEffect(() => {
        if (funnelId) {
            const fetchData = async () => {
                const funnelData = await getFunnel(funnelId);
                setLivePrices(JSON.parse(funnelData?.liveProducts || "[]"));
            };
            fetchData();
        }
    }, [funnelId]);

    useEffect(() => {
        if (livePrices.length && subaccountId && subAccountConnectAccId) {
            const getClientSecret = async () => {
                try {
                    const body = JSON.stringify({
                        subAccountConnectAccId,
                        prices: livePrices,
                        subaccountId,
                    });
                    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/stripe/create-checkout-session`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body,
                    });
                    const responseJson = await response.json();

                    if (!responseJson) throw new Error("somethign went wrong");
                    if (responseJson.error) {
                        throw new Error(responseJson.error);
                    }
                    if (responseJson.clientSecret) {
                        setClientSecret(responseJson.clientSecret);
                    }
                } catch (error) {
                    toast({
                        open: true,
                        className: "z-[100000]",
                        variant: "destructive",
                        title: "Oppse!",
                        //@ts-ignore
                        description: error.message,
                    });
                }
            };
            getClientSecret();
        }
    }, [livePrices, subaccountId, subAccountConnectAccId]);

    const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
        if (type === null) return;
        e.dataTransfer.setData("type", type);
    };

    const handleOnClickBody = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: element } });
    };

    const handleDeleteElement = () => {
        dispatch({ type: "DELETE_ELEMENT", payload: { elementDetails: element } });
    };

    return (
        <div
            style={styles}
            draggable
            onDragStart={(e) => handleDragStart(e, "paymentForm")}
            onClick={handleOnClickBody}
            className={clsx("p-[2px] w-full relative text-[16px] transition-all flex items-center justify-center", {
                "!border-blue-500": state.editor.selectedElement.id === id,
                "!border-solid": state.editor.selectedElement.id === id,
                "border-dashed border-[1px] border-slate-300": !state.editor.liveMode,
            })}
        >
            {state.editor.selectedElement.id === id && !state.editor.liveMode && <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg ">{state.editor.selectedElement.name}</Badge>}

            <div className="border-none transition-all w-full">
                <div className="flex flex-col gap-4 w-full">
                    {options.clientSecret && subAccountConnectAccId && (
                        <div className="text-white">
                            <EmbeddedCheckoutProvider stripe={getStripe(subAccountConnectAccId)} options={options}>
                                <EmbeddedCheckout />
                            </EmbeddedCheckoutProvider>
                        </div>
                    )}

                    {!options.clientSecret && (
                        <div className="flex items-center justify-center w-full h-40">
                            <Loading />
                        </div>
                    )}
                </div>
            </div>

            {state.editor.selectedElement.id === id && !state.editor.liveMode && (
                <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold  -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
                    <Trash className="cursor-pointer" size={16} onClick={handleDeleteElement} />
                </div>
            )}
        </div>
    );
};

export default Checkout;
