/**
 * Content for the five planet experiences. Photos, captions, secret stars and voice notes
 * are NOT here: they live in Lovable Cloud and are managed from /atelier.
 */
import scene1 from "@/assets/story/scene-1-amphi.jpg";
import scene2 from "@/assets/story/scene-2-stylo.jpg";
import scene3 from "@/assets/story/scene-3-regard.jpg";
import scene4 from "@/assets/story/scene-4-numero.jpg";
import scene5 from "@/assets/story/scene-5-aout.jpg";
import scene6 from "@/assets/story/scene-6-baiser.jpg";

/* ---------- 1. Notre rencontre ---------- */
export type StoryScene = { img: string; chapter: string; title: string; caption: string };
export const STORY_SCENES: StoryScene[] = [
  { img: scene1, chapter: "Chapitre I", title: "Première année", caption: "Une salle de cours, la rentrée… et toi, le délégué de classe." },
  { img: scene2, chapter: "Chapitre II", title: "Le stylo noir", caption: "Tu envoies un ami me demander… un stylo noir." },
  { img: scene3, chapter: "Chapitre III", title: "Le premier regard", caption: "Je te le tends. Nos regards se croisent. Un sourire." },
  { img: scene4, chapter: "Chapitre IV", title: "Ton prénom ?", caption: "Tu rapportes le stylo, tu demandes mon prénom… puis mon numéro." },
  { img: scene5, chapter: "Chapitre V", title: "Août 2021", caption: "Et notre histoire commence." },
  { img: scene6, chapter: "Chapitre VI", title: "Le premier baiser", caption: "Tu me raccompagnes chez moi. Notre premier baiser." },
];

export type Riddle = { question: string; options: string[]; answer: number; success: string };
export const RIDDLES: Riddle[] = [
  {
    question: "Je suis petit, noir, et j’ai écrit la première ligne de notre histoire. Qui suis-je ?",
    options: ["✒️ Un stylo noir", "📱 Un téléphone", "📓 Un cahier", "🧽 Une gomme"],
    answer: 0,
    success: "Ce stylo restera notre trésor.",
  },
  {
    question: "Dans la classe, tu avais un titre officiel. Lequel ?",
    options: ["🎧 DJ de la promo", "🎖️ Délégué de classe", "⚽ Capitaine de foot", "📚 Assistant du prof"],
    answer: 1,
    success: "Le délégué le plus charmant de l’université.",
  },
  {
    question: "Qui est venu me demander le stylo à ta place ?",
    options: ["🙋 Toi-même", "👨‍🏫 Le professeur", "🤝 Un ami", "🙈 Personne"],
    answer: 2,
    success: "Un messager… très bien choisi !",
  },
  {
    question: "En me rendant le stylo, qu’as-tu osé me demander ?",
    options: ["⏰ L’heure", "📝 Mes notes de cours", "✒️ Un deuxième stylo", "💌 Mon prénom"],
    answer: 3,
    success: "Puis mon numéro… le début de tout.",
  },
  {
    question: "En quel mois notre histoire a-t-elle officiellement commencé ?",
    options: ["❄️ Janvier 2021", "☀️ Août 2021", "🎄 Décembre 2021", "🌸 Août 2022"],
    answer: 1,
    success: "Août 2021, notre première étoile.",
  },
];

/* ---------- 3. Notre petit monde ---------- */
export type Who = "lui" | "elle" | "nous";
export const WHO_LABEL: Record<Who, string> = { lui: "🤴 Lui", elle: "👸 Elle", nous: "💞 Nous deux" };
export type QuizQuestion = { icon: string; question: string; answer: Who };
export const QUIZ: QuizQuestion[] = [
  { icon: "⚽", question: "Qui est le plus grand fan du Real Madrid ?", answer: "nous" },
  { icon: "🎮", question: "Qui gagne le plus souvent aux jeux vidéo ?", answer: "lui" },
  { icon: "💬", question: "Qui a envoyé le tout premier message ?", answer: "lui" },
  { icon: "😴", question: "Qui s’endort en premier devant un film ?", answer: "elle" },
  { icon: "💻", question: "Qui répare tout ce qui est technologie ?", answer: "lui" },
  { icon: "🍫", question: "Qui est le plus gourmand ?", answer: "elle" },
  { icon: "⏰", question: "Qui est le plus souvent en retard ?", answer: "elle" },
  { icon: "❤️", question: "Qui aime le plus l’autre ?", answer: "nous" },
];

export type Challenge = { icon: string; theme: string; text: string };
export const CHALLENGES: Challenge[] = [
  { icon: "⚽", theme: "Football", text: "Séance de tirs au but : 5 penalties chacun. Le perdant offre une glace." },
  { icon: "🎮", theme: "Jeux vidéo", text: "Un match de FIFA : si je gagne, tu me portes jusqu’au canapé." },
  { icon: "💻", theme: "Tech", text: "Échange de téléphones pendant 10 minutes… sans rien cacher !" },
  { icon: "📸", theme: "Photo", text: "Recréer notre première photo ensemble, avec la même pose." },
  { icon: "🎤", theme: "Duo", text: "Chanter notre chanson préférée à deux, à fond, sans honte." },
  { icon: "🍳", theme: "Cuisine", text: "Cuisiner ensemble un plat que nous n’avons jamais goûté." },
];
export const PENALTY_SHOTS = 5;
export const PENALTY_GOALS_TO_WIN = 3;
export const PENALTY_REWARD = "Bon pour : un câlin illimité ⚽❤️";
export const SECRET_CHEAT = "Code triche activé : +100 bisous 💋";

/* ---------- 4. Notre avenir ---------- */
export type Dream = { icon: string; name: string; message: string; x: number; y: number };
export const DREAMS: Dream[] = [
  { icon: "✈️", name: "Notre premier grand voyage", message: "Un aller simple vers l’aventure, ta main dans la mienne.", x: 14, y: 70 },
  { icon: "🏟️", name: "Le Santiago Bernabéu", message: "Voir le Real Madrid jouer, ensemble, en vrai, dans le stade.", x: 30, y: 28 },
  { icon: "🎓", name: "Nos réussites", message: "Diplômes, projets, rêves : se pousser l’un l’autre vers le haut.", x: 50, y: 62 },
  { icon: "🏡", name: "Notre maison", message: "Un petit coin à nous, plein de rires, de plantes et de souvenirs.", x: 66, y: 22 },
  { icon: "💍", name: "Le grand oui", message: "Un jour, devant tous ceux qu’on aime…", x: 80, y: 60 },
  { icon: "✨", name: "Notre famille", message: "Et peut-être, un jour, de petites étoiles rien qu’à nous.", x: 90, y: 24 },
];
export const ADVENTURES = [
  "🌴 Road trip à travers Madagascar",
  "🏖️ Week-end à la plage",
  "⚽ Un match au stade",
  "🔭 Une nuit à regarder les étoiles",
  "🍜 Un cours de cuisine à deux",
  "🎮 Un tournoi de jeux vidéo",
  "🌄 Randonnée au lever du soleil",
  "🧺 Pique-nique en forêt",
];
export const MAX_ADVENTURES = 3;
export const CAPSULE = {
  openOn: "Août 2031",
  message:
    "Mon Roi, si tu lis ceci dans dix ans, j’espère qu’on rit encore pour rien, qu’on se dispute toujours pour la télécommande… et qu’on se choisit encore, chaque matin. Je t’aime, aujourd’hui et pour tous les lendemains.",
};

/* ---------- 5. Mon univers ---------- */
export const FINALE_MESSAGES = [
  "Il existe des milliards d’étoiles…",
  "…des millions de planètes…",
  "…mais un seul univers compte pour moi.",
  "Le nôtre.",
];
export const LOVE_LETTER = [
  "Mon Roi,",
  "Depuis ce stylo noir, ma vie a changé de couleur.",
  "Tu es mon calme, mon fou rire, mon meilleur ami et mon plus beau voyage.",
  "Merci de me choisir, chaque jour, dans tous les univers possibles.",
  "Je t’aime.",
  "— Ta Doudou, pour toujours",
];
