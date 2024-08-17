import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { getLanesWithTicketAndTags, getPipelineDetails, updateLanesOrder, updateTicketsOrder } from "@/lib/queries";
import { LaneDetails } from "@/lib/types";
import { redirect } from "next/navigation";
import React from "react";
import PipelineInfoBar from "../_components/pipeline-infobar";
import PipelineView from "../_components/pipeline-view";

type Props = {
    params: { subaccountId: string; pipelineId: string };
};

const Page = async ({ params }: Props) => {
    const pipelineDetails = await getPipelineDetails(params.pipelineId);

    if (!pipelineDetails) {
        return redirect(`/subaccount/${params.subaccountId}/pipelines`);
    }

    const pipelines = await db.pipeline.findMany({
        where: {
            subAccountId: params.subaccountId,
        },
    });

    const lanes = (await getLanesWithTicketAndTags(params.pipelineId)) as LaneDetails[];

    return (
        <Tabs defaultValue="view" className="w-full h-full relative">
            <TabsList className="bg-transparent border-b-[2px] h-16 w-full justify-between mb-4">
                <PipelineInfoBar pipelineId={params.pipelineId} subAccountId={params.subaccountId} pipelines={pipelines} />
                <div>
                    <TabsTrigger value="view">Pipeline View</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </div>
            </TabsList>
            <TabsContent value="view">
                <PipelineView lanes={lanes} pipelineDetails={pipelineDetails} pipelineId={params.pipelineId} subaccountId={params.subaccountId} updateLanesOrder={updateLanesOrder} updateTicketsOrder={updateTicketsOrder} />
            </TabsContent>
            <TabsContent value="settings"></TabsContent>
        </Tabs>
    );
};

export default Page;
