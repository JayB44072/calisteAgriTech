import { useState, useRef, useEffect } from 'react';
import { callGemini, AGRONOME_SYSTEM_PROMPT, analyzeParcelle, generateCultureCalendar } from '../../lib/gemini';
import { useParcelles } from '../../hooks/useParcelles';
import { useSensorData } from '../../hooks/useSensorData';
import { useCalendrier } from '../../hooks/useCalendrier';
import type { ChatMessage } from '../../types/database';
import {
  Bot,
  Send,
  Loader2,
  MapPin,
  Calendar,
  Sparkles,
  X,
  CheckCircle,
  Circle,
  Trash2,
  Sprout,
} from 'lucide-react';

interface AITabProps {
  userId: string;
  onNavigateToParcelle: (id: string) => void;
}

type AISubTab = 'chat' | 'analyzer' | 'calendar';

export function AITab({ userId, onNavigateToParcelle }: AITabProps) {
  const [subTab, setSubTab] = useState<AISubTab>('chat');

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">Conseils IA</h2>

      {/* Sub-tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
        {[
          { id: 'chat' as AISubTab, label: 'Assistant Agronome', icon: Bot },
          { id: 'analyzer' as AISubTab, label: 'Analyse Parcelle', icon: Sparkles },
          { id: 'calendar' as AISubTab, label: 'Calendrier IA', icon: Calendar },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              subTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {subTab === 'chat' && <ChatBot userId={userId} />}
      {subTab === 'analyzer' && <ParcelleAnalyzer userId={userId} onNavigateToParcelle={onNavigateToParcelle} />}
      {subTab === 'calendar' && <CalendarGenerator userId={userId} />}
    </div>
  );
}

function ChatBot({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis CalisteAgriTech AI, votre assistant agronome. Posez-moi vos questions sur vos cultures, l\'irrigation, les maladies ou les pratiques agricoles au Cameroun.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMessage: ChatMessage = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await callGemini(userMessage.content, AGRONOME_SYSTEM_PROMPT, history);
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Erreur: ${err.message}`, timestamp: new Date() }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
        <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm">Assistant Agronome IA</h3>
          <p className="text-xs text-gray-400 dark:text-slate-400">Expert en agriculture camerounaise</p>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="ml-auto p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          title="Nouvelle conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary-600 dark:bg-primary-600 text-white dark:text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyse en cours...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-700">
        <form
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Posez votre question agricole..."
            className="flex-1 border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-50"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function ParcelleAnalyzer({ userId, onNavigateToParcelle }: { userId: string; onNavigateToParcelle: (id: string) => void }) {
  const { parcelles } = useParcelles(userId);
  const [selectedId, setSelectedId] = useState<string>('');
  const { sensorData } = useSensorData(selectedId || undefined);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!selectedId || sensorData.length === 0) return;
    const p = parcelles.find(x => x.id === selectedId)!;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeParcelle(p.nom, p.culture, p.zone, sensorData);
      setAnalysis(result);
    } catch (err: any) {
      setAnalysis(`Erreur: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" /> Analyser une parcelle avec l'IA
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedId}
            onChange={e => { setSelectedId(e.target.value); setAnalysis(null); }}
            className="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-50"
          >
            <option value="">Sélectionnez une parcelle</option>
            {parcelles.map(p => <option key={p.id} value={p.id}>{p.nom} - {p.culture}</option>)}
          </select>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !selectedId || sensorData.length === 0}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {analyzing ? 'Analyse...' : 'Analyser'}
          </button>
        </div>

        {selectedId && sensorData.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-3">Aucune donnée capteur pour cette parcelle. Simulez des données d'abord.</p>
        )}

        {analysis && (
          <div className="mt-4 p-4 bg-primary-50/50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-lg whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300 animate-slide-up">
            {analysis}
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarGenerator({ userId }: { userId: string }) {
  const { parcelles } = useParcelles(userId);
  const { events, addEvents, toggleComplete, deleteEvent } = useCalendrier(userId);
  const [culture, setCulture] = useState('Tomates');
  const [datePlantation, setDatePlantation] = useState(new Date().toISOString().split('T')[0]);
  const [region, setRegion] = useState('Centre');
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const CULTURES = ['Tomates', 'Piment', 'Maïs', 'Manioc', 'Haricot', 'Arachide', 'Cacao', 'Café', 'Plantain', 'Igname'];
  const ZONES = ['Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest', 'Est', 'Sud', 'Nord', 'Extrême-Nord', 'Adamaoua'];

  const handleGenerate = async () => {
    setGenerating(true);
    setSuccess(false);
    try {
      const calendar = await generateCultureCalendar(culture, datePlantation, region);
      if (calendar.length > 0 && parcelles.length > 0) {
        const eventsToAdd = calendar.map(c => ({
          parcelle_id: parcelles[0].id,
          culture,
          etape: c.etape,
          date_debut: c.date_debut,
          date_fin: c.date_fin,
          description: c.description,
        }));
        await addEvents(eventsToAdd);
        setSuccess(true);
      }
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-500" /> Générer un calendrier culturel IA
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Culture</label>
            <select
              value={culture}
              onChange={e => setCulture(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-50"
            >
              {CULTURES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Date de plantation</label>
            <input
              type="date"
              value={datePlantation}
              onChange={e => setDatePlantation(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Région</label>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-50"
            >
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || parcelles.length === 0}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? 'Génération IA...' : 'Générer le calendrier'}
        </button>

        {parcelles.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">Ajoutez d'abord une parcelle pour utiliser cette fonctionnalité.</p>
        )}

        {success && (
          <p className="text-xs text-primary-600 dark:text-primary-400 mt-2 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Calendrier généré et enregistré avec succès !
          </p>
        )}
      </div>

      {/* Calendar events list */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-sm flex items-center gap-2">
            <Sprout className="w-4 h-4 text-primary-500" /> Mon Calendrier Culturel
          </h3>
        </div>
        {events.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-slate-400">Aucun événement. Générez un calendrier IA ci-dessus.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {events.map(event => (
              <div key={event.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <button
                  onClick={() => toggleComplete(event.id, !event.complete)}
                  className="flex-shrink-0"
                >
                  {event.complete
                    ? <CheckCircle className="w-5 h-5 text-primary-500" />
                    : <Circle className="w-5 h-5 text-gray-300 dark:text-slate-600 hover:text-primary-400 dark:hover:text-primary-400" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${event.complete ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-900 dark:text-slate-50'}`}>
                    {event.etape}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-400">
                    {event.culture} | {event.date_debut} - {event.date_fin}
                  </p>
                  {event.description && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{event.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="p-1.5 text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
