"use client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LaneDetails, TicketWithTags } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useModal } from "@/providers/modal.provider";
import { Edit, MoreVertical, PlusCircleIcon, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useMemo } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import PipelineTicket from "./pipeline-ticket";
import CustomModal from "@/components/global/custom-modal";
import TicketForm from "@/components/forms/ticket-form";

interface PipelineLaneProps {
    setAllTickets: Dispatch<SetStateAction<TicketWithTags>>;
    allTickets: TicketWithTags;
    tickets: TicketWithTags;
    pipelineId: string;
    laneDetails: LaneDetails;
    subaccountId: string;
    index: number;
}

const PipelineLane: React.FC<PipelineLaneProps> = ({ setAllTickets, allTickets, tickets, pipelineId, laneDetails, subaccountId, index }) => {
    const { setOpen } = useModal();
    const router = useRouter();

    const amt = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
    });

    const laneAmt = useMemo(() => {
        return tickets.reduce((sum, ticket) => sum + (Number(ticket?.value) || 0), 0);
    }, [tickets]);

    const randomColor = `#${Math.random().toString(16).slice(2, 8)}`;

    const addNewTicket = (ticket: TicketWithTags[0]) => {
        setAllTickets([...allTickets, ticket]);
    };

    const handleCreateTicket = () => {
        setOpen(
            <CustomModal title="Create A Ticket" subheading="Tickets are a great way to keep track of tasks">
                <TicketForm getNewTicket={addNewTicket} laneId={laneDetails.id} subaccountId={subaccountId} />
            </CustomModal>
        );
    };

    return (
        <Draggable draggableId={laneDetails.id.toString()} index={index} key={laneDetails.id}>
            {(provided, snapshot) => {
                if (snapshot.isDragging) {
                    //@ts-ignore
                    const offset = { x: 300, y: 0 };
                    //@ts-ignore
                    const x = provided.draggableProps.style?.left - offset.x;
                    //@ts-ignore
                    const y = provided.draggableProps.style?.top - offset.y;
                    //@ts-ignore
                    provided.draggableProps.style = {
                        ...provided.draggableProps.style,
                        top: y,
                        left: x,
                    };
                }
                return (
                    <div {...provided.draggableProps} ref={provided.innerRef} className="h-full">
                        <AlertDialog>
                            <DropdownMenu>
                                <div className="bg-slate-200/30 dark:bg-background/20 h-full w-[300px] px-2 relative overflow-visible rounded-lg flex-shrink-0 ">
                                    <div {...provided.dragHandleProps} className=" h-14 backdrop-blur-lg dark:bg-background/40 bg-slate-200/60  absolute top-0 left-0 right-0 z-10 ">
                                        <div className="h-full flex items-center p-4 justify-between cursor-grab border-b-[1px] ">
                                            {/* {laneDetails.order} */}
                                            <div className="flex items-center w-full gap-2">
                                                <div className={cn("w-4 h-4 rounded-full")} style={{ background: randomColor }} />
                                                <span className="font-bold text-sm">{laneDetails.name}</span>
                                            </div>
                                            <div className="flex items-center flex-row">
                                                <Badge className="bg-white text-black">{amt.format(laneAmt)}</Badge>
                                                <DropdownMenuTrigger>
                                                    <MoreVertical className="text-muted-foreground cursor-pointer" />
                                                </DropdownMenuTrigger>
                                            </div>
                                        </div>
                                    </div>

                                    <Droppable droppableId={laneDetails.id.toString()} key={laneDetails.id} type="ticket">
                                        {(provided) => (
                                            <div className="h-full overflow-y-auto no-scrollbar pt-12 bg-slate-00">
                                                <div {...provided.droppableProps} ref={provided.innerRef} className="mt-2 h-full">
                                                    {tickets.map((ticket, index) => (
                                                        <PipelineTicket allTickets={allTickets} setAllTickets={setAllTickets} subAccountId={subaccountId} ticket={ticket} key={ticket.id.toString()} index={index} />
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>

                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Options</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <AlertDialogTrigger>
                                            <DropdownMenuItem className="flex items-center gap-2">
                                                <Trash size={15} />
                                                Delete
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>

                                        <DropdownMenuItem
                                            className="flex items-center gap-2"
                                            //   onClick={handleEditLane}
                                        >
                                            <Edit size={15} />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="flex items-center gap-2" onClick={handleCreateTicket}>
                                            <PlusCircleIcon size={15} />
                                            Create Ticket
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </div>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex items-center">
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive"
                                            //   onClick={handleDeleteLane}
                                        >
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </DropdownMenu>
                        </AlertDialog>
                    </div>
                );
            }}
        </Draggable>
    );
};

export default PipelineLane;
