import type { Lang } from "../../data/siteContent";
import type { PlaceSelection } from "../../types/places";

export type StructureCategory = "informal" | "partial" | "structured";
export type TimeCategory = "project" | "recurring" | "established";
export type ScopeCategory = "local" | "translocal" | "global";
export type PlaceRelationFilter = "any" | "base" | "activity";

export type FinderGroupBy =
  | "none"
  | "city"
  | "scope"
  | "structure"
  | "time"
  | "orientation";

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
  placeRelation: PlaceRelationFilter;
  country: string;
  region: string;
  city: string;
  scopes: ScopeCategory[];
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
  places?: PlaceSelection[] | null;
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
  places: PlaceSelection[];
  city: string;
  region: string;
  country: string;
  topics: string[];
  customTopics: string[];
  ranking: string[];
  values: FinderValues;
  actsVirtually: boolean;
  scopeCategory: ScopeCategory;
  structure: StructureCategory;
  timeCategory: TimeCategory;
};

export type FinderGroup = {
  key: string;
  label: string;
  collectives: FinderCollective[];
};
