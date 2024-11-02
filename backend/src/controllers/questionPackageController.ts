import { Request, Response } from 'express';
import QuestionPackage from '../models/QuestionPackage';

// Tüm soru paketlerini getir
export const getAllQuestionPackages = async (req: Request, res: Response) => {
  try {
    const questionPackages = await QuestionPackage.find();
    
    const questionPackagesWithTotalTime = questionPackages.map(pkg => {
      const totalSeconds = pkg.questions.reduce((acc, question) => acc + (question.minutes * 60) + question.seconds, 0);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const remainingSeconds = totalSeconds % 60;
      
      return {
        ...pkg.toObject(),
        totalTime: `${totalMinutes}m ${remainingSeconds}s`, // Toplam süreyi dakika ve saniye olarak birleştiriyoruz
        totalMinutes: totalMinutes + (remainingSeconds > 0 ? 1 : 0) // Toplam dakikayı hesapla
      };
    });

    res.json(questionPackagesWithTotalTime);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Yeni bir soru paketi oluştur
export const createQuestionPackage = async (req: Request, res: Response) => {
  const { title } = req.body;
  try {
    const newQuestionPackage = new QuestionPackage({ title, questions: [] });
    await newQuestionPackage.save();
    res.status(201).json(newQuestionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Soru paketini güncelle
export const updateQuestionPackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    const updatedQuestionPackage = await QuestionPackage.findByIdAndUpdate(id, { title }, { new: true });
    if (!updatedQuestionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }
    res.json(updatedQuestionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Soru paketini sil
export const deleteQuestionPackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedQuestionPackage = await QuestionPackage.findByIdAndDelete(id);
    if (!deletedQuestionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }
    res.json(deletedQuestionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Soru paketine ait soruları getir
export const getQuestionsByPackageId = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const questionPackage = await QuestionPackage.findById(id);
    if (!questionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }
    res.json(questionPackage.questions);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Soru paketine yeni bir soru ekle
export const addQuestionToPackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, minutes, seconds, order } = req.body;
  try {
    const questionPackage = await QuestionPackage.findById(id);
    if (!questionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }
    questionPackage.questions.push({ text, minutes, seconds, order });
    await questionPackage.save();
    res.json(questionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Soru sırasını güncelle
export const updateQuestionOrder = async (req: Request, res: Response) => {
  const { id } = req.params; // Soru paketi ID'si
  const { questions } = req.body; // Güncellenen soruların dizisi
  try {
    const questionPackage = await QuestionPackage.findById(id); // Soru paketini bul
    if (!questionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }

    // Soruların sırasını güncelle
    questionPackage.questions = questions; // Yeni sıralamayı ata
    await questionPackage.save(); // Güncellemeyi kaydet

    res.status(200).json({ message: 'Sıra başarıyla güncellendi', questionPackage });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Soru paketindeki bir soruyu güncelle
export const updateQuestionInPackage = async (req: Request, res: Response) => {
  const { id, questionId } = req.params;
  const { text, minutes, seconds, order } = req.body;
  try {
    const questionPackage = await QuestionPackage.findById(id);
    if (!questionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }
    const question = questionPackage.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    question.set({ text, minutes, seconds, order });
    await questionPackage.save();
    res.json(questionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Soru paketinden bir soruyu sil
export const deleteQuestionFromPackage = async (req: Request, res: Response) => {
  const { id, questionId } = req.params;
  try {
    const questionPackage = await QuestionPackage.findById(id);
    if (!questionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }
    questionPackage.questions.pull({ _id: questionId });
    await questionPackage.save();
    res.json(questionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
