import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError(
        `Type field should have values 'income' or 'outcome'.`,
      );
    }

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError(
        'Cannot create outcome transaction with value higher than available total',
      );
    }

    const createCategoryService = new CreateCategoryService();

    const categoryObject = await createCategoryService.execute(category);

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryObject.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
