# Angular Frontend

Deze README beschrijft de structuur en organisatie van de What's Right frontend applicatie.

## Projectstructuur

### Hoofdmappen in `src/`

```
src/
├── app/                    # Applicatie code
├── assets/                 # Statische bestanden
├── environments/           # Omgevingsconfiguratie
└── scss/                   # Globale styling
```

#### `assets/`
De assets map bevat alle statische bestanden die in de applicatie worden gebruikt. Hier vind je de aangepaste lettertypen voor de applicatie evenals alle afbeeldingen die op de website worden weergegeven.

#### `environments/`
In deze map staan configuratiebestanden voor verschillende omgevingen zoals staging, acceptatie en productie. Elk omgevingsbestand bevat de DNS-gegevens en configuratie voor de bijbehorende backend, waardoor de applicatie gemakkelijk kan worden gedeployeerd naar verschillende omgevingen.

#### `scss/`
Deze map bevat globale styling die door de gehele applicatie wordt toegepast. Hierin vind je CSS variabelen voor consistente styling en herbruikbare custom classes die in verschillende componenten kunnen worden gebruikt.

### Applicatie code in `app/`

```
app/
├── constants/           # Constante waarden
├── domains/             # Gedeelde componenten
├── pages/               # Pagina componenten
├── services/            # Backend communicatie
└── types/               # TypeScript type definities
```

#### `constants/`
De constants map bevat constante waarden die door de applicatie worden gebruikt. Dit omvat onder andere kleur mappings voor consistente UI en andere configuratie waarden die niet veranderen tijdens runtime.

#### `domains/`
Deze map bevat gedeelde, herbruikbare componenten die op meerdere pagina's worden gebruikt. Denk hierbij aan verschillende button componenten, form inputs zoals input velden, dropdowns en checkboxes, en andere UI componenten zoals modals, tooltips en navigatie elementen.

#### `pages/`
De pages map bevat per pagina een eigen component. Elke pagina kan een eigen components subfolder hebben, maar deze componenten zijn uitsluitend bedoeld voor die specifieke pagina en worden nergens anders gebruikt.

```
pages/
├── benchmark-results/
│   ├── components/          # Pagina-specifieke componenten
│   ├── benchmark-results.component.ts
│   ├── benchmark-results.component.html
|   └── benchmark-results.component.scss
│   
├── landing-page/
│   ├── modals/              # Pagina-specifieke modals
│   ├── profile.component.ts
│   └── ...
```

#### `services/`
De services map bevat per categorie een service die communicatie met de backend afhandelt. Deze services zijn georganiseerd per functionaliteit en zorgen voor data ophalen via API calls, data verwerking door transformatie van backend data, en state management voor het beheer van applicatie state. Services worden geïnjecteerd in componenten om vervolgens data op te vragen en weer te geven.

#### `types/`
In de types map staan alle TypeScript type definities die zorgen voor type-safety in de applicatie. Dit omvat types voor backend objecten die vanuit de backend komen, frontend interfaces voor component props en state, en utility types voor herbruikbare type definities. Deze types zorgen voor type-safety in zowel HTML templates als TypeScript bestanden.

## Ontwikkelrichtlijnen

### Componentorganisatie
Gedeelde componenten worden geplaatst in de domains map, terwijl pagina-specifieke componenten thuishoren in de bijbehorende pages/[pagina]/components/ folder. Componenten dienen klein en gefocust te blijven op één verantwoordelijkheid.

### Styling
Voor styling maken we gebruik van globale SCSS variabelen en classes waar mogelijk. Component-specifieke styling wordt geplaatst in de bijbehorende .scss bestanden. Consistentie wordt gewaarborgd door gebruik van de gedefinieerde design tokens.

### Services en Types
Per backend categorie wordt een eigen service gemaakt. Types worden gedefinieerd voor alle data die tussen frontend en backend wordt uitgewisseld. TypeScript strict mode wordt gebruikt voor maximale type-safety.

## Installatie en Development

Om aan de slag te gaan met development, installeer eerst de dependencies met `npm install`. Voor lokale development kan de applicatie worden opgestart met `ng serve`, welke standaard op poort 4200 draait en toegankelijk is via http://localhost:4200.

Voor productie deployment wordt gebruik gemaakt van de Dockerfile om de applicatie te containeriseren en vervolgens op een productie server te draaien. Dit zorgt voor een consistente en reproduceerbare deployment omgeving. De Dockerfile zou eventueel ook kunnen worden gebruikt voor lokale development, zodat de applicatie draait in een container met alle benodigde dependencies. Hiervoor is wel een docker-compose.yml om zo live herladen mogelijk te maken tijdens development.