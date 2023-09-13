export interface ILanguages {
    de: ILanguage;
    en: ILanguage;
    es: ILanguage;
    fr: ILanguage;
    it: ILanguage;
    pt: ILanguage;
    ru: ILanguage;
    uk: ILanguage;
}

export interface ILanguages {
    [key: string]: ILanguage;
  }

export interface ILanguage {
    name:  string;
    emoji: string;
    code:  string;
}
