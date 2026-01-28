'use client';

import { useActionState } from 'react';
import { updateConfig } from '@/app/admin/actions';

const initialState = {
    success: false,
    message: '',
    error: ''
};

export default function ConfigForm({ initialConfig }: { initialConfig: Record<string, string> }) {
    const [state, formAction, isPending] = useActionState(updateConfig, initialState);

    return (
        <div className="space-y-8">
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
                    <span>🔑</span> API Keys
                </h2>

                {state.success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm font-medium">
                        ✅ {state.message}
                    </div>
                )}
                {state.error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-medium">
                        ❌ {state.error}
                    </div>
                )}

                <form action={formAction} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">OpenAI API Key (GPT-4o-mini & Whisper)</label>
                        <input
                            name="OPENAI_API_KEY"
                            type="password"
                            defaultValue={initialConfig['OPENAI_API_KEY'] || ''}
                            placeholder="sk-..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">Google TTS Credentials (JSON Content)</label>
                        <textarea
                            name="GOOGLE_TTS_CREDENTIALS"
                            rows={6}
                            defaultValue={initialConfig['GOOGLE_TTS_CREDENTIALS'] || ''}
                            placeholder='{"type": "service_account", ...}'
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900"
                        />
                        <p className="text-xs text-gray-500">Paste the entire contents of your service-account.json here.</p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium shadow-md shadow-blue-500/20 transition-all hover:scale-105"
                        >
                            {isPending ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Instructions Section */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-lg space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-600">
                    <span>📘</span> How to get these Keys
                </h2>

                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                    <div className="space-y-2">
                        <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-1">A. OpenAI API Key (GPT-4o & Whisper)</h3>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-600 hover:underline">platform.openai.com</a>.</li>
                            <li>Login and click <strong>"Create new secret key"</strong>.</li>
                            <li>Copy the key (starts with <code>sk-...</code>).</li>
                            <li>Paste it into the OpenAI field above.</li>
                            <li className="text-xs text-gray-500 mt-1">Note: This single key works for both Text (GPT-4) and Audio (Whisper) models.</li>
                        </ol>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-1">B. Google Cloud Credentials</h3>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 hover:underline">Google Cloud Console</a>.</li>
                            <li>Create a project & Enable <strong>"Cloud Text-to-Speech API"</strong>.</li>
                            <li>Go to <strong>IAM & Admin {'>'} Service Accounts</strong>.</li>
                            <li>Create Key {'>'} JSON. Download the file.</li>
                            <li>Open the file and copy the <strong>entire content</strong>.</li>
                            <li>Paste it into the Google TTS field above.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
