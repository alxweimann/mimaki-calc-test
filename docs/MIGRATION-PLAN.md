# Mimaki Calc 2.0 – Migrationsplan

## Schutzregeln
- Produktiv-Repository `alxweimann/mimaki-calc` nicht verändern.
- `main` des Test-Repositories nicht verändern.
- Entwicklung ausschließlich in `feature/mimaki-calc-2`.
- Bestehende lokale Daten und JSON-Backups dürfen nicht überschrieben werden.
- Keine stille Änderung bestehender Preisformeln.

## Referenzstände
- Produktiv: index.html Blob e358d6d99ed88e0fe16ad8c9687b6ba0a553829b
- Test: index.html Blob 03d76d4094c99c30c583774aa9fa3b6ad503f5e1

## Ziel
Mobile-first PrintPilot Cyan/Weiß, auf Desktop kompakte professionelle Mehrspaltenansicht. Gleicher Kalkulationskern für alle Geräte.

## Reihenfolge
1. Referenzfälle und Datenexport absichern.
2. Reine Funktionen für Nutzenplanung, Material, Tinte, Veredelung und Preise extrahieren.
3. Differenzen gegenüber bestehenden Ergebnissen automatisiert prüfen.
4. Produktmodule Poster, Banner, Roll-up, Sticker, Folien, DTF und Sonstiges isolieren.
5. Auftragspositionen und zentrale Dokumente als eigenes Modul.
6. Responsive UI implementieren.
7. Browser-, Export-, Dokument- und Regressionstests.

## Wichtige offene Prüfungen
- Zentrierung vollständiger Reihen und linksbündige letzte Reihe.
- Tatsächlich bedruckbare Rollenbreite und Rand.
- Faktor-Kalkulation vs. echte Zielmarge.
- Auftragsverwaltung aus Commit-Historie ist im aktuellen index.html nicht nachgewiesen.
- localStorage-Migration und Import der bestehenden JSON-Backups.
- DTF-, Ösen-, Roll-up-, Versand- und Dokumentfunktionen isoliert testen.

## Freigabekriterium
Keine Änderung von main ohne explizite Freigabe; keine Veröffentlichung ohne Regressionstests.
