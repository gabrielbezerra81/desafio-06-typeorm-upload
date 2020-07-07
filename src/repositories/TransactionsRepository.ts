import { EntityRepository, Repository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const initialValue = { income: 0, outcome: 0, total: 0 };

    const balance = transactions.reduce((acc, cur) => {
      acc.income += cur.type === 'income' ? cur.value : 0;
      acc.outcome += cur.type === 'outcome' ? cur.value : 0;

      return acc;
    }, initialValue);

    balance.total = balance.income - balance.outcome;

    return balance;
  }
}

export default TransactionsRepository;
