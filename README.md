<div align="center">
  <img src="https://via.placeholder.com/150/d95c14/ffffff?text=kUUpa" alt="kUUpa Logo" width="120" />
  <h1>kUUpa</h1>
  <p><strong>Yeni Nesil Kupon ve Ürün Fiyat Takip Platformu</strong></p>

  <p>
    <a href="#özellikler">Özellikler</a> •
    <a href="#mimari">Mimari</a> •
    <a href="#kurulum">Kurulum</a> •
    <a href="#geliştirme">Geliştirme</a> •
    <a href="#katkıda-bulunma">Katkıda Bulunma</a>
  </p>

  <p>
    <img alt="Node.js" src="https://img.shields.io/badge/Node.js-20-43853d?style=flat-square&logo=node.js">
    <img alt="Python" src="https://img.shields.io/badge/Python-3.10-3776AB?style=flat-square&logo=python">
    <img alt="React" src="https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react">
    <img alt="Docker" src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat-square&logo=docker">
    <img alt="Playwright" src="https://img.shields.io/badge/Playwright-E2E-2EAD33?style=flat-square&logo=playwright">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-d95c14?style=flat-square">
  </p>
</div>

---

## 🌟 Hakkında

**kUUpa**, kullanıcıların e-ticaret sitelerinde gezinirken en iyi indirimleri, kuponları ve ürün fırsatlarını yakalamasını sağlayan kapsamlı bir sistemdir. Gelişmiş bir Chrome eklentisi, güçlü bir arka uç (backend) altyapısı, modern bir web arayüzü ve akıllı veri madenciliği (scraper) araçlarını tek bir monorepo altında birleştirir.

Projenin marka rengi karakteristik **kUUpa Bakır Turuncu**'dur (`#d95c14`).

## ✨ Özellikler

- 🛍️ **Chrome Eklentisi (Manifest V3)**: Tarayıcı üzerinden kesintisiz ve hızlı kupon/ürün analizi.
- 🕷️ **Akıllı Scraper**: Python ve Playwright-Stealth tabanlı, anti-bot sistemlerini aşabilen dinamik veri madenciliği.
- ⚡ **RESTful API**: Node.js, Express.js ve MongoDB üzerinde çalışan, güvenli ve ölçeklenebilir backend.
- 🎨 **Modern Arayüz**: React ve TailwindCSS kullanılarak oluşturulmuş, yüksek performanslı ve kullanıcı dostu UI.
- 🐳 **Dockerize Edilmiş Yapı**: Tüm servislerin `docker-compose` ile tek tıkla ayağa kaldırılabilmesi.
- 🧪 **Kapsamlı Testler**: Playwright E2E ve Jest kullanılarak hazırlanan sağlam test altyapısı.

## 🏗 Mimari

kUUpa, bir mikroservis / monorepo yapısı kullanmaktadır:

```text
kUUpa/
├── backend/       # Express.js, MongoDB ve API Rotaları (Node.js)
├── extension/     # Chrome Eklentisi (React, Tailwind, Manifest V3)
├── website/       # Tanıtım ve Kullanıcı Paneli (React, Tailwind)
├── workers/       # Python Playwright Scraper & Veri İşleme
├── tests/         # E2E (Playwright) ve Entegrasyon Testleri
└── .github/       # CI/CD Pipeline (GitHub Actions)
```

## 🚀 Kurulum

### Ön Koşullar

- **Node.js** (v20 veya üzeri)
- **Python** (v3.10 veya üzeri)
- **Docker** & **Docker Compose**
- **MongoDB** (Lokal kurulum veya Atlas URI)

### Başlangıç

1. Depoyu klonlayın:
```bash
git clone https://github.com/your-org/kuupa.git
cd kuupa
```

2. Ortam değişkenlerini ayarlayın:
```bash
cp .env.example .env
# .env dosyasını kendi ortamınıza göre düzenleyin
```

3. Geliştirme ortamını Docker ile başlatın:
```bash
docker-compose up --build
```

> **Not:** Sistem ayağa kalktığında Backend `localhost:3000`, Web arayüzü `localhost:5173` (veya ilgili port) üzerinde çalışacaktır.

## 🛠 Geliştirme

Projedeki her bir alt modül kendi `package.json` veya `requirements.txt` dosyasına sahiptir. İlgili klasöre giderek bağımsız geliştirme yapabilirsiniz.

### Backend
```bash
cd backend
npm install
npm run dev
```

### Chrome Eklentisi
```bash
cd extension
npm install
npm run build # dist/ klasörünü Chrome'da "Unpacked Extension" olarak yükleyin
npm run dev   # Geliştirme modu için
```

### Scraper Worker
```bash
cd workers
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python scraper.py
```

## 🧪 Testler

Sistem genelindeki E2E ve entegrasyon testlerini çalıştırmak için ana dizindeki QA araçlarını kullanabilirsiniz:

```bash
# E2E Testleri için (Playwright)
cd tests
npm install
npx playwright test

# Backend Unit/Integration Testleri (Jest)
cd backend
npm test
```

## 🤝 Katkıda Bulunma

Projede farklı disiplinlerde (Backend, Frontend, UI, Scraper, QA, DevOps) görev dağılımları bulunmaktadır. Herhangi bir değişiklik yapmadan önce projenin ilgili yönergelerini okuduğunuzdan ve sistem mimarisine sadık kaldığınızdan emin olun.

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
