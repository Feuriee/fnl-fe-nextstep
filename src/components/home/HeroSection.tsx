import heroImage from '../../assets/home-main-page.webp';
import { PixelBlast } from '../ui/PixelBlast';
import { useLanguage } from '../../context/LanguageContext';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="w-full min-h-[85vh] flex items-center py-12 lg:py-20 overflow-hidden relative">
      {/* PixelBlast Background Full Width */}
      <div 
        className="absolute inset-0 w-full h-full z-0 opacity-100"
        style={{
          maskImage: 'radial-gradient(ellipse at center, transparent 40%, black 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 40%, black 75%)'
        }}
      >
        <PixelBlast 
          variant="square"
          pixelSize={4}
          color="#001734"
          patternScale={2}
          patternDensity={1}
          pixelSizeJitter={0}
          enableRipples={true}
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={false}
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.5}
          edgeFade={0.25}
          transparent={true}
        />
      </div>

      <div className="content-container flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10 pointer-events-none">

        {/* ====== LEFT SIDE ====== */}
        <div className="flex-1 w-full anim-slide-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#E9ECEF] rounded-full px-3 py-1.5 lg:py-1 mb-8 hover:bg-[#E2E6EA] transition-colors cursor-default pointer-events-auto">
            <span className="w-1.5 h-1.5 bg-[#001734] rounded-full anim-pulse-glow"></span>
            <span className="text-[12px] lg:text-[11px] font-semibold text-[#495057]">
              {t.heroBadge}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-[40px] sm:text-[48px] lg:text-[58px] font-bold text-[#001734] leading-[1.1] mb-6 pointer-events-auto inline-block">
            {t.heroHeadingLine1} <br />
            {t.heroHeadingLine2}
          </h1>

          {/* Description */}
          <p className="text-[#495057] text-[16px] lg:text-[15px] leading-relaxed mb-8 lg:mb-10 max-w-[500px] pointer-events-auto">
            <span className="font-bold text-[#001734]">NextStep:</span> {t.heroDescriptionText}
          </p>

          {/* CTA Button - Single Button as per new design */}
          <div className="flex items-center pointer-events-auto">
            <a
              href="#metodologi"
              onClick={(e) => {
                e.preventDefault();
                const elem = document.getElementById("metodologi");
                if (elem) {
                  // Scroll to the element minus navbar height (80px)
                  const offset = 80;
                  const bodyRect = document.body.getBoundingClientRect().top;
                  const elementRect = elem.getBoundingClientRect().top;
                  const elementPosition = elementRect - bodyRect;
                  const offsetPosition = elementPosition - offset;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                  });
                }
              }}
              className="group bg-gradient-to-r from-[#001734] to-[#002C59] text-white px-8 lg:px-10 py-3.5 rounded-lg font-bold text-[16px] lg:text-[15px] flex items-center gap-3 transition-all duration-300 shadow-lg shadow-[#00173426] hover:opacity-95 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,23,52,0.2)] active:translate-y-0"
            >
              {t.heroCta}
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* ====== RIGHT SIDE ====== */}
        <div className="flex-1 w-full flex justify-center lg:justify-end mt-12 lg:mt-0 anim-slide-right delay-200 relative">
          
          <div className="relative w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[360px] group pointer-events-auto">
            {/* Image Container - Narrower and Taller */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 aspect-[3.2/4] transition-transform duration-500 group-hover:scale-[1.02]">
              <img
                src={heroImage}
                alt={t.heroFloatingAlt}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Card - Adjusted for narrower image */}
            <div className="absolute -bottom-6 left-4 right-4 lg:-left-16 lg:right-auto bg-white rounded-lg shadow-2xl p-4 w-auto lg:w-[260px] border border-gray-50 anim-fade-up anim-float delay-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#E7F0FF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#001734]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#001734]">{t.heroFloatingTitle}</p>
                  <p className="text-[10px] text-[#6C757D]">{t.heroFloatingSubtitle}</p>
                </div>
              </div>
              <div className="w-full bg-[#E9ECEF] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-[#001734] h-full rounded-full"
                  style={{ width: '70%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;








