import FeaturesBg from "@/public/images/features-bg.png";
import FeaturesBg1 from "@/public/images/features-bg春.jpeg";
import FeaturesElement from "@/public/images/features-element.png";
import Image from "next/image";

export default function FeaturesBlocks() {
  return (
    <section className="relative">
      {/* Section background (needs .relative class on parent and next sibling elements) */}
      <div
        className="absolute inset-0 top-1/2 md:mt-24 lg:mt-0 bg-gray-900 pointer-events-none"
        aria-hidden="true"
      ></div>
      <div className="absolute left-0 right-0 bottom-0 m-auto w-px p-px h-20 bg-gray-200 transform translate-y-1/2"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 mb-4">Explore the solutions</h2>
            <p className="text-xl text-gray-600">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur excepteur sint occaecat
              cupidatat.
            </p>
          </div>

          {/* Items */}
          <div className="max-w-sm mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-6 items-start md:max-w-2xl lg:max-w-none">
            {/* 1st item */}
            <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl">
              <Image
                className="md:max-w-none mx-auto rounded"
                src={FeaturesBg}
                width={100}
                height="162"
                alt="Features bg"
              />
            </div>

            {/* 2nd item */}
            <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl">
              <Image
                className="md:max-w-none mx-auto rounded"
                src={FeaturesBg1}
                width={100}
                height="162"
                alt="Features bg"
              />
            </div>
            {/* 3rd item */}
            <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl">
              <Image
                className="md:max-w-none mx-auto rounded"
                src={FeaturesBg1}
                width={100}
                height="162"
                alt="Features bg"
              />
            </div>

            {/* 4th item */}
            <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl">
              <Image
                className="md:max-w-none mx-auto rounded"
                src={FeaturesBg}
                width={100}
                height="162"
                alt="Features bg"
              />
            </div>
            {/* 5th item */}
            <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl">
              <Image
                className="md:max-w-none mx-auto rounded"
                src={FeaturesBg}
                width={100}
                height="162"
                alt="Features bg"
              />
            </div>

            {/* 6th item */}
            <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl">
              <Image
                className="md:max-w-none mx-auto rounded"
                src={FeaturesBg}
                width={100}
                height="162"
                alt="Features bg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
