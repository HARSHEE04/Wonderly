import 'package:flutter/material.dart';

import '../../data/models.dart';

class DemoLearner {
  final String name;
  final List<String> canTeach;
  final List<String> wantsToLearn;

  const DemoLearner({
    required this.name,
    required this.canTeach,
    required this.wantsToLearn,
  });
}

class PeerProfile {
  final String id;
  final String name;
  final String role;
  final String bio;
  final List<String> canTeach;
  final List<String> wantsToLearn;
  final Color accentColor;
  final Color tapeColor;
  final IconGlyph glyph;

  const PeerProfile({
    required this.id,
    required this.name,
    required this.role,
    required this.bio,
    required this.canTeach,
    required this.wantsToLearn,
    required this.accentColor,
    required this.tapeColor,
    required this.glyph,
  });

  String get initials => name
      .split(RegExp(r'\s+'))
      .where((part) => part.isNotEmpty)
      .map((part) => part[0])
      .take(2)
      .join()
      .toUpperCase();

  List<String> skillsTheyCanTeach(DemoLearner learner) =>
      _intersection(canTeach, learner.wantsToLearn);

  List<String> skillsYouCanTeach(DemoLearner learner) =>
      _intersection(wantsToLearn, learner.canTeach);

  bool isMutualWith(DemoLearner learner) =>
      skillsTheyCanTeach(learner).isNotEmpty &&
      skillsYouCanTeach(learner).isNotEmpty;
}

List<String> _intersection(List<String> source, List<String> targets) {
  final targetSet = targets.map((skill) => skill.toLowerCase()).toSet();
  return [
    for (final skill in source)
      if (targetSet.contains(skill.toLowerCase())) skill,
  ];
}
