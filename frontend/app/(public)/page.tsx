import VoiceAgent from "@/components/VoiceAgent";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center overflow-hidden bg-background selection:bg-primary/10">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="container px-4 md:px-6 z-10 flex flex-col items-center text-center gap-12 py-20">
        
        {/* Hero Content */}
        <div className="space-y-6 max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            <span className="tracking-wide uppercase text-xs">AI-Powered Dining Experience</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-foreground text-balance">
            Restaurant Reservations <br className="hidden md:block" />
            <span className="text-primary relative">
               Reimagined with Voice
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
            Experience the future of dining bookings. Simply speak to our intelligent AI assistant to secure your table instantly.
            <span className="block mt-2 font-bangla text-base text-gray-500">
              (আপনার টেবিল বুকিং করতে আমাদের AI অ্যাসিস্ট্যান্টের সাথে কথা বলুন)
            </span>
          </p>
        </div>

        {/* Action Area */}
        <div className="w-full max-w-md">
           <VoiceAgent />
        </div>

        {/* Tech Stack Badge */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground/60 font-mono">
          <span>Powered by OpenAI</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>FastAPI</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>Next.js 15</span>
        </div>
      </div>
    </div>
  );
}
