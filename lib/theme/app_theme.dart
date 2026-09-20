import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Core brand palette. Navy is the "ordinary world" canvas; yellow, pink and
/// the rainbow gradient are reserved for discovery / creation moments so
/// they read as intentional highlights rather than decoration.
///
/// The five accent hues (yellow, coral, pink, pinkDeep, sky) are drawn from
/// the MyMindsEye.art reference palette — soft yellow, marigold, teal, dusty
/// coral, and brick red — sampled directly from the swatch. `violet` extends
/// that palette with a deeper teal so the existing light/deep accent pairing
/// (pink/pinkDeep) has a cool-toned counterpart (sky/violet). `forestGreen`
/// stays a literal green: it's used to render an actual "Forest Green"
/// scanned-scene color, not UI chrome, so it sits outside this palette.
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

  static const yellow = Color(0xFFFBE87D); // soft yellow
  static const pink = Color(0xFFEA8886); // dusty coral pink
  static const pinkDeep = Color(0xFFE0615E); // brick red
  static const forestGreen = Color(0xFF2F7D5A);
  static const sky = Color(0xFF7EC6CA); // teal
  static const violet = Color(0xFF4E8E91); // deep teal
  static const coral = Color(0xFFEFB546); // marigold

  static const ink = Color(0xFF14163A);
  static const inkSoft = Color(0xFF4A4C6A);

  static const rainbow = [yellow, coral, pink, violet, sky, forestGreen];

  // Pale tints of the accent palette, for large soft-fill surfaces (library
  // card thumbnails, capture preview backdrops) where a full-strength accent
  // would be too loud.
  static const tealTint = Color(0xFFDCEEEE);
  static const marigoldTint = Color(0xFFFBEAC9);
  static const brickTint = Color(0xFFF8DEDD);

  // A colorful pastel "washi tape" palette — deliberately more saturated
  // than the paper background so tape always reads as tape, never blends
  // in with it. No yellow here on purpose: yellow-on-ink is what Flutter's
  // debug overflow banner looks like, and tape must never be mistaken for
  // that warning stripe.
  static const tapePink = Color(0xFFF3A6C8);
  static const tapePurple = Color(0xFFC2A2EA);
  static const tapeGreen = Color(0xFF9BDFB3);
  static const tapeBlue = Color(0xFF95CDEF);

  static const tapePalette = [tapePink, tapePurple, tapeGreen, tapeBlue];

  // A physical Post-it yellow, for the StickyNote card — distinct from the
  // brighter button `yellow`, plus a slightly deeper shade for its folded
  // corner.
  static const stickyNote = Color(0xFFFBEFC0);
  static const stickyNoteFold = Color(0xFFECDA9C);
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
    GoogleFonts.caveat(
      fontSize: fontSize,
      fontWeight: FontWeight.w700,
      color: color,
      height: 1.0,
    );

/// Warm humanist body/label face paired with [sketchDisplay].
TextStyle sketchBody({
  double fontSize = 16,
  FontWeight weight = FontWeight.w400,
  Color color = AppColors.inkSoft,
}) => GoogleFonts.karla(
  fontSize: fontSize,
  fontWeight: weight,
  color: color,
  height: 1.4,
);

/// Confident editorial display face for headlines — the "Archivo" register
/// used everywhere that isn't the one handwritten line per screen.
TextStyle editorialDisplay({
  double fontSize = 28,
  FontWeight weight = FontWeight.w800,
  Color color = AppColors.ink,
}) => GoogleFonts.archivo(
  fontSize: fontSize,
  fontWeight: weight,
  color: color,
  height: 1.05,
  letterSpacing: -0.4,
);

/// Small uppercase utility label (mono) — eyebrows, tags, timestamps.
TextStyle monoLabel({
  double fontSize = 12,
  Color color = AppColors.inkSoft,
  double letterSpacing = 1.2,
}) => GoogleFonts.ibmPlexMono(
  fontSize: fontSize,
  fontWeight: FontWeight.w600,
  color: color,
  letterSpacing: letterSpacing,
);
