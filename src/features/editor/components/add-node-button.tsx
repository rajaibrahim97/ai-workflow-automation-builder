"use client"

import { PlusIcon } from "lucide-react";
import {memo, useState} from "react";
import {Button} from "@/components/ui/button";
import { NodeSelector } from "@/components/node-selecter";

export const AddNodeButton = memo(() => {
    const [selecterOpen, setSelectorOpen] = useState(false);
    return (
        <NodeSelector open={selecterOpen} onOpenChange={setSelectorOpen}>
        <Button
            onClick={() =>{}}
            size="icon"
            variant="outline"
            className="bg-background"
        >
        <PlusIcon />
        </Button>
        </NodeSelector>
    )
});

AddNodeButton.displayName = "AddNodeButton";
