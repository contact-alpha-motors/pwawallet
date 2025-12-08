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

const budgetSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères."),
  amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  onSuccess?: () => void;
}

export function BudgetForm({ onSuccess }: BudgetFormProps) {
  const { addBudget } = useTransactions();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: '',
      amount: 0,
    },
  });

  function onSubmit(values: BudgetFormValues) {
    addBudget(values);
    form.reset();
    onSuccess?.();
  }

  return (
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
          {form.formState.isSubmitting ? 'Création...' : 'Créer le budget'}
        </Button>
      </form>
    </Form>
  );
}
