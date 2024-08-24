"use client";
import MediaComponent from "@/components/media";
import { getMedia } from "@/lib/queries";
import { GetMediaFiles } from "@/lib/types";
import React, { useEffect, useState } from "react";

type Props = {
    subaccountId: string;
};

const MediaBucketTab = ({ subaccountId }: Props) => {
    const [data, setData] = useState<GetMediaFiles>(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getMedia(subaccountId);
            setData(response);
        };
        fetchData();
    }, [subaccountId]);
    return (
        <div className="h-full p-4">
            <MediaComponent data={data} subaccountId={subaccountId} />
        </div>
    );
};

export default MediaBucketTab;
