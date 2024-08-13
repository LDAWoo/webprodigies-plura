"use client";

import useMounted from "@/hooks/useMounted";
import { Agency, AgencySidebarOption, SubAccount, SubAccountSidebarOption } from "@prisma/client";
import clsx from "clsx";
import { ChevronsUpDown, Menu, PlusCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import Compass from "../icons/compass";
import { AspectRatio } from "../ui/aspect-ratio";
import { Button } from "../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet";
import { useModal } from "@/providers/model.provider";
import CustomModal from "../global/custom-modal";
import SubAccountDetails from "../forms/subaccount-details";
import { Separator } from "../ui/separator";
import { icons } from "@/lib/constant";

type Props = {
    defaultOpen?: boolean;
    subAccounts: SubAccount[];
    sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[];
    sidebarLogo: string;
    details: any;
    user: any;
    id: string;
};

const MenuOptions = ({ defaultOpen, subAccounts, sidebarOpt, sidebarLogo, details, user, id }: Props) => {
    const { setOpen } = useModal();
    const mounted = useMounted();

    const openState = useMemo(() => (defaultOpen ? { open: true } : {}), [defaultOpen]);

    if (!mounted) return;

    return (
        <Sheet modal={false} {...openState}>
            <SheetTrigger asChild className="absolute left-4 top-4 z-[100] md:!hidden flex">
                <Button variant="outline" size="icon">
                    <Menu />
                </Button>
            </SheetTrigger>

            <SheetContent
                showX={true}
                side={"left"}
                className={clsx(`bg-background/80 backdrop-blur-xl fixed top-0 border-r p-6`, {
                    "hidden md:inline-block z-0 w-[300px]": defaultOpen,
                    "inline-block md:hidden z-[100] w-full": !defaultOpen,
                })}
            >
                <div>
                    <AspectRatio ratio={16 / 5}>
                        <Image src={sidebarLogo} alt="Sidebar Logo" fill className="rounded-md object-contain" />
                    </AspectRatio>
                    <Popover>
                        <PopoverTrigger className="w-full">
                            <Button variant={"ghost"} className="w-full p-4 my-4 flex items-center justify-between py-8">
                                <div className="flex items-center text-left gap-2">
                                    <Compass />
                                    <div className="flex flex-col">
                                        {details.name}
                                        <span className="text-muted-foreground">{details.address}</span>
                                    </div>
                                </div>
                                <div>
                                    <ChevronsUpDown size={10} className="text-muted-foreground" />
                                </div>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 h-80 mt-4 z-[200]">
                            {
                                <Command className="rounded-lg">
                                    <CommandInput placeholder="Accounts..." />
                                    <CommandList className="pb-16">
                                        <CommandEmpty>No Results founds</CommandEmpty>
                                        {(user?.role === "AGENCY_OWNER" || user?.role === "AGENCY_ADMIN") && user?.Agency && (
                                            <CommandGroup heading="Agency">
                                                <CommandItem className="!bg-transparent my-2 text-primary border border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                                                    {defaultOpen ? (
                                                        <Link href={`/agency/${user?.Agency?.id}`} className="flex gap-4 w-ful h-full">
                                                            <div className="relative w-16">
                                                                <Image src={user?.Agency?.agencyLogo} alt="Agency Logo" fill className="rounded-md object-contain" />
                                                            </div>
                                                            <div className="flex flex-col flex-1">
                                                                {user?.Agency?.name}
                                                                <span className="text-muted-foreground">{user?.Agency?.address}</span>
                                                            </div>
                                                        </Link>
                                                    ) : (
                                                        <SheetClose asChild>
                                                            <Link href={`/agency/${user?.Agency?.id}`} className="flex gap-4 w-full h-full">
                                                                <div className="relative w-16">
                                                                    <Image src={user?.Agency?.agencyLogo} alt="Agency Logo" fill className="rounded-md object-contain" />
                                                                </div>
                                                                <div className="flex flex-col flex-1">
                                                                    {user?.Agency?.name}
                                                                    <span className="text-muted-foreground">{user?.Agency?.address}</span>
                                                                </div>
                                                            </Link>
                                                        </SheetClose>
                                                    )}
                                                </CommandItem>
                                            </CommandGroup>
                                        )}
                                        <CommandGroup heading="Accounts">
                                            {!!subAccounts
                                                ? subAccounts.map((subaccount) => (
                                                      <CommandItem key={subaccount.id}>
                                                          {defaultOpen ? (
                                                              <Link href={`/subaccount/${subaccount.id}`} className="flex gap-4 w-full h-full">
                                                                  <div className="relative w-16">
                                                                      <Image src={subaccount.subAccountLogo} alt="subaccount Logo" fill className="rounded-md object-contain" />
                                                                  </div>
                                                                  <div className="flex flex-col flex-1">
                                                                      {subaccount.name}
                                                                      <span className="text-muted-foreground">{subaccount.address}</span>
                                                                  </div>
                                                              </Link>
                                                          ) : (
                                                              <SheetClose asChild>
                                                                  <Link href={`/subaccount/${subaccount.id}`} className="flex gap-4 w-full h-full">
                                                                      <div className="relative w-16">
                                                                          <Image src={subaccount.subAccountLogo} alt="subaccount Logo" fill className="rounded-md object-contain" />
                                                                      </div>
                                                                      <div className="flex flex-col flex-1">
                                                                          {subaccount.name}
                                                                          <span className="text-muted-foreground">{subaccount.address}</span>
                                                                      </div>
                                                                  </Link>
                                                              </SheetClose>
                                                          )}
                                                      </CommandItem>
                                                  ))
                                                : "No Accounts"}
                                        </CommandGroup>
                                    </CommandList>
                                    {(user?.role === "AGENCY_OWNER" || user?.role === "AGENCY_ADMIN") && (
                                        <SheetClose>
                                            <Button
                                                className="w-full flex gap-2"
                                                onClick={() => {
                                                    setOpen(
                                                        <CustomModal title="Create A Subaccount" subheading="You can switch between your agency account and the subaccount from the sidebar">
                                                            <SubAccountDetails agencyDetails={user?.Agency as Agency} userId={user?.id as string} userName={user?.name} />
                                                        </CustomModal>
                                                    );
                                                }}
                                            >
                                                <PlusCircleIcon size={15} />
                                                Create Sub Account
                                            </Button>
                                        </SheetClose>
                                    )}
                                </Command>
                            }
                        </PopoverContent>
                    </Popover>
                    <p className="text-muted-foreground text-xs mb-2">MENU LINKS</p>
                    <Separator className="mb-4" />
                    <nav className="relative">
                        <Command className="rounded-lg overflow-visible bg-transparent">
                            <CommandInput placeholder="Search..." />
                            <CommandList className="py-4 overflow-visible">
                                <CommandEmpty>No Results found</CommandEmpty>
                                <CommandGroup className="overflow-visible">
                                    {sidebarOpt.map((sidebarOption) => {
                                        let val;
                                        const result = icons.find((icon) => icon.value === sidebarOption.icon);

                                        if (result) {
                                            val = <result.path />;
                                        }

                                        return (
                                            <CommandItem key={sidebarOption.id} className="w-full">
                                                <Link href={sidebarOption.link} className="flex gap-2 items-center hoverL bg-transparent rounded-md transition-all ">
                                                    {val}
                                                    <span>{sidebarOption.name}</span>
                                                </Link>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default MenuOptions;
