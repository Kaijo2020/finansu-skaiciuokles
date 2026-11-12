// Automatiniai testai: kiekvienas testas iškviečia funkciją ir palygina,
// ar ji grąžino tai, ko tikėjomės. Atidarius testai.html matyti rezultatai.

// Nelūžtantis tarpas – toks pat, kokį naudoja formatuotiSkaiciu().
const NT = "\u00A0";

// Testų sąrašas. Kiekvienas testas: pavadinimas, ką gavome, ko tikėjomės.
// Nauji testai pridedami tiesiog nauja eilute.
function surinktiTestus() {
  const saugykla = bandytiSaugykla();
  const keitimai = bandytiKeitimus();
  const men = bandytiMenesius();
  const met = bandytiMetus();
  const paj = bandytiPajamas();
  const isl = bandytiIslaidas();
  const kop = bandytiKopijas();
  const inv = investavimoPrognoze({ pradine: 5000, imoka: 200, metai: 20, graza: 6 });
  const kast = investavimoPrognoze({ pradine: 2000, imoka: 150, metai: 10, graza: 5, ter: 0.3, komisinis: 1 });
  const scen = visuScenarijuPrognoze(numatytiejiInvestavimoNustatymai());
  const graf = grafikoDuomenys(scen, 20);
  const zurn = bandytiZurnala();
  const invKop = bandytiInvestavimoKopijas(zurn.zurnalas);
  const gpmNust = { gpmTarifas: 15, gpmLengvata: 500, gpmTarifasIS: 15 };
  const gpm1 = gpmSkaiciavimas(30000, 20000, gpmNust);
  // Bandomasis mastelis: 400 × 200 pikselių, 10 metų, sumos iki 100.
  const mast = grafikoMastelis(400, 200, { kaire: 10, desine: 30, virsus: 20, apacia: 20 }, 10, 100);
  // Eilutės pabaiga CSV faile (simbolių kodai 13 ir 10).
  const CRLF = String.fromCharCode(13, 10);
  const isvalytas = pavyzdinisBiudzetas();
  isvalytiSumas(isvalytas);
  const taisykle = taisyklesPalyginimas(pavyzdinisBiudzetas());

  // Mažas biudžetas testams – su žinomais skaičiais, kad atsakymą galėtume suskaičiuoti mintyse.
  const bandomasisBiudzetas = {
    kategorijos: [
      { id: "a", pavadinimas: "Alga", tipas: "pajamos", eilutes: [{ id: "a1", pavadinimas: "Alga", suma: 1000 }] },
      {
        id: "b",
        pavadinimas: "Namai",
        tipas: "islaidos",
        eilutes: [
          { id: "b1", pavadinimas: "Nuoma", suma: 100 },
          { id: "b2", pavadinimas: "Elektra", suma: 50.5 },
        ],
      },
      { id: "c", pavadinimas: "Tuščia", tipas: "islaidos", eilutes: [] },
    ],
  };

  return [
    // --- skaitytiSuma: atvejai iš CLAUDE.md ---
    ["skaitytiSuma: 1.200", skaitytiSuma("1.200"), 1200],
    ["skaitytiSuma: 1 200", skaitytiSuma("1 200"), 1200],
    ["skaitytiSuma: 1.200,50", skaitytiSuma("1.200,50"), 1200.5],
    ["skaitytiSuma: 12,5", skaitytiSuma("12,5"), 12.5],

    // --- skaitytiSuma: kiti teisingi atvejai ---
    ["skaitytiSuma: 0", skaitytiSuma("0"), 0],
    ["skaitytiSuma: 1200", skaitytiSuma("1200"), 1200],
    ["skaitytiSuma: 12.5 (taškas kaip dešimtainis)", skaitytiSuma("12.5"), 12.5],
    ["skaitytiSuma: 0,99", skaitytiSuma("0,99"), 0.99],
    ["skaitytiSuma: 0.500 (ne tūkstančiai)", skaitytiSuma("0.500"), 0.5],
    ["skaitytiSuma: 1.234.567,89", skaitytiSuma("1.234.567,89"), 1234567.89],
    ["skaitytiSuma: 1 234 567", skaitytiSuma("1 234 567"), 1234567],
    ["skaitytiSuma: nelūžtantis tarpas", skaitytiSuma("1" + NT + "200,50"), 1200.5],
    ["skaitytiSuma: tarpai aplink", skaitytiSuma("  45,00  "), 45],
    ["skaitytiSuma: su € ženklu", skaitytiSuma("1 200,50 €"), 1200.5],
    ["skaitytiSuma: neigiama", skaitytiSuma("-12,5"), -12.5],

    // --- skaitytiSuma: neaiški įvestis turi būti NaN, o ne nulis ---
    ["skaitytiSuma: tuščia", skaitytiSuma(""), NaN],
    ["skaitytiSuma: raidės", skaitytiSuma("abc"), NaN],
    ["skaitytiSuma: 12abc", skaitytiSuma("12abc"), NaN],
    ["skaitytiSuma: du kableliai", skaitytiSuma("1,2,3"), NaN],
    ["skaitytiSuma: 1,200.50 (angliškas formatas)", skaitytiSuma("1,200.50"), NaN],
    ["skaitytiSuma: 12.34.5 (blogi taškai)", skaitytiSuma("12.34.5"), NaN],
    ["skaitytiSuma: kablelis be skaitmenų", skaitytiSuma("12,"), NaN],
    ["skaitytiSuma: ne tekstas", skaitytiSuma(undefined), NaN],

    // --- rodytiSuma ---
    ["rodytiSuma: 0", rodytiSuma(0), "0,00" + NT + "€"],
    ["rodytiSuma: 12.5", rodytiSuma(12.5), "12,50" + NT + "€"],
    ["rodytiSuma: 1234.56", rodytiSuma(1234.56), "1" + NT + "234,56" + NT + "€"],
    ["rodytiSuma: 1234567.891", rodytiSuma(1234567.891), "1" + NT + "234" + NT + "567,89" + NT + "€"],
    ["rodytiSuma: 999.999 apvalinama", rodytiSuma(999.999), "1" + NT + "000,00" + NT + "€"],
    ["rodytiSuma: neigiama", rodytiSuma(-50), "-50,00" + NT + "€"],
    ["rodytiSuma: -0.001 be minuso", rodytiSuma(-0.001), "0,00" + NT + "€"],
    ["rodytiSuma: NaN", rodytiSuma(NaN), "–"],
    ["formatuotiSkaiciu: 1200", formatuotiSkaiciu(1200), "1" + NT + "200,00"],

    // --- pirmyn ir atgal: parodyta suma turi būti perskaitoma atgal ---
    ["pirmyn ir atgal: 1234.56", skaitytiSuma(rodytiSuma(1234.56)), 1234.56],

    // --- išsaugojimas naršyklėje ---
    ["saugykla: kol nieko nėra – null", saugykla.tuscia, null],
    ["saugykla: išsaugoti pavyksta", saugykla.issaugota, true],
    ["saugykla: raktas su priešdėliu finansai.", saugykla.raktasSuPriesdeliu, true],
    ["saugykla: nuskaityta versija", saugykla.versija, 3],
    ["saugykla: nuskaityti duomenys tokie patys", saugykla.duomenys, saugykla.tiketasi],
    ["saugykla: sugadintas įrašas – null", saugykla.sugadinta, null],
    ["saugykla: ne tos formos įrašas – null", saugykla.neTaForma, null],
    ["saugykla: po ištrynimo – null", saugykla.poIstrynimo, null],

    // --- biudžetas: sumos ---
    ["biudžetas: kategorijos suma", kategorijosSuma(bandomasisBiudzetas.kategorijos[1]), 150.5],
    ["biudžetas: tuščios kategorijos suma", kategorijosSuma(bandomasisBiudzetas.kategorijos[2]), 0],
    ["biudžetas: pajamų suma", tipoSuma(bandomasisBiudzetas, "pajamos"), 1000],
    ["biudžetas: išlaidų suma", tipoSuma(bandomasisBiudzetas, "islaidos"), 150.5],
    ["biudžetas: išlaidų kategorijų skaičius", kategorijosPagalTipa(bandomasisBiudzetas, "islaidos").length, 2],
    ["biudžetas: pavyzdinio pajamos", tipoSuma(pavyzdinisBiudzetas(), "pajamos"), 1600],
    ["biudžetas: pavyzdinio išlaidos", tipoSuma(pavyzdinisBiudzetas(), "islaidos"), 1340],
    ["biudžetas: pavyzdinio likutis", menesioLikutis(pavyzdinisBiudzetas()), 260],
    ["biudžetas: bandomojo likutis", menesioLikutis(bandomasisBiudzetas), 849.5],

    // --- biudžetas: periodiškumas ---
    ["periodiškumas: mėnesinė 120", menesioSuma({ suma: 120, periodiskumas: "menesine" }), 120],
    ["periodiškumas: ketvirtinė 120 -> 40", menesioSuma({ suma: 120, periodiskumas: "ketvirtine" }), 40],
    ["periodiškumas: metinė 120 -> 10", menesioSuma({ suma: 120, periodiskumas: "metine" }), 10],
    ["periodiškumas: nenurodyta – kaip mėnesinė", menesioSuma({ suma: 120 }), 120],
    ["periodiškumas: nežinoma – kaip mėnesinė", menesioSuma({ suma: 120, periodiskumas: "savaitine" }), 120],
    ["periodiškumas: metinė 100 rodoma 8,33", formatuotiSkaiciu(menesioSuma({ suma: 100, periodiskumas: "metine" })), "8,33"],
    ["periodiškumas: kategorija su skirtingomis eilutėmis", kategorijosSuma({ eilutes: [
      { suma: 50, periodiskumas: "menesine" },
      { suma: 90, periodiskumas: "ketvirtine" },
      { suma: 240, periodiskumas: "metine" },
    ] }), 100],

    // --- biudžetas: 50/30/20 ---
    ["50/30/20: būtinos išlaidos", taisykle.dalys[0].suma, 1030],
    ["50/30/20: būtinų dalis", taisykle.dalys[0].dalisProc, 64.375],
    ["50/30/20: būtinų tikslas", taisykle.dalys[0].tikslasSuma, 800],
    ["50/30/20: būtinos viršija tikslą", taisykle.dalys[0].skirtumas, 230],
    ["50/30/20: norai", taisykle.dalys[1].suma, 160],
    ["50/30/20: norų tikslas", taisykle.dalys[1].tikslasSuma, 480],
    ["50/30/20: taupymas", taisykle.dalys[2].suma, 150],
    ["50/30/20: iki taupymo tikslo trūksta", taisykle.dalys[2].skirtumas, -170],
    ["50/30/20: likutis", taisykle.likutis, 260],
    ["50/30/20: likučio dalis", taisykle.likutisProc, 16.25],
    ["50/30/20: dalys ir likutis sudaro pajamas", taisykle.dalys[0].suma + taisykle.dalys[1].suma + taisykle.dalys[2].suma + taisykle.likutis, 1600],
    ["50/30/20: be pajamų dalis nežinoma", taisyklesPalyginimas({ kategorijos: [] }).dalys[0].dalisProc, null],
    ["50/30/20: išlaida be žymos – būtina", eilutesZyma({ suma: 10 }), "butina"],
    ["50/30/20: metinė išlaida skaičiuojama per mėnesį", zymosSuma({ kategorijos: [{ tipas: "islaidos", eilutes: [{ suma: 120, periodiskumas: "metine", zyma: "noras" }] }] }, "noras"), 10],
    ["formatuotiProcentus: 64.375", formatuotiProcentus(64.375), "64,4 %"],
    ["formatuotiProcentus: 10", formatuotiProcentus(10), "10,0 %"],
    ["formatuotiProcentus: null", formatuotiProcentus(null), "–"],

    // --- mėnesiai: datos ---
    ["mėnesiai: raktas", menesioRaktas(2026, 3), "2026-03"],
    ["mėnesiai: raktas iš datos", dabartinisMenuo(new Date(2026, 10, 11)), "2026-11"],
    ["mėnesiai: kitas mėnuo", gretimasMenuo("2026-06", 1), "2026-07"],
    ["mėnesiai: ankstesnis per metų ribą", gretimasMenuo("2026-01", -1), "2025-12"],
    ["mėnesiai: kitas per metų ribą", gretimasMenuo("2026-12", 1), "2027-01"],
    ["mėnesiai: pavadinimas", menesioPavadinimas("2026-11"), "2026 m. lapkritis"],
    ["mėnesiai: teisingas raktas", arMenesioRaktas("2026-01"), true],
    ["mėnesiai: 13 mėnesio nėra", arMenesioRaktas("2026-13"), false],
    ["mėnesiai: raktas be nulio netinka", arMenesioRaktas("2026-1"), false],

    // --- mėnesiai: planas ir faktas ---
    ["mėnesiai: eilutė kiekvienai kategorijai", men.eiluciu, 6],
    ["mėnesiai: užfiksuotas Būsto planas", men.bustoPlanas, 630],
    ["mėnesiai: metinė išlaida plane per mėnesį", men.transportoPlanas, 100],
    ["mėnesiai: išlaidų faktas iš pradžių neįvestas", men.pradinisFaktas, null],
    ["mėnesiai: pajamų faktas iš pradžių lygus planui", men.pradinisPajamuFaktas, 1600],
    ["mėnesiai: pradžioje užpildytos tik pajamos", men.pradziojeUzpildyta, 1],
    ["mėnesiai: planuotos išlaidos", men.planasIslaidos, 1340],
    ["mėnesiai: planuotas likutis", men.planasLikutis, 260],
    ["mėnesiai: faktinės pajamos", men.faktasPajamos, 1650],
    ["mėnesiai: faktinės išlaidos (tik įvestos)", men.faktasIslaidos, 655.2],
    ["mėnesiai: faktinis likutis", men.faktasLikutis, 994.8],
    ["mėnesiai: užpildyta 2 iš 6", men.uzpildyta, 2],
    ["mėnesiai: pakeitus biudžetą planas nesikeičia", men.planasPoBiudzetoKeitimo, 630],
    ["mėnesiai: atnaujinus planas pasikeičia", men.planasPoAtnaujinimo, 730],
    ["mėnesiai: atnaujinus faktas išlieka", men.faktasPoAtnaujinimo, 655.2],
    ["mėnesiai: ištrinta kategorija su faktu lieka", men.istrintaSuFaktu, "Pajamos/0/1650"],
    ["mėnesiai: ištrinta kategorija be fakto dingsta", men.istrintaBeFakto, false],
    ["mėnesiai: ištrynus mėnesį jo nebėra", men.poIstrynimo, true],

    // --- mėnesiai: skirtumo vertinimas ---
    ["skirtumas: išlaidos viršytos", skirtumoVertinimas("islaidos", 100, 120.5).tekstas, "viršyta 20,50" + NT + "€"],
    ["skirtumas: išlaidos viršytos – raudonai", skirtumoVertinimas("islaidos", 100, 120.5).klase, "neigiama"],
    ["skirtumas: išlaidų liko", skirtumoVertinimas("islaidos", 100, 80).tekstas, "liko 20,00" + NT + "€"],
    ["skirtumas: išlaidų liko – žaliai", skirtumoVertinimas("islaidos", 100, 80).klase, "teigiama"],
    ["skirtumas: pajamų daugiau – žaliai", skirtumoVertinimas("pajamos", 100, 150).klase, "teigiama"],
    ["skirtumas: pajamų mažiau", skirtumoVertinimas("pajamos", 100, 50).tekstas, "mažiau 50,00" + NT + "€"],
    ["skirtumas: pagal planą", skirtumoVertinimas("islaidos", 100, 100).tekstas, "pagal planą"],
    ["skirtumas: faktas neįvestas", skirtumoVertinimas("islaidos", 100, null).tekstas, "faktas neįvestas"],
    ["skirtumas: faktas 0 nėra tas pats, kas neįvestas", skirtumoVertinimas("islaidos", 100, 0).tekstas, "liko 100,00" + NT + "€"],

    // --- mėnesiai: duomenų tikrinimas ---
    ["tikrinimas: tušti mėnesiai tinka", arTinkamiMenesiai({}), true],
    ["tikrinimas: pradėtas mėnuo tinka", men.arTinkami, true],
    ["tikrinimas: biudžetas su mėnesiais tinka", men.arTinkamasVisas, true],
    ["tikrinimas: blogas mėnesio raktas netinka", arTinkamiMenesiai({ "lapkritis": { eilutes: [] } }), false],
    ["tikrinimas: mėnuo be eilučių netinka", arTinkamiMenesiai({ "2026-11": {} }), false],
    ["tikrinimas: faktas tekstu netinka", arTinkamiMenesiai({ "2026-11": { eilutes: [{ kategorijosId: "a", pavadinimas: "A", tipas: "islaidos", planas: 1, faktas: "5" }] } }), false],
    ["tikrinimas: biudžetas su blogais mėnesiais netinka", arTinkamasBiudzetas({ kategorijos: [], menesiai: [] }), false],

    // --- metų apžvalga ---
    ["metai: 12 eilučių", met.apzvalga.eilutes.length, 12],
    ["metai: sausis pradėtas", met.apzvalga.eilutes[0].pradetas, true],
    ["metai: vasaris nepradėtas", met.apzvalga.eilutes[1].pradetas, false],
    ["metai: pradėti 2 mėnesiai (kitų metų neskaičiuojame)", met.apzvalga.pradetu, 2],
    ["metai: sausis pilnas", met.apzvalga.eilutes[0].arPilnas, true],
    ["metai: kovas nepilnas", met.apzvalga.eilutes[2].arPilnas, false],
    ["metai: sausio faktinės išlaidos", met.apzvalga.eilutes[0].islaidos.faktas, 1390],
    ["metai: planuotos pajamos iš viso", met.apzvalga.isViso.pajamos.planas, 3200],
    ["metai: planuotos išlaidos iš viso", met.apzvalga.isViso.islaidos.planas, 2680],
    ["metai: faktinės išlaidos iš viso", met.apzvalga.isViso.islaidos.faktas, 1990],
    ["metai: planuotas likutis iš viso", met.apzvalga.isViso.likutis.planas, 520],
    ["metai: faktinis likutis iš viso", met.apzvalga.isViso.likutis.faktas, 1210],
    ["metai: tušti metai", metuApzvalga({ menesiai: {} }, 2030).pradetu, 0],
    ["metai: kategorijų skaičius", met.kategorijos.length, 6],
    ["metai: Būsto planas per metus", met.kategorijos[1].planas, 1260],
    ["metai: Būsto faktas per metus", met.kategorijos[1].faktas, 1240],
    ["metai: Maisto faktas (kovą neįvestas)", met.kategorijos[2].faktas, 390],
    ["metai: pavadinimas iš vėliausio mėnesio", met.kategorijos[1].pavadinimas, "Namai"],
    ["formatuotiSuZenklu: pliusas", formatuotiSuZenklu(25.2), "+25,20"],
    ["formatuotiSuZenklu: minusas", formatuotiSuZenklu(-30), "-30,00"],
    ["formatuotiSuZenklu: nulis", formatuotiSuZenklu(0), "0,00"],

    // --- biudžetas: pajamos viena suma ---
    ["pajamos: pavyzdyje viena eilutė", pajamuEiluciuSkaicius(pavyzdinisBiudzetas()), 1],
    ["pajamos: viena eilutė – pakeičiama jos suma", paj.vienaSuma, 2100.5],
    ["pajamos: viena eilutė – pavadinimas išlieka", paj.vienaPavadinimas, "Atlyginimas"],
    ["pajamos: viena eilutė – metinė tampa mėnesine", paj.vienaPeriodiskumas, "menesine"],
    ["pajamos: viena eilutė – išlaidos neliečiamos", paj.vienaIslaidos, 1340],
    ["pajamos: kelios eilutės – lieka viena", paj.keliosEiluciu, 1],
    ["pajamos: kelios eilutės – suma", paj.keliosSuma, 900],
    ["pajamos: kelios eilutės – išlaidų kategorijos išlieka", paj.keliosIslaiduKategoriju, 5],
    ["pajamos: kelios eilutės – pajamos sąrašo pradžioje", paj.keliosPirmaTipas, "pajamos"],
    ["pajamos: nėra eilučių – sukuriama", paj.tusciasSuma, 500],
    ["pajamos: rezultatas tinkamas biudžetas", paj.arTinkamas, true],

    // --- investavimas: formulė ---
    ["investavimas: 0 % mėnesio grąža", menesioGraza(0), 0],
    ["investavimas: 12 mėnesio grąžų sudaro metinę", Math.pow(1 + menesioGraza(12), 12), 1.12],
    ["investavimas: be grąžos vertė lygi įmokoms", investavimoPrognoze({ pradine: 0, imoka: 100, metai: 10, graza: 0 }).verte, 12000],
    ["investavimas: be grąžos įmokėta", investavimoPrognoze({ pradine: 0, imoka: 100, metai: 10, graza: 0 }).imoketa, 12000],
    ["investavimas: be grąžos prieaugis 0", investavimoPrognoze({ pradine: 0, imoka: 100, metai: 10, graza: 0 }).prieaugis, 0],
    ["investavimas: 1000 € po metų su 10 %", centais(investavimoPrognoze({ pradine: 1000, imoka: 0, metai: 1, graza: 10 }).verte), 110000],
    ["investavimas: 1000 € po 3 metų su 10 %", centais(investavimoPrognoze({ pradine: 1000, imoka: 0, metai: 3, graza: 10 }).verte), 133100],
    ["investavimas: neigiama grąža", centais(investavimoPrognoze({ pradine: 1000, imoka: 0, metai: 1, graza: -10 }).prieaugis), -10000],
    ["investavimas: pradinė suma įskaičiuota į įmokas", investavimoPrognoze({ pradine: 5000, imoka: 200, metai: 20, graza: 6 }).imoketa, 53000],
    ["investavimas: įmokos per metus – sutampa su formule", centais(investavimoPrognoze({ pradine: 0, imoka: 100, metai: 1, graza: 12 }).verte), centais(vertePagalFormule(0, 100, 1, 12))],
    ["investavimas: 20 metų – sutampa su formule", centais(investavimoPrognoze({ pradine: 5000, imoka: 200, metai: 20, graza: 6 }).verte), centais(vertePagalFormule(5000, 200, 20, 6))],
    ["investavimas: prieaugis = vertė − įmokėta", centais(inv.prieaugis), centais(inv.verte - inv.imoketa)],
    ["investavimas: eilutė kiekvieniems metams ir pradžiai", inv.metuEilutes.length, 21],
    ["investavimas: pradžioje vertė lygi pradinei sumai", inv.metuEilutes[0].verte, 5000],
    ["investavimas: po metų įmokėta", inv.metuEilutes[1].imoketa, 7400],
    ["investavimas: paskutinė eilutė – galutinė vertė", inv.metuEilutes[20].verte, inv.verte],

    // --- investavimas: įvesčių tikrinimas ---
    ["įvestis: metai 20", tikrintiInvestavimoLauka(INVESTAVIMO_LAUKAI[1], "20").reiksme, 20],
    ["įvestis: metai su kableliu netinka", tikrintiInvestavimoLauka(INVESTAVIMO_LAUKAI[1], "20,5").klaida, "Čia reikia sveikojo skaičiaus, be kablelio."],
    ["įvestis: 0 metų netinka", tikrintiInvestavimoLauka(INVESTAVIMO_LAUKAI[1], "0").klaida, "Reikšmė turi būti nuo 1 iki 60."],
    ["įvestis: raidės netinka", tikrintiInvestavimoLauka(INVESTAVIMO_LAUKAI[0], "abc").klaida, "Nesuprantu šio skaičiaus (pavyzdys: 1 200,50)."],
    ["įvestis: įmoka 1.200,50", tikrintiInvestavimoLauka(INVESTAVIMO_LAUKAI[0], "1.200,50").reiksme, 1200.5],
    ["įvestis: neigiama įmoka netinka", tikrintiInvestavimoLauka(INVESTAVIMO_LAUKAI[0], "-1").reiksme, undefined],
    ["įvestis: neigiama grąža tinka", tikrintiInvestavimoLauka(INVESTAVIMO_LAUKAI[3], "-5").reiksme, -5],
    ["įvestis: grąža 6,5", tikrintiInvestavimoLauka(INVESTAVIMO_LAUKAI[3], "6,5").reiksme, 6.5],
    ["įvestis: per didelė grąža netinka", tikrintiInvestavimoLauka(INVESTAVIMO_LAUKAI[3], "99").klaida, "Reikšmė turi būti nuo -20 iki 30."],
    ["nustatymai: numatytieji", JSON.stringify(numatytiejiInvestavimoNustatymai()), '{"imoka":100,"metai":20,"pradine":0,"graza1":4,"graza2":6,"graza3":8,"ter":0.2,"komisinis":0,"infliacija":2,"gpmTarifas":15,"gpmLengvata":500,"gpmTarifasIS":15,"zurnalas":[],"dabartineVerte":null}'],
    ["nustatymai: nieko neišsaugota – numatytieji", JSON.stringify(sutvarkytiInvestavimoNustatymus(null)), JSON.stringify(numatytiejiInvestavimoNustatymai())],
    ["nustatymai: tinkamos reikšmės paimamos, netinkamos pakeičiamos", JSON.stringify(sutvarkytiInvestavimoNustatymus({ imoka: 250, metai: "x", graza2: 99, ter: 0.5, kita: 1 })), '{"imoka":250,"metai":20,"pradine":0,"graza1":4,"graza2":6,"graza3":8,"ter":0.5,"komisinis":0,"infliacija":2,"gpmTarifas":15,"gpmLengvata":500,"gpmTarifasIS":15,"zurnalas":[],"dabartineVerte":null}'],

    // --- investavimas: įmokų žurnalas ---
    ["žurnalas: teisinga data", arTinkamaData("2026-03-15", "2026-11-11"), true],
    ["žurnalas: šiandienos data tinka", arTinkamaData("2026-11-11", "2026-11-11"), true],
    ["žurnalas: ateities data netinka", arTinkamaData("2026-11-12", "2026-11-11"), false],
    ["žurnalas: vasario 30 d. nėra", arTinkamaData("2026-02-30", "2026-11-11"), false],
    ["žurnalas: keliamųjų metų vasario 29 d. yra", arTinkamaData("2024-02-29", "2026-11-11"), true],
    ["žurnalas: 13 mėnesio nėra", arTinkamaData("2026-13-01", "2026-11-11"), false],
    ["žurnalas: kitoks datos formatas netinka", arTinkamaData("15.03.2026", "2026-11-11"), false],
    ["žurnalas: tuščia data netinka", arTinkamaData("", "2026-11-11"), false],
    ["žurnalas: suma", zurnaloSuma(zurn.zurnalas), 450.5],
    ["žurnalas: tuščio žurnalo suma", zurnaloSuma([]), 0],
    ["žurnalas: suma suapvalinama iki centų", zurn.apvalinta, 100.13],
    ["žurnalas: naujausios viršuje", rikiuotiZurnala(zurn.zurnalas).map(function (i) { return i.data; }).join(), "2026-05-01,2026-03-15,2026-01-10"],
    ["žurnalas: rikiavimas nekeičia originalo", zurn.zurnalas[0].data, "2026-03-15"],
    ["žurnalas: id nesikartoja", zurn.zurnalas[0].id !== zurn.zurnalas[1].id, true],
    ["žurnalas: iš išsaugotų paliekami tik tinkami įrašai", sutvarkytiZurnala([
      { id: "a", data: "2026-01-10", suma: 100 },
      { id: "b", data: "2026-02-30", suma: 100 },
      { id: "c", data: "2026-01-11", suma: -5 },
      { id: "d", data: "2026-01-12", suma: "50" },
      null,
      { data: "2026-01-13", suma: 10 },
    ]).map(function (i) { return i.id; }).join(), "a"],
    ["žurnalas: ne sąrašas – tuščias žurnalas", sutvarkytiZurnala("x").length, 0],
    ["žurnalas: išsaugoti duomenys su žurnalu", JSON.stringify(sutvarkytiInvestavimoNustatymus({ zurnalas: [{ id: "a", data: "2026-01-10", suma: 100 }], dabartineVerte: 120 }).zurnalas) + "/" + sutvarkytiInvestavimoNustatymus({ dabartineVerte: 120 }).dabartineVerte, '[{"id":"a","data":"2026-01-10","suma":100}]/120'],
    ["žurnalas: neigiama dabartinė vertė atmetama", sutvarkytiInvestavimoNustatymus({ dabartineVerte: -1 }).dabartineVerte, null],

    // --- investavimas: prognozė nuo žurnalo ---
    ["pradžia: be žurnalo – nuo pradinės sumos", JSON.stringify(prognozesPradzia({ pradine: 700, zurnalas: [], dabartineVerte: 999 })), '{"isZurnalo":false,"imoketa":700,"verte":700}'],
    ["pradžia: su žurnalu ir verte", JSON.stringify(prognozesPradzia({ pradine: 700, zurnalas: zurn.zurnalas, dabartineVerte: 500 })), '{"isZurnalo":true,"imoketa":450.5,"verte":500}'],
    ["pradžia: su žurnalu be vertės – vertė lygi įmokoms", JSON.stringify(prognozesPradzia({ pradine: 700, zurnalas: zurn.zurnalas, dabartineVerte: null })), '{"isZurnalo":true,"imoketa":450.5,"verte":450.5}'],
    ["prognozė nuo žurnalo: įmokėta = žurnalas + būsimos įmokos", zurn.prognoze.imoketa, 450.5 + 1200],
    ["prognozė nuo žurnalo: vertė auga nuo dabartinės vertės", centais(zurn.prognoze.verte), centais(vertePagalFormule(500, 100, 1, 6))],
    ["prognozė nuo žurnalo: prieaugis įskaito jau turimą prieaugį", centais(zurn.prognoze.prieaugis), centais(vertePagalFormule(500, 100, 1, 6) - 1650.5)],
    ["prognozė nuo žurnalo: pradžios eilutė", zurn.prognoze.metuEilutes[0].imoketa + "/" + zurn.prognoze.metuEilutes[0].verte, "450.5/500"],
    ["prognozė nuo žurnalo: pradinė suma ignoruojama", centais(zurn.scenarijai[1].verteBeKastu), centais(vertePagalFormule(500, 100, 20, 6))],
    ["prognozė nuo žurnalo: įmokėta scenarijuose", zurn.scenarijai[1].imoketa, 450.5 + 24000],

    // --- investavimas: atsarginė kopija ir CSV ---
    ["inv. kopija: atpažinimo žymos", invKop.kopija.programa + "/" + invKop.kopija.tipas + "/" + invKop.kopija.versija + "/" + invKop.kopija.sukurta, "finansu-skaiciuokles/investavimas/1/2026-11-11"],
    ["inv. kopija: išsaugota ir perskaityta – tie patys duomenys", invKop.perskaityta, invKop.originalas],
    ["inv. kopija: numatytieji nustatymai tinkami", arTinkamiInvestavimoDuomenys(numatytiejiInvestavimoNustatymai()), true],
    ["inv. kopija: biudžeto kopija netinka", skaitytiInvestavimoKopija(JSON.stringify(sudarytiBiudzetoKopija(pavyzdinisBiudzetas(), new Date(2026, 10, 11)))).klaida, "Tai ne šios skaičiuoklės investavimo kopija."],
    ["inv. kopija: investavimo kopija netinka biudžetui", skaitytiBiudzetoKopija(JSON.stringify(invKop.kopija)).klaida, "Tai ne šios skaičiuoklės biudžeto kopija."],
    ["inv. kopija: ne JSON", skaitytiInvestavimoKopija("labas").klaida, "Failo nepavyko perskaityti: tai ne JSON failas."],
    ["inv. kopija: trūksta lauko", invKop.beLauko, "Kopijos duomenys sugadinti arba nepilni."],
    ["inv. kopija: reikšmė už ribų", invKop.uzRibu, "Kopijos duomenys sugadinti arba nepilni."],
    ["inv. kopija: blogas žurnalo įrašas", invKop.blogasZurnalas, "Kopijos duomenys sugadinti arba nepilni."],
    ["inv. kopija: bloga dabartinė vertė", invKop.blogaVerte, "Kopijos duomenys sugadinti arba nepilni."],
    ["inv. csv: žurnalas nuo seniausios su sukaupta suma", sudarytiCsv(zurnaloCsvEilutes(zurn.zurnalas)), "Data;Įmoka;Iš viso įmokėta" + CRLF + "2026-01-10;100,00;100,00" + CRLF + "2026-03-15;150,00;250,00" + CRLF + "2026-05-01;200,50;450,50"],
    ["inv. csv: tuščias žurnalas – tik antraštė", zurnaloCsvEilutes([]).length, 1],
    ["inv. csv: prognozės antraštė", prognozesCsvEilutes(scen)[0].join("|"), "Metai|Įmokėta|Atsargus 4 %|Vidutinis 6 %|Optimistinis 8 %"],
    ["inv. csv: prognozės eilučių skaičius (antraštė + 21)", prognozesCsvEilutes(scen).length, 22],
    ["inv. csv: prognozės paskutinė eilutė", sudarytiCsv([prognozesCsvEilutes(scen)[21]]), "20;24000,00;35686,51;44490,98;55852,80"],

    // --- investavimas: GPM ---
    ["GPM: pelnas", gpm1.pelnas, 10000],
    ["GPM paprasta: apmokestinama pelnas be lengvatos", gpm1.paprasta.apmokestinama, 9500],
    ["GPM paprasta: 15 % nuo 9 500", gpm1.paprasta.gpm, 1425],
    ["GPM paprasta: lieka", gpm1.paprasta.lieka, 28575],
    ["GPM investicinė: apmokestinamas visas pelnas", gpm1.investicine.apmokestinama, 10000],
    ["GPM investicinė: 15 % nuo 10 000", gpm1.investicine.gpm, 1500],
    ["GPM investicinė: lieka", gpm1.investicine.lieka, 28500],
    ["GPM: skirtumas tarp režimų – lengvatos mokestis", gpm1.paprasta.lieka - gpm1.investicine.lieka, 75],
    ["GPM paprasta: pelnas mažesnis už lengvatą – mokesčio nėra", gpmSkaiciavimas(1300, 1000, gpmNust).paprasta.gpm, 0],
    ["GPM investicinė: mažas pelnas vis tiek apmokestinamas", gpmSkaiciavimas(1300, 1000, gpmNust).investicine.gpm, 45],
    ["GPM: nuostolis – mokesčio nėra (paprasta)", gpmSkaiciavimas(800, 1000, gpmNust).paprasta.gpm, 0],
    ["GPM: nuostolis – mokesčio nėra (investicinė)", gpmSkaiciavimas(800, 1000, gpmNust).investicine.gpm, 0],
    ["GPM: nuostolis – lieka visa vertė", gpmSkaiciavimas(800, 1000, gpmNust).paprasta.lieka, 800],
    ["GPM: tarifai keičiami nustatymuose", gpmSkaiciavimas(30000, 20000, { gpmTarifas: 20, gpmLengvata: 0, gpmTarifasIS: 10 }).paprasta.gpm + "/" + gpmSkaiciavimas(30000, 20000, { gpmTarifas: 20, gpmLengvata: 0, gpmTarifasIS: 10 }).investicine.gpm, "2000/1000"],
    ["GPM: tarifų laukai nustatymuose", INVESTAVIMO_LAUKAI.filter(function (l) { return l.grupe === "gpm"; }).map(function (l) { return l.raktas; }).join(), "gpmTarifas,gpmLengvata,gpmTarifasIS"],
    ["GPM: grupė turi pastabą apie VMI", INVESTAVIMO_GRUPES[3].pastaba.includes("pasitikrinkite VMI"), true],
    ["GPM: nuorodos veda į vmi.lt", INVESTAVIMO_GRUPES[3].nuorodos.every(function (n) { return n.adresas.startsWith("https://www.vmi.lt/"); }), true],

    // --- investavimas: mokesčiai ir infliacija ---
    ["mokesčiai: 12 mėnesio mokesčių sudaro metinį", Math.pow(1 - menesioMokestis(1), 12), 0.99],
    ["mokesčiai: TER 1 % – 1000 € po metų su 10 % grąža", centais(investavimoPrognoze({ pradine: 1000, imoka: 0, metai: 1, graza: 10, ter: 1 }).verte), 108900],
    ["mokesčiai: TER be grąžos – vertė sumažėja lygiai mokesčiu", centais(investavimoPrognoze({ pradine: 1000, imoka: 0, metai: 1, graza: 0, ter: 1 }).terSuma), 1000],
    ["mokesčiai: be TER fondo mokesčio nėra", investavimoPrognoze({ pradine: 1000, imoka: 100, metai: 5, graza: 6 }).terSuma, 0],
    ["mokesčiai: komisinis 2 € – investuojama po 98 €", centais(investavimoPrognoze({ pradine: 0, imoka: 100, metai: 1, graza: 0, komisinis: 2 }).verte), 117600],
    ["mokesčiai: komisinių suma per metus", investavimoPrognoze({ pradine: 0, imoka: 100, metai: 1, graza: 0, komisinis: 2 }).komisiniai, 24],
    ["mokesčiai: įmokėta skaičiuojama su komisiniais", investavimoPrognoze({ pradine: 0, imoka: 100, metai: 1, graza: 0, komisinis: 2 }).imoketa, 1200],
    ["mokesčiai: kaštai = TER + komisiniai", centais(kast.kastai), centais(kast.terSuma + kast.komisiniai)],
    ["mokesčiai: pradinei sumai komisinis netaikomas", investavimoPrognoze({ pradine: 1000, imoka: 0, metai: 3, graza: 0, komisinis: 5 }).komisiniai, 0],
    ["mokesčiai: komisinis didesnis už įmoką – neinvestuojama nieko", investavimoPrognoze({ pradine: 0, imoka: 1, metai: 1, graza: 5, komisinis: 5 }).verte, 0],
    ["mokesčiai: komisinis ne didesnis už įmoką", investavimoPrognoze({ pradine: 0, imoka: 1, metai: 1, graza: 5, komisinis: 5 }).komisiniai, 12],
    ["infliacija: 1000 € po 10 metų su 2 % infliacija", centais(investavimoPrognoze({ pradine: 1000, imoka: 0, metai: 10, graza: 0, infliacija: 2 }).realiVerte), 82035],
    ["infliacija: be infliacijos reali vertė lygi vertei", kast.realiVerte, kast.verte],
    ["infliacija: grąža lygi infliacijai – perkamoji galia nesikeičia", centais(investavimoPrognoze({ pradine: 1000, imoka: 0, metai: 15, graza: 3, infliacija: 3 }).realiVerte), 100000],
    ["infliacija: metų eilutėse reali vertė", centais(investavimoPrognoze({ pradine: 1000, imoka: 0, metai: 2, graza: 0, infliacija: 2 }).metuEilutes[1].realiVerte), 98039],

    // --- investavimas: trys scenarijai ---
    ["scenarijai: trys", scen.length, 3],
    ["scenarijai: pavadinimai", scen.map(function (s) { return s.pavadinimas; }).join(), "Atsargus,Vidutinis,Optimistinis"],
    ["scenarijai: grąžos", scen.map(function (s) { return s.graza; }).join(), "4,6,8"],
    ["scenarijai: įmokėta visur vienoda", scen[0].imoketa === scen[2].imoketa && scen[0].imoketa === 24000, true],
    ["scenarijai: didesnė grąža – didesnė vertė", scen[0].verte < scen[1].verte && scen[1].verte < scen[2].verte, true],
    ["scenarijai: vidutinis be mokesčių – kaip 12 žingsnyje", centais(scen[1].verteBeKastu), centais(vertePagalFormule(0, 100, 20, 6))],
    ["scenarijai: su TER vertė mažesnė", scen[1].verte < scen[1].verteBeKastu, true],
    ["scenarijai: mokesčių poveikis didesnis už sumokėtus mokesčius", scen[1].verteBeKastu - scen[1].verte > scen[1].kastai, true],
    ["scenarijai: reali vertė mažesnė už vertę", scen[1].realiVerte < scen[1].verte, true],
    ["skaiciusTekstu: 12.5", skaiciusTekstu(12.5), "12,5"],
    ["skaiciusTekstu: 100", skaiciusTekstu(100), "100"],

    // --- grafikas: ašys ir koordinatės ---
    ["grafikas: žingsnis 55 853 -> 20 000", grazusZingsnis(55853, 4), 20000],
    ["grafikas: žingsnis 100 -> 50", grazusZingsnis(100, 4), 50],
    ["grafikas: žingsnis 9 -> 5", grazusZingsnis(9, 4), 5],
    ["grafikas: žingsnis, kai nėra duomenų", grazusZingsnis(0, 4), 1],
    ["grafikas: ašies žymės", asiesZymes(55853, 4).join(), "0,20000,40000,60000"],
    ["grafikas: ašies žymės, kai reikšmė lygi žymei", asiesZymes(40000, 4).join(), "0,10000,20000,30000,40000"],
    ["grafikas: ašies žymės, kai nėra duomenų", asiesZymes(0, 4).join(), "0,1"],
    ["grafikas: ašies užrašas", asiesSuma(20000), "20" + NT + "000" + NT + "€"],
    ["grafikas: metų žymės 20 metų", metuZymes(20).join(), "0,5,10,15,20"],
    ["grafikas: metų žymės 1 metams", metuZymes(1).join(), "0,1"],
    ["grafikas: metų žymės 7 metams", metuZymes(7).join(), "0,2,4,6"],
    ["grafikas: metų žymės 60 metų", metuZymes(60).join(), "0,10,20,30,40,50,60"],
    ["grafikas: x pradžioje", mast.x(0), 10],
    ["grafikas: x pabaigoje", mast.x(10), 370],
    ["grafikas: y nuliui – apačioje", mast.y(0), 180],
    ["grafikas: y didžiausiai reikšmei – viršuje", mast.y(100), 20],
    ["grafikas: y pusei", mast.y(50), 100],
    ["grafikas: metai pagal x", mast.metaiPagalX(190), 5],
    ["grafikas: metai pagal x – apvalinama iki artimiausių", mast.metaiPagalX(215), 6],
    ["grafikas: metai pagal x už kairio krašto", mast.metaiPagalX(-50), 0],
    ["grafikas: metai pagal x už dešinio krašto", mast.metaiPagalX(999), 10],
    ["grafikas: linijos aprašas", linijosKelias([{ x: 1, y: 2 }, { x: 3.456, y: 4 }]), "M1.0 2.0L3.5 4.0"],
    ["grafikas: susiliejantys užrašai išskiriami", isdestytiZymes([100, 102, 104], 14, 0, 300).join(), "100,114,128"],
    ["grafikas: užrašai neišlenda apačioje", isdestytiZymes([290, 295], 14, 0, 300).join(), "286,300"],
    ["grafikas: užrašų tvarka išlieka", isdestytiZymes([50, 10], 14, 0, 300).join(), "50,10"],
    ["grafikas: trys linijos", graf.serijos.length, 3],
    ["grafikas: linijų spalvų klasės", graf.serijos.map(function (s) { return s.klase; }).join(), "serija-1,serija-2,serija-3"],
    ["grafikas: trumpi užrašai", graf.serijos.map(function (s) { return s.trumpas; }).join("|"), "4 %|6 %|8 %"],
    ["grafikas: taškas kiekvieniems metams ir pradžiai", graf.serijos[1].reiksmes.length, 21],
    ["grafikas: linijos pabaiga – scenarijaus vertė", graf.serijos[1].reiksmes[20], scen[1].verte],
    ["grafikas: įmokėta pabaigoje", graf.atrama.reiksmes[20], 24000],
    ["grafikas: įmokėta po 5 metų", graf.atrama.reiksmes[5], 6000],

    // --- failai: CSV ---
    ["failai: datos žyma", datosZyma(new Date(2026, 0, 5)), "2026-01-05"],
    ["csv: skaičius su kableliu, be tarpų", csvLangelis(1200.5), "1200,50"],
    ["csv: neigiamas skaičius", csvLangelis(-25.2), "-25,20"],
    ["csv: tuščia reikšmė", csvLangelis(null), ""],
    ["csv: paprastas tekstas", csvLangelis("Būstas"), "Būstas"],
    ["csv: kabliataškis – kabutėse", csvLangelis("x;y"), '"x;y"'],
    ["csv: kabutės padvigubinamos", csvLangelis('sako "labas"'), '"sako ""labas"""'],
    ["csv: formulė nukenksminama", csvLangelis("=1+1"), "'=1+1"],
    ["csv: tekstas su minusu priekyje", csvLangelis("-nuolaida"), "'-nuolaida"],
    ["csv: visa lentelė", sudarytiCsv([["A", "B"], [1, "x;y"], [null, "ž"]]), "A;B" + CRLF + '1,00;"x;y"' + CRLF + ";ž"],
    ["csv: biudžeto eilučių skaičius (antraštė + 11)", kop.biudzetoCsv.length, 12],
    ["csv: biudžeto antraštė", kop.biudzetoCsv[0].join("|"), "Tipas|Kategorija|Eilutė|Suma|Periodiškumas|Rūšis|Suma per mėnesį"],
    ["csv: pajamų eilutė", kop.biudzetoCsv[1].join("|"), "Pajamos|Pajamos|Atlyginimas|1600|Mėnesinė||1600"],
    ["csv: metinė išlaida", kop.biudzetoCsv[8].join("|"), "Išlaidos|Transportas|Automobilio draudimas|240|Metinė|Būtina|20"],
    ["csv: mėnesių eilučių skaičius (antraštė + 2 × 6)", kop.menesiuCsv.length, 13],
    ["csv: mėnesiai chronologiškai", kop.menesiuCsv[1][0] + " " + kop.menesiuCsv[7][0], "2026-01 2026-03"],
    ["csv: mėnesio eilutė su faktu", kop.menesiuCsv[8].join("|"), "2026-03|Išlaidos|Būstas|630|655.2|" + (655.2 - 630)],
    ["csv: neįvestas faktas lieka tuščias", sudarytiCsv([kop.menesiuCsv[9]]), "2026-03;Išlaidos;Maistas;380,00;;"],

    // --- failai: atsarginė kopija ---
    ["kopija: turi atpažinimo žymas", kop.kopija.programa + "/" + kop.kopija.tipas + "/" + kop.kopija.versija + "/" + kop.kopija.sukurta, "finansu-skaiciuokles/biudzetas/1/2026-11-11"],
    ["kopija: išsaugota ir perskaityta – tie patys duomenys", kop.perskaityta, kop.originalas],
    ["kopija: perskaičius klaidos nėra", kop.perskaitytaKlaida, undefined],
    ["kopija: ne JSON", skaitytiBiudzetoKopija("labas").klaida, "Failo nepavyko perskaityti: tai ne JSON failas."],
    ["kopija: tuščias failas", skaitytiBiudzetoKopija("").klaida, "Failo nepavyko perskaityti: tai ne JSON failas."],
    ["kopija: svetimas JSON", skaitytiBiudzetoKopija('{"a":1}').klaida, "Tai ne šios skaičiuoklės biudžeto kopija."],
    ["kopija: JSON, bet ne objektas", skaitytiBiudzetoKopija("null").klaida, "Tai ne šios skaičiuoklės biudžeto kopija."],
    ["kopija: kito tipo kopija", skaitytiBiudzetoKopija('{"programa":"finansu-skaiciuokles","tipas":"investavimas","versija":1,"duomenys":{}}').klaida, "Tai ne šios skaičiuoklės biudžeto kopija."],
    ["kopija: kita versija", skaitytiBiudzetoKopija('{"programa":"finansu-skaiciuokles","tipas":"biudzetas","versija":99,"duomenys":{"kategorijos":[]}}').klaida, "Kopija sukurta kitos versijos skaičiuokle (versija 99), jos atkurti negalima."],
    ["kopija: sugadinti duomenys", skaitytiBiudzetoKopija('{"programa":"finansu-skaiciuokles","tipas":"biudzetas","versija":1,"duomenys":{"kategorijos":"x"}}').klaida, "Kopijos duomenys sugadinti arba nepilni."],
    ["kopija: neigiama suma faile atmetama", skaitytiBiudzetoKopija('{"programa":"finansu-skaiciuokles","tipas":"biudzetas","versija":1,"duomenys":{"kategorijos":[{"id":"a","pavadinimas":"A","tipas":"pajamos","eilutes":[{"id":"b","pavadinimas":"B","suma":-5}]}]}}').klaida, "Kopijos duomenys sugadinti arba nepilni."],

    // --- biudžetas: sumų išvalymas ---
    ["išvalymas: pajamos 0", tipoSuma(isvalytas, "pajamos"), 0],
    ["išvalymas: išlaidos 0", tipoSuma(isvalytas, "islaidos"), 0],
    ["išvalymas: kategorijos išlieka", isvalytas.kategorijos.length, 6],
    ["išvalymas: eilutės išlieka", tipoEiluciuSkaicius(isvalytas, "islaidos"), 10],
    ["išvalymas: pavadinimas išlieka", isvalytas.kategorijos[1].eilutes[0].pavadinimas, "Nuoma arba paskola"],
    ["išvalymas: periodiškumas išlieka", isvalytas.kategorijos[3].eilutes[1].periodiskumas, "metine"],
    ["išvalymas: žyma išlieka", isvalytas.kategorijos[5].eilutes[0].zyma, "taupymas"],
    ["išvalymas: rezultatas tinkamas biudžetas", arTinkamasBiudzetas(isvalytas), true],

    // --- biudžetas: išlaidos viena suma ---
    ["išlaidos: pavyzdyje 10 eilučių", tipoEiluciuSkaicius(pavyzdinisBiudzetas(), "islaidos"), 10],
    ["išlaidos: kelios eilutės – lieka viena", isl.eiluciu, 1],
    ["išlaidos: kelios eilutės – suma", isl.suma, 1250.75],
    ["išlaidos: nauja eilutė – būtina", isl.zyma, "butina"],
    ["išlaidos: pajamos neliečiamos", isl.pajamos, 1600],
    ["išlaidos: pajamų kategorija lieka pirma", isl.pirmaTipas, "pajamos"],
    ["išlaidos: viena eilutė – pakeičiama jos suma ir vardas lieka", isl.antraKarta, "Išlaidos/800"],
    ["išlaidos: rezultatas tinkamas biudžetas", isl.arTinkamas, true],

    // --- biudžetas: keitimai ---
    ["keitimai: pridėta kategorija", keitimai.kategorijuPoPridejimo, 1],
    ["keitimai: naujos kategorijos tipas", keitimai.naujosTipas, "islaidos"],
    ["keitimai: pridėtos dvi eilutės", keitimai.eiluciuPoPridejimo, 2],
    ["keitimai: nauja išlaidų eilutė – būtina", keitimai.naujosZyma, "butina"],
    ["keitimai: nauja eilutė – 0 €", keitimai.naujosSuma, 0],
    ["keitimai: id nesikartoja", keitimai.idSkirtingi, true],
    ["keitimai: ištrinta viena eilutė", keitimai.eiluciuPoTrynimo, 1],
    ["keitimai: liko ta, kurios netrynėme", keitimai.likoAntra, true],
    ["keitimai: ištrinta kategorija", keitimai.kategorijuPoTrynimo, 0],
    ["keitimai: pajamų eilutė be žymos", keitimai.pajamuZyma, null],

    // --- biudžetas: duomenų tikrinimas ---
    ["tikrinimas: pavyzdinis biudžetas tinkamas", arTinkamasBiudzetas(pavyzdinisBiudzetas()), true],
    ["tikrinimas: tuščias biudžetas tinkamas", arTinkamasBiudzetas({ kategorijos: [] }), true],
    ["tikrinimas: null netinka", arTinkamasBiudzetas(null), false],
    ["tikrinimas: be kategorijų netinka", arTinkamasBiudzetas({}), false],
    ["tikrinimas: nežinomas tipas netinka", arTinkamasBiudzetas({ kategorijos: [{ id: "a", pavadinimas: "A", tipas: "kita", eilutes: [] }] }), false],
    ["tikrinimas: suma tekstu netinka", arTinkamasBiudzetas({ kategorijos: [{ id: "a", pavadinimas: "A", tipas: "pajamos", eilutes: [{ id: "b", pavadinimas: "B", suma: "100" }] }] }), false],
    ["tikrinimas: neigiama suma netinka", arTinkamaSuma(-5), false],
    ["tikrinimas: NaN suma netinka", arTinkamaSuma(NaN), false],
    ["tikrinimas: 0 suma tinka", arTinkamaSuma(0), true],
  ];
}

// Išbando mėnesių funkcijas su pavyzdiniu biudžetu: pradeda mėnesį, įveda faktus,
// keičia biudžetą ir žiūri, kas nutinka užfiksuotam planui.
function bandytiMenesius() {
  const r = {};
  const b = pavyzdinisBiudzetas();
  uztikrintiMenesius(b);

  const menuo = pradetiMenesi(b, "2026-11");
  r.eiluciu = menuo.eilutes.length;
  r.bustoPlanas = menuo.eilutes[1].planas;
  r.transportoPlanas = menuo.eilutes[3].planas;
  r.pradinisFaktas = menuo.eilutes[1].faktas;
  r.pradinisPajamuFaktas = menuo.eilutes[0].faktas;
  r.pradziojeUzpildyta = menesioSuvestine(menuo).uzpildyta;
  r.planasIslaidos = menesioSuvestine(menuo).islaidos.planas;
  r.planasLikutis = menesioSuvestine(menuo).likutis.planas;

  // Įvedame faktą pajamoms ir Būstui.
  menuo.eilutes[0].faktas = 1650;
  menuo.eilutes[1].faktas = 655.2;
  const suvestine = menesioSuvestine(menuo);
  r.faktasPajamos = suvestine.pajamos.faktas;
  r.faktasIslaidos = suvestine.islaidos.faktas;
  r.faktasLikutis = suvestine.likutis.faktas;
  r.uzpildyta = suvestine.uzpildyta;
  r.arTinkami = arTinkamiMenesiai(b.menesiai);
  r.arTinkamasVisas = arTinkamasBiudzetas(b);

  // Biudžete padidiname nuomą 100 €: užfiksuotas planas neturi pasikeisti.
  b.kategorijos[1].eilutes[0].suma = 600;
  r.planasPoBiudzetoKeitimo = b.menesiai["2026-11"].eilutes[1].planas;

  // Ištriname dvi kategorijas: pajamas (faktas įvestas) ir maistą (faktas neįvestas), tada atnaujiname planą.
  istrintiKategorija(b, "k1");
  istrintiKategorija(b, "k3");
  atnaujintiMenesioPlana(b, "2026-11");
  const eilutes = b.menesiai["2026-11"].eilutes;
  const bustas = eilutes.find(function (e) { return e.kategorijosId === "k2"; });
  const pajamos = eilutes.find(function (e) { return e.kategorijosId === "k1"; });
  r.planasPoAtnaujinimo = bustas.planas;
  r.faktasPoAtnaujinimo = bustas.faktas;
  r.istrintaSuFaktu = pajamos ? pajamos.pavadinimas + "/" + pajamos.planas + "/" + pajamos.faktas : "nėra";
  r.istrintaBeFakto = eilutes.some(function (e) { return e.kategorijosId === "k3"; });

  istrintiMenesi(b, "2026-11");
  r.poIstrynimo = b.menesiai["2026-11"] === undefined;
  return r;
}

// Paruošia biudžetą su trimis mėnesiais (du 2026 m., vienas 2025 m.) ir suskaičiuoja 2026 m. apžvalgą.
function bandytiMetus() {
  const b = pavyzdinisBiudzetas();
  uztikrintiMenesius(b);

  // Sausis: įvestos visos kategorijos, kiekviena išlaida 10 € didesnė už planą.
  const sausis = pradetiMenesi(b, "2026-01");
  for (const eilute of sausis.eilutes) {
    if (eilute.tipas === "islaidos") {
      eilute.faktas = eilute.planas + 10;
    }
  }

  // Kovas: kategorija pervadinta, įvestas tik Būsto faktas.
  b.kategorijos[1].pavadinimas = "Namai";
  const kovas = pradetiMenesi(b, "2026-03");
  kovas.eilutes[1].faktas = 600;

  // Kitų metų mėnuo – į 2026 m. apžvalgą patekti neturi.
  pradetiMenesi(b, "2025-12");

  return { apzvalga: metuApzvalga(b, 2026), kategorijos: metuKategorijos(b, 2026) };
}

// Išbando pajamų nustatymą viena suma trimis atvejais: viena eilutė, kelios eilutės, nė vienos.
function bandytiPajamas() {
  const r = {};

  const viena = pavyzdinisBiudzetas();
  viena.kategorijos[0].eilutes[0].periodiskumas = "metine";
  nustatytiPajamas(viena, 2100.5);
  r.vienaSuma = tipoSuma(viena, "pajamos");
  r.vienaPavadinimas = viena.kategorijos[0].eilutes[0].pavadinimas;
  r.vienaPeriodiskumas = viena.kategorijos[0].eilutes[0].periodiskumas;
  r.vienaIslaidos = tipoSuma(viena, "islaidos");

  const kelios = pavyzdinisBiudzetas();
  pridetiEilute(kelios.kategorijos[0]).suma = 300;
  pridetiEilute(pridetiKategorija(kelios, "pajamos")).suma = 50;
  nustatytiPajamas(kelios, 900);
  r.keliosEiluciu = pajamuEiluciuSkaicius(kelios);
  r.keliosSuma = tipoSuma(kelios, "pajamos");
  r.keliosIslaiduKategoriju = kategorijosPagalTipa(kelios, "islaidos").length;
  r.keliosPirmaTipas = kelios.kategorijos[0].tipas;
  r.arTinkamas = arTinkamasBiudzetas(kelios);

  const tuscias = { kategorijos: [] };
  nustatytiPajamas(tuscias, 500);
  r.tusciasSuma = tipoSuma(tuscias, "pajamos");
  return r;
}

// Išbando išlaidų nustatymą viena suma: iš pradžių kelios eilutės, paskui jau viena.
function bandytiIslaidas() {
  const r = {};
  const b = pavyzdinisBiudzetas();

  nustatytiIslaidas(b, 1250.75);
  r.eiluciu = tipoEiluciuSkaicius(b, "islaidos");
  r.suma = tipoSuma(b, "islaidos");
  r.zyma = kategorijosPagalTipa(b, "islaidos")[0].eilutes[0].zyma;
  r.pajamos = tipoSuma(b, "pajamos");
  r.pirmaTipas = b.kategorijos[0].tipas;
  r.arTinkamas = arTinkamasBiudzetas(b);

  nustatytiIslaidas(b, 800);
  const eilute = kategorijosPagalTipa(b, "islaidos")[0].eilutes[0];
  r.antraKarta = eilute.pavadinimas + "/" + eilute.suma;
  return r;
}

// Sudaro žurnalą iš trijų įmokų (ne iš eilės) ir suskaičiuoja prognozę, tęsiamą nuo jo.
function bandytiZurnala() {
  const r = {};
  r.zurnalas = [];
  pridetiImoka(r.zurnalas, "2026-03-15", 150);
  pridetiImoka(r.zurnalas, "2026-05-01", 200.5);
  pridetiImoka(r.zurnalas, "2026-01-10", 100);
  r.apvalinta = pridetiImoka([], "2026-01-10", 100.129).suma;

  // Vieni metai, 6 % grąža, be mokesčių: įmokėta 450,50 €, portfelis vertas 500 €.
  r.prognoze = investavimoPrognoze({ pradine: 500, jauImoketa: 450.5, imoka: 100, metai: 1, graza: 6 });

  // Visi scenarijai su numatytaisiais nustatymais, bet su žurnalu – pradinė suma turi būti ignoruojama.
  const nustatymai = numatytiejiInvestavimoNustatymai();
  nustatymai.pradine = 9999;
  nustatymai.zurnalas = r.zurnalas;
  nustatymai.dabartineVerte = 500;
  r.scenarijai = visuScenarijuPrognoze(nustatymai);
  return r;
}

// Išbando investavimo kopiją: kelią pirmyn ir atgal bei keturis sugadintus failus.
function bandytiInvestavimoKopijas(zurnalas) {
  const r = {};
  const nustatymai = numatytiejiInvestavimoNustatymai();
  nustatymai.imoka = 250.5;
  nustatymai.zurnalas = zurnalas;
  nustatymai.dabartineVerte = 500;

  r.kopija = sudarytiInvestavimoKopija(nustatymai, new Date(2026, 10, 11));
  r.originalas = JSON.stringify(nustatymai);
  r.perskaityta = JSON.stringify(skaitytiInvestavimoKopija(JSON.stringify(r.kopija)).duomenys);

  // Sugadina kopiją nurodytu būdu ir grąžina klaidos tekstą.
  function sugadinta(keisti) {
    const kopija = JSON.parse(JSON.stringify(r.kopija));
    keisti(kopija.duomenys);
    return skaitytiInvestavimoKopija(JSON.stringify(kopija)).klaida;
  }
  r.beLauko = sugadinta(function (d) { delete d.metai; });
  r.uzRibu = sugadinta(function (d) { d.ter = 99; });
  r.blogasZurnalas = sugadinta(function (d) { d.zurnalas.push({ id: "x", data: "2026-02-30", suma: 10 }); });
  r.blogaVerte = sugadinta(function (d) { d.dabartineVerte = "daug"; });
  return r;
}

// Suapvalina iki centų – taip lyginame dideles sumas, kuriose kompiuterio trupmenų
// skaičiavimas palieka mažytes paklaidas.
function centais(suma) {
  return Math.round(suma * 100);
}

// Ta pati investavimo prognozė, suskaičiuota kitu būdu – viena matematine formule vietoj ciklo.
// Jei abu būdai duoda tą patį atsakymą, galime pasitikėti abiem.
function vertePagalFormule(pradine, imoka, metai, grazaProc) {
  const m = Math.pow(1 + grazaProc / 100, 1 / 12) - 1;
  const augimas = Math.pow(1 + m, metai * 12);
  return pradine * augimas + (imoka * (1 + m) * (augimas - 1)) / m;
}

// Paruošia biudžetą su dviem mėnesiais ir išbando kopijos bei CSV sudarymą.
function bandytiKopijas() {
  const r = {};
  const b = pavyzdinisBiudzetas();
  uztikrintiMenesius(b);
  // Mėnesius pradedame ne iš eilės – CSV faile jie vis tiek turi būti chronologiškai.
  pradetiMenesi(b, "2026-03").eilutes[1].faktas = 655.2;
  pradetiMenesi(b, "2026-01");

  r.biudzetoCsv = biudzetoCsvEilutes(b);
  r.menesiuCsv = menesiuCsvEilutes(b);

  // Kelias pirmyn ir atgal: objektas -> tekstas (kaip faile) -> objektas.
  r.kopija = sudarytiBiudzetoKopija(b, new Date(2026, 10, 11));
  const perskaityta = skaitytiBiudzetoKopija(JSON.stringify(r.kopija));
  r.originalas = JSON.stringify(b);
  r.perskaityta = JSON.stringify(perskaityta.duomenys);
  r.perskaitytaKlaida = perskaityta.klaida;
  return r;
}

// Išbando biudžeto keitimo funkcijas su tuščiu biudžetu ir užrašo, kas gavosi po kiekvieno veiksmo.
function bandytiKeitimus() {
  const r = {};
  const b = { kategorijos: [] };

  const kategorija = pridetiKategorija(b, "islaidos");
  r.kategorijuPoPridejimo = b.kategorijos.length;
  r.naujosTipas = kategorija.tipas;

  const pirma = pridetiEilute(kategorija);
  const antra = pridetiEilute(kategorija);
  r.eiluciuPoPridejimo = kategorija.eilutes.length;
  r.naujosZyma = pirma.zyma;
  r.naujosSuma = pirma.suma;
  r.idSkirtingi = pirma.id !== antra.id && pirma.id !== kategorija.id;

  istrintiEilute(kategorija, pirma.id);
  r.eiluciuPoTrynimo = kategorija.eilutes.length;
  r.likoAntra = kategorija.eilutes[0].id === antra.id;

  istrintiKategorija(b, kategorija.id);
  r.kategorijuPoTrynimo = b.kategorijos.length;

  r.pajamuZyma = pridetiEilute(pridetiKategorija(b, "pajamos")).zyma;
  return r;
}

// Išbando saugyklos funkcijas su atskiru bandomuoju raktu ir po savęs išvalo,
// todėl tikri skaičiuoklių duomenys neliečiami.
function bandytiSaugykla() {
  const r = {};
  const raktas = "testas";
  const pavyzdys = { pavadinimas: "Pavyzdys", sumos: [1, 2.5], aktyvus: true };
  try {
    istrintiDuomenis(raktas);
    r.tuscia = nuskaitytiDuomenis(raktas);

    r.issaugota = issaugotiDuomenis(raktas, 3, pavyzdys);
    r.raktasSuPriesdeliu = localStorage.getItem("finansai.testas") !== null;

    const nuskaityta = nuskaitytiDuomenis(raktas);
    r.versija = nuskaityta.versija;
    // Objektus lyginame pavertę tekstu.
    r.duomenys = JSON.stringify(nuskaityta.duomenys);
    r.tiketasi = JSON.stringify(pavyzdys);

    localStorage.setItem("finansai.testas", "{sugadinta");
    r.sugadinta = nuskaitytiDuomenis(raktas);

    localStorage.setItem("finansai.testas", "123");
    r.neTaForma = nuskaitytiDuomenis(raktas);

    istrintiDuomenis(raktas);
    r.poIstrynimo = nuskaitytiDuomenis(raktas);
  } catch (klaida) {
    // Jei saugykla neveikia, neužpildytos reikšmės liks tuščios ir testai parodys klaidą.
  }
  return r;
}

// Ar dvi reikšmės laikomos vienodomis?
function arLygu(gauta, tiketasi) {
  if (typeof tiketasi === "number" && typeof gauta === "number") {
    // NaN nėra lygus niekam, net sau, todėl tikriname atskirai.
    if (Number.isNaN(tiketasi)) {
      return Number.isNaN(gauta);
    }
    // Trupmenas lyginame su mažyte paklaida.
    return Math.abs(gauta - tiketasi) < 1e-9;
  }
  return gauta === tiketasi;
}

// Įvykdo visus testus ir grąžina rezultatų sąrašą.
function vykdytiTestus() {
  return surinktiTestus().map(function (testas) {
    return {
      pavadinimas: testas[0],
      gauta: testas[1],
      tiketasi: testas[2],
      pavyko: arLygu(testas[1], testas[2]),
    };
  });
}

// Parodo rezultatus puslapyje (kviečiama iš testai.html).
function rodytiTestus() {
  const rezultatai = vykdytiTestus();
  const pavyko = rezultatai.filter(function (r) { return r.pavyko; }).length;

  const suvestine = document.getElementById("suvestine");
  suvestine.textContent = "Pavyko " + pavyko + " iš " + rezultatai.length;
  suvestine.className = pavyko === rezultatai.length ? "testas-pavyko" : "testas-nepavyko";

  const sarasas = document.getElementById("sarasas");
  rezultatai.forEach(function (r) {
    const eilute = document.createElement("li");
    eilute.className = r.pavyko ? "testas-pavyko" : "testas-nepavyko";
    eilute.textContent = (r.pavyko ? "✓ " : "✗ ") + r.pavadinimas;
    if (!r.pavyko) {
      eilute.textContent += " – gauta: " + String(r.gauta) + ", tikėtasi: " + String(r.tiketasi);
    }
    sarasas.appendChild(eilute);
  });
}
