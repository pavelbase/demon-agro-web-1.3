// České okresy pro dopravní zóny

export const CZECH_DISTRICTS = [
  // Hlavní město Praha
  { value: 'praha', label: 'Praha', region: 'Hlavní město Praha' },
  
  // Středočeský kraj
  { value: 'benešov', label: 'Benešov', region: 'Středočeský' },
  { value: 'beroun', label: 'Beroun', region: 'Středočeský' },
  { value: 'kladno', label: 'Kladno', region: 'Středočeský' },
  { value: 'kolín', label: 'Kolín', region: 'Středočeský' },
  { value: 'kutná-hora', label: 'Kutná Hora', region: 'Středočeský' },
  { value: 'mělník', label: 'Mělník', region: 'Středočeský' },
  { value: 'mladá-boleslav', label: 'Mladá Boleslav', region: 'Středočeský' },
  { value: 'nymburk', label: 'Nymburk', region: 'Středočeský' },
  { value: 'praha-východ', label: 'Praha-východ', region: 'Středočeský' },
  { value: 'praha-západ', label: 'Praha-západ', region: 'Středočeský' },
  { value: 'příbram', label: 'Příbram', region: 'Středočeský' },
  { value: 'rakovník', label: 'Rakovník', region: 'Středočeský' },
  
  // Jihočeský kraj
  { value: 'české-budějovice', label: 'České Budějovice', region: 'Jihočeský' },
  { value: 'český-krumlov', label: 'Český Krumlov', region: 'Jihočeský' },
  { value: 'jindřichův-hradec', label: 'Jindřichův Hradec', region: 'Jihočeský' },
  { value: 'písek', label: 'Písek', region: 'Jihočeský' },
  { value: 'prachatice', label: 'Prachatice', region: 'Jihočeský' },
  { value: 'strakonice', label: 'Strakonice', region: 'Jihočeský' },
  { value: 'tábor', label: 'Tábor', region: 'Jihočeský' },
  
  // Plzeňský kraj
  { value: 'domažlice', label: 'Domažlice', region: 'Plzeňský' },
  { value: 'klatovy', label: 'Klatovy', region: 'Plzeňský' },
  { value: 'plzeň-jih', label: 'Plzeň-jih', region: 'Plzeňský' },
  { value: 'plzeň-město', label: 'Plzeň-město', region: 'Plzeňský' },
  { value: 'plzeň-sever', label: 'Plzeň-sever', region: 'Plzeňský' },
  { value: 'rokycany', label: 'Rokycany', region: 'Plzeňský' },
  { value: 'tachov', label: 'Tachov', region: 'Plzeňský' },
  
  // Karlovarský kraj
  { value: 'cheb', label: 'Cheb', region: 'Karlovarský' },
  { value: 'karlovy-vary', label: 'Karlovy Vary', region: 'Karlovarský' },
  { value: 'sokolov', label: 'Sokolov', region: 'Karlovarský' },
  
  // Ústecký kraj
  { value: 'děčín', label: 'Děčín', region: 'Ústecký' },
  { value: 'chomutov', label: 'Chomutov', region: 'Ústecký' },
  { value: 'litoměřice', label: 'Litoměřice', region: 'Ústecký' },
  { value: 'louny', label: 'Louny', region: 'Ústecký' },
  { value: 'most', label: 'Most', region: 'Ústecký' },
  { value: 'teplice', label: 'Teplice', region: 'Ústecký' },
  { value: 'ústí-nad-labem', label: 'Ústí nad Labem', region: 'Ústecký' },
  
  // Liberecký kraj
  { value: 'česká-lípa', label: 'Česká Lípa', region: 'Liberecký' },
  { value: 'jablonec-nad-nisou', label: 'Jablonec nad Nisou', region: 'Liberecký' },
  { value: 'liberec', label: 'Liberec', region: 'Liberecký' },
  { value: 'semily', label: 'Semily', region: 'Liberecký' },
  
  // Královéhradecký kraj
  { value: 'hradec-králové', label: 'Hradec Králové', region: 'Královéhradecký' },
  { value: 'jičín', label: 'Jičín', region: 'Královéhradecký' },
  { value: 'náchod', label: 'Náchod', region: 'Královéhradecký' },
  { value: 'rychnov-nad-kněžnou', label: 'Rychnov nad Kněžnou', region: 'Královéhradecký' },
  { value: 'trutnov', label: 'Trutnov', region: 'Královéhradecký' },
  
  // Pardubický kraj
  { value: 'chrudim', label: 'Chrudim', region: 'Pardubický' },
  { value: 'pardubice', label: 'Pardubice', region: 'Pardubický' },
  { value: 'svitavy', label: 'Svitavy', region: 'Pardubický' },
  { value: 'ústí-nad-orlicí', label: 'Ústí nad Orlicí', region: 'Pardubický' },
  
  // Kraj Vysočina
  { value: 'havlíčkův-brod', label: 'Havlíčkův Brod', region: 'Vysočina' },
  { value: 'jihlava', label: 'Jihlava', region: 'Vysočina' },
  { value: 'pelhřimov', label: 'Pelhřimov', region: 'Vysočina' },
  { value: 'třebíč', label: 'Třebíč', region: 'Vysočina' },
  { value: 'žďár-nad-sázavou', label: 'Žďár nad Sázavou', region: 'Vysočina' },
  
  // Jihomoravský kraj
  { value: 'blansko', label: 'Blansko', region: 'Jihomoravský' },
  { value: 'brno-město', label: 'Brno-město', region: 'Jihomoravský' },
  { value: 'brno-venkov', label: 'Brno-venkov', region: 'Jihomoravský' },
  { value: 'břeclav', label: 'Břeclav', region: 'Jihomoravský' },
  { value: 'hodonín', label: 'Hodonín', region: 'Jihomoravský' },
  { value: 'vyškov', label: 'Vyškov', region: 'Jihomoravský' },
  { value: 'znojmo', label: 'Znojmo', region: 'Jihomoravský' },
  
  // Olomoucký kraj
  { value: 'jeseník', label: 'Jeseník', region: 'Olomoucký' },
  { value: 'olomouc', label: 'Olomouc', region: 'Olomoucký' },
  { value: 'prostějov', label: 'Prostějov', region: 'Olomoucký' },
  { value: 'přerov', label: 'Přerov', region: 'Olomoucký' },
  { value: 'šumperk', label: 'Šumperk', region: 'Olomoucký' },
  
  // Zlínský kraj
  { value: 'kroměříž', label: 'Kroměříž', region: 'Zlínský' },
  { value: 'uherské-hradiště', label: 'Uherské Hradiště', region: 'Zlínský' },
  { value: 'vsetín', label: 'Vsetín', region: 'Zlínský' },
  { value: 'zlín', label: 'Zlín', region: 'Zlínský' },
  
  // Moravskoslezský kraj
  { value: 'bruntál', label: 'Bruntál', region: 'Moravskoslezský' },
  { value: 'frýdek-místek', label: 'Frýdek-Místek', region: 'Moravskoslezský' },
  { value: 'karviná', label: 'Karviná', region: 'Moravskoslezský' },
  { value: 'nový-jičín', label: 'Nový Jičín', region: 'Moravskoslezský' },
  { value: 'opava', label: 'Opava', region: 'Moravskoslezský' },
  { value: 'ostrava-město', label: 'Ostrava-město', region: 'Moravskoslezský' },
] as const

export type District = typeof CZECH_DISTRICTS[number]['value']

export function getDistrictsByRegion() {
  const grouped = CZECH_DISTRICTS.reduce((acc, district) => {
    if (!acc[district.region]) {
      acc[district.region] = []
    }
    acc[district.region].push(district)
    return acc
  }, {} as Record<string, typeof CZECH_DISTRICTS[number][]>)
  
  return grouped
}
