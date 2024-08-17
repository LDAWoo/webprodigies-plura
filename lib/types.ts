import { Contact, Lane, Notification, Prisma, Role, Tag, Ticket, User } from "@prisma/client";
import { _getTicketsWithAllRelations, getAuthUserDetails, getMedia, getPipelineDetails, getTicketsWithTags, getUserPermissions } from "./queries";
import { db } from "./db";

export type NotificationWithUser =
    | ({
          User: {
              id: string;
              name: string;
              avatarUrl: string;
              email: string;
              createdAt: Date;
              updatedAt: Date;
              role: Role;
              agencyId: string | null;
          };
      } & Notification)[]
    | undefined;

const __getUsersWithAgencySubAccountPermissionsSidebarOptions = async (agencyId: string) => {
    return await db.user.findFirst({
        where: { Agency: { id: agencyId } },
        include: {
            Agency: { include: { SubAccount: true } },
            Permissions: { include: { SubAccount: true } },
        },
    });
};

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<typeof getUserPermissions>;

export type AuthUSerWithAgencySigebarOptionsSubAccounts = Prisma.PromiseReturnType<typeof getAuthUserDetails>;

export type UsersWithAgencySubAccountPermissionsSidebarOptions = Prisma.PromiseReturnType<typeof __getUsersWithAgencySubAccountPermissionsSidebarOptions>;

export type GetMediaFiles = Prisma.PromiseReturnType<typeof getMedia>;

export type CreateMediaType = Prisma.MediaCreateWithoutSubaccountInput;

export type CreatePipeLineType = Prisma.PipelineUncheckedCreateWithoutLaneInput;

export type TicketAndTags = Ticket & {
    Tags: Tag[];
    Assigned: User | null;
    Customer: Contact | null;
};

export type LaneDetails = Lane & {
    Tickets: TicketAndTags[];
};

export type PipelineDetailsWithLanesCardsTagsTickets = Prisma.PromiseReturnType<typeof getPipelineDetails>;

export type TicketWithTags = Prisma.PromiseReturnType<typeof getTicketsWithTags>;

export type TicketDetails = Prisma.PromiseReturnType<typeof _getTicketsWithAllRelations>;
