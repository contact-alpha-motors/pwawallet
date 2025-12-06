"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { TransactionForm } from './transaction-form';
import { ScrollArea } from '../ui/scroll-area';

export function AddTransaction() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSuccess = () => {
    setOpen(false);
  }

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg"
            size="icon"
            aria-label="Ajouter une transaction"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-lg h-[90dvh] flex flex-col p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>Ajouter une transaction</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="p-6">
                <TransactionForm onSuccess={handleSuccess} />
            </div>
          </ScrollArea>
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
          aria-label="Ajouter une transaction"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Ajouter une transaction</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="p-6">
            <TransactionForm onSuccess={handleSuccess} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
