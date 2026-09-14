/**
 * env.js – הגדרות סביבה גלובליות לקליינט.
 *
 * כל הכתובות/קונפיגורציה שעשויים להשתנות בין סביבות (פיתוח/הפקה)
 * מרוכזות כאן במקום אחד, כדי שלא יהיו כתובות "קשיחות" (hardcoded)
 * מפוזרות בקבצים שונים.
 *
 * ניתן (ומומלץ) להחליף את הערך הקבוע בקריאה למשתנה סביבה של Vite, למשל:
 *   export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
 */

export const API_BASE_URL = 'http://localhost:3000';
