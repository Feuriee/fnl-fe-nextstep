import { useState, useEffect } from 'react'
import { SpiralAnimation } from '../components/ui/SpiralAnimation'

const SplashPage = ({ onFinish }: { onFinish: () => void }) => {
  const [textVisible, setTextVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Partikel animasi dulu ~3.5 detik, baru text muncul
    const showTimer = setTimeout(() => {
      setTextVisible(true)
    }, 3500)

    // Auto fade-out setelah 5.0 detik
    const navTimer = setTimeout(() => {
      setFadeOut(true)
    }, 5000)

    // Masuk ke HomePage setelah 5.7 detik
    const finishTimer = setTimeout(() => {
      onFinish()
    }, 5700)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(navTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinish])

  return (
    <div
      className={`fixed inset-0 w-full h-full overflow-hidden bg-white z-[9999] transition-opacity duration-700 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Spiral Animation Background */}
      <div className="absolute inset-0">
        <SpiralAnimation bgColor="white" particleColor="#001734" />
      </div>


      {/* NextStep Text — muncul di dalam lingkaran setelah partikel memenuhi area */}
      <div
        className={`
          absolute inset-0 flex flex-col items-center justify-center z-10 px-4 text-center select-none
          transition-all duration-1000 ease-out
          ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        `}
      >
        <h1
          className="text-[34px] sm:text-[44px] md:text-[56px] font-bold text-[#001734] tracking-tight"
          style={{
            textShadow:
              '0 0 60px rgba(255,255,255,1), 0 0 100px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.8)',
          }}
        >
          NextStep
        </h1>
        <p
          className={`
            text-[#001734] text-[11px] sm:text-[13px] md:text-[16px] tracking-[0.1em] sm:tracking-[0.15em] uppercase font-light mt-3
            transition-all duration-1000 delay-500
            ${textVisible ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
          style={{ textShadow: '0 0 30px rgba(255,255,255,1), 0 0 60px rgba(255,255,255,0.8)' }}
        >
          Jalur cerdas menuju karier
        </p>
      </div>
    </div>
  )
}

export default SplashPage
