import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
    params: {
        subaccountId: string;
    };
};

const Page = async ({ params }: Props) => {
    const pipelineExits = await db.pipeline.findFirst({
        where: {
            subAccountId: params.subaccountId,
        },
    });

    if (pipelineExits) {
        return redirect(`/subaccount/${params.subaccountId}/pipelines/${pipelineExits.id}`);
    }

    try {
        const response = await db.pipeline.create({
            data: {
                name: `First Pipeline`,
                subAccountId: params.subaccountId,
            },
        });

        return redirect(`/subaccount/${params.subaccountId}/pipelines/${response.id}`);
    } catch (err) {
        console.error(err);
    }
};

export default Page;
