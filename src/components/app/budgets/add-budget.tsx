'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { BudgetForm } from './budget-form';

export function AddBudget() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSuccess = () => {
    setOpen(false);
  }

  const form = <BudgetForm onSuccess={handleSuccess} />;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg"
            size="icon"
            aria-label="Ajouter un budget"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-lg max-h-[90dvh] flex flex-col p-0">
          <SheetHeader className="p-6 pb-0 flex-shrink-0">
            <SheetTitle>Ajouter un budget</SheetTitle>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto">
            <div className="p-6 pt-4">
                {form}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
          size="icon"
          aria-label="Ajouter un budget"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un budget</DialogTitle>
        </DialogHeader>
        <div className="p-4">
            {form}
        </div>
      </DialogContent>
    </Dialog>
  );
}
