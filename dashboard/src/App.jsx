import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, TrendingUp, AlertTriangle, CheckCircle2, Terminal, Info, Clock, Menu, Search, Bell, User, X, FileText, Server, Shield, LogOut, Settings, CreditCard, HelpCircle, ChevronRight, Mail, Lock, Eye, EyeOff, RefreshCw, PauseCircle, PlayCircle, Moon, Sun } from 'lucide-react';

/* --- MODALS & OVERLAYS --- */

/* Login Screen Component */
const LoginScreen = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            if (username.length > 0 && password.length > 0) {
                onLogin(username);
            } else {
                setError('Invalid credentials. Please enter any username/password.');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a] text-white">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a] animate-pulse-slow"></div>
            </div>

            <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative z-10 animate-fade-in-up">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-brand-primary rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-primary/30">
                        <Zap size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">System Portal</h1>
                    <p className="text-brand-neutral/60 text-sm mt-2">Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-brand-neutral/80 mb-1.5 ml-1">Operator ID</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-neutral/50 group-focus-within:text-brand-primary transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm placeholder-white/20 text-white transition-all"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-brand-neutral/80 mb-1.5 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-neutral/50 group-focus-within:text-brand-primary transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm placeholder-white/20 text-white transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-brand-primary/20"
                    >
                        {loading ? (
                            <RefreshCw className="animate-spin w-5 h-5" />
                        ) : (
                            <span className="flex items-center gap-2">Authenticate <ChevronRight size={16} /></span>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="#" className="text-xs text-brand-neutral/40 hover:text-brand-primary transition-colors">Forgot Validation Token?</a>
                </div>
            </div>
        </div>
    );
};

/* Documentation Modal */
const DocumentationModal = ({ onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                        <FileText className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-brand-secondary">System Documentation</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Classification: INTERNAL USE ONLY</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                    <X size={20} />
                </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 prose prose-sm max-w-none text-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                        <h3 className="flex items-center gap-2 text-blue-800 font-bold mb-2"><Server size={16} /> Architecture</h3>
                        <p className="text-xs leading-relaxed">Microservices-based architecture utilizing Kafka for high-throughput event streaming. Data persistence layer managed via MongoDB with distributed sharding enabled.</p>
                    </div>
                    <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                        <h3 className="flex items-center gap-2 text-purple-800 font-bold mb-2"><Zap size={16} /> Real-time Analysis</h3>
                        <p className="text-xs leading-relaxed">Integrated sentiment analysis engine processing incoming payloads with &lt; 50ms latency. Automated anomaly detection for critical signal identification.</p>
                    </div>
                    <div className="p-4 bg-green-50/50 rounded-lg border border-green-100">
                        <h3 className="flex items-center gap-2 text-green-800 font-bold mb-2"><Shield size={16} /> Security Protocol</h3>
                        <p className="text-xs leading-relaxed">End-to-end encryption for all data ingress points. Role-based access control (RBAC) enforced at the API gateway level.</p>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-brand-secondary mb-4 border-b border-gray-100 pb-2">1. Overview</h3>
                <p className="mb-6">
                    The <strong>Distributed Event Aggregator (v2.0.4)</strong> is a centralized infrastructural application designed to ingest, process, and visualize event streams from disparate sources. This dashboard provides a real-time operational picture (COP) for system administrators and compliance officers.
                </p>

                <h3 className="text-lg font-bold text-brand-secondary mb-4 border-b border-gray-100 pb-2">2. Operational Procedures</h3>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                    <li><strong>Monitoring:</strong> Operators should monitor the <em>Real-time Analysis</em> chart for sudden deviations in the sentiment index.</li>
                    <li><strong>Incident Response:</strong> Negative sentiment spikes (&gt;15% variance) require immediate investigation via the <em>Incoming Event Feed</em>..</li>
                    <li><strong>Data Integrity:</strong> Ensure the <em>System Status</em> indicator remains <span className="text-green-600 font-bold">ONLINE</span>. If connectivity is lost, refer to the troubleshooting manual (Error Code: KAFKA_CONN_REFUSED).</li>
                </ul>

                <h3 className="text-lg font-bold text-brand-secondary mb-4 border-b border-gray-100 pb-2">3. API Specification</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs mb-4">
                    {`POST /ingest
Content-Type: application/json
{
  "source": "string",
  "payload": {
    "text": "string",
    "user_id": "integer",
    "meta": "string"
  }
}`}
                </pre>
                <p className="text-xs text-gray-500 italic">
                    * Rate limiting is enforced at 10,000 requests/second per IP.
                </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded hover:bg-brand-primary/90 transition-colors shadow-sm">
                    Acknowledge & Close
                </button>
            </div>
        </div>
    </div>
);

/* Search Modal */
const SearchModal = ({ onClose, events }) => {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (query.length > 1) {
            setIsSearching(true);
            const timer = setTimeout(() => {
                const lowerQuery = query.toLowerCase();
                const filtered = events.filter(e =>
                    e.source.toLowerCase().includes(lowerQuery) ||
                    (e.payload?.text && e.payload.text.toLowerCase().includes(lowerQuery)) ||
                    (e.payload?.meta && e.payload.meta.toLowerCase().includes(lowerQuery))
                ).slice(0, 10);
                setResults(filtered);
                setIsSearching(false);
            }, 300); // Simulated network delay for realism
            return () => clearTimeout(timer);
        } else {
            setResults([]);
        }
    }, [query, events]);

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 transform transition-all">
                <div className="flex items-center p-4 border-b border-gray-100">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search logs, event IDs, or user metadata..."
                        className="flex-1 text-lg outline-none text-gray-700 placeholder-gray-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="text-xs text-brand-neutral border border-gray-200 rounded px-2 py-1">ESC</div>
                </div>
                <div className="bg-gray-50/50 p-2 min-h-[300px]">
                    {query.length === 0 ? (
                        <div className="text-center text-gray-400 mt-20">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Type to search across {events.length} locally buffered events...</p>
                            <p className="text-xs text-gray-300 mt-2">(Global search requires Elastic connection)</p>
                        </div>
                    ) : isSearching ? (
                        <div className="flex flex-col items-center justify-center mt-20 space-y-3">
                            <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-500 animate-pulse">Querying distributed shards...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-1">
                            <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Top Results ({results.length})</div>
                            {results.map((e, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 hover:bg-white hover:shadow-sm rounded-lg cursor-pointer transition-all border border-transparent hover:border-gray-100 group">
                                    <div className="p-2 bg-brand-primary/5 text-brand-primary rounded group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                        <Terminal size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between">
                                            <div className="text-sm font-medium text-gray-700 group-hover:text-brand-primary truncate">{e.source}</div>
                                            <div className="text-xs text-gray-400">{new Date(e.timestamp).toLocaleTimeString()}</div>
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">{e.payload?.text || "No Content"}</div>
                                    </div>
                                    <ChevronRight className="ml-auto w-4 h-4 text-gray-300 group-hover:text-brand-primary" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 mt-20">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No matching events found in local buffer.</p>
                        </div>
                    )}
                </div>
                <div className="p-2 bg-gray-100 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between px-4">
                    <span><strong>Enter</strong> to select</span>
                    <span>Search powered by ElasticSearch Cluster v8.2</span>
                </div>
            </div>
        </div>
    );
};

/* Settings Modal */
const SettingsModal = ({ onClose, settings, setSettings }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-slide-up">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-brand-secondary flex items-center gap-2">
                        <Settings size={20} /> System Configuration
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Feed Controls */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Stream</h3>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${settings.feedPaused ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                    {settings.feedPaused ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-700">Live Ingest</div>
                                    <div className="text-xs text-gray-500">{settings.feedPaused ? 'Stream paused' : 'Processing incoming events'}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSettings(s => ({ ...s, feedPaused: !s.feedPaused }))}
                                className={`px-3 py-1.5 text-xs font-bold rounded shadow-sm border ${settings.feedPaused ? 'bg-white border-gray-300 text-gray-700' : 'bg-white border-gray-300 text-gray-700'}`}
                            >
                                {settings.feedPaused ? 'Resume' : 'Pause'}
                            </button>
                        </div>
                    </div>

                    {/* Simulation Controls */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Interface</h3>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell size={18} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Desktop Notifications</span>
                            </div>
                            <div
                                onClick={() => setSettings(s => ({ ...s, notifications: !s.notifications }))}
                                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${settings.notifications ? 'bg-brand-primary' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${settings.notifications ? 'translate-x-5' : ''}`} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                            <div className="flex items-center gap-3">
                                <Moon size={18} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Dark Mode (Beta)</span>
                            </div>
                            <div className="w-11 h-6 flex items-center rounded-full p-1 bg-gray-200">
                                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
                    <button onClick={onClose} className="px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded shadow-sm hover:bg-brand-primary/90">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

/* User Profile Modal */
const UserProfileModal = ({ onClose, onSignOut, onOpenSettings, user }) => (
    <div className="absolute top-16 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 animate-slide-up transform origin-top-right">
        <div className="p-6 border-b border-gray-100 bg-brand-secondary text-white rounded-t-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={100} /></div>
            <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-xl font-bold">
                    {user.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 className="font-bold">{user}</h3>
                    <p className="text-xs text-blue-200">System Operator</p>
                </div>
            </div>
        </div>
        <div className="p-2">
            <div className="space-y-1">
                <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors">
                    <User size={16} className="text-gray-400" /> My Profile
                </button>
                <button onClick={onOpenSettings} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors">
                    <Settings size={16} className="text-gray-400" /> Account Settings
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors">
                    <HelpCircle size={16} className="text-gray-400" /> Help Center
                </button>
            </div>
            <div className="my-2 border-t border-gray-100"></div>
            <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 p-3 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm text-gray-600 transition-colors group"
            >
                <LogOut size={16} className="text-gray-400 group-hover:text-red-500" /> Sign Out
            </button>
        </div>
    </div>
);

/* Notifications Panel */
const NotificationsDropdown = ({ onClose }) => (
    <div className="absolute top-16 right-20 z-50 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 animate-slide-up transform origin-top-right">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 text-sm">Notifications</h3>
            <span className="text-[10px] bg-brand-primary text-white px-2 py-0.5 rounded-full">3 New</span>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
            <div className="p-4 border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors relative">
                <div className="absolute top-4 left-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="pl-6">
                    <h4 className="text-sm font-semibold text-gray-800">System Maintenance</h4>
                    <p className="text-xs text-gray-500 mt-1">Scheduled downtime for kafka-broker-2 upgrade at 03:00 UTC.</p>
                    <p className="text-[10px] text-gray-400 mt-2">2 hours ago</p>
                </div>
            </div>
            <div className="p-4 border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors relative">
                <div className="absolute top-4 left-4 w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="pl-6">
                    <h4 className="text-sm font-semibold text-gray-800">High Latency Alert</h4>
                    <p className="text-xs text-gray-500 mt-1">Ingest latency exceeded 200ms threshold in eu-central-1.</p>
                    <p className="text-[10px] text-gray-400 mt-2">5 hours ago</p>
                </div>
            </div>
            <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors text-center">
                <p className="text-xs text-brand-primary font-medium hover:underline">View All Notifications</p>
            </div>
        </div>
    </div>
);

const Card = ({ title, value, icon: Icon, trend }) => (
    <div className="stats-card group">
        <div className="flex justify-between items-start">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-brand-neutral">{title}</h3>
            <div className="stats-icon-wrapper"><Icon className="w-5 h-5" /></div>
        </div>
        <div>
            <div className="text-3xl font-bold tracking-tight text-brand-secondary mb-1 group-hover:text-brand-primary transition-colors">{value}</div>
            <div className="text-[10px] font-medium text-brand-neutral flex items-center gap-1"><Info size={10} /> {trend}</div>
        </div>
    </div>
);

function App() {
    /* App State */
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [settings, setSettings] = useState({
        feedPaused: false,
        notifications: true,
        darkMode: false // Reserved for future
    });

    /* Data State */
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ total: 0, avgScore: 0, positive: 0, negative: 0 });
    const [connected, setConnected] = useState(false);

    /* UI State */
    const [showDocs, setShowDocs] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    const eventsEndRef = useRef(null);

    /* Event Source Logic */
    useEffect(() => {
        if (!isLoggedIn) return; // Don't connect if not logged in

        const eventSource = new EventSource('/api/events/stream');
        eventSource.onopen = () => setConnected(true);
        eventSource.onmessage = (event) => {
            // Check if feed is paused by settings
            if (settings.feedPaused) return;

            try {
                const newEvent = JSON.parse(event.data);
                setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).slice(-100)); // Increased buffer for search
            } catch (e) {
                console.error('Parse error', e);
            }
        };
        eventSource.onerror = () => {
            if (eventSource.readyState === 2) setConnected(false);
            eventSource.close();
        };
        return () => eventSource.close();
    }, [isLoggedIn, settings.feedPaused]);

    useEffect(() => {
        if (events.length === 0) return;
        const total = events.length;
        const sumScore = events.reduce((acc, curr) => acc + (curr.analysis?.score || 0), 0);
        const avgScore = (total > 0 ? (sumScore / total) : 0).toFixed(2);
        const positive = events.filter(e => e.analysis?.sentiment === 'Positive').length;
        const negative = events.filter(e => e.analysis?.sentiment === 'Negative').length;
        setStats({ total, avgScore, positive, negative });

        // Only auto-scroll if close to bottom or enforced
        eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [events]);

    const handleLogin = (username) => {
        setCurrentUser(username);
        setIsLoggedIn(true);
    };

    const handleSignOut = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setEvents([]); // Clear sensitive data
        setShowProfile(false);
    };

    const chartData = events.map(e => ({
        time: new Date(e.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        score: e.analysis?.score || 0,
    }));

    const handleNavClick = (tab) => {
        setActiveTab(tab);
        if (tab !== 'dashboard') {
            setTimeout(() => alert(`Module [${tab.toUpperCase()}] is loaded. (Simulation)`), 100);
        }
    };

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="dashboard-container" onClick={() => {
            if (showProfile) setShowProfile(false);
            if (showNotifications) setShowNotifications(false);
        }}>
            {/* OVERLAYS */}
            {showDocs && <DocumentationModal onClose={() => setShowDocs(false)} />}
            {showSearch && <SearchModal onClose={() => setShowSearch(false)} events={events} />}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} settings={settings} setSettings={setSettings} />}

            {/* Top Bar */}
            <div className="top-bar">
                <div className="flex gap-4">
                    <span>Infrastructural Monitoring System</span>
                    <span className="opacity-50">|</span>
                    <span>v2.0.4-stable</span>
                </div>
                <div className="flex gap-4">
                    <a href="https://lolz.live/members/10214819/" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:text-gray-200 transition-colors">Support</a>
                    <span onClick={() => setShowDocs(true)} className="cursor-pointer hover:text-gray-200 transition-colors">Documentation</span>
                </div>
            </div>

            {/* Main Header */}
            <header className="main-header relative">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-primary text-white p-1.5 rounded"><Zap size={20} fill="currentColor" /></div>
                        <div>
                            <h1 className="text-lg font-bold text-brand-secondary leading-none">EVENT ANALYTICS</h1>
                            <p className="text-[10px] font-bold text-brand-neutral tracking-widest uppercase">Centralized Data Aggregation</p>
                        </div>
                    </div>
                    <nav className="hidden md:flex ml-8 gap-6 text-sm font-medium text-brand-neutral">
                        {['dashboard', 'reports', 'configuration', 'system health'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleNavClick(tab)}
                                className={`uppercase tracking-wide text-xs font-bold transition-colors ${activeTab === tab ? 'text-brand-primary' : 'hover:text-brand-primary'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4 text-brand-neutral">
                    <div className={`px-3 py-1 rounded-full border ${connected ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} text-[10px] font-bold tracking-widest flex items-center gap-2`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`} />
                        {connected ? 'ONLINE' : 'OFFLINE'}
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-2"></div>

                    <button onClick={() => setShowSearch(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Search className="w-5 h-5" /></button>

                    <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowProfile(false); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full border border-white"></span>
                        </button>
                        {showNotifications && <NotificationsDropdown onClose={() => setShowNotifications(false)} />}
                    </div>

                    <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile); setShowNotifications(false); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <User className="w-5 h-5" />
                        </button>
                        {showProfile && <UserProfileModal
                            onClose={() => setShowProfile(false)}
                            onSignOut={handleSignOut}
                            onOpenSettings={() => { setShowProfile(false); setShowSettings(true); }}
                            user={currentUser}
                        />}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto bg-bg-page p-6 lg:p-8">
                <div className="max-w-[1600px] mx-auto space-y-6">
                    <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-brand-secondary">System Overview</h2>
                            <p className="text-sm text-gray-500 mt-1">Real-time monitoring of distributed event ingests</p>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">Last metrics update: {new Date().toLocaleTimeString()}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card title="Total Events Processed" value={stats.total} icon={Activity} trend="Lifetime Volume" />
                        <Card title="Average Sentiment" value={stats.avgScore} icon={TrendingUp} trend="Global Index" />
                        <Card title="Positive Signals" value={`${stats.total ? Math.round((stats.positive / stats.total) * 100) : 0}%`} icon={CheckCircle2} trend="Compliance Rate" />
                        <Card title="Critical Signals" value={`${stats.total ? Math.round((stats.negative / stats.total) * 100) : 0}%`} icon={AlertTriangle} trend="Attention Required" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="content-card lg:col-span-2 p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="section-title mb-0 border-none w-auto"><Activity size={14} /> Temporal Sentiment Analysis</h3>
                                <div className="flex items-center gap-2">
                                    {settings.feedPaused && <span className="text-xs font-bold text-amber-500 flex items-center gap-1"><PauseCircle size={10} /> PAUSED</span>}
                                    <select className="text-xs border-gray-300 rounded text-gray-600 focus:ring-brand-primary">
                                        <option>Last Hour</option>
                                        <option>Last 24 Hours</option>
                                        <option>Last 7 Days</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-[350px]">
                                {events.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#A12027" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#A12027" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                            <XAxis dataKey="time" stroke="#9ca3af" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} dy={10} />
                                            <YAxis domain={[-1, 1]} stroke="#9ca3af" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="score" stroke="#A12027" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" isAnimationActive={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-gray-100 rounded-lg">
                                        <Activity className="w-8 h-8 opacity-20" />
                                        <span className="text-xs font-medium uppercase tracking-widest">Waiting for data stream...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="content-card p-0 flex flex-col overflow-hidden h-[450px]">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="section-title mb-0 border-none w-auto py-0"><Terminal size={14} /> Incoming Event Feed</h3>
                                <div className="flex gap-2">
                                    <span className={`w-2 h-2 rounded-full ${settings.feedPaused ? 'bg-amber-400' : 'bg-green-500 animate-pulse'}`}></span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 bg-white">
                                {events.slice().reverse().map((event, idx) => (
                                    <div key={idx} className="feed-item group">
                                        <div className="feed-meta">
                                            <span className={`font-bold ${event.analysis?.sentiment === 'Positive' ? 'text-green-600' : event.analysis?.sentiment === 'Negative' ? 'text-red-600' : 'text-gray-500'}`}>
                                                {event.source}
                                            </span>
                                            <span className="text-gray-300">|</span>
                                            <span className="flex items-center gap-1 text-gray-400">
                                                <Clock size={10} />
                                                {new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}
                                            </span>
                                        </div>
                                        <div className="feed-content">
                                            {event.payload?.text?.split('\n').map((line, i) => (
                                                <p key={i} className="mb-1 last:mb-0 line-clamp-2">{line || "No content"}</p>
                                            )) || "No content"}
                                        </div>
                                        <div className="json-preview hidden group-hover:block animate-fade-in group-hover:shadow-sm">
                                            {JSON.stringify(event.payload, null, 2)}
                                        </div>
                                    </div>
                                ))}
                                <div ref={eventsEndRef} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
