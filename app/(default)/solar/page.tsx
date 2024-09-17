import Banner from "@/components/banner";
import FeaturesBg from "@/public/images/features-bg.png";
// import FeaturesBg1 from "@/public/images/features-bg春.jpeg";
import FeaturesBg1 from "@/public/images/立春.jpeg";
import FeaturesBg10 from "@/public/images/夏至.jpeg";
import FeaturesBg11 from "@/public/images/小暑.jpeg";
import FeaturesBg12 from "@/public/images/大暑.jpeg";
import FeaturesBg13 from "@/public/images/立秋.jpeg";
import FeaturesBg14 from "@/public/images/处暑.jpeg";
import FeaturesBg15 from "@/public/images/白露.jpeg";
import FeaturesBg16 from "@/public/images/秋分.jpeg";
import FeaturesBg17 from "@/public/images/寒露.jpeg";
import FeaturesBg18 from "@/public/images/霜降.jpeg";
import FeaturesBg19 from "@/public/images/立冬.jpeg";
import FeaturesBg2 from "@/public/images/雨水.jpeg";
import FeaturesBg20 from "@/public/images/小雪.jpeg";
import FeaturesBg21 from "@/public/images/大雪.jpeg";
import FeaturesBg22 from "@/public/images/冬至.jpeg";
import FeaturesBg23 from "@/public/images/小寒.jpeg";
import FeaturesBg24 from "@/public/images/大寒.jpeg";
import FeaturesBg3 from "@/public/images/惊蛰.jpeg";
import FeaturesBg4 from "@/public/images/春分.jpeg";
import FeaturesBg5 from "@/public/images/清明.jpeg";
import FeaturesBg6 from "@/public/images/谷雨.jpeg";
import FeaturesBg7 from "@/public/images/立夏.jpeg";
import FeaturesBg8 from "@/public/images/小满.jpeg";
import FeaturesBg9 from "@/public/images/芒种.jpeg";
import Header from "@/components/ui/header";
import Image from "next/image";
import Link from "next/link";

const featuresBgArray = [
  FeaturesBg1,
  FeaturesBg2,
  FeaturesBg3,
  FeaturesBg4,
  FeaturesBg5,
  FeaturesBg6,
  FeaturesBg7,
  FeaturesBg8,
  FeaturesBg9,
  FeaturesBg10,
  FeaturesBg11,
  FeaturesBg12,
  FeaturesBg13,
  FeaturesBg14,
  FeaturesBg15,
  FeaturesBg16,
  FeaturesBg17,
  FeaturesBg18,
  FeaturesBg19,
  FeaturesBg20,
  FeaturesBg21,
  FeaturesBg22,
  FeaturesBg23,
  FeaturesBg24,
];

const solarTerms = [
  "立春",
  "雨水",
  "惊蛰",
  "春分",
  "清明",
  "谷雨",
  "立夏",
  "小满",
  "芒种",
  "夏至",
  "小暑",
  "大暑",
  "立秋",
  "处暑",
  "白露",
  "秋分",
  "寒露",
  "霜降",
  "立冬",
  "小雪",
  "大雪",
  "冬至",
  "小寒",
  "大寒",
];

export default function FeaturesBlocks() {
  return (
    <>
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
              <h2 className="h2 mb-4">随笔：写给生活的二十四节气</h2>
              <p className="text-xl text-gray-600">
                走过的日子，还是太快了---修文
              </p>
            </div>

            {/* Items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {/* 1st row */}
              {Array.from({ length: 24 }, (_, i) => (
                <Link href={`/solar/${i + 1}`} key={i}>
                  <div className="relative flex flex-col items-center p-6 bg-white rounded shadow-xl cursor-pointer ">
                    <Image
                      className=" rounded cursor-pointer hover:scale-125 object-fill w-full h-full"
                      src={featuresBgArray[i]}
                      width={280}
                      height={400}
                      alt="Features bg"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
