import { getRepository } from 'typeorm';
import Category from '../models/Category';

class CreateCategoryService {
  public async execute(title: string): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    const category = await categoriesRepository.findOne({ title });

    if (category) {
      return category;
    }
    const newCategory = categoriesRepository.create({ title });

    await categoriesRepository.save(newCategory);

    return newCategory;
  }
}

export default CreateCategoryService;
