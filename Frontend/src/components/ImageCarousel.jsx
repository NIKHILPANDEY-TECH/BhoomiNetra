import { useEffect, useState } from "react"
import nechipuTunnel from "../assets/nechiphu-tunnel.jpeg"
import delhiMeerutRtts from "../assets/delhi-meerut-rrts.jpeg"
import mumbaiAhmedabadBulletTrain from "../assets/mumbai-ahmedabad-bullet-train.jpeg"
import sudarshanSetu from "../assets/sudarshan-setu.jpeg"
import bogibeelBridge from "../assets/bogibeel-bridge.jpeg"

const images = [
  {
    src: nechipuTunnel,
    title: "Nechiphu Tunnel, Arunachal Pradesh"
  },
  {
    src: delhiMeerutRtts,
    title: "Delhi–Meerut RRTS"
  },
  {
    src: mumbaiAhmedabadBulletTrain,
    title: "Mumbai–Ahmedabad High-Speed Rail"
  },
  {
    src: sudarshanSetu,
    title: "Sudarshan Setu, Gujarat"
  },
  {
    src: bogibeelBridge,
    title: "Bogibeel Bridge, Assam"
  }
]

function ImageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  const previousSlide = () => {
    setActiveIndex(
      (current) => (current - 1 + images.length) % images.length
    )
  }

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % images.length)
  }

  return (
    <section className="mb-10">
      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <img
          src={images[activeIndex].src}
          alt={images[activeIndex].title}
          className="block h-full w-full object-cover"
        />

        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-5 pb-10 pt-20">
          <h2 className="text-base font-semibold text-white sm:text-lg">
            {images[activeIndex].title}
          </h2>
        </div>

        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl text-text shadow-sm hover:bg-white"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next image"
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl text-text shadow-sm hover:bg-white"
        >
          ›
        </button>

        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={`Show ${image.title}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-200 ${
                index === activeIndex
                  ? "w-7 bg-white"
                  : "w-2.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ImageCarousel