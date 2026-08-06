import React, { useEffect, useState } from 'react';
import { Search, Tag, Share2 } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  domain: string;
  url: string;
  currency: string;
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
  const [view, setView] = useState<'main' | 'search' | 'share'>('main');

  // Share State
  const [shareCode, setShareCode] = useState('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'success' | 'error'>('idle');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [searchResults, setSearchResults] = useState<Product[]>([]);

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
              setTimeout(() => setStatus('idle'), 5000);
            }
          });

          setTimeout(() => {
            setStatus(prev => prev === 'searching' ? 'idle' : prev);
          }, 8000);
        }
      });
    }
  };

  const handleShare = () => {
    if (!shareCode.trim()) return;
    setShareStatus('sharing');
    chrome.runtime.sendMessage({ type: 'SHARE_COUPON', domain, code: shareCode }, (res) => {
      if (res && res.success) {
        setShareStatus('success');
        setShareCode('');
        setTimeout(() => {
          setView('main');
          setShareStatus('idle');
        }, 2000);
      } else {
        setShareStatus('error');
      }
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearchStatus('loading');

    // Send message to background to fetch API
    chrome.runtime.sendMessage({ type: 'SEARCH_PRODUCTS', query: searchQuery }, (res) => {
      if (res && res.products) {
        setSearchResults(res.products);
        setSearchStatus('done');
      } else {
        setSearchStatus('error');
      }
    });
  };

  return (
    <div className="w-80 h-[500px] flex flex-col bg-kuupa-bg">
      {/* Header */}
      <header className="flex items-center justify-center py-4 bg-kuupa-primary shadow-md relative z-10">
        <h1 className="text-white text-4xl font-black tracking-tighter flex items-center drop-shadow-lg">
          k
          <span className="flex mx-[1px] mt-1">
            <span className="relative flex justify-center text-5xl leading-none">
              U
              <span className="absolute bottom-[10%] w-[16px] h-[16px] bg-kuupa-dark rounded-full border-2 border-white shadow-sm flex items-start justify-end p-[2px] animate-pulse">
                <span className="w-[4px] h-[4px] bg-white rounded-full"></span>
              </span>
            </span>
            <span className="relative flex justify-center text-5xl leading-none">
              U
              <span className="absolute bottom-[10%] w-[16px] h-[16px] bg-kuupa-dark rounded-full border-2 border-white shadow-sm flex items-start justify-end p-[2px] animate-pulse" style={{ animationDelay: '0.4s' }}>
                <span className="w-[4px] h-[4px] bg-white rounded-full"></span>
              </span>
            </span>
          </span>
          pa
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 p-5 flex flex-col items-center overflow-y-auto">

        {/* Main View (Coupons) */}
        {view === 'main' && (
          <>
            <div className="text-center mb-6 w-full border-b border-orange-100 pb-3">
              <p className="text-kuupa-dark/70 text-xs uppercase font-bold mb-1 tracking-widest">Mağaza</p>
              <p className="font-bold text-xl text-kuupa-dark truncate w-full">{domain}</p>
            </div>

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
                  className="bg-kuupa-primary hover:bg-kuupa-hover text-white font-bold py-3 px-6 rounded-full w-full transition-colors shadow-lg flex items-center justify-center gap-2 mb-3 text-lg"
                >
                  Otomatik Dene
                </button>
              </div>
            )}

            {status === 'searching' && (
              <div className="flex flex-col items-center justify-center h-full animate-pulse my-auto">
                <Search size={48} className="text-kuupa-primary mb-4 animate-spin-slow" />
                <p className="text-center font-medium text-kuupa-dark">
                  Kuponlar taranıyor...
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
              </div>
            )}
          </>
        )}

        {/* Search View (Price Comparison) */}
        {view === 'search' && (
          <div className="flex flex-col items-center w-full h-full animate-fade-in">
            <h2 className="text-xl font-bold text-kuupa-dark mb-2">Ürün Karşılaştırma</h2>
            <p className="text-xs text-center text-gray-500 mb-4">
              En ucuz fiyatı bulmak için ürün adını yazın.
            </p>
            <div className="flex w-full mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Örn: iPhone 15 Pro"
                className="flex-1 border-2 border-r-0 border-orange-200 rounded-l-xl px-3 py-2 focus:outline-none focus:border-kuupa-primary text-sm font-medium"
              />
              <button
                onClick={handleSearch}
                className="bg-kuupa-primary hover:bg-kuupa-hover text-white px-3 rounded-r-xl transition-colors"
              >
                <Search size={20} />
              </button>
            </div>

            <div className="w-full flex-1 overflow-y-auto pr-1 space-y-3">
              {searchStatus === 'loading' && (
                <div className="text-center py-8 text-kuupa-primary animate-pulse">Aranıyor...</div>
              )}
              {searchStatus === 'error' && (
                <div className="text-center py-8 text-red-500 text-sm font-bold">Arama sırasında bir hata oluştu.</div>
              )}
              {searchStatus === 'done' && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">Hiçbir sonuç bulunamadı.</div>
              )}
              {searchStatus === 'done' && searchResults.length > 0 && searchResults.map((product, index) => (
                <a
                  key={product._id}
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white border border-gray-200 rounded-xl p-3 hover:border-kuupa-primary transition-colors relative"
                >
                  {index === 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                      En Ucuz
                    </span>
                  )}
                  <h3 className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</h3>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-xs text-gray-500 font-medium">{product.domain}</span>
                    <span className="text-lg font-black text-kuupa-primary">{product.price.toLocaleString('tr-TR')} {product.currency}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Share View (Crowdsourcing) */}
        {view === 'share' && (
          <div className="flex flex-col items-center w-full animate-fade-in my-auto">
            <h2 className="text-xl font-bold text-kuupa-dark mb-2">Kupon Paylaş</h2>
            <p className="text-sm text-center text-gray-500 mb-6">
              Bulduğun çalışan kodu ekleyerek diğer kullanıcılara yardım et!
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

      {/* Bottom Tab Navigation */}
      <nav className="flex items-center justify-around bg-white border-t border-gray-200 pt-2 pb-3 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setView('main')}
          className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${view === 'main' ? 'text-kuupa-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Tag size={20} className={view === 'main' ? 'fill-orange-100' : ''} />
          <span className="text-[10px] font-bold">Kuponlar</span>
        </button>
        <button
          onClick={() => setView('search')}
          className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${view === 'search' ? 'text-kuupa-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Search size={20} strokeWidth={view === 'search' ? 3 : 2} />
          <span className="text-[10px] font-bold">Ürün Ara</span>
        </button>
        <button
          onClick={() => setView('share')}
          className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${view === 'share' ? 'text-kuupa-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Share2 size={20} className={view === 'share' ? 'fill-orange-100' : ''} />
          <span className="text-[10px] font-bold">Paylaş</span>
        </button>
      </nav>
    </div>
  );
};

export default Popup;
