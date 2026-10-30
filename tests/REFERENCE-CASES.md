# Referenz-Testfälle – Mimaki Calc 2.0

Die erwarteten Zahlen werden zuerst aus dem unveränderten Bestand im Browser aufgezeichnet; sie dürfen nicht erfunden werden.

| ID | Fall | Prüfung |
|---|---|---|
| N01 | Format 500 × 300 mm, 10 Stück, ORAJET 3164 XG, Auto | Nutzen/Reihen/Laufmeter/Preis |
| N02 | Gleiches Format, 0° fix | Keine automatische Drehung |
| N03 | Gleiches Format, 90° fix | Gedrehte Belegung |
| N04 | Format breiter als bedruckbare Rolle | Verständlicher Fehler |
| N05 | Unvollständige letzte Reihe | Linksorientierung nach neuer Spezifikation |
| N06 | 3 mm Beschnitt/Seite, 6 mm Abstand | Geometrie und Materialverbrauch |
| K01 | Ohne Extras | Material, Tinte, Maschine, Reinigung |
| K02 | Laminat an | Material und Laminierarbeit |
| K03 | Kontur, Ösen und Handschnitt | Zusatzkosten |
| K04 | Faktor und Mindestpreis | Altverhalten identisch |
| K05 | Zielmarge | Neue Formel separat prüfen |
| D01 | JSON-Export/Import | Daten unverändert |
| D02 | Material- und Laminatverwaltung | Persistenz und Identitäten |
| R01 | Roll-up Komplettsystem/Ersatzgrafik | System und Montage |
| B01 | Banner mit Konfektionierung | Saum und Ösen |
| T01 | DTF Gang Sheet | Packung und Presskosten |
| V01 | Abholung/Paket/Spedition/Lieferung | Versandkosten |
| A01 | Mehrere Positionen | Gesamtbetrag und Wiederöffnen |
| P01 | Angebot/Bestätigung/Auftragstasche | Alle Positionen enthalten |

Status: Testmatrix erstellt, noch nicht ausgeführt.
