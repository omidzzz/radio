import dynamic from "next/dynamic";
import { getServerDictionary } from "@/lib/i18n/server";
import HeroSlider from "@/components/home/HeroSlider";
import HeroMobile from "@/components/home/HeroMobile";
import AchievementsOverview from "@/components/home/AchievementsOverview";
import Equipment from "@/components/home/Equipment";
import Precision from "@/components/home/Precision";
import CTA from "@/components/home/CTA";
import StickyBookingBar from "@/components/forms/StickyBookingBar";

const LatestPosts = dynamic(() => import("@/components/home/LatestPosts"), { ssr: true });

export const revalidate = 3600;

export default async function HomePage() {
  const { dict, locale } = await getServerDictionary();
  const isFa = locale === "fa";

  return (
    <div className="min-h-screen flex flex-col pt-18.5 min-[1220px]:pt-25">
      <div className="hidden sm:block">
        <HeroSlider dict={dict} isFa={isFa} />
      </div>
      <div className="block sm:hidden">
        <HeroMobile dict={dict} isFa={isFa} />
      </div>
      <div className="home-page-bridge home-page-bridge-soft" aria-hidden="true">
        <span />
      </div>
      <div className="home-page-sections">
        <AchievementsOverview isFa={isFa} />
        <LatestPosts dict={dict} isFa={isFa} />
        <Precision isFa={isFa} />
        <Equipment isFa={isFa} modalities={dict.home.modalities} />
        <CTA dict={dict} isFa={isFa} />
      </div>
      <StickyBookingBar label={dict.home.bookConsultation} isFa={isFa} />
    </div>
  );
}
