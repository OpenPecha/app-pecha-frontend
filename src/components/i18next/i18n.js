import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // NOTE :  can be removed

const resources = {
    en: {
        translation: {
            "Email": "Email",
            "First Name": "First Name",
            "Last Name": "Last Name",
            "Password": "Password",
            "Confirm Password": "Confirm Password",
            "Register": "Register",
            "Passwords do not match": "Passwords do not match"
        }
    },
    // Add other languages here
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;