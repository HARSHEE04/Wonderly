import '../../data/models.dart';
import '../../theme/app_theme.dart';
import '../models/peer_profile.dart';

const demoLearner = DemoLearner(
  name: 'You',
  canTeach: ['Color Theory', 'Watercolor'],
  wantsToLearn: ['Perspective', 'Digital Illustration'],
);

const mockPeerProfiles = [
  PeerProfile(
    id: 'maya',
    name: 'Maya',
    role: 'Digital Artist',
    bio: 'Builds dreamy city scenes and likes swapping quick draw-alongs.',
    canTeach: ['Perspective', 'Digital Illustration'],
    wantsToLearn: ['Color Theory'],
    accentColor: AppColors.sky,
    tapeColor: AppColors.tapeBlue,
    glyph: IconGlyph.perspective,
  ),
  PeerProfile(
    id: 'alex',
    name: 'Alex',
    role: 'Sketch Mentor',
    bio: 'Keeps a pocket sketchbook and loves expressive pencil studies.',
    canTeach: ['Drawing', 'Shading'],
    wantsToLearn: ['Watercolor'],
    accentColor: AppColors.coral,
    tapeColor: AppColors.tapeGreen,
    glyph: IconGlyph.lines,
  ),
  PeerProfile(
    id: 'sam',
    name: 'Sam',
    role: 'Visual Storyteller',
    bio: 'Turns tiny scenes into comic panels with clear focal points.',
    canTeach: ['Composition', 'Color Theory'],
    wantsToLearn: ['Digital Illustration'],
    accentColor: AppColors.pink,
    tapeColor: AppColors.tapePink,
    glyph: IconGlyph.palette,
  ),
  PeerProfile(
    id: 'lina',
    name: 'Lina',
    role: 'Watercolor Explorer',
    bio: 'Paints plants, skies, and loose washes from everyday observations.',
    canTeach: ['Watercolor', 'Botanical Sketching'],
    wantsToLearn: ['Perspective'],
    accentColor: AppColors.forestGreen,
    tapeColor: AppColors.tapeGreen,
    glyph: IconGlyph.plant,
  ),
  PeerProfile(
    id: 'theo',
    name: 'Theo',
    role: 'Character Designer',
    bio: 'Designs bold characters and studies color palettes after class.',
    canTeach: ['Digital Illustration', 'Character Design'],
    wantsToLearn: ['Color Theory', 'Watercolor'],
    accentColor: AppColors.violet,
    tapeColor: AppColors.tapePurple,
    glyph: IconGlyph.spark,
  ),
];
