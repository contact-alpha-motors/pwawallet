"use client";

import { useState } from 'react';
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
import { useCategories } from '@/providers/categories-provider';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { Trash2 } from 'lucide-react';
import { defaultCategories } from '@/lib/types';

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageCategoriesDialog({ open, onOpenChange }: ManageCategoriesDialogProps) {
  const { categories, addCategory, deleteCategory } = useCategories();
  const [newCategory, setNewCategory] = useState('');
  const { toast } = useToast();

  const handleAddCategory = () => {
    if (newCategory.trim() === '') {
      toast({
        variant: "destructive",
        title: "Catégorie invalide",
        description: "Le nom de la catégorie ne peut pas être vide.",
      });
      return;
    }
    if (categories.some(c => c.toLowerCase() === newCategory.toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Catégorie existante",
            description: "Cette catégorie existe déjà.",
        });
        return;
    }
    addCategory(newCategory.trim());
    toast({
      title: "Catégorie ajoutée",
      description: `La catégorie "${newCategory.trim()}" a été ajoutée.`,
    });
    setNewCategory('');
  };

  const isDefaultCategory = (category: string) => {
    return (defaultCategories as readonly string[]).includes(category);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gérer les catégories</DialogTitle>
          <DialogDescription>
            Ajoutez ou supprimez des catégories de dépenses et de revenus.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nom de la nouvelle catégorie"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button onClick={handleAddCategory}>Ajouter</Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Catégories existantes</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-2 pr-1">
                  <span>{category}</span>
                  {!isDefaultCategory(category) && (
                    <button
                      onClick={() => deleteCategory(category)}
                      className="rounded-full hover:bg-destructive/20 p-0.5"
                      aria-label={`Supprimer ${category}`}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
