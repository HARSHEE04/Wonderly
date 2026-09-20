export type PeerGlyph =
  | "circle"
  | "plant"
  | "lines"
  | "wave"
  | "stripes"
  | "spark"
  | "symmetry"
  | "palette"
  | "camera"
  | "perspective"
  | "compass"
  | "cloud";

export type AvatarVariant = "sunny" | "violet" | "teal" | "coral" | "blue";

export interface DemoLearner {
  name: string;
  canTeach: string[];
  wantsToLearn: string[];
}

export interface PeerProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  canTeach: string[];
  wantsToLearn: string[];
  accentColor: string;
  tapeColor: string;
  glyph: PeerGlyph;
  avatarVariant: AvatarVariant;
}

export interface PeerMatch {
  theyCanTeachYou: string[];
  youCanTeachThem: string[];
  isMutual: boolean;
}

export const demoLearner: DemoLearner = {
  name: "You",
  canTeach: ["Color Theory", "Watercolor"],
  wantsToLearn: ["Perspective", "Digital Illustration"],
};

export const peerProfiles: PeerProfile[] = [
  {
    id: "maya",
    name: "Maya",
    role: "Digital Artist",
    bio: "Builds dreamy city scenes and likes swapping quick draw-alongs.",
    canTeach: ["Perspective", "Digital Illustration"],
    wantsToLearn: ["Color Theory"],
    accentColor: "var(--sky)",
    tapeColor: "var(--tape-blue)",
    glyph: "perspective",
    avatarVariant: "sunny",
  },
  {
    id: "alex",
    name: "Alex",
    role: "Sketch Mentor",
    bio: "Keeps a pocket sketchbook and loves expressive pencil studies.",
    canTeach: ["Drawing", "Shading"],
    wantsToLearn: ["Watercolor"],
    accentColor: "var(--coral)",
    tapeColor: "var(--tape-green)",
    glyph: "lines",
    avatarVariant: "violet",
  },
  {
    id: "sam",
    name: "Sam",
    role: "Visual Storyteller",
    bio: "Turns tiny scenes into comic panels with clear focal points.",
    canTeach: ["Composition", "Color Theory"],
    wantsToLearn: ["Digital Illustration"],
    accentColor: "var(--pink)",
    tapeColor: "var(--tape-pink)",
    glyph: "palette",
    avatarVariant: "teal",
  },
  {
    id: "lina",
    name: "Lina",
    role: "Watercolor Explorer",
    bio: "Paints plants, skies, and loose washes from everyday observations.",
    canTeach: ["Watercolor", "Botanical Sketching"],
    wantsToLearn: ["Perspective"],
    accentColor: "var(--forest-green)",
    tapeColor: "var(--tape-green)",
    glyph: "plant",
    avatarVariant: "coral",
  },
  {
    id: "theo",
    name: "Theo",
    role: "Character Designer",
    bio: "Designs bold characters and studies color palettes after class.",
    canTeach: ["Digital Illustration", "Character Design"],
    wantsToLearn: ["Color Theory", "Watercolor"],
    accentColor: "var(--violet)",
    tapeColor: "var(--tape-purple)",
    glyph: "spark",
    avatarVariant: "blue",
  },
];

export function getPeerMatch(
  learner: DemoLearner,
  peer: PeerProfile,
): PeerMatch {
  const theyCanTeachYou = intersection(peer.canTeach, learner.wantsToLearn);
  const youCanTeachThem = intersection(peer.wantsToLearn, learner.canTeach);

  return {
    theyCanTeachYou,
    youCanTeachThem,
    isMutual: theyCanTeachYou.length > 0 && youCanTeachThem.length > 0,
  };
}

function intersection(source: string[], targets: string[]) {
  const targetSet = new Set(targets.map((skill) => skill.toLowerCase()));
  return source.filter((skill) => targetSet.has(skill.toLowerCase()));
}
