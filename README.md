# PravachiUZ - Next.js Application

Bu loyiha Next.js 14 va React 18 asosida qurilgan zamonaviy web ilova. HTML/CSS/JS kodlari Next.js ga to'liq o'tkazildi.

## O'rnatish

1. Dependencies o'rnatish:
```bash
npm install
```

2. Development server ishga tushirish:
```bash
npm run dev
```

3. Browserda ochish:
```
http://localhost:3000
```

## Build

Production build yaratish:
```bash
npm run build
```

Production server ishga tushirish:
```bash
npm start
```

## Struktura

```
/
├── app/
│   ├── layout.js          # Root layout (fonts, metadata)
│   ├── page.js            # Home page (landing)
│   ├── login/
│   │   └── page.js        # Login page (Google & Phone)
│   ├── dashboard/
│   │   └── page.js        # Dashboard page (main app)
│   └── globals.css        # Global styles (all CSS)
├── components/
│   └── Navbar.js          # Navigation component
├── public/
│   └── imgage/            # Static images
├── package.json
├── tailwind.config.js     # Tailwind configuration
├── next.config.js         # Next.js configuration
├── postcss.config.js      # PostCSS configuration
└── jsconfig.json          # Path aliases
```

## Funksiyalar

- ✅ Responsive dizayn (mobile, tablet, desktop)
- ✅ Dark/Light mode toggle
- ✅ Google va Telefon orqali login (Mock)
- ✅ Dashboard sahifasi
- ✅ Tailwind CSS
- ✅ AOS animations
- ✅ Next.js App Router
- ✅ Image optimization
- ✅ Client-side routing

## Texnologiyalar

- **Next.js 14** - React framework
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **AOS** - Animate On Scroll

## Sahifalar

- `/` - Home page (landing)
- `/login` - Login page
- `/dashboard` - Dashboard (protected)

## O'zgarishlar

HTML/CSS/JS kodlari Next.js ga to'liq o'tkazildi:
- ✅ Barcha sahifalar React komponentlariga aylantirildi
- ✅ CSS fayllar `globals.css` ga birlashtirildi
- ✅ JavaScript funksiyalar React hooks ga o'tkazildi
- ✅ Routing Next.js App Router orqali amalga oshirildi
- ✅ Images Next.js Image komponenti orqali optimizatsiya qilindi

## Eslatma

Login funksiyalari hozircha mock (demo) rejimida ishlaydi. Haqiqiy API integratsiyasi qo'shish kerak.

## Keyingi qadamlar

1. API integratsiyasi qo'shish
2. Authentication middleware
3. Database ulash
4. Real-time funksiyalar
