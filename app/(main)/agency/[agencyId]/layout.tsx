import { ChildrenProps } from "@/@types";
import BlurPage from "@/components/global/blur-page";
import Sidebar from "@/components/sidebar";
import Unauthorized from "@/components/unauthorized";
import { getNotificationAnUser, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type Props = {
    params: {
        agencyId: string;
    };
} & ChildrenProps;

const Layout = async ({ children, params }: Props) => {
    const agencyId = await verifyAndAcceptInvitation();
    const user = await currentUser();

    if (!user) {
        return redirect("/");
    }

    if (!agencyId) {
        return redirect(`/agency`);
    }

    if (user.privateMetadata.role !== "AGENCY_OWNER" && user.privateMetadata.role !== "AGENCY_ADMIN") return <Unauthorized />;

    let allNoti: any[];

    const notifications = await getNotificationAnUser(agencyId);
    if (notifications) allNoti = notifications;

    return (
        <div className="h-screen overflow-hidden">
            <Sidebar id={params.agencyId} type="agency" />
            <div className="md:pl-[300px]">
                <div className="relative">
                    <BlurPage>{children}</BlurPage>
                </div>
            </div>
        </div>
    );
};

export default Layout;
