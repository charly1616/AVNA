/**
 * The student of the quiz is remembered in the browser, so they only have to
 * write their name once.
 */
const STORAGE_KEY = "teacher-portal:quiz-student";

export const readStudent = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const student = JSON.parse(stored);
    return student?.token ? student : null;
  } catch {
    return null;
  }
};

export const saveStudent = (student) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(student));
  } catch {
    // Storage is not available: the quiz still works without remembering it.
  }
};

export const clearStudent = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
};
