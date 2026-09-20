import 'package:flutter_test/flutter_test.dart';
import 'package:prevengers/peer_learning/data/mock_peers.dart';

void main() {
  test('mock deck includes multiple mutual learning matches', () {
    final mutualMatches = mockPeerProfiles
        .where((profile) => profile.isMutualWith(demoLearner))
        .map((profile) => profile.name)
        .toList();

    expect(mutualMatches, containsAll(['Maya', 'Theo']));
    expect(mutualMatches.length, greaterThanOrEqualTo(2));
  });

  test('Maya matches the pitch example exactly', () {
    final maya = mockPeerProfiles.singleWhere(
      (profile) => profile.name == 'Maya',
    );

    expect(maya.skillsTheyCanTeach(demoLearner), [
      'Perspective',
      'Digital Illustration',
    ]);
    expect(maya.skillsYouCanTeach(demoLearner), ['Color Theory']);
  });
}
