// Linijinis grafikas, nupieštas SVG – be jokių bibliotekų.
// SVG – tai paveikslėlis, aprašytas žymėmis (linija, tekstas, apskritimas), panašiai kaip HTML.
// Naudoja funkcijas iš bendra.js, todėl įkeliamas po jo.
//
// Failo dalys:
//   1. Skaičiavimai – ašių žymės ir duomenų pavertimas koordinatėmis (tikrinama testais).
//   2. Piešimas     – SVG elementų kūrimas, legenda ir paaiškinimas užvedus pelę ar palietus.

// ---------- 1. Skaičiavimai ----------

// Parenka „gražų“ žingsnį tarp ašies žymių: 1, 2 arba 5, padaugintą iš 10, 100, 1000…
// Pvz. kai didžiausia reikšmė 55 853 ir norime apie 4 žymių, žingsnis bus 20 000.
function grazusZingsnis(didziausia, kiekZymiu) {
  if (!(didziausia > 0)) {
    return 1;
  }
  const apytikslis = didziausia / kiekZymiu;
  const laipsnis = Math.pow(10, Math.floor(Math.log10(apytikslis)));
  const santykis = apytikslis / laipsnis;
  let daugiklis = 10;
  if (santykis <= 1) {
    daugiklis = 1;
  } else if (santykis <= 2) {
    daugiklis = 2;
  } else if (santykis <= 5) {
    daugiklis = 5;
  }
  return daugiklis * laipsnis;
}

// Vertikalios ašies žymės nuo 0 iki pirmos „gražios“ reikšmės, ne mažesnės už didžiausią.
// asiesZymes(55853, 4) -> [0, 20000, 40000, 60000]
function asiesZymes(didziausia, kiekZymiu) {
  if (!(didziausia > 0)) {
    return [0, 1];
  }
  const zingsnis = grazusZingsnis(didziausia, kiekZymiu);
  const kiek = Math.ceil(didziausia / zingsnis);
  const zymes = [];
  for (let i = 0; i <= kiek; i = i + 1) {
    zymes.push(i * zingsnis);
  }
  return zymes;
}

// Horizontalios ašies žymės (metai): ne daugiau kaip apie 6, kas 1, 2, 5, 10 arba 20 metų.
function metuZymes(metai) {
  let zingsnis = 20;
  for (const galimas of [1, 2, 5, 10, 20]) {
    if (metai / galimas <= 6) {
      zingsnis = galimas;
      break;
    }
  }
  const zymes = [];
  for (let m = 0; m <= metai; m = m + zingsnis) {
    zymes.push(m);
  }
  return zymes;
}

// Mastelis: paverčia duomenis (metus ir eurus) ekrano koordinatėmis.
//   x(metai) – atstumas nuo kairio krašto, y(suma) – nuo viršaus.
// SVG koordinatės skaičiuojamos nuo viršutinio kairio kampo, todėl didesnė suma – mažesnis y.
function grafikoMastelis(plotis, aukstis, parastes, didziausiasX, didziausiasY) {
  const vidinisPlotis = plotis - parastes.kaire - parastes.desine;
  const vidinisAukstis = aukstis - parastes.virsus - parastes.apacia;
  return {
    x: function (reiksme) {
      return parastes.kaire + (reiksme / didziausiasX) * vidinisPlotis;
    },
    y: function (reiksme) {
      return parastes.virsus + (1 - reiksme / didziausiasY) * vidinisAukstis;
    },
    // Atvirkščiai: iš ekrano x koordinatės – artimiausi metai (naudojama pelei ir pirštui).
    metaiPagalX: function (x) {
      const metai = Math.round(((x - parastes.kaire) / vidinisPlotis) * didziausiasX);
      return Math.max(0, Math.min(didziausiasX, metai));
    },
  };
}

// Taškų sąrašą paverčia SVG linijos aprašu: "M10.0 200.0L40.0 180.5…"
// (M – „perkelk pieštuką“, L – „brėžk liniją iki“).
function linijosKelias(taskai) {
  return taskai
    .map(function (taskas, indeksas) {
      return (indeksas === 0 ? "M" : "L") + taskas.x.toFixed(1) + " " + taskas.y.toFixed(1);
    })
    .join("");
}

// Išdėsto užrašus linijų galuose taip, kad jie nesusiliptų: tarp gretimų bent „tarpas“ pikselių,
// ir visi telpa tarp „virsus“ ir „apacia“. Grąžina naujas y koordinates ta pačia tvarka.
function isdestytiZymes(pozicijos, tarpas, virsus, apacia) {
  const rikiuotos = pozicijos
    .map(function (y, indeksas) {
      return { y: y, indeksas: indeksas };
    })
    .sort(function (a, b) {
      return a.y - b.y;
    });

  // Iš viršaus į apačią: jei užrašas per arti ankstesnio, nustumiame žemyn.
  for (let i = 0; i < rikiuotos.length; i = i + 1) {
    const maziausias = i === 0 ? virsus : rikiuotos[i - 1].y + tarpas;
    if (rikiuotos[i].y < maziausias) {
      rikiuotos[i].y = maziausias;
    }
  }
  // Iš apačios į viršų: jei išlindo už apatinio krašto, pakeliame.
  for (let i = rikiuotos.length - 1; i >= 0; i = i - 1) {
    const didziausias = i === rikiuotos.length - 1 ? apacia : rikiuotos[i + 1].y - tarpas;
    if (rikiuotos[i].y > didziausias) {
      rikiuotos[i].y = didziausias;
    }
  }

  const rezultatas = [];
  for (const zyme of rikiuotos) {
    rezultatas[zyme.indeksas] = zyme.y;
  }
  return rezultatas;
}

// Sveikas eurų skaičius ašies žymei: 20000 -> "20 000 €".
function asiesSuma(skaicius) {
  return rodytiSuma(skaicius).replace(",00", "");
}

// ---------- 2. Piešimas ----------

// SVG elementai kuriami kitaip nei HTML: naršyklei reikia pasakyti, kad tai SVG „vardų sritis“.
const SVG_VARDU_SRITIS = "http://www.w3.org/2000/svg";

// Sukuria SVG elementą su atributais, pvz. sukurtiSvg("line", { x1: 0, y1: 0, x2: 10, y2: 10 }).
function sukurtiSvg(zyme, atributai, tekstas) {
  const elementas = document.createElementNS(SVG_VARDU_SRITIS, zyme);
  for (const vardas of Object.keys(atributai || {})) {
    elementas.setAttribute(vardas, String(atributai[vardas]));
  }
  if (tekstas !== undefined) {
    elementas.textContent = tekstas;
  }
  return elementas;
}

// Nupiešia legendą – paaiškinimą, kuri linija ką reiškia.
function piestiLegenda(vieta, duomenys) {
  vieta.textContent = "";
  for (const serija of duomenys.serijos) {
    const punktas = sukurtiElementa("li");
    punktas.appendChild(sukurtiElementa("span", "legendos-zenklas " + serija.klase));
    punktas.appendChild(sukurtiElementa("span", "", serija.pavadinimas));
    vieta.appendChild(punktas);
  }
  const atrama = sukurtiElementa("li");
  atrama.appendChild(sukurtiElementa("span", "legendos-zenklas legendos-zenklas-atrama"));
  atrama.appendChild(sukurtiElementa("span", "", duomenys.atrama.pavadinimas));
  vieta.appendChild(atrama);
}

// Nupiešia grafiką nurodytoje vietoje. „duomenys“:
//   metai   – kiek metų rodoma (x ašis nuo 0 iki metai),
//   serijos – linijos: { pavadinimas, trumpas, klase, reiksmes } (reikšmė kiekvieniems metams),
//   atrama  – punktyrinė palyginimo linija: { pavadinimas, reiksmes },
//   aprasas – grafiko aprašymas žodžiais (ekrano skaitytuvams).
// Grąžina { rodytiTaska, slepti } – jais galima parodyti arba paslėpti vienų metų paaiškinimą.
function piestiLinijuGrafika(vieta, duomenys) {
  vieta.textContent = "";

  // Grafiką piešiame tikrais ekrano pikseliais pagal vietos plotį – tada telefone raidės nesusitraukia.
  const plotis = Math.max(280, vieta.clientWidth || 640);
  const aukstis = Math.round(Math.max(220, Math.min(340, plotis * 0.6)));
  const parastes = { kaire: 4, desine: 46, virsus: 22, apacia: 28 };

  let didziausia = 0;
  for (const serija of duomenys.serijos.concat([duomenys.atrama])) {
    for (const reiksme of serija.reiksmes) {
      didziausia = Math.max(didziausia, reiksme);
    }
  }
  const zymes = asiesZymes(didziausia, 4);
  const virsutine = zymes[zymes.length - 1];
  const mastelis = grafikoMastelis(plotis, aukstis, parastes, duomenys.metai, virsutine);
  const desinysKrastas = mastelis.x(duomenys.metai);
  const apatinisKrastas = mastelis.y(0);

  const svg = sukurtiSvg("svg", {
    viewBox: "0 0 " + plotis + " " + aukstis,
    role: "img",
    "aria-label": duomenys.aprasas,
    tabindex: "0",
  });

  // Horizontalios tinklelio linijos ir sumų užrašai virš jų.
  for (const zyme of zymes) {
    const y = mastelis.y(zyme);
    svg.appendChild(sukurtiSvg("line", {
      x1: parastes.kaire, y1: y, x2: desinysKrastas, y2: y,
      class: zyme === 0 ? "grafiko-tinklelis grafiko-pagrindas" : "grafiko-tinklelis",
    }));
    if (zyme > 0) {
      svg.appendChild(sukurtiSvg("text", { x: parastes.kaire, y: y - 5, class: "grafiko-asies-tekstas" }, asiesSuma(zyme)));
    }
  }

  // Metų užrašai apačioje. Pirmas lygiuojamas kairėje, paskutinis – dešinėje, kad neišlįstų.
  const metuSarasas = metuZymes(duomenys.metai);
  metuSarasas.forEach(function (metai, indeksas) {
    let lygiavimas = "middle";
    if (indeksas === 0) {
      lygiavimas = "start";
    } else if (metai === duomenys.metai) {
      lygiavimas = "end";
    }
    const arPaskutinis = indeksas === metuSarasas.length - 1;
    svg.appendChild(sukurtiSvg(
      "text",
      { x: mastelis.x(metai), y: aukstis - 8, "text-anchor": lygiavimas, class: "grafiko-asies-tekstas" },
      arPaskutinis ? metai + " m." : String(metai)
    ));
  });

  // Vienos linijos taškai ekrano koordinatėmis.
  function serijosTaskai(serija) {
    return serija.reiksmes.map(function (reiksme, metai) {
      return { x: mastelis.x(metai), y: mastelis.y(reiksme) };
    });
  }

  // Punktyrinė palyginimo linija (įmokėta suma) – po kitomis linijomis.
  svg.appendChild(sukurtiSvg("path", { d: linijosKelias(serijosTaskai(duomenys.atrama)), class: "grafiko-atrama" }));

  // Scenarijų linijos su tašku gale.
  for (const serija of duomenys.serijos) {
    const taskai = serijosTaskai(serija);
    const galas = taskai[taskai.length - 1];
    svg.appendChild(sukurtiSvg("path", { d: linijosKelias(taskai), class: "grafiko-linija " + serija.klase }));
    svg.appendChild(sukurtiSvg("circle", { cx: galas.x, cy: galas.y, r: 4, class: "grafiko-taskas " + serija.klase }));
  }

  // Užrašai linijų galuose – kad liniją būtų galima atpažinti ne vien iš spalvos.
  const galuY = duomenys.serijos.map(function (serija) {
    return mastelis.y(serija.reiksmes[serija.reiksmes.length - 1]) + 4;
  });
  const isdestyti = isdestytiZymes(galuY, 14, parastes.virsus + 4, apatinisKrastas);
  duomenys.serijos.forEach(function (serija, indeksas) {
    svg.appendChild(sukurtiSvg("text", { x: desinysKrastas + 8, y: isdestyti[indeksas], class: "grafiko-zyme" }, serija.trumpas));
  });

  // Žymeklis: vertikali linija ir taškai ties pasirinktais metais. Iš pradžių paslėptas.
  const zymeklis = sukurtiSvg("g", { class: "grafiko-zymeklis", display: "none" });
  const zymeklioLinija = sukurtiSvg("line", { y1: parastes.virsus, y2: apatinisKrastas, class: "grafiko-zymeklio-linija" });
  zymeklis.appendChild(zymeklioLinija);
  const atramosTaskas = sukurtiSvg("circle", { r: 4, class: "grafiko-taskas grafiko-taskas-atrama" });
  zymeklis.appendChild(atramosTaskas);
  const zymeklioTaskai = duomenys.serijos.map(function (serija) {
    const taskas = sukurtiSvg("circle", { r: 5, class: "grafiko-taskas " + serija.klase });
    zymeklis.appendChild(taskas);
    return taskas;
  });
  svg.appendChild(zymeklis);

  // Paaiškinimas (HTML blokas virš grafiko) su tikslesniais pasirinktų metų skaičiais.
  const paaiskinimas = sukurtiElementa("div", "grafiko-paaiskinimas");
  paaiskinimas.hidden = true;

  let rodomiMetai = null;

  function rodytiTaska(metai) {
    rodomiMetai = metai;
    const x = mastelis.x(metai);

    zymeklis.setAttribute("display", "inline");
    zymeklioLinija.setAttribute("x1", String(x));
    zymeklioLinija.setAttribute("x2", String(x));
    atramosTaskas.setAttribute("cx", String(x));
    atramosTaskas.setAttribute("cy", String(mastelis.y(duomenys.atrama.reiksmes[metai])));
    duomenys.serijos.forEach(function (serija, indeksas) {
      zymeklioTaskai[indeksas].setAttribute("cx", String(x));
      zymeklioTaskai[indeksas].setAttribute("cy", String(mastelis.y(serija.reiksmes[metai])));
    });

    paaiskinimas.textContent = "";
    paaiskinimas.appendChild(sukurtiElementa("strong", "", metai === 0 ? "Pradžia" : "Po " + metai + " m."));
    // Didžiausia vertė viršuje – ta pačia tvarka kaip linijos grafike.
    const eilutes = duomenys.serijos.slice().reverse();
    for (const serija of eilutes) {
      const eilute = sukurtiElementa("div", "paaiskinimo-eilute");
      const pavadinimas = sukurtiElementa("span");
      pavadinimas.appendChild(sukurtiElementa("span", "legendos-zenklas " + serija.klase));
      pavadinimas.appendChild(sukurtiElementa("span", "", serija.trumpas));
      eilute.appendChild(pavadinimas);
      eilute.appendChild(sukurtiElementa("span", "suma", rodytiSuma(serija.reiksmes[metai])));
      paaiskinimas.appendChild(eilute);
    }
    const atrama = sukurtiElementa("div", "paaiskinimo-eilute");
    const atramosPavadinimas = sukurtiElementa("span");
    atramosPavadinimas.appendChild(sukurtiElementa("span", "legendos-zenklas legendos-zenklas-atrama"));
    atramosPavadinimas.appendChild(sukurtiElementa("span", "", duomenys.atrama.pavadinimas));
    atrama.appendChild(atramosPavadinimas);
    atrama.appendChild(sukurtiElementa("span", "suma", rodytiSuma(duomenys.atrama.reiksmes[metai])));
    paaiskinimas.appendChild(atrama);

    // Paaiškinimą dedame toje pusėje, kur daugiau vietos, kad neuždengtų žymeklio.
    if (x > plotis / 2) {
      paaiskinimas.style.left = "auto";
      paaiskinimas.style.right = Math.round(plotis - x + 12) + "px";
    } else {
      paaiskinimas.style.right = "auto";
      paaiskinimas.style.left = Math.round(x + 12) + "px";
    }
    paaiskinimas.hidden = false;
  }

  function slepti() {
    rodomiMetai = null;
    zymeklis.setAttribute("display", "none");
    paaiskinimas.hidden = true;
  }

  // Pelė arba pirštas: randame artimiausius metus pagal vietą grafike.
  function pagalRodykle(ivykis) {
    const remelis = svg.getBoundingClientRect();
    // Jei grafikas ekrane rodomas kitokio pločio nei pieštas, perskaičiuojame koordinatę.
    const x = (ivykis.clientX - remelis.left) * (plotis / remelis.width);
    rodytiTaska(mastelis.metaiPagalX(x));
  }
  svg.addEventListener("pointermove", pagalRodykle);
  svg.addEventListener("pointerdown", pagalRodykle);
  svg.addEventListener("pointerleave", function (ivykis) {
    // Pelei išėjus – paslepiame. Palietus pirštu paaiškinimas lieka, kol paliečiama kitur.
    if (ivykis.pointerType === "mouse") {
      slepti();
    }
  });

  // Klaviatūra: rodyklėmis kairėn ir dešinėn galima eiti per metus, Esc – paslėpti.
  svg.addEventListener("keydown", function (ivykis) {
    if (ivykis.key === "ArrowRight" || ivykis.key === "ArrowLeft") {
      const poslinkis = ivykis.key === "ArrowRight" ? 1 : -1;
      const dabartiniai = rodomiMetai === null ? (poslinkis === 1 ? -1 : duomenys.metai + 1) : rodomiMetai;
      rodytiTaska(Math.max(0, Math.min(duomenys.metai, dabartiniai + poslinkis)));
      ivykis.preventDefault();
    } else if (ivykis.key === "Escape") {
      slepti();
    }
  });
  svg.addEventListener("blur", slepti);

  vieta.appendChild(svg);
  vieta.appendChild(paaiskinimas);

  return { rodytiTaska: rodytiTaska, slepti: slepti };
}
