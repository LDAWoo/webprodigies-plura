"use client";

import { Agency, SubAccount } from "@prisma/client";
import React, { useEffect } from "react";
import { useToast } from "../ui/use-toast";
import { useModal } from "@/providers/model.provider";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import FileUpload from "../global/file-upload";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Loading from "../global/loading";
import { useRouter } from "next/navigation";
import { saveActivityLogsNotification, upsertSubAccount } from "@/lib/queries";
import { v4 } from "uuid";

const formSchema = z.object({
    name: z.string(),
    companyEmail: z.string(),
    companyPhone: z.string(),
    address: z.string(),
    city: z.string(),
    subAccountLogo: z.string(),
    zipCode: z.string(),
    state: z.string(),
    country: z.string(),
});

//CHALLENGE Give access for Subaccount Guest they should see a different view maybe a form that allows them to create tickets

//CHALLENGE layout.tsx oonly runs once as a result if you remove permissions for someone and they keep navigating the layout.tsx wont fire again. solution- save the data inside metadata for current user.

interface SubAccountDetailsProps {
    //To add the sub account to the agency
    agencyDetails: Agency;
    details?: Partial<SubAccount>;
    userId: string;
    userName: string;
}

const SubAccountDetails: React.FC<SubAccountDetailsProps> = ({ details, agencyDetails, userId, userName }) => {
    const { toast } = useToast();
    const { setClose } = useModal();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: details?.name ?? "",
            companyEmail: details?.companyEmail ?? "",
            companyPhone: details?.companyPhone ?? "",
            address: details?.address ?? "",
            city: details?.city ?? "",
            subAccountLogo: details?.subAccountLogo ?? "",
            zipCode: details?.zipCode ?? "",
            state: details?.state ?? "",
            country: details?.country ?? "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await upsertSubAccount({
                id: details?.id ? details.id : v4(),
                address: values.address,
                subAccountLogo: values.subAccountLogo,
                city: values.city,
                companyPhone: values.companyPhone,
                country: values.country,
                name: values.name,
                state: values.state,
                zipCode: values.zipCode,
                createdAt: new Date(),
                updatedAt: new Date(),
                companyEmail: values.companyEmail,
                agencyId: agencyDetails.id,
                connectAccountId: "",
                goal: 5000,
            });

            if (!response) throw new Error("No response from server");

            await saveActivityLogsNotification({
                agencyId: response.agencyId,
                description: `${userName} | updated sub account | ${response.name}`,
                subAccountId: response.id,
            });

            toast({
                title: "Subaccount details saved",
                description: "Successfully saved your subaccount details.",
            });

            setClose();
            router.refresh();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Oppse!",
                description: "Could not save sub account details.",
            });
        }
    }

    useEffect(() => {
        if (details) {
            form.reset(details);
        }
    }, [details]);

    const isLoading = form.formState.isSubmitting;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Sub Account Information</CardTitle>
                <CardDescription>Please enter business details</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name="subAccountLogo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Logo</FormLabel>
                                    <FormControl>
                                        <FileUpload apiEndpoint="subaccountLogo" value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex md:flex-row gap-4">
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Account Name</FormLabel>
                                        <FormControl>
                                            <Input required placeholder="Your agency name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="companyEmail"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Acount Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex md:flex-row gap-4">
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="companyPhone"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Acount Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Phone" required {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input required placeholder="123 st..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex md:flex-row gap-4">
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input required placeholder="City" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>State</FormLabel>
                                        <FormControl>
                                            <Input required placeholder="State" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="zipCode"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Zipcpde</FormLabel>
                                        <FormControl>
                                            <Input required placeholder="Zipcode" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input required placeholder="Country" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loading /> : "Save Account Information"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default SubAccountDetails;
