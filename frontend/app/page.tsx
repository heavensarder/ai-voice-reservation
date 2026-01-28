import VoiceAgent from "@/components/VoiceAgent";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 text-gray-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-gray-100">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm flex flex-col gap-8">

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 pb-2">
            AI রেস্টুরেন্ট রিজার্ভেশন
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto font-medium">
            আপনার টেবিল বুকিং করতে আমাদের AI অ্যাসিস্ট্যান্টের সাথে কথা বলুন।
            (Talk to our AI assistant to book your table)
          </p>
        </div>

        <VoiceAgent />

        <div className="text-gray-500 text-xs mt-8">
          Powered by FastAPI, WebSocket, OpenAI & Google TTS
        </div>
      </div>
    </main>
  );
}
