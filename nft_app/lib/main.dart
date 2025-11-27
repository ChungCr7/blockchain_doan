import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'src/app.dart';

Future<void> main() async {
  // Load local .env when present (development). Values defined with
  // --dart-define take precedence at compile time.
  // Use Future handlers instead of await/try to ensure any load error
  // is handled by the Future and doesn't crash the startup sequence.
  dotenv
      .load(fileName: ".env")
      .then((_) {
        runApp(const App());
      })
      .catchError((err) {
        // .env may not be available in release builds or when not added as an asset.
        // Log and continue — fallback values will be taken from --dart-define or
        // `Environment` defaults.
        // ignore: avoid_print
        print('dotenv: .env not loaded: $err');
        runApp(const App());
      });
}
