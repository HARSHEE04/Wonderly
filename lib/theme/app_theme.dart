import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Core brand palette. Navy is the "ordinary world" canvas; yellow, pink and
/// the rainbow gradient are reserved for discovery / creation moments so
/// they read as intentional highlights rather than decoration.
class AppColors {
  AppColors._();

  static const navy = Color(0xFF0B0F2E);
  static const navyDeep = Color(0xFF06081C);
  static const navyPanel = Color(0xFF141A44);
  static const navyPanelLight = Color(0xFF1D2456);

  static const cream = Color(0xFFFBF4E6);
  static const paper = Color(0xFFF5ECDA);
  static const paperShadow = Color(0xFFE4D8BE);
  static const paperLight = Color(0xFFFFFCF3);
  static const paperTile = Color(0xFFF1ECDF);

  static const yellow = Color(0xFFFFCB3D);
  static const pink = Color(0xFFFF5FA0);
  static const pinkDeep = Color(0xFFE8397E);
  static const forestGreen = Color(0xFF2F7D5A);
  static const sky = Color(0xFF4FC3E8);
  static const violet = Color(0xFF8B6BF2);
  static const coral = Color(0xFFFF7A59);

  static const ink = Color(0xFF14163A);
  static const inkSoft = Color(0xFF4A4C6A);

  static const rainbow = [yellow, coral, pink, violet, sky, forestGreen];
}

class AppGradients {
  AppGradients._();

  static const discoveryRing = SweepGradient(
    colors: [
      AppColors.yellow,
      AppColors.coral,
      AppColors.pink,
      AppColors.violet,
      AppColors.sky,
      AppColors.forestGreen,
      AppColors.yellow,
    ],
  );

  static const discoveryLinear = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.yellow, AppColors.pink, AppColors.violet],
  );

  static const navyDepth = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [AppColors.navyDeep, AppColors.navy, AppColors.navyPanel],
  );

  static const sunset = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.pink, AppColors.coral],
  );
}

class AppRadii {
  AppRadii._();
  static const sm = 14.0;
  static const md = 20.0;
  static const lg = 28.0;
  static const xl = 36.0;
}

TextTheme _buildTextTheme(TextTheme base, Color color) {
  return base.copyWith(
    displayLarge: base.displayLarge?.copyWith(
      color: color,
      fontWeight: FontWeight.w800,
      fontSize: 40,
      height: 1.05,
      letterSpacing: -0.5,
    ),
    displayMedium: base.displayMedium?.copyWith(
      color: color,
      fontWeight: FontWeight.w800,
      fontSize: 32,
      height: 1.1,
      letterSpacing: -0.3,
    ),
    headlineMedium: base.headlineMedium?.copyWith(
      color: color,
      fontWeight: FontWeight.w700,
      fontSize: 24,
      height: 1.15,
    ),
    titleLarge: base.titleLarge?.copyWith(
      color: color,
      fontWeight: FontWeight.w700,
      fontSize: 18,
    ),
    titleMedium: base.titleMedium?.copyWith(
      color: color,
      fontWeight: FontWeight.w600,
      fontSize: 15,
    ),
    bodyLarge: base.bodyLarge?.copyWith(
      color: color,
      fontSize: 16,
      height: 1.4,
    ),
    bodyMedium: base.bodyMedium?.copyWith(
      color: color.withValues(alpha: 0.75),
      fontSize: 14,
      height: 1.4,
    ),
    labelLarge: base.labelLarge?.copyWith(
      color: color,
      fontWeight: FontWeight.w700,
      fontSize: 13,
      letterSpacing: 1.1,
    ),
  );
}

class AppTheme {
  AppTheme._();

  static ThemeData get theme {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: AppColors.navy,
      colorScheme: base.colorScheme.copyWith(
        primary: AppColors.yellow,
        secondary: AppColors.pink,
        surface: AppColors.navyPanel,
      ),
      textTheme: _buildTextTheme(base.textTheme, AppColors.cream),
      splashFactory: NoSplash.splashFactory,
      highlightColor: Colors.transparent,
    );
  }
}

/// Text theme helper for screens with a cream/paper background.
TextTheme inkTextTheme(BuildContext context) =>
    _buildTextTheme(Theme.of(context).textTheme, AppColors.ink);

/// Hand-lettered display face used on the paper/sketchbook Home screen.
TextStyle sketchDisplay({double fontSize = 40, Color color = AppColors.ink}) =>
    GoogleFonts.caveat(fontSize: fontSize, fontWeight: FontWeight.w700, color: color, height: 1.0);

/// Warm humanist body/label face paired with [sketchDisplay].
TextStyle sketchBody({
  double fontSize = 14,
  FontWeight weight = FontWeight.w400,
  Color color = AppColors.inkSoft,
}) =>
    GoogleFonts.karla(fontSize: fontSize, fontWeight: weight, color: color, height: 1.4);

/// Confident editorial display face for headlines — the "Archivo" register
/// used everywhere that isn't the one handwritten line per screen.
TextStyle editorialDisplay({
  double fontSize = 28,
  FontWeight weight = FontWeight.w800,
  Color color = AppColors.ink,
}) =>
    GoogleFonts.archivo(fontSize: fontSize, fontWeight: weight, color: color, height: 1.05, letterSpacing: -0.4);

/// Small uppercase utility label (mono) — eyebrows, tags, timestamps.
TextStyle monoLabel({
  double fontSize = 10,
  Color color = AppColors.inkSoft,
  double letterSpacing = 1.2,
}) =>
    GoogleFonts.ibmPlexMono(fontSize: fontSize, fontWeight: FontWeight.w600, color: color, letterSpacing: letterSpacing);
