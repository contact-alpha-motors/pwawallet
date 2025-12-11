'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Wallet,
  FolderKanban,
  Trash2,
  LogOut,
  Briefcase,
  Table,
  Shapes,
} from 'lucide-react';
import { ResetDataDialog } from './reset-data-dialog';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { AlertDialog, AlertDialogTrigger } from '../ui/alert-dialog';
import { Dialog, DialogTrigger } from '../ui/dialog';
import Link from 'next/link';
import { usePresence } from '@/providers/presence-provider';
import { ManageDomainsDialog } from './manage-domains-dialog';
import { ExportMenu } from './export-menu';

export function SiteHeader() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false);
  const [isDomainsDialogOpen, setIsDomainsDialogOpen] = useState(false);
  const { isOnline } = usePresence();


  const handleLogout = () => {
    auth.signOut();
    router.push('/login');
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return '..';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center max-w-6xl">
          <Link href="/" className="mr-4 flex items-center">
            <Wallet className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold">MonPortefeuille</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <div
              className={`h-3 w-3 rounded-full animate-pulse ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isOnline ? 'En ligne' : 'Hors ligne'}
            />

            {user && user.isAnonymous ? (
              <Button onClick={() => router.push('/login')}>
                S'inscrire / Se connecter
              </Button>
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
                <DropdownMenuItem onSelect={() => router.push('/')}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Gérer les budgets
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/transactions')}>
                  <Table className="mr-2 h-4 w-4" />
                  Toutes les transactions
                </DropdownMenuItem>

                <Dialog
                  open={isCategoriesDialogOpen}
                  onOpenChange={setIsCategoriesDialogOpen}
                >
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <FolderKanban className="mr-2 h-4 w-4" />
                      Gérer les catégories
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <ManageCategoriesDialog
                    open={isCategoriesDialogOpen}
                    onOpenChange={setIsCategoriesDialogOpen}
                  />
                </Dialog>

                <Dialog
                  open={isDomainsDialogOpen}
                  onOpenChange={setIsDomainsDialogOpen}
                >
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Shapes className="mr-2 h-4 w-4" />
                      Gérer les domaines
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <ManageDomainsDialog
                    open={isDomainsDialogOpen}
                    onOpenChange={setIsDomainsDialogOpen}
                  />
                </Dialog>

                <DropdownMenuSeparator />
                
                <ExportMenu />
                
                <DropdownMenuSeparator />

                <AlertDialog
                  open={isResetDialogOpen}
                  onOpenChange={setIsResetDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Réinitialiser les données
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <ResetDataDialog
                    open={isResetDialogOpen}
                    onOpenChange={setIsResetDialogOpen}
                  />
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
