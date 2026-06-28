export type Lang = 'de' | 'en';

export const languages: Lang[] = ['de', 'en'];

export const siteContent = {
  de: {
    meta: {
      title: 'Stadt Kollektiv',
      description: 'Ein Framework-Tool für urbane Kollektive.',
    },
    nav: {
      test: 'Test',
      caseStudies: 'Case Studies',
      about: 'Über das Tool',
      languageLabel: 'EN',
      
    },
    hero: {
      titleLine1: 'Die Stadt',
      titleLine2: 'der Zukunft',
      highlight: 'Kollektiv',
      titleLine3: 'gestalten',
      text: 'Ein Selbstcheck für urbane Kollektive: Ordnet euch ein, macht eure Wirkung sichtbar und erkennt, wo ihr Unterstützung braucht.',
      buttonLabel: 'Test starten',
    },
  },

  en: {
    meta: {
      title: 'City Collective',
      description: 'A framework tool for urban collectives.',
    },
    nav: {
      test: 'Test',
      caseStudies: 'Case Studies',
      about: 'About the tool',
      languageLabel: 'DE',
      
    },
    hero: {
      titleLine1: 'Shaping',
      titleLine2: 'the city',
      highlight: 'collectively',
      titleLine3: 'of tomorrow',
      text: 'A self-check for urban collectives: understand your role, make your impact visible and identify where support is needed.',
      buttonLabel: 'Start test',
    },
  },
} as const;