# Aréna online – vlastní server

Hra pro 2–16 hráčů na velké mapě. Hráči se připojují přes veřejnou adresu, **účet na Claude nepotřebují**.
Každý nově připojený dostane o číslo vyšší než předchozí (uvolněná čísla se znovu použijí).

## Co je v balíčku
- `server.js` – server (Node.js 18+), servíruje hru a přenáší stav hráčů
- `public/index.html` – hra
- `package.json` – seznam závislostí (jediná: `ws`)

## A) Hrajete ve stejné Wi‑Fi (nejrychlejší)
1. Nainstaluj Node.js (https://nodejs.org).
2. V této složce spusť: `npm install` a pak `npm start`.
3. Kamarádi otevřou `http://IP-TVÉHO-POČÍTAČE:3000` (IP zjistíš příkazem `ipconfig` / `ifconfig`).

## B) Veřejný web zdarma (Render.com)
1. Založ si účet na https://github.com a nový repozitář; nahraj do něj všechny soubory z této složky (kromě `node_modules`).
2. Založ účet na https://render.com → **New → Web Service** → propoj GitHub repozitář.
3. Nastavení: Runtime **Node**, Build command `npm install`, Start command `npm start`, plán **Free**.
4. Po nasazení dostaneš adresu `https://něco.onrender.com`. Tu pošli kamarádům.

Poznámky: zdarma plán po nečinnosti uspí server, první otevření pak trvá asi minutu. Fungují i jiné hostingy s Node.js (Fly.io, Railway…); server čte port z proměnné `PORT`.

## Ovládání
- Menu → **🌐 Online (G)**.
- Držíš tlačítko (A) = jdeš vpřed, každé stisknutí = výstřel. 🔄 (S) přepíná zbraň/nůž.
- Zbraň a skiny si bere hráč ze svého prohlížeče (obchod ve hře, ukládá se lokálně).

## Omezení
- Hra věří klientům (každý počítá svoje zásahy), takže jde snadno podvádět. Pro hru s kamarády to stačí.
- Server drží stav jen v paměti, po restartu se vše vynuluje.
- Zpoždění sítě může způsobit, že střelba u ostatních přijde o chvilku později.
