import FeaturesBg from "@/public/images/features-bg.png";
import FeaturesBg1 from "@/public/images/features-bg春.jpeg";
import Image from "next/image";
import Link from "next/link";

export default function FeaturesBlocks() {
  return (
    <section className="relative">
      {/* Section background */}
      <div
        className="absolute inset-0 top-1/2 md:mt-24 lg:mt-0 bg-gray-900 pointer-events-none"
        aria-hidden="true"
      ></div>
      <div className="absolute left-0 right-0 bottom-0 m-auto w-px p-px h-20 bg-gray-200 transform translate-y-1/2"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 mb-4">写给生活的二十四节气</h2>
            <p className="text-xl text-gray-600">走过的日子，还是太快了。</p>
          </div>

          {/* Items */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* 1st row */}
            {Array.from({ length: 24 }, (_, i) => (
              <Link href="/blog" key={i}>
                <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl cursor-pointer ">
                  <Image
                    className="md:max-w-none mx-auto rounded cursor-pointer hover:scale-125"
                    src={i % 2 === 0 ? FeaturesBg1 : FeaturesBg1}
                    width={130}
                    height="162"
                    alt="Features bg"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
