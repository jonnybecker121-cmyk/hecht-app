# hecht Workspace

Eine eigenständige, deutschsprachige Workspace-Oberfläche, inspiriert vom Konzept einer integrierten KI-Arbeitsumgebung.

## Starten

Node.js 24 und npm verwenden.

```bash
npm ci
npm run dev -- --port 5173
```

Die App ist unter http://localhost:5173 verfügbar. Mit `npm run build` wird der Produktionsbuild erstellt; `npm run preview` startet dessen Vorschau.

## Funktionsumfang

- Projekte anlegen, filtern, durchsuchen und löschen
- Projektnotizen und Fortschritt speichern
- Assistent mit lokalen, kontextbezogenen Demoantworten
- Agenten- und Workflow-Vorlagen für den Demo-Assistenten
- Persönliches Profil und Modellauswahl
- Tastatursuche mit Cmd/Ctrl + K; responsive Oberfläche

Projekte, Notizen, Profil, Chats und Vorlagen-Einstellungen werden in `localStorage` auf diesem Browser gespeichert. Es gibt keine Cloud-Synchronisierung oder Server-Datenbank. Das Löschen der Browserdaten löscht auch die gespeicherten Workspace-Daten.

## Aktueller Stand

Dies ist ein bedienbarer Browser-Prototyp im Desktop-Stil. Echte KI-Anbieter, GitHub, Terminal, lokaler Dateizugriff und automatische Hintergrundausführungen sind noch nicht angebunden. Die Modellauswahl ändert aktuell eine lokale Präferenz; sie verbindet keinen KI-Anbieter. Die initialen Projekte und Aktivitäten sind Beispieldaten. Ein natives Desktop-Paket ist noch nicht enthalten.

## Technik

React, Vite, Lucide React und CSS. Keine API-Schlüssel erforderlich.
