// Metų apžvalga: visų metų mėnesiai vienoje lentelėje.
// Naudoja funkcijas iš bendra.js, biudzetas.js ir menesiai.js, todėl įkeliamas po jų.
// Savo duomenų šis failas neturi – viską suskaičiuoja iš biudzetas.menesiai.

// ---------- 1. Skaičiavimai ----------

// Trumpi mėnesių pavadinimai – kad lentelė tilptų telefono ekrane.
const MENESIU_TRUMPINIAI = ["Sau", "Vas", "Kov", "Bal", "Geg", "Bir", "Lie", "Rgp", "Rgs", "Spa", "Lap", "Gru"];

// Ką galima rodyti lentelėje.
const METU_RODIKLIAI = [
  { reiksme: "likutis", pavadinimas: "Likutis" },
  { reiksme: "pajamos", pavadinimas: "Pajamos" },
  { reiksme: "islaidos", pavadinimas: "Išlaidos" },
];

// Tuščia sumų „dėžutė“: planas ir faktas pajamoms, išlaidoms ir likučiui.
function tusciosSumos() {
  return {
    pajamos: { planas: 0, faktas: 0 },
    islaidos: { planas: 0, faktas: 0 },
    likutis: { planas: 0, faktas: 0 },
  };
}

// Vienų metų apžvalga. Grąžina:
//   eilutes  – 12 įrašų (po vieną mėnesiui); nepradėtas mėnuo turi pradetas: false,
//   isViso   – visų pradėtų mėnesių sumos,
//   pradetu  – kiek mėnesių pradėta.
function metuApzvalga(biudzetas, metai) {
  const eilutes = [];
  const isViso = tusciosSumos();
  let pradetu = 0;

  for (let menuo = 1; menuo <= 12; menuo = menuo + 1) {
    const raktas = menesioRaktas(metai, menuo);
    const duomenys = biudzetas.menesiai[raktas];

    if (duomenys === undefined) {
      eilutes.push({ raktas: raktas, pradetas: false });
      continue; // „continue“ – iškart pereiti prie kito mėnesio
    }

    const s = menesioSuvestine(duomenys);
    eilutes.push({
      raktas: raktas,
      pradetas: true,
      pajamos: s.pajamos,
      islaidos: s.islaidos,
      likutis: s.likutis,
      arPilnas: s.uzpildyta === s.isViso,
    });

    pradetu = pradetu + 1;
    for (const rodiklis of ["pajamos", "islaidos", "likutis"]) {
      isViso[rodiklis].planas = isViso[rodiklis].planas + s[rodiklis].planas;
      isViso[rodiklis].faktas = isViso[rodiklis].faktas + s[rodiklis].faktas;
    }
  }

  return { eilutes: eilutes, isViso: isViso, pradetu: pradetu };
}

// Kategorijų sumos per metus: kiek kiekvienai kategorijai planuota ir kiek iš tikrųjų.
// Kategorija atpažįstama pagal id; pavadinimas imamas iš vėliausio mėnesio.
function metuKategorijos(biudzetas, metai) {
  const sarasas = [];

  for (let menuo = 1; menuo <= 12; menuo = menuo + 1) {
    const duomenys = biudzetas.menesiai[menesioRaktas(metai, menuo)];
    if (duomenys === undefined) {
      continue;
    }
    for (const eilute of duomenys.eilutes) {
      let kategorija = sarasas.find(function (k) {
        return k.kategorijosId === eilute.kategorijosId;
      });
      if (!kategorija) {
        // „ivesta“ – kiek mėnesių šiai kategorijai įvestas faktas (0 reiškia, kad lyginti dar nėra su kuo).
        kategorija = { kategorijosId: eilute.kategorijosId, pavadinimas: "", tipas: eilute.tipas, planas: 0, faktas: 0, ivesta: 0 };
        sarasas.push(kategorija);
      }
      kategorija.pavadinimas = eilute.pavadinimas;
      kategorija.planas = kategorija.planas + eilute.planas;
      if (eilute.faktas !== null) {
        kategorija.faktas = kategorija.faktas + eilute.faktas;
        kategorija.ivesta = kategorija.ivesta + 1;
      }
    }
  }

  return sarasas;
}

// Skaičius su ženklu: 25.2 -> "+25,20", -30 -> "-30,00", 0 -> "0,00".
function formatuotiSuZenklu(skaicius) {
  const tekstas = formatuotiSkaiciu(skaicius);
  return Math.round(skaicius * 100) > 0 ? "+" + tekstas : tekstas;
}

// ---------- 2. Rodymas ----------

// Kurie metai ir kuris rodiklis dabar rodomi.
let pasirinktiMetai = null;
let pasirinktasRodiklis = "likutis";

// Prideda langelį į lentelės eilutę. zyme: "th" (antraštė) arba "td" (paprastas langelis).
function pridetiLangeli(eilute, zyme, tekstas, klase) {
  const langelis = sukurtiElementa(zyme, klase, tekstas);
  eilute.appendChild(langelis);
  return langelis;
}

// Prideda tris skaičių langelius: planas, faktas, skirtumas (nuspalvintas).
// Išlaidoms skirtumas su pliusu yra blogai, pajamoms ir likučiui – gerai.
function pridetiSumuLangelius(eilute, tipas, sumos) {
  pridetiLangeli(eilute, "td", formatuotiSkaiciu(sumos.planas), "skaicius");
  pridetiLangeli(eilute, "td", formatuotiSkaiciu(sumos.faktas), "skaicius");
  const spalva = skirtumoVertinimas(tipas, sumos.planas, sumos.faktas).klase;
  pridetiLangeli(eilute, "td", formatuotiSuZenklu(sumos.faktas - sumos.planas), "skaicius " + spalva);
}

// Lentelės antraštė su keturiais stulpeliais.
function sukurtiLentelesAntraste(pirmasStulpelis) {
  const antraste = sukurtiElementa("thead");
  const eilute = sukurtiElementa("tr");
  pridetiLangeli(eilute, "th", pirmasStulpelis, "");
  pridetiLangeli(eilute, "th", "Planas, €", "skaicius");
  pridetiLangeli(eilute, "th", "Faktas, €", "skaicius");
  pridetiLangeli(eilute, "th", "Skirtumas", "skaicius");
  antraste.appendChild(eilute);
  return antraste;
}

// Metų pasirinkimas: rodyklė atgal, metai, rodyklė pirmyn.
function sukurtiMetuNavigacija() {
  const navigacija = sukurtiElementa("div", "menesio-navigacija");

  const atgal = sukurtiElementa("button", "antrinis", "←");
  atgal.type = "button";
  atgal.setAttribute("aria-label", "Ankstesni metai");
  atgal.addEventListener("click", function () {
    pasirinktiMetai = pasirinktiMetai - 1;
    perpiestiMetus();
  });

  const pirmyn = sukurtiElementa("button", "antrinis", "→");
  pirmyn.type = "button";
  pirmyn.setAttribute("aria-label", "Kiti metai");
  pirmyn.addEventListener("click", function () {
    pasirinktiMetai = pasirinktiMetai + 1;
    perpiestiMetus();
  });

  navigacija.appendChild(atgal);
  navigacija.appendChild(sukurtiElementa("h2", "", pasirinktiMetai + " m."));
  navigacija.appendChild(pirmyn);
  return navigacija;
}

// Trys mygtukai, kuriais pasirenkama, ką rodyti lentelėje.
function sukurtiRodiklioPasirinkima() {
  const juosta = sukurtiElementa("div", "skirtukai");
  juosta.setAttribute("role", "group");
  juosta.setAttribute("aria-label", "Ką rodyti lentelėje");

  for (const rodiklis of METU_RODIKLIAI) {
    const mygtukas = sukurtiElementa("button", "skirtukas", rodiklis.pavadinimas);
    mygtukas.type = "button";
    // aria-pressed pasako, kad mygtukas „įspaustas“ (pasirinktas).
    mygtukas.setAttribute("aria-pressed", rodiklis.reiksme === pasirinktasRodiklis ? "true" : "false");
    mygtukas.addEventListener("click", function () {
      pasirinktasRodiklis = rodiklis.reiksme;
      perpiestiMetus();
    });
    juosta.appendChild(mygtukas);
  }
  return juosta;
}

// 12 mėnesių lentelė pasirinktam rodikliui.
function sukurtiMenesiuLentele(apzvalga) {
  const lentele = sukurtiElementa("table", "lentele");
  lentele.appendChild(sukurtiLentelesAntraste("Mėnuo"));

  const turinys = sukurtiElementa("tbody");
  apzvalga.eilutes.forEach(function (menuo, indeksas) {
    const eilute = sukurtiElementa("tr");

    // Pirmas langelis – mygtukas, kuris atidaro tą mėnesį skirtuke „Mėnesiai“.
    const langelis = pridetiLangeli(eilute, "th", "", "");
    langelis.setAttribute("scope", "row");
    const zvaigzdute = menuo.pradetas && !menuo.arPilnas ? " *" : "";
    const mygtukas = sukurtiElementa("button", "nuoroda", MENESIU_TRUMPINIAI[indeksas] + zvaigzdute);
    mygtukas.type = "button";
    mygtukas.setAttribute("aria-label", "Atidaryti: " + menesioPavadinimas(menuo.raktas));
    mygtukas.addEventListener("click", function () {
      pasirinktasMenuo = menuo.raktas;
      rodytiSkilti("menesiai");
    });
    langelis.appendChild(mygtukas);

    if (menuo.pradetas) {
      pridetiSumuLangelius(eilute, pasirinktasRodiklis, menuo[pasirinktasRodiklis]);
    } else {
      pridetiLangeli(eilute, "td", "–", "skaicius blankus");
      pridetiLangeli(eilute, "td", "–", "skaicius blankus");
      pridetiLangeli(eilute, "td", "–", "skaicius blankus");
    }
    turinys.appendChild(eilute);
  });
  lentele.appendChild(turinys);

  // Apatinė eilutė – metų suma.
  const apacia = sukurtiElementa("tfoot");
  const sumuEilute = sukurtiElementa("tr");
  pridetiLangeli(sumuEilute, "th", "Iš viso", "").setAttribute("scope", "row");
  pridetiSumuLangelius(sumuEilute, pasirinktasRodiklis, apzvalga.isViso[pasirinktasRodiklis]);
  apacia.appendChild(sumuEilute);
  lentele.appendChild(apacia);

  return lentele;
}

// Kategorijų lentelė: pirma pajamos, tada išlaidos.
function sukurtiKategorijuLentele(kategorijos) {
  const lentele = sukurtiElementa("table", "lentele");
  lentele.appendChild(sukurtiLentelesAntraste("Kategorija"));

  const turinys = sukurtiElementa("tbody");
  for (const dalis of [["pajamos", "Pajamos"], ["islaidos", "Išlaidos"]]) {
    const tipas = dalis[0];
    const tinkamos = kategorijos.filter(function (kategorija) {
      return kategorija.tipas === tipas;
    });
    if (tinkamos.length === 0) {
      continue;
    }

    // Tarpinė antraštė per visą lentelės plotį.
    const antrastesEilute = sukurtiElementa("tr", "lenteles-grupe");
    pridetiLangeli(antrastesEilute, "th", dalis[1], "").setAttribute("colspan", "4");
    turinys.appendChild(antrastesEilute);

    for (const kategorija of tinkamos) {
      const eilute = sukurtiElementa("tr");
      const pavadinimas = kategorija.pavadinimas === "" ? "(be pavadinimo)" : kategorija.pavadinimas;
      pridetiLangeli(eilute, "th", pavadinimas, "lenteles-pavadinimas").setAttribute("scope", "row");
      if (kategorija.ivesta === 0) {
        // Faktas neįvestas nė vienam mėnesiui: rodome tik planą, o ne klaidinantį „0,00“.
        pridetiLangeli(eilute, "td", formatuotiSkaiciu(kategorija.planas), "skaicius");
        pridetiLangeli(eilute, "td", "–", "skaicius blankus");
        pridetiLangeli(eilute, "td", "–", "skaicius blankus");
      } else {
        pridetiSumuLangelius(eilute, tipas, kategorija);
      }
      turinys.appendChild(eilute);
    }
  }
  lentele.appendChild(turinys);
  return lentele;
}

// Lentelę įdeda į kortelę; jei ji vis dėlto netilptų, slinkti bus galima tik pačią lentelę.
function sukurtiLentelesKortele(lentele) {
  const kortele = sukurtiElementa("div", "kortele lenteles-remelis");
  kortele.appendChild(lentele);
  return kortele;
}

// Nupiešia metų apžvalgą iš naujo.
function perpiestiMetus() {
  const vieta = document.getElementById("metai");
  vieta.textContent = "";

  vieta.appendChild(sukurtiMetuNavigacija());

  const apzvalga = metuApzvalga(biudzetas, pasirinktiMetai);
  if (apzvalga.pradetu === 0) {
    vieta.appendChild(sukurtiElementa("p", "kortele", "Šiais metais dar nepradėtas nė vienas mėnuo. Pradėkite mėnesį skirtuke „Mėnesiai“."));
    return;
  }

  vieta.appendChild(sukurtiRodiklioPasirinkima());
  vieta.appendChild(sukurtiLentelesKortele(sukurtiMenesiuLentele(apzvalga)));

  let pastaba = "Į sumas įtraukti tik pradėti mėnesiai (" + apzvalga.pradetu + " iš 12). Paspaudus mėnesį, jis atidaromas.";
  const arYraNepilnu = apzvalga.eilutes.some(function (menuo) {
    return menuo.pradetas && !menuo.arPilnas;
  });
  if (arYraNepilnu) {
    pastaba = "* – įvestos ne visos kategorijos, todėl faktas dar nepilnas. " + pastaba;
  }
  vieta.appendChild(sukurtiElementa("p", "blankus pastaba", pastaba));

  vieta.appendChild(sukurtiElementa("h2", "", "Kategorijos per metus"));
  vieta.appendChild(sukurtiLentelesKortele(sukurtiKategorijuLentele(metuKategorijos(biudzetas, pasirinktiMetai))));
}
