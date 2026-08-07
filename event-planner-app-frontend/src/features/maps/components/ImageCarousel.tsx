import { useRef, useState } from "react";

export function ImageCarousel({
  photos,
  name,
}: {
  photos: { url: string }[];
  name: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMultiple = photos.length > 1;

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, offsetWidth } = scrollRef.current;
      const newIndex = Math.round((scrollLeft * 1.15) / offsetWidth) + 1;
      setCurrentIndex(newIndex);
    }
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory ${
          isMultiple ? "scrollbar-visible" : "scrollbar-hide"
        }`}
      >
        {photos.map((photo, index) => (
          <div
            key={index}
            className={`h-60 shrink-0 snap-center ${isMultiple ? "w-[85%]" : "w-full"}`}
          >
            <img
              className="rounded-md w-full h-full object-cover shadow-sm"
              src={photo.url}
              alt={name}
            />
          </div>
        ))}
      </div>
      {isMultiple && (
        <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full font-bold">
          {currentIndex} / {photos.length}
        </div>
      )}
    </div>
  );
}
