// src/data/testQuestions.ts

import type { Lang } from './siteContent';

type LocalizedText = Record<Lang, string>;

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

export type TestQuestion = SliderQuestion | RankingQuestion;


/* Frage 1*/

export const testQuestions: TestQuestion[] = [
  {
    id: 'formalization',
    type: 'slider',
    graphic: 'diamond',
    category: {
      de: '1/5 Formalisierung',
      en: '1/5 Formalization',
    },
    title: {
      de: 'Wie sind die Strukturen und Entscheidungsprozesse in eurem Kollektiv organisiert?',
      en: 'How are the structures and decision-making processes organised within your collective??',
    },
    valueLabels: [
      {
        min: 0,
        max: 33,
        label: {
          de: 'Informell',
          en: 'Informal',
        }
      },
      {
        min: 34,
        max: 66,
        label: {
          de: 'Teilweise formalisiert',
          en: 'Partially formalized',
        }
      },
      {
        min: 67,
        max: 100,
        label: {
          de: 'Formalisiert',
          en: 'Formalized',
        }
      }
    ],
    minLabel: {
      de: 'informell',
      en: 'Informal',
    },
    maxLabel: {
      de: 'Formalisiert',
      en: 'Formalized',
    },
    answerTexts: [
      {
        min: 0,
        max: 33,
        text: {
          de: 'Wir handeln spontan und flexibel – ohne feste Regeln, Statuten oder formelle Führungsstrukturen. Unsere Praktiken entwickeln sich durch direkte Aushandlung.',
          en: 'We act spontaneously and flexibly – without fixed rules, statutes or formal management structures. Our practices evolve through direct negotiation.',
        },
      },
      {
        min: 34,
        max: 66,
        text: {
          de: 'Wir haben bereits einige feste Abläufe und Rollen, aber keine formale Satzung oder Rechtspersönlichkeit. Entscheidungen werden gemeinsam ausgehandelt, und es gibt erste bürokratische Elemente.',
          en: 'We already have a number of established procedures and roles, but no formal constitution or legal status. Decisions are negotiated collectively, and the first signs of bureaucracy are beginning to emerge.',
        },
      },
      {
        min: 67,
        max: 100,
        text: {
          de: 'Unser Kollektiv ist klar strukturiert: Wir haben Statuten, feste Mitgliedschaftskriterien und formelle Entscheidungsgremien. Unsere Prozesse sind institutionalisiert und bürokratisch verankert.',
          en: 'Our collective is clearly structured: we have a constitution, fixed membership criteria and formal decision-making bodies. Our processes are institutionalised and embedded within a bureaucratic framework.',
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
      de: '2/5 Zeit',
      en: '2/5 Time',
    },
    title: {
      de: 'Wie lange und in welchem Rhythmus agiert euer Kollektiv?',
      en: 'How long has your collective been active, and how often do you meet?',
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
          de: 'regelmäßig',
          en: 'regularly',
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
          de: 'Unser Kollektiv entsteht spontan und löst sich schnell wieder auf – wir handeln kurzfristig und ungeplant.',
          en: 'Our collective comes together spontaneously and quickly disbands again – we act on the spur of the moment and without planning.',
        },
      },
      {
        min: 34,
        max: 66,
        text: {
         de: 'Unser Kollektiv hat einen klaren Zeitrahmen oder kehrt regelmäßig zurück – z. B. für Projekte oder jährliche Events.',
         en: 'Our collective has a clear timeframe or meets regularly – for example, for projects or annual events.',
   },
      },
      {
        min: 67,
        max: 100,
        text: {
          de: 'Unser Kollektiv besteht dauerhaft und hat langfristige Strukturen.',
          en: 'Our collective is permanent and has long-term structures.',
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
      de: '3/5 Identität',
      en: '3/5 Identity',
    },
    title: {
      de: 'Wie stark ausgeprägt ist die gemeinsame Identität in eurem Kollektiv?',
      en: 'How strong is the shared identity in your collective?',
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
          de: 'geteilte Werte',
          en: 'shared values',
        },
      },
      {
        min: 51,
        max: 75,
        label: {
          de: 'stabile Identität',
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
          de: 'Unsere Identität basiert auf sozialen Kontakten – wir haben ein gemeinsames Erlebnis oder Ziel, aber noch keine festen Strukturen.',
          en: 'Our identity is based on social contacts – we share an experience or a goal, but do not yet have any fixed structures.',
        },
      },
      {
        min: 26,
        max: 50,
        text: {
         de: 'Wir haben ein klares Problembewusstsein und einen geteilten Konsens, der unser Handeln leitet – auch wenn es manchmal Konflikte gibt.',
         en: 'We have a clear awareness of the problem and a shared consensus that guides our actions – even if there are sometimes conflicts.',
   },
      },
      {
        min: 51,
        max: 75,
        text: {
          de: 'Unsere Identität ist stabil: Wir haben ein starkes Wir-Gefühl, feste Strukturen und institutionalisierte Positionen.',
          en: 'Our identity is stable: we have a strong sense of togetherness, solid structures and institutionalised roles.',
        },
      },
       {
        min: 76,
        max: 100,
        text: {
          de: 'Unsere Identität ist etabliert: Wir haben eine geteilte Geschichte, ein Narrativ und werden als Kollektiv anerkannt.',
          en: 'Our identity is well established: we share a common history and narrative, and are recognised as a collective.',
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
      de: '4/5 Räumliche Verortung',
      en: '4/5 Spatial Placement',
    },
    title: {
      de: 'Wie ist euer Kollektiv räumlich verankert?',
      en: 'Where is your collective based?',
    },
    valueLabels: [
      {
        min: 0,
        max: 50,
        label: {
          de: 'lokal',
          en: 'local',
        },
      },
      {
        min: 51,
        max: 100,
        label: {
          de: 'virtuell',
          en: 'virtual',
        },
      },
    {
        min: 51,
        max: 100,
        label: {
      de: 'lokal',
      en: 'local',
    },
},
    {
        min: 51,
        max: 100,
        label: {
      de: 'virtuell',
      en: 'virtual',
    },
    }
    ],
    minLabel: {
      de: 'lokal',
      en: 'local',
    },
    maxLabel: {
      de: 'virtuell',
      en: 'virtual',
    },  

    answerTexts: [
      {
        min: 0,
        max: 25,
        text: {
          de: 'Unser Kollektiv ist lokal verankert – unser Handeln und unsere Identität sind an einen konkreten Ort gebunden.',
          en: 'Our collective has strong local roots – our actions and our identity are tied to a specific place.',
        },
      },
      {
        min: 26,
        max: 50,
        text: {
         de: 'Unser Kollektiv verbindet mehrere lokale Räume.',
         en: 'Our collective brings together several local spaces.',
   },
      },
      {
        min: 51,
        max: 75,
        text: {
          de: 'Unser Kollektiv hat globale Reichweite und ist in mehreren Nationen vertreten.',
          en: 'Our collective has global reach and is represented in several countries.',
        },
      },
       {
        min: 76,
        max: 100,
        text: {
          de: 'Unser Kollektiv agiert primär digital und ist nicht an physische Räume gebunden.',
          en: 'Our collective primarily operates online and is not bound to physical spaces.',
        },
      },
    ],
  },
  {
    id: 'goals',
    type: 'ranking',
    graphic: 'goals',
    category: {
      de: '5/5 Ziele',
      en: '5/5 Goals',
    },
    title: {
      de: 'Wie sieht das primäre Ziel eures Kollektivs aus?',
      en: 'What is the primary goal of your collective?',
    },
    description: {
      de: 'Wählt die Ziele aus, die für euer Kollektiv besonders wichtig sind.',
      en: 'Select the goals that are especially important for your collective.',
    },
    options: [
      {
        id: 'political',
        label: {
          de: 'Konfliktorientiert',
          en: 'Conflict-oriented',
        },
      },
      {
        id: 'economic',
        label: {
          de: 'Ökonomisch',
          en: 'Economic',
        },
      },
      {
        id: 'creative',
        label: {
          de: 'Kreativ',
          en: 'Creative',
        },
      },
      {
        id: 'social',
        label: {
          de: 'Sozial',
          en: 'Social',
        },
      },
    ],
    allowOwnAnswer: true,
  },
];