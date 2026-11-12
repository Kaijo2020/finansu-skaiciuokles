# Planas

Žymėjimas: `[ ]` – nepadaryta, `[x]` – padaryta. Dirbame po vieną žingsnį iš eilės.
Kiekvieno žingsnio pabaigoje: patikrinimas naršyklėje + trumpas „ką išmokau“.

## A. Pagrindai

- [x] 0. Sukurti `CLAUDE.md` ir `PLAN.md`.
- [x] 1. **Pirmas puslapis.** `index.html` su antrašte ir dviem nuorodomis (kol kas į tuščius
      puslapius). *Išmoksiu: HTML dokumento sandara, žymės, nuorodos.*
- [x] 2. **Bendras stilius.** `css/stilius.css`: spalvos, šriftai, kortelės, mygtukai, išdėstymas
      telefonui ir kompiuteriui. *Išmoksiu: CSS selektoriai, kintamieji, „mobile first“.*
- [x] 3. **Sumų skaitymas ir rodymas.** `js/bendra.js`: funkcija, kuri supranta „1.200“, „1 200“,
      „1.200,50“, „12,5“, ir funkcija, kuri rodo `1 234,56 €`. Kartu `testai.html`, kuris
      automatiškai patikrina šias funkcijas. *Išmoksiu: JavaScript funkcijos, tekstas ir skaičiai, testai.*
- [x] 4. **Išsaugojimas naršyklėje.** Pagalbinės funkcijos duomenims įrašyti į `localStorage` ir
      nuskaityti (su versijos numeriu). *Išmoksiu: objektai, JSON, kas yra localStorage.*

## B. 1 skaičiuoklė – mėnesio biudžetas (`biudzetas.html`)

- [x] 5. **Duomenų modelis ir rodymas.** Kategorijos su eilutėmis (pajamos ir išlaidos),
      išgalvoti pavyzdiniai duomenys, jų atvaizdavimas puslapyje. *Išmoksiu: masyvai, ciklai, DOM.*
- [x] 6. **Redagavimas.** Keisti pavadinimus ir sumas, pridėti / ištrinti eilutes ir kategorijas;
      viskas išsaugoma automatiškai. *Išmoksiu: įvykiai (events), būsena → atvaizdavimas.*
- [x] 7. **Periodiškumas ir suvestinė.** Kiekvienai eilutei mėnesinė / ketvirtinė / metinė,
      perskaičiavimas į mėnesį; viršuje visada matomi pajamos, išlaidos, likutis.
      *Išmoksiu: skaičiavimo funkcijos, `position: sticky`.*
      Papildyta: pajamas ir išlaidas galima įrašyti tiesiai viršutinėje juostoje (suma atsiduria
      vienoje eilutėje; jei eilučių kelios – prieš sujungiant paklausiama).
- [x] 8. **50/30/20.** Kiekviena išlaida žymima „Būtina / Noras / Taupymas“; palyginimas su
      50/30/20 taisykle (juostos su faktine ir rekomenduojama dalimi). *Išmoksiu: grupavimas, procentai.*
- [x] 9. **Mėnesių skiltis.** Kiekvienam mėnesiui planas ir faktas, skirtumas.
      Sutarta: faktas vedamas pagal kategoriją; planas užfiksuojamas pradedant mėnesį
      ir pats nesikeičia (yra mygtukas „Atnaujinti planą iš biudžeto“).
      Pajamų faktas pradedant mėnesį užpildomas plano suma ir taisomas ranka.
      *Išmoksiu: datos, sudėtingesnė duomenų struktūra, skirtukai (tabs).*
- [x] 10. **Metų apžvalga.** 12 mėnesių lentelė: planas, faktas, skirtumas, sumos per metus.
      *Išmoksiu: lentelės, sumavimas, lentelė telefone.*
- [x] 11. **Atsarginės kopijos.** JSON eksportas ir importas (su patikrinimu, ar failas tinkamas),
      CSV eksportas (atsidaro „Excel“ su lietuviškomis raidėmis). *Išmoksiu: failų kūrimas ir
      skaitymas naršyklėje, duomenų tikrinimas.*

## C. 2 skaičiuoklė – investavimas (`investavimas.html`)

- [x] 12. **Įvestys ir pagrindinė formulė.** Mėnesio įmoka, laikotarpis, pradinė suma, viena grąža;
      rezultatas: įmokėta, vertė, prieaugis. *Išmoksiu: sudėtinės palūkanos, ciklas per mėnesius.*
- [x] 13. **Scenarijai ir kaštai.** 3 grąžos scenarijai (4 / 6 / 8 %), TER, komisinis už pirkimą,
      infliacija; rezultatai: mokesčiai (kaštai) ir vertė šiandienos pinigais.
      *Išmoksiu: ta pati funkcija su skirtingais parametrais, reali ir nominali vertė.*
- [x] 14. **Grafikas.** Vertė per metus trims scenarijams ir įmokėta suma, nupiešta SVG be bibliotekų.
      *Išmoksiu: SVG, duomenų pavertimas koordinatėmis.*
- [x] 15. **Lietuvos GPM.** Nustatymai (tarifas, metinė lengvata) vienoje vietoje su pastaba
      „pasitikrinti VMI“; du režimai: paprasta sąskaita ir investicinė sąskaita (apmokestinama tik
      tai, kas išimama virš įmokų, be lengvatos). *Išmoksiu: nustatymų atskyrimas nuo logikos.*
      Prieš šį žingsnį kartu pasitikriname galiojančius tarifus vmi.lt.
      Būklė (2026-11): numatyta 15 % ir 500 € paprastoje sąskaitoje, 15 % be lengvatos investicinėje.
      Patikrinta tik pagal antrinius šaltinius (KPMG apžvalga, paieška) – oficialių VMI dokumentų
      automatiškai perskaityti nepavyko. NAUDOTOJUI DAR REIKIA PATIKRINTI vmi.lt/evmi/5725 ir
      vmi.lt/evmi/5552, ypač tarifą investicijoms, laikytoms trumpiau nei 5 metus, ir 12 VDU ribą.
- [x] 16. **Įmokų žurnalas.** Realios įmokos su datomis ir (nebūtinai) dabartinė portfelio vertė;
      prognozė tęsiama nuo faktinių duomenų. *Išmoksiu: sąrašo redagavimas, rikiavimas pagal datą.*
- [x] 17. **Atsarginės kopijos.** JSON eksportas / importas ir žurnalo CSV (panaudojant tai,
      ką parašėme 11 žingsnyje). *Išmoksiu: kodo pakartotinis naudojimas.*

## D. Užbaigimas ir paskelbimas

- [x] 18. **Galutinė peržiūra.** Pradinis puslapis su aprašymais, patikra telefone, klaviatūra,
      tuščių ir klaidingų įvesčių atvejai, pastaba apie privatumą („duomenys lieka jūsų naršyklėje“).
- [ ] 19. **Git ir GitHub.** Kas yra versijų kontrolė, saugyklos sukūrimas, `.gitignore`,
      pirmasis įkėlimas. Prieš tai – patikra, kad kode nėra asmeninių duomenų.
      Būklė (2026-11-12): asmeninių duomenų patikra atlikta (švaru), sukurti `.gitignore` ir `README.md`.
      Laukiama naudotojo: įdiegti Git (`winget install --id Git.Git -e --source winget`),
      susikurti GitHub paskyrą, pasakyti naudotojo vardą ir saugyklos pavadinimą.
      Tada: git init, pirmas įrašas, saugyklos sukūrimas GitHub svetainėje, git push.
      Papildyta: atskiro Git nėra, bet įdiegtas GitHub Desktop – naudojamas jo viduje esantis Git
      (`%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe`). Vietinė saugykla sukurta
      (`main`), 17 failų paruošta įrašui, įrašas DAR NEPADARYTAS – laukiama naudotojo sprendimo dėl
      el. pašto adreso įrašuose (siūloma GitHub „noreply“). Įkėlimas – per GitHub Desktop „Publish repository“.
- [ ] 20. **GitHub Pages.** Svetainės paskelbimas, nuorodos patikra telefone, kaip atnaujinti vėliau.

## Idėjos vėliau (ne dabar)

- Tamsus režimas.
- Spausdinimui pritaikytas vaizdas.
- Daugiau skaičiuoklių (pvz., paskolos, finansinė pagalvė).
