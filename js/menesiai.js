// Mėnesių skiltis: planas ir faktas kiekvienam mėnesiui.
// Šis failas naudoja funkcijas iš bendra.js ir biudzetas.js, todėl turi būti įkeltas po jų.
//
// Mėnesių duomenys laikomi tame pačiame biudžeto objekte, lauke „menesiai“:
//   biudzetas.menesiai = {
//     "2026-11": {
//       eilutes: [
//         { kategorijosId: "k2", pavadinimas: "Būstas", tipas: "islaidos", planas: 630, faktas: 655.2 },
//         ...
//       ]
//     }
//   }
// Planas ir kategorijos pavadinimas nukopijuojami pradedant mėnesį ir vėliau patys nesikeičia –
// net jei biudžetas pakeičiamas ar kategorija ištrinama. „faktas: null“ reiškia „dar neįvesta“.

// ---------- 1. Datos ----------

const MENESIU_PAVADINIMAI = [
  "sausis", "vasaris", "kovas", "balandis", "gegužė", "birželis",
  "liepa", "rugpjūtis", "rugsėjis", "spalis", "lapkritis", "gruodis",
];

// Mėnesio raktas – tekstas „metai-mėnuo“, pvz. menesioRaktas(2026, 3) -> "2026-03".
// Toks formatas patogus, nes rikiuojant kaip tekstą mėnesiai išsirikiuoja chronologiškai.
function menesioRaktas(metai, menuo) {
  return metai + "-" + String(menuo).padStart(2, "0");
}

// Ar tekstas yra teisingas mėnesio raktas?
function arMenesioRaktas(raktas) {
  return typeof raktas === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(raktas);
}

// Mėnesio raktas iš datos. JavaScript mėnesius skaičiuoja nuo 0 (sausis = 0), todėl pridedame 1.
function dabartinisMenuo(data) {
  return menesioRaktas(data.getFullYear(), data.getMonth() + 1);
}

// Ankstesnis (poslinkis -1) arba kitas (poslinkis 1) mėnuo. Teisingai pereina per metų ribą.
function gretimasMenuo(raktas, poslinkis) {
  const metai = Number(raktas.slice(0, 4));
  const menuo = Number(raktas.slice(5, 7));
  // Mėnesius sunumeruojame iš eilės nuo metų pradžios skaičiavimo – tada užtenka pridėti poslinkį.
  const numeris = metai * 12 + (menuo - 1) + poslinkis;
  return menesioRaktas(Math.floor(numeris / 12), (numeris % 12) + 1);
}

// "2026-11" -> "2026 m. lapkritis"
function menesioPavadinimas(raktas) {
  const menuo = Number(raktas.slice(5, 7));
  return raktas.slice(0, 4) + " m. " + MENESIU_PAVADINIMAI[menuo - 1];
}

// ---------- 2. Skaičiavimai ir keitimai ----------

// Jei biudžete dar nėra mėnesių lauko (pvz. duomenys išsaugoti prieš atsirandant šiai skilčiai),
// sukuriame tuščią.
function uztikrintiMenesius(biudzetas) {
  if (biudzetas.menesiai === undefined) {
    biudzetas.menesiai = {};
  }
}

// Iš dabartinio biudžeto padaro mėnesio eilutes: po vieną kiekvienai kategorijai.
// Pajamų faktas iš karto užpildomas plano suma (pajamos dažniausiai būna tokios, kokių tikėtasi),
// ją galima pataisyti ranka. Išlaidų faktas paliekamas neįvestas.
function sukurtiMenesioEilutes(biudzetas) {
  return biudzetas.kategorijos.map(function (kategorija) {
    const planas = Math.round(kategorijosSuma(kategorija) * 100) / 100;
    return {
      kategorijosId: kategorija.id,
      pavadinimas: kategorija.pavadinimas,
      tipas: kategorija.tipas,
      planas: planas,
      faktas: kategorija.tipas === "pajamos" ? planas : null,
    };
  });
}

// Pradeda mėnesį: užfiksuoja planą iš dabartinio biudžeto.
function pradetiMenesi(biudzetas, raktas) {
  biudzetas.menesiai[raktas] = { eilutes: sukurtiMenesioEilutes(biudzetas) };
  return biudzetas.menesiai[raktas];
}

// Atnaujina jau pradėto mėnesio planą iš dabartinio biudžeto. Įvesti faktai išlieka.
// Kategorija, kurios biudžete nebėra, paliekama tik tada, jei jai buvo įvestas faktas.
function atnaujintiMenesioPlana(biudzetas, raktas) {
  const senos = biudzetas.menesiai[raktas].eilutes;
  const naujos = sukurtiMenesioEilutes(biudzetas);

  for (const nauja of naujos) {
    const sena = senos.find(function (eilute) {
      return eilute.kategorijosId === nauja.kategorijosId;
    });
    if (sena) {
      nauja.faktas = sena.faktas;
    }
  }

  for (const sena of senos) {
    const arYraBiudzete = naujos.some(function (eilute) {
      return eilute.kategorijosId === sena.kategorijosId;
    });
    if (!arYraBiudzete && sena.faktas !== null) {
      naujos.push({
        kategorijosId: sena.kategorijosId,
        pavadinimas: sena.pavadinimas,
        tipas: sena.tipas,
        planas: 0,
        faktas: sena.faktas,
      });
    }
  }

  biudzetas.menesiai[raktas].eilutes = naujos;
}

// Ištrina mėnesio duomenis.
function istrintiMenesi(biudzetas, raktas) {
  delete biudzetas.menesiai[raktas];
}

// Mėnesio suvestinė: planas ir faktas pajamoms, išlaidoms ir likučiui.
// Neįvestas faktas skaičiuojamas kaip 0, todėl kartu grąžiname, kiek kategorijų užpildyta.
function menesioSuvestine(menuo) {
  const s = {
    pajamos: { planas: 0, faktas: 0 },
    islaidos: { planas: 0, faktas: 0 },
    likutis: { planas: 0, faktas: 0 },
    uzpildyta: 0,
    isViso: menuo.eilutes.length,
  };
  for (const eilute of menuo.eilutes) {
    const dalis = eilute.tipas === "pajamos" ? s.pajamos : s.islaidos;
    dalis.planas = dalis.planas + eilute.planas;
    if (eilute.faktas !== null) {
      dalis.faktas = dalis.faktas + eilute.faktas;
      s.uzpildyta = s.uzpildyta + 1;
    }
  }
  s.likutis.planas = s.pajamos.planas - s.islaidos.planas;
  s.likutis.faktas = s.pajamos.faktas - s.islaidos.faktas;
  return s;
}

// Žodžiais įvertina skirtumą tarp fakto ir plano.
// Išlaidoms geriau, kai faktas mažesnis; pajamoms ir likučiui – kai didesnis.
// Grąžina tekstą ir CSS klasę (spalvą).
function skirtumoVertinimas(tipas, planas, faktas) {
  if (faktas === null) {
    return { tekstas: "faktas neįvestas", klase: "blankus" };
  }
  // Lyginame centais, kad 0,001 € skirtumas nebūtų laikomas skirtumu.
  const centais = Math.round((faktas - planas) * 100);
  if (centais === 0) {
    return { tekstas: "pagal planą", klase: "blankus" };
  }
  const kiek = rodytiSuma(Math.abs(centais) / 100);
  if (tipas === "islaidos") {
    return centais > 0
      ? { tekstas: "viršyta " + kiek, klase: "neigiama" }
      : { tekstas: "liko " + kiek, klase: "teigiama" };
  }
  return centais > 0
    ? { tekstas: "daugiau " + kiek, klase: "teigiama" }
    : { tekstas: "mažiau " + kiek, klase: "neigiama" };
}

// Patikrina, ar mėnesių duomenys tinkamos formos (naudojama skaitant išsaugotus duomenis).
function arTinkamiMenesiai(menesiai) {
  if (menesiai === null || typeof menesiai !== "object" || Array.isArray(menesiai)) {
    return false;
  }
  for (const raktas of Object.keys(menesiai)) {
    const menuo = menesiai[raktas];
    if (!arMenesioRaktas(raktas) || menuo === null || typeof menuo !== "object" || !Array.isArray(menuo.eilutes)) {
      return false;
    }
    for (const eilute of menuo.eilutes) {
      if (eilute === null || typeof eilute !== "object") {
        return false;
      }
      if (typeof eilute.kategorijosId !== "string" || typeof eilute.pavadinimas !== "string") {
        return false;
      }
      if (eilute.tipas !== "pajamos" && eilute.tipas !== "islaidos") {
        return false;
      }
      if (!arTinkamaSuma(eilute.planas)) {
        return false;
      }
      if (eilute.faktas !== null && !arTinkamaSuma(eilute.faktas)) {
        return false;
      }
    }
  }
  return true;
}

// ---------- 3. Rodymas ir redagavimas ----------

// Kuris mėnuo dabar rodomas.
let pasirinktasMenuo = null;

// Funkcijos, kurias reikia iškviesti pasikeitus bet kuriam faktui (atnaujina sumas ir vertinimus).
let menesioAtnaujinimai = [];

function atnaujintiMenesioRodiklius() {
  for (const atnaujinti of menesioAtnaujinimai) {
    atnaujinti();
  }
}

// Sukuria teksto vietą, kuri pati atsinaujina. „gauti“ grąžina { tekstas, klase }.
function sukurtiMenesioRodikli(zyme, gauti) {
  const elementas = sukurtiElementa(zyme);
  function atnaujinti() {
    const rezultatas = gauti();
    elementas.textContent = rezultatas.tekstas;
    elementas.className = rezultatas.klase;
  }
  atnaujinti();
  menesioAtnaujinimai.push(atnaujinti);
  return elementas;
}

// Mėnesio pasirinkimas: rodyklė atgal, pavadinimas, rodyklė pirmyn.
function sukurtiMenesioNavigacija() {
  const navigacija = sukurtiElementa("div", "menesio-navigacija");

  const atgal = sukurtiElementa("button", "antrinis", "←");
  atgal.type = "button";
  atgal.setAttribute("aria-label", "Ankstesnis mėnuo");
  atgal.addEventListener("click", function () {
    pasirinktasMenuo = gretimasMenuo(pasirinktasMenuo, -1);
    perpiestiMenesi();
  });

  const pirmyn = sukurtiElementa("button", "antrinis", "→");
  pirmyn.type = "button";
  pirmyn.setAttribute("aria-label", "Kitas mėnuo");
  pirmyn.addEventListener("click", function () {
    pasirinktasMenuo = gretimasMenuo(pasirinktasMenuo, 1);
    perpiestiMenesi();
  });

  navigacija.appendChild(atgal);
  navigacija.appendChild(sukurtiElementa("h2", "", menesioPavadinimas(pasirinktasMenuo)));
  navigacija.appendChild(pirmyn);
  return navigacija;
}

// Vienas suvestinės stulpelis: pavadinimas, faktas, planas ir vertinimas.
function sukurtiMenesioSuvestinesStulpeli(menuo, tipas, pavadinimas) {
  const stulpelis = sukurtiElementa("div");
  stulpelis.appendChild(sukurtiElementa("span", "suvestines-pavadinimas", pavadinimas));
  stulpelis.appendChild(sukurtiMenesioRodikli("span", function () {
    return { tekstas: rodytiSuma(menesioSuvestine(menuo)[tipas].faktas), klase: "suvestines-reiksme" };
  }));
  stulpelis.appendChild(sukurtiElementa("span", "suvestines-pavadinimas", "planas " + rodytiSuma(menesioSuvestine(menuo)[tipas].planas)));
  return stulpelis;
}

// Viena kategorijos eilutė: pavadinimas, fakto laukas, planas ir vertinimas.
function sukurtiMenesioEilutesElementa(eilute) {
  const punktas = sukurtiElementa("li", "redaguojama-eilute");
  const pavadinimas = eilute.pavadinimas === "" ? "(be pavadinimo)" : eilute.pavadinimas;

  const laukai = sukurtiElementa("div", "eilutes-laukai");
  laukai.appendChild(sukurtiElementa("span", "menesio-kategorija", pavadinimas));

  const faktas = sukurtiLauka(
    "laukas-suma",
    eilute.faktas === null ? "" : formatuotiSkaiciu(eilute.faktas),
    "Faktinė suma: " + pavadinimas,
    "faktas"
  );
  faktas.setAttribute("inputmode", "decimal");
  laukai.appendChild(faktas);

  const klaidosVieta = sukurtiElementa("p", "klaidos-tekstas");
  klaidosVieta.hidden = true;

  faktas.addEventListener("focus", function () {
    faktas.select();
  });

  // Rašant: tuščias laukas reiškia „dar neįvesta“, suprantama suma iškart įrašoma.
  faktas.addEventListener("input", function () {
    const tekstas = faktas.value.trim();
    if (tekstas === "") {
      eilute.faktas = null;
    } else {
      const reiksme = skaitytiSuma(tekstas);
      if (!arTinkamaSuma(reiksme)) {
        return;
      }
      eilute.faktas = Math.round(reiksme * 100) / 100;
    }
    rodytiLaukoKlaida(faktas, klaidosVieta, "");
    issaugotiBiudzeta();
    atnaujintiMenesioRodiklius();
  });

  // Baigus rašyti: sutvarkome formatą arba parodome klaidą.
  faktas.addEventListener("change", function () {
    const tekstas = faktas.value.trim();
    if (tekstas === "") {
      return;
    }
    if (arTinkamaSuma(skaitytiSuma(tekstas))) {
      faktas.value = formatuotiSkaiciu(eilute.faktas);
    } else {
      rodytiLaukoKlaida(faktas, klaidosVieta, "Nesuprantu šios sumos (pavyzdys: 1 200,50).");
    }
  });

  const papildoma = sukurtiElementa("div", "eilutes-papildoma");
  papildoma.appendChild(sukurtiElementa("span", "blankus", "Planas: " + rodytiSuma(eilute.planas)));
  papildoma.appendChild(sukurtiMenesioRodikli("span", function () {
    const vertinimas = skirtumoVertinimas(eilute.tipas, eilute.planas, eilute.faktas);
    return { tekstas: vertinimas.tekstas, klase: "suma " + vertinimas.klase };
  }));

  punktas.appendChild(laukai);
  punktas.appendChild(papildoma);
  punktas.appendChild(klaidosVieta);
  return punktas;
}

// Vieno tipo kategorijų sąrašas kortelėje.
function sukurtiMenesioDali(menuo, tipas, pavadinimas) {
  const dalis = sukurtiElementa("section", "biudzeto-dalis");
  dalis.appendChild(sukurtiElementa("h2", "", pavadinimas));

  const eilutes = menuo.eilutes.filter(function (eilute) {
    return eilute.tipas === tipas;
  });
  if (eilutes.length === 0) {
    dalis.appendChild(sukurtiElementa("p", "blankus", "Šiam mėnesiui kategorijų nėra."));
    return dalis;
  }

  const kortele = sukurtiElementa("div", "kortele");
  const sarasas = sukurtiElementa("ul", "eilutes");
  for (const eilute of eilutes) {
    sarasas.appendChild(sukurtiMenesioEilutesElementa(eilute));
  }
  kortele.appendChild(sarasas);
  dalis.appendChild(kortele);
  if (tipas === "pajamos") {
    dalis.appendChild(sukurtiElementa("p", "blankus pastaba", "Pajamų faktas užpildytas plano suma. Jei gavote kitą sumą, įrašykite ją ranka."));
  }
  return dalis;
}

// Nupiešia pasirinktą mėnesį iš naujo.
function perpiestiMenesi() {
  menesioAtnaujinimai = [];

  const vieta = document.getElementById("menesis");
  vieta.textContent = "";
  vieta.appendChild(sukurtiMenesioNavigacija());

  const menuo = biudzetas.menesiai[pasirinktasMenuo];

  // Mėnuo dar nepradėtas: pasiūlome jį pradėti.
  if (menuo === undefined) {
    const kortele = sukurtiElementa("div", "kortele");
    kortele.appendChild(sukurtiElementa("p", "", "Šio mėnesio duomenų dar nėra."));
    const pradeti = sukurtiElementa("button", "", "Pradėti šį mėnesį");
    pradeti.type = "button";
    pradeti.addEventListener("click", function () {
      pradetiMenesi(biudzetas, pasirinktasMenuo);
      issaugotiBiudzeta();
      perpiestiMenesi();
    });
    kortele.appendChild(pradeti);
    kortele.appendChild(sukurtiElementa("p", "blankus pastaba", "Planas bus nukopijuotas iš dabartinio biudžeto ir užfiksuotas šiam mėnesiui."));
    vieta.appendChild(kortele);
    return;
  }

  // Suvestinė: faktas stambiai, planas smulkiai.
  const suvestine = sukurtiElementa("div", "suvestine");
  suvestine.appendChild(sukurtiMenesioSuvestinesStulpeli(menuo, "pajamos", "Pajamos"));
  suvestine.appendChild(sukurtiMenesioSuvestinesStulpeli(menuo, "islaidos", "Išlaidos"));
  suvestine.appendChild(sukurtiMenesioSuvestinesStulpeli(menuo, "likutis", "Likutis"));
  vieta.appendChild(suvestine);

  vieta.appendChild(sukurtiMenesioRodikli("p", function () {
    const s = menesioSuvestine(menuo);
    // Kol įvestos ne visos kategorijos, faktinis likutis atrodytų per didelis, todėl jo nelyginame.
    if (s.uzpildyta < s.isViso) {
      return {
        tekstas: "Įvesta " + s.uzpildyta + " iš " + s.isViso + " kategorijų. Likutis bus palygintas su planu, kai įvesite visas.",
        klase: "blankus",
      };
    }
    const likutis = skirtumoVertinimas("likutis", s.likutis.planas, s.likutis.faktas);
    return {
      tekstas: "Įvestos visos kategorijos. Likutis, palyginti su planu: " + likutis.tekstas + ".",
      klase: likutis.klase,
    };
  }));

  vieta.appendChild(sukurtiMenesioDali(menuo, "pajamos", "Pajamos"));
  vieta.appendChild(sukurtiMenesioDali(menuo, "islaidos", "Išlaidos"));

  // Veiksmai su visu mėnesiu.
  const veiksmai = sukurtiElementa("p", "veiksmai");

  const atnaujinti = sukurtiElementa("button", "antrinis", "Atnaujinti planą iš biudžeto");
  atnaujinti.type = "button";
  atnaujinti.addEventListener("click", function () {
    if (confirm("Pakeisti šio mėnesio planą dabartinio biudžeto sumomis? Įvesti faktai išliks.")) {
      atnaujintiMenesioPlana(biudzetas, pasirinktasMenuo);
      issaugotiBiudzeta();
      perpiestiMenesi();
    }
  });

  const trinti = sukurtiElementa("button", "antrinis", "Ištrinti šio mėnesio duomenis");
  trinti.type = "button";
  trinti.addEventListener("click", function () {
    if (confirm("Ištrinti " + menesioPavadinimas(pasirinktasMenuo) + " planą ir visus įvestus faktus?")) {
      istrintiMenesi(biudzetas, pasirinktasMenuo);
      issaugotiBiudzeta();
      perpiestiMenesi();
    }
  });

  veiksmai.appendChild(atnaujinti);
  veiksmai.appendChild(sukurtiElementa("span", "", " "));
  veiksmai.appendChild(trinti);
  vieta.appendChild(veiksmai);
}
