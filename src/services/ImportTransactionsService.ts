import Transaction from '../models/Transaction';
import fs from 'fs';
import * as csv from 'fast-csv';
import AppError from '../errors/AppError';
import CreateTransactionService from './CreateTransactionService';

interface parsedTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const parsedTransactions = await new Promise<parsedTransaction[]>(
      (resolve, reject) => {
        const transactions: any[] = [];

        fs.createReadStream(filePath)
          .pipe(csv.parse({ headers: true, ltrim: true }))
          .on('error', () => {
            reject();
            throw new AppError('Cannot import transactions');
          })
          .on('data', row => {
            transactions.push(row);
          })
          .on('end', (rowCount: number) => {
            resolve(transactions);
          });
      },
    );

    const createTransactionService = new CreateTransactionService();

    const transactions = [];

    for await (const transaction of parsedTransactions) {
      const insertedTransaction = await createTransactionService.execute(
        transaction,
      );

      transactions.push(insertedTransaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
