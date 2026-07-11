// src/data/testQuestions.ts

import type { Lang } from './siteContent';

type LocalizedText = Record<Lang, string>;

export type TestAnswerValue = number | string[] | boolean | string;

export type TestAnswers = Record<string, TestAnswerValue>;

export type SliderValueLabel = {
  min: number;
  max: number;
  label: LocalizedText;
};

export type SliderAnswerText = {
  min: number;
  max: number;
  text: LocalizedText;
};

export type SliderQuestion = {
  id: string;
  type: 'slider';
  graphic: 'diamond' | 'timeline' | 'cluster' | 'map';
  category: LocalizedText;
  title: LocalizedText;
  minLabel: LocalizedText;
  maxLabel: LocalizedText;
  valueLabels: SliderValueLabel[];
  answerTexts: SliderAnswerText[];
};

export type RankingOption = {
  id: string;
  label: LocalizedText;
  description?: LocalizedText;
};

export type RankingQuestion = {
  id: string;
  type: 'ranking';
  graphic: 'goals';
  category: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  options: RankingOption[];
  allowOwnAnswer?: boolean;
};

export type GoalOptionsQuestion = {
  id: string;
  type: 'goal-options';
  category: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  options: RankingOption[];
  ownAnswerLabel: LocalizedText;
  ownAnswerPlaceholder: LocalizedText;
};

export type TestQuestion = SliderQuestion | RankingQuestion | GoalOptionsQuestion;


/* Frage 1*/

export const testQuestions: TestQuestion[] = [
  {
    id: 'formalization',
    type: 'slider',
    graphic: 'diamond',
    category: {
      de: '1/6 Formalisierung',
      en: '1/6 Formalization',
    },
    title: {
      de: 'Wie trefft ihr Entscheidungen und wie sind eure Regeln?',
      en: 'How do you make decisions and what are your rules?',
    },
    valueLabels: [
      {
        min: 0,
        max: 33,
        label: {
          de: 'zwanglos',
          en: 'informal',
        }
      },
      {
        min: 34,
        max: 66,
        label: {
          de: 'teilweise strukturiert',
          en: 'partially structured',
        }
      },
      {
        min: 67,
        max: 100,
        label: {
          de: 'komplett strukturiert',
          en: 'Fully structured',
        }
      }
    ],
    minLabel: {
      de: 'zwanglos',
      en: 'Informal',
    },
    maxLabel: {
      de: 'komplett strukturiert',
      en: 'Fully structured',
    },
    answerTexts: [
      {
        min: 0,
        max: 33,
        text: {
          de: 'Wir machen einfach, was gerade nötig ist – ohne feste Regeln oder Rollen. Alles wird einfach besprochen.',
          en: 'We just do what is needed at the moment – without fixed rules or roles. Everything is simply discussed.',
        },
      },
      {
        min: 34,
        max: 66,
        text: {
          de: 'Wir haben ein paar feste Abläufe und Rollen, aber keine offizielle Satzung. Entscheidungen treffen wir gemeinsam.',
          en: 'We have some fixed processes and roles, but no official constitution. We make decisions together.',
        },
      },
      {
        min: 67,
        max: 100,
        text: {
          de: 'Wir haben klare Regeln, eine Art Satzung, Mitgliedschaftsbedingungen oder offizielle Rollen. Alles ist fest strukturiert.',
          en: 'We have clear rules, a kind of constitution, membership conditions or official roles. Everything is firmly structured.',
        },
      },

    ],
  },
  /* Frage 2*/
  {
    id: 'time',
    type: 'slider',
    graphic: 'timeline',
    category: {
      de: '2/6 Zeit',
      en: '2/6 Time',
    },
    title: {
      de: 'Wie lange existiert euer Kollektiv und wie oft kommt ihr zusammen?',
      en: 'How long has your collective existed and how often do you meet?',
    },
    valueLabels: [
      {
        min: 0,
        max: 33,
        label: {
          de: 'spontan',
          en: 'spontaneously.',
        }
      },
      {
        min: 34,
        max: 66,
        label: {
          de: 'zeitlich begrenzt/ wiederkehrend',
          en: 'periodically',
        }
      },
      {
        min: 67,
        max: 100,
        label: {
          de: 'verstetigt',
          en: 'permanent',
        }
      }
    ],
    minLabel: {
      de: 'spontan',
      en: 'spontaneously.',
    },
    maxLabel: {
      de: 'verstetigt',
      en: 'permanent',
    },
    answerTexts: [
      {
        min: 0,
        max: 33,
        text: {
          de: 'Wir kommen spontan zusammen und lösen uns schnell wieder auf.',
          en: 'We come together spontaneously and quickly dissolve again.',
        },
      },
      {
        min: 34,
        max: 66,
        text: {
          de: 'Wir haben einen festen Zeitrahmen oder treffen uns regelmäßig – z. B. für Projekte oder Events.',
          en: 'We have a fixed time frame or meet regularly – e.g. for projects or events.',
        },
      },
      {
        min: 67,
        max: 100,
        text: {
          de: 'Uns gibt es schon länger und wir arbeiten dauerhaft zusammen.',
          en: 'We have existed for a while and work together permanently.',
        },
      },
    ],
  },
  /* Frage 3*/
  {
    id: 'identity',
    type: 'slider',
    graphic: 'timeline',
    category: {
      de: '3/6 Identität',
      en: '3/6 Identity',
    },
    title: {
      de: 'Wie sehr fühlt ihr euch als Kollektiv verbunden und wie ausgeprägt ist eure gemeinsame Identität?',
      en: 'How strongly do you feel connected as a collective and how pronounced is your shared identity?',
    },
    valueLabels: [
      {
        min: 0,
        max: 25,
        label: {
          de: 'sozialer Kontakt',
          en: 'social contact',
        },
      },
      {
        min: 26,
        max: 50,
        label: {
          de: 'geteiltes Problembewusstsein',
          en: 'shared problem awareness',
        },
      },
      {
        min: 51,
        max: 75,
        label: {
          de: 'stabilisierte Identität',
          en: 'stable identity',
        },
      },
      {
        min: 76,
        max: 100,
        label: {
          de: 'etablierte Identität',
          en: 'established identity',
        },
      },
    ],
    minLabel: {
      de: 'sozialer Kontakt',
      en: 'social contact',
    },
    maxLabel: {
      de: 'etablierte Identität',
      en: 'established identity',
    },
    answerTexts: [
      {
        min: 0,
        max: 25,
        text: {
          de: 'Wir sind durch unseren sozialen Kontakt verbunden. Was uns verbindet ist ein gemeinsames Erlebnis.',
          en: 'We are connected through our social contact. What connects us is a shared experience.',
        },
      },
      {
        min: 26,
        max: 50,
        text: {
          de: 'Wir kennen uns gut, haben ein gemeinsames Ziel, und handeln danach.',
          en: 'We know each other well, have a common goal, and act accordingly.',
        },
      },
      {
        min: 51,
        max: 75,
        text: {
          de: 'Wir haben ein starkes Wir-Gefühl, feste Strukturen und klare Positionen.',
          en: 'We have a strong sense of togetherness, established structures and clear positions.',
        },
      },
      {
        min: 76,
        max: 100,
        text: {
          de: 'Wir haben eine gemeinsame Geschichte, werden als Gruppe anerkannt und haben eine klare Identität.',
          en: 'We have a shared history, are recognized as a group and have a clear identity.',
        },
      },
    ],
  },
  /* Frage 4*/
  {
    id: 'space',
    type: 'slider',
    graphic: 'timeline',
    category: {
      de: '4/6 Räumliche Verortung',
      en: '4/6 Spatial Placement',
    },
    title: {
      de: 'Wo findet eure primär Arbeit statt?',
      en: 'Where does your primary work take place?',
    },
    valueLabels: [
      {
        min: 0,
        max: 33,
        label: {
          de: 'lokal',
          en: 'local',
        },
      },
      {
        min: 34,
        max: 66,
        label: {
          de: 'translokal',
          en: 'translocal',
        },
      },
      {
        min: 67,
        max: 100,
        label: {
          de: 'global',
          en: 'global',
        },
      },

    ],
    minLabel: {
      de: 'lokal',
      en: 'local',
    },
    maxLabel: {
      de: 'global',
      en: 'global',
    },

    answerTexts: [
      {
        min: 0,
        max: 33,
        text: {
          de: 'Wir sind an einem konkreten Ort in einer bestimmten Gegend aktiv',
          en: 'We are active in a specific place in a certain area.',
        },
      },
      {
        min: 34,
        max: 66,
        text: {
          de: 'Wir arbeiten in mehreren Orten oder Regionen zusammen.',
          en: 'We work together in several places or regions.',
        },
      },
      {
        min: 67,
        max: 100,
        text: {
          de: 'Wir sind in mehreren Ländern oder weltweit aktiv.',
          en: 'We are active in several countries or globally.',
        },
      },
    ],
  },
  {
    id: 'goals',
    type: 'ranking',
    graphic: 'goals',
    category: {
      de: '5/6 Handlungslogik',
      en: '5/6 Actions',
    },
    title: {
      de: 'Sortiert die Methoden nach ihrer Wichtigkeit für euer Kollektiv.',
      en: 'Sort the methods by their importance to your collective.',
    },
    description: {
      de: 'Wählt die Methoden aus, die für euer Kollektiv besonders wichtig sind.',
      en: 'Select the methods that are especially important for your collective.',
    },
    options: [
      {
        id: 'political',
        label: {
          de: 'Konfliktorientiert',
          en: 'Conflict-oriented',
        },
        description: {
          de: 'Wir wollen auf Probleme aufmerksam und Konflikte sichtbar machen.',
          en: 'We want to raise awareness of problems and make conflicts visible.',
        },
      },
      {
        id: 'economic',
        label: {
          de: 'Ökonomisch',
          en: 'Economic',
        },
        description: {
          de: 'Unser Fokus liegt auf wirtschaftlichen Zielen – z. B. gemeinsame Projekte oder Geschäfte.',
          en: 'Our focus is on economic goals – for example, joint projects or businesses.',
        },
      },
      {
        id: 'creative',
        label: {
          de: 'Kreativ',
          en: 'Creative',
        },
        description: {
          de: 'Wir wollen kreativ sein und künstlerisch oder experimentell arbeiten.',
          en: 'We want to be creative and work artistically or experimentally.',
        },
      },
      {
        id: 'social',
        label: {
          de: 'Sozial',
          en: 'Social',
        },
        description: {
          de: 'Uns geht es um gegenseitige Unterstützung und das Pflegen einer Gemeinschaft.',
          en: 'We are focused on mutual support and nurturing a community.',
        },
      },
      {
        id: 'ecological',
        label: {
          de: 'Ökologisch',
          en: 'Ecological',
        },
        description: {
          de: 'Wir setze uns für unsere Natur und Umwelt ein. ',
          en: 'We are committed to our nature and environment.',
        },
      },
    ],
    allowOwnAnswer: true,
  },
  {
    id: 'goalTopics',
    type: 'goal-options',
    category: {
      de: 'Eure Themen 6/6',
      en: 'Your Topics 6/6',
    },
    title: {
      de: 'Welche der Themen passen zu eurem Kollektiv?',
      en: 'Which topics match your collective?',
    },
    description: {
      de: 'Wählt aus, welche Themen oder Ziele für euer Kollektiv wichtig sind. Ihr könnt mehrere auswählen oder die Frage überspringen.',
      en: 'Select the topics or goals that matter to your collective. You can choose multiple options or skip this question.',
    },
    options: [
      {
        id: 'climate',
        label: {
          de: 'Klima',
          en: 'Climate',
        },
      },
      {
        id: 'encounter',
        label: {
          de: 'Begegnung',
          en: 'Encounter',
        },
      },
      {
        id: 'sport',
        label: {
          de: 'Sport',
          en: 'Sports',
        },
      },
      {
        id: 'political_topic',
        label: {
          de: 'Politisch',
          en: 'Political',
        },
      },
      {
        id: 'equality',
        label: {
          de: 'Gleichberechtigung',
          en: 'Equality',
        },
      },
      {
        id: 'health',
        label: {
          de: 'Gesundheit',
          en: 'Health',
        },
      },
    ],
    ownAnswerLabel: {
      de: 'Eigene Antwort',
      en: 'Own answer',
    },
    ownAnswerPlaceholder: {
      de: 'Eigenes Ziel ergänzen',
      en: 'Add your own goal',
    },
  },
];