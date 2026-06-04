import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const FeaturesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="metodologi" className="w-full py-20 bg-white scroll-mt-24 lg:scroll-mt-32">
      <div className="content-container">
        {/* Section Header */}
        <div className="mb-10">
          <h2 className="text-[28px] md:text-[34px] font-bold text-[#001734] mb-3">
            {t.featuresHeading}
          </h2>
          <p className="text-[#495057] text-[15px] leading-relaxed max-w-[700px]">
            {t.featuresSubheading}
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Pemetaan Berbasis Analisis (Spans 2 columns) */}
          <div className="md:col-span-2 bg-[#F1F5F9] rounded-[24px] p-6 lg:p-8 transition-transform duration-300 hover:scale-[1.01]">
            <div className="mb-5">
              <svg className="w-9 h-9 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 17l5-5 4 4 7-7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 9l4-4v4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 5l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5z" />
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-[#001734] mb-3">
              {t.card1Title}
            </h3>
            <p className="text-[#495057] text-[13.5px] leading-relaxed mb-3">
              {t.card1Desc1}
            </p>
            <p className="text-[#495057] text-[13.5px] leading-relaxed">
              {t.card1Desc2}
            </p>
          </div>

          {/* Card 2: Diagnostik Keahlian (Spans 1 column) */}
          <div className="md:col-span-1 bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col transition-transform duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="mb-5">
              <svg className="w-9 h-9 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.35-3.65a5 5 0 11-10 0 5 5 0 0110 0z" />
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-[#001734] mb-3">
              {t.card2Title}
            </h3>
            <p className="text-[#495057] text-[13.5px] leading-relaxed flex-grow mb-6">
              {t.card2Desc}
            </p>
            <Link to="/upload" className="inline-flex items-center text-[13px] font-bold text-[#001734] hover:opacity-70 transition-opacity">
              {t.card2Link}
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Card 3: Premium Opportunities (Spans 1 column) */}
          <div className="md:col-span-1 bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-gray-100 transition-transform duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="mb-5">
              <svg className="w-9 h-9 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a5 5 0 100-10 5 5 0 000 10z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.5 13.5l-1 8.5 4.5-2.5 4.5 2.5-1-8.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10.5l-1-1.5-1.5-.5 1-1-.5-1.5 1.5 1 1.5-1-.5 1.5 1 1-1.5.5z" />
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-[#001734] mb-3">
              {t.card3Title}
            </h3>
            <p className="text-[#495057] text-[13.5px] leading-relaxed">
              {t.card3Desc}
            </p>
          </div>

          {/* Card 4: Buka Potensi Penuh (Spans 2 columns) */}
          <div className="md:col-span-2 bg-gradient-to-r from-[#001734] to-[#002C59] rounded-[24px] p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-transform duration-300 hover:scale-[1.01] shadow-lg shadow-[#00173426]">
            <div>
              <h3 className="text-[24px] md:text-[28px] font-bold text-white mb-2">
                {t.card4Title}
              </h3>
              <p className="text-[#8BA3C0] text-[14px]">
                {t.card4Desc}
              </p>
            </div>
            <Link
              to="/login"
              className="bg-white text-[#001734] px-8 py-3.5 rounded-lg font-bold text-[15px] hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 transition-all duration-300 flex-shrink-0"
            >
              {t.card4Cta}
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
