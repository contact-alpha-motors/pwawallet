'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTransactions } from '@/providers/transactions-provider';
import type { Budget } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect } from 'react';

const budgetSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères."),
  amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface EditBudgetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget;
}

export function EditBudget({ open, onOpenChange, budget }: EditBudgetProps) {
  const { updateBudget } = useTransactions();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: budget.name,
      amount: budget.amount,
    },
  });

  useEffect(() => {
    if (budget) {
      form.reset({
        name: budget.name,
        amount: budget.amount,
      });
    }
  }, [budget, form, open]);

  function onSubmit(values: BudgetFormValues) {
    updateBudget(budget.id, values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le budget</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du Budget</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Vacances d'été" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant Alloué</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Modification...' : 'Modifier le budget'}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
