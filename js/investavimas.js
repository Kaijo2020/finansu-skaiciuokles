// Investavimo skaičiuoklė: periodinis investavimas (kas mėnesį ta pati įmoka).
// Naudoja funkcijas iš bendra.js, todėl įkeliamas po jo.
//
// Failo dalys:
//   1. Nustatymai   – kokie yra įvedimo laukai ir kokios jų leistinos reikšmės.
//   2. Skaičiavimai – prognozės formulė (be puslapio – tikrinama testais).
//   3. Rodymas      – laukai, rezultatai ir išsaugojimas naršyklėje.

// ---------- 1. Nustatymai ----------

// Laukų grupės – taip jie sugrupuojami puslapyje.
const INVESTAVIMO_GRUPES = [
  { reiksme: "pagrindiniai", pavadinimas: "Įmokos" },
  { reiksme: "grazos", pavadinimas: "Grąžos scenarijai" },
  { reiksme: "kastai", pavadinimas: "Mokesčiai ir infliacija" },
  {
    reiksme: "gpm",
    pavadinimas: "Gyventojų pajamų mokestis (GPM)",
    // ====================================================================================
    // MOKESČIŲ NUSTATYMAI. Tarifai ir lengvatos keičiasi – numatytąsias reikšmes (žr. žemiau
    // laukus su grupe "gpm") BŪTINA pasitikrinti VMI. Paskutinį kartą peržiūrėta 2026 m. lapkritį
    // pagal viešai prieinamas apžvalgas; oficialių VMI dokumentų tuo metu perskaityti nepavyko.
    // ====================================================================================
    pastaba:
      "Šias reikšmes būtinai pasitikrinkite VMI – jos keičiasi, o skaičiuoklė yra tik orientacinė. " +
      "Kiek žinoma, 2026 m. paprastoje sąskaitoje vertybinių popierių pardavimo pelnui taikomas 15 % tarifas " +
      "ir 500 € metinė lengvata, tačiau didelėms metinėms sumoms arba trumpiau nei 5 metus laikytoms " +
      "investicijoms gali būti taikomi didesni tarifai (20–32 %). Investicinėje sąskaitoje 500 € lengvata netaikoma.",
    nuorodos: [
      { tekstas: "VMI: gyventojų pajamų mokesčio tarifai", adresas: "https://www.vmi.lt/evmi/5725" },
      { tekstas: "VMI: apie investicinę sąskaitą", adresas: "https://www.vmi.lt/evmi/5552" },
    ],
  },
];

// Visi įvedimo laukai aprašyti viename sąraše. Iš jo sukuriami laukai puslapyje,
// pagal jį tikrinamos įvestys ir parenkamos pradinės reikšmės.
//   raktas    – vardas duomenyse,
//   grupe     – kuriai grupei laukas priklauso,
//   numatyta  – pradinė reikšmė (išgalvota, tik pavyzdžiui),
//   min, max  – leistinos ribos,
//   sveikas   – ar reikšmė turi būti sveikasis skaičius.
const INVESTAVIMO_LAUKAI = [
  {
    raktas: "imoka", grupe: "pagrindiniai",
    pavadinimas: "Mėnesio įmoka, €",
    uzuomina: "Kiek investuojate kiekvieną mėnesį.",
    numatyta: 100, min: 0, max: 1000000, sveikas: false,
  },
  {
    raktas: "metai", grupe: "pagrindiniai",
    pavadinimas: "Laikotarpis, metais",
    uzuomina: "Kiek metų planuojate investuoti (1–60).",
    numatyta: 20, min: 1, max: 60, sveikas: true,
  },
  {
    raktas: "pradine", grupe: "pagrindiniai",
    pavadinimas: "Pradinė suma, €",
    uzuomina: "Kiek jau turite investavę. Jei pradedate nuo nulio – 0.",
    numatyta: 0, min: 0, max: 100000000, sveikas: false,
  },
  {
    raktas: "graza1", grupe: "grazos",
    pavadinimas: "Atsargus scenarijus, %",
    uzuomina: "Metinė grąža, jei seksis prasčiau.",
    numatyta: 4, min: -20, max: 30, sveikas: false,
  },
  {
    raktas: "graza2", grupe: "grazos",
    pavadinimas: "Vidutinis scenarijus, %",
    uzuomina: "Metinė grąža, kurios tikitės vidutiniškai.",
    numatyta: 6, min: -20, max: 30, sveikas: false,
  },
  {
    raktas: "graza3", grupe: "grazos",
    pavadinimas: "Optimistinis scenarijus, %",
    uzuomina: "Metinė grąža, jei seksis geriau.",
    numatyta: 8, min: -20, max: 30, sveikas: false,
  },
  {
    raktas: "ter", grupe: "kastai",
    pavadinimas: "Fondo metinis mokestis (TER), %",
    uzuomina: "Kiek fondas kasmet pasiima nuo jūsų investicijos. Nurodyta fondo apraše.",
    numatyta: 0.2, min: 0, max: 5, sveikas: false,
  },
  {
    raktas: "komisinis", grupe: "kastai",
    pavadinimas: "Komisinis už vieną pirkimą, €",
    uzuomina: "Kiek tarpininkas ima už kiekvieną mėnesio pirkimą. Jei nemokamai – 0.",
    numatyta: 0, min: 0, max: 1000, sveikas: false,
  },
  {
    raktas: "infliacija", grupe: "kastai",
    pavadinimas: "Infliacija, %",
    uzuomina: "Kiek vidutiniškai per metus brangsta kainos.",
    numatyta: 2, min: -5, max: 20, sveikas: false,
  },
  // --- GPM nustatymai (pasitikrinti VMI, žr. pastabą prie grupės "gpm") ---
  {
    raktas: "gpmTarifas", grupe: "gpm",
    pavadinimas: "GPM tarifas paprastoje sąskaitoje, %",
    uzuomina: "Tarifas pelnui, gautam pardavus investicijas.",
    numatyta: 15, min: 0, max: 50, sveikas: false,
  },
  {
    raktas: "gpmLengvata", grupe: "gpm",
    pavadinimas: "Metinė lengvata paprastoje sąskaitoje, €",
    uzuomina: "Tiek pelno per metus neapmokestinama.",
    numatyta: 500, min: 0, max: 100000, sveikas: false,
  },
  {
    raktas: "gpmTarifasIS", grupe: "gpm",
    pavadinimas: "GPM tarifas investicinėje sąskaitoje, %",
    uzuomina: "Taikomas sumai, kurią išimate virš savo įnašų. Lengvatos nėra.",
    numatyta: 15, min: 0, max: 50, sveikas: false,
  },
];

// Trys scenarijai: kuris laukas nusako grąžą ir kaip scenarijų vadiname.
const SCENARIJAI = [
  { raktas: "graza1", pavadinimas: "Atsargus" },
  { raktas: "graza2", pavadinimas: "Vidutinis" },
  { raktas: "graza3", pavadinimas: "Optimistinis" },
];

// Pradiniai nustatymai: { imoka: 100, metai: 20, ... }
function numatytiejiInvestavimoNustatymai() {
  const nustatymai = {};
  for (const laukas of INVESTAVIMO_LAUKAI) {
    nustatymai[laukas.raktas] = laukas.numatyta;
  }
  // Įmokų žurnalas iš pradžių tuščias, dabartinė portfelio vertė – nežinoma (null).
  nustatymai.zurnalas = [];
  nustatymai.dabartineVerte = null;
  return nustatymai;
}

// Ar reikšmė tinka laukui: tikras skaičius, telpa į ribas ir, jei reikia, sveikasis.
function arTinkaLaukui(laukas, reiksme) {
  if (typeof reiksme !== "number" || !Number.isFinite(reiksme)) {
    return false;
  }
  if (reiksme < laukas.min || reiksme > laukas.max) {
    return false;
  }
  return !laukas.sveikas || Number.isInteger(reiksme);
}

// Patikrina žmogaus įvestą tekstą. Grąžina { reiksme } arba { klaida } su paaiškinimu.
function tikrintiInvestavimoLauka(laukas, tekstas) {
  const reiksme = skaitytiSuma(tekstas);
  if (Number.isNaN(reiksme)) {
    return { klaida: "Nesuprantu šio skaičiaus (pavyzdys: 1 200,50)." };
  }
  if (laukas.sveikas && !Number.isInteger(reiksme)) {
    return { klaida: "Čia reikia sveikojo skaičiaus, be kablelio." };
  }
  if (!arTinkaLaukui(laukas, reiksme)) {
    return { klaida: "Reikšmė turi būti nuo " + skaiciusTekstu(laukas.min) + " iki " + skaiciusTekstu(laukas.max) + "." };
  }
  return { reiksme: reiksme };
}

// Išsaugotus nustatymus sujungia su numatytaisiais: kiekvienam laukui imama išsaugota reikšmė,
// jei ji tinkama, kitaip – numatytoji. Todėl pridėjus naujų laukų seni duomenys nesugenda.
function sutvarkytiInvestavimoNustatymus(issaugoti) {
  const nustatymai = numatytiejiInvestavimoNustatymai();
  if (issaugoti === null || typeof issaugoti !== "object") {
    return nustatymai;
  }
  for (const laukas of INVESTAVIMO_LAUKAI) {
    if (arTinkaLaukui(laukas, issaugoti[laukas.raktas])) {
      nustatymai[laukas.raktas] = issaugoti[laukas.raktas];
    }
  }
  nustatymai.zurnalas = sutvarkytiZurnala(issaugoti.zurnalas);
  if (typeof issaugoti.dabartineVerte === "number" && Number.isFinite(issaugoti.dabartineVerte) && issaugoti.dabartineVerte >= 0) {
    nustatymai.dabartineVerte = issaugoti.dabartineVerte;
  }
  return nustatymai;
}

// Skaičių paverčia tekstu įvedimo laukui: 12.5 -> "12,5", 100 -> "100".
function skaiciusTekstu(skaicius) {
  return String(skaicius).replace(".", ",");
}

// ---------- 2. Skaičiavimai ----------

// Metinę grąžą procentais paverčia vieno mėnesio grąža (dalimi, ne procentais).
// Tiesiog padalyti iš 12 būtų netikslu: mėnesio grąžos viena kitą „augina“ (sudėtinės palūkanos),
// todėl ieškome tokios mėnesio grąžos, kuri per 12 mėnesių duoda lygiai metinę: (1 + m)^12 = 1 + metinė.
function menesioGraza(metineProc) {
  return Math.pow(1 + metineProc / 100, 1 / 12) - 1;
}

// Kokią vertės dalį fondas pasiima per vieną mėnesį, jei metinis mokestis yra terProc procentų.
// Skaičiuojama taip pat kaip grąža: 12 mėnesio mokesčių kartu sudaro lygiai metinį.
function menesioMokestis(terProc) {
  return 1 - Math.pow(1 - terProc / 100, 1 / 12);
}

// Vieno scenarijaus prognozė. Parametrai:
//   pradine, imoka, metai, graza – kaip anksčiau;
//   ter, komisinis, infliacija   – nebūtini (jei nenurodyti, laikomi 0).
// Kiekvieną mėnesį:
//   1) iš įmokos atskaitomas komisinis, likutis investuojamas,
//   2) visa suma paauga mėnesio grąža,
//   3) fondas nusiskaito savo mėnesio mokesčio dalį.
// Grąžina:
//   imoketa     – kiek pinigų išėjo iš kišenės (su pradine suma ir komisiniais),
//   verte       – kiek tai verta pabaigoje,
//   prieaugis   – verte minus imoketa,
//   terSuma     – kiek per visą laiką nusiskaitė fondas,
//   komisiniai  – kiek sumokėta tarpininkui,
//   kastai      – terSuma + komisiniai,
//   realiVerte  – vertė šiandienos pinigais (atsižvelgus į infliaciją),
//   metuEilutes – būsena kiekvienų metų pabaigoje (prireiks grafikui).
function investavimoPrognoze(n) {
  const graza = menesioGraza(n.graza);
  const mokestis = menesioMokestis(n.ter || 0);
  const infliacija = (n.infliacija || 0) / 100;
  // Komisinis negali būti didesnis už pačią įmoką.
  const komisinis = Math.min(n.komisinis || 0, n.imoka);

  let verte = n.pradine;
  // Paprastai pradžioje įmokėta tiek, kiek ir verta (pradinė suma). Tęsiant nuo žurnalo šie
  // skaičiai skiriasi: jau įmokėta viena suma, o portfelis vertas kitos – tada nurodoma „jauImoketa“.
  let imoketa = n.jauImoketa === undefined ? n.pradine : n.jauImoketa;
  let terSuma = 0;
  let komisiniai = 0;
  const metuEilutes = [{ metai: 0, imoketa: imoketa, verte: verte, realiVerte: verte }];

  for (let menuo = 1; menuo <= n.metai * 12; menuo = menuo + 1) {
    imoketa = imoketa + n.imoka;
    komisiniai = komisiniai + komisinis;
    verte = (verte + n.imoka - komisinis) * (1 + graza);

    const fondoDalis = verte * mokestis;
    verte = verte - fondoDalis;
    terSuma = terSuma + fondoDalis;

    // % – dalybos liekana: kas dvyliktą mėnesį ji lygi 0, vadinasi, baigėsi metai.
    if (menuo % 12 === 0) {
      const metai = menuo / 12;
      metuEilutes.push({
        metai: metai,
        imoketa: imoketa,
        verte: verte,
        // Per metus kainos pabrangsta (1 + infliacija) kartų, per kelerius – tiek kartų pakelta laipsniu.
        realiVerte: verte / Math.pow(1 + infliacija, metai),
      });
    }
  }

  return {
    imoketa: imoketa,
    verte: verte,
    prieaugis: verte - imoketa,
    terSuma: terSuma,
    komisiniai: komisiniai,
    kastai: terSuma + komisiniai,
    realiVerte: verte / Math.pow(1 + infliacija, n.metai),
    metuEilutes: metuEilutes,
  };
}

// Suskaičiuoja visus tris scenarijus su tais pačiais nustatymais – skiriasi tik grąža.
// Kiekvienam dar pridedama „verteBeKastu“: kiek būtų verta be jokių mokesčių.
function visuScenarijuPrognoze(nustatymai) {
  const pradzia = prognozesPradzia(nustatymai);
  return SCENARIJAI.map(function (scenarijus) {
    const graza = nustatymai[scenarijus.raktas];
    const bendri = {
      pradine: pradzia.verte,
      jauImoketa: pradzia.imoketa,
      imoka: nustatymai.imoka,
      metai: nustatymai.metai,
      graza: graza,
      infliacija: nustatymai.infliacija,
    };

    const beKastu = investavimoPrognoze(bendri);
    bendri.ter = nustatymai.ter;
    bendri.komisinis = nustatymai.komisinis;
    const prognoze = investavimoPrognoze(bendri);

    prognoze.pavadinimas = scenarijus.pavadinimas;
    prognoze.graza = graza;
    prognoze.verteBeKastu = beKastu.verte;
    return prognoze;
  });
}

// ----- Įmokų žurnalas -----
// Žurnalas – realiai investuotų sumų sąrašas: [{ id, data: "2026-03-15", suma: 150 }, ...].

// Ar tekstas yra tikra data formatu „metai-mėnuo-diena“ ir ne vėlesnė už „siandien“?
// „siandien“ – taip pat tekstas tokiu pat formatu (pvz. iš datosZyma(new Date())).
function arTinkamaData(tekstas, siandien) {
  if (typeof tekstas !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(tekstas)) {
    return false;
  }
  const metai = Number(tekstas.slice(0, 4));
  const menuo = Number(tekstas.slice(5, 7));
  const diena = Number(tekstas.slice(8, 10));
  // Sukuriame datą ir patikriname, ar ji „nepersivertė“: pvz. vasario 31 d. virstų kovo 3 d.
  const data = new Date(metai, menuo - 1, diena);
  if (data.getFullYear() !== metai || data.getMonth() !== menuo - 1 || data.getDate() !== diena) {
    return false;
  }
  if (metai < 1990) {
    return false;
  }
  // Tokio formato datas galima lyginti kaip tekstą: vėlesnė data – „didesnis“ tekstas.
  return tekstas <= siandien;
}

// Surikiuoja žurnalą: naujausios įmokos viršuje. Grąžina naują sąrašą, seno nekeičia.
function rikiuotiZurnala(zurnalas) {
  return zurnalas.slice().sort(function (a, b) {
    if (a.data === b.data) {
      return 0;
    }
    return a.data < b.data ? 1 : -1;
  });
}

// Visų žurnalo įmokų suma.
function zurnaloSuma(zurnalas) {
  let suma = 0;
  for (const irasas of zurnalas) {
    suma = suma + irasas.suma;
  }
  return suma;
}

// Prideda įmoką į žurnalą ir grąžina naują įrašą.
function pridetiImoka(zurnalas, data, suma) {
  const irasas = {
    id: "z" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    data: data,
    suma: Math.round(suma * 100) / 100,
  };
  zurnalas.push(irasas);
  return irasas;
}

// Iš išsaugotų duomenų palieka tik tinkamus žurnalo įrašus (teisinga data, teigiama suma).
function sutvarkytiZurnala(issaugotas) {
  if (!Array.isArray(issaugotas)) {
    return [];
  }
  const tinkami = [];
  for (const irasas of issaugotas) {
    const arTinkamas =
      irasas !== null &&
      typeof irasas === "object" &&
      typeof irasas.id === "string" &&
      arTinkamaData(irasas.data, "9999-12-31") &&
      typeof irasas.suma === "number" &&
      Number.isFinite(irasas.suma) &&
      irasas.suma > 0;
    if (arTinkamas) {
      tinkami.push({ id: irasas.id, data: irasas.data, suma: irasas.suma });
    }
  }
  return tinkami;
}

// Nuo ko pradedama prognozė.
//   Žurnalas tuščias – nuo lauko „Pradinė suma“.
//   Žurnale yra įmokų – nuo jų: įmokėta tiek, kiek žurnale, o vertė – nurodyta dabartinė
//   portfelio vertė (jei ji nenurodyta, laikoma lygi įmokėtai sumai).
function prognozesPradzia(nustatymai) {
  if (nustatymai.zurnalas.length === 0) {
    return { isZurnalo: false, imoketa: nustatymai.pradine, verte: nustatymai.pradine };
  }
  const imoketa = zurnaloSuma(nustatymai.zurnalas);
  return {
    isZurnalo: true,
    imoketa: imoketa,
    verte: nustatymai.dabartineVerte === null ? imoketa : nustatymai.dabartineVerte,
  };
}

// GPM, jei laikotarpio pabaigoje viskas parduodama (išimama) vienu kartu. Du režimai:
//   paprasta sąskaita    – apmokestinamas pelnas (vertė minus įmokėta), sumažintas metine lengvata;
//   investicinė sąskaita – apmokestinama suma, išimta virš įnašų, be lengvatos.
// Nuostolio atveju mokesčio nėra. Grąžina kiekvienam režimui:
//   apmokestinama – nuo kokios sumos skaičiuojamas mokestis,
//   gpm           – mokesčio suma,
//   lieka         – kiek lieka sumokėjus mokestį.
function gpmSkaiciavimas(verte, imoketa, nustatymai) {
  const pelnas = Math.max(0, verte - imoketa);

  const paprastaApmokestinama = Math.max(0, pelnas - nustatymai.gpmLengvata);
  const paprastaGpm = (paprastaApmokestinama * nustatymai.gpmTarifas) / 100;

  const investicineGpm = (pelnas * nustatymai.gpmTarifasIS) / 100;

  return {
    pelnas: pelnas,
    paprasta: { apmokestinama: paprastaApmokestinama, gpm: paprastaGpm, lieka: verte - paprastaGpm },
    investicine: { apmokestinama: pelnas, gpm: investicineGpm, lieka: verte - investicineGpm },
  };
}

// ---------- 3. Rodymas ----------

const INVESTAVIMO_RAKTAS = "investavimas";
const INVESTAVIMO_VERSIJA = 1;

// Dabartiniai nustatymai (paskutinės tinkamos reikšmės).
let investavimas = null;

// Scenarijų lentelės eilutės: užrašas ir kurį prognozės lauką rodyti.
const SCENARIJU_EILUTES = [
  { pavadinimas: "Įmokėta", laukas: "imoketa" },
  { pavadinimas: "Vertė", laukas: "verte" },
  { pavadinimas: "Prieaugis", laukas: "prieaugis", spalvinti: true },
  { pavadinimas: "Mokesčiai (TER ir komisiniai)", laukas: "kastai" },
  { pavadinimas: "Vertė šiandienos pinigais", laukas: "realiVerte" },
];

// Sukuria scenarijų lentelę: stulpelis kiekvienam scenarijui, eilutė kiekvienam rodikliui.
function sukurtiScenarijuLentele(scenarijai) {
  const lentele = sukurtiElementa("table", "lentele");

  const antraste = sukurtiElementa("thead");
  const antrastesEilute = sukurtiElementa("tr");
  antrastesEilute.appendChild(sukurtiElementa("th", "", "Sumos eurais"));
  for (const scenarijus of scenarijai) {
    antrastesEilute.appendChild(sukurtiElementa("th", "skaicius", scenarijus.pavadinimas + ", " + skaiciusTekstu(scenarijus.graza) + " %"));
  }
  antraste.appendChild(antrastesEilute);
  lentele.appendChild(antraste);

  const turinys = sukurtiElementa("tbody");
  for (const eilute of SCENARIJU_EILUTES) {
    const elementas = sukurtiElementa("tr");
    const pavadinimas = sukurtiElementa("th", "lenteles-pavadinimas", eilute.pavadinimas);
    pavadinimas.setAttribute("scope", "row");
    elementas.appendChild(pavadinimas);

    for (const scenarijus of scenarijai) {
      const reiksme = scenarijus[eilute.laukas];
      let klase = "skaicius";
      if (eilute.spalvinti) {
        klase = Math.round(reiksme * 100) < 0 ? "skaicius neigiama" : "skaicius teigiama";
      }
      elementas.appendChild(sukurtiElementa("td", klase, formatuotiSkaiciu(reiksme)));
    }
    turinys.appendChild(elementas);
  }
  lentele.appendChild(turinys);
  return lentele;
}

// GPM lentelės eilutės: užrašas ir kaip iš GPM skaičiavimo gauti reikšmę.
const GPM_EILUTES = [
  { pavadinimas: "Pelnas (vertė − įmokėta)", gauti: function (g) { return g.pelnas; } },
  { pavadinimas: "Paprasta sąskaita: GPM", gauti: function (g) { return g.paprasta.gpm; } },
  { pavadinimas: "Paprasta sąskaita: lieka", gauti: function (g) { return g.paprasta.lieka; }, ryskiai: true },
  { pavadinimas: "Investicinė sąskaita: GPM", gauti: function (g) { return g.investicine.gpm; } },
  { pavadinimas: "Investicinė sąskaita: lieka", gauti: function (g) { return g.investicine.lieka; }, ryskiai: true },
];

// Sukuria GPM lentelę: kiek mokesčio būtų ir kiek liktų kiekviename scenarijuje abiem režimais.
function sukurtiGpmLentele(scenarijai) {
  const lentele = sukurtiElementa("table", "lentele");

  const antraste = sukurtiElementa("thead");
  const antrastesEilute = sukurtiElementa("tr");
  antrastesEilute.appendChild(sukurtiElementa("th", "", "Sumos eurais"));
  for (const scenarijus of scenarijai) {
    antrastesEilute.appendChild(sukurtiElementa("th", "skaicius", skaiciusTekstu(scenarijus.graza) + " %"));
  }
  antraste.appendChild(antrastesEilute);
  lentele.appendChild(antraste);

  const skaiciavimai = scenarijai.map(function (scenarijus) {
    return gpmSkaiciavimas(scenarijus.verte, scenarijus.imoketa, investavimas);
  });

  const turinys = sukurtiElementa("tbody");
  for (const eilute of GPM_EILUTES) {
    const elementas = sukurtiElementa("tr", eilute.ryskiai ? "lenteles-ryski" : "");
    const pavadinimas = sukurtiElementa("th", "lenteles-pavadinimas", eilute.pavadinimas);
    pavadinimas.setAttribute("scope", "row");
    elementas.appendChild(pavadinimas);
    for (const skaiciavimas of skaiciavimai) {
      elementas.appendChild(sukurtiElementa("td", "skaicius", formatuotiSkaiciu(eilute.gauti(skaiciavimas))));
    }
    turinys.appendChild(elementas);
  }
  lentele.appendChild(turinys);
  return lentele;
}

// Paruošia duomenis grafikui (žr. grafikas.js): po liniją kiekvienam scenarijui
// ir punktyrinę įmokėtos sumos liniją palyginimui.
function grafikoDuomenys(scenarijai, metai) {
  const serijos = scenarijai.map(function (scenarijus, indeksas) {
    return {
      pavadinimas: scenarijus.pavadinimas + ", " + skaiciusTekstu(scenarijus.graza) + " %",
      trumpas: skaiciusTekstu(scenarijus.graza) + " %",
      // Spalva priskiriama pagal scenarijaus vietą sąraše (serija-1, serija-2, serija-3) ir nesikeičia.
      klase: "serija-" + (indeksas + 1),
      reiksmes: scenarijus.metuEilutes.map(function (eilute) {
        return eilute.verte;
      }),
    };
  });

  const vidutinis = scenarijai[1];
  return {
    metai: metai,
    serijos: serijos,
    atrama: {
      pavadinimas: "Įmokėta",
      reiksmes: vidutinis.metuEilutes.map(function (eilute) {
        return eilute.imoketa;
      }),
    },
    aprasas:
      "Investicijų vertė per " + metai + " m. trimis scenarijais. Pabaigoje: " +
      scenarijai.map(function (scenarijus) {
        return skaiciusTekstu(scenarijus.graza) + " % – " + rodytiSuma(scenarijus.verte);
      }).join(", ") +
      "; įmokėta " + rodytiSuma(vidutinis.imoketa) + ".",
  };
}

// Lentelė pagal metus – tie patys skaičiai kaip grafike, tik tikslūs.
function sukurtiMetuLentele(scenarijai) {
  const lentele = sukurtiElementa("table", "lentele");

  const antraste = sukurtiElementa("thead");
  const antrastesEilute = sukurtiElementa("tr");
  antrastesEilute.appendChild(sukurtiElementa("th", "", "Metai"));
  antrastesEilute.appendChild(sukurtiElementa("th", "skaicius", "Įmokėta, €"));
  for (const scenarijus of scenarijai) {
    antrastesEilute.appendChild(sukurtiElementa("th", "skaicius", skaiciusTekstu(scenarijus.graza) + " %, €"));
  }
  antraste.appendChild(antrastesEilute);
  lentele.appendChild(antraste);

  const turinys = sukurtiElementa("tbody");
  scenarijai[0].metuEilutes.forEach(function (eilute, indeksas) {
    const elementas = sukurtiElementa("tr");
    const metai = sukurtiElementa("th", "", String(eilute.metai));
    metai.setAttribute("scope", "row");
    elementas.appendChild(metai);
    elementas.appendChild(sukurtiElementa("td", "skaicius", formatuotiSkaiciu(eilute.imoketa)));
    for (const scenarijus of scenarijai) {
      elementas.appendChild(sukurtiElementa("td", "skaicius", formatuotiSkaiciu(scenarijus.metuEilutes[indeksas].verte)));
    }
    turinys.appendChild(elementas);
  });
  lentele.appendChild(turinys);
  return lentele;
}

// Perskaičiuoja ir parodo rezultatus.
function rodytiInvestavimoRezultatus() {
  const scenarijai = visuScenarijuPrognoze(investavimas);
  const vidutinis = scenarijai[1];

  // Viršutinė juosta rodo vidutinį scenarijų.
  document.getElementById("rez-imoketa").textContent = rodytiSuma(vidutinis.imoketa);
  document.getElementById("rez-verte").textContent = rodytiSuma(vidutinis.verte);
  const prieaugis = document.getElementById("rez-prieaugis");
  prieaugis.textContent = rodytiSuma(vidutinis.prieaugis);
  prieaugis.className = Math.round(vidutinis.prieaugis * 100) < 0 ? "suvestines-reiksme neigiama" : "suvestines-reiksme teigiama";

  const pradzia = prognozesPradzia(investavimas);
  const pradziosTekstas = pradzia.isZurnalo
    ? "Prognozė tęsiama nuo įmokų žurnalo (jau įmokėta " + rodytiSuma(pradzia.imoketa) + ", dabartinė vertė " + rodytiSuma(pradzia.verte) + "). "
    : "";
  document.getElementById("rez-sakinys").textContent =
    pradziosTekstas +
    "Vidutinis scenarijus: po " + investavimas.metai + " m. iš viso būtumėte įmokėję " + rodytiSuma(vidutinis.imoketa) +
    ", o esant " + skaiciusTekstu(vidutinis.graza) + " % metinei grąžai tai būtų verta " + rodytiSuma(vidutinis.verte) +
    " – šiandienos pinigais apie " + rodytiSuma(vidutinis.realiVerte) + ".";

  const vieta = document.getElementById("scenarijai");
  vieta.textContent = "";
  vieta.appendChild(sukurtiScenarijuLentele(scenarijai));

  // GPM lentelė.
  const gpmVieta = document.getElementById("gpm-lentele");
  gpmVieta.textContent = "";
  gpmVieta.appendChild(sukurtiGpmLentele(scenarijai));

  // Grafikas, jo legenda ir lentelė pagal metus.
  const duomenys = grafikoDuomenys(scenarijai, investavimas.metai);
  piestiLegenda(document.getElementById("grafiko-legenda"), duomenys);
  piestiLinijuGrafika(document.getElementById("grafikas"), duomenys);
  const lentelesVieta = document.getElementById("metu-lentele");
  lentelesVieta.textContent = "";
  lentelesVieta.appendChild(sukurtiMetuLentele(scenarijai));

  // Paaiškinimas apie mokesčių įtaką (vidutiniam scenarijui).
  const poveikis = vidutinis.verteBeKastu - vidutinis.verte;
  let pastaba =
    "Vidutiniame scenarijuje be jokių mokesčių vertė būtų " + rodytiSuma(vidutinis.verteBeKastu) + ", t. y. " +
    rodytiSuma(poveikis) + " didesnė: mokesčiams atiduoti pinigai nebeuždirba grąžos.";
  if (investavimas.komisinis > 0 && investavimas.imoka > 0) {
    const dalis = (Math.min(investavimas.komisinis, investavimas.imoka) / investavimas.imoka) * 100;
    pastaba = pastaba + " Komisinis sudaro " + formatuotiProcentus(dalis) + " kiekvienos įmokos.";
  }
  document.getElementById("scenariju-pastaba").textContent = pastaba;
}

// Įrašo nustatymus į naršyklės saugyklą.
function issaugotiInvestavima() {
  const pavyko = issaugotiDuomenis(INVESTAVIMO_RAKTAS, INVESTAVIMO_VERSIJA, investavimas);
  const busena = document.getElementById("busena");
  busena.textContent = pavyko
    ? "Jūsų įvestys išsaugotos šioje naršyklėje."
    : "Nepavyko išsaugoti: naršyklė neleidžia saugoti duomenų. Uždarius puslapį įvestys dings.";
  busena.className = pavyko ? "blankus" : "klaidos-tekstas";
}

// Sukuria vieną įvedimo lauką su užrašu, paaiškinimu ir vieta klaidai.
function sukurtiInvestavimoLauka(laukas) {
  const blokas = sukurtiElementa("div", "formos-laukas");
  const id = "laukas-" + laukas.raktas;

  // <label for="..."> susieja užrašą su lauku: paspaudus užrašą žymeklis atsiduria lauke.
  const uzrasas = sukurtiElementa("label", "", laukas.pavadinimas);
  uzrasas.setAttribute("for", id);

  const ivestis = sukurtiElementa("input");
  ivestis.type = "text";
  ivestis.id = id;
  ivestis.value = skaiciusTekstu(investavimas[laukas.raktas]);
  ivestis.setAttribute("inputmode", "decimal");
  ivestis.setAttribute("autocomplete", "off");

  const klaidosVieta = sukurtiElementa("p", "klaidos-tekstas");
  klaidosVieta.hidden = true;

  ivestis.addEventListener("focus", function () {
    ivestis.select();
  });

  // Rašant: jei reikšmė tinkama, iškart perskaičiuojame.
  ivestis.addEventListener("input", function () {
    const rezultatas = tikrintiInvestavimoLauka(laukas, ivestis.value);
    if (rezultatas.klaida) {
      return;
    }
    investavimas[laukas.raktas] = rezultatas.reiksme;
    ivestis.setAttribute("aria-invalid", "false");
    klaidosVieta.hidden = true;
    issaugotiInvestavima();
    rodytiInvestavimoRezultatus();
  });

  // Baigus rašyti: sutvarkome užrašymą arba parodome klaidą.
  ivestis.addEventListener("change", function () {
    const rezultatas = tikrintiInvestavimoLauka(laukas, ivestis.value);
    if (rezultatas.klaida) {
      ivestis.setAttribute("aria-invalid", "true");
      klaidosVieta.textContent = rezultatas.klaida + " Skaičiuojama su " + skaiciusTekstu(investavimas[laukas.raktas]) + ".";
      klaidosVieta.hidden = false;
    } else {
      ivestis.value = skaiciusTekstu(rezultatas.reiksme);
    }
  });

  blokas.appendChild(uzrasas);
  blokas.appendChild(ivestis);
  blokas.appendChild(sukurtiElementa("p", "blankus pastaba", laukas.uzuomina));
  blokas.appendChild(klaidosVieta);
  return blokas;
}

// Nupiešia visus įvedimo laukus, sugrupuotus pagal INVESTAVIMO_GRUPES.
function perpiestiInvestavimoLaukus() {
  const vieta = document.getElementById("investavimo-laukai");
  vieta.textContent = "";

  for (const grupe of INVESTAVIMO_GRUPES) {
    const blokas = sukurtiElementa("section", "kortele formos-grupe");
    blokas.appendChild(sukurtiElementa("h2", "korteles-antraste", grupe.pavadinimas));

    const forma = sukurtiElementa("div", "forma");
    for (const laukas of INVESTAVIMO_LAUKAI) {
      if (laukas.grupe === grupe.reiksme) {
        forma.appendChild(sukurtiInvestavimoLauka(laukas));
      }
    }
    blokas.appendChild(forma);

    // Kai kurios grupės turi papildomą pastabą ir nuorodas (GPM grupė – į VMI).
    if (grupe.pastaba) {
      blokas.appendChild(sukurtiElementa("p", "ispejimas", grupe.pastaba));
    }
    if (grupe.nuorodos) {
      const sarasas = sukurtiElementa("ul", "nuorodu-sarasas");
      for (const nuoroda of grupe.nuorodos) {
        const punktas = sukurtiElementa("li");
        const elementas = sukurtiElementa("a", "", nuoroda.tekstas);
        elementas.href = nuoroda.adresas;
        // Atidaroma naujame skirtuke; rel="noopener noreferrer" – saugumo sumetimais,
        // kad atidarytas puslapis negautų prieigos prie mūsų puslapio.
        elementas.target = "_blank";
        elementas.rel = "noopener noreferrer";
        punktas.appendChild(elementas);
        sarasas.appendChild(punktas);
      }
      blokas.appendChild(sarasas);
    }

    vieta.appendChild(blokas);
  }
}

// Nupiešia žurnalo suvestinę ir įmokų sąrašą.
function perpiestiZurnala() {
  const zurnalas = investavimas.zurnalas;
  const suvestine = document.getElementById("zurnalo-suvestine");
  const sarasas = document.getElementById("zurnalo-sarasas");
  sarasas.textContent = "";
  suvestine.textContent = "";

  if (zurnalas.length === 0) {
    suvestine.appendChild(sukurtiElementa("p", "blankus", "Žurnalas tuščias – prognozė skaičiuojama nuo lauko „Pradinė suma“."));
    return;
  }

  const imoketa = zurnaloSuma(zurnalas);
  suvestine.appendChild(sukurtiElementa("p", "", "Įmokų: " + zurnalas.length + ", iš viso įmokėta " + rodytiSuma(imoketa) + "."));

  if (investavimas.dabartineVerte !== null) {
    const prieaugis = investavimas.dabartineVerte - imoketa;
    const procentai = (prieaugis / imoketa) * 100;
    const arNuostolis = Math.round(prieaugis * 100) < 0;
    suvestine.appendChild(sukurtiElementa(
      "p",
      arNuostolis ? "neigiama" : "teigiama",
      (arNuostolis ? "Nuostolis: " : "Prieaugis: ") + rodytiSuma(prieaugis) + " (" + formatuotiProcentus(procentai) + ")."
    ));
  }
  suvestine.appendChild(sukurtiElementa("p", "blankus pastaba", "Prognozė tęsiama nuo šių duomenų; laukas „Pradinė suma“ nenaudojamas."));

  for (const irasas of rikiuotiZurnala(zurnalas)) {
    const punktas = sukurtiElementa("li", "eilutes-laukai zurnalo-irasas");
    punktas.appendChild(sukurtiElementa("span", "zurnalo-data", irasas.data));
    punktas.appendChild(sukurtiElementa("span", "suma zurnalo-suma", rodytiSuma(irasas.suma)));

    const trinti = sukurtiElementa("button", "antrinis mygtukas-trinti", "✕");
    trinti.type = "button";
    trinti.title = "Ištrinti įmoką";
    trinti.setAttribute("aria-label", "Ištrinti " + irasas.data + " įmoką");
    trinti.addEventListener("click", function () {
      if (confirm("Ištrinti " + irasas.data + " įmoką (" + rodytiSuma(irasas.suma) + ")?")) {
        investavimas.zurnalas = investavimas.zurnalas.filter(function (kitas) {
          return kitas.id !== irasas.id;
        });
        issaugotiInvestavima();
        perpiestiZurnala();
        rodytiInvestavimoRezultatus();
      }
    });
    punktas.appendChild(trinti);
    sarasas.appendChild(punktas);
  }
}

// Įrašo išsaugotą dabartinę portfelio vertę į jos lauką (tuščia, jei vertė nežinoma).
function rodytiDabartineVerte() {
  document.getElementById("dabartine-verte").value =
    investavimas.dabartineVerte === null ? "" : formatuotiSkaiciu(investavimas.dabartineVerte);
}

// Prijungia žurnalo formą: naujos įmokos pridėjimą ir dabartinės vertės lauką.
function paruostiZurnala() {
  const dataLaukas = document.getElementById("zurnalo-data");
  const sumaLaukas = document.getElementById("zurnalo-suma");
  const klaidosVieta = document.getElementById("zurnalo-klaida");
  dataLaukas.value = datosZyma(new Date());

  document.getElementById("zurnalo-prideti").addEventListener("click", function () {
    const siandien = datosZyma(new Date());
    const suma = skaitytiSuma(sumaLaukas.value);

    let klaida = "";
    if (!arTinkamaData(dataLaukas.value, siandien)) {
      klaida = "Pasirinkite datą – šiandienos arba ankstesnę.";
    } else if (!(suma > 0)) {
      klaida = "Įrašykite įmokos sumą, didesnę už nulį (pavyzdys: 150 arba 1 200,50).";
    }
    klaidosVieta.textContent = klaida;
    klaidosVieta.hidden = klaida === "";
    if (klaida !== "") {
      return;
    }

    pridetiImoka(investavimas.zurnalas, dataLaukas.value, suma);
    sumaLaukas.value = "";
    issaugotiInvestavima();
    perpiestiZurnala();
    rodytiInvestavimoRezultatus();
  });

  // Dabartinė portfelio vertė: tuščias laukas reiškia „nežinoma“.
  const verteLaukas = document.getElementById("dabartine-verte");
  const vertesKlaida = document.getElementById("dabartines-klaida");
  rodytiDabartineVerte();

  verteLaukas.addEventListener("input", function () {
    const tekstas = verteLaukas.value.trim();
    if (tekstas === "") {
      investavimas.dabartineVerte = null;
    } else {
      const reiksme = skaitytiSuma(tekstas);
      if (!(reiksme >= 0)) {
        return;
      }
      investavimas.dabartineVerte = Math.round(reiksme * 100) / 100;
    }
    rodytiLaukoKlaida(verteLaukas, vertesKlaida, "");
    issaugotiInvestavima();
    perpiestiZurnala();
    rodytiInvestavimoRezultatus();
  });

  verteLaukas.addEventListener("change", function () {
    const tekstas = verteLaukas.value.trim();
    if (tekstas === "") {
      return;
    }
    if (skaitytiSuma(tekstas) >= 0) {
      verteLaukas.value = formatuotiSkaiciu(investavimas.dabartineVerte);
    } else {
      rodytiLaukoKlaida(verteLaukas, vertesKlaida, "Nesuprantu šios sumos (pavyzdys: 1 200,50). Jei vertės nežinote, palikite lauką tuščią.");
    }
  });
}

// Pradžia: kviečiama iš investavimas.html, kai puslapis įkeltas.
function paleistiInvestavima() {
  const issaugota = nuskaitytiDuomenis(INVESTAVIMO_RAKTAS);
  const arTinkamaVersija = issaugota !== null && issaugota.versija === INVESTAVIMO_VERSIJA;
  investavimas = sutvarkytiInvestavimoNustatymus(arTinkamaVersija ? issaugota.duomenys : null);

  perpiestiInvestavimoLaukus();
  paruostiZurnala();
  paruostiInvestavimoKopijas();
  perpiestiZurnala();
  rodytiInvestavimoRezultatus();

  // Pasikeitus lango pločiui (pvz. pasukus telefoną) grafiką perpiešiame pagal naują plotį.
  let ankstesnisPlotis = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth !== ankstesnisPlotis) {
      ankstesnisPlotis = window.innerWidth;
      rodytiInvestavimoRezultatus();
    }
  });

  document.getElementById("atkurti-investavima").addEventListener("click", function () {
    if (confirm("Grąžinti pradines pavyzdines įvesčių reikšmes? Įmokų žurnalas išliks.")) {
      const zurnalas = investavimas.zurnalas;
      const dabartineVerte = investavimas.dabartineVerte;
      investavimas = numatytiejiInvestavimoNustatymai();
      investavimas.zurnalas = zurnalas;
      investavimas.dabartineVerte = dabartineVerte;
      issaugotiInvestavima();
      perpiestiInvestavimoLaukus();
      rodytiInvestavimoRezultatus();
    }
  });
}

// ---------- 4. Atsarginė kopija ir CSV ----------
// Bendros funkcijos (sudarytiKopija, skaitytiKopija, eksportuotiJson, eksportuotiCsv,
// paruostiFailoImporta) yra bendra.js – tos pačios, kurias naudoja biudžetas.

// Ar duomenys iš kopijos failo tikrai yra investavimo skaičiuoklės duomenys?
// Čia tikriname griežtai: visi laukai turi būti ir tilpti į ribas, visi žurnalo įrašai – tinkami.
function arTinkamiInvestavimoDuomenys(duomenys) {
  if (duomenys === null || typeof duomenys !== "object") {
    return false;
  }
  for (const laukas of INVESTAVIMO_LAUKAI) {
    if (!arTinkaLaukui(laukas, duomenys[laukas.raktas])) {
      return false;
    }
  }
  if (!Array.isArray(duomenys.zurnalas) || sutvarkytiZurnala(duomenys.zurnalas).length !== duomenys.zurnalas.length) {
    return false;
  }
  if (duomenys.dabartineVerte === null) {
    return true;
  }
  return typeof duomenys.dabartineVerte === "number" && Number.isFinite(duomenys.dabartineVerte) && duomenys.dabartineVerte >= 0;
}

function sudarytiInvestavimoKopija(nustatymai, data) {
  return sudarytiKopija("investavimas", INVESTAVIMO_VERSIJA, nustatymai, data);
}

function skaitytiInvestavimoKopija(tekstas) {
  return skaitytiKopija(tekstas, "investavimas", INVESTAVIMO_VERSIJA, arTinkamiInvestavimoDuomenys, "investavimo");
}

// Žurnalo lentelė CSV failui: įmokos nuo seniausios, su sukaupta įmokų suma.
function zurnaloCsvEilutes(zurnalas) {
  const eilutes = [["Data", "Įmoka", "Iš viso įmokėta"]];
  let isViso = 0;
  // rikiuotiZurnala grąžina naujausias viršuje, todėl apverčiame.
  for (const irasas of rikiuotiZurnala(zurnalas).reverse()) {
    isViso = isViso + irasas.suma;
    eilutes.push([irasas.data, irasas.suma, isViso]);
  }
  return eilutes;
}

// Prognozės lentelė CSV failui: tie patys skaičiai kaip lentelėje pagal metus.
function prognozesCsvEilutes(scenarijai) {
  const antraste = ["Metai", "Įmokėta"];
  for (const scenarijus of scenarijai) {
    antraste.push(scenarijus.pavadinimas + " " + skaiciusTekstu(scenarijus.graza) + " %");
  }
  const eilutes = [antraste];
  scenarijai[0].metuEilutes.forEach(function (eilute, indeksas) {
    const langeliai = [String(eilute.metai), eilute.imoketa];
    for (const scenarijus of scenarijai) {
      langeliai.push(scenarijus.metuEilutes[indeksas].verte);
    }
    eilutes.push(langeliai);
  });
  return eilutes;
}

// Atkuria investavimo duomenis iš kopijos failo teksto. Prieš pakeičiant paklausia.
function importuotiInvestavimoTeksta(tekstas) {
  const rezultatas = skaitytiInvestavimoKopija(tekstas);
  if (rezultatas.klaida) {
    rodytiKopijosBusena(rezultatas.klaida + " Dabartiniai duomenys nepakeisti.", true);
    return;
  }

  const klausimas =
    "Kopijoje yra įvestys ir " + rezultatas.duomenys.zurnalas.length +
    " žurnalo įmokų. Pakeisti jais viską, kas dabar yra šioje naršyklėje? Dabartiniai duomenys bus prarasti.";
  if (!confirm(klausimas)) {
    rodytiKopijosBusena("Atkūrimas atšauktas. Dabartiniai duomenys nepakeisti.", false);
    return;
  }

  // sutvarkyti… palieka tik mums žinomus laukus – jei faile būtų ko nors pašalinio, to neperimame.
  investavimas = sutvarkytiInvestavimoNustatymus(rezultatas.duomenys);
  issaugotiInvestavima();
  perpiestiInvestavimoLaukus();
  rodytiDabartineVerte();
  perpiestiZurnala();
  rodytiInvestavimoRezultatus();
  rodytiKopijosBusena("Duomenys atkurti iš kopijos.", false);
}

// Prijungia kortelės „Atsarginė kopija“ mygtukus. Kviečiama iš paleistiInvestavima().
function paruostiInvestavimoKopijas() {
  document.getElementById("eksportuoti").addEventListener("click", function () {
    eksportuotiJson("investavimas", sudarytiInvestavimoKopija(investavimas, new Date()));
  });

  document.getElementById("csv-zurnalas").addEventListener("click", function () {
    if (investavimas.zurnalas.length === 0) {
      rodytiKopijosBusena("Įmokų žurnalas tuščias, todėl nėra ko eksportuoti.", true);
      return;
    }
    eksportuotiCsv("investavimo-zurnalas", zurnaloCsvEilutes(investavimas.zurnalas));
  });

  document.getElementById("csv-prognoze").addEventListener("click", function () {
    eksportuotiCsv("investavimo-prognoze", prognozesCsvEilutes(visuScenarijuPrognoze(investavimas)));
  });

  paruostiFailoImporta("importuoti", "importo-failas", importuotiInvestavimoTeksta);
}
