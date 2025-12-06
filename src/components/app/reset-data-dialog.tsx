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
      title: "Données réinitialisées",
      description: "Toutes vos données de transaction ont été effacées.",
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous absolument sûr(e) ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Cela supprimera définitivement toutes vos
            données de transaction de cet appareil.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Oui, réinitialiser
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
