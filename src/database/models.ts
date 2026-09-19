import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    externalId: { type: String, unique: true, sparse: true },
    displayName: { type: String, required: true },
    preferences: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const CreativeSessionSchema = new Schema(
  {
    userId: { type: String, required: true },
    mode: { type: String, enum: ['creative', 'learning'], default: 'creative' },
    sceneAnalysis: { type: Schema.Types.Mixed, default: null },
    selectedChallengeTemplateId: { type: String, default: null },
    challengeDecision: { type: Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ['created', 'scene_received', 'challenge_selected', 'in_progress', 'completed', 'abandoned'],
      default: 'created'
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const ChallengeTemplateSchema = new Schema(
  {
    templateId: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['character', 'poster', 'architecture', 'abstract', 'pattern', 'composition'],
      required: true
    },
    name: { type: String, required: true },
    requiredIngredientTypes: [{ type: String, required: true }],
    optionalIngredientTypes: [{ type: String, default: [] }],
    concepts: [{ type: String, default: [] }],
    difficulty: { type: Number, default: 2 },
    enabled: { type: Boolean, default: true },
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

const ChallengeInstanceSchema = new Schema(
  {
    userId: { type: String, required: true },
    sessionId: { type: String, required: true, unique: true },
    templateId: { type: String, required: true },
    challengeType: { type: String, required: true },
    difficulty: { type: Number, required: true },
    sourceMode: { type: String, enum: ['standalone', 'learning'], required: true },
    title: { type: String, required: true },
    instructions: { type: String, required: true },
    focusConcepts: [{ type: String, default: [] }],
    usedSceneFeatures: [
      {
        _id: false,
        type: { type: String, required: true },
        featureId: { type: String, required: true }
      }
    ],
    whyThisFitsScene: [{ type: String, default: [] }],
    learningContext: { type: Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);

const ChallengeCompletionSchema = new Schema(
  {
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },
    challengeInstanceId: { type: String, default: null },
    templateId: { type: String, required: true },
    challengeType: { type: String, required: true },
    concepts: [{ type: String, default: [] }],
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const ArtworkSchema = new Schema(
  {
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },
    challengeInstanceId: { type: String, default: null },
    challengeTemplateId: { type: String, required: true },
    title: { type: String, default: '' },
    assetUrl: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const LearningProgressSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    concepts: [
      {
        concept: String,
        timesSeen: { type: Number, default: 0 },
        timesPracticed: { type: Number, default: 0 },
        lastSeenAt: Date,
        lastPracticedAt: Date
      }
    ],
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const LearningResourceSchema = new Schema(
  {
    concept: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    source: { type: String, required: true },
    summary: { type: String, default: '' },
    retrievedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const CreativeSessionModel = mongoose.models.CreativeSession || mongoose.model('CreativeSession', CreativeSessionSchema);
export const ChallengeTemplateModel = mongoose.models.ChallengeTemplate || mongoose.model('ChallengeTemplate', ChallengeTemplateSchema);
export const ChallengeInstanceModel = mongoose.models.ChallengeInstance || mongoose.model('ChallengeInstance', ChallengeInstanceSchema);
export const ChallengeCompletionModel = mongoose.models.ChallengeCompletion || mongoose.model('ChallengeCompletion', ChallengeCompletionSchema);
export const ArtworkModel = mongoose.models.Artwork || mongoose.model('Artwork', ArtworkSchema);
export const LearningProgressModel = mongoose.models.LearningProgress || mongoose.model('LearningProgress', LearningProgressSchema);
export const LearningResourceModel = mongoose.models.LearningResource || mongoose.model('LearningResource', LearningResourceSchema);
