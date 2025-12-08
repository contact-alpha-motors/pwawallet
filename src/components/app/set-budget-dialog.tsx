"use client";

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransactions } from '@/providers/transactions-provider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

interface SetBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const budgetSchema = z.object({
    budget: z.coerce.number().min(0, "Le budget ne peut pas être négatif."),
});

export function SetBudgetDialog({ open, onOpenChange }: SetBudgetDialogProps) {
  const { budget, setBudget } = useTransactions();
  
  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
        budget: budget || 0,
    }
  });

  useEffect(() => {
    if (open) {
        form.reset({ budget: budget || 0 });
    }
  }, [budget, open, form]);


  const handleSetBudget = (values: z.infer<typeof budgetSchema>) => {
    setBudget(values.budget);
    onOpenChange(false);
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSetBudget)} className="space-y-4 py-4">
                 <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Budget Mensuel</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="ex: 500000" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                    />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button type="submit">Enregistrer</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
