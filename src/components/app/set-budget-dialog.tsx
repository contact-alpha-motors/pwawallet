
"use client";

import { useEffect } from 'react';
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

type BudgetFormValues = z.infer<typeof budgetSchema>;

export function SetBudgetDialog({ open, onOpenChange }: SetBudgetDialogProps) {
  const { budget, setBudget } = useTransactions();
  
  console.log('[SetBudgetDialog] Rendering with open =', open);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
        budget: budget || 0,
    }
  });

  useEffect(() => {
    if (open) {
        console.log('[SetBudgetDialog] Resetting form with budget:', budget);
        form.reset({ budget: budget || 0 });
    }
  }, [budget, open, form]);

  const handleSetBudget = (values: BudgetFormValues) => {
    console.log('[SetBudgetDialog] Form submitted with values:', values);
    setBudget(values.budget);
    onOpenChange(false); // Close the dialog on success
  };

  const handleOpenChange = (isOpen: boolean) => {
    console.log('[SetBudgetDialog] onOpenChange called with:', isOpen);
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Définir le budget mensuel</DialogTitle>
          <DialogDescription>
            Entrez votre budget mensuel pour suivre vos dépenses.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSetBudget)} className="space-y-4">
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
              <DialogFooter className="pt-4">
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

