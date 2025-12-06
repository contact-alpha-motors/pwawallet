"use client";

import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, Wallet } from "lucide-react";
import { ResetDataDialog } from './reset-data-dialog';

export function SiteHeader() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center max-w-4xl">
          <div className="mr-4 flex items-center">
            <Wallet className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold">MyWallet PWA</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsResetDialogOpen(true)}>
                  Reset Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <ResetDataDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen} />
    </>
  );
}
