export type Lang = "en" | "pt";

export const SUPPORTED_LANGS: Lang[] = ["en", "pt"];
export const DEFAULT_LANG: Lang = "en";

export type Dict = {
  tabs: {
    today: string;
    sessions: string;
    map: string;
    coach: string;
    profile: string;
    overview: string;
    athletes: string;
    earnings: string;
    settings: string;
  };
  map: {
    title: string;
    scrollHint: string;
    body: string;
    bodyCoach: string;
    tokenNote: string;
  };
  coach: {
    title: string;
    subtitle: string;
  };
  profile: {
    title: string;
    signOut: string;
  };
};
