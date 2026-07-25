'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

const MODELS = [
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B (Free, Vision)', provider: 'Google', free: true, vision: true },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B (Free, Vision)', provider: 'Google', free: true, vision: true },
  { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'Nemotron Nano 12B VL (Free, Vision)', provider: 'Nvidia', free: true, vision: true },
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free, Text Only)', provider: 'Meta', free: true, vision: false },
  { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 (Free, Text Only)', provider: 'DeepSeek', free: true, vision: false },
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite ($0.10/M, Vision)', provider: 'Google', free: false, vision: true },
  { id: 'openai/gpt-4.1-nano', name: 'GPT-4.1 Nano ($0.10/M, Vision)', provider: 'OpenAI', free: false, vision: true },
  { id: 'meta-llama/llama-4-scout', name: 'Llama 4 Scout ($0.10/M, Vision)', provider: 'Meta', free: false, vision: true },
  { id: 'qwen/qwen3-vl-32b-instruct', name: 'Qwen 3 VL 32B ($0.10/M, Vision)', provider: 'Alibaba', free: false, vision: true },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini ($0.15/M, Vision)', provider: 'OpenAI', free: false, vision: true },
];

interface Settings {
  adminEmail: string;
  adminPassword: string;
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
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Settings>({
    adminEmail: 'admin@techpaint.com',
    adminPassword: '',
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
  const [llmTestResult, setLlmTestResult] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate password change
    if (newPassword || confirmPassword) {
      if (newPassword.length < 5) {
        setMessage({ type: 'error', text: 'Password must be at least 5 characters.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = { ...settings };
      if (newPassword) {
        payload.adminPassword = newPassword;
      } else {
        delete payload.adminPassword; // Don't overwrite with empty
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (newPassword) {
          setNewPassword('');
          setConfirmPassword('');
          setMessage({ type: 'success', text: 'Settings saved! You\'ll need to sign in again with your new password.' });
          // Force re-login after password change
          setTimeout(() => signOut({ callbackUrl: '/login' }), 2000);
        } else {
          setMessage({ type: 'success', text: 'Settings saved successfully!' });
        }
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
      const res = await fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'test' }) });
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
      const res = await fetch('/api/llm/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'AI connection successful!' });
        setLlmTestResult(data.response || '');
      } else {
        setMessage({ type: 'error', text: data.error || 'AI test failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'AI test failed — check your API key' });
    } finally {
      setTestingLLM(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-blue-600 text-lg">Loading…</div></main>;
  }

  const selectedModel = MODELS.find(m => m.id === settings.llmModel);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <form onSubmit={handleSave}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Configure your TechPaint account and AI</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          {/* LOGIN CREDENTIALS */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span>🔐</span> Login Credentials
            </h2>
            <p className="text-gray-500 text-sm mb-5">Change the email and password you use to sign in to TechPaint.</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Login Email</label>
                <input type="email" name="adminEmail" value={settings.adminEmail} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@techpaint.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" value="••••••••" disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••" minLength={5} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••" minLength={5} />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-700">
                <strong>Signed in as:</strong> {session?.user?.email || '—'} &nbsp;|&nbsp; 
                <strong>Default:</strong> admin@techpaint.com / admin123
              </p>
            </div>
          </section>

          {/* AI ESTIMATE GENERATION */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span>🤖</span> AI Estimate Generation
            </h2>
            <p className="text-gray-500 text-sm mb-5">The AI analyzes photos of rooms/walls and generates detailed painting estimates with pricing.</p>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-5">
              <p className="text-sm text-purple-800">
                <strong>Powered by OpenRouter</strong> — Free vision models analyze your project photos and estimate costs.
                Get your free API key at{' '}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">openrouter.ai/keys</a>
                {' '}— no credit card required.
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
                  {MODELS.filter(m => m.free && m.vision).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </optgroup>
                <optgroup label="🟢 Free — Text Only (no photo analysis)">
                  {MODELS.filter(m => m.free && !m.vision).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </optgroup>
                <optgroup label="💰 Cheap Paid — Photo Analysis ($0.10-0.15/M tokens)">
                  {MODELS.filter(m => !m.free && m.vision).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </optgroup>
              </select>
              {selectedModel && !selectedModel.vision && (
                <p className="text-xs text-amber-600 mt-1 font-medium">⚠️ This model cannot analyze photos. Choose a Vision model for image-based estimates.</p>
              )}
              {selectedModel && selectedModel.vision && selectedModel.free && (
                <p className="text-xs text-green-600 mt-1">✅ Free vision model — can analyze room/wall photos.</p>
              )}
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                <input type="number" name="llmTemperature" value={settings.llmTemperature}
                  onChange={e => setSettings(prev => ({ ...prev, llmTemperature: parseFloat(e.target.value) || 0.7 }))}
                  min="0" max="2" step="0.1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                <input type="number" name="llmMaxTokens" value={settings.llmMaxTokens}
                  onChange={e => setSettings(prev => ({ ...prev, llmMaxTokens: parseInt(e.target.value) || 4000 }))}
                  min="100" max="32000" step="100"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
            </div>
          </section>

          {/* EMAIL SETTINGS */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span>📧</span> Email Settings
            </h2>
            <p className="text-gray-500 text-sm mb-5">Configure SMTP to send estimate emails to customers.</p>

            <label className="flex items-center gap-3 mb-4">
              <input type="checkbox" checked={settings.emailEnabled}
                onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
              <span className="font-medium text-gray-700">Enable email</span>
            </label>

            {settings.emailEnabled && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                    <input type="text" name="smtpHost" value={settings.smtpHost} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="smtp.gmail.com" />
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="you@gmail.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                    <input type="password" name="smtpPass" value={settings.smtpPass} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="App password" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Address</label>
                  <input type="email" name="smtpFrom" value={settings.smtpFrom} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="noreply@yourdomain.com" />
                </div>
                <button type="button" onClick={handleTestEmail} disabled={testingEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {testingEmail ? 'Testing…' : 'Send Test Email'}
                </button>
              </div>
            )}
          </section>

          {/* NEXTAUTH SETTINGS */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span>🔑</span> NextAuth Config
            </h2>
            <p className="text-gray-500 text-sm mb-5">NextAuth session configuration. Only change if you know what you&apos;re doing.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NextAuth URL</label>
                <input type="url" name="nextAuthUrl" value={settings.nextAuthUrl} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://your-domain.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NextAuth Secret</label>
                <input type="password" name="nextAuthSecret" value={settings.nextAuthSecret} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="openssl rand -base64 32" />
              </div>
            </div>
          </section>

          <div className="sticky bottom-4 flex justify-end">
            <button type="submit" disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}