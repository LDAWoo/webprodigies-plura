import BlurPage from "@/components/global/blur-page";
import React from "react";
import FunnelsDataTable from "./data-table";
import { Plus } from "lucide-react";
import { columns } from "./columns";
import { getFunnels } from "@/lib/queries";
import FunnelForm from "@/components/forms/funnel-form";

type Props = {
    params: {
        subaccountId: string;
    };
};

const Page = async ({ params }: Props) => {
    const funnels = await getFunnels(params.subaccountId);
    if (!funnels) return null;

    return (
        <BlurPage>
            <FunnelsDataTable
                actionButtonText={
                    <>
                        <Plus size={15} />
                        Create Funnel
                    </>
                }
                modalChildren={<FunnelForm subAccountId={params.subaccountId} />}
                filterValue="name"
                columns={columns}
                data={funnels}
            />
        </BlurPage>
    );
};

export default Page;
