
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-[#F8FAFC] py-16 border-t border-gray-100">
      <div className="content-container flex flex-col items-center justify-center text-center">
        <div className="mb-6">
          <h2 className="text-[22px] font-bold text-[#001734]">NextStep</h2>
        </div>
        <p className="text-[#64748B] text-[14px]">
          {t.footerRights}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
