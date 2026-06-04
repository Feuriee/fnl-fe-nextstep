import React, { createContext, useState, useContext } from 'react';

export type Language = 'en' | 'id';

export interface TranslationDict {
  // Navbar
  navLogin: string;
  navUploadCV: string;

  // Hero Section
  heroBadge: string;
  heroHeadingLine1: string;
  heroHeadingLine2: string;
  heroDescriptionText: string;
  heroCta: string;
  heroFloatingTitle: string;
  heroFloatingSubtitle: string;
  heroFloatingAlt: string;

  // Features Section
  featuresHeading: string;
  featuresSubheading: string;
  card1Title: string;
  card1Desc1: string;
  card1Desc2: string;
  card2Title: string;
  card2Desc: string;
  card2Link: string;
  card3Title: string;
  card3Desc: string;
  card4Title: string;
  card4Desc: string;
  card4Cta: string;

  // Footer
  footerRights: string;
}

const translations: Record<Language, TranslationDict> = {
  en: {
    navLogin: "Log In",
    navUploadCV: "Upload CV",
    heroBadge: "Introducing Digital Platform V1.0",
    heroHeadingLine1: "Future-ready work",
    heroHeadingLine2: "& Economy",
    heroDescriptionText: "The smart path to your future career. \"An Adaptive Job Recommendation Platform Powered by CV Analysis and Job Market Trends\"",
    heroCta: "Explore Methodology",
    heroFloatingTitle: "Job Trends 2026",
    heroFloatingSubtitle: "AI & Machine Learning",
    heroFloatingAlt: "Work analysis",
    featuresHeading: "Designed to",
    featuresSubheading: "Maximize Your Career Potential. Through CV analysis and adaptive job market trends, we ensure that every recommended job opportunity perfectly aligns with your expertise.",
    card1Title: "CV Analysis-Based Mapping",
    card1Desc1: "We map your skills against industry demand, identifying gaps and the right opportunities to accelerate your journey toward leadership.",
    card1Desc2: "Powered by machine learning algorithms, our system is constantly updated as job market trends evolve in Indonesia and globally.",
    card2Title: "CV Upload Simulation",
    card2Desc: "Try uploading your CV without login to see how our system works!",
    card2Link: "Try Now",
    card3Title: "Premium Opportunities",
    card3Desc: "Find access to exclusive positions that are very rarely available in public job vacancies, definitely perfect for your NextStep.",
    card4Title: "Unlock Your CV's Full Potential!",
    card4Desc: "Log in / Register your account now",
    card4Cta: "Log in / Register",
    footerRights: "© 2026 NextStep Capstone Project. All rights reserved."
  },
  id: {
    navLogin: "Masuk",
    navUploadCV: "Unggah CV",
    heroBadge: "Memperkenalkan Platform Digital V1.0",
    heroHeadingLine1: "Future-ready work",
    heroHeadingLine2: "& Economy",
    heroDescriptionText: "Jalur cerdas menuju karier masa depan anda. “ Platfrom Rekomendasi Pekerjaan dan Adaptif Berbasis Analisis CV/Data dan Tren Pasar Kerja”",
    heroCta: "Lihat Metodologi",
    heroFloatingTitle: "Tren Pekerjaan 2026",
    heroFloatingSubtitle: "AI & Machine Learning",
    heroFloatingAlt: "Work analysis",
    featuresHeading: "Dirancang untuk",
    featuresSubheading: "Maksimalkan Potensi Karier Anda. Melalui analisis CV dan tren pasar kerja yang adaptif, kami memastikan setiap peluang kerja yang direkomendasikan benar-benar sesuai dengan keahlian Anda.",
    card1Title: "Pemetaan Berbasis Analisis CV Anda",
    card1Desc1: "Kami memetakan keterampilan Anda terhadap permintaan industri, mengidentifikasi kesenjangan dan peluang yang tepat untuk mempercepat perjalanan Anda menuju kepemimpinan.",
    card1Desc2: "Dengan algoritma pembelajaran mesin, sistem kami terus diperbarui seiring perubahan tren pasar kerja di Indonesia dan global.",
    card2Title: "Simulasi Upload CV",
    card2Desc: "Coba Simulasi Upload CV Anda tanpa login untuk melihat bagaimana sistem kami bekerja!",
    card2Link: "Coba Sekarang",
    card3Title: "Kesempatan Premium",
    card3Desc: "Temukan akses ke posisi-posisi eksklusif yang jarang banget ada di lowongan kerja Publik, pastinya pas banget sama NextStep kamu.",
    card4Title: "Buka Potensi Penuh CV-mu!",
    card4Desc: "Log in / Daftar akun mu sekarang",
    card4Cta: "Log in / Daftar",
    footerRights: "© 2026 NextStep Capstone Project. All rights reserved."
  }
};

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  t: TranslationDict;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial language from localStorage or default to 'en' (as requested: "full english dulu")
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('nextstep_lang');
    return (saved === 'en' || saved === 'id') ? saved : 'en';
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'id' : 'en';
      localStorage.setItem('nextstep_lang', next);
      return next;
    });
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
