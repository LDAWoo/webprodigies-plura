"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import type { User as AuthUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { Agency, Plan, SubAccount, User } from "@prisma/client";
import { v4 } from "uuid";

export const getUser = async (id: string) => {
    const user = await db.user.findUnique({
        where: {
            id,
        },
    });

    return user;
};

export const deleteUser = async (userId: string) => {
    await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
            role: undefined,
        },
    });
    const deletedUser = await db.user.delete({ where: { id: userId } });
    return deletedUser;
};

export const getAuthUserDetails = async () => {
    const user = await currentUser();

    if (!user) {
        return;
    }

    const userData = await db.user.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
        },
        include: {
            Agency: {
                include: {
                    SidebarOption: true,
                    SubAccount: {
                        include: {
                            SidebarOption: true,
                        },
                    },
                },
            },
            Permissions: true,
        },
    });

    return userData;
};

export const saveActivityLogsNotification = async ({ agencyId, description, subAccountId }: { agencyId?: String; description?: String; subAccountId?: String }) => {
    const authUser = await currentUser();
    let userData;
    if (!authUser) {
        const response = await db.user.findFirst({
            where: {
                Agency: {
                    SubAccount: {
                        some: { id: subAccountId },
                    },
                },
            },
        });
        if (response) {
            userData = response;
        }
    } else {
        userData = await db.user.findUnique({
            where: { email: authUser?.emailAddresses[0].emailAddress },
        });
    }

    if (!userData) {
        console.log("Could not find a user");
        return;
    }

    let foundAgencyId = agencyId;
    if (!foundAgencyId) {
        if (!subAccountId) {
            throw new Error("You need to provide at least an agency Id or subAccount id");
        }

        const response = await db.subAccount.findUnique({
            where: {
                id: subAccountId,
            },
        });

        if (response) foundAgencyId = response.agencyId;
    }

    if (subAccountId) {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Agency: {
                    connect: {
                        id: foundAgencyId,
                    },
                },
                SubAccount: {
                    connect: {
                        id: subAccountId,
                    },
                },
            },
        });
    } else {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Agency: {
                    connect: {
                        id: foundAgencyId,
                    },
                },
            },
        });
    }
};

export const updateUser = async (user: Partial<User>) => {
    const response = await db.user.update({
        where: {
            email: user.email,
        },
        data: {
            ...user,
        },
    });
    await clerkClient.users.updateUserMetadata(response.id, {
        publicMetadata: {
            role: user.role || "SUBACCOUNT_USER",
        },
    });

    return response;
};

export const changeUserPermission = async (permissionId: string, userEmail: string, subAccountId: string, permission: boolean) => {
    try {
        const response = await db.permissions.upsert({
            where: {
                id: permissionId,
            },
            update: {
                access: permission,
            },
            create: {
                access: permission,
                email: userEmail,
                subAccountId: subAccountId,
            },
        });
        return response;
    } catch (err) {
        console.log(err);
    }
};

export const createTeamUser = async (agencyId: String, user: User) => {
    if (user.role === "AGENCY_OWNER") return null;
    const response = await db.user.create({
        data: { ...user },
    });

    return response;
};

export const verifyAndAcceptInvitation = async () => {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }
    const invitationExists = await db.invitation.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
            status: "PENDING",
        },
    });

    if (invitationExists) {
        const userDetails = await createTeamUser(invitationExists.agencyId, {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: invitationExists.email,
            avatarUrl: user.imageUrl,
            agencyId: invitationExists.agencyId,
            role: invitationExists.role,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await saveActivityLogsNotification({
            agencyId: invitationExists?.agencyId,
            description: "Joined",
            subAccountId: undefined,
        });

        if (userDetails) {
            await clerkClient.users.updateUserMetadata(user.id, {
                privateMetadata: {
                    role: userDetails.role || "SUBACCOUNT_USER",
                },
            });

            await db.invitation.delete({
                where: {
                    email: userDetails.email,
                },
            });

            return userDetails.agencyId;
        } else {
            return null;
        }
    } else {
        const agency = await db.user.findUnique({
            where: {
                email: user.emailAddresses[0].emailAddress,
            },
        });

        return agency ? agency.agencyId : null;
    }
};

export const updateAgencyDetails = async (agencyId: string, agencyDetails: Partial<Agency>) => {
    const response = await db.agency.update({
        where: { id: agencyId },
        data: { ...agencyDetails },
    });
    return response;
};

export const getAgencyDetails = async (agencyId: string) => {
    const response = await db.agency.findUnique({
        where: { id: agencyId },
        include: {
            SubAccount: true,
        },
    });
    return response;
};

export const deleteAgency = async (agencyId: string) => {
    const response = await db.agency.delete({
        where: {
            id: agencyId,
        },
    });
    return response;
};

export const initUser = async (newUser: Partial<User>) => {
    const user = await currentUser();
    if (!user) return;

    const userData = await db.user.upsert({
        where: {
            email: user.emailAddresses[0].emailAddress,
        },
        update: newUser,
        create: {
            id: user.id,
            avatarUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            role: newUser.role || "SUBACCOUNT_USER",
        },
    });

    await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
            role: newUser.role || "SUBACCOUNT_USER",
        },
    });

    return userData;
};

export const upsertAgency = async (agency: Agency, price?: Plan) => {
    if (!agency.companyEmail) return null;

    try {
        const agencyDetails = await db.agency.upsert({
            where: {
                id: agency.id,
            },
            update: agency,
            create: {
                users: {
                    connect: {
                        email: agency.companyEmail,
                    },
                },
                ...agency,
                SidebarOption: {
                    create: [
                        {
                            name: "Dashboard",
                            icon: "category",
                            link: `/agency/${agency.id}`,
                        },
                        {
                            name: "Launchpad",
                            icon: "clipboardIcon",
                            link: `/agency/${agency.id}/launchpad`,
                        },
                        {
                            name: "Billing",
                            icon: "payment",
                            link: `/agency/${agency.id}/billing`,
                        },
                        {
                            name: "Settings",
                            icon: "settings",
                            link: `/agency/${agency.id}/settings`,
                        },
                        {
                            name: "Sub Accounts",
                            icon: "person",
                            link: `/agency/${agency.id}/all-subaccounts`,
                        },
                        {
                            name: "Team",
                            icon: "shield",
                            link: `/agency/${agency.id}/team`,
                        },
                    ],
                },
            },
        });

        return agencyDetails;
    } catch (error) {
        console.log(error);
    }
};

export const getNotificationAndUser = async (agencyId: string) => {
    try {
        const response = await db.notification.findMany({
            where: {
                agencyId,
            },
            include: {
                User: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const upsertSubAccount = async (subAccount: SubAccount) => {
    if (!subAccount.companyEmail) return null;

    const agencyOwner = await db.user.findFirst({
        where: {
            Agency: {
                id: subAccount.agencyId,
            },
            role: "AGENCY_OWNER",
        },
    });

    if (!agencyOwner) return console.log("Error could not create subaccount");
    const permissionId = v4();
    const response = await db.subAccount.upsert({
        where: { id: subAccount.id },
        update: subAccount,
        create: {
            ...subAccount,
            Permissions: {
                create: {
                    access: true,
                    email: agencyOwner.email,
                    id: permissionId,
                },
                connect: {
                    subAccountId: subAccount.id,
                    id: permissionId,
                },
            },
            Pipeline: {
                create: { name: "Lead Cycle" },
            },
            SidebarOption: {
                create: [
                    {
                        name: "Launchpad",
                        icon: "clipboardIcon",
                        link: `/subaccount/${subAccount.id}/launchpad`,
                    },
                    {
                        name: "Settings",
                        icon: "settings",
                        link: `/subaccount/${subAccount.id}/settings`,
                    },
                    {
                        name: "Funnels",
                        icon: "pipelines",
                        link: `/subaccount/${subAccount.id}/funnels`,
                    },
                    {
                        name: "Media",
                        icon: "database",
                        link: `/subaccount/${subAccount.id}/media`,
                    },
                    {
                        name: "Automations",
                        icon: "chip",
                        link: `/subaccount/${subAccount.id}/automations`,
                    },
                    {
                        name: "Pipelines",
                        icon: "flag",
                        link: `/subaccount/${subAccount.id}/pipelines`,
                    },
                    {
                        name: "Contacts",
                        icon: "person",
                        link: `/subaccount/${subAccount.id}/contacts`,
                    },
                    {
                        name: "Dashboard",
                        icon: "category",
                        link: `/subaccount/${subAccount.id}`,
                    },
                ],
            },
        },
    });

    return response;
};

export const getUserDetailsByAuthEmail = async (authEmail: AuthUser) => {
    try {
        const response = await db.user.findUnique({
            where: {
                email: authEmail.emailAddresses[0].emailAddress,
            },
        });

        return response;
    } catch (err) {
        console.log(err);
    }
};

export const getUserPermissions = async (userId: string) => {
    const response = await db.user.findUnique({
        where: { id: userId },
        select: {
            Permissions: {
                include: {
                    SubAccount: true,
                },
            },
        },
    });

    return response;
};

export const getSubAccountDetails = async (subaccountId: string) => {
    const response = await db.subAccount.findUnique({
        where: { id: subaccountId },
    });

    return response;
};

export const deleteSubAccount = async (subaccountId: string) => {
    const response = await db.subAccount.delete({
        where: {
            id: subaccountId,
        },
    });

    return response;
};
