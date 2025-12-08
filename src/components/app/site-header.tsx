"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, Wallet, FileDown, FolderKanban, Trash2, Target } from "lucide-react";
import { ResetDataDialog } from './reset-data-dialog';
import { useTransactions } from '@/providers/transactions-provider';
import { format } from 'date-fns';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { SetBudgetDialog } from './set-budget-dialog';

export function SiteHeader() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const { transactions } = useTransactions();

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
      Date: format(new Date(t.date), 'yyyy-MM-dd'),
      Bénéficiaire: t.beneficiary,
      Motif: t.description,
      Montant: t.amount,
      Type: t.type === 'income' ? 'Revenu' : 'Dépense',
      Catégorie: t.category,
      Domaine: t.domain,
      Solde: t.balance,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-T' });
    saveAs(data, `transactions-${new Date().toISOString().split('T')[0]}.xlsx`);
  };


  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center max-w-4xl">
          <div className="mr-4 flex items-center">
            <Wallet className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold">MonPortefeuille</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Paramètres</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setIsBudgetDialogOpen(true)}>
                    <Target className="mr-2 h-4 w-4" />
                    Définir le budget
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setIsCategoriesDialogOpen(true)}>
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Gérer les catégories
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Exporter vers Excel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setIsResetDialogOpen(true)} className="text-destructive">
                   <Trash2 className="mr-2 h-4 w-4" />
                  Réinitialiser les données
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <ResetDataDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen} />
      <ManageCategoriesDialog open={isCategoriesDialogOpen} onOpenChange={setIsCategoriesDialogOpen} />
      <SetBudgetDialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen} />
    </>
  );
}
