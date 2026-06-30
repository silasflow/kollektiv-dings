export type Lang = 'de' | 'en';

export const languages: Lang[] = ['de', 'en'];

export const siteContent = {
  de: {
    meta: {
      title: 'Stadt Kollektiv',
      description: 'Ein Framework-Tool für urbane Kollektive.',
    },
    nav: {
      test: 'Test Starten',
      caseStudies: 'Case Studies',
      about: 'Über das Tool',
      languageLabel: 'EN',
      
    },
    hero: {
      titleLine1: 'Die Stadt',
      titleLine2: 'der Zukunft',
      highlight: 'Kollektiv',
      titleLine3: 'gestalten',
      description: 'Ein Selbstcheck für urbane Kollektive: Ordnet euch ein, macht eure Wirkung sichtbar und erkennt, wo ihr Unterstützung braucht.',
      testDescription: 'Du bist selbst Teil eines Kollektivs? Mache jetzt den Kollektiv-Personality-Test.',
      buttonLabel: 'Test starten',
    },
  },

  en: {
    meta: {
      title: 'City Collective',
      description: 'A framework tool for urban collectives.',
    },
    nav: {
      test: 'Start Test',
      caseStudies: 'Case Studies',
      about: 'About the tool',
      languageLabel: 'DE',
      
    },
    hero: {
      titleLine1: 'Shaping',
      titleLine2: 'the city',
      highlight: 'collectively',
      titleLine3: 'of tomorrow',
      description: 'A self-check for urban collectives: understand your role, make your impact visible and identify where support is needed.',
      testDescription: 'You are part of a collective? Take the Collective Personality Test now.',
      buttonLabel: 'Start test',
    },
  },
} as const;