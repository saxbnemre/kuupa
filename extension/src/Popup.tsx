import React, { useEffect, useState } from 'react';
import { Search, Tag } from 'lucide-react';

const Popup: React.FC = () => {
  const [domain, setDomain] = useState<string>('Yükleniyor...');
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'none'>('idle');
  const [coupons, setCoupons] = useState<string[]>([]);

  useEffect(() => {
    // Get active tab info
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url;
        if (url) {
          try {
            const urlObj = new URL(url);
            let hostname = urlObj.hostname;
            if (hostname.startsWith('www.')) hostname = hostname.slice(4);
            setDomain(hostname);
            
            // Ask background script if this domain has coupons
            chrome.runtime.sendMessage({ type: 'CHECK_COUPONS', domain: hostname }, (response) => {
              if (response && response.coupons && response.coupons.length > 0) {
                setStatus('found');
                setCoupons(response.coupons);
              } else {
                setStatus('none');
              }
            });
          } catch (e) {
            setDomain('Bilinmeyen Site');
          }
        }
      });
    } else {
      // Local testing
      setDomain('example.com');
      setStatus('found');
      setCoupons(['TEST10', 'SAVE20']);
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

  return (
    <div className="w-80 h-[400px] flex flex-col bg-kuupa-bg">
      {/* Header */}
      <header className="flex items-center justify-center py-4 bg-kuupa-primary shadow-md">
        <h1 className="text-white text-3xl font-bold tracking-wider flex items-center">
          k<span className="text-4xl font-extrabold mx-1">UU</span>pa
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 p-5 flex flex-col items-center">
        <div className="text-center mb-6">
          <p className="text-kuupa-dark/70 text-sm mb-1">Şu anki site:</p>
          <p className="font-semibold text-lg text-kuupa-dark truncate max-w-[250px]">{domain}</p>
        </div>

        {status === 'idle' && coupons.length > 0 && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="bg-orange-100 rounded-full p-4 mb-4 text-kuupa-primary">
              <Tag size={40} />
            </div>
            <p className="text-center font-medium text-kuupa-dark mb-4">
              Bu site için {coupons.length} potansiyel kupon bulduk!
            </p>
            <button 
              onClick={handleApplyCoupons}
              className="bg-kuupa-primary hover:bg-kuupa-hover text-white font-bold py-3 px-6 rounded-full w-full transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Kuponları Dene
            </button>
          </div>
        )}

        {status === 'searching' && (
          <div className="flex flex-col items-center justify-center h-full animate-pulse">
            <Search size={48} className="text-kuupa-primary mb-4 animate-spin-slow" />
            <p className="text-center font-medium text-kuupa-dark">
              En iyi indirimi arıyoruz...
              <br/>
              <span className="text-sm font-normal opacity-75">Lütfen sayfadan ayrılmayın</span>
            </p>
          </div>
        )}

        {status === 'none' && (
          <div className="flex flex-col items-center justify-center h-full text-center">
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
              className="bg-kuupa-primary hover:bg-kuupa-hover text-white font-bold py-3 px-6 rounded-full w-full transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Kuponları Dene
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
