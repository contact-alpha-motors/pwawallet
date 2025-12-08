"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useTransactions } from "@/providers/transactions-provider";
import { useCategories } from "@/providers/categories-provider";
import { defaultDomains } from "@/lib/types";

const formSchema = z.object({
  amount: z.coerce.number().positive("Le montant doit être positif"),
  description: z.string().optional(),
  beneficiary: z.string().optional(),
  category: z.string().optional(),
  domain: z.string().optional(),
  type: z.enum(["income", "expense"]),
  date: z.date(),
}).refine(data => {
    if (data.type === 'expense') {
        return !!data.beneficiary && data.beneficiary.length >= 2;
    }
    return true;
}, {
    message: "Le bénéficiaire doit comporter au moins 2 caractères.",
    path: ['beneficiary']
}).refine(data => {
    if (data.type === 'expense') {
        return !!data.category && data.category.length >= 1;
    }
    return true;
}, {
    message: "Veuillez sélectionner une catégorie.",
    path: ['category']
}).refine(data => {
    if (data.type === 'expense') {
        return !!data.domain && data.domain.length >= 1;
    }
    return true;
}, {
    message: "Veuillez sélectionner un domaine.",
    path: ['domain']
});

type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { addTransaction, isOffline } = useTransactions();
  const { categories } = useCategories();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: "",
      beneficiary: "",
      type: "expense",
      date: new Date(),
      category: "",
      domain: "",
    },
  });

  const transactionType = useWatch({
    control: form.control,
    name: 'type'
  });
  const isExpense = transactionType === 'expense';


  function onSubmit(values: TransactionFormValues) {
    addTransaction({
      ...values,
      description: values.description || "",
      beneficiary: values.beneficiary || "",
      category: values.category || "",
      domain: values.domain || "",
    });
    form.reset();
    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type de transaction" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Revenu</SelectItem>
                  <SelectItem value="expense">Dépense</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="beneficiary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bénéficiaire {isExpense && <span className="text-destructive">*</span>}</FormLabel>
              <FormControl>
                <Input placeholder="ex: John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motif</FormLabel>
              <FormControl>
                <Input placeholder="ex: Achat de matériel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie {isExpense && <span className="text-destructive">*</span>}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domaine {isExpense && <span className="text-destructive">*</span>}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un domaine" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(defaultDomains as readonly string[]).map(dom => (
                    <SelectItem key={dom} value={dom}>{dom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: fr })
                      ) : (
                        <span>Choisir une date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Ajout...' : isOffline ? 'Ajouter hors ligne' : 'Ajouter la transaction'}
        </Button>
      </form>
    </Form>
  );
}
