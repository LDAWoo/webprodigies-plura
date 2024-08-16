"use client";
import { deleteSubAccount, getSubAccountDetails, saveActivityLogsNotification } from "@/lib/queries";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
    subaccountId: string;
};

const DeleteButton = ({ subaccountId }: Props) => {
    const router = useRouter();

    return (
        <div
            onClick={async () => {
                const response = await getSubAccountDetails(subaccountId);

                await saveActivityLogsNotification({
                    agencyId: undefined,
                    description: `Delete a subaccount | ${response?.name}`,
                    subAccountId: subaccountId,
                });

                await deleteSubAccount(subaccountId);
                router.refresh();
            }}
        >
            Delete Sub Account
        </div>
    );
};

export default DeleteButton;
