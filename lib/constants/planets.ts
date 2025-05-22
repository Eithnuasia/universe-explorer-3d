export interface Planet {
  name: string;
  radius: number;
  position: [number, number, number];
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  description: string;
  parentPlanet?: string;
}

export const planets: Planet[] = [
  // {
  //   name: "Sun",
  //   radius: 5,
  //   position: [0, 0, 0],
  //   color: "#FDB813",
  //   orbitRadius: 0,
  //   orbitSpeed: 0,
  //   rotationSpeed: 0.2,
  //   description:
  //     "The star at the center of our Solar System. It's a nearly perfect sphere of hot plasma that provides energy for life on Earth.",
  // },
  {
    name: "Mercury",
    radius: 0.02,
    position: [25, 0, 0],
    color: "#E5E5E5",
    orbitRadius: 25,
    orbitSpeed: 0.48,
    rotationSpeed: 0.08,
    description:
      "Merkurius adalah planet terkecil dan terdekat dengan Matahari. Permukaannya dipenuhi kawah seperti Bulan. Suhu di siang hari bisa mencapai 430°C, sedangkan malam hari bisa turun hingga -180°C. Merkurius tidak memiliki atmosfer tebal, sehingga tidak ada cuaca dan langitnya selalu gelap. Planet ini mengelilingi Matahari lebih cepat daripada planet lain, hanya butuh 88 hari Bumi untuk satu kali revolusi.",
  },
  {
    name: "Venus",
    radius: 0.05,
    position: [38, 0, 0],
    color: "#DEB887",
    orbitRadius: 38,
    orbitSpeed: 0.35,
    rotationSpeed: 0.07,
    description:
      "Venus sering disebut saudara kembar Bumi karena ukurannya hampir sama. Namun, permukaannya sangat panas, bahkan lebih panas dari Merkurius, dengan suhu sekitar 470°C. Atmosfer Venus sangat tebal dan beracun, terdiri dari karbon dioksida dan awan asam sulfat. Venus berputar sangat lambat dan arah rotasinya berlawanan dengan planet lain. Permukaannya tersembunyi di balik awan tebal, sehingga sulit diamati langsung.",
  },
  {
    name: "Earth",
    radius: 0.06,
    position: [52, 0, 0],
    color: "#2E8BC0",
    orbitRadius: 52,
    orbitSpeed: 0.3,
    rotationSpeed: 0.1,
    description:
      "Bumi adalah planet tempat tinggal manusia dan satu-satunya planet yang diketahui memiliki kehidupan. Bumi memiliki atmosfer yang kaya oksigen, air dalam bentuk cair, dan suhu yang cocok untuk makhluk hidup. Bumi juga memiliki satu satelit alami, yaitu Bulan, yang memengaruhi pasang surut air laut. Permukaan Bumi terdiri dari daratan, lautan, pegunungan, dan gurun.",
  },
  {
    name: "Mars",
    radius: 0.04,
    position: [65, 0, 0],
    color: "#CD5C5C",
    orbitRadius: 65,
    orbitSpeed: 0.24,
    rotationSpeed: 0.09,
    description:
      "Mars dikenal sebagai planet merah karena permukaannya banyak mengandung debu besi. Mars memiliki gunung tertinggi di tata surya, Olympus Mons, dan lembah raksasa Valles Marineris. Suhu di Mars sangat dingin, rata-rata sekitar -60°C. Mars memiliki dua bulan kecil, Phobos dan Deimos. Ilmuwan menduga Mars pernah memiliki air cair di masa lalu, sehingga sering menjadi target pencarian kehidupan.",
  },
  {
    name: "Jupiter",
    radius: 0.11,
    position: [85, 0, 0],
    color: "#DEB887",
    orbitRadius: 85,
    orbitSpeed: 0.13,
    rotationSpeed: 0.12,
    description:
      "Jupiter adalah planet terbesar di tata surya dan terdiri dari gas, terutama hidrogen dan helium. Planet ini memiliki badai raksasa yang disebut Bintik Merah Besar, yang sudah berlangsung ratusan tahun. Jupiter memiliki cincin tipis dan lebih dari 75 satelit, termasuk Ganymede, satelit terbesar di tata surya. Gravitasi Jupiter sangat kuat dan membantu melindungi planet-planet dalam dari komet dan asteroid.",
  },
  {
    name: "Saturn",
    radius: 22.0,
    position: [105, 0, 0],
    color: "#F4D03F",
    orbitRadius: 105,
    orbitSpeed: 0.09,
    rotationSpeed: 0.1,
    description:
      "Saturnus adalah planet keenam dari Matahari dan terkenal dengan cincin indah yang mengelilinginya. Cincin Saturnus terdiri dari jutaan partikel es dan batu yang mengorbit planet. Saturnus juga merupakan planet gas raksasa dan memiliki lebih dari 80 satelit, salah satunya Titan yang memiliki atmosfer tebal. Saturnus berwarna kuning pucat dan berputar sangat cepat pada porosnya.",
  },
  {
    name: "Uranus",
    radius: 0.01,
    position: [125, 0, 0],
    color: "#B2FFFF",
    orbitRadius: 125,
    orbitSpeed: 0.05,
    rotationSpeed: 0.07,
    description:
      "Uranus adalah planet ketujuh dari Matahari dan berwarna biru kehijauan karena kandungan gas metana di atmosfernya. Uranus unik karena sumbu rotasinya miring hampir 98 derajat, sehingga planet ini tampak berputar miring. Uranus adalah planet es raksasa dan memiliki cincin tipis serta 27 satelit yang diketahui. Suhu di Uranus sangat dingin, sekitar -224°C.",
  },
  {
    name: "Neptune",
    radius: 0.06,
    position: [145, 0, 0],
    color: "#5D8AA8",
    orbitRadius: 145,
    orbitSpeed: 0.04,
    rotationSpeed: 0.08,
    description:
      "Neptunus adalah planet kedelapan dan terjauh dari Matahari. Warnanya biru tua karena kandungan metana di atmosfernya. Neptunus memiliki angin tercepat di tata surya, bisa mencapai 2.100 km/jam. Planet ini juga memiliki cincin tipis dan 14 satelit, salah satunya Triton yang sangat dingin dan mengorbit berlawanan arah dengan rotasi planet.",
  },
  {
    name: "Moon",
    radius: 0.02,
    position: [0, 0, 0], // Position doesn't matter for moons
    color: "#FFFFFF",
    orbitRadius: 10,
    orbitSpeed: 0.8,
    rotationSpeed: 0.03,
    description:
      "Bulan adalah satu-satunya satelit alami Bumi dan satelit terbesar kelima di tata surya. Permukaan Bulan dipenuhi kawah akibat tumbukan meteor, dataran tinggi, dan laut kering yang disebut maria. Bulan tidak memiliki atmosfer, sehingga suhu di permukaannya sangat ekstrem. Bulan memengaruhi pasang surut air laut di Bumi dan menjadi objek pertama yang dikunjungi manusia di luar angkasa.",
    parentPlanet: "Earth",
  },
];
