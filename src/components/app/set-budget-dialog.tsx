
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Label } from '../ui/label';

interface SetBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const budgetSchema = z.object({
    budget: z.coerce.number().min(0, "Le budget doit être un nombre positif."),
});

export function SetBudgetDialog({ open, onOpenChange }: SetBudgetDialogProps) {
  const { budget, setBudget } = useTransactions();

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budget: budget || 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ budget: budget || 0 });
    }
  }, [open, budget, form]);
  

  const handleSubmit = (values: z.infer<typeof budgetSchema>) => {
    setBudget(values.budget);
    onOpenChange(false); // Close the dialog
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
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Budget Mensuel</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="ex: 500000"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter className="pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Annuler
                        </Button>
                    </DialogClose>
                    <Button type="submit">Enregistrer</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
