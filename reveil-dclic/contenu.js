/* =====================================================================
   LE RÉVEIL · DCLIC HLM : TOUS LES TEXTES DE LA PRÉSENTATION
   ---------------------------------------------------------------------
   Pour corriger un texte :
     1. Ouvrez ce fichier avec le Bloc-notes (ou tout éditeur de texte).
     2. Modifiez UNIQUEMENT ce qui se trouve entre les guillemets "...".
     3. Enregistrez, puis rechargez la présentation dans le navigateur (F5).

   Règles simples :
     - Gardez les guillemets droits " au début et à la fin de chaque texte.
     - Gardez la virgule à la fin de chaque ligne quand il y en a une.
     - Pour mettre des mots en valeur (en bleu clair), entourez-les
       d'astérisques : "c'est *notre quartier*, pas un parti."
     - {n} est remplacé automatiquement par le nombre de quartiers
       de la carte (voir quartiers.js).
     - Toujours écrire « DCLIC » (jamais « Déclic »).
   ===================================================================== */

/* Les sept leçons de la défaite : utilisées dans le clip ET dans la diapo 2 */
const LECONS = [
  "Une base DCLIC qui ne relayait pas nos messages",
  "Des élus absents et peu impliqués",
  "Une étiquette politique imposée par l’adversaire",
  "Pas de réponse à chaud aux accusations",
  "Une vague nationale anti-système",
  "Aucune analyse des résultats bureau par bureau",
  "Nos forces concentrées autour du candidat au lieu d’équipes dans chaque quartier"
];

window.CONTENU = {

  /* ---------- Informations générales ---------- */
  general: {
    logo: "logo-dclic.png",   // nom du fichier du logo, placé dans ce dossier
    sigle: "DCLIC HLM",
    association: "Dynamique Convergence en Liens pour l’Implication Citoyenne",
    candidat: "Ousmane Touré Coppet",
    presentateur: "Kris (Christian Préra), cellule communication",
    titreOnglet: "Le Réveil · DCLIC HLM"
  },

  /* ---------- Écran d'attente (avant le lancement du clip) ---------- */
  ecranAccueil: {
    consigne: "Espace : lancer le clip   ·   F : plein écran"
  },

  /* ---------- Aide (touche H) ---------- */
  aide: [
    "Espace : lancer / mettre en pause le clip",
    "→ / ← : avancer / reculer",
    "F : plein écran   ·   R : relancer le clip",
    "C : aller directement à la carte   ·   H : afficher / masquer l’aide"
  ],

  /* =================================================================
     PARTIE 1 : LE CLIP D'OUVERTURE
     ================================================================= */
  clip: {
    presente: "présente",

    perdu: "Il y a cinq ans, nous avons *perdu.*",
    ecoute: "Nous avons écouté.",
    compris: "Nous avons *compris.*",

    leconsTitre: "leçons de la défaite",
    lecons: LECONS,

    reveil: "LE RÉVEIL",

    municipale: "La municipale, c’est *notre quartier*, pas un parti.",

    phasesTitre: "phases pour réveiller les HLM",
    phases: [
      { numero: "Phase 1", titre: "La parole aux habitants et les réalisations de DCLIC" },
      { numero: "Phase 2", titre: "Le grand entretien" },
      { numero: "Phase 3", titre: "L’assemblée générale de DCLIC" }
    ],

    devise: "Sa gox, *sa baat.*",
    deviseTraduction: "Ton quartier, ta voix."   // mettre "" pour ne pas l'afficher
  },

  /* =================================================================
     PARTIE 2 : LA CARTE INTERACTIVE
     ================================================================= */
  carte: {
    titre: "Commune des HLM · de la Cité des Eaux jusqu’à la Cité Port",
    note: "Représentation schématique, à titre indicatif"
  },

  /* Les diapositives, dans l'ordre.
     "scene" indique l'animation de la carte : ne pas le modifier. */
  diapos: [

    /* 1 */ {
      scene: "compteRendu",
      kicker: "Compte rendu",
      titre: "Réunion du lundi 2 novembre 2026",
      blocs: [
        {
          titre: "Objet",
          texte: "Tirer les leçons de la dernière municipale et lancer *Le Réveil* pour la candidature d’Ousmane Touré Coppet."
        },
        {
          titre: "Décisions",
          liste: [
            "Un repositionnement citoyen et non partisan",
            "Une campagne en trois phases",
            "Une équipe et un responsable par quartier",
            "La relance de la base DCLIC",
            "Une cellule de veille et un shadow cabinet"
          ]
        }
      ],
      pied: "Présenté par Kris (Christian Préra), cellule communication"
    },

    /* 2 */ {
      scene: "lecons",
      kicker: "Le diagnostic",
      titre: "Les sept causes de la défaite",
      liste: LECONS,
      numerotee: true
    },

    /* 3 */ {
      scene: "repositionnement",
      kicker: "Notre repositionnement",
      titre: "Une candidature née des HLM",
      liste: [
        "*Née des HLM*, portée par les habitants",
        "*Citoyenne et non partisane*, au service de tous",
        "*Centrée sur le cadre de vie* : nos rues, notre propreté, notre sécurité, nos jeunes"
      ],
      citation: "La municipale, c’est *notre quartier*, pas un parti.",
      motCarte: "SUNU GOX"
    },

    /* 4 */ {
      scene: "phase1",
      kicker: "Phase 1",
      titre: "La parole aux habitants",
      sousTitre: "et les réalisations de DCLIC, tournées dans chaque quartier",
      liste: [
        { icone: "constat", texte: "Vidéos « Ce qui ne va pas aux HLM »" },
        { icone: "temoignage", texte: "Témoignages qui appellent au retour du candidat" },
        { icone: "realisation", texte: "Les réalisations de DCLIC" }
      ],
      note: "De la Cité des Eaux jusqu’à la Cité Port : *aucun quartier oublié.*"
    },

    /* 5 */ {
      scene: "phase2",
      kicker: "Phase 2",
      titre: "Le grand entretien",
      sousTitre: "Ousmane Touré Coppet prend la parole. Trois thèmes :",
      liste: [
        "Le recul et l’écoute",
        "Le cadre de vie",
        "La réponse aux étiquettes"
      ],
      numerotee: true,
      etiquetteCarte: "Le grand entretien"
    },

    /* 6 */ {
      scene: "phase3",
      kicker: "Phase 3",
      titre: "L’assemblée générale de DCLIC",
      sousTitre: "Tous les quartiers convergent vers un même lieu.",
      liste: [
        "Chaque quartier vient avec sa délégation",
        "Un grand moment de rassemblement citoyen",
        "La preuve de notre unité et de notre force"
      ],
      note: "Lieu de l’AG : *à confirmer*",
      sigleAG: "AG",
      etiquetteCarte: "Assemblée générale"
    },

    /* 7 : deux étapes, appuyez sur → pour passer de « Avant » à « Maintenant » */ {
      scene: "maillage",
      kicker: "Le maillage du territoire",
      titre: "Une équipe dans chaque quartier",
      avant: {
        titre: "Avant",
        texte: "Une seule grosse masse autour du candidat."
      },
      apres: {
        titre: "Maintenant",
        texte: "{n} quartiers, {n} équipes de porte-à-porte, {n} responsables."
      },
      liste: [
        "Une équipe de porte-à-porte par quartier",
        "Un responsable identifié dans chaque quartier"
      ],
      etiquetteCandidat: "Le candidat"
    },

    /* 8 */ {
      scene: "continu",
      kicker: "En continu",
      titre: "Tout au long de la campagne",
      blocs: [
        {
          titre: "Relance de la base DCLIC",
          liste: [
            "Remobiliser chaque membre",
            "Chacun relaie nos messages dans son quartier"
          ]
        },
        {
          titre: "« Ma commune, mon affaire »",
          liste: [
            "L’éducation civique, d’abord pour les jeunes",
            "Comprendre le rôle de la mairie",
            "S’inscrire et aller voter"
          ]
        }
      ]
    },

    /* 9 */ {
      scene: "veille",
      kicker: "Cellule de veille et shadow cabinet",
      titre: "Veiller, répondre, proposer",
      liste: [
        "*Riposte sous 24 heures*",
        "Contre-bilan du maire sortant",
        "Relevé des contradictions des adversaires",
        "Contre-propositions"
      ],
      note: "Uniquement à partir de *faits vérifiables.*"
    },

    /* 10 : clôture */ {
      scene: "cloture",
      miseEnPage: "centre",
      titre: "Ensemble, *réveillons* les HLM",
      devise: "Sa gox, sa baat.",
      pied: "DCLIC HLM · Dynamique Convergence en Liens pour l’Implication Citoyenne"
    }
  ]
};
