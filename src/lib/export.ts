
'use client';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import type { Budget, Transaction } from '@/lib/types';
import htm from 'html-to-md';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
  }).format(amount);
};

const getBudgetsToExport = (
  budgets: Budget[],
  transactions: Transaction[],
  specificBudgetId?: string
): (Budget & { spent: number; remaining: number; transactions: Transaction[] })[] => {
  const budgetsToProcess = specificBudgetId
    ? budgets.filter((b) => b.id === specificBudgetId)
    : [...budgets, { id: 'unbudgeted', name: 'Hors budget', amount: 0 }];

  return budgetsToProcess.map((budget) => {
    const budgetTransactions = transactions.filter((t) => {
      if (budget.id === 'unbudgeted') return !t.budgetId;
      return t.budgetId === budget.id;
    });

    const spent = budgetTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = budget.id === 'unbudgeted' ? 0 : budget.amount - spent;

    return {
      ...budget,
      spent,
      remaining,
      transactions: budgetTransactions,
    };
  }).filter(budget => budget.transactions.length > 0 || specificBudgetId);
};


// --- EXPORT TO EXCEL ---
export function exportToExcel(
  budgets: Budget[],
  transactions: Transaction[],
  filename: string,
  specificBudgetId?: string
) {
  const workbook = XLSX.utils.book_new();
  const budgetsToExport = getBudgetsToExport(budgets, transactions, specificBudgetId);

  budgetsToExport.forEach((budget) => {
    const summary = [
      { A: 'Budget:', B: budget.name },
      {
        A: 'Alloué:',
        B: budget.id === 'unbudgeted' ? 'N/A' : formatCurrency(budget.amount),
      },
      { A: 'Dépensé:', B: formatCurrency(budget.spent) },
      {
        A: 'Restant:',
        B: budget.id === 'unbudgeted' ? 'N/A' : formatCurrency(budget.remaining),
      },
      {}, // Empty row
    ];

    const transactionsData = budget.transactions.map((t) => ({
      Date: format(new Date(t.date), 'yyyy-MM-dd'),
      Bénéficiaire: t.beneficiary,
      Motif: t.description,
      Montant: t.amount * (t.type === 'income' ? 1 : -1),
      Type: t.type === 'income' ? 'Revenu' : 'Dépense',
      Catégorie: t.category,
      Domaine: t.domain,
    }));

    const worksheet = XLSX.utils.json_to_sheet(summary, { skipHeader: true });
    XLSX.utils.sheet_add_json(worksheet, transactionsData, { origin: 'A6' });

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 30 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 20 },
    ];

    const safeSheetName = budget.name
      .substring(0, 31)
      .replace(/[\\/*?[\]:]/g, '');
    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
  });

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });
  const data = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(data, `${filename}.xlsx`);
}

// --- EXPORT TO WORD ---
export async function exportToWord(
  budgets: Budget[],
  transactions: Transaction[],
  filename: string,
  specificBudgetId?: string
) {
  const budgetsToExport = getBudgetsToExport(budgets, transactions, specificBudgetId);
  const sections: any[] = [];

  budgetsToExport.forEach((budget) => {
    // Budget Title
    sections.push(
      new Paragraph({
        text: budget.name,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      })
    );

    // Summary
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Alloué: ', bold: true }),
          new TextRun(
            budget.id === 'unbudgeted' ? 'N/A' : formatCurrency(budget.amount)
          ),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Dépensé: ', bold: true }),
          new TextRun(formatCurrency(budget.spent)),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Restant: ', bold: true }),
          new TextRun(
            budget.id === 'unbudgeted' ? 'N/A' : formatCurrency(budget.remaining)
          ),
        ],
        spacing: { after: 400 },
      })
    );

    // Transactions Table
    if (budget.transactions.length > 0) {
      const header = new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Motif", style: "strong" })] }),
          new TableCell({ children: [new Paragraph({ text: "Domaine", style: "strong" })] }),
          new TableCell({ children: [new Paragraph({ text: "Date", style: "strong" })] }),
          new TableCell({ children: [new Paragraph({ text: "Bénéficiaire", style: "strong" })] }),
          new TableCell({ children: [new Paragraph({ text: "Montant", style: "strong" })] }),
        ],
      });

      const rows = budget.transactions.map(
        (t) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(t.description)] }),
              new TableCell({ children: [new Paragraph(t.domain)] }),
              new TableCell({ children: [new Paragraph(format(new Date(t.date), 'dd/MM/yyyy'))] }),
              new TableCell({ children: [new Paragraph(t.beneficiary)] }),
              new TableCell({ children: [new Paragraph(formatCurrency(t.amount * (t.type === 'income' ? 1 : -1)))] }),
            ],
          })
      );

      sections.push(
        new Table({
          rows: [header, ...rows],
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
    }
  });

  const doc = new Document({
    sections: [{ children: sections }],
    styles: {
        paragraphStyles: [
            {
                id: "strong",
                name: "Strong",
                basedOn: "Normal",
                next: "Normal",
                run: {
                    bold: true,
                },
            },
        ]
    }
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}

// --- EXPORT TO MARKDOWN ---
export function exportToMarkdown(
  budgets: Budget[],
  transactions: Transaction[],
  filename: string,
  specificBudgetId?: string
) {
  const budgetsToExport = getBudgetsToExport(budgets, transactions, specificBudgetId);
  let markdownString = '';

  budgetsToExport.forEach((budget) => {
    markdownString += `# ${budget.name}\n\n`;
    markdownString += `**Alloué:** ${
      budget.id === 'unbudgeted' ? 'N/A' : formatCurrency(budget.amount)
    }\n`;
    markdownString += `**Dépensé:** ${formatCurrency(budget.spent)}\n`;
    markdownString += `**Restant:** ${
      budget.id === 'unbudgeted' ? 'N/A' : formatCurrency(budget.remaining)
    }\n\n`;

    if (budget.transactions.length > 0) {
      markdownString += '| Date | Bénéficiaire/Motif | Montant |\n';
      markdownString += '|:---|:---|---:|\n';
      budget.transactions.forEach((t) => {
        markdownString += `| ${format(new Date(t.date), 'dd/MM/yyyy')} | ${
          t.beneficiary || t.description
        } | ${formatCurrency(t.amount * (t.type === 'income' ? 1 : -1))} |\n`;
      });
    }
    markdownString += `\n---\n\n`;
  });
  
  const convertedMarkdown = htm(markdownString);

  const blob = new Blob([convertedMarkdown], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${filename}.md`);
}
