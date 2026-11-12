# Asmeninių finansų skaičiuoklės – projekto taisyklės

Nedidelė svetainė su asmeninių finansų skaičiuoklėmis. Kuriama mokantis, nuo nulio,
vėliau skelbiama per GitHub Pages ir rodoma šeimai.

## Kiekvienos sesijos pradžia

1. Perskaityk šį failą ir `PLAN.md`.
2. Tęsk nuo pirmo nepažymėto `[ ]` žingsnio. Nepradėk kelių žingsnių iš karto.

## Kaip dirbame

- Bendraujame lietuviškai.
- Naudotojas – pradedantysis (IT išsilavinimas, programavimo patirties nėra). Aiškink paprastai,
  naujus terminus paaiškink pirmą kartą juos pavartojęs.
- Prieš didesnį veiksmą trumpai paaiškink, ką darysi ir kodėl, ir palauk patvirtinimo.
- Vienu metu – vienas `PLAN.md` žingsnis. Po kiekvieno žingsnio:
  1. pažymėk jį `[x]` faile `PLAN.md`;
  2. pasakyk, kurį failą atidaryti naršyklėje ir ką tiksliai patikrinti;
  3. 2–3 sakiniais paaiškink, ko naudotojas išmoko;
  4. kartais pasiūlyk mažą užduotį, kurią naudotojas gali pabandyti pats.
- Jei planas keičiasi, pirmiausia atnaujink `PLAN.md`, tada rašyk kodą.

## Technologijos

- Tik paprastas HTML, CSS ir JavaScript. Jokių karkasų, bibliotekų, diegimo ar kūrimo įrankių
  (jokio npm, jokio „build“ žingsnio).
- Kiekviena skaičiuoklė – atskiras puslapis; `index.html` – pradinis puslapis su nuorodomis.
- Turi veikti tiesiog atidarius failą naršyklėje (`file://`). Todėl:
  - scenarijai jungiami paprastu `<script src="...">`, **ne** `type="module"`
    (moduliai atidarius failą tiesiogiai neveikia);
  - jokio `fetch()` į vietinius failus;
  - visi keliai santykiniai (`css/stilius.css`, ne `/css/stilius.css`) – to reikia ir GitHub Pages.
- Jokių išorinių išteklių: šriftų, piktogramų, grafikų bibliotekų, CDN. Grafikus piešiame patys (SVG).
- Pritaikyta mobiliesiems: `<meta name="viewport">`, išdėstymas pirmiausia telefonui,
  pakankamai dideli mygtukai ir laukai, jokio horizontalaus slinkimo.

## Duomenys ir privatumas

- Duomenys saugomi tik naršyklėje (`localStorage`). Jokių serverių, paskyrų, slapukų,
  analitikos ar išorinių paslaugų.
- Kode ir pavyzdžiuose – jokių asmeninių duomenų (tikrų sumų, vardų, banko duomenų).
  Numatytosios reikšmės ir pavyzdžiai – išgalvoti, apvalūs skaičiai.
- `localStorage` raktai su priešdėliu `finansai.` ir duomenų versijos numeriu,
  kad vėliau būtų galima saugiai keisti duomenų struktūrą.
- Eksportuotos atsarginės kopijos (JSON, CSV) į saugyklą nekeliamos (`.gitignore`).

## Sąsaja ir skaičiai

- Visa sąsaja lietuviškai, `<html lang="lt">`.
- Sumos rodomos eurais su 2 skaitmenimis po kablelio, lietuvišku formatu: `1 234,56 €`.
- Įvestys turi būti suprantamos teisingai:

  | Įvesta       | Reikšmė  |
  |--------------|----------|
  | `1.200`      | 1200     |
  | `1 200`      | 1200     |
  | `1.200,50`   | 1200,50  |
  | `12,5`       | 12,5     |

  Taisyklė: kablelis – dešimtainis skyriklis; tarpai – tūkstančių skyriklis;
  taškas – tūkstančių skyriklis, kai po jo lygiai 3 skaitmenys arba kai yra ir kablelis,
  kitu atveju – dešimtainis (`12.5` → 12,5). Neaiški įvestis – klaida prie lauko, o ne tylus nulis.
- Sumoms skaityti ir rodyti naudojamos tik bendros funkcijos iš `js/bendra.js` – niekur kitur
  nekartojame šios logikos.
- Sumų laukai – `type="text"` su `inputmode="decimal"` (ne `type="number"`, nes šis
  nepriima kablelio ir tarpų vienodai visose naršyklėse).

## Mokesčiai (investavimo skaičiuoklė)

- GPM tarifai ir lengvatos – ne formulėse, o vienoje aiškiai pažymėtoje nustatymų vietoje,
  keičiami ir pačiame puslapyje.
- Šalia visada pastaba: tarifus ir lengvatas būtina pasitikrinti VMI (vmi.lt);
  skaičiuoklė – orientacinė, ne mokesčių ar investavimo patarimas.

## Kodo stilius

- Failų pavadinimai – mažosiomis, be lietuviškų raidžių ir tarpų (`biudzetas.html`).
- Kintamųjų ir funkcijų pavadinimai – lietuviški be diakritinių ženklų (`menesioSuma`),
  komentarai – lietuviškai, aiškinantys „kodėl“.
- Skaičiavimai atskirti nuo atvaizdavimo: grynosios funkcijos (įvestis → rezultatas) atskirai,
  kad jas būtų galima patikrinti `testai.html`.
- Naudotojo įvestas tekstas į puslapį dedamas per `textContent`, ne `innerHTML`.

## Tikrinimas po kiekvieno pakeitimo

- Atidaryk pakeistą puslapį naršyklėje ir patikrink, kad konsolėje nėra klaidų.
- Atidaryk `testai.html` – visi testai turi būti žali.
- Patikrink siaurame (telefono pločio, ~375 px) lange.
- Jei keitėsi saugomų duomenų struktūra – patikrink, kad seni išsaugoti duomenys vis dar atsidaro.
- Kaip Claude gali pamatyti puslapį pats: `file://` adresai programos naršyklėje rodomi be CSS ir JS,
  todėl peržiūrai yra vietinis serveris – `preview_start` su vardu `perziura` (žr. `.claude/launch.json`),
  tada `http://localhost:4173/biudzetas.html` ir pan. Serveris skirtas tik peržiūrai, ne svetainei.
- Naudotojui po kiekvieno žingsnio patogu, kai puslapiai atidaromi jo naršyklėje
  (`Start-Process` su failo keliu).

## Failų struktūra

```
index.html            pradinis puslapis su nuorodomis
biudzetas.html        1 skaičiuoklė – mėnesio biudžetas
investavimas.html     2 skaičiuoklė – periodinis investavimas į ETF
testai.html           automatiniai skaičiavimų testai (atidaromi naršyklėje)
css/stilius.css       bendras stilius
js/bendra.js          sumų skaitymas/rodymas, localStorage, eksportas/importas
js/biudzetas.js       biudžeto logika
js/menesiai.js        mėnesių skiltis (planas ir faktas); duomenys laikomi biudzetas.menesiai
js/metai.js           metų apžvalga (skaičiuojama iš biudzetas.menesiai, savo duomenų neturi)
js/kopijos.js         biudžeto atsarginė kopija (JSON eksportas / importas) ir CSV eksportas
js/grafikas.js        linijinis SVG grafikas (be bibliotekų), naudojamas investavimo puslapyje
js/investavimas.js    investavimo logika
js/testai.js          testai
CLAUDE.md             šios taisyklės
PLAN.md               žingsnių planas
.claude/              pagalbiniai peržiūros failai (ne svetainės dalis, į GitHub nekeliami)
```
