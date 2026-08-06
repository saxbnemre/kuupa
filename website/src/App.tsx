import { motion } from 'framer-motion';
import { ShoppingBag, Zap, ShieldCheck, Download, Star, Search } from 'lucide-react';

function App() {
  return (
    <div>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="flex items-center gap-sm">
            <div className="logo-icon flex gap-[2px]">
              <span className="relative flex justify-center text-white text-3xl leading-none mt-1">
                U
                <span className="absolute bottom-[10%] w-[12px] h-[12px] bg-[#0f0f11] rounded-full border-2 border-white shadow-sm flex items-start justify-end p-[1.5px] animate-pulse">
                  <span className="w-[3px] h-[3px] bg-white rounded-full"></span>
                </span>
              </span>
              <span className="relative flex justify-center text-white text-3xl leading-none mt-1">
                U
                <span className="absolute bottom-[10%] w-[12px] h-[12px] bg-[#0f0f11] rounded-full border-2 border-white shadow-sm flex items-start justify-end p-[1.5px] animate-pulse" style={{ animationDelay: '0.4s' }}>
                  <span className="w-[3px] h-[3px] bg-white rounded-full"></span>
                </span>
              </span>
            </div>
            <span className="text-3xl font-black tracking-tighter flex items-center drop-shadow-md">
              k
              <span className="flex mx-[1px] mt-1">
                <span className="relative flex justify-center text-4xl leading-none">
                  U
                  <span className="absolute bottom-[10%] w-[14px] h-[14px] bg-white rounded-full border-2 border-[#0f0f11] shadow-sm flex items-start justify-end p-[2px] animate-pulse">
                    <span className="w-[4px] h-[4px] bg-[#0f0f11] rounded-full"></span>
                  </span>
                </span>
                <span className="relative flex justify-center text-4xl leading-none">
                  U
                  <span className="absolute bottom-[10%] w-[14px] h-[14px] bg-white rounded-full border-2 border-[#0f0f11] shadow-sm flex items-start justify-end p-[2px] animate-pulse" style={{ animationDelay: '0.4s' }}>
                    <span className="w-[4px] h-[4px] bg-[#0f0f11] rounded-full"></span>
                  </span>
                </span>
              </span>
              pa
            </span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Nasıl Çalışır?</a>
            <a href="#stats" className="nav-link">İstatistikler</a>
            <button className="btn-nav">
              Chrome'a Ekle
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section container flex flex-col items-center text-center">
        {/* Abstract Background Elements */}
        <div className="bg-glow-1" />
        <div className="bg-glow-2" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ maxWidth: '800px' }}
        >
          <span className="hero-badge glass-panel">
            ✨ Alışverişin Geleceği
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-8" style={{ marginBottom: '2rem' }}>
            İnternetteki <span className="text-gradient">Tüm Kuponlar</span><br />
            Tek Bir Yerde.
          </h1>
          <p className="text-xl text-muted" style={{ marginBottom: '3rem' }}>
            Siz ödeme ekranına geldiğinizde, kUUpa sizin için saniyeler içinde binlerce kuponu dener ve
            matematiksel olarak en büyük indirimi uygulayarak cüzdanınızı korur.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
            <button className="btn btn-primary" style={{ width: '100%', maxWidth: '300px' }}>
              <Download size={24} />
              Ücretsiz İndir
            </button>
            <button className="btn btn-secondary" style={{ width: '100%', maxWidth: '300px' }}>
              Açık Kaynak Kodlu
            </button>
          </div>

          <div className="flex items-center justify-center gap-sm text-sm text-muted font-bold" style={{ marginTop: '2.5rem' }}>
            <div className="flex" style={{ color: '#fbbf24' }}>
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
            <span>10,000+ mutlu kullanıcı</span>
          </div>
        </motion.div>
      </section>

      {/* Feature Showcase */}
      <section id="features" style={{ padding: '6rem 0', borderTop: '1px solid var(--color-white-border)', background: 'rgba(0,0,0,0.5)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '5rem' }}>
            <h2 className="text-3xl md:text-5xl font-bold" style={{ marginBottom: '1.5rem' }}>Alışveriş Alışkanlıklarınızı<br />Kökten Değiştiriyoruz</h2>
            <p className="text-muted text-lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Gelişmiş botlarımız 7/24 interneti tarar. Geçersiz kuponlarla vakit kaybetmezsiniz.
            </p>
          </div>

          <div className="grid-4">
            {[
              {
                icon: <Search size={32} />,
                title: "En Ucuz Fiyatı Bul",
                desc: "İnternetteki fiyatları anında tarayıp, aradığınız ürünün en ucuz olduğu mağazayı gösterir."
              },
              {
                icon: <Zap size={32} />,
                title: "Işık Hızında Deneme",
                desc: "Ödeme sayfasındayken tek bir tıkla veritabanımızdaki yüzlerce kupon milisaniyeler içinde denenir."
              },
              {
                icon: <ShoppingBag size={32} />,
                title: "Maksimum İndirim",
                desc: "Sepet tutarınızı okuyarak karmaşık hesaplamalar yapar ve sadece size en çok kazandıran kuponu uygular."
              },
              {
                icon: <ShieldCheck size={32} />,
                title: "Topluluk Odaklı",
                desc: "Biri yeni bir kupon bulduğunda, kUUpa bunu anında öğrenir ve tüm kullanıcılara dağıtır."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="glass-panel feature-card group"
              >
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="text-muted">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section style={{ padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
        <div className="container flex flex-col items-center" style={{ gap: '4rem' }}>

          <div style={{ textAlign: 'center', maxWidth: '700px' }}>
            <h2 className="text-3xl md:text-5xl font-bold" style={{ marginBottom: '1.5rem' }}>Ekranda Ne Görüyorsunuz?</h2>
            <p className="text-xl text-muted" style={{ marginBottom: '2rem' }}>
              Kupon kodu kutusuna tıkladığınız anda kUUpa belirir. Size sadece tek bir butona basmak düşer.
              Geri kalan tüm angarya işleri akıllı bal arımız halleder.
            </p>
          </div>

          <div style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top right, rgba(184,115,51,0.2), transparent)',
              filter: 'blur(80px)',
              zIndex: -1,
              borderRadius: '50%'
            }} />

            {/* Mockup UI */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel"
              style={{ padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <div className="flex items-center gap-sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <span className="text-sm text-muted font-bold" style={{ marginLeft: '1rem', fontFamily: 'monospace' }}>checkout.trendyol.com</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ height: '2rem', width: '75%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }} />
                <div className="flex gap-md">
                  <div style={{ height: '8rem', width: '8rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', flexShrink: 0 }} />
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ height: '1rem', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }} />
                    <div style={{ height: '1rem', width: '66%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                    <div className="text-sm text-muted">İndirim Kodu / Kupon</div>
                    <div className="text-xl font-bold">1.250,00 TL</div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    {/* Floating Kuupa Button Simulation */}
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="btn-primary"
                      style={{
                        position: 'absolute',
                        top: '-3.5rem',
                        left: 0,
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 5px 15px rgba(184,115,51,0.4)',
                        border: 'none',
                        cursor: 'default'
                      }}
                    >
                      🎁 12 Kupon Dene
                    </motion.div>

                    <div className="flex gap-sm">
                      <div style={{ flex: 1, height: '3rem', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', padding: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                        Kodu Buraya Girin
                      </div>
                      <div style={{ height: '3rem', width: '6rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem' }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '3rem 0', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <div className="flex items-center justify-center gap-sm" style={{ marginBottom: '1.5rem' }}>
          <div className="logo-icon flex gap-[2px]" style={{ width: '2rem', height: '2rem', fontSize: '1rem' }}>
            <span className="relative flex justify-center text-white text-2xl leading-none mt-1">
              U
              <span className="absolute bottom-[10%] w-[10px] h-[10px] bg-[#0f0f11] rounded-full border-2 border-white shadow-sm flex items-start justify-end p-[1px] animate-pulse">
                <span className="w-[2px] h-[2px] bg-white rounded-full"></span>
              </span>
            </span>
            <span className="relative flex justify-center text-white text-2xl leading-none mt-1">
              U
              <span className="absolute bottom-[10%] w-[10px] h-[10px] bg-[#0f0f11] rounded-full border-2 border-white shadow-sm flex items-start justify-end p-[1px] animate-pulse" style={{ animationDelay: '0.4s' }}>
                <span className="w-[2px] h-[2px] bg-white rounded-full"></span>
              </span>
            </span>
          </div>
          <span className="text-2xl font-black tracking-tighter flex items-center">
            k
            <span className="flex mx-[1px]">
              <span className="relative flex justify-center text-3xl leading-none">
                U
                <span className="absolute bottom-[10%] w-[12px] h-[12px] bg-white rounded-full border-2 border-[#0f0f11] shadow-sm flex items-start justify-end p-[1.5px] animate-pulse">
                  <span className="w-[3px] h-[3px] bg-[#0f0f11] rounded-full"></span>
                </span>
              </span>
              <span className="relative flex justify-center text-3xl leading-none">
                U
                <span className="absolute bottom-[10%] w-[12px] h-[12px] bg-white rounded-full border-2 border-[#0f0f11] shadow-sm flex items-start justify-end p-[1.5px] animate-pulse" style={{ animationDelay: '0.4s' }}>
                  <span className="w-[3px] h-[3px] bg-[#0f0f11] rounded-full"></span>
                </span>
              </span>
            </span>
            pa
          </span>
        </div>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Açık kaynaklı, güvenlik odaklı, gelişmiş alışveriş asistanınız.</p>
        <div className="text-sm text-muted" style={{ opacity: 0.5 }}>© 2026 kUUpa Extension. Tüm hakları saklıdır.</div>
      </footer>
    </div>
  );
}

export default App;
