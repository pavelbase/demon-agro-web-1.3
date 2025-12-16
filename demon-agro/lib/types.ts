export interface Product {
  id: string;
  nazev: string;
  popis: string;
  kategorie: "ph" | "sira" | "k" | "mg" | "analyza";
  dostupnost: boolean;
  technicke_parametry: Record<string, string>;
  fotka_url: string;
}

export interface PageContent {
  hero_nadpis: string;
  hero_podnadpis: string;
  problem_nadpis?: string;
  problem_obsah?: string;
  dopad_nadpis?: string;
  dopad_obsah?: string;
  reseni_nadpis?: string;
  reseni_obsah?: string;
  kdo_jsme_nadpis?: string;
  kdo_jsme_text?: string;
  nase_mise_nadpis?: string;
  nase_mise_text?: string;
  cta_nadpis?: string;
  cta_text?: string;
  privacy_text?: string;
}

export interface ImageUrls {
  home_hero: string;
  home_kroky_bg: string;
  ph_hero: string;
  ph_problem_img: string;
  ph_dopad_bg: string;
  sira_hero: string;
  sira_problem_img: string;
  sira_dopad_bg: string;
  k_hero: string;
  k_problem_img: string;
  k_dopad_bg: string;
  mg_hero: string;
  mg_problem_img: string;
  mg_dopad_bg: string;
  analyza_hero: string;
  analyza_problem_img: string;
  analyza_dopad_bg: string;
  onas_hero: string;
  onas_kdo_jsme_img: string;
}

export type PageKey = "home" | "ph" | "sira" | "k" | "mg" | "analyza" | "onas" | "privacy-policy";

export interface Article {
  id: string;
  slug: string;
  nadpis: string;
  kategorie: "ph" | "vapneni" | "ziviny" | "vyzkumy" | "tipy";
  perex: string;
  obsah: string; // Markdown format
  obrazek_url: string;
  datum_publikace: string; // ISO date string
  cas_cteni: number; // minuty
  publikovano: boolean;
  autor: string;
  meta_description: string;
}
