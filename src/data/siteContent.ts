export type Lang = 'de' | 'en';

export const languages: Lang[] = ['de', 'en'];

export const siteContent = {
  de: {
    meta: {
      title: 'Stadt Kollektiv',
      description: 'Ein Selbstcheck für urbane Kollektive und Stadtmacher:innen.',
    },
    nav: {
      test: 'Check starten',
      case: 'Case Studies',
      about: 'Über das Tool',
      languageLabel: 'EN',
    },
    hero: {
      titleLine1: 'Unsere Stadt',
          highlight: 'Kollektiv',
      titleLine3: 'gestalten',

      intro: [
        'Stadt wird nicht nur geplant – sie wird gemacht: von Stadtmacher:innen, die sich zusammenschließen, Verantwortung übernehmen und neue Formen des Zusammenlebens erproben.',
        'Urbane Kollektive schaffen Räume, stärken Gemeinschaften und geben Impulse für eine Stadtentwicklung von unten. Dieses Tool macht sichtbar, wie sie organisiert sind, wofür sie stehen und wie sie Stadt mitgestalten.',
      ],

      testTitle: 'Mache jetzt den',
      testHighlight: ' Kollektiv-Check',
      testDescription: [
        'Der Check ist an die Idee von Personality-Tests angelehnt und überträgt sie auf urbane Kollektive. Über verschiedene Dimensionen macht er sichtbar, welche Werte, Arbeitsweisen und Wirkungslogiken euch prägen.',
        'Es geht nicht darum, euch in Schubladen zu stecken, sondern euren kollektiven Charakter greifbar und besprechbar zu machen.',
      ],
      testHint: 'Nehmt euch etwa 10 Minuten – allein oder gemeinsam.',
      buttonLabel: 'Check starten',
    },
  },

  en: {
    meta: {
      title: 'City Collective',
      description: 'A self-check tool for urban collectives and city-makers.',
    },
    nav: {
      test: 'Start check',
      case: 'Case Studies',
      about: 'About the tool',
      languageLabel: 'DE',
    },
    hero: {
      titleLine1: 'Shaping',
      titleLine2: 'our city',
      highlight: 'collectively',

      intro: [
        'Cities are not only planned – they are made: by city-makers who come together, take responsibility and experiment with new ways of living together.',
        'Urban collectives create spaces, strengthen communities and give impulses for city-making from below. This tool makes visible how they are organised, what they stand for and how they help shape the city.',
      ],

      testTitle: 'Start the',
      testHighlight: 'Collective Check',
      testDescription: [
        'The check is inspired by the idea of personality tests and translates it into a format for urban collectives. Through different dimensions, it makes visible which values, ways of working and modes of impact shape your collective.',
        'It is not about putting you into fixed categories, but about making your collective character easier to understand and discuss.',
      ],
      testHint: 'Take around 10 minutes – alone or together.',
      buttonLabel: 'Start check',
    },
  },
} as const;