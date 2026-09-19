import 'package:flutter_test/flutter_test.dart';

import 'package:prevengers/main.dart';

void main() {
  testWidgets('Home screen shows the create and learn actions', (WidgetTester tester) async {
    await tester.pumpWidget(const WonderlyApp());
    expect(find.text('create'), findsOneWidget);
    expect(find.text('learn'), findsOneWidget);
  });
}
