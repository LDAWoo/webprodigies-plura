"use client";
import CreatePipelineForm from "@/components/forms/create-pipeline-form";
import { Pipeline } from "@prisma/client";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { deletePipeline } from "@/lib/queries";
type Props = {
    pipelineId: string;
    subaccountId: string;
    pipelines: Pipeline[];
};

const PipelineSettings = ({ pipelineId, subaccountId, pipelines }: Props) => {
    const router = useRouter();
    const { toast } = useToast();
    return (
        <AlertDialog>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <AlertDialogTrigger asChild>
                        <Button variant={"destructive"}>Delete Pipeline</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="items-center">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={async () => {
                                    try {
                                        await deletePipeline(pipelineId);
                                        //Challenge: Activity log
                                        toast({
                                            title: "Deleted",
                                            description: "Pipeline is deleted",
                                        });
                                        router.replace(`/subaccount/${subaccountId}/pipelines`);
                                    } catch (error) {
                                        toast({
                                            variant: "destructive",
                                            title: "Oppse!",
                                            description: "Could Delete Pipeline",
                                        });
                                    }
                                }}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </div>

                <CreatePipelineForm subAccountId={subaccountId} defaultData={pipelines.find((p) => p.id === pipelineId)} />
            </div>
        </AlertDialog>
    );
};

export default PipelineSettings;
