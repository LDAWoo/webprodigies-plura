import BlurPage from "@/components/global/blur-page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getContact } from "@/lib/queries";
import { Contact, SubAccount, Ticket } from "@prisma/client";
import { format } from "date-fns";
import React from "react";
import CreateContactButton from "./_components/create-contact-btn";

type Props = {
    params: {
        subaccountId: string;
    };
};

type SubAccountWithContacts = SubAccount & {
    Contact: (Contact & { Ticket: Ticket[] })[];
};

const Page = async ({ params }: Props) => {
    const contacts = (await getContact(params.subaccountId)) as SubAccountWithContacts;
    const allContacts = contacts.Contact;

    const formatTotal = (tickets: Ticket[]) => {
        if (!tickets || !tickets.length) return "$0.00";
        const amt = new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "USD",
        });

        const laneAmt = tickets.reduce((sum, ticket) => sum + (Number(ticket?.value) || 0), 0);

        return amt.format(laneAmt);
    };

    return (
        <BlurPage>
            <h1 className="text-4xl p-[12px_0]">Contacts</h1>
            <CreateContactButton subaccountId={params.subaccountId} />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead className="w-[300px]">Email</TableHead>
                        <TableHead className="w-[200px]">Active</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="font-medium truncate">
                    {allContacts.map((contact) => (
                        <TableRow key={contact.id}>
                            <TableCell>
                                <Avatar>
                                    <AvatarImage alt="@shadcn" />
                                    <AvatarFallback className="bg-primary text-white">{contact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell>{contact.email}</TableCell>
                            <TableCell>{formatTotal(contact?.Ticket) === "$0.00" ? <Badge variant={"destructive"}>Inactive</Badge> : <Badge className="bg-emerald-700">Active</Badge>}</TableCell>
                            <TableCell>{format(contact.createdAt, "MM/dd/yyyy")}</TableCell>
                            <TableCell className="text-right">{formatTotal(contact.Ticket)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </BlurPage>
    );
};

export default Page;
