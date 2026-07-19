import type { Lang } from '../../data/siteContent';

export type StructureCategory = 'informal' | 'partial' | 'structured';
export type TimeCategory = 'project' | 'recurring' | 'established';
export type FinderGroupBy = 'none' | 'city' | 'structure' | 'time' | 'orientation';

export type FinderOption = {
  id: string;
  label: string;
};

export type FinderValues = {
  formalization: number;
  time: number;
  identity: number;
  space: number;
};

export type FinderFilterState = {
  query: string;
  topics: string[];
  city: string;
  region: string;
  structures: StructureCategory[];
  times: TimeCategory[];
  orientations: string[];
  digitalOnly: boolean;
};

export type RawTestResult = {
  id?: string;
  createdAt?: string;
  lang?: Lang;
  collectiveName?: string | null;
  website?: string | null;
  instagram?: string | null;
  websiteOrInstagram?: string | null;
  location?: string | null;
  region?: string | null;
  country?: string | null;
  consentPublic?: boolean;
  answers?: Record<string, unknown>;
  result?: {
    archetypeId?: string;
    values?: Partial<FinderValues>;
    networkShape?: Partial<FinderValues> & {
      actsVirtually?: boolean;
      goalRanking?: string[];
    };
    selectedAnswerIds?: {
      actsVirtually?: boolean;
      goalRanking?: string[];
      primaryGoal?: string;
    };
    goalDetails?: {
      selectedGoalTopics?: string[];
      ownGoalTopics?: string[];
    };
    graphic?: {
      rankingOrder?: string[];
    };
  };
};

export type FinderCollective = {
  id: string;
  createdAt: string;
  collectiveName: string;
  website: string | null;
  instagram: string | null;
  city: string;
  region: string;
  country: string;
  topics: string[];
  customTopics: string[];
  ranking: string[];
  values: FinderValues;
  actsVirtually: boolean;
  structure: StructureCategory;
  timeCategory: TimeCategory;
};

export type FinderGroup = {
  key: string;
  label: string;
  collectives: FinderCollective[];
};
