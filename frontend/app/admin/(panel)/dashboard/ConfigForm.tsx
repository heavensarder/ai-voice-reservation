'use client';

import { useActionState } from 'react';
import { updateConfig } from '@/app/admin/actions';
import { Key, Info, CheckCircle2, XCircle } from 'lucide-react';


interface ActionState {
    success?: boolean;
    message?: string;
    error?: string;
}


const DEFAULT_PROMPT = "";

const initialState: ActionState = {
    success: false,
    message: '',
    error: ''
};

export default function ConfigForm({ initialConfig }: { initialConfig: Record<string, string> }) {
    // @ts-ignore - useActionState type mismatch with server action return type is common in Next.js 15
    const [state, formAction, isPending] = useActionState(updateConfig, initialState);

    return (
        <div className="grid gap-6">
            <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <Key className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-card-foreground">API Credentials</h2>
                </div>

                {state.success && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        {state.message}
                    </div>
                )}
                {state.error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center gap-2 text-sm font-medium">
                        <XCircle className="w-5 h-5" />
                        {state.error}
                    </div>
                )}

                <form action={formAction} className="space-y-6">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-foreground/80">
                            OpenAI API Key
                            <span className="ml-2 text-xs text-muted-foreground font-normal">(GPT-4o-mini & Whisper)</span>
                        </label>
                        <input
                            name="OPENAI_API_KEY"
                            type="password"
                            defaultValue={initialConfig['OPENAI_API_KEY'] || ''}
                            placeholder="sk-..."
                            className="w-full px-4 py-3 bg-muted/50 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none font-mono text-sm transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-foreground/80">
                            Google Cloud Credentials
                            <span className="ml-2 text-xs text-muted-foreground font-normal">(TTS + Bengali Speech Recognition)</span>
                        </label>
                        <textarea
                            name="GOOGLE_TTS_CREDENTIALS"
                            rows={6}
                            defaultValue={initialConfig['GOOGLE_TTS_CREDENTIALS'] || ''}
                            placeholder='{"type": "service_account", ...}'
                            className="w-full px-4 py-3 bg-muted/50 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none font-mono text-sm transition-all resize-y"
                        />
                        <p className="text-xs text-muted-foreground">Paste the entire contents of your service-account.json here. Used for both Text-to-Speech and Bengali Speech Recognition.</p>
                    </div>



                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-foreground/80">
                            AI System Prompt
                            <span className="ml-2 text-xs text-muted-foreground font-normal">(Instructions for the AI)</span>
                        </label>
                        <textarea
                            name="SYSTEM_PROMPT"
                            rows={15}
                            defaultValue={initialConfig['SYSTEM_PROMPT'] || DEFAULT_PROMPT}
                            placeholder="You are a polite assistant..."
                            className="w-full px-4 py-3 bg-muted/50 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none font-mono text-sm transition-all resize-y"
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg font-medium shadow-sm transition-all active:scale-95"
                        >
                            {isPending ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Instructions Section */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-600">
                        <Info className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-card-foreground">Guide: Getting these Keys</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                             <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">1</span>
                             OpenAI API Key
                        </h3>
                        <ol className="list-decimal pl-5 space-y-2 text-muted-foreground marker:text-muted-foreground/50">
                            <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" className="text-primary hover:underline">platform.openai.com</a>.</li>
                            <li>Login and click <strong>"Create new secret key"</strong>.</li>
                            <li>Copy the key (starts with <code>sk-...</code>).</li>
                            <li>Paste it into the OpenAI field above.</li>
                        </ol>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                             <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">2</span>
                             Google Cloud Credentials
                        </h3>
                        <ol className="list-decimal pl-5 space-y-2 text-muted-foreground marker:text-muted-foreground/50">
                            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="text-primary hover:underline">Google Cloud Console</a>.</li>
                            <li>Create a project & Enable these APIs:
                                <ul className="list-disc pl-4 mt-1 space-y-1">
                                    <li><strong>"Cloud Text-to-Speech API"</strong></li>
                                    <li><strong>"Cloud Speech-to-Text API"</strong> (for Bengali recognition)</li>
                                </ul>
                            </li>
                            <li>Go to <strong>IAM & Admin &gt; Service Accounts</strong>.</li>
                            <li>Create Key &gt; JSON. Download the file.</li>
                            <li>Open the file, copy the <strong>entire content</strong>, and paste above.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
