import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/common/ScrollToTop';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="anim-page-enter">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default HomePage;
