/**
 * Vragenbank voor BUZZ! Mediawijsheid & Lager Onderwijs
 * Geïnspireerd op De Schaal van M (1e, 2e en 3e graad) + Algemene Kennis Lager Onderwijs.
 * Elke vraag heeft 4 antwoorden passend bij de 4 gekleurde PS3 Buzz! knoppen:
 * 0 = Blauw, 1 = Oranje, 2 = Groen, 3 = Geel
 */

window.BUZZ_CATEGORIES = [
  {
    id: 'mix',
    title: 'De Grote Klasquiz (Mix)',
    subtitle: 'Mediawijsheid + Algemene Kennis door elkaar',
    icon: '🏆',
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'media-1',
    title: 'Mediawijsheid • 1e Graad',
    subtitle: '6-8 jaar • Kritikat, schermtijd, reclame & lief zijn',
    icon: '🐱',
    color: 'from-sky-400 to-blue-600'
  },
  {
    id: 'media-2',
    title: 'Mediawijsheid • 2e Graad',
    subtitle: '8-10 jaar • Cyberdetective, nepnieuws & wachtwoorden',
    icon: '🚀',
    color: 'from-emerald-400 to-teal-600'
  },
  {
    id: 'media-3',
    title: 'Mediawijsheid • 3e Graad',
    subtitle: '10-12 jaar • AI, deepfakes, algoritmes & phishing',
    icon: '⚡',
    color: 'from-fuchsia-500 to-purple-700'
  },
  {
    id: 'algemeen',
    title: 'Algemene Kennis • Lager Onderwijs',
    subtitle: 'Natuur, ruimte, aardrijkskunde, taal & wetenschap',
    icon: '🌍',
    color: 'from-rose-400 to-red-600'
  }
];

window.BUZZ_QUESTIONS = [
  /* =========================================================
     1E GRAAD MEDIAWIJSHEID (6-8 JAAR) - KRITIKAT SPEURAVONTUUR
     ========================================================= */
  {
    id: 'm1-1',
    category: 'media-1',
    badge: '🐱 1e Graad • Kritikat',
    question: 'Je kijkt op de tablet en plots komt er een filmpje voorbij dat zegt: "Koop nu dit supercoole speelgoed!" Wat is dat?',
    options: ['Een geheime schat', 'Reclame', 'Huiswerk van de juf', 'Een weerbericht'],
    correct: 1,
    explanation: 'Reclame wil jou iets laten kopen! Het is goed om te herkennen wanneer iets reclame is.'
  },
  {
    id: 'm1-2',
    category: 'media-1',
    badge: '🐱 1e Graad • Gevoelens',
    question: 'Je ziet op de tablet een filmpje waarvan je een beetje bang of verdrietig wordt. Wat doe je het best?',
    options: [
      'Stiekem blijven kijken',
      'De tablet weggooien',
      'Het meteen vertellen aan mama, papa of de meester/juf',
      'Het doorsturen naar alle vriendjes'
    ],
    correct: 2,
    explanation: 'Als je iets engs of raars ziet op een scherm, praat er altijd meteen over met een volwassene die je vertrouwt.'
  },
  {
    id: 'm1-3',
    category: 'media-1',
    badge: '🐱 1e Graad • Schermtijd',
    question: 'Je hebt al een uur op de tablet gespeeld en je ogen worden moe. Wat is een slim idee?',
    options: [
      'Het scherm nog feller zetten',
      'Een pauze nemen en lekker buiten spelen of tekenen',
      'Nog drie spelletjes tegelijk openen',
      'Met de tablet in bed kruipen'
    ],
    correct: 1,
    explanation: 'Afwisselen tussen schermtijd, bewegen en slapen houdt je ogen en je hoofd gezond!'
  },
  {
    id: 'm1-4',
    category: 'media-1',
    badge: '🐱 1e Graad • Veiligheid',
    question: 'Een vreemde vraagt in een online spelletje: "Hoe heet je en waar woon je?" Wat antwoord je?',
    options: [
      'Ik geef mijn echte adres',
      'Ik stuur een foto van mijn huis',
      'Niets! Ik zeg mijn naam en adres nooit aan vreemden',
      'Ik geef het telefoonnummer van mama'
    ],
    correct: 2,
    explanation: 'Persoonlijke gegevens zoals je adres of telefoonnummer houd je altijd geheim voor vreemden.'
  },
  {
    id: 'm1-5',
    category: 'media-1',
    badge: '🐱 1e Graad • Vriendelijkheid',
    question: 'Iemand stuurt een gemeen berichtje in een spel. Hoe reageer je als een echte Media-Held?',
    options: [
      'Nog gemener terugschelden',
      'Niet meedoen, blokkeren en een volwassene helpen vragen',
      'Huilen en nooit meer spelen',
      'Alle andere spelers uitlachen'
    ],
    correct: 1,
    explanation: 'Online blijven we vriendelijk! Reageer niet op gemene berichten, maar vraag hulp.'
  },
  {
    id: 'm1-6',
    category: 'media-1',
    badge: '🐱 1e Graad • Slapen & Schermen',
    question: 'Waarom leggen we de tablet of smartphone best weg vlak voor we gaan slapen?',
    options: [
      'Omdat de tablet anders honger krijgt',
      'Omdat het felle licht je hersenen wakker houdt',
      'Omdat wifi ’s nachts uitgaat in heel de wereld',
      'Omdat je dan sneller kan rekenen'
    ],
    correct: 1,
    explanation: 'Het licht van een scherm maakt je wakker, waardoor je moeilijker in slaap valt.'
  },
  {
    id: 'm1-7',
    category: 'media-1',
    badge: '🐱 1e Graad • Echt of Nep',
    question: 'Je ziet een foto van een paarse olifant die op een eenwieler fietst in de klas. Is dat echt?',
    options: [
      'Ja, alle foto’s op internet zijn echt',
      'Alleen als het maandag is',
      'Nee, foto’s kun je makkelijk aanpassen of tekenen op de computer',
      'Ja, ik zag hem gisteren nog'
    ],
    correct: 2,
    explanation: 'Op internet kun je foto’s bewerken of verzinnen. Niet alles wat je ziet is echt gebeurd!'
  },
  {
    id: 'm1-8',
    category: 'media-1',
    badge: '🐱 1e Graad • Toestemming',
    question: 'Je wilt een leuke foto van je vriendje of vriendinnetje op internet zetten. Wat moet je eerst doen?',
    options: [
      'Gewoon plaatsen zonder iets te zeggen',
      'Eerst netjes toestemming vragen aan je vriendje én een volwassene',
      'Er een gekke snor op tekenen',
      'De foto uitprinten en op straat hangen'
    ],
    correct: 1,
    explanation: 'Je zet nooit zomaar een foto van iemand anders online zonder toestemming te vragen.'
  },
  {
    id: 'm1-9',
    category: 'media-1',
    badge: '🐱 1e Graad • Wachtwoord',
    question: 'Wat is een goed wachtwoord voor je tablet of spelaccount?',
    options: [
      '1234',
      'Je eigen voornaam',
      'Een geheim woord met cijfers dat alleen jij en je ouders kennen',
      'wachtwoord'
    ],
    correct: 2,
    explanation: '1234 of je eigen naam is veel te makkelijk te raden. Bewaar je wachtwoord als een geheim!'
  },
  {
    id: 'm1-10',
    category: 'media-1',
    badge: '🐱 1e Graad • Kopen in Spelletjes',
    question: 'In een gratis spelletje verschijnt een knop: "Klik hier voor 1000 diamanten (€9,99)". Wat doe je?',
    options: [
      'Meteen op klikken, diamanten zijn leuk!',
      'Eerst aan mama of papa vragen, want €9,99 kost echt geld',
      'Tien keer klikken zodat het gratis wordt',
      'De tablet herstarten'
    ],
    correct: 1,
    explanation: 'In veel spelletjes kun je met echt geld dingen kopen. Klik nooit zomaar op betaalknoppen!'
  },
  {
    id: 'm1-11',
    category: 'media-1',
    badge: '🐱 1e Graad • Gezonde Ogen',
    question: 'Hoe ver hou je een tablet of boek best van je ogen af?',
    options: [
      'Tegen je neus aan',
      'Ongeveer een armlengte (30 tot 40 cm) afstand',
      'Aan de andere kant van de kamer',
      'Onder je kussen'
    ],
    correct: 1,
    explanation: 'Te dicht op een scherm kijken is vermoeiend voor je ogen. Hou altijd genoeg afstand!'
  },
  {
    id: 'm1-12',
    category: 'media-1',
    badge: '🐱 1e Graad • Kritikat Tip',
    question: 'Wanneer mag je op een vreemde, knipperende pop-up drukken die zegt "JE HEBT EEN IPAD GEWONNEN!"?',
    options: [
      'Meteen, want ik heb geluk!',
      'Nooit zomaar op klikken — het is vaak een valstrik',
      'Alleen als de tekst groen is',
      'Alleen tijdens de speeltijd'
    ],
    correct: 1,
    explanation: 'Knipperende "Je hebt gewonnen!"-berichtjes zijn bijna altijd nep en proberen je te foppen.'
  },

  /* =========================================================
     2E GRAAD MEDIAWIJSHEID (8-10 JAAR) - CYBERDETECTIVE
     ========================================================= */
  {
    id: 'm2-1',
    category: 'media-2',
    badge: '🚀 2e Graad • Factcheck Lab',
    question: 'Je leest een bericht: "Wetenschappers ontdekken dat chocolade voortaan groente is!" Hoe check je of dit waar is?',
    options: [
      'Als het veel likes heeft, is het waar',
      'Controleren op betrouwbare nieuwssites zoals Ketnet/NOS Jeugdjournaal',
      'Meteen doorsturen in de klasgroep',
      'Kijken of er veel uitroeptekens staan'
    ],
    correct: 1,
    explanation: 'Een echte Cyberdetective checkt altijd meerdere betrouwbare bronnen voordat hij iets gelooft of deelt!'
  },
  {
    id: 'm2-2',
    category: 'media-2',
    badge: '🚀 2e Graad • Wachtwoord Kluiskraker',
    question: 'Welk wachtwoord is het STERKST en het moeilijkst te kraken door hackers?',
    options: [
      'voetbal2016',
      'qwerty123',
      'Blauwe!Kameel#84Zon',
      'geheim1234'
    ],
    correct: 2,
    explanation: 'Een sterk wachtwoord is lang en gebruikt hoofdletters, kleine letters, cijfers én speciale tekens.'
  },
  {
    id: 'm2-3',
    category: 'media-2',
    badge: '🚀 2e Graad • Stop Cyberpesten',
    question: 'In de klaschat lacht iemand een klasgenoot uit met een gemene meme. Wat is de beste actie?',
    options: [
      'Meelachen zodat je erbij hoort',
      'De meme zelf ook doorsturen',
      'Niet meedoen, steun geven aan het slachtoffer en een volwassene inschakelen',
      'De chatgroep voor altijd verwijderen'
    ],
    correct: 2,
    explanation: 'Door niet mee te lachen, steun te tonen en hulp te vragen, stop je cyberpesten samen!'
  },
  {
    id: 'm2-4',
    category: 'media-2',
    badge: '🚀 2e Graad • Privacy',
    question: 'Je maakt een profiel aan voor een nieuw spel. Welke gebruikersnaam is het veiligst?',
    options: [
      'LarsPeeters_Kerkstraat12',
      'SuperBliksem99',
      'Emma_2016_Antwerpen',
      'MijnTelefoon0478123456'
    ],
    correct: 1,
    explanation: 'Gebruik een coole bijnaam (nickname) waarin je echte achternaam, geboortejaar of woonplaats niet staat.'
  },
  {
    id: 'm2-5',
    category: 'media-2',
    badge: '🚀 2e Graad • Chat-Trol',
    question: 'Wat is een "trol" op het internet?',
    options: [
      'Iemand die onder een brug woont',
      'Iemand die expres gemene of boze reacties plaatst om ruzie te zoeken',
      'Een virus dat je scherm groen maakt',
      'Een handige zoekmachine'
    ],
    correct: 1,
    explanation: 'Chat-trollen willen dat jij boos reageert. "Don’t feed the troll": negeer en blokkeer ze!'
  },
  {
    id: 'm2-6',
    category: 'media-2',
    badge: '🚀 2e Graad • Influencers',
    question: 'Jouw favoriete YouTuber zegt: "Deze nieuwe frisdrank is de allerlekkerste ter wereld!" Onder de video staat #ad of "Betaalde promotie". Wat betekent dat?',
    options: [
      'De YouTuber krijgt betaald om dat te zeggen',
      'De drank is gratis in de winkel',
      'De video is afgelopen',
      'Het is een geheim recept'
    ],
    correct: 0,
    explanation: '#ad of "Betaalde promotie" betekent dat het reclame is en de maker geld krijgt van het merk.'
  },
  {
    id: 'm2-7',
    category: 'media-2',
    badge: '🚀 2e Graad • Veilig Downloaden',
    question: 'Je wilt een gratis spelletje downloaden. Waar doe je dat het veiligst?',
    options: [
      'Via een pop-up op een onbekende website',
      'Via een link in een vreemd chatbericht',
      'Via de officiële App Store of Google Play Store (met toestemming)',
      'Via een USB-stick die je op straat vond'
    ],
    correct: 2,
    explanation: 'Officiële app-stores controleren apps op virussen. Download nooit zomaar bestanden van vage sites.'
  },
  {
    id: 'm2-8',
    category: 'media-2',
    badge: '🚀 2e Graad • Digitaal Voetspoor',
    question: 'Wat bedoelen we met je "digitaal voetspoor"?',
    options: [
      'De schoenmaat die je online koopt',
      'Alle sporen, foto’s en berichten die jij achterlaat op het internet',
      'Een stappenteller op je horloge',
      'De kabel van je router'
    ],
    correct: 1,
    explanation: 'Alles wat je post, liket of zoekt laat sporen na. Wat eenmaal online staat, verdwijnt niet zomaar!'
  },
  {
    id: 'm2-9',
    category: 'media-2',
    badge: '🚀 2e Graad • Snelheid vs Nauwkeurigheid',
    question: 'Waarom verspreidt nepnieuws zich vaak zo razendsnel op sociale media?',
    options: [
      'Omdat het vaak schokkend, grappig of heel boosmakend is',
      'Omdat computers nepnieuws voorrang geven voor de lol',
      'Omdat echt nieuws alleen op papier bestaat',
      'Omdat het korter is dan drie woorden'
    ],
    correct: 0,
    explanation: 'Nepnieuws speelt vaak in op sterke emoties (angst, woede, verbazing) zodat mensen het snel delen zonder te checken.'
  },
  {
    id: 'm2-10',
    category: 'media-2',
    badge: '🚀 2e Graad • Auteursrecht',
    question: 'Je maakt een spreekbeurt en wilt foto’s van internet gebruiken. Wat is eerlijk en slim?',
    options: [
      'Doen alsof je alle foto’s zelf gemaakt hebt',
      'Rechtenvrije foto’s gebruiken of de bron/maker netjes vermelden',
      'De naam van de fotograaf wegknippen',
      'Alleen foto’s met een watermerk gebruiken'
    ],
    correct: 1,
    explanation: 'Foto’s en teksten zijn van de maker. Vermeld altijd je bron of kies rechtenvrije afbeeldingen!'
  },
  {
    id: 'm2-11',
    category: 'media-2',
    badge: '🚀 2e Graad • Locatie Delen',
    question: 'Een spelapp vraagt tijdens het opstarten: "Mag deze app altijd je exacte locatie gebruiken?" Het is een simpel puzzelspel. Wat kies je?',
    options: [
      'Altijd toestaan',
      'Weigeren! Een puzzelspel heeft mijn woonadres niet nodig',
      'Alleen toestaan als de zon schijnt',
      'Mijn pincode intypen'
    ],
    correct: 1,
    explanation: 'Geef apps alleen de toestemmingen die ze écht nodig hebben om te werken.'
  },
  {
    id: 'm2-12',
    category: 'media-2',
    badge: '🚀 2e Graad • Schermbalans',
    question: 'Welk signaal laat zien dat je misschien te lang aan het gamen bent?',
    options: [
      'Je hebt zin om met vrienden af te spreken',
      'Je wordt snel chagrijnig als je moet stoppen en vergeet te eten of te slapen',
      'Je haalt een nieuw level',
      'Je batterij is nog 80% vol'
    ],
    correct: 1,
    explanation: 'Als stoppen heel moeilijk is of je humeur eronder lijdt, is het tijd voor duidelijke afspraken en pauzes.'
  },

  /* =========================================================
     3E GRAAD MEDIAWIJSHEID (10-12 JAAR) - MEDIAWIJS MASTER
     ========================================================= */
  {
    id: 'm3-1',
    category: 'media-3',
    badge: '⚡ 3e Graad • AI & Deepfakes',
    question: 'Wat is een "deepfake"?',
    options: [
      'Een heel diep zwembad in een VR-game',
      'Een door AI gemanipuleerde video of stem waarin iemand iets lijkt te zeggen of doen wat nooit gebeurd is',
      'Een geheime code in Minecraft',
      'Een extra sterk wachtwoord van 20 tekens'
    ],
    correct: 1,
    explanation: 'Met AI kunnen gezichten en stemmen levensecht worden nagemaakt. Blijf dus kritisch bij opvallende video’s!'
  },
  {
    id: 'm3-2',
    category: 'media-3',
    badge: '⚡ 3e Graad • Algoritmes',
    question: 'Op TikTok of YouTube zie je opeens alleen maar kattenfilmpjes nadat je er drie hebt geliket. Hoe komt dat?',
    options: [
      'De hele wereld maakt alleen nog kattenfilmpjes',
      'Het algoritme past jouw feed aan op basis van jouw kijkgedrag en likes',
      'Je telefoon is gehackt door een kat',
      'Het is internationale kattendag'
    ],
    correct: 1,
    explanation: 'Een algoritme leert wat jij interessant vindt en schotelt je meer van hetzelfde voor om je langer te laten kijken.'
  },
  {
    id: 'm3-3',
    category: 'media-3',
    badge: '⚡ 3e Graad • Filterbubbel',
    question: 'Wat is het gevaar van een "filterbubbel"?',
    options: [
      'Dat je telefoon oververhit raakt',
      'Dat je vooral meningen ziet die op jouw mening lijken en andere kanten van het verhaal mist',
      'Dat je geen filters meer op Snapchat kunt zetten',
      'Dat je wifi trager wordt'
    ],
    correct: 1,
    explanation: 'In een filterbubbel krijg je steeds dezelfde soort informatie te zien. Zoek daarom ook zelf actief naar andere bronnen!'
  },
  {
    id: 'm3-4',
    category: 'media-3',
    badge: '⚡ 3e Graad • Phishing',
    question: 'Je krijgt een mail: "Je Roblox-account wordt over 1 uur verwijderd! Klik snel op www.robl0x-veilig.net en log in." Waaraan herken je phishing?',
    options: [
      'Aan het woordje "Roblox"',
      'Aan de valse link (robl0x met een nul) én de kunstmatige tijdsdruk/paniek',
      'Omdat de mail in het Nederlands is',
      'Omdat er een punt in het webadres staat'
    ],
    correct: 1,
    explanation: 'Phishingberichten gebruiken vaak spoed ("snel binnen 1 uur!") en een licht aangepaste, valse URL om je wachtwoord te stelen.'
  },
  {
    id: 'm3-5',
    category: 'media-3',
    badge: '⚡ 3e Graad • 2FA Beveiliging',
    question: 'Wat betekent "2FA" (tweestapsverificatie) bij het inloggen?',
    options: [
      'Twee keer hetzelfde wachtwoord intypen',
      'Inloggen met je wachtwoord én een extra code (bv. op je telefoon)',
      'Twee accounts aanmaken voor hetzelfde spel',
      'Je wachtwoord delen met twee vrienden'
    ],
    correct: 1,
    explanation: 'Met 2FA kan een hacker zelfs mét jouw wachtwoord niet zomaar binnen zonder de tweede bevestiging.'
  },
  {
    id: 'm3-6',
    category: 'media-3',
    badge: '⚡ 3e Graad • Dark Patterns',
    question: 'In een game staat een grote groene knop "NU KOPEN (500 munten)" en heel klein in lichtgrijs "nee bedankt, ik hou niet van winnen". Hoe noemen we zo’n ontwerp-trucje?',
    options: [
      'Bug fixing',
      'Dark pattern',
      'Open source',
      'Cloud gaming'
    ],
    correct: 1,
    explanation: 'Dark patterns zijn misleidende ontwerpen in apps en games die jou ongemerkt sturen naar kopen, klikken of data delen.'
  },
  {
    id: 'm3-7',
    category: 'media-3',
    badge: '⚡ 3e Graad • Data-Titan',
    question: 'Waarom zijn veel grote sociale media apps "gratis" te gebruiken?',
    options: [
      'Omdat de servers op zonne-energie draaien zonder kosten',
      'Omdat ze geld verdienen met jouw gegevens (data) en gerichte advertenties',
      'Omdat de overheid alles betaalt',
      'Omdat ze eigenlijk geen winst willen maken'
    ],
    correct: 1,
    explanation: 'Als een online dienst gratis is, betaal je vaak met je aandacht en je persoonlijke gegevens voor advertenties.'
  },
  {
    id: 'm3-8',
    category: 'media-3',
    badge: '⚡ 3e Graad • AI Hallucinaties',
    question: 'Je vraagt aan een AI-chatbot iets voor je spreekbeurt. Waarom moet je het antwoord toch nog controleren?',
    options: [
      'AI kan overtuigend klinkende dingen verzinnen die niet kloppen (hallucinaties)',
      'AI werkt alleen na 18:00 uur',
      'AI spreekt alleen Engels',
      'AI verandert elke letter in een emoji'
    ],
    correct: 0,
    explanation: 'AI-chatbots voorspellen tekst en kunnen fouten maken of bronnen verzinnen. Check belangrijke feiten altijd na!'
  },
  {
    id: 'm3-9',
    category: 'media-3',
    badge: '⚡ 3e Graad • Sexting & Respect',
    question: 'Iemand stuurt jou een privéfoto door die niet voor jou bedoeld was, om die persoon uit te lachen. Wat doe je?',
    options: [
      'Verwijderen, niet doorsturen en melden bij een vertrouwenspersoon',
      'Opslaan voor later',
      'Doorsturen naar één beste vriend',
      'Er een sticker op plakken en posten'
    ],
    correct: 0,
    explanation: 'Privéfoto’s zonder toestemming doorsturen is kwetsend én strafbaar. Stop de verspreiding meteen!'
  },
  {
    id: 'm3-10',
    category: 'media-3',
    badge: '⚡ 3e Graad • Cookies',
    question: 'Wanneer je op een website op "Alles accepteren" klikt bij de cookiebanner, wat geef je dan meestal toestemming voor?',
    options: [
      'Dat ze koekjes thuisbezorgen',
      'Dat jouw surfgedrag gevolgd mag worden voor statistieken en reclame',
      'Dat je computer sneller wordt',
      'Dat je geen wachtwoorden meer nodig hebt'
    ],
    correct: 1,
    explanation: 'Tracking-cookies volgen welke pagina’s je bezoekt. Je mag gerust kiezen voor "Alleen noodzakelijke cookies"!'
  },
  {
    id: 'm3-11',
    category: 'media-3',
    badge: '⚡ 3e Graad • Lootboxes',
    question: 'Wat hebben "lootboxes" (verrassingskistjes met echt geld) in videogames gemeen met gokken?',
    options: [
      'Je weet vooraf altijd precies wat je krijgt',
      'Je betaalt echt geld voor een kans op een zeldzaam item, zonder zekerheid',
      'Ze zijn alleen bedoeld voor wiskunde',
      'Je kunt ze alleen openen met een echte sleutel'
    ],
    correct: 1,
    explanation: 'Lootboxes werken met kansen en beloningen, net als gokspellen, en kunnen ervoor zorgen dat spelers veel geld uitgeven.'
  },
  {
    id: 'm3-12',
    category: 'media-3',
    badge: '⚡ 3e Graad • Beeldmanipulatie',
    question: 'Hoe kun je op sociale media checken of een schokkende nieuwsfoto écht vandaag gemaakt is?',
    options: [
      'Kijken hoeveel reacties eronder staan',
      'Een "omgekeerd zoeken op afbeelding" (Reverse Image Search) doen',
      'Het scherm helderder zetten',
      'De foto uitvergroten tot je pixels ziet'
    ],
    correct: 1,
    explanation: 'Met omgekeerd zoeken op afbeelding zie je of een foto al jaren geleden ergens anders is gemaakt!'
  },

  /* =========================================================
     ALGEMENE KENNIS LAGER ONDERWIJS (BONUS CATEGORIE)
     ========================================================= */
  {
    id: 'ak-1',
    category: 'algemeen',
    badge: '🌍 Ruimte & Planeten',
    question: 'Welke planeet in ons zonnestelsel staat het DICHTST bij de zon?',
    options: ['Venus', 'Mars', 'Mercurius', 'Jupiter'],
    correct: 2,
    explanation: 'Mercurius is de kleinste planeet en staat het dichtst bij de zon!'
  },
  {
    id: 'ak-2',
    category: 'algemeen',
    badge: '🦁 Natuur & Dieren',
    question: 'Welk dier is het grootste zoogdier op aarde?',
    options: ['De Afrikaanse olifant', 'De blauwe vinvis', 'De giraffe', 'De witte haai'],
    correct: 1,
    explanation: 'De blauwe vinvis kan wel 30 meter lang worden en is het grootste dier dat ooit op aarde heeft geleefd!'
  },
  {
    id: 'ak-3',
    category: 'algemeen',
    badge: '🗺️ Aardrijkskunde',
    question: 'Hoe heet de langste rivier die door België en Nederland naar de Noordzee stroomt? (Hint: begint met een M of R)',
    options: ['De Schelde', 'De Rijn', 'De Amazone', 'De Nijl'],
    correct: 1,
    explanation: 'De Rijn (ca. 1.233 km) is een van de langste rivieren van Europa en mondt uit in Nederland!'
  },
  {
    id: 'ak-4',
    category: 'algemeen',
    badge: '🔬 Wetenschap',
    question: 'Welk gas hebben planten vooral nodig om te groeien en zuurstof te maken?',
    options: ['Helium', 'Koolstofdioxide (CO2)', 'Stikstof', 'Waterstof'],
    correct: 1,
    explanation: 'Via fotosynthese nemen planten CO2 op en geven ze zuurstof terug aan de lucht!'
  },
  {
    id: 'ak-5',
    category: 'algemeen',
    badge: '🏛️ Geschiedenis',
    question: 'Wie bouwden duizenden jaren geleden de beroemde piramides in Egypte?',
    options: ['De Vikingen', 'De Romeinen', 'De Oude Egyptenaren', 'De Grieken'],
    correct: 2,
    explanation: 'De Oude Egyptenaren bouwden de piramides als graven voor hun farao’s, zoals Toetanchamon en Cheops.'
  },
  {
    id: 'ak-6',
    category: 'algemeen',
    badge: '🧮 Rekenen & Tijd',
    question: 'Hoeveel minuten zitten er in 2 uur en een kwartier?',
    options: ['120 minuten', '135 minuten', '145 minuten', '150 minuten'],
    correct: 1,
    explanation: '2 uur = 120 minuten. Een kwartier = 15 minuten. Samen is dat 135 minuten!'
  },
  {
    id: 'ak-7',
    category: 'algemeen',
    badge: '🎵 Kunst & Muziek',
    question: 'Hoeveel snaren heeft een standaard gitaar?',
    options: ['4 snaren', '5 snaren', '6 snaren', '8 snaren'],
    correct: 2,
    explanation: 'Een klassieke of elektrische gitaar heeft meestal 6 snaren (E-A-D-G-B-E).'
  },
  {
    id: 'ak-8',
    category: 'algemeen',
    badge: '🌿 Menselijk Lichaam',
    question: 'Welk orgaan pompt het bloed door heel je lichaam?',
    options: ['De longen', 'Het hart', 'De maag', 'De nieren'],
    correct: 1,
    explanation: 'Je hart is een sterke spier die dag en nacht bloed rondpompt door je bloedvaten.'
  },
  {
    id: 'ak-9',
    category: 'algemeen',
    badge: '📖 Taal & Spelling',
    question: 'Welk woord is een bijvoeglijk naamwoord in de zin: "De snelle hond rent over het gras"?',
    options: ['hond', 'rent', 'snelle', 'gras'],
    correct: 2,
    explanation: '"Snelle" zegt iets over het zelfstandig naamwoord "hond" en is dus een bijvoeglijk naamwoord!'
  },
  {
    id: 'ak-10',
    category: 'algemeen',
    badge: '🐝 Natuur',
    question: 'Hoeveel poten heeft een insect (zoals een mier of een bij)?',
    options: ['4 poten', '6 poten', '8 poten', '10 poten'],
    correct: 1,
    explanation: 'Alle insecten hebben 6 poten! Spinnen hebben 8 poten en zijn daarom geen insecten.'
  },
  {
    id: 'ak-11',
    category: 'algemeen',
    badge: '❄️ Natuurkunde',
    question: 'Bij welke temperatuur bevriest zuiver water en wordt het ijs?',
    options: ['-10 graden Celsius', '0 graden Celsius', '10 graden Celsius', '100 graden Celsius'],
    correct: 1,
    explanation: 'Water bevriest bij 0 °C en kookt bij 100 °C!'
  },
  {
    id: 'ak-12',
    category: 'algemeen',
    badge: '🌍 Werelddelen',
    question: 'Op welk werelddeel leven de meeste pinguïns in het wild?',
    options: ['Europa', 'Antarctica (Zuidpool)', 'Noord-Amerika', 'Azië'],
    correct: 1,
    explanation: 'Pinguïns leven op het zuidelijk halfrond, vooral op het ijzige Antarctica!'
  }
];
