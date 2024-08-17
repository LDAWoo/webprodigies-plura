import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
    searchParams: {
        state: string;
        code: string;
    };
};

const Page = async ({ searchParams }: Props) => {
    const agencyId = await verifyAndAcceptInvitation();

    if (!agencyId) {
        return <Unauthorized />;
    }

    const user = await getAuthUserDetails();
    if (!user) {
        return;
    }

    const getFirstSubAccountWithAccess = user.Permissions.find((p) => p.access === true);

    if (searchParams.state) {
        const statePath = searchParams.state.split("__")[0];
        const stateSubAccountId = searchParams.state.split("__")[1];
        if (!stateSubAccountId) return <Unauthorized />;

        return redirect(`/subaccount/${stateSubAccountId}/${statePath}?code=${searchParams.code}`);
    }

    if (getFirstSubAccountWithAccess) {
        return redirect(`/subaccount/${getFirstSubAccountWithAccess.subAccountId}`);
    }
    return <Unauthorized />;
};

export default Page;
