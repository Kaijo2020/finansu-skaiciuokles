// Mėnesio biudžeto skaičiuoklė.
// Failas padalytas į dalis:
//   1. Duomenys      – kaip atrodo biudžetas (modelis) ir pavyzdinis biudžetas.
//   2. Skaičiavimai  – funkcijos, kurios iš duomenų gauna sumas.
//   3. Keitimai      – funkcijos, kurios prideda ir ištrina eilutes bei kategorijas.
//   4. Būsena        – dabartinis biudžetas ir jo išsaugojimas naršyklėje.
//   5. Rodymas       – funkcijos, kurios duomenis paverčia puslapio elementais
//                      ir reaguoja į žmogaus veiksmus.
// 1–3 dalys nieko nerodo, todėl jas galima patikrinti testais (testai.html).

// ---------- 1. Duomenys ----------

// Biudžetas – tai kategorijų sąrašas. Kiekviena kategorija turi:
//   id           – unikalų vardą programai (žmogus jo nemato),
//   pavadinimas  – ką mato žmogus,
//   tipas        – "pajamos" arba "islaidos",
//   eilutes      – eilučių sąrašą.
// Kiekviena eilutė turi:
//   id, pavadinimas,
//   suma           – skaičius eurais,
//   periodiskumas  – "menesine", "ketvirtine" arba "metine" (naudosime 7 žingsnyje),
//   zyma           – "butina", "noras" arba "taupymas" (naudosime 8 žingsnyje; pajamoms – null).
//
// Visi skaičiai čia išgalvoti ir apvalūs – tai tik pavyzdys.
function pavyzdinisBiudzetas() {
  return {
    kategorijos: [
      {
        id: "k1",
        pavadinimas: "Pajamos",
        tipas: "pajamos",
        eilutes: [
          { id: "e1", pavadinimas: "Atlyginimas", suma: 1600, periodiskumas: "menesine", zyma: null },
        ],
      },
      {
        id: "k2",
        pavadinimas: "Būstas",
        tipas: "islaidos",
        eilutes: [
          { id: "e3", pavadinimas: "Nuoma arba paskola", suma: 500, periodiskumas: "menesine", zyma: "butina" },
          { id: "e4", pavadinimas: "Komunaliniai mokesčiai", suma: 100, periodiskumas: "menesine", zyma: "butina" },
          { id: "e5", pavadinimas: "Internetas ir telefonas", suma: 30, periodiskumas: "menesine", zyma: "butina" },
        ],
      },
      {
        id: "k3",
        pavadinimas: "Maistas",
        tipas: "islaidos",
        eilutes: [
          { id: "e6", pavadinimas: "Parduotuvės", suma: 300, periodiskumas: "menesine", zyma: "butina" },
          { id: "e7", pavadinimas: "Kavinės ir restoranai", suma: 80, periodiskumas: "menesine", zyma: "noras" },
        ],
      },
      {
        id: "k4",
        pavadinimas: "Transportas",
        tipas: "islaidos",
        eilutes: [
          { id: "e8", pavadinimas: "Kuras arba bilietai", suma: 80, periodiskumas: "menesine", zyma: "butina" },
          { id: "e12", pavadinimas: "Automobilio draudimas", suma: 240, periodiskumas: "metine", zyma: "butina" },
        ],
      },
      {
        id: "k5",
        pavadinimas: "Laisvalaikis",
        tipas: "islaidos",
        eilutes: [
          { id: "e9", pavadinimas: "Pramogos", suma: 60, periodiskumas: "menesine", zyma: "noras" },
          { id: "e10", pavadinimas: "Prenumeratos", suma: 20, periodiskumas: "menesine", zyma: "noras" },
        ],
      },
      {
        id: "k6",
        pavadinimas: "Taupymas",
        tipas: "islaidos",
        eilutes: [
          { id: "e11", pavadinimas: "Santaupos", suma: 150, periodiskumas: "menesine", zyma: "taupymas" },
        ],
      },
    ],
  };
}

// ---------- 2. Skaičiavimai ----------

// Galimi periodiškumai: reikšmė duomenyse, užrašas žmogui ir kiek mėnesių apima viena suma.
const PERIODISKUMAI = [
  { reiksme: "menesine", pavadinimas: "Mėnesinė", menesiu: 1 },
  { reiksme: "ketvirtine", pavadinimas: "Ketvirtinė", menesiu: 3 },
  { reiksme: "metine", pavadinimas: "Metinė", menesiu: 12 },
];

// Kiek mėnesių apima eilutės suma (1, 3 arba 12). Nežinomą periodiškumą laikome mėnesiniu.
function eilutesMenesiu(eilute) {
  for (const periodiskumas of PERIODISKUMAI) {
    if (periodiskumas.reiksme === eilute.periodiskumas) {
      return periodiskumas.menesiu;
    }
  }
  return 1;
}

// Eilutės suma, perskaičiuota į vieną mėnesį: metinė 240 € -> 20 € per mėnesį.
function menesioSuma(eilute) {
  return eilute.suma / eilutesMenesiu(eilute);
}

// Vienos kategorijos visų eilučių suma per mėnesį.
function kategorijosSuma(kategorija) {
  let suma = 0;
  // Ciklas: tą patį veiksmą pakartojame kiekvienai sąrašo eilutei.
  for (const eilute of kategorija.eilutes) {
    suma = suma + menesioSuma(eilute);
  }
  return suma;
}

// Išlaidų žymos ir 50/30/20 taisyklės tikslai (procentais nuo pajamų).
// „daugiauGeriau“: taupymui gerai viršyti tikslą, o būtinoms išlaidoms ir norams – neviršyti.
const ZYMOS = [
  { reiksme: "butina", pavadinimas: "Būtina", tikslasProc: 50, daugiauGeriau: false },
  { reiksme: "noras", pavadinimas: "Noras", tikslasProc: 30, daugiauGeriau: false },
  { reiksme: "taupymas", pavadinimas: "Taupymas", tikslasProc: 20, daugiauGeriau: true },
];

// Eilutės žyma. Jei ji nenurodyta arba nežinoma, laikome išlaidą būtina.
function eilutesZyma(eilute) {
  for (const zyma of ZYMOS) {
    if (zyma.reiksme === eilute.zyma) {
      return zyma.reiksme;
    }
  }
  return "butina";
}

// Visų išlaidų su nurodyta žyma suma per mėnesį.
function zymosSuma(biudzetas, zyma) {
  let suma = 0;
  for (const kategorija of kategorijosPagalTipa(biudzetas, "islaidos")) {
    for (const eilute of kategorija.eilutes) {
      if (eilutesZyma(eilute) === zyma) {
        suma = suma + menesioSuma(eilute);
      }
    }
  }
  return suma;
}

// Palygina biudžetą su 50/30/20 taisykle. Kiekvienai žymai grąžina:
//   suma         – kiek skiriama per mėnesį,
//   dalisProc    – kokia tai pajamų dalis (null, jei pajamų nėra – dalyti iš nulio negalima),
//   tikslasSuma  – kiek būtų pagal taisyklę,
//   skirtumas    – suma minus tikslas (pliusas – daugiau nei tikslas).
function taisyklesPalyginimas(biudzetas) {
  const pajamos = tipoSuma(biudzetas, "pajamos");
  const likutis = menesioLikutis(biudzetas);

  const dalys = ZYMOS.map(function (zyma) {
    const suma = zymosSuma(biudzetas, zyma.reiksme);
    const tikslasSuma = (pajamos * zyma.tikslasProc) / 100;
    return {
      reiksme: zyma.reiksme,
      pavadinimas: zyma.pavadinimas,
      tikslasProc: zyma.tikslasProc,
      daugiauGeriau: zyma.daugiauGeriau,
      suma: suma,
      dalisProc: pajamos > 0 ? (suma / pajamos) * 100 : null,
      tikslasSuma: tikslasSuma,
      skirtumas: suma - tikslasSuma,
    };
  });

  return {
    pajamos: pajamos,
    dalys: dalys,
    likutis: likutis,
    likutisProc: pajamos > 0 ? (likutis / pajamos) * 100 : null,
  };
}

// Kiek lieka per mėnesį: pajamos minus išlaidos.
function menesioLikutis(biudzetas) {
  return tipoSuma(biudzetas, "pajamos") - tipoSuma(biudzetas, "islaidos");
}

// Tik vieno tipo ("pajamos" arba "islaidos") kategorijos.
function kategorijosPagalTipa(biudzetas, tipas) {
  return biudzetas.kategorijos.filter(function (kategorija) {
    return kategorija.tipas === tipas;
  });
}

// Visų vieno tipo kategorijų suma.
function tipoSuma(biudzetas, tipas) {
  let suma = 0;
  for (const kategorija of kategorijosPagalTipa(biudzetas, tipas)) {
    suma = suma + kategorijosSuma(kategorija);
  }
  return suma;
}

// ---------- 3. Keitimai ----------
// Šios funkcijos pakeičia biudžeto duomenis. Jos nieko nerodo ir neišsaugo,
// todėl jas taip pat galima patikrinti testais.

// Sugalvoja naują unikalų id, pvz. "e" + laikas + keli atsitiktiniai simboliai.
function naujasId(priesdelis) {
  return priesdelis + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Prideda tuščią kategoriją ir ją grąžina.
function pridetiKategorija(biudzetas, tipas) {
  const kategorija = { id: naujasId("k"), pavadinimas: "", tipas: tipas, eilutes: [] };
  biudzetas.kategorijos.push(kategorija);
  return kategorija;
}

// Ištrina kategoriją kartu su visomis jos eilutėmis.
function istrintiKategorija(biudzetas, kategorijosId) {
  biudzetas.kategorijos = biudzetas.kategorijos.filter(function (kategorija) {
    return kategorija.id !== kategorijosId;
  });
}

// Prideda tuščią eilutę į kategoriją ir ją grąžina.
function pridetiEilute(kategorija) {
  const eilute = {
    id: naujasId("e"),
    pavadinimas: "",
    suma: 0,
    periodiskumas: "menesine",
    zyma: kategorija.tipas === "islaidos" ? "butina" : null,
  };
  kategorija.eilutes.push(eilute);
  return eilute;
}

// Ištrina eilutę iš kategorijos.
function istrintiEilute(kategorija, eilutesId) {
  kategorija.eilutes = kategorija.eilutes.filter(function (eilute) {
    return eilute.id !== eilutesId;
  });
}

// Visas sumas paverčia nuliais. Kategorijos, eilutės, pavadinimai, periodiškumas ir žymos išlieka.
function isvalytiSumas(biudzetas) {
  for (const kategorija of biudzetas.kategorijos) {
    for (const eilute of kategorija.eilutes) {
      eilute.suma = 0;
    }
  }
}

// Kiek iš viso vieno tipo ("pajamos" arba "islaidos") eilučių yra biudžete.
function tipoEiluciuSkaicius(biudzetas, tipas) {
  let kiek = 0;
  for (const kategorija of kategorijosPagalTipa(biudzetas, tipas)) {
    kiek = kiek + kategorija.eilutes.length;
  }
  return kiek;
}

function pajamuEiluciuSkaicius(biudzetas) {
  return tipoEiluciuSkaicius(biudzetas, "pajamos");
}

// Nustato bendrą mėnesio pajamų arba išlaidų sumą (naudojama, kai ji įrašoma viršutinėje juostoje).
// Jei to tipo eilutė viena – pakeičiama jos suma. Kitu atveju visos to tipo kategorijos
// pakeičiamos viena kategorija su viena eilute. Kito tipo kategorijos neliečiamos.
function nustatytiTipoSuma(biudzetas, tipas, suma) {
  if (tipoEiluciuSkaicius(biudzetas, tipas) === 1) {
    for (const kategorija of kategorijosPagalTipa(biudzetas, tipas)) {
      for (const eilute of kategorija.eilutes) {
        eilute.suma = suma;
        eilute.periodiskumas = "menesine";
      }
    }
    return;
  }

  const pavadinimas = tipas === "pajamos" ? "Pajamos" : "Išlaidos";
  const nauja = {
    id: naujasId("k"),
    pavadinimas: pavadinimas,
    tipas: tipas,
    eilutes: [{
      id: naujasId("e"),
      pavadinimas: pavadinimas,
      suma: suma,
      periodiskumas: "menesine",
      zyma: tipas === "islaidos" ? "butina" : null,
    }],
  };

  // Sudedame naują sąrašą: pirma pajamų kategorijos, po jų išlaidų.
  const pajamos = tipas === "pajamos" ? [nauja] : kategorijosPagalTipa(biudzetas, "pajamos");
  const islaidos = tipas === "islaidos" ? [nauja] : kategorijosPagalTipa(biudzetas, "islaidos");
  biudzetas.kategorijos = pajamos.concat(islaidos);
}

function nustatytiPajamas(biudzetas, suma) {
  nustatytiTipoSuma(biudzetas, "pajamos", suma);
}

function nustatytiIslaidas(biudzetas, suma) {
  nustatytiTipoSuma(biudzetas, "islaidos", suma);
}

// Ar suma tinkama biudžetui: tikras skaičius ir ne neigiamas.
function arTinkamaSuma(suma) {
  return typeof suma === "number" && Number.isFinite(suma) && suma >= 0;
}

// Patikrina, ar duomenys tikrai yra biudžetas (turi visus reikalingus laukus).
// To reikia skaitant iš saugyklos, o vėliau – importuojant failą.
function arTinkamasBiudzetas(duomenys) {
  if (duomenys === null || typeof duomenys !== "object" || !Array.isArray(duomenys.kategorijos)) {
    return false;
  }
  for (const kategorija of duomenys.kategorijos) {
    if (kategorija === null || typeof kategorija !== "object") {
      return false;
    }
    if (typeof kategorija.id !== "string" || typeof kategorija.pavadinimas !== "string") {
      return false;
    }
    if (kategorija.tipas !== "pajamos" && kategorija.tipas !== "islaidos") {
      return false;
    }
    if (!Array.isArray(kategorija.eilutes)) {
      return false;
    }
    for (const eilute of kategorija.eilutes) {
      if (eilute === null || typeof eilute !== "object") {
        return false;
      }
      if (typeof eilute.id !== "string" || typeof eilute.pavadinimas !== "string") {
        return false;
      }
      if (!arTinkamaSuma(eilute.suma)) {
        return false;
      }
    }
  }
  // Mėnesių duomenų gali ir nebūti, bet jei yra – jie turi būti tinkami (žr. menesiai.js).
  if (duomenys.menesiai !== undefined && !arTinkamiMenesiai(duomenys.menesiai)) {
    return false;
  }
  return true;
}

// ---------- 4. Būsena ir išsaugojimas ----------

const BIUDZETO_RAKTAS = "biudzetas";
const BIUDZETO_VERSIJA = 1;

// Dabartinis biudžetas – vienintelė vieta, kur laikomi duomenys, kol puslapis atidarytas.
// Viskas, kas matoma ekrane, nupiešta iš šio kintamojo.
let biudzetas = null;

// Sumų rodikliai, kuriuos reikia atnaujinti pasikeitus bet kuriai sumai.
// Kiekvienas įrašas: { elementas, skaiciuoti } – kur rodyti ir kaip suskaičiuoti.
let sumuRodikliai = [];

// Pavadinimų laukai pagal id – kad pridėjus naują eilutę galėtume iškart į ją perkelti žymeklį.
let pavadinimuLaukai = {};

// Parodo trumpą pranešimą po antrašte.
function rodytiBusena(tekstas, arKlaida) {
  const busena = document.getElementById("busena");
  busena.textContent = tekstas;
  busena.className = arKlaida ? "klaidos-tekstas" : "blankus";
}

// Įrašo dabartinį biudžetą į naršyklės saugyklą.
function issaugotiBiudzeta() {
  const pavyko = issaugotiDuomenis(BIUDZETO_RAKTAS, BIUDZETO_VERSIJA, biudzetas);
  if (pavyko) {
    rodytiBusena("Pakeitimai išsaugoti šioje naršyklėje.", false);
  } else {
    rodytiBusena("Nepavyko išsaugoti: naršyklė neleidžia saugoti duomenų. Uždarius puslapį pakeitimai dings.", true);
  }
}

// ---------- 5. Rodymas ir redagavimas ----------

// Sukuria rodiklį – teksto vietą, kurios turinys priklauso nuo duomenų – ir įsimena jį,
// kad vėliau galėtume atnaujinti. „tekstas“ – funkcija, grąžinanti, ką rodyti dabar.
function sukurtiRodikli(klase, tekstas) {
  const elementas = sukurtiElementa("span", klase, tekstas());
  sumuRodikliai.push({ elementas: elementas, tekstas: tekstas });
  return elementas;
}

// Rodiklis, rodantis sumą eurais.
function sukurtiSumosRodikli(skaiciuoti) {
  return sukurtiRodikli("suma", function () {
    return rodytiSuma(skaiciuoti());
  });
}

// Atnaujina viršutinę suvestinę: pajamos, išlaidos, likutis per mėnesį.
function atnaujintiSuvestine() {
  const likutis = menesioLikutis(biudzetas);
  // Pajamos ir išlaidos viršuje – įvedimo laukai. Kol žmogus lauke rašo, jo teksto nekeičiame.
  for (const tipas of ["pajamos", "islaidos"]) {
    if (!redaguojamiLaukai[tipas]) {
      const laukas = document.getElementById("suvestine-" + tipas);
      laukas.value = formatuotiSkaiciu(tipoSuma(biudzetas, tipas));
      rodytiLaukoKlaida(laukas, document.getElementById("suvestine-klaida"), "");
    }
  }

  const likucioVieta = document.getElementById("suvestine-likutis");
  likucioVieta.textContent = rodytiSuma(likutis);
  // Neigiamas likutis – raudonai. Lyginame centais, kad -0,001 € nebūtų laikoma minusu.
  likucioVieta.className = Math.round(likutis * 100) < 0 ? "suvestines-reiksme neigiama" : "suvestines-reiksme teigiama";
}

// Ar žmogus šiuo metu rašo viršutiniame pajamų arba išlaidų lauke.
const redaguojamiLaukai = { pajamos: false, islaidos: false };

// Paruošia viršutinį lauką: į jį galima tiesiog įrašyti bendrą mėnesio sumą.
//   tipas       – "pajamos" arba "islaidos",
//   pavadinimas – žodis pranešimams ("Pajamos" arba "Išlaidos"),
//   perspejimas – papildomas sakinys klausime, kai kelios eilutės keičiamos viena.
function paruostiSuvestinesLauka(tipas, pavadinimas, perspejimas) {
  const laukas = document.getElementById("suvestine-" + tipas);
  const klaidosVieta = document.getElementById("suvestine-klaida");

  laukas.addEventListener("focus", function () {
    redaguojamiLaukai[tipas] = true;
    laukas.select();
  });

  // Rašant: jei eilutė viena (arba nė vienos), suma įrašoma iškart.
  // Jei eilučių kelios, palaukiame, kol žmogus baigs rašyti, ir tada paklausiame.
  laukas.addEventListener("input", function () {
    const reiksme = skaitytiSuma(laukas.value);
    if (arTinkamaSuma(reiksme) && tipoEiluciuSkaicius(biudzetas, tipas) <= 1) {
      nustatytiTipoSuma(biudzetas, tipas, Math.round(reiksme * 100) / 100);
      rodytiLaukoKlaida(laukas, klaidosVieta, "");
      issaugotiBiudzeta();
      perpiestiBiudzeta();
    }
  });

  // Išėjus iš lauko („blur“): parodome klaidą arba sutvarkome formatą.
  laukas.addEventListener("blur", function () {
    redaguojamiLaukai[tipas] = false;

    const reiksme = skaitytiSuma(laukas.value);
    if (!arTinkamaSuma(reiksme)) {
      rodytiLaukoKlaida(laukas, klaidosVieta, "Nesuprantu šios sumos (pavyzdys: 1 200,50). " + pavadinimas + " nepakeistos.");
      return;
    }

    const nauja = Math.round(reiksme * 100) / 100;
    const kiekEiluciu = tipoEiluciuSkaicius(biudzetas, tipas);
    const arPasikeite = Math.round(tipoSuma(biudzetas, tipas) * 100) !== Math.round(nauja * 100);
    if (kiekEiluciu > 1 && arPasikeite) {
      const klausimas =
        pavadinimas + " dabar sudėtos iš " + kiekEiluciu + " eilučių. Pakeisti jas viena eilute „" + pavadinimas +
        "“ su suma " + rodytiSuma(nauja) + "?" + perspejimas;
      if (confirm(klausimas)) {
        nustatytiTipoSuma(biudzetas, tipas, nauja);
        issaugotiBiudzeta();
      }
    }
    // Perpiešiame: laukas gauna sutvarkytą sumą, o eilutės žemiau – naujas reikšmes.
    perpiestiBiudzeta();
  });
}

// Perskaičiuoja visas rodomas sumas. Laukų neliečia, todėl rašant žymeklis nepabėga.
function atnaujintiSumas() {
  for (const rodiklis of sumuRodikliai) {
    rodiklis.elementas.textContent = rodiklis.tekstas();
  }
  atnaujintiApzvalgas();
}

// Sukuria išskleidžiamą pasirinkimą. „variantai“ – sąrašas su laukais reiksme ir pavadinimas
// (tinka ir PERIODISKUMAI, ir ZYMOS). „pakeitus“ – funkcija, kuri gauna naują reikšmę.
function sukurtiPasirinkima(aprasas, variantai, dabartine, pakeitus) {
  const pasirinkimas = sukurtiElementa("select", "laukas-pasirinkimas");
  pasirinkimas.setAttribute("aria-label", aprasas);
  for (const variantas of variantai) {
    const elementas = sukurtiElementa("option", "", variantas.pavadinimas);
    elementas.value = variantas.reiksme;
    pasirinkimas.appendChild(elementas);
  }
  // Reikšmę nustatome tik pridėję variantus – kitaip naršyklė neturėtų iš ko rinktis.
  pasirinkimas.value = dabartine;

  pasirinkimas.addEventListener("change", function () {
    pakeitus(pasirinkimas.value);
    issaugotiBiudzeta();
    atnaujintiSumas();
  });
  return pasirinkimas;
}

// Nupiešia palyginimą su 50/30/20 taisykle. Čia nėra įvedimo laukų,
// todėl galime drąsiai viską piešti iš naujo po kiekvieno pakeitimo.
function rodytiTaisykle() {
  const vieta = document.getElementById("taisykle");
  vieta.textContent = "";

  const palyginimas = taisyklesPalyginimas(biudzetas);
  if (palyginimas.pajamos <= 0) {
    vieta.appendChild(sukurtiElementa("p", "blankus", "Įveskite pajamas – tada bus galima palyginti su taisykle."));
    return;
  }

  for (const dalis of palyginimas.dalys) {
    const blokas = sukurtiElementa("div", "taisykles-dalis");

    const antraste = sukurtiElementa("div", "eilute");
    antraste.appendChild(sukurtiElementa("strong", "", dalis.pavadinimas));
    antraste.appendChild(sukurtiElementa("span", "suma", rodytiSuma(dalis.suma) + " · " + formatuotiProcentus(dalis.dalisProc)));
    blokas.appendChild(antraste);

    // Juosta: užpildas rodo faktinę pajamų dalį, brūkšnelis – tikslą.
    // Lyginame centais, kad 0,001 € skirtumas nebūtų laikomas viršijimu.
    const skirtumasCentais = Math.round(dalis.skirtumas * 100);
    const arGerai = dalis.daugiauGeriau ? skirtumasCentais >= 0 : skirtumasCentais <= 0;

    const juosta = sukurtiElementa("div", "juosta");
    const uzpildas = sukurtiElementa("div", arGerai ? "juostos-uzpildas" : "juostos-uzpildas juostos-uzpildas-blogai");
    uzpildas.style.width = Math.min(dalis.dalisProc, 100) + "%";
    const tikslas = sukurtiElementa("div", "juostos-tikslas");
    tikslas.style.left = dalis.tikslasProc + "%";
    juosta.appendChild(uzpildas);
    juosta.appendChild(tikslas);
    blokas.appendChild(juosta);

    let vertinimas;
    const kiek = rodytiSuma(Math.abs(dalis.skirtumas));
    if (dalis.daugiauGeriau) {
      vertinimas = arGerai ? "Tikslas pasiektas." : "Iki tikslo trūksta " + kiek + ".";
    } else if (skirtumasCentais === 0) {
      vertinimas = "Lygiai tiek, kiek numato tikslas.";
    } else {
      vertinimas = arGerai ? "Telpa į tikslą, dar lieka " + kiek + "." : "Viršija tikslą " + kiek + ".";
    }
    const tekstas = "Tikslas " + dalis.tikslasProc + " % – " + rodytiSuma(dalis.tikslasSuma) + ". " + vertinimas;
    blokas.appendChild(sukurtiElementa("p", arGerai ? "taisykles-vertinimas teigiama" : "taisykles-vertinimas neigiama", tekstas));

    vieta.appendChild(blokas);
  }

  // Likutis – pinigai, kurie dar niekam nepaskirti.
  const likutisCentais = Math.round(palyginimas.likutis * 100);
  let likucioTekstas;
  if (likutisCentais > 0) {
    likucioTekstas =
      "Nepaskirstytas likutis: " + rodytiSuma(palyginimas.likutis) + " (" + formatuotiProcentus(palyginimas.likutisProc) +
      " pajamų). Jį galima skirti taupymui arba norams.";
  } else if (likutisCentais === 0) {
    likucioTekstas = "Visos pajamos paskirstytos.";
  } else {
    likucioTekstas = "Išlaidos viršija pajamas " + rodytiSuma(Math.abs(palyginimas.likutis)) + ".";
  }
  vieta.appendChild(sukurtiElementa("p", likutisCentais < 0 ? "neigiama" : "blankus", likucioTekstas));
}

// Atnaujina viską, kas rodo bendrus rezultatus.
function atnaujintiApzvalgas() {
  atnaujintiSuvestine();
  rodytiTaisykle();
}

// Sukuria teksto lauką. „aprasas“ skirtas ekrano skaitytuvams – akimi jo nematyti.
function sukurtiLauka(klase, reiksme, aprasas, uzuomina) {
  const laukas = sukurtiElementa("input", klase);
  laukas.type = "text";
  laukas.value = reiksme;
  laukas.placeholder = uzuomina;
  laukas.setAttribute("aria-label", aprasas);
  return laukas;
}

// Sukuria mažą trynimo mygtuką.
function sukurtiTrynimoMygtuka(aprasas, veiksmas) {
  const mygtukas = sukurtiElementa("button", "antrinis mygtukas-trinti", "✕");
  mygtukas.type = "button";
  mygtukas.title = aprasas;
  mygtukas.setAttribute("aria-label", aprasas);
  // „Klausytojas“: funkcija, kurią naršyklė iškvies, kai mygtukas bus paspaustas.
  mygtukas.addEventListener("click", veiksmas);
  return mygtukas;
}

// Sukuria vieną redaguojamą eilutę: pavadinimas, suma, trynimo mygtukas.
function sukurtiEilutesElementa(kategorija, eilute) {
  const punktas = sukurtiElementa("li", "redaguojama-eilute");
  const laukai = sukurtiElementa("div", "eilutes-laukai");
  const klaidosVieta = sukurtiElementa("p", "klaidos-tekstas");
  klaidosVieta.hidden = true;

  // Pavadinimas: kiekvienas paspaustas klavišas iškart įrašomas į duomenis ir išsaugomas.
  const pavadinimas = sukurtiLauka("laukas-pavadinimas", eilute.pavadinimas, "Eilutės pavadinimas", "Pavadinimas");
  pavadinimas.addEventListener("input", function () {
    eilute.pavadinimas = pavadinimas.value;
    issaugotiBiudzeta();
  });
  pavadinimuLaukai[eilute.id] = pavadinimas;

  // Suma. inputmode="decimal" telefone atidaro skaičių klaviatūrą su kableliu.
  const suma = sukurtiLauka("laukas-suma", formatuotiSkaiciu(eilute.suma), "Suma eurais", "0,00");
  suma.setAttribute("inputmode", "decimal");

  // Paspaudus lauką pažymimas visas tekstas – patogu iškart rašyti naują sumą.
  suma.addEventListener("focus", function () {
    suma.select();
  });

  // Rašant: jei įvestis suprantama, iškart atnaujiname duomenis ir sumas.
  suma.addEventListener("input", function () {
    const reiksme = skaitytiSuma(suma.value);
    if (arTinkamaSuma(reiksme)) {
      // Apvaliname iki centų.
      eilute.suma = Math.round(reiksme * 100) / 100;
      rodytiLaukoKlaida(suma, klaidosVieta, "");
      issaugotiBiudzeta();
      atnaujintiSumas();
    }
  });

  // Baigus rašyti (išėjus iš lauko): sutvarkome formatą arba parodome klaidą.
  suma.addEventListener("change", function () {
    const reiksme = skaitytiSuma(suma.value);
    if (arTinkamaSuma(reiksme)) {
      suma.value = formatuotiSkaiciu(eilute.suma);
    } else {
      rodytiLaukoKlaida(
        suma,
        klaidosVieta,
        "Nesuprantu šios sumos (pavyzdys: 1 200,50). Skaičiuojama su " + rodytiSuma(eilute.suma) + "."
      );
    }
  });

  const trinti = sukurtiTrynimoMygtuka("Ištrinti eilutę", function () {
    const tuscia = eilute.pavadinimas === "" && eilute.suma === 0;
    if (tuscia || confirm("Ištrinti eilutę „" + eilute.pavadinimas + "“?")) {
      istrintiEilute(kategorija, eilute.id);
      issaugotiBiudzeta();
      perpiestiBiudzeta();
    }
  });

  // Pirma eilutė: pavadinimas per visą plotį ir trynimo mygtukas.
  laukai.appendChild(pavadinimas);
  laukai.appendChild(trinti);

  // Antra eilutė: periodiškumas ir, jei suma ne mėnesinė, kiek tai yra per mėnesį.
  const papildoma = sukurtiElementa("div", "eilutes-papildoma");
  // Suma – antroje eilutėje, kad telefone pavadinimui liktų visas plotis.
  papildoma.appendChild(suma);
  const dabartinisPeriodiskumas = eilutesMenesiu(eilute) === 1 ? "menesine" : eilute.periodiskumas;
  papildoma.appendChild(sukurtiPasirinkima("Periodiškumas", PERIODISKUMAI, dabartinisPeriodiskumas, function (reiksme) {
    eilute.periodiskumas = reiksme;
  }));
  // Žyma „Būtina / Noras / Taupymas“ – tik išlaidoms.
  if (kategorija.tipas === "islaidos") {
    papildoma.appendChild(sukurtiPasirinkima("Išlaidos rūšis", ZYMOS, eilutesZyma(eilute), function (reiksme) {
      eilute.zyma = reiksme;
    }));
  }
  // Trečia eilutė atsiranda tik tada, kai suma ne mėnesinė: kiek tai yra per mėnesį.
  const ekvivalentas = sukurtiRodikli("suma blankus eilutes-ekvivalentas", function () {
    if (eilutesMenesiu(eilute) === 1) {
      return "";
    }
    return "= " + rodytiSuma(menesioSuma(eilute)) + " per mėn.";
  });

  punktas.appendChild(laukai);
  punktas.appendChild(papildoma);
  punktas.appendChild(ekvivalentas);
  punktas.appendChild(klaidosVieta);
  return punktas;
}

// Sukuria vienos kategorijos kortelę.
function sukurtiKategorijosKortele(kategorija) {
  const kortele = sukurtiElementa("section", "kortele kategorija");

  const antraste = sukurtiElementa("div", "eilutes-laukai kategorijos-antraste");
  const pavadinimas = sukurtiLauka(
    "laukas-pavadinimas laukas-kategorija",
    kategorija.pavadinimas,
    "Kategorijos pavadinimas",
    "Kategorija"
  );
  pavadinimas.addEventListener("input", function () {
    kategorija.pavadinimas = pavadinimas.value;
    issaugotiBiudzeta();
  });
  pavadinimuLaukai[kategorija.id] = pavadinimas;

  const trinti = sukurtiTrynimoMygtuka("Ištrinti kategoriją", function () {
    const kiek = kategorija.eilutes.length;
    const klausimas = "Ištrinti kategoriją „" + kategorija.pavadinimas + "“ ir visas jos eilutes (" + kiek + ")?";
    if (kiek === 0 || confirm(klausimas)) {
      istrintiKategorija(biudzetas, kategorija.id);
      issaugotiBiudzeta();
      perpiestiBiudzeta();
    }
  });

  antraste.appendChild(pavadinimas);
  antraste.appendChild(sukurtiSumosRodikli(function () {
    return kategorijosSuma(kategorija);
  }));
  antraste.appendChild(trinti);
  kortele.appendChild(antraste);

  const sarasas = sukurtiElementa("ul", "eilutes");
  for (const eilute of kategorija.eilutes) {
    sarasas.appendChild(sukurtiEilutesElementa(kategorija, eilute));
  }
  kortele.appendChild(sarasas);

  const prideti = sukurtiElementa("button", "antrinis", "+ Pridėti eilutę");
  prideti.type = "button";
  prideti.addEventListener("click", function () {
    const nauja = pridetiEilute(kategorija);
    issaugotiBiudzeta();
    perpiestiBiudzeta();
    pavadinimuLaukai[nauja.id].focus();
  });
  kortele.appendChild(prideti);

  return kortele;
}

// Sukuria visą dalį („Pajamos“ arba „Išlaidos“).
function sukurtiDali(tipas, pavadinimas, mygtukoTekstas) {
  const dalis = sukurtiElementa("section", "biudzeto-dalis");

  const antraste = sukurtiElementa("div", "eilute dalies-antraste");
  antraste.appendChild(sukurtiElementa("h2", "", pavadinimas));
  antraste.appendChild(sukurtiSumosRodikli(function () {
    return tipoSuma(biudzetas, tipas);
  }));
  dalis.appendChild(antraste);

  for (const kategorija of kategorijosPagalTipa(biudzetas, tipas)) {
    dalis.appendChild(sukurtiKategorijosKortele(kategorija));
  }

  const prideti = sukurtiElementa("button", "antrinis", mygtukoTekstas);
  prideti.type = "button";
  prideti.addEventListener("click", function () {
    const nauja = pridetiKategorija(biudzetas, tipas);
    issaugotiBiudzeta();
    perpiestiBiudzeta();
    pavadinimuLaukai[nauja.id].focus();
  });
  dalis.appendChild(prideti);

  return dalis;
}

// Nupiešia visą biudžetą iš naujo. Kviečiama, kai pasikeičia sandara
// (pridėta ar ištrinta eilutė arba kategorija).
function perpiestiBiudzeta() {
  sumuRodikliai = [];
  pavadinimuLaukai = {};

  const vieta = document.getElementById("biudzetas");
  vieta.textContent = "";
  vieta.appendChild(sukurtiDali("pajamos", "Pajamos", "+ Pridėti pajamų kategoriją"));
  vieta.appendChild(sukurtiDali("islaidos", "Išlaidos", "+ Pridėti išlaidų kategoriją"));

  atnaujintiApzvalgas();
}

// Pradžia: kviečiama iš biudzetas.html, kai puslapis įkeltas.
function paleistiBiudzeta() {
  const issaugota = nuskaitytiDuomenis(BIUDZETO_RAKTAS);

  if (issaugota === null) {
    biudzetas = pavyzdinisBiudzetas();
    rodytiBusena("Rodomas pavyzdinis biudžetas. Jūsų pakeitimai bus išsaugomi automatiškai šioje naršyklėje.", false);
  } else if (issaugota.versija === BIUDZETO_VERSIJA && arTinkamasBiudzetas(issaugota.duomenys)) {
    biudzetas = issaugota.duomenys;
    rodytiBusena("Rodomas jūsų išsaugotas biudžetas.", false);
  } else {
    biudzetas = pavyzdinisBiudzetas();
    rodytiBusena("Išsaugotų duomenų nepavyko suprasti, todėl rodomas pavyzdinis biudžetas.", true);
  }

  uztikrintiMenesius(biudzetas);
  pasirinktasMenuo = dabartinisMenuo(new Date());
  pasirinktiMetai = new Date().getFullYear();

  paruostiSuvestinesLauka("pajamos", "Pajamos", "");
  paruostiSuvestinesLauka(
    "islaidos",
    "Išlaidos",
    " Dabartinės kategorijos ir žymos „Būtina / Noras / Taupymas“ bus ištrintos, todėl 50/30/20 palyginimas nebeteks prasmės."
  );

  perpiestiBiudzeta();

  document.getElementById("atkurti").addEventListener("click", function () {
    if (confirm("Ištrinti biudžeto pakeitimus ir grąžinti pavyzdinį biudžetą? Mėnesių duomenys išliks.")) {
      const menesiai = biudzetas.menesiai;
      biudzetas = pavyzdinisBiudzetas();
      biudzetas.menesiai = menesiai;
      issaugotiBiudzeta();
      perpiestiBiudzeta();
    }
  });

  document.getElementById("isvalyti").addEventListener("click", function () {
    if (confirm("Visas biudžeto sumas pakeisti į 0,00 €? Kategorijos ir eilutės išliks, mėnesių duomenys taip pat.")) {
      isvalytiSumas(biudzetas);
      issaugotiBiudzeta();
      perpiestiBiudzeta();
    }
  });

  paruostiKopijas();

  // Skirtukai: paspaudus parodoma atitinkama skiltis.
  for (const skiltis of SKILTYS) {
    document.getElementById("skirtukas-" + skiltis).addEventListener("click", function () {
      rodytiSkilti(skiltis);
    });
  }
  rodytiSkilti("biudzetas");
}

// Puslapio skiltys. Kiekvienai HTML faile yra mygtukas „skirtukas-…“ ir blokas „skiltis-…“.
const SKILTYS = ["biudzetas", "menesiai", "metai"];

// Parodo vieną skiltį, o kitas paslepia.
function rodytiSkilti(pasirinkta) {
  for (const skiltis of SKILTYS) {
    const arRodoma = skiltis === pasirinkta;
    document.getElementById("skiltis-" + skiltis).hidden = !arRodoma;
    // aria-selected pasako ekrano skaitytuvui, kuris skirtukas aktyvus; pagal jį ir CSS nuspalvina mygtuką.
    document.getElementById("skirtukas-" + skiltis).setAttribute("aria-selected", arRodoma ? "true" : "false");
  }
  if (pasirinkta === "menesiai") {
    perpiestiMenesi();
  }
  if (pasirinkta === "metai") {
    perpiestiMetus();
  }
}
