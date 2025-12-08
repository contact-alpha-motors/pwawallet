
"use client";

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransactions } from '@/providers/transactions-provider';
import { Label } from '../ui/label';

interface SetBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetBudgetDialog({ open, onOpenChange }: SetBudgetDialogProps) {
  const { budget, setBudget } = useTransactions();
  const [currentBudget, setCurrentBudget] = useState(budget || 0);

  useEffect(() => {
    if (open) {
      setCurrentBudget(budget || 0);
    }
  }, [open, budget]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newBudget = parseFloat(String(currentBudget));
    if (!isNaN(newBudget) && newBudget >= 0) {
      setBudget(newBudget);
      onOpenChange(false); // Close the dialog
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Définir le budget mensuel</DialogTitle>
          <DialogDescription>
            Entrez votre budget mensuel pour suivre vos dépenses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="budget">Budget Mensuel</Label>
                <Input
                    id="budget"
                    type="number"
                    value={currentBudget}
                    onChange={(e) => setCurrentBudget(Number(e.target.value))}
                    placeholder="ex: 500000"
                />
            </div>
            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline">
                        Annuler
                    </Button>
                </DialogClose>
                <Button type="submit">Enregistrer</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
