import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Zap, ShieldCheck, Download, Star, ArrowRight, Github } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen font-sans selection:bg-brand-copper selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-copper to-brand-copperDark flex items-center justify-center font-black text-2xl shadow-[0_0_15px_rgba(184,115,51,0.5)]">
              UU
            </div>
            <span className="text-2xl font-bold tracking-tight">kUUpa</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-brand-copper transition-colors">Nasıl Çalışır?</a>
            <a href="#stats" className="hover:text-brand-copper transition-colors">İstatistikler</a>
            <button className="bg-white text-brand-dark px-5 py-2.5 rounded-full font-bold hover:bg-brand-copper hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Chrome'a Ekle
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-copper/20 rounded-full blur-[120px] -z-10 mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px] -z-10 mix-blend-screen" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-3 rounded-full glass-panel text-brand-copper text-sm font-semibold mb-6 border border-brand-copper/30">
              ✨ Alışverişin Geleceği
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
              İnternetteki <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-copper to-brand-copperLight">Tüm Kuponlar</span><br />
              Tek Bir Yerde.
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Siz ödeme ekranına geldiğinizde, kUUpa sizin için saniyeler içinde binlerce kuponu dener ve 
              matematiksel olarak en büyük indirimi uygulayarak cüzdanınızı korur.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto bg-brand-copper hover:bg-brand-copperLight text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(184,115,51,0.4)]">
                <Download size={24} />
                Chrome İçin Ücretsiz İndir
              </button>
              <button className="w-full sm:w-auto glass-panel hover:bg-white/5 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all">
                <Github size={24} />
                Açık Kaynak Kodlu
              </button>
            </div>
            
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
              <div className="flex text-yellow-500">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <span>10,000+ mutlu kullanıcı</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-24 relative z-10 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Alışveriş Alışkanlıklarınızı<br/>Kökten Değiştiriyoruz</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Gelişmiş botlarımız 7/24 interneti tarar. Geçersiz kuponlarla vakit kaybetmezsiniz.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap size={32} className="text-brand-copper" />,
                title: "Işık Hızında Deneme",
                desc: "Ödeme sayfasındayken tek bir tıkla veritabanımızdaki yüzlerce kupon milisaniyeler içinde denenir."
              },
              {
                icon: <ShoppingBag size={32} className="text-brand-copper" />,
                title: "Maksimum İndirim Algoritması",
                desc: "Sepet tutarınızı okuyarak karmaşık hesaplamalar yapar ve sadece size en çok kazandıran kuponu uygular."
              },
              {
                icon: <ShieldCheck size={32} className="text-brand-copper" />,
                title: "Topluluk Odaklı (Crowdsourcing)",
                desc: "Biri yeni bir kupon bulduğunda, kUUpa bunu anında öğrenir ve tüm kullanıcılara dağıtır."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="glass-panel p-8 rounded-3xl hover:border-brand-copper/50 transition-colors group"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-copper/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ekranda Ne Görüyorsunuz?</h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Kupon kodu kutusuna tıkladığınız anda kUUpa belirir. Size sadece tek bir butona basmak düşer. 
              Geri kalan tüm angarya işleri akıllı bal arımız halleder.
            </p>
            <ul className="space-y-4 mb-10">
              {['Kupon aramak için sekmeler arası dolaşmaya son', 'Geçersiz kuponlarla yaşanan hüsrana son', '%100 Güvenli ve gizlilik odaklı mimari'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-brand-copper/20 flex items-center justify-center text-brand-copper">
                    ✓
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button className="text-brand-copper font-bold flex items-center gap-2 hover:gap-4 transition-all">
              Nasıl İndiririm? <ArrowRight size={20} />
            </button>
          </div>
          
          <div className="lg:w-1/2 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-copper/20 to-transparent blur-[80px] -z-10 rounded-full" />
            
            {/* Mockup UI */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl relative"
            >
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-xs font-mono text-gray-500">checkout.trendyol.com</span>
              </div>
              
              <div className="space-y-6">
                <div className="h-8 w-3/4 bg-white/5 rounded-lg" />
                <div className="flex gap-4">
                  <div className="h-32 w-32 bg-white/5 rounded-xl flex-shrink-0" />
                  <div className="space-y-3 w-full">
                    <div className="h-4 w-full bg-white/5 rounded" />
                    <div className="h-4 w-2/3 bg-white/5 rounded" />
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-6 mt-6">
                  <div className="flex justify-between items-end mb-4">
                    <div className="text-sm text-gray-400">İndirim Kodu / Kupon</div>
                    <div className="text-2xl font-bold">1.250,00 TL</div>
                  </div>
                  
                  <div className="relative">
                    {/* Floating Kuupa Button Simulation */}
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-12 left-0 bg-brand-copper text-white px-4 py-2 rounded-lg font-bold text-sm shadow-[0_5px_15px_rgba(184,115,51,0.4)] flex items-center gap-2"
                    >
                      🎁 12 Kupon Dene
                    </motion.div>
                    
                    <div className="flex gap-2">
                      <div className="h-12 flex-1 bg-black/50 border border-white/20 rounded-lg p-3 text-gray-500 font-mono">
                        Kodu Buraya Girin
                      </div>
                      <div className="h-12 w-24 bg-white/10 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center bg-black/80">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-copper flex items-center justify-center font-black text-xl text-white">
            UU
          </div>
          <span className="text-xl font-bold">kUUpa</span>
        </div>
        <p className="text-gray-500 mb-6">Açık kaynaklı, güvenlik odaklı, gelişmiş alışveriş asistanınız.</p>
        <div className="text-sm text-gray-600">© 2026 kUUpa Extension. Tüm hakları saklıdır.</div>
      </footer>
    </div>
  );
}

export default App;
