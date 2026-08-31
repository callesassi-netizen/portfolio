/* ==========================================================================
   Språk — svenska (original) och engelska.
   Svenska texten står i HTML:en; den här filen håller bara engelskan plus
   de svenska strängarna som behövs för att kunna växla tillbaka.
   Valet sparas i webbläsaren och sätts på <html lang> innan sidan målas
   (se inline-skriptet i <head>).
   ========================================================================== */
(function () {
  'use strict';

  var SV = {
    chipPerf: 'Prestanda',
    procLead: 'Du ska aldrig behöva undra var projektet står eller vad nästa faktura landar på. Så här ser vägen ut, från första samtalet till att sajten är i drift.',
    p1m: 'Kostar ingenting', p2m: 'Fast pris i förväg', p3m: 'Du tycker till längs vägen', p4m: 'Löpande',
    footBlurb: 'Hemsidor, e-handel, innehåll och automation för företag i Sverige och Finland. Från idé till drift — samma person hela vägen.',
    footCta: 'Begär offert', footServices: 'Tjänster', footNav: 'Genvägar', footContact: 'Kontakt',
    footLangs: 'Svenska · Finska · Engelska',
    mpEyebrow: 'Arbetssätt',
    mp1: 'Ett samtal innan något byggs',
    mp2: 'Fast pris, inga överraskningar',
    mp3: 'Samma person hela vägen',
    mpSign: 'Carl-Johan Blomstrand',
    splitEyebrow: 'Tre språkområden',
    splitTitle: 'Samma sajt, tre språkområden.',
    splitLead: 'Jag arbetar på svenska, finska och engelska, mot både svensk och finsk marknad. Det betyder inte bara översatt text — det betyder rätt tonfall, rätt betalsätt och kampanjer som är byggda för respektive land.',
    sp1t: 'Innehåll på tre språk', sp1b: 'Svenska, finska och engelska, skrivet för att fungera i sitt sammanhang.',
    sp2t: 'Byggt för att skötas själv', sp2b: 'Du ska kunna byta en text eller lägga in en produkt utan att ringa mig.',
    sp3t: 'Teknik som håller', sp3b: 'Ren kod, snabba sidor och drift som inte kräver att du förstår DNS.',
    sp4t: 'Eller så sköter jag det', sp4b: 'Löpande underhåll av sajt och system är lika självklart — vill du hellre slippa tar jag hand om det.',
    navServices: 'tjänster', navWork: 'case',
    heroL1: 'Digitalt innehåll', heroL2: 'som blomstrar<em>.</em>',
    svcEyebrow: 'Tjänster',
    svcTitle: 'Det jag hjälper företag med.',
    svcLead: 'Sex områden som går in i varandra. De flesta kunder börjar med ett och lägger till fler när det första sitter.',
    v1t: 'Hemsidor',
    v1b: 'Nya sajter, och ny design på gamla — mestadels i WordPress, men handbyggt i kod när det passar bättre. Struktur, texter, bilder och det tekniska bakom, så att sidan blir lika begriplig för besökaren som för Google.',
    v2t: 'E-handel',
    v2b: 'Webbshoppar som går att sköta själv. Produkter, kategorier, betalning och frakt — plus texterna som gör att kunden vågar trycka på köp.',
    v3t: 'SEO, innehåll & kommunikation',
    v3b: 'Texter, produktbeskrivningar, nyhetsbrev och kundkommunikation på svenska, finska och engelska — skrivet både för läsaren och för sökmotorn. Samma budskap, rätt tonfall i varje land.',
    v4t: 'Annonsering & analys',
    v4b: 'Kampanjer via Meta för svensk och finsk marknad, med målgrupper och uppföljning. Du får veta vad pengarna gick till, inte bara att de gick åt.',
    v5t: 'Automation & AI',
    v5b: 'Flöden i n8n och Zapier och egna AI-verktyg som tar hand om det repetitiva. Offertsvar, produktdata, rapporter — sånt som annars äter en förmiddag i veckan.',
    v6t: 'Webbhotell & drift',
    v6b: 'DNS, e-post, SSL, databaser och uppdateringar i cPanel. Sajten hålls uppdaterad och säker, och när något krånglar felsöker jag i stället för att hänvisa vidare.',
    svcFoot: 'Vet du inte riktigt vad du behöver? Det är den vanligaste utgångspunkten. Beskriv läget så säger jag vad jag skulle göra först.',
    svcCta: 'Begär offert',
    chipProducts: 'Produktflöden', chipMaint: 'Underhåll',
    procEyebrow: 'Så går det till',
    procTitle: 'Fyra steg, inga överraskningar.',
    p1t: 'Vi pratar', p1b: 'Ett samtal om vad du gör, vem du säljer till och vad som skaver idag. Kostar ingenting och binder inte.',
    p2t: 'Förslag och pris', p2b: 'Du får ett upplägg med omfattning, tidsplan och fast pris innan något börjar byggas.',
    p3t: 'Jag bygger', p3b: 'Du ser sajten växa fram och kan tycka till längs vägen — inte först på slutet.',
    p4t: 'Drift efteråt', p4b: 'Uppdateringar, säkerhet och småfix. Du behöver inte lära dig cPanel för att äga en hemsida.',
    skip: 'Hoppa till innehållet',
    brandSub: 'Digitalt innehåll',
    navAbout: 'om', navContact: 'kontakt',
    navCta: 'Begär offert',

    heroEyebrow: 'Digitalt innehåll',
    heroRole: 'Digital innehållsproducent',
    heroLead: 'Jag bygger hemsidor, driver e-handel och får innehåll, annonser och teknik att hänga ihop — för företag i Sverige och Finland.',
    heroCta1: 'Se tjänster', heroCta2: 'Se case', scrollCue: 'scrolla',

    manifest: 'Webbutveckling, kommunikation, analys och AI-flöden. Från idé till resultat — på svenska, finska och engelska.',
    manifestMeta: 'Jag trivs bäst där text, teknik och affär möts. Strukturerad, lösningsorienterad och lite för intresserad av nya verktyg.',

    workEyebrow: 'Case',
    workTitle: 'Ett urval av case',
    workHint: 'Håll musen över för att pausa',

    badgeLive: 'live', badgeOngoing: 'pågående', badgeOps: 'drift',
    chipMulti: '5 språk', chipStruct: 'Struktur', chipFilter: 'Filtrering',
    chipShop: 'Webbshop', chipDonation: 'Donation', chipOwn: 'Eget projekt',
    chipComm: 'Kommunikation', chipEcom: 'E-handel', chipAudience: 'Målgrupper',
    chipAnalysis: 'Analys', chipAgents: 'AI-agenter', chipHosting: 'Webbhotell',
    chipCampaign: 'Kampanjer', chipCustomer: 'Kunddialog',
    chipWebAnalytics: 'Webbanalys', chipCampaignData: 'Kampanjdata', chipReporting: 'Rapportering',

    c1sub: 'skogsmaskiner',
    c1: 'Komplett WordPress-hemsida för ledande företag inom skogsmaskiner — översatt till fem språk.',
    c2sub: 'elektriker',
    c2: 'WordPress-webbplats för elfirman MT-Electric Oy i Tampere & Hämeenlinna — tydlig presentation av tjänster och kontakt.',
    c3sub: 'tatueringsguide',
    c3: 'Snabb, statisk sajt byggd i HTML & Astro — en katalog som samlar Finlands tatuerare och studior, där besökaren bläddrar portfolios och filtrerar på stil, stad och pris.',
    c4sub: 'med Livbojen',
    c4: 'Webbshop för kattleksaker och foder i samarbete med kattorganisationen Livbojen som räddar hemlösa katter — med inbyggd donationsfunktion.',
    c5sub: 'kommunikatör',
    c5: 'Marknads- och kommunikationsansvar för e-handel inom billack och vårdprodukter — för både den svenska och finska marknaden.',
    c6title: 'Strategisk marknadsföring <i>— via Meta</i>',
    c6: 'Annonser och kampanjer via Meta för svenska och finska marknaden — strategi, målgrupper och analys.',
    c7title: 'Automation <i>& AI-flöden</i>',
    c7: 'Automationsflöden i n8n och Zapier, samt bygger AI-agenter och andra AI-baserade verktyg.',
    c8title: 'Webbhotell <i>& cPanel</i>',
    c8: 'Har jobbat i cPanel via ett webbhotell i Finland — justerat inställningar som DNS, e-post, SSL, databaser och PHP samt uppdaterat och felsökt flera hemsidor.',

    endTitle: 'Nästa projekt är ditt.',
    endBody: 'Har du en idé, en hemsida som behöver lyftas eller ett flöde som borde bli smartare? Hör av dig så tittar vi på det.',
    endCta: 'Skicka ett meddelande',

    aboutEyebrow: 'Om företaget', aboutTitle: 'Personen bakom Blomstrande.', aboutCap: 'Calle · Eskilstuna',
    about1: 'Carl-Johan i grunden — Calle till vardags. Jag skapar, strukturerar och förbättrar digitalt innehåll för webb, kommunikation och e-handel.',
    about2: 'Till vardags jobbar jag brett med det digitala — webb, e-handel, innehåll, kampanjer, kommunikation, analys och digital utveckling, på både svensk och finsk marknad. Jag trivs med att röra mig mellan olika delar och få helheten att hänga ihop.',
    about3: 'Vid sidan av bygger jag hemsidor åt olika kunder, främst i WordPress. Jag hjälper till med struktur, text, innehåll, funktion och det tekniska som gör att sidan känns både tydlig och levande. Jag har även jobbat i cPanel via ett webbhotell i Finland — justerat inställningar som DNS, e-post och SSL och uppdaterat flera hemsidor.',
    about4: 'Jag driver också egna digitala projekt, bland annat Purrfect. Det är ett exempel på hur jag gillar att jobba: ta en idé, forma innehållet, bygga strukturen och få tekniken att hänga ihop.',
    pull: 'Jag gillar att göra saker begripliga, användbara och färdiga.',

    contactEyebrow: 'Kontakt',
    contactTitle: 'Berätta vad ditt företag behöver.',
    contactLead: 'Har du en idé, en hemsida som behöver lyftas eller ett digitalt flöde som borde bli smartare? Hör av dig, så tittar vi på det. Normalt svar inom 1–2 arbetsdagar.',
    fName: 'Namn', fMail: 'E-post', fSubject: 'Företag', fMsg: 'Meddelande', fSend: 'Skicka förfrågan',
    fNote: 'Meddelandet skickas direkt till Calle@blomstrande.net.',

    footTag: 'Digitalt innehåll som blomstrar', footTop: 'Till toppen'
  };

  var EN = {
    chipPerf: 'Performance',
    procLead: 'You should never have to wonder where the project stands or what the next invoice will say. This is the route, from the first conversation to the site being live.',
    p1m: 'Costs nothing', p2m: 'Fixed price up front', p3m: 'You weigh in as we go', p4m: 'Ongoing',
    footBlurb: 'Websites, e-commerce, content and automation for companies in Sweden and Finland. From idea to operations — the same person throughout.',
    footCta: 'Request a quote', footServices: 'Services', footNav: 'Shortcuts', footContact: 'Contact',
    footLangs: 'Swedish · Finnish · English',
    mpEyebrow: 'How I work',
    mp1: 'A conversation before anything is built',
    mp2: 'Fixed price, no surprises',
    mp3: 'The same person all the way through',
    mpSign: 'Carl-Johan Blomstrand',
    splitEyebrow: 'Three languages',
    splitTitle: 'One site, three language areas.',
    splitLead: 'I work in Swedish, Finnish and English, across both the Swedish and Finnish markets. That means more than translated text — it means the right tone, the right payment methods and campaigns built for each country.',
    sp1t: 'Content in three languages', sp1b: 'Swedish, Finnish and English, written to work in its own context.',
    sp2t: 'Built to run yourself', sp2b: 'You should be able to change a text or add a product without calling me.',
    sp3t: 'Technology that holds', sp3b: 'Clean code, fast pages and hosting that does not require you to understand DNS.',
    sp4t: 'Or I look after it', sp4b: 'Ongoing maintenance of site and systems is just as much an option — if you would rather not, I take care of it.',
    navServices: 'services', navWork: 'work',
    heroL1: 'Digital content', heroL2: 'that flourishes<em>.</em>',
    svcEyebrow: 'Services',
    svcTitle: 'What I help companies with.',
    svcLead: 'Six areas that feed into each other. Most clients start with one and add more once the first is running.',
    v1t: 'Websites',
    v1b: 'New sites, and a new design for old ones — mostly WordPress, hand-coded when that fits better. Structure, copy, images and the technical side behind it, so the site makes as much sense to a visitor as it does to Google.',
    v2t: 'E-commerce',
    v2b: 'Webshops you can actually run yourself. Products, categories, payment and shipping — plus the copy that makes a customer willing to press buy.',
    v3t: 'SEO, content & communication',
    v3b: 'Copy, product descriptions, newsletters and customer communication in Swedish, Finnish and English — written for the reader and the search engine alike. Same message, right tone in each market.',
    v4t: 'Advertising & analytics',
    v4b: 'Meta campaigns for the Swedish and Finnish markets, with audiences and follow-up. You get to know where the money went, not just that it went.',
    v5t: 'Automation & AI',
    v5b: 'Flows in n8n and Zapier and custom AI tools that take care of the repetitive parts. Quote replies, product data, reports — the things that otherwise eat a morning a week.',
    v6t: 'Hosting & operations',
    v6b: 'DNS, email, SSL, databases and updates in cPanel. The site stays current and secure, and when something breaks I debug it instead of passing you on.',
    svcFoot: 'Not sure what you need? That is the most common starting point. Describe the situation and I will tell you what I would do first.',
    svcCta: 'Request a quote',
    chipProducts: 'Product feeds', chipMaint: 'Maintenance',
    procEyebrow: 'How it works',
    procTitle: 'Four steps, no surprises.',
    p1t: 'We talk', p1b: 'A conversation about what you do, who you sell to and what is chafing today. Costs nothing and commits to nothing.',
    p2t: 'Proposal and price', p2b: 'You get a plan with scope, timeline and a fixed price before anything gets built.',
    p3t: 'I build', p3b: 'You watch the site take shape and can weigh in along the way — not only at the end.',
    p4t: 'Operations after', p4b: 'Updates, security and small fixes. You should not have to learn cPanel to own a website.',
    skip: 'Skip to content',
    brandSub: 'Digital content',
    navAbout: 'about', navContact: 'contact',
    navCta: 'Request a quote',

    heroEyebrow: 'Digital content',
    heroRole: 'Digital content producer',
    heroLead: 'I build websites, run e-commerce and make content, ads and technology hold together — for companies in Sweden and Finland.',
    heroCta1: 'See services', heroCta2: 'See work', scrollCue: 'scroll',

    manifest: 'Web development, communication, analytics and AI workflows. From idea to result — in Swedish, Finnish and English.',
    manifestMeta: 'I am at my best where copy, technology and business meet. Structured, solution-minded and slightly too interested in new tools.',

    workEyebrow: 'Work',
    workTitle: 'A selection of work',
    workHint: 'Hover to pause',

    badgeLive: 'live', badgeOngoing: 'ongoing', badgeOps: 'ops',
    chipMulti: '5 languages', chipStruct: 'Structure', chipFilter: 'Filtering',
    chipShop: 'Webshop', chipDonation: 'Donations', chipOwn: 'Own project',
    chipComm: 'Communication', chipEcom: 'E-commerce', chipAudience: 'Audiences',
    chipAnalysis: 'Analytics', chipAgents: 'AI agents', chipHosting: 'Hosting',
    chipCampaign: 'Campaigns', chipCustomer: 'Customer dialogue',
    chipWebAnalytics: 'Web analytics', chipCampaignData: 'Campaign data', chipReporting: 'Reporting',

    c1sub: 'forestry machines',
    c1: 'Complete WordPress site for a leading forestry machinery company — translated into five languages.',
    c2sub: 'electricians',
    c2: 'WordPress site for the electrical firm MT-Electric Oy in Tampere & Hämeenlinna — a clear presentation of services and contact details.',
    c3sub: 'tattoo guide',
    c3: 'Fast static site built in HTML & Astro — a directory of Finland’s tattoo artists and studios where visitors browse portfolios and filter by style, city and price.',
    c4sub: 'with Livbojen',
    c4: 'Webshop for cat toys and food together with the cat charity Livbojen, which rescues homeless cats — with a built-in donation feature.',
    c5sub: 'communications lead',
    c5: 'Marketing and communications lead for an e-commerce business in car paint and care products — for both the Swedish and Finnish markets.',
    c6title: 'Strategic marketing <i>— via Meta</i>',
    c6: 'Ads and campaigns on Meta for the Swedish and Finnish markets — strategy, audiences and analysis.',
    c7title: 'Automation <i>& AI workflows</i>',
    c7: 'Automation flows in n8n and Zapier, plus building AI agents and other AI-based tools.',
    c8title: 'Hosting <i>& cPanel</i>',
    c8: 'Worked in cPanel through a Finnish hosting provider — adjusting DNS, email, SSL, databases and PHP, and updating and debugging several websites.',

    endTitle: 'The next one could be yours.',
    endBody: 'Got an idea, a website that needs lifting or a workflow that ought to be smarter? Get in touch and we will take a look.',
    endCta: 'Send a message',

    aboutEyebrow: 'About', aboutTitle: 'The person behind Blomstrande.', aboutCap: 'Calle · Eskilstuna',
    about1: 'Carl-Johan on paper — Calle in everyday life. I create, structure and improve digital content for web, communication and e-commerce.',
    about2: 'Day to day I work broadly across digital — web, e-commerce, content, campaigns, communication, analytics and development, in both the Swedish and Finnish markets. I like moving between the parts and making the whole thing hold together.',
    about3: 'Alongside that I build websites for clients, mostly in WordPress. I help with structure, copy, content, functionality and the technical side that makes a site feel both clear and alive. I have also worked in cPanel through a Finnish hosting provider — adjusting DNS, email and SSL, and updating several websites.',
    about4: 'I also run my own digital projects, Purrfect among them. It is a good example of how I like to work: take an idea, shape the content, build the structure and make the technology hold together.',
    pull: 'Above all: I like making things understandable, useful and finished.',

    contactEyebrow: 'Contact',
    contactTitle: 'Tell me what your company needs.',
    contactLead: 'Got an idea, a website that needs lifting or a digital workflow that ought to be smarter? Get in touch and we will take a look. Normally a reply within 1–2 working days.',
    fName: 'Name', fMail: 'Email', fSubject: 'Company', fMsg: 'Message', fSend: 'Send enquiry',
    fNote: 'Your message goes straight to Calle@blomstrande.net.',

    footTag: 'Digital content that flourishes', footTop: 'Back to top'
  };

  var DICT = { sv: SV, en: EN };
  var HTML_KEYS = /^(c6title|c7title|c8title|heroL2)$/;  /* skrivs om av extend() */  // dessa innehåller taggar

  function apply(lang) {
    var d = DICT[lang] || DICT.sv;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!(k in d)) return;
      if (HTML_KEYS.test(k)) el.innerHTML = d[k];
      else el.textContent = d[k];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-aria');
      if (k in d) el.setAttribute('aria-label', d[k]);
    });

    document.documentElement.lang = lang;
    var cur = document.getElementById('langCur');
    if (cur) cur.textContent = lang.toUpperCase();

    /* Undersidor sätter sina egna titlar via data-title-sv / data-title-en
       på <html>. Utan detta skrev språkbytet över dem med startsidans. */
    var egen = document.documentElement.getAttribute('data-title-' + lang);
    document.title = egen || (lang === 'en'
      ? 'Carl-Johan Blomstrand — Digital content producer'
      : 'Carl-Johan Blomstrand — Digital innehållsproducent');
  }

  /* Undersidorna har egna ordlistor. De läggs på efter att den här filen
     laddat, och applicerar sig själva direkt. */
  function extend(sv, en, htmlKeys) {
    var k;
    for (k in sv) if (Object.prototype.hasOwnProperty.call(sv, k)) SV[k] = sv[k];
    for (k in en) if (Object.prototype.hasOwnProperty.call(en, k)) EN[k] = en[k];
    if (htmlKeys && htmlKeys.length) {
      HTML_KEYS = new RegExp('^(' + HTML_KEYS.source.replace(/^\^\(|\)\$$/g, '') +
                             '|' + htmlKeys.join('|') + ')$');
    }
    apply(document.documentElement.lang || 'sv');
  }

  function set(lang) {
    if (!DICT[lang]) return;
    try { localStorage.setItem('bl-lang', lang); } catch (e) {}
    apply(lang);
    // Scrub-texten är redan uppdelad i ord vid det här laget — bygg om den.
    document.dispatchEvent(new CustomEvent('bl:lang', { detail: lang }));
  }

  var saved = 'sv';
  try { saved = localStorage.getItem('bl-lang') || 'sv'; } catch (e) {}
  if (saved !== 'sv') apply(saved);
  else {
    var cur = document.getElementById('langCur');
    if (cur) cur.textContent = 'SV';
  }

  window.BL_I18N = { set: set, apply: apply, extend: extend, current: function () { return document.documentElement.lang; } };
})();
