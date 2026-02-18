"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTitle } from "./ui/alert";
import { authClient } from "@/lib/auth-client";

interface UpgradeModalprops {
    open: boolean;
    onOpenChange: (open:boolean) => void;
};

export const UpgradeModal = ({
    open,
    onOpenChange
}:UpgradeModalprops
) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertTitle>Upgrade to Pro</AlertTitle>
                    <AlertDialogDescription>
                        You need an active subscription to perform this action. 
                        Upgrade to Pro to unlock all features.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => authClient.checkout({slug:"Zapnode-Pro"})}
                    >
                        Upgrade Now
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}