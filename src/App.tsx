import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause,
  Radio,
  Crown,
  ArrowLeft,
  Shield,
  Infinity,
  Zap,
  Check,
  X,
  Star,
  Headphones
} from 'lucide-react';
import Navbar from "./components/Navbar.js";
import PodcastSettings from './components/PodcastSettings.js';
import AIGenerator from './components/AIGenerator.js';
import ExportShare from './components/ExportShare.js';
import { generatePodcastWithAudio, fetchBotnoiRoles } from './api.js';
import { Rocket, FileText } from 'lucide-react';

interface GeneratedScript {
  title: string;
  content: string;
  speakers: { name: string; role: string }[];
  audioUrl?: string; // เพิ่ม property สำหรับ audio จริง
}

type CurrentPage = 'home' | 'payment';

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
  const [title, setTitle] = useState(''); // เตรียมใช้ API
  const [selectedVoice, setSelectedVoice] = useState(''); // เตรียมใช้ API
  const [selectedRole, setSelectedRole] = useState(''); // เตรียมใช้ API
  const [speed, setSpeed] = useState(1.0); // สามารถ set เป็น null ได้ถ้าต้องการ
  const [script, setScript] = useState(''); // สำหรับ prompt รอง (Advanced)
  const [promptIdea, setPromptIdea] = useState(''); // เตรียมใช้ API
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [usageCount, setUsageCount] = useState(7); // Remaining uses
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [currentPlan] = useState('basic'); // removed setCurrentPlan (unused)
  const [language, setLanguage] = useState('th');
  const [voices] = useState([
    { id: '1', name: 'Speaker1', accent: 'Thai Voice 1' },
    { id: '2', name: 'Speaker2', accent: 'Thai Voice 2' },
    { id: '3', name: 'Speaker3', accent: 'Thai Voice 3' },
    { id: '4', name: 'Speaker4', accent: 'Thai Voice 4' },
    { id: '5', name: 'Speaker5', accent: 'Thai Voice 5' },
    { id: '6', name: 'Speaker6', accent: 'Thai Voice 6' },
    { id: '7', name: 'Speaker7', accent: 'Thai Voice 7' },
    { id: '8', name: 'Speaker8', accent: 'Thai Voice 8' },
    { id: '9', name: 'Speaker9', accent: 'Thai Voice 9' },
    { id: '10', name: 'Speaker10', accent: 'Thai Voice 10' },
    { id: '11', name: 'Speaker11', accent: 'Thai Voice 11' },
    { id: '12', name: 'Speaker12', accent: 'Thai Voice 12' },
    { id: '13', name: 'Speaker13', accent: 'Thai Voice 13' },
    { id: '14', name: 'Speaker14', accent: 'Thai Voice 14' },
    { id: '15', name: 'Speaker15', accent: 'Thai Voice 15' },
    { id: '16', name: 'Speaker16', accent: 'Thai Voice 16' },
    { id: '17', name: 'Speaker17', accent: 'Thai Voice 17' },
    { id: '18', name: 'Speaker18', accent: 'Thai Voice 18' },
    { id: '19', name: 'Speaker19', accent: 'Thai Voice 19' },
    { id: '20', name: 'Speaker20', accent: 'Thai Voice 20' },
    { id: '21', name: 'Speaker21', accent: 'Thai Voice 21' },
    { id: '22', name: 'Speaker22', accent: 'Thai Voice 22' },
    { id: '23', name: 'Speaker23', accent: 'Thai Voice 23' },
    { id: '24', name: 'Speaker24', accent: 'Thai Voice 24' },
    { id: '25', name: 'Speaker25', accent: 'Thai Voice 25' },
    { id: '26', name: 'Speaker26', accent: 'Thai Voice 26' },
    { id: '27', name: 'Speaker27', accent: 'Thai Voice 27' },
    { id: '28', name: 'Speaker28', accent: 'Thai Voice 28' },
    { id: '29', name: 'Speaker29', accent: 'Thai Voice 29' },
    { id: '30', name: 'Speaker30', accent: 'Thai Voice 30' }
  ]);
  
  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      period: '',
      description: 'Perfect for getting started',
      features: [
        '10 podcasts per day',
        '5 voice options',
        'Basic audio quality',
        'MP3 download only',
        'Community support',
        '5-minute max length'
      ],
      limitations: [
        'Limited voice selection',
        'Basic audio quality',
        'Watermark included'
      ],
      buttonText: 'Current Plan',
      buttonStyle: 'bg-gray-500 cursor-not-allowed',
      popular: false,
      icon: Radio
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      period: '/month',
      description: 'For serious podcast creators',
      features: [
        '100 podcasts per day',
        '15+ premium voices',
        'High-quality audio',
        'All download formats',
        'Priority support',
        '30-minute max length',
        'Custom voice training',
        'Advanced editing tools',
        'Analytics dashboard'
      ],
      limitations: [],
      buttonText: 'Upgrade to Pro',
      buttonStyle: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      popular: true,
      icon: Crown
    },
    {
      id: 'extreme',
      name: 'Extreme',
      price: '$49',
      period: '/month',
      description: 'For professional studios',
      features: [
        'Unlimited podcasts',
        '50+ premium voices',
        'Studio-quality audio',
        'All formats + lossless',
        '24/7 dedicated support',
        'Unlimited length',
        'Custom voice cloning',
        'Advanced AI features',
        'White-label solution',
        'API access',
        'Team collaboration',
        'Custom integrations'
      ],
      limitations: [],
      buttonText: 'Upgrade to Extreme',
      buttonStyle: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
      popular: false,
      icon: Rocket
    }
  ];

  // โหลด voice/role จาก API (หรือ mock)
  useEffect(() => {
    fetchBotnoiRoles().then(setRoles).catch(() => setRoles([]));
  }, []);

  // สร้าง Podcast Script และ Audio ด้วย API
  const canGenerate = !!title.trim() && !!selectedVoice && !!selectedRole && !!speed && !!language && !!promptIdea.trim();

  const generatePodcast = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setUsageCount(prev => Math.max(0, prev - 1));
    try {
      // รวม prompt หลักและ prompt รอง (ถ้ามี)
      let fullPrompt = promptIdea.trim();
      if (script.trim()) {
        fullPrompt += '\n\n' + script.trim();
      }
      const { script: content, audioUrl } = await generatePodcastWithAudio({
        topic: fullPrompt,
        speaker: selectedVoice || '1',
        speed,
        type_media: 'mp4',
        save_file: true,
        language,
        role: selectedRole || undefined,
      });
      const mockScript = {
        title: title || 'AI Generated Podcast',
        content,
        speakers: [
          {
            name: selectedVoice || 'Speaker',
            role: selectedRole || 'Host',
          },
        ],
        audioUrl,
      };
      setGeneratedScript(mockScript);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้าง Podcast: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // Simulate audio playback
    if (!isPlaying) {
      const interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  const handleShare = (platform: string) => {
    console.log(`Sharing to ${platform}`);
    setShowShareMenu(false);
  };

  const handleUpgrade = (planId: string) => {
    console.log(`Upgrading to ${planId}`);
    // Here you would integrate with your payment processor
  };

  const renderPaymentPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Studio</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Botcats
                </h1>
                <p className="text-sm text-gray-400">Pricing Plans</p>
              </div>
            </div>
            
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Unlock the full potential of AI-powered podcast creation. From hobbyist to professional studio, 
            we have the perfect plan for your needs.
          </p>
        </div>

        {/* Current Plan Indicator */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Current Plan: Basic</h3>
                <p className="text-gray-400">You're currently on the free plan</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">$0</p>
              <p className="text-sm text-gray-400">per month</p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;
            const isCurrentPlan = plan.id === currentPlan;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-purple-500 ring-2 ring-purple-500/20' 
                    : 'border-white/20 hover:border-white/30'
                } ${isCurrentPlan ? 'ring-2 ring-green-500/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Current
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400 ml-1">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center opacity-60">
                      <X className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-400 line-through">{limitation}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-4">Features</th>
                  <th className="text-center py-4 px-4">Basic</th>
                  <th className="text-center py-4 px-4">Pro</th>
                  <th className="text-center py-4 px-4">Extreme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="py-4 px-4 font-medium">Daily Podcast Limit</td>
                  <td className="text-center py-4 px-4">10</td>
                  <td className="text-center py-4 px-4">100</td>
                  <td className="text-center py-4 px-4">
                    <Infinity className="w-5 h-5 mx-auto text-yellow-400" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium">Voice Options</td>
                  <td className="text-center py-4 px-4">5</td>
                  <td className="text-center py-4 px-4">15+</td>
                  <td className="text-center py-4 px-4">50+</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium">Max Length</td>
                  <td className="text-center py-4 px-4">5 min</td>
                  <td className="text-center py-4 px-4">30 min</td>
                  <td className="text-center py-4 px-4">
                    <Infinity className="w-5 h-5 mx-auto text-yellow-400" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium">Audio Quality</td>
                  <td className="text-center py-4 px-4">Basic</td>
                  <td className="text-center py-4 px-4">High</td>
                  <td className="text-center py-4 px-4">Studio</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium">Custom Voice Training</td>
                  <td className="text-center py-4 px-4">
                    <X className="w-5 h-5 mx-auto text-red-400" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <Check className="w-5 h-5 mx-auto text-green-400" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <Check className="w-5 h-5 mx-auto text-green-400" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium">API Access</td>
                  <td className="text-center py-4 px-4">
                    <X className="w-5 h-5 mx-auto text-red-400" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <X className="w-5 h-5 mx-auto text-red-400" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <Check className="w-5 h-5 mx-auto text-green-400" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a free trial for paid plans?</h3>
              <p className="text-gray-400">Yes, all paid plans come with a 7-day free trial. No credit card required to start.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-400">We offer a 30-day money-back guarantee for all paid plans, no questions asked.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Podcast Settings */}
            <PodcastSettings
              title={title}
              setTitle={setTitle}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              voices={voices}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              roles={roles}
              speed={speed}
              setSpeed={setSpeed}
              speedError={''}
              language={language}
              setLanguage={setLanguage}
            />
            {/* AI Generation */}
            <AIGenerator
              promptIdea={promptIdea}
              setPromptIdea={setPromptIdea}
              generatePodcast={generatePodcast}
              isGenerating={isGenerating}
              usageCount={usageCount}
              showAdvanced={showAdvanced}
              setShowAdvanced={setShowAdvanced}
              script={script}
              setScript={setScript}
              canGenerate={canGenerate}
            />
            {/* Generated Script Display */}
            {generatedScript && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Generated Script
                </h2>
                
                <div className="bg-black/30 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-purple-300">{generatedScript.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{generatedScript.content}</p>
                  
                  {generatedScript.speakers.map((speaker, index) => (
                    <div key={index} className="border-l-2 border-purple-500 pl-4">
                      <p className="text-sm text-purple-400 font-medium">{speaker.name} ({speaker.role})</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Audio Player & Controls */}
          <div className="space-y-6">
            {/* Audio Player */}
            {generatedScript && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Headphones className="w-5 h-5 mr-2" />
                  Audio Preview
                </h3>
                
                {/* ถ้ามี audioUrl ให้เล่นเสียงจริง */}
                {generatedScript.audioUrl ? (
                  <audio
                    controls
                    src={generatedScript.audioUrl}
                    className="w-full mb-4"
                    style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem' }}
                  />
                ) : (
                  // Waveform Visualization
                  <div className="bg-black/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center h-20">
                      <div className="flex items-end space-x-1">
                        {[...Array(40)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full transition-all duration-150 ${
                              i < (audioProgress / 100) * 40 ? 'opacity-100' : 'opacity-30'
                            }`}
                            style={{ height: `${Math.random() * 60 + 10}px` }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-white/20 rounded-full mt-3">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Playback Controls */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={togglePlayback}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 rounded-full transition-all duration-200"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Speed:</span>
                    <select
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="0.5" className="bg-gray-800">0.5x</option>
                      <option value="0.75" className="bg-gray-800">0.75x</option>
                      <option value="1.0" className="bg-gray-800">1.0x</option>
                      <option value="1.25" className="bg-gray-800">1.25x</option>
                      <option value="1.5" className="bg-gray-800">1.5x</option>
                      <option value="2.0" className="bg-gray-800">2.0x</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Download & Share */}
            {generatedScript && (
              <ExportShare
                audioAvailable={!!generatedScript.audioUrl}
                showShareMenu={showShareMenu}
                setShowShareMenu={setShowShareMenu}
                handleShare={handleShare}
                audioUrl={generatedScript.audioUrl}
                podcastTitle={generatedScript.title}
              />
            )}

            {/* Usage Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Today's Usage
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Podcasts Created</span>
                  <span className="font-semibold">{10 - usageCount}/10</span>
                </div>
                
                <div className="w-full h-2 bg-white/20 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-300"
                    style={{ width: `${((10 - usageCount) / 10) * 100}%` }}
                  />
                </div>
                
                <p className="text-sm text-gray-400">
                  Resets in 12 hours
                </p>
                
                <button
                  onClick={() => setCurrentPage('payment')}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-sm"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade for More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8B5CF6, #EC4899);
          cursor: pointer;
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8B5CF6, #EC4899);
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  );

  return currentPage === 'payment' ? renderPaymentPage() : renderHomePage();
}

export default App;