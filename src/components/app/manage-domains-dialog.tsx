
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDomains } from '@/providers/domains-provider';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { Trash2 } from 'lucide-react';
import { defaultDomains } from '@/lib/types';

interface ManageDomainsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageDomainsDialog({
  open,
  onOpenChange,
}: ManageDomainsDialogProps) {
  const { domains, addDomain, deleteDomain } = useDomains();
  const [newDomain, setNewDomain] = useState('');
  const { toast } = useToast();

  const handleAddDomain = () => {
    if (newDomain.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Domaine invalide',
        description: 'Le nom du domaine ne peut pas être vide.',
      });
      return;
    }
    if (domains.some((d) => d.toLowerCase() === newDomain.toLowerCase())) {
      toast({
        variant: 'destructive',
        title: 'Domaine existant',
        description: 'Ce domaine existe déjà.',
      });
      return;
    }
    addDomain(newDomain.trim());
    toast({
      title: 'Domaine ajouté',
      description: `Le domaine "${newDomain.trim()}" a été ajouté.`,
    });
    setNewDomain('');
  };

  const isDefaultDomain = (domain: string) => {
    return (defaultDomains as readonly string[]).includes(domain);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gérer les domaines</DialogTitle>
          <DialogDescription>
            Ajoutez ou supprimez des domaines de dépenses.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="Nom du nouveau domaine"
              onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
            />
            <Button onClick={handleAddDomain}>Ajouter</Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Domaines existants
            </h3>
            <div className="flex flex-wrap gap-2">
              {domains.map((domain) => (
                <Badge
                  key={domain}
                  variant="secondary"
                  className="flex items-center gap-2 pr-1"
                >
                  <span>{domain}</span>
                  {!isDefaultDomain(domain) && (
                    <button
                      onClick={() => deleteDomain(domain)}
                      className="rounded-full hover:bg-destructive/20 p-0.5"
                      aria-label={`Supprimer ${domain}`}
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
