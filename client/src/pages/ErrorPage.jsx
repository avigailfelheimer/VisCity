import { Link } from 'react-router-dom';
import '../styles/pages/error-page.css';

export default function ErrorPage({
    code = 404,
    title,
    message
}) {

    const errorConfig = {
        404: {
            emoji: '🧭',
            title: 'איבדנו את הדרך...',
            message: 'העמוד שחיפשת כנראה יצא לטיול עצמאי.'
        },
        403: {
            emoji: '🚫',
            title: 'אין כניסה למסלול הזה',
            message: 'נראה שאין לך הרשאה להיכנס לכאן.'
        },
        500: {
            emoji: '🏕️',
            title: 'המחנה שלנו קצת התבלגן',
            message: 'משהו השתבש בצד שלנו. אנחנו כבר מסדרים את התרמילים.'
        }
    };

    const current =
        errorConfig[code] || errorConfig[404];

    return (
        <div className="error-page">

            <div className="mountain mountain-1"></div>
            <div className="mountain mountain-2"></div>

            <div className="error-card">

                <div className="emoji">
                    {current.emoji}
                </div>

                <h1>{code}</h1>

                <h2>
                    {title || current.title}
                </h2>

                <p>
                    {message || current.message}
                </p>

                <Link
                    to="/"
                    className="home-button"
                >
                    🏠 חזרה לעמוד הראשי
                </Link>

            </div>

        </div>
    );
}