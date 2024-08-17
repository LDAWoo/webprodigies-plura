import { ChildrenProps } from "@/@types";
import InfoBar from "@/components/global/infobar";
import Sidebar from "@/components/sidebar";
import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, getNotificationAndUser, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
    params: {
        subaccountId: string;
    };
} & ChildrenProps;

const Layout = async ({ children, params }: Props) => {
    const agencyId = await verifyAndAcceptInvitation();
    if (!agencyId) return <Unauthorized />;

    const user = await currentUser();
    if (!user) redirect("/");

    let notifications: any = [];

    if (!user.privateMetadata.role) {
        return <Unauthorized />;
    } else {
        const allPermissions = await getAuthUserDetails();
        const hasPermission = allPermissions?.Permissions.find((p) => p.access && p.subAccountId === params.subaccountId);

        if (!hasPermission) {
            return <Unauthorized />;
        }
        const allNotifications = await getNotificationAndUser(agencyId);

        if (user.privateMetadata.role === "AGENCY_ADMIN" || user.privateMetadata.role === "AGENCY_OWNER") {
            notifications = allNotifications;
        } else {
            const filteredNoti = allNotifications?.filter((item) => item.subAccountId === params.subaccountId);

            if (filteredNoti) notifications = filteredNoti;
        }
    }

    return (
        <div className="h-screen overflow-hidden">
            <Sidebar id={params.subaccountId} type="subaccount" />
            <div className="md:pl-[300px]">
                <InfoBar notifications={notifications} role={user.privateMetadata.role as string} subAccountId={params.subaccountId as string} />
                <div className="relative">{children}</div>
            </div>
        </div>
    );
};

export default Layout;
