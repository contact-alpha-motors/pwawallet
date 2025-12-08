"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, Wallet, FileDown, FolderKanban, Trash2, Target, LogOut, User as UserIcon } from "lucide-react";
import { ResetDataDialog } from './reset-data-dialog';
import { useTransactions } from '@/providers/transactions-provider';
import { format } from 'date-fns';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { SetBudgetDialog } from './set-budget-dialog';
import { Dialog, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogTrigger } from '../ui/alert-dialog';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '../ui/avatar';

export function SiteHeader() {
  const { auth } = useAuth();
  const { user } = useUser();
  const router = useRouter();

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
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `transactions-${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  
  const handleLogout = () => {
    auth.signOut();
    router.push('/login');
  }

  const getInitials = (email: string | null | undefined) => {
    if (!email) return '..';
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center max-w-4xl">
          <div className="mr-4 flex items-center">
            <Wallet className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold">MonPortefeuille</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            {user && user.isAnonymous ? (
                <Button onClick={() => router.push('/login')}>S'inscrire / Se connecter</Button>
            ) : user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                        </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : null}

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Paramètres</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Target className="mr-2 h-4 w-4" />
                      Définir le budget
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <SetBudgetDialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen} />
                </Dialog>

                <Dialog open={isCategoriesDialogOpen} onOpenChange={setIsCategoriesDialogOpen}>
                   <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <FolderKanban className="mr-2 h-4 w-4" />
                        Gérer les catégories
                      </DropdownMenuItem>
                   </DialogTrigger>
                   <ManageCategoriesDialog open={isCategoriesDialogOpen} onOpenChange={setIsCategoriesDialogOpen} />
                </Dialog>

                <DropdownMenuItem onClick={handleExport}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Exporter vers Excel
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Réinitialiser les données
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <ResetDataDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen} />
                </AlertDialog>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
