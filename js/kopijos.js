// Biudžeto atsarginės kopijos: eksportas ir importas (JSON), eksportas į CSV.
// Naudoja funkcijas iš bendra.js, biudzetas.js ir menesiai.js, todėl įkeliamas po jų.

// ---------- 1. Duomenų paruošimas (be puslapio – tikrinama testais) ----------

// Bendros kopijų funkcijos (sudarytiKopija, skaitytiKopija, paruostiFailoImporta) yra bendra.js –
// jomis naudojasi ir investavimo skaičiuoklė. Čia lieka tik tai, kas būdinga biudžetui.

// Sudaro biudžeto atsarginės kopijos objektą: biudžetas su mėnesiais.
function sudarytiBiudzetoKopija(biudzetas, data) {
  return sudarytiKopija("biudzetas", BIUDZETO_VERSIJA, biudzetas, data);
}

// Perskaito biudžeto kopijos failo tekstą. Grąžina { duomenys } arba { klaida }.
function skaitytiBiudzetoKopija(tekstas) {
  return skaitytiKopija(tekstas, "biudzetas", BIUDZETO_VERSIJA, arTinkamasBiudzetas, "biudžeto");
}
// Suranda užrašą žmogui pagal reikšmę sąraše (tinka PERIODISKUMAI ir ZYMOS).
function rastiPavadinima(sarasas, reiksme) {
  for (const narys of sarasas) {
    if (narys.reiksme === reiksme) {
      return narys.pavadinimas;
    }
  }
  return "";
}

function tipoPavadinimas(tipas) {
  return tipas === "pajamos" ? "Pajamos" : "Išlaidos";
}

// Biudžeto lentelė CSV failui: pirma eilutė – stulpelių pavadinimai, toliau po eilutę kiekvienai biudžeto eilutei.
function biudzetoCsvEilutes(biudzetas) {
  const eilutes = [["Tipas", "Kategorija", "Eilutė", "Suma", "Periodiškumas", "Rūšis", "Suma per mėnesį"]];
  for (const kategorija of biudzetas.kategorijos) {
    for (const eilute of kategorija.eilutes) {
      eilutes.push([
        tipoPavadinimas(kategorija.tipas),
        kategorija.pavadinimas,
        eilute.pavadinimas,
        eilute.suma,
        rastiPavadinima(PERIODISKUMAI, eilutesMenesiu(eilute) === 1 ? "menesine" : eilute.periodiskumas),
        kategorija.tipas === "islaidos" ? rastiPavadinima(ZYMOS, eilutesZyma(eilute)) : "",
        menesioSuma(eilute),
      ]);
    }
  }
  return eilutes;
}

// Mėnesių lentelė CSV failui: po eilutę kiekvienai kiekvieno mėnesio kategorijai, mėnesiai iš eilės.
// Neįvestas faktas paliekamas tuščias (ne 0).
function menesiuCsvEilutes(biudzetas) {
  const eilutes = [["Mėnuo", "Tipas", "Kategorija", "Planas", "Faktas", "Skirtumas"]];
  // sort() surikiuoja raktus abėcėlės tvarka, o "2026-01", "2026-02"… tai ir yra chronologinė tvarka.
  const raktai = Object.keys(biudzetas.menesiai).sort();
  for (const raktas of raktai) {
    for (const eilute of biudzetas.menesiai[raktas].eilutes) {
      eilutes.push([
        raktas,
        tipoPavadinimas(eilute.tipas),
        eilute.pavadinimas,
        eilute.planas,
        eilute.faktas,
        eilute.faktas === null ? null : eilute.faktas - eilute.planas,
      ]);
    }
  }
  return eilutes;
}

// ---------- 2. Veiksmai puslapyje ----------

// Išsaugo visą biudžetą su mėnesiais į JSON failą.
function eksportuotiKopija() {
  eksportuotiJson("biudzetas", sudarytiBiudzetoKopija(biudzetas, new Date()));
}

// Atkuria duomenis iš kopijos failo teksto. Prieš pakeičiant dabartinius duomenis paklausia.
function importuotiTeksta(tekstas) {
  const rezultatas = skaitytiBiudzetoKopija(tekstas);
  if (rezultatas.klaida) {
    rodytiKopijosBusena(rezultatas.klaida + " Dabartiniai duomenys nepakeisti.", true);
    return;
  }

  const nauji = rezultatas.duomenys;
  uztikrintiMenesius(nauji);
  const klausimas =
    "Kopijoje yra " + nauji.kategorijos.length + " kategorijų ir " + Object.keys(nauji.menesiai).length +
    " mėnesių duomenys. Pakeisti jais viską, kas dabar yra šioje naršyklėje? Dabartiniai duomenys bus prarasti.";
  if (!confirm(klausimas)) {
    rodytiKopijosBusena("Atkūrimas atšauktas. Dabartiniai duomenys nepakeisti.", false);
    return;
  }

  biudzetas = nauji;
  issaugotiBiudzeta();
  perpiestiBiudzeta();
  rodytiSkilti("biudzetas");
  rodytiKopijosBusena("Duomenys atkurti iš kopijos.", false);
}

// Prijungia kortelės „Atsarginė kopija“ mygtukus. Kviečiama iš paleistiBiudzeta().
function paruostiKopijas() {
  document.getElementById("eksportuoti").addEventListener("click", eksportuotiKopija);

  document.getElementById("csv-biudzetas").addEventListener("click", function () {
    eksportuotiCsv("biudzetas", biudzetoCsvEilutes(biudzetas));
  });

  document.getElementById("csv-menesiai").addEventListener("click", function () {
    if (Object.keys(biudzetas.menesiai).length === 0) {
      rodytiKopijosBusena("Dar nepradėtas nė vienas mėnuo, todėl nėra ko eksportuoti.", true);
      return;
    }
    eksportuotiCsv("biudzeto-menesiai", menesiuCsvEilutes(biudzetas));
  });

  paruostiFailoImporta("importuoti", "importo-failas", importuotiTeksta);
}