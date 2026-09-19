import { connectMongo, isMongoConnected } from '../database/mongo.js';
import { ChallengeTemplateModel, UserModel, LearningResourceModel, LearningProgressModel } from '../database/models.js';
import { seedChallengeTemplates, seedDemoUser, demoResources, demoLearningProgress } from '../data/seed.js';
async function seed() {
    const connected = await connectMongo();
    if (!connected || !isMongoConnected()) {
        console.warn('MongoDB is not reachable. Configure MONGODB_URI and ensure MongoDB is running, then re-run "npm run seed".');
        process.exit(0);
    }
    for (const template of seedChallengeTemplates) {
        await ChallengeTemplateModel.findOneAndUpdate({ templateId: template.id }, {
            templateId: template.id,
            type: template.type,
            name: template.name,
            requiredIngredientTypes: template.requiredIngredientTypes,
            optionalIngredientTypes: template.optionalIngredientTypes ?? [],
            concepts: template.concepts ?? [],
            difficulty: template.difficulty,
            enabled: template.enabled,
            version: 1
        }, { upsert: true, new: true });
    }
    console.log(`Seeded ${seedChallengeTemplates.length} challenge templates.`);
    const demoUser = seedDemoUser();
    await UserModel.findOneAndUpdate({ externalId: demoUser.id }, { externalId: demoUser.id, displayName: demoUser.displayName, preferences: demoUser.preferences }, { upsert: true, new: true });
    console.log(`Seeded demo user "${demoUser.id}".`);
    for (const resource of demoResources) {
        await LearningResourceModel.findOneAndUpdate({ concept: resource.concept.toLowerCase(), url: resource.url }, { ...resource, concept: resource.concept.toLowerCase(), retrievedAt: new Date() }, { upsert: true, new: true });
    }
    console.log(`Seeded ${demoResources.length} learning resources.`);
    const existingProgress = await LearningProgressModel.findOne({ userId: demoLearningProgress.userId });
    if (!existingProgress) {
        await LearningProgressModel.create({
            userId: demoLearningProgress.userId,
            concepts: demoLearningProgress.concepts,
            updatedAt: new Date()
        });
        console.log(`Seeded demo learning progress for "${demoLearningProgress.userId}".`);
    }
    else {
        console.log(`Demo learning progress for "${demoLearningProgress.userId}" already exists, skipping.`);
    }
    console.log('Seeding complete.');
    process.exit(0);
}
seed().catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
});
