'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useTransactions } from '@/providers/transactions-provider';
import {
  exportToExcel,
  exportToMarkdown,
  exportToWord,
} from '@/lib/export';

interface ExportMenuProps {
  specificBudgetId?: string;
}

export function ExportMenu({ specificBudgetId }: ExportMenuProps) {
  const { transactions, budgets } = useTransactions();

  const handleExport = (format: 'excel' | 'word' | 'markdown') => {
    const filename = specificBudgetId
      ? `budget-${
          budgets.find((b) => b.id === specificBudgetId)?.name.replace(/\s+/g, '_') ?? 'export'
        }`
      : `export_budgets_${new Date().toISOString().split('T')[0]}`;

    if (format === 'excel') {
      exportToExcel(budgets, transactions, filename, specificBudgetId);
    } else if (format === 'word') {
      exportToWord(budgets, transactions, filename, specificBudgetId);
    } else if (format === 'markdown') {
      exportToMarkdown(budgets, transactions, filename, specificBudgetId);
    }
  };

  if (specificBudgetId) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            Exporter vers Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('word')}>
            Exporter vers Word (.docx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('markdown')}>
            Exporter vers Markdown (.md)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <FileDown className="mr-2 h-4 w-4" />
        <span>Exporter les données</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            Exporter vers Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('word')}>
            Exporter vers Word (.docx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('markdown')}>
            Exporter vers Markdown (.md)
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
