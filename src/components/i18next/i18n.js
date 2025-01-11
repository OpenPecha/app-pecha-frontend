import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const resources = {
    en: {
        translation: {
            browseLibrary: "Browse the Library",
            explore: "Explore",
            wayOfBoddhisattva: "The Way of the Boddhisattva",
            liturgy: "Liturgy",
            prayersAndRituals: "Prayers and rituals",
            buddhavacana: "Buddhavacana",
            livingLibrary: "A Living Library of Buddhist Text",
            livingLibraryDescription:
                "Pecha connects users to Buddhist scriptures in various languages. Search a verse to explore its origins, interpretations, and related texts. Engage with the community by sharing insights and learning from others through sheets and topics.",
            learnMore: "Learn More ›",
            texts: "Texts",
            topics: "Topics",
            community: "Community",
            searchPlaceholder: "Search",
            signup: "Sign Up",
            help: "Help",
            login: "Log In",
            emailAddress: "Email address",
            forgotPassword: "Forgot password?",
            createAccount: "Create new account",
            loginToPecha: "Login to Pecha",
            firstName: "First Name",
            lastName: "Last Name",
            password: "Password",
            select: "Select",
            monastic: "Monastic",
            teacher: "Teacher",
            student: "Student",
            educated: "Educated* / Dr / Prof",
            regularUser: "Regular User",
            alreadyHaveAccount: "Already have an account?",
            required: "Required",
            invalidEmail: "Invalid email address",
            invalidPassword: "Invalid password",
            confirmPassword: "Confirm password",
            passwordsDoNotMatch: "Passwords do not match",
            go: "Go",
            logout: "Logout",
            socialLogins: "Continue with Google/Apple",
            profile:"Profile",
            resetPassword:"Reset password",
        },
    },
    bo: {
        translation: {
            browseLibrary: "དཔེ་མཛོད་འཚོལ་ཞིབ།",
            explore: "འཚོལ་ཞིབ།",
            wayOfBoddhisattva: "བྱང་ཆུབ་སེམས་པའི་ལམ།",
            liturgy: "མདོ་རིགས།",
            prayersAndRituals: "སྨོན་ལམ་དང་ཆོ་ག",
            buddhavacana: "བུད་དྷ་དབུ་དང་ནང་རབས།",
            livingLibrary: "དགོན་འཛིན་གྱི་དཔེ་མཛོད།",
            livingLibraryDescription: "བློ་མངའ་ཞིབ་འཚོལ་དང་ལག་རྟེན་དང་ཆེས་སྦྱོང་དང་འབྲེལ་བ་ཞིག་ཤིག་སེམས་བསྐྱེད་སྦྱོང་རིམ་དང་རྗེས་མ་སྤྱོད།",
            learnMore: "དེ་ལས་མངོན་བརྗེད།",
            texts: "ཡི་གེ།",
            topics: "གཞི་གནས།",
            community: "ཚོགས་འདུ།",
            searchPlaceholder: "འཚོལ།",
            login: "ཐོ་འགོད།",
            signup: "ཐོ་བཀོད།",
            help: "སྒྲུང་བཅོས།",
            emailAddress: "རྐྱེན་ཁང་།",
            forgotPassword: "བསྐུར་ལམ་ཤོག་ནང་བཞིན་དགོད།",
            createAccount: "ཐོ་བཀོད།",
            loginToPecha: "ཐོ་འགོད་ནང་བཞིན་དགོད།",
            firstName: "དབང་མི",
            lastName: "རྒྱལ་མཐའ།",
            password: "སང་བ་མཁའ་ཡོད།",
            select: "དོན་བཞིན།",
            monastic: "དཔེ་སྐུལ།",
            teacher: "བློ་བཞིན།",
            student: "དངོས་དོན།",
            educated: "དཔེ་མཛོད།",
            regularUser: "དཔེ་མཛོད་གློད་པ།",
            alreadyHaveAccount: "གནང་བའི་འཉམ་ཞིབ།",
            required: "bo - Required",
            invalidEmail: "bo - Invalid email address",
            invalidPassword: "bo - Invalid password",
            confirmPassword: "bo - Confirm password",
            passwordsDoNotMatch: "bo - Passwords do not match",
            go: "bo - Go",
            logout: "bo - Logout",
            socialLogins: "bo - Continue with Google/Apple",
            profile:"bo - Profile",
            resetPassword: "bo - Reset password"

        },
    },
};
const fontConfig = {
    en: {
        title: {
            fontSize: "14px",
            fontFamily: "Roboto",
        },
        subtitle: {
            fontSize: "12px",
            fontFamily: "Roboto",
        },
        content: {
            fontSize: "9px",
            fontFamily: "Roboto",
        },
        subcontent: {
            fontSize: "7px",
            fontFamily: "Roboto",
        },
    },
    bo: {
        title: {
            fontSize: "14px",
            fontFamily: "title-font",
        },
        subtitle: {
            fontSize: "12px",
            fontFamily: "sub-title-font",
        },
        content: {
            fontSize: "9px",
            fontFamily: "content-font",
        },
        subcontent: {
            fontSize: "7px",
            fontFamily: "sub-content-font",
        },
    },
};
const setFontVariables = (language) => {
    const root = document.getElementById("root");
    const fonts = fontConfig[language] || fontConfig["en"];
    Object.entries(fonts).forEach(([key, styles]) => {
        root?.style.setProperty(`--${key}-font-size`, styles.fontSize);
        root?.style.setProperty(`--${key}-font-family`, styles.fontFamily);
    });

};
const defaultLanguage = import.meta.env.VITE_DEFAULT_LANGUAGE || "en";

i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem("language") || defaultLanguage,
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});
setFontVariables(i18n.language);
i18n.on("languageChanged", (language) => {
    setFontVariables(language);
});

