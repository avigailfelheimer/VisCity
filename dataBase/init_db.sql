----------------------------------------------------
-- SAMPLE DATA
----------------------------------------------------
INSERT INTO users (user_id, username, email, user_type) VALUES
(1, 'admin_yossi', 'yossi@admin.com', 'admin'),
(2, 'admin_ronit', 'ronit@admin.com', 'admin'),
(3, 'user_dan', 'dan@user.com', 'user'),
(4, 'user_tali', 'tali@user.com', 'user'),
(5, 'user_avi', 'avi@user.com', 'user'),
(6, 'user_michal', 'michal@user.com', 'user'),
(7, 'user_guy', 'guy@user.com', 'user');

-- כל המשתמשים מקבלים את אותה סיסמה לצורך בדיקות: 123456
INSERT INTO credentials (user_id, password_hash) VALUES
(1, '$2b$10$QhkpRuV9EgFl56lxyLupmO5jdMwTt0csYYYSSiKisrNy3gNdzilvK'),
(2, '$2b$10$QhkpRuV9EgFl56lxyLupmO5jdMwTt0csYYYSSiKisrNy3gNdzilvK'),
(3, '$2b$10$QhkpRuV9EgFl56lxyLupmO5jdMwTt0csYYYSSiKisrNy3gNdzilvK'),
(4, '$2b$10$QhkpRuV9EgFl56lxyLupmO5jdMwTt0csYYYSSiKisrNy3gNdzilvK'),
(5, '$2b$10$QhkpRuV9EgFl56lxyLupmO5jdMwTt0csYYYSSiKisrNy3gNdzilvK'),
(6, '$2b$10$QhkpRuV9EgFl56lxyLupmO5jdMwTt0csYYYSSiKisrNy3gNdzilvK'),
(7, '$2b$10$QhkpRuV9EgFl56lxyLupmO5jdMwTt0csYYYSSiKisrNy3gNdzilvK');

INSERT INTO places (
    place_id, created_by, name, description, categories,
    latitude, longitude, opening_hours, is_approved
) VALUES 
(1, 1, 'שמורת טבע תל דן', 'מסלול מים יפהפה בצפון עם צמחייה עבותה וזרימה שופעת כל השנה.', '["טבע", "מים", "משפחתי"]', 33.2490, 35.6520, '{"sunday":"08:00-17:00","monday":"08:00-17:00"}', 1), 
(2, 1, 'אגמון החולה', 'פארק טבע ענק לצפרות. אפשר להשכיר אופניים ורכבי גולף ולהקיף את האגם.', '["טבע", "משפחתי", "אופניים", "תצפית"]', 33.1070, 35.6099, '{"sunday":"06:30-17:00","friday":"06:30-15:00"}', 1), 
(3, 2, 'ראש הנקרה', 'נקרות ימיות מרהיבות בקצה הצפוני של ישראל, ירידה ברכבל לתצפית על הגלים.', '["טבע", "אטרקציה", "תצפית"]', 33.0941, 35.1044, '{"sunday":"09:00-16:00"}', 1), 
(4, 2, 'פארק הכרמל', 'פארק לאומי ירוק המציע מגוון מסלולי הליכה, פינות פיקניק ותצפיות נוף אל הים.', '["טבע", "פיקניק", "הליכה"]', 32.7483, 35.0210, NULL, 1), 
(5, 3, 'פארק הירקון', 'הריאה הירוקה של גוש דן. שבילי הליכה, מדשאות ענק ואפשרות לשייט בסירות.', '["עירוני", "פיקניק", "אופניים"]', 32.0988, 34.8020, '{"open_24_7":true}', 1), 
(6, 1, 'שמורת טבע עין גדי - נחל דוד', 'נווה מדבר קסום באזור ים המלח, מסלול הליכה העובר בין מפלים קטנים ויעלים.', '["טבע", "מדבר", "מים", "משפחתי"]', 31.4682, 35.3895, '{"sunday":"08:00-16:00"}', 1), 
(7, 2, 'מכתש רמון - מרכז המבקרים', 'תצפית מרהיבה על המכתש הגדול בעולם. אפשרויות למסלולי הליכה גיאולוגיים במדבר.', '["טבע", "מדבר", "תצפית"]', 30.6025, 34.8010, '{"sunday":"08:00-16:00"}', 1), 
(8, 1, 'פארק תמנע', 'פארק גיאולוגי ייחודי עם תצורות סלע מרהיבות כמו עמודי שלמה, ואגם מלאכותי.', '["טבע", "מדבר", "היסטוריה"]', 29.7876, 34.9882, '{"sunday":"08:00-16:00"}', 1), 
(9, 4, 'הקניון האדום', 'מסלול הליכה קצר וחווייתי בהרי אילת בתוך קניון צר עשוי אבן חול אדמדמה.', '["טבע", "מדבר", "משפחתי"]', 29.6826, 34.8814, '{"open_24_7":true}', 1), 
(10, 2, 'המצפה התת ימי באילת', 'אטרקציה מדהימה להכרת החי הימי של הים האדום, ללא צורך להירטב.', '["אטרקציה", "משפחתי", "טבע", "תצפית"]', 29.5048, 34.9174, '{"sunday":"09:00-16:00"}', 1);
INSERT INTO favorite_folders (folder_id, user_id, name) VALUES
(1, 3, 'טיולים מתוכננים לצפון'),
(2, 3, 'מסלולי מדבר'),
(3, 4, 'אטרקציות עם הילדים'),
(4, 5, 'פארקים לפיקניק');

----------------------------------------------------
-- 5. FAVORITES (שמירות של מקומות - חלק בתיקייה וחלק לא)
----------------------------------------------------
INSERT INTO favorites (user_id, place_id, folder_id, order_index) VALUES
(3, 1, 1, 0), -- דן שמר את תל דן בתיקיית צפון
(3, 2, 1, 1), -- דן שמר את החולה בתיקיית צפון
(3, 7, 2, 0), -- דן שמר את מכתש רמון בתיקיית מדבר
(4, 10, 3, 0), -- טלי שמרה את המצפה בתיקיית אטרקציות
(4, 3, 3, 1), -- טלי שמרה את ראש הנקרה בתיקיית אטרקציות
(5, 5, 4, 0), -- אבי שמר את הירקון בתיקיית פיקניק
(5, 4, 4, 1), -- אבי שמר את פארק הכרמל בתיקיית פיקניק
(6, 9, NULL, 0); -- מיכל שמרה את הקניון האדום (ללא תיקייה)

----------------------------------------------------
-- 6. REVIEWS (תגובות ודירוגים)
----------------------------------------------------
INSERT INTO reviews (review_id, user_id, place_id, rating, comment) VALUES
(1, 3, 1, 5, 'מקום מושלם! הילדים נהנו מאוד מההליכה במים הקרירים.'),
(2, 4, 1, 4, 'המסלול מדהים, אבל היה קצת עמוס בסוף השבוע.'),
(3, 5, 5, 5, 'פארק גדול ונקי, תמיד כיף לעשות שם פיקניק משפחתי.'),
(4, 6, 7, 5, 'נוף עוצר נשימה. מומלץ מאוד להגיע לקראת השקיעה.'),
(5, 7, 8, 4, 'פארק תמנע פשוט מרשים, סלעים בצורות מיוחדות. שווה ביקור.'),
(6, 3, 10, 5, 'חוויה יוצאת דופן להכיר את שונית האלמוגים מקרוב.'),
(7, 4, 6, 4, 'העלייה למפל דוד נוחה ומסודרת, ראינו הרבה יעלים בדרך.');

----------------------------------------------------
-- 7. REVIEW HELPFUL (לייקים/דיסלייקים לתגובות)
----------------------------------------------------
INSERT INTO review_helpful (review_id, user_id, vote) VALUES
(1, 4, 'up'), -- טלי אהבה את התגובה של דן על תל דן
(1, 5, 'up'), -- אבי גם אהב את התגובה של דן
(3, 1, 'up'), -- מנהל יוסי אהב את התגובה על פארק הירקון
(4, 2, 'up'), -- מנהלת רונית אהבה את התגובה על המכתש
(2, 6, 'down'); -- מיכל לא הסכימה עם התגובה השנייה

----------------------------------------------------
-- 8. MEDIA (תמונות - הוספתי קישורים גנריים כהכנה שתוכלי להעלות משלך)
----------------------------------------------------
INSERT INTO media (media_id, place_id, user_id, media_type, media_url) VALUES
(1, 3, 2, 'image', 'http://localhost:3000/uploads/rosh-hanikra1.jpg'),
(2, 3, 2, 'image', 'http://localhost:3000/uploads/rosh_hanikra_2.jpg'),
(3, 3, 2, 'image', 'http://localhost:3000/uploads/rosh_hanikra_3.jpg'),
(4, 5, 3, 'image', 'http://localhost:3000/uploads/park_hayarkon_1.jpg'),
(5, 5, 3, 'image', 'http://localhost:3000/uploads/park_hayarkon_2.jpg'),
(6, 7, 2, 'image', 'http://localhost:3000/uploads/ramon_crater_1.jpg'),
(7, 7, 2, 'image', 'http://localhost:3000/uploads/ramon_crater_2.jpg'),
(8, 7, 2, 'image', 'http://localhost:3000/uploads/ramon_crater_3.jpg'),
(9, 6, 1, 'image', 'http://localhost:3000/uploads/ein_gedy_1.jpg'),
(10, 10, 2, 'image', 'http://localhost:3000/uploads/Fish_in_eilat_underwater_observatory_1.jpg'),
(11, 10, 2, 'image', 'http://localhost:3000/uploads/Fish_in_eilat_underwater_observatory_2.jpg'),
(12, 6, 1, 'image', 'http://localhost:3000/uploads/ein_gedy_2.jpg'),
(13, 9, 4, 'image', 'http://localhost:3000/uploads/the_red_canyon.jpg'),
(14, 4, 2, 'image', 'http://localhost:3000/uploads/carmel_park.jpg'),
(15, 2, 1, 'image', 'http://localhost:3000/uploads/hula_lake_gruidae.jpg'),
(16, 8, 1, 'image', 'http://localhost:3000/uploads/Timna_Park.jpg');