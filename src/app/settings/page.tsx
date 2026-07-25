'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Vision-capable models: free ones first, then cheap paid ones as upgrade
const MODELS = [
  // FREE vision models
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B (Free, Vision)', provider: 'Google', free: true, vision: true },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B (Free, Vision)', provider: 'Google', free: true, vision: true },
  { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'Nemotron Nano 12B VL (Free, Vision)', provider: 'Nvidia', free: true, vision: true },
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free, Text Only)', provider: 'Meta', free: true, vision: false },
  { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 (Free, Text Only)', provider: 'DeepSeek', free: true, vision: false },
  // CHEAP vision models (upgrades)
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite ($0.10/M, Vision)', provider: 'Google', free: false, vision: true },
  { id: 'openai/gpt-4.1-nano', name: 'GPT-4.1 Nano ($0.10/M, Vision)', provider: 'OpenAI', free: false, vision: true },
  { id: 'meta-llama/llama-4-scout', name: 'Llama 4 Scout ($0.10/M, Vision)', provider: 'Meta', free: false, vision: true },
  { id: 'qwen/qwen3-vl-32b-instruct', name: 'Qwen 3 VL 32B ($0.10/M, Vision)', provider: 'Alibaba', free: false, vision: true },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini ($0.15/M, Vision)', provider: 'OpenAI', free: false, vision: true },
];

interface Settings {
  emailEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  nextAuthUrl: string;
  nextAuthSecret: string;
  llmProvider: string;
  llmModel: string;
  llmApiKey: string;
  llmTemperature: number;
  llmMaxTokens: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    emailEnabled: false,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
    nextAuthUrl: '',
    nextAuthSecret: '',
    llmProvider: 'openrouter',
    llmModel: 'google/gemma-4-31b-it:free',
    llmApiKey: '',
    llmTemperature: 0.7,
    llmMaxTokens: 4000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingLLM, setTestingLLM] = useState(false);
  const [llmTestResult, setLlmTestResult] = useState<string>('');
  const router = useRouter();

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
      setMessage({ type: 'error', text: 'Please fill in all SMTP settings first' });
      return;
    }
    setTestingEmail(true);
    setMessage(null);
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Test email sent successfully!' });
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to send test email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test email' });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestLLM = async () => {
    if (!settings.llmApiKey) {
      setMessage({ type: 'error', text: 'Please enter your OpenRouter API key first. Get one free at openrouter.ai' });
      return;
    }
    setTestingLLM(true);
    setMessage(null);
    setLlmTestResult('');
    try {
      const res = await fetch('/api/llm/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'LLM connection successful!' });
        setLlmTestResult(data.response || '');
      } else {
        setMessage({ type: 'error', text: data.error || 'LLM test failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'LLM test failed — check your API key' });
    } finally {
      setTestingLLM(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading settings…</div>
      </main>
    );
  }

  const selectedModel = MODELS.find(m => m.id === settings.llmModel);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <form onSubmit={handleSave} id="settings-form">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Configure your TechPaint settings</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {/* Authentication */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span>Authentication</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NextAuth URL</label>
                <input type="url" name="nextAuthUrl" value={settings.nextAuthUrl} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://your-domain.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NextAuth Secret</label>
                <input type="password" name="nextAuthSecret" value={settings.nextAuthSecret} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Generate with: openssl rand -base64 32" />
              </div>
            </div>
          </section>

          {/* Email Settings */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email Settings</span>
            </h2>
            <div className="mb-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={settings.emailEnabled}
                  onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                <span className="font-medium text-gray-700">Enable email notifications</span>
              </label>
            </div>
            {settings.emailEnabled && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                    <input type="text" name="smtpHost" value={settings.smtpHost} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                    <input type="number" name="smtpPort" value={settings.smtpPort}
                      onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 587 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
                    <input type="text" name="smtpUser" value={settings.smtpUser} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your-email@gmail.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                    <input type="password" name="smtpPass" value={settings.smtpPass} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="App password or SMTP password" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Email Address</label>
                  <input type="email" name="smtpFrom" value={settings.smtpFrom} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="noreply@yourdomain.com" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={handleTestEmail} disabled={testingEmail}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {testingEmail ? 'Testing…' : 'Send Test Email'}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* AI Estimate Generation */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l.707.707M21 12h-1M4 12H4 12H3m15.364 6.364l-.707.707M21 12h1m-9 9a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>AI Estimate Generation</span>
            </h2>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-800">
                <strong>Powered by OpenRouter</strong> — The AI analyzes your project photos and description to generate accurate painting estimates.
                Get your free API key at{' '}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">openrouter.ai/keys</a>
                {' '}— no credit card required for free models.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <div className="relative">
                <input type="password" name="llmApiKey" value={settings.llmApiKey} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-20 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="sk-or-v1-..." />
                <button type="button" onClick={handleTestLLM} disabled={testingLLM || !settings.llmApiKey}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  {testingLLM ? 'Testing…' : 'Test'}
                </button>
              </div>
              {llmTestResult && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border">
                  <span className="font-medium text-green-700">AI Response:</span> {llmTestResult}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <select name="llmModel" value={settings.llmModel} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                <optgroup label="🟢 Free — Photo Analysis">
                  {MODELS.filter(m => m.free && m.vision).map(m => (
                    <option key={m.id} value={m.id}>{m.provider} — {m.name}</option>
                  ))}
                </optgroup>
                <optgroup label="🟢 Free — Text Only (no photo analysis)">
                  {MODELS.filter(m => m.free && !m.vision).map(m => (
                    <option key={m.id} value={m.id}>{m.provider} — {m.name}</option>
                  ))}
                </optgroup>
                <optgroup label="💰 Cheap Paid — Photo Analysis">
                  {MODELS.filter(m => !m.free && m.vision).map(m => (
                    <option key={m.id} value={m.id}>{m.provider} — {m.name}</option>
                  ))}
                </optgroup>
              </select>
              {selectedModel && !selectedModel.vision && (
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  ⚠️ This model cannot analyze photos. Choose a Vision model above for image-based estimates.
                </p>
              )}
              {selectedModel && selectedModel.free && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ Free model — can analyze project photos for estimate generation.
                </p>
              )}
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                <input type="number" name="llmTemperature" value={settings.llmTemperature}
                  onChange={(e) => setSettings({ ...settings, llmTemperature: parseFloat(e.target.value) || 0.7 })}
                  min="0" max="2" step="0.1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                <input type="number" name="llmMaxTokens" value={settings.llmMaxTokens}
                  onChange={(e) => setSettings({ ...settings, llmMaxTokens: parseInt(e.target.value) || 4000 })}
                  min="100" max="32000" step="100"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
            </div>
          </section>

          <div className="mt-8 flex justify-end">
            <button type="submit" disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}