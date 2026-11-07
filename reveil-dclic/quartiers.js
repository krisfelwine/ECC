/* =====================================================================
   CONFIGURATION DE LA CARTE : COMMUNE DES HLM
   ---------------------------------------------------------------------
   ATTENTION : ceci est une REPRÉSENTATION SCHÉMATIQUE, pas une carte
   géographique. La forme et la disposition des quartiers sont
   approximatives : elles sont À VÉRIFIER ET À AJUSTER avec une personne
   qui connaît bien le terrain avant toute diffusion publique.

   Comment ça marche :
     - La carte est dessinée dans un cadre de 1000 (largeur) x 600 (hauteur).
       x = 0 à gauche, 1000 à droite ; y = 0 en haut, 600 en bas.
     - "points" = les coins de la zone, sous la forme "x,y x,y x,y ...".
       Pour déplacer un quartier, changez ces nombres.
     - L'ordre de la liste est l'ordre d'allumage des quartiers (phase 1).
     - "tournages" = ce qui sera filmé dans ce quartier (phase 1) :
         "constat"     -> vidéo « Ce qui ne va pas aux HLM »
         "temoignage"  -> témoignages qui appellent au retour du candidat
         "realisation" -> réalisations de DCLIC
       Retirez un mot pour enlever la pastille correspondante.
     - "etiquette" (facultatif) : position du nom, par exemple
         etiquette: { x: 200, y: 150 }
       Sinon, le nom est placé au centre de la zone.
   ===================================================================== */

window.CARTE = {

  quartiers: [
    { nom: "Cité des Eaux", points: "80,90 300,60 290,225 60,240",   tournages: ["constat", "temoignage", "realisation"] },
    { nom: "HLM 1",         points: "60,240 290,225 300,395 90,400",  tournages: ["constat", "temoignage", "realisation"] },
    { nom: "HLM 2",         points: "290,225 530,250 510,410 300,395", tournages: ["constat", "temoignage", "realisation"] },
    { nom: "HLM 3",         points: "530,250 750,230 730,390 510,410", tournages: ["constat", "temoignage", "realisation"] },
    { nom: "HLM 4",         points: "90,400 300,395 320,560 130,540", tournages: ["constat", "temoignage", "realisation"] },
    { nom: "HLM 5",         points: "300,395 510,410 520,545 320,560", tournages: ["constat", "temoignage", "realisation"] },
    { nom: "HLM 6",         points: "510,410 730,390 720,560 520,545", tournages: ["constat", "temoignage", "realisation"] },
    { nom: "Sodida",        points: "750,230 960,250 940,410 730,390", tournages: ["constat", "temoignage", "realisation"] },
    { nom: "HLM Montagne",  points: "300,60 520,80 530,250 290,225",  tournages: ["constat", "temoignage", "realisation"] },
    { nom: "Nimzatt",       points: "520,80 740,55 750,230 530,250",  tournages: ["constat", "temoignage", "realisation"] },
    { nom: "Cité Douane",   points: "740,55 930,100 960,250 750,230", tournages: ["constat", "temoignage", "realisation"] },
    { nom: "Cité Port",     points: "730,390 940,410 900,530 720,560", tournages: ["constat", "temoignage", "realisation"] }
  ],

  /* Quartier où se tiendra l'assemblée générale (phase 3). À CONFIRMER.
     Écrire le nom exactement comme dans la liste ci-dessus. */
  lieuAG: "HLM 5",

  /* Quartier où est placé le candidat (grand entretien et « avant » du
     maillage). À AJUSTER. Même règle d'écriture. */
  quartierCandidat: "HLM 2"
};
