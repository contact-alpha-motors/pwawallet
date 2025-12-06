"use client";

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
import { useTransactions } from "@/providers/transactions-provider";
import { useToast } from "@/hooks/use-toast";

interface ResetDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetDataDialog({ open, onOpenChange }: ResetDataDialogProps) {
  const { clearTransactions } = useTransactions();
  const { toast } = useToast();

  const handleReset = () => {
    clearTransactions();
    toast({
      title: "Data Reset",
      description: "All your transaction data has been cleared.",
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all your
            transaction data from this device.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Yes, reset data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
