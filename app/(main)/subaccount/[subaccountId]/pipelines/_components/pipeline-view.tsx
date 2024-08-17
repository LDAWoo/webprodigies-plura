"use client";
import { Button } from "@/components/ui/button";
import { LaneDetails, PipelineDetailsWithLanesCardsTagsTickets, TicketAndTags } from "@/lib/types";
import { useModal } from "@/providers/modal.provider";
import { Lane, Ticket } from "@prisma/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import PipelineLane from "./pipeline-lane";
import CustomModal from "@/components/global/custom-modal";
import LaneForm from "@/components/forms/lane-form";

interface PipelineViewProps {
    lanes: LaneDetails[];
    pipelineId: string;
    subaccountId: string;
    pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets;
    updateLanesOrder: (lanes: Lane[]) => Promise<void>;
    updateTicketsOrder: (tickets: Ticket[]) => Promise<void>;
}

const PipelineView: React.FC<PipelineViewProps> = ({ lanes, pipelineId, subaccountId, pipelineDetails, updateLanesOrder, updateTicketsOrder }) => {
    const { setOpen } = useModal();
    const router = useRouter();
    const [allLanes, setAllLanes] = useState<LaneDetails[]>();

    useEffect(() => {
        setAllLanes(lanes);
    }, [lanes]);

    const ticketsFromAllLanes: TicketAndTags[] = [];
    lanes.forEach((lane) => {
        lane.Tickets.forEach((ticket) => {
            ticketsFromAllLanes.push(ticket);
        });
    });

    const [allTickets, setAllTickets] = useState<TicketAndTags[]>(ticketsFromAllLanes);

    const handleDragEnd = (results: DropResult) => {
        const { destination, source, type } = results;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        switch (type) {
            case "lane": {
                if (!allLanes) return;
                const newLanes = [...allLanes]
                    .toSpliced(source.index, 1)
                    .toSpliced(destination.index, 0, allLanes[source.index])
                    .map((lane, index) => {
                        return {
                            ...lane,
                            order: index,
                        };
                    });

                setAllLanes(newLanes);
                updateLanesOrder(newLanes);
            }

            case "ticket": {
                if (!allLanes) return;
                let newLanes = [...allLanes];
                const originLane = newLanes.find((lane) => lane.id === source.droppableId);

                const destinationLane = newLanes.find((lane) => lane.id === destination.droppableId);

                if (!originLane || !destinationLane) {
                    return;
                }

                if (source.droppableId === destination.droppableId) {
                    const newOrderedTickets = [...originLane.Tickets]
                        .toSpliced(source.index, 1)
                        .toSpliced(destination.index, 0, originLane.Tickets[source.index])
                        .map((item, idx) => {
                            return { ...item, order: idx };
                        });
                    originLane.Tickets = newOrderedTickets;
                    setAllLanes(newLanes);
                    updateTicketsOrder(newOrderedTickets);
                    router.refresh();
                } else {
                    const [currentTicket] = originLane.Tickets.splice(source.index, 1);

                    originLane.Tickets.forEach((ticket, idx) => {
                        ticket.order = idx;
                    });

                    destinationLane.Tickets.splice(destination.index, 0, {
                        ...currentTicket,
                        laneId: destination.droppableId,
                    });

                    destinationLane.Tickets.forEach((ticket, idx) => {
                        ticket.order = idx;
                    });
                    setAllLanes(newLanes);
                    updateTicketsOrder([...destinationLane.Tickets, ...originLane.Tickets]);
                    router.refresh();
                }
            }
        }
    };

    const handleAddLane = () => {
        setOpen(
            <CustomModal title=" Create A Lane" subheading="Lanes allow you to group tickets">
                <LaneForm pipelineId={pipelineId} />
            </CustomModal>
        );
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="absolute top-16 left-0 right-0 bottom-0 flex-grow">
                <div className="flex flex-col h-full bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl">{pipelineDetails?.name}</h1>
                        <Button className="flex items-center gap-4" onClick={handleAddLane}>
                            <Plus size={15} />
                            Create Lane
                        </Button>
                    </div>
                    <Droppable droppableId="lanes" type="lane" direction="horizontal" key={"lanes"}>
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="flex item-center gap-x-2 overflow-x-auto overflow-y-hidden w-full h-full">
                                <div className="flex mt-4">
                                    {allLanes?.map((lane, index) => (
                                        <PipelineLane allTickets={allTickets} setAllTickets={setAllTickets} subaccountId={subaccountId} pipelineId={pipelineId} tickets={lane.Tickets} laneDetails={lane} index={index} key={lane.id} />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>
                </div>
            </div>
        </DragDropContext>
    );
};

export default PipelineView;
