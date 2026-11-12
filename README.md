# Finansų skaičiuoklės

Nedidelė svetainė su dviem asmeninių finansų skaičiuoklėmis. Sukurta mokantis programuoti.

- **Mėnesio biudžetas** – pajamos ir išlaidos pagal kategorijas, 50/30/20 taisyklė,
  planas ir faktas kiekvienam mėnesiui, metų apžvalga.
- **Investavimas** – periodinio investavimo į ETF prognozė trimis scenarijais:
  fondo mokesčiai, infliacija, GPM, grafikas ir įmokų žurnalas.

## Kaip naudoti

Atidarykite `index.html` naršyklėje – nieko diegti nereikia. Veikia ir telefone.

## Privatumas

Viskas, ką įvedate, saugoma tik jūsų naršyklėje (`localStorage`). Niekas niekur nesiunčiama:
nėra serverio, paskyrų, slapukų ar sekimo. Duomenis į kitą įrenginį galima perkelti
atsargine kopija (mygtukas „Išsaugoti kopiją“).

## Svarbu

Skaičiuoklės yra orientacinės – tai nėra finansinis, investavimo ar mokesčių patarimas.
Mokesčių tarifus ir lengvatas būtina pasitikrinti [VMI](https://www.vmi.lt/).

## Kaip sukurta

Tik paprastas HTML, CSS ir JavaScript – be karkasų, bibliotekų ir diegimo įrankių.
Skaičiavimai tikrinami automatiniais testais: atidarykite `testai.html`.

| Failas | Kas jame |
|---|---|
| `index.html` | pradinis puslapis |
| `biudzetas.html`, `investavimas.html` | skaičiuoklės |
| `testai.html` | automatiniai testai |
| `css/stilius.css` | bendras stilius |
| `js/` | skaičiavimai ir puslapių logika |
| `PLAN.md`, `CLAUDE.md` | kūrimo planas ir taisyklės |
