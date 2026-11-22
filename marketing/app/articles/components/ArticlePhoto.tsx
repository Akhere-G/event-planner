import Image from "next/image";
import { PhotoCredit } from "../../components/PhotoCredit";
import type { GuideImage } from "../../destinations/types";

export function ArticlePhoto({
  image,
  caption,
}: {
  image: GuideImage;
  caption: string;
}) {
  return (
    <figure className="my-10">
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        sizes="(min-width: 768px) 704px, calc(100vw - 32px)"
        className="mx-auto h-auto max-h-[36rem] w-auto max-w-full rounded-2xl"
      />
      <figcaption className="mt-3 text-sm leading-6 text-text-secondary">
        {caption}
        <span className="mt-1 block text-xs">
          <PhotoCredit credit={image.credit} />
        </span>
      </figcaption>
    </figure>
  );
}
