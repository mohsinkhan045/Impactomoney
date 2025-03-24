import Image from "next/image";
import {Button} from "../../../@/components/ui/button"
import {useRouter} from "next/navigation"
const HeroSection = () => {
  const router = useRouter()
  return (
    <div className="container mx-auto w-full max-w-full">
    <section className="relative w-full h-[400px] md:h-[800px] bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <Image
        src="/images.jpg" 
        alt="Helping Hands"
        layout="fill"
        objectFit="cover"
        priority={true}
        className="opacity-70"
      />
      
      {/* Overlay Text and Button */}
      <div className="relative z-10 text-center text-white p-4 md:p-8 mb-4">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Fund <span className="block md:inline">Help Others</span>
        </h1>
        <p className="text-lg md:text-xl mt-4">Make a difference by supporting those in need.</p>
        <Button
         onClick={()=>{router.push("./register")}}
         className="mt-8 bg-BgColor text-white p-6 px-6 rounded-full text-lg font-semibold hover:bg-orange-500 transition-opacity">
         
            Join ImpactoMoney
      
        </Button>
      </div>
      
      {/* Optional Gradient Overlay for Darker Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-40"></div>
    </section>
    </div>
  );
};

export default HeroSection;
