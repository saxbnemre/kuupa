import React, { useEffect, useState } from 'react';
import { Search, Tag } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
}

const getRootDomain = (hostname: string) => {
  const parts = hostname.split('.');
  if (parts.length > 2) {
    if (hostname.endsWith('.tr') && parts.length > 3) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  }
  return hostname.replace('www.', '');
};

const Popup: React.FC = () => {
  const [domain, setDomain] = useState<string>('Yükleniyor...');
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'none' | 'testing'>('idle');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.url) {
          try {
            const urlObj = new URL(activeTab.url);
            const hostname = getRootDomain(urlObj.hostname);
            setDomain(hostname);
            setStatus('searching');
            
            chrome.runtime.sendMessage({ type: 'CHECK_COUPONS', domain: hostname }, (response) => {
              if (chrome.runtime.lastError) {
                console.error('İletişim hatası oluştu.', chrome.runtime.lastError);
                setStatus('idle');
                return;
              }
              if (response?.coupons && response.coupons.length > 0) {
                setCoupons(response.coupons);
                setStatus('found');
              } else {
                setStatus('none');
              }
            });
          } catch (e) {
            setDomain('Bilinmeyen Site');
            setStatus('none');
          }
        }
      });
    } else {
      setDomain('example.com');
      setStatus('found');
      setCoupons([{ id: '1', code: 'TEST10' }, { id: '2', code: 'SAVE20' }]);
    }
  }, []);

  const handleApplyCoupons = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
          setStatus('searching');
          chrome.tabs.sendMessage(tabs[0].id, { type: 'START_COUPON_TEST', coupons }, (res) => {
            if (chrome.runtime.lastError) {
              console.error('Messaging error:', chrome.runtime.lastError);
              setStatus('idle');
              return;
            }
            if (res?.status === 'done' || res?.status === 'error') {
              setStatus('idle');
            } else {
              // Fallback timeout in case of unexpected response
              setTimeout(() => setStatus('idle'), 5000);
            }
          });
          
          // Absolute fallback timeout in case the content script is totally dead
          setTimeout(() => {
             setStatus(prev => prev === 'searching' ? 'idle' : prev);
          }, 8000);
        }
      });
    }
  };

  const [view, setView] = useState<'main' | 'share'>('main');
  const [shareCode, setShareCode] = useState('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'success' | 'error'>('idle');

  const handleShare = () => {
    if (!shareCode.trim()) return;
    setShareStatus('sharing');
    chrome.runtime.sendMessage({ type: 'SHARE_COUPON', domain, code: shareCode }, (res) => {
      if (res && res.success) {
        setShareStatus('success');
        setShareCode('');
        setTimeout(() => setView('main'), 2000);
      } else {
        setShareStatus('error');
      }
    });
  };

  return (
    <div className="w-80 h-[450px] flex flex-col bg-kuupa-bg">
      {/* Header */}
      <header className="flex items-center justify-center py-4 bg-kuupa-primary shadow-md relative">
        {view === 'share' && (
          <button 
            onClick={() => { setView('main'); setShareStatus('idle'); }} 
            className="absolute left-4 text-white hover:text-orange-200 font-bold"
          >
            ← Geri
          </button>
        )}
        <h1 className="text-white text-3xl font-bold tracking-wider flex items-center">
          k<span className="text-4xl font-extrabold mx-1">UU</span>pa
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 p-5 flex flex-col items-center overflow-y-auto">
        <div className="text-center mb-6 w-full border-b border-orange-100 pb-3">
          <p className="text-kuupa-dark/70 text-xs uppercase font-bold mb-1 tracking-widest">Mağaza</p>
          <p className="font-bold text-xl text-kuupa-dark truncate w-full">{domain}</p>
        </div>

        {view === 'main' ? (
          <>
            {status === 'idle' && coupons.length > 0 && (
              <div className="flex flex-col items-center animate-fade-in w-full">
                <div className="bg-orange-100 rounded-full p-4 mb-4 text-kuupa-primary">
                  <Tag size={40} />
                </div>
                <p className="text-center font-medium text-kuupa-dark mb-4">
                  Bu site için {coupons.length} potansiyel kupon bulduk!
                </p>
                <button 
                  onClick={handleApplyCoupons}
                  className="bg-kuupa-primary hover:bg-kuupa-hover text-white font-bold py-3 px-6 rounded-full w-full transition-colors shadow-lg flex items-center justify-center gap-2 mb-3"
                >
                  Kuponları Dene
                </button>
              </div>
            )}

            {status === 'searching' && (
              <div className="flex flex-col items-center justify-center h-full animate-pulse my-auto">
                <Search size={48} className="text-kuupa-primary mb-4 animate-spin-slow" />
                <p className="text-center font-medium text-kuupa-dark">
                  En iyi indirimi arıyoruz...
                  <br/>
                  <span className="text-sm font-normal opacity-75">Lütfen sayfadan ayrılmayın</span>
                </p>
              </div>
            )}

            {status === 'none' && (
              <div className="flex flex-col items-center justify-center h-full text-center my-auto">
                <div className="bg-gray-200 rounded-full p-4 mb-4 text-gray-500">
                  <Search size={32} />
                </div>
                <p className="text-gray-600 font-medium">
                  Bu site için henüz kupon bulamadık.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  kUUpa senin için internette aramaya devam edecek.
                </p>
              </div>
            )}

            {status === 'found' && coupons.length > 0 && (
              <div className="flex flex-col items-center animate-fade-in w-full">
                <div className="bg-orange-100 rounded-full p-4 mb-4 text-kuupa-primary">
                  <Tag size={40} />
                </div>
                <p className="text-center font-medium text-kuupa-dark mb-4">
                  Bu site için {coupons.length} potansiyel kupon bulduk!
                </p>
                <button 
                  onClick={handleApplyCoupons}
                  className="bg-kuupa-primary hover:bg-kuupa-hover text-white font-bold py-3 px-6 rounded-full w-full transition-colors shadow-lg flex items-center justify-center gap-2 mb-3"
                >
                  Kuponları Dene
                </button>
              </div>
            )}

            {/* Always show share button at the bottom of main view if not searching */}
            {status !== 'searching' && (
              <button
                onClick={() => setView('share')}
                className="mt-auto pt-4 text-sm text-kuupa-primary hover:text-kuupa-hover font-semibold underline decoration-2 underline-offset-4"
              >
                Çalışan bir kupon mu biliyorsun? Paylaş!
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center w-full animate-fade-in my-auto">
            <h2 className="text-xl font-bold text-kuupa-dark mb-2">Kupon Paylaş</h2>
            <p className="text-sm text-center text-gray-500 mb-6">
              Bulduğun çalışan kodu ekleyerek diğer kUUpa kullanıcılarına yardım et!
            </p>
            <input
              type="text"
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value.toUpperCase())}
              placeholder="Örn: YAZ20"
              className="w-full border-2 border-orange-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-kuupa-primary font-bold text-center text-xl uppercase tracking-widest text-kuupa-dark"
              maxLength={20}
            />
            
            {shareStatus === 'success' ? (
              <div className="bg-green-100 text-green-700 p-3 rounded-lg w-full text-center font-semibold mb-4">
                🎉 Kupon başarıyla paylaşıldı!
              </div>
            ) : shareStatus === 'error' ? (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg w-full text-center font-semibold mb-4">
                ❌ Bir hata oluştu.
              </div>
            ) : null}

            <button
              onClick={handleShare}
              disabled={!shareCode.trim() || shareStatus === 'sharing'}
              className="w-full bg-kuupa-primary hover:bg-kuupa-hover disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow transition-colors"
            >
              {shareStatus === 'sharing' ? 'Gönderiliyor...' : 'Topluluğa Gönder'}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 text-center border-t border-orange-200/50 bg-white/50">
        <p className="text-xs text-kuupa-dark/60 font-medium">
          kUUpa - Evrensel Fırsat Avcısı
        </p>
      </footer>
    </div>
  );
};

export default Popup;
