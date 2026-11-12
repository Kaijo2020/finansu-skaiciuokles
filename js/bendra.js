// Bendros funkcijos, kurias naudoja visi puslapiai.
// Šiame faile nėra nieko, kas liestų puslapio išvaizdą – tik skaičiavimai,
// todėl viską galima patikrinti testais (žr. testai.html).

// Tekstą, kurį įvedė žmogus, paverčia skaičiumi.
//   "1.200"     -> 1200
//   "1 200"     -> 1200
//   "1.200,50"  -> 1200.5
//   "12,5"      -> 12.5
// Jei teksto suprasti nepavyksta, grąžina NaN („not a number“ – „ne skaičius“).
// NaN pasirinktas tyčia: jis neleidžia klaidai tyliai virsti nuliu.
function skaitytiSuma(tekstas) {
  if (typeof tekstas !== "string") {
    return NaN;
  }

  // 1. Išmetame tai, kas skaičiaus reikšmės nekeičia: tarpus (ir paprastus,
  //    ir „nelūžtančius“, kuriuos įterpia Excel ar bankas), euro ženklą.
  let t = tekstas.replace(/[\s\u00A0\u202F]/g, "").replace(/€|EUR/gi, "");

  // 2. Minusas priekyje. Priimame ir ilgąjį minusą „−“, kurį kartais įterpia programos.
  let zenklas = 1;
  if (t.startsWith("-") || t.startsWith("−")) {
    zenklas = -1;
    t = t.slice(1);
  }

  // 3. Nusprendžiame, ką reiškia taškai ir kableliai.
  //    Šablonai (reguliariosios išraiškos) aprašo leidžiamas formas:
  //    \d – skaitmuo, {3} – lygiai trys, + – vienas ar daugiau, ^ ir $ – pradžia ir pabaiga.
  const tukstanciaiSuTaskais = /^[1-9]\d{0,2}(\.\d{3})+$/; // 1.200  arba 1.200.000
  let sveikoji;
  let trupmena = "";

  if (t.includes(",")) {
    // Yra kablelis: jis – dešimtainis skyriklis, ir jis gali būti tik vienas.
    const dalys = t.split(",");
    if (dalys.length !== 2) {
      return NaN;
    }
    sveikoji = dalys[0];
    trupmena = dalys[1];
    if (!/^\d+$/.test(trupmena)) {
      return NaN;
    }
    // Taškai prieš kablelį gali būti tik tūkstančių skyrikliai: 1.200,50
    if (sveikoji.includes(".")) {
      if (!tukstanciaiSuTaskais.test(sveikoji)) {
        return NaN;
      }
      sveikoji = sveikoji.replace(/\./g, "");
    }
  } else if (tukstanciaiSuTaskais.test(t)) {
    // Kablelio nėra, po kiekvieno taško lygiai 3 skaitmenys: 1.200 -> 1200
    sveikoji = t.replace(/\./g, "");
  } else if (/^\d+\.\d+$/.test(t)) {
    // Vienas taškas ir ne 3 skaitmenys po jo: 12.5 -> 12,5
    const dalys = t.split(".");
    sveikoji = dalys[0];
    trupmena = dalys[1];
  } else {
    sveikoji = t;
  }

  // 4. Kas liko, turi būti vien skaitmenys.
  if (!/^\d+$/.test(sveikoji)) {
    return NaN;
  }

  return zenklas * Number(sveikoji + "." + (trupmena || "0"));
}

// Skaičių paverčia tekstu lietuvišku formatu su 2 skaitmenimis po kablelio:
//   1234.5 -> "1 234,50"
function formatuotiSkaiciu(skaicius) {
  if (typeof skaicius !== "number" || !Number.isFinite(skaicius)) {
    return "–";
  }

  // Skaičiuojame centais (sveikais skaičiais), kad išvengtume netikslumų,
  // kurių atsiranda kompiuteriui skaičiuojant su trupmenomis.
  const centai = Math.round(Math.abs(skaicius) * 100);
  const eurai = Math.floor(centai / 100);
  const likeCentai = centai % 100;

  // Kas 3 skaitmenis įterpiame nelūžtantį tarpą (\u00A0), kad suma
  // nebūtų perkelta per dvi eilutes.
  const euraiTekstu = String(eurai).replace(/\B(?=(\d{3})+$)/g, "\u00A0");
  const centaiTekstu = String(likeCentai).padStart(2, "0");

  // Minusą rašome tik tada, kai suapvalinus liko ne nulis (kad nebūtų „-0,00“).
  const minusas = skaicius < 0 && centai !== 0 ? "-" : "";

  return minusas + euraiTekstu + "," + centaiTekstu;
}

// Tas pats, tik su euro ženklu: 1234.5 -> "1 234,50 €"
function rodytiSuma(skaicius) {
  const tekstas = formatuotiSkaiciu(skaicius);
  if (tekstas === "–") {
    return tekstas;
  }
  return tekstas + "\u00A0€";
}

// ---------- Išsaugojimas naršyklėje (localStorage) ----------
// localStorage – nedidelė naršyklės „stalčiukų“ saugykla: kiekvienas įrašas turi
// raktą (pavadinimą) ir reikšmę (tik tekstą). Duomenys lieka šiame įrenginyje
// ir šioje naršyklėje – niekur nesiunčiami.

// Visi mūsų raktai prasideda taip pat, kad nesusimaišytų su kitų puslapių duomenimis.
const SAUGYKLOS_PRIESDELIS = "finansai.";

// Išsaugo duomenis. Grąžina true, jei pavyko, ir false, jei ne
// (pvz., saugykla pilna arba naršyklė ją išjungusi).
// Versijos numeris įrašomas kartu: jei vėliau pakeisime duomenų struktūrą,
// žinosime, kokios formos yra seni išsaugoti duomenys.
function issaugotiDuomenis(raktas, versija, duomenys) {
  try {
    const paketas = { versija: versija, duomenys: duomenys };
    // JSON.stringify objektą paverčia tekstu, nes saugykla priima tik tekstą.
    localStorage.setItem(SAUGYKLOS_PRIESDELIS + raktas, JSON.stringify(paketas));
    return true;
  } catch (klaida) {
    return false;
  }
}

// Nuskaito duomenis. Grąžina objektą { versija, duomenys } arba null,
// jei nieko neišsaugota arba įrašas sugadintas.
function nuskaitytiDuomenis(raktas) {
  try {
    const tekstas = localStorage.getItem(SAUGYKLOS_PRIESDELIS + raktas);
    if (tekstas === null) {
      return null;
    }
    // JSON.parse tekstą paverčia atgal objektu.
    const paketas = JSON.parse(tekstas);
    const formaTinkama =
      paketas !== null &&
      typeof paketas === "object" &&
      typeof paketas.versija === "number" &&
      "duomenys" in paketas;
    return formaTinkama ? paketas : null;
  } catch (klaida) {
    return null;
  }
}

// Ištrina išsaugotus duomenis.
function istrintiDuomenis(raktas) {
  try {
    localStorage.removeItem(SAUGYKLOS_PRIESDELIS + raktas);
    return true;
  } catch (klaida) {
    return false;
  }
}

// ---------- Puslapio elementų kūrimas ----------

// Sukuria puslapio elementą, pvz. sukurtiElementa("span", "suma", "12,50 €").
// Tekstas dedamas per textContent: net jei žmogus pavadinime įrašytų HTML žymių,
// naršyklė jas parodys kaip paprastą tekstą, o ne vykdys.
function sukurtiElementa(zyme, klase, tekstas) {
  const elementas = document.createElement(zyme);
  if (klase) {
    elementas.className = klase;
  }
  if (tekstas !== undefined) {
    elementas.textContent = tekstas;
  }
  return elementas;
}

// Procentus paverčia tekstu su vienu skaitmeniu po kablelio: 64.375 -> "64,4 %"
function formatuotiProcentus(skaicius) {
  if (typeof skaicius !== "number" || !Number.isFinite(skaicius)) {
    return "–";
  }
  const suapvalinta = Math.round(skaicius * 10) / 10;
  return suapvalinta.toFixed(1).replace(".", ",") + " %";
}

// ---------- Failai: CSV ir atsisiuntimas ----------

// Data tekstu „metai-mėnuo-diena“, pvz. 2026-01-05. Naudojama failų pavadinimuose.
function datosZyma(data) {
  const menuo = String(data.getMonth() + 1).padStart(2, "0");
  const diena = String(data.getDate()).padStart(2, "0");
  return data.getFullYear() + "-" + menuo + "-" + diena;
}

// Eilutės pabaigos ženklai, kurių tikisi „Excel“ (simbolių kodai 13 ir 10).
const CSV_EILUTES_PABAIGA = String.fromCharCode(13, 10);

// Vieną reikšmę paverčia CSV langeliu.
//   skaičius -> "1200,50" (kablelis, be tarpų – tada „Excel“ jį supranta kaip skaičių),
//   tuščia   -> "",
//   tekstas  -> jei reikia, apgaubiamas kabutėmis.
function csvLangelis(reiksme) {
  if (reiksme === null || reiksme === undefined) {
    return "";
  }
  if (typeof reiksme === "number") {
    return (Math.round(reiksme * 100) / 100).toFixed(2).replace(".", ",");
  }

  let tekstas = String(reiksme);
  // Saugumas: tekstą, prasidedantį = + - arba @, „Excel“ bandytų vykdyti kaip formulę.
  // Apostrofas priekyje pasako, kad tai tik tekstas.
  if (/^[=+\-@]/.test(tekstas)) {
    tekstas = "'" + tekstas;
  }
  // Jei tekste yra kabliataškis, kabutės ar nauja eilutė, langelį reikia apgaubti kabutėmis,
  // o kabutes viduje padvigubinti.
  const arReikiaKabuciu =
    tekstas.includes(";") ||
    tekstas.includes('"') ||
    tekstas.includes(String.fromCharCode(10)) ||
    tekstas.includes(String.fromCharCode(13));
  if (arReikiaKabuciu) {
    tekstas = '"' + tekstas.replace(/"/g, '""') + '"';
  }
  return tekstas;
}

// Lentelę (eilučių sąrašą, kur kiekviena eilutė – langelių sąrašas) paverčia CSV tekstu.
// Langeliai skiriami kabliataškiu – taip įprasta lietuviškame „Excel“.
function sudarytiCsv(eilutes) {
  return eilutes
    .map(function (eilute) {
      return eilute.map(csvLangelis).join(";");
    })
    .join(CSV_EILUTES_PABAIGA);
}

// Pasiūlo naršyklei išsaugoti failą su nurodytu pavadinimu ir turiniu.
// Failas sukuriamas pačioje naršyklėje – niekur nesiunčiamas.
function atsisiustiFaila(pavadinimas, turinys, tipas) {
  // CSV failo pradžioje dedame nematomą ženklą (BOM, kodas 65279) – pagal jį „Excel“
  // supranta, kad tekstas yra UTF-8, ir teisingai parodo lietuviškas raides.
  const pradzia = tipas.startsWith("text/csv") ? String.fromCharCode(65279) : "";
  const blob = new Blob([pradzia + turinys], { type: tipas });
  const adresas = URL.createObjectURL(blob);

  // Sukuriame nematomą nuorodą su atributu „download“ ir ją „paspaudžiame“.
  const nuoroda = document.createElement("a");
  nuoroda.href = adresas;
  nuoroda.download = pavadinimas;
  document.body.appendChild(nuoroda);
  nuoroda.click();
  nuoroda.remove();

  // Po akimirkos atlaisviname naršyklės atmintį.
  setTimeout(function () {
    URL.revokeObjectURL(adresas);
  }, 1000);
}

// Parodo arba paslepia klaidos pranešimą prie įvedimo lauko (naudoja abi skaičiuoklės).
// aria-invalid pasako ekrano skaitytuvui, kad lauke klaida; pagal jį CSS nuspalvina rėmelį.
function rodytiLaukoKlaida(laukas, klaidosVieta, tekstas) {
  laukas.setAttribute("aria-invalid", tekstas ? "true" : "false");
  klaidosVieta.textContent = tekstas;
  klaidosVieta.hidden = !tekstas;
}

// ---------- Atsarginės kopijos (naudoja abi skaičiuoklės) ----------

// Žyma faile, pagal kurią atpažįstame, kad tai mūsų skaičiuoklių kopija.
const KOPIJOS_PROGRAMA = "finansu-skaiciuokles";

// Didžiausias leidžiamas importuojamo failo dydis baitais (2 MB) – tikra kopija daug mažesnė.
const KOPIJOS_DYDZIO_RIBA = 2 * 1024 * 1024;

// Sudaro atsarginės kopijos objektą: duomenys ir informacija apie patį failą.
//   tipas – kurios skaičiuoklės kopija ("biudzetas" arba "investavimas").
function sudarytiKopija(tipas, versija, duomenys, data) {
  return {
    programa: KOPIJOS_PROGRAMA,
    tipas: tipas,
    versija: versija,
    sukurta: datosZyma(data),
    duomenys: duomenys,
  };
}

// Perskaito kopijos failo tekstą. Grąžina { duomenys } arba { klaida } su paaiškinimu žmogui.
// Failu nepasitikime: jį galėjo kas nors pakeisti arba tai gali būti visai kitas failas.
//   arTinkami   – funkcija, patikrinanti, ar duomenys tinkamos formos,
//   pavadinimas – žodis pranešimui, pvz. "biudžeto".
function skaitytiKopija(tekstas, tipas, versija, arTinkami, pavadinimas) {
  let kopija;
  try {
    kopija = JSON.parse(tekstas);
  } catch (klaida) {
    return { klaida: "Failo nepavyko perskaityti: tai ne JSON failas." };
  }

  if (kopija === null || typeof kopija !== "object" || kopija.programa !== KOPIJOS_PROGRAMA || kopija.tipas !== tipas) {
    return { klaida: "Tai ne šios skaičiuoklės " + pavadinimas + " kopija." };
  }
  if (kopija.versija !== versija) {
    return { klaida: "Kopija sukurta kitos versijos skaičiuokle (versija " + String(kopija.versija) + "), jos atkurti negalima." };
  }
  if (!arTinkami(kopija.duomenys)) {
    return { klaida: "Kopijos duomenys sugadinti arba nepilni." };
  }
  return { duomenys: kopija.duomenys };
}

// Parodo pranešimą atsarginės kopijos kortelėje.
function rodytiKopijosBusena(tekstas, arKlaida) {
  const busena = document.getElementById("kopijos-busena");
  busena.textContent = tekstas;
  busena.className = arKlaida ? "klaidos-tekstas" : "teigiama pastaba";
}

// Prijungia kopijos failo pasirinkimą: matomas mygtukas „paspaudžia“ paslėptą failo lauką,
// o pasirinkto failo tekstas perduodamas funkcijai „apdoroti“.
function paruostiFailoImporta(mygtukoId, laukoId, apdoroti) {
  const failoLaukas = document.getElementById(laukoId);
  document.getElementById(mygtukoId).addEventListener("click", function () {
    failoLaukas.click();
  });

  // Kai žmogus pasirenka failą, naršyklė leidžia perskaityti tik jį – ne kitus kompiuterio failus.
  failoLaukas.addEventListener("change", function () {
    const failas = failoLaukas.files[0];
    if (!failas) {
      return;
    }
    if (failas.size > KOPIJOS_DYDZIO_RIBA) {
      rodytiKopijosBusena("Failas per didelis, kad būtų šios skaičiuoklės kopija. Dabartiniai duomenys nepakeisti.", true);
      failoLaukas.value = "";
      return;
    }

    const skaitytuvas = new FileReader();
    skaitytuvas.addEventListener("load", function () {
      apdoroti(String(skaitytuvas.result));
      // Išvalome lauką, kad tą patį failą būtų galima pasirinkti dar kartą.
      failoLaukas.value = "";
    });
    skaitytuvas.addEventListener("error", function () {
      rodytiKopijosBusena("Failo nepavyko perskaityti. Dabartiniai duomenys nepakeisti.", true);
      failoLaukas.value = "";
    });
    skaitytuvas.readAsText(failas);
  });
}

// Išsaugo kopijos objektą į JSON failą, pvz. „biudzetas-2026-11-11.json“.
function eksportuotiJson(pradzia, kopija) {
  const pavadinimas = pradzia + "-" + datosZyma(new Date()) + ".json";
  // Trečias JSON.stringify parametras (2) – įtraukos, kad failą būtų galima perskaityti akimis.
  atsisiustiFaila(pavadinimas, JSON.stringify(kopija, null, 2), "application/json");
  rodytiKopijosBusena("Kopija išsaugota faile „" + pavadinimas + "“ (ieškokite atsisiuntimų aplanke).", false);
}

// Išsaugo lentelę į CSV failą.
function eksportuotiCsv(pradzia, eilutes) {
  const pavadinimas = pradzia + "-" + datosZyma(new Date()) + ".csv";
  atsisiustiFaila(pavadinimas, sudarytiCsv(eilutes), "text/csv;charset=utf-8");
  rodytiKopijosBusena("Lentelė išsaugota faile „" + pavadinimas + "“. Jį galima atidaryti „Excel“.", false);
}
