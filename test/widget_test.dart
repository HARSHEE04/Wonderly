import 'package:flutter_test/flutter_test.dart';

import 'package:prevengers/main.dart';

void main() {
  testWidgets('Home screen shows the primary actions', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const WonderlyApp());
    expect(find.text('create'), findsOneWidget);
    expect(find.text('learn'), findsOneWidget);
    expect(find.text('peer learning'), findsOneWidget);
  });
}
