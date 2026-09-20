import type { Subject, Level } from './types';

/**
 * Subject catalogue relevant to students studying in Saudi Arabia.
 * The platform is an independent tutoring service and is not affiliated
 * with or endorsed by the Saudi Ministry of Education.
 */
export const SUBJECTS: Subject[] = [
  { id: 'math', nameEn: 'Mathematics', nameAr: 'الرياضيات', icon: 'sigma', levels: ['primary', 'intermediate', 'secondary'] },
  { id: 'arabic', nameEn: 'Arabic Language', nameAr: 'اللغة العربية', icon: 'book-open', levels: ['primary', 'intermediate', 'secondary'] },
  { id: 'english', nameEn: 'English Language', nameAr: 'اللغة الإنجليزية', icon: 'languages', levels: ['primary', 'intermediate', 'secondary'] },
  { id: 'physics', nameEn: 'Physics', nameAr: 'الفيزياء', icon: 'atom', levels: ['secondary'] },
  { id: 'chemistry', nameEn: 'Chemistry', nameAr: 'الكيمياء', icon: 'flask', levels: ['secondary'] },
  { id: 'biology', nameEn: 'Biology', nameAr: 'الأحياء', icon: 'dna', levels: ['secondary'] },
  { id: 'science', nameEn: 'Science', nameAr: 'العلوم', icon: 'microscope', levels: ['primary', 'intermediate'] },
  { id: 'cs', nameEn: 'Computer Science & Digital Skills', nameAr: 'الحاسب والمهارات الرقمية', icon: 'code', levels: ['intermediate', 'secondary'] },
  { id: 'social', nameEn: 'Social Studies', nameAr: 'الدراسات الاجتماعية', icon: 'globe', levels: ['primary', 'intermediate', 'secondary'] },
  { id: 'islamic', nameEn: 'Islamic Studies', nameAr: 'الدراسات الإسلامية', icon: 'moon-star', levels: ['primary', 'intermediate', 'secondary'] },
];

export const LEVELS: Level[] = ['primary', 'intermediate', 'secondary'];

export const GRADES_BY_LEVEL: Record<Level, number[]> = {
  primary: [1, 2, 3, 4, 5, 6],
  intermediate: [1, 2, 3],
  secondary: [1, 2, 3],
};

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}
