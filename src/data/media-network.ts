export type MediaOutlet = {
  name: string;
  href?: string;
};

export type MediaCategory = {
  id: string;
  title: string;
  outlets: MediaOutlet[];
};

function outlets(names: string[]): MediaOutlet[] {
  return names.map((name) => ({ name: name.trim() }));
}

export const mediaNetwork: MediaCategory[] = [
  {
    id: "general-local-news",
    title: "General Local News",
    outlets: outlets([
      "CNN Indonesia",
      "Times Indonesia",
      "Tribun News Group",
      "Sindo News",
      "Indozone",
      "Media Indonesia",
      "Medcom",
      "MetroTv News",
      "IDN Times",
      "Kompas.com",
      "Suara",
      "Liputan6",
      "Pikiran Rakyat Group",
      "Detik Group",
      "Republika",
      "Tirto",
      "Tempo",
      "JPNN Group",
      "Disway Group",
      "Ayo Group",
      "Kumparan",
      "Antara News Group",
      "Promedia Group",
      "Okezone",
      "RRI",
      "Tvonenews",
      "JawaPos Group",
      "Inilah Group",
      "Poskota",
      "Wartakota",
      "Radar Group",
      "Voi",
      "Rmol.id",
    ]),
  },
  {
    id: "business-finance",
    title: "Business and Finance News",
    outlets: outlets([
      "Bisnis Group",
      "CNBC Indonesia",
      "Investor.id",
      "IDXchannel",
      "Wartaekonomi",
      "Fortune Indonesia",
      "InvestorTrust",
      "Kabarbursa",
      "Kontan",
      "Detik Finance",
      "Infobanknews",
      "Idnfinancial",
      "Emitennews",
      "Pasardana",
    ]),
  },
  {
    id: "digital-tech",
    title: "Digital and Tech",
    outlets: outlets([
      "Bloomberg Technoz",
      "Detik Inet",
      "Tech in Asia",
      "Bisnis Tekno",
      "Kompas Tekno",
    ]),
  },
  {
    id: "beauty-lifestyle",
    title: "Beauty and Lifestyle",
    outlets: outlets([
      "Fimela",
      "Nova",
      "Grid",
      "Female Daily",
      "Genpi",
      "Cantika",
      "PopMama",
      "PopBela",
      "Tabloid Bintang",
      "Parapuan",
      "Hai Bunda",
    ]),
  },
  {
    id: "mining-equipment",
    title: "Mining and Equipment",
    outlets: outlets([
      "Tambang.co.id",
      "Dunia Energi",
      "Petromindo",
      "Ruang Energi",
      "equipmentindonesia.com",
      "Petrominer",
      "Nikel.co.id",
    ]),
  },
  {
    id: "crypto-blockchain",
    title: "Crypto and Blockchain",
    outlets: outlets([
      "Coinvestasi",
      "Blockchainmedia.id",
      "Portalkripto.com",
      "Cryptoharian",
      "icrypto.co.id",
      "Beincrypto",
    ]),
  },
  {
    id: "otomotif",
    title: "Otomotif",
    outlets: outlets([
      "Oto",
      "Kabaroto",
      "Motorplus Online",
      "Mobimoto",
      "Gridoto",
      "Otoblitz",
      "Otoasia",
      "Otospirit",
      "Otomotifzone",
      "Otomaniac",
      "Garduoto",
    ]),
  },
];

export const mediaNetworkMeta = {
  title: "Our Network",
  description:
    "Online media partners across news, business, tech, lifestyle, and more — part of Indonesia News Wire’s distribution network.",
};
