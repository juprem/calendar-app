# Tickets JIRA — Traitement LPR (Liste de Présence)

> **Service :** `iris-acteur-service`  
> **Référence SFD :** IRIS_SFD_08_Liste de présence_V0.5  
> **Epic :** Traitement des Listes de Présence (LPR)

---

## Processus 1 — Consommation Kafka bénéficiaire par bénéficiaire

---

### IRIS-???? — LPR P1 : Consommation du message Kafka et persistance temporaire d'un bénéficiaire

**Type :** Story  
**Priorité :** Haute

**Description**

Consommer chaque message Avro entrant sur le topic LPR (1 message = 1 bénéficiaire, cf. contrat d'interface IN-001). Désérialiser le contenu et persister la ligne en base dans une table de staging associée au `traitement_id`, en attendant la reconstitution complète du fichier.

**Critères d'acceptance**

- [ ] Un consumer Kafka écoute le topic LPR dédié
- [ ] Le message Avro est désérialisé selon le schéma défini dans IRIS_Interface_LPR § IN-001
- [ ] Les données du bénéficiaire sont persistées en base avec le `traitement_id` et le `nbBeneficiaire` attendu
- [ ] En cas d'erreur de désérialisation, le message est rejeté et l'erreur est loggée (sans bloquer le traitement des autres messages)
- [ ] Les données sont purgées après traitement complet du fichier

**Notes techniques**

- La validation de structure du message Avro est déjà couverte par IRIS-2321
- Pas de traitement métier à ce stade, uniquement persistance brute

---

### IRIS-???? — LPR P1 : Vérification de complétude et déclenchement du Processus 2
 
**Type :** Story  
**Priorité :** Haute

**Description**

Après chaque persistance de ligne bénéficiaire, vérifier si le fichier est reconstitué intégralement en comparant le nombre de lignes persistées pour le `traitement_id` courant au `nbBeneficiaire` attendu. Si le fichier est complet, déclencher le Processus 2.

**Critères d'acceptance**

- [ ] Après chaque persistance, exécuter : `SELECT count(*) FROM LPR_STAGING WHERE traitement_id = :traitementId`
- [ ] Si `count = nbBeneficiaire`, déclencher le traitement complet (Processus 2) de manière asynchrone
- [ ] Le déclenchement est idempotent : il ne se produit qu'une seule fois par `traitement_id`
- [ ] En cas d'erreur au déclenchement, logger et ne pas re-déclencher automatiquement

---

## Processus 2 — Traitement d'un fichier LPR complet

---

### IRIS-???? — LPR P2 : Orchestration du traitement complet d'un fichier LPR

**Type :** Story  
**Priorité :** Haute

**Description**

Service d'orchestration qui pilote l'ensemble des étapes du Processus 2 pour un `traitement_id` donné, dans l'ordre défini par la SFD : chargement des lignes, pré-boucle SIREN, initialisation des structures en mémoire, RG à la maille fichier, boucle principale bénéficiaires, publication des indicateurs et alimentation des effectifs.

**Critères d'acceptance**

- [ ] Charger toutes les lignes staging pour le `traitement_id` reçu en paramètre
- [ ] Enchaîner les étapes dans l'ordre : LPR_02 → LPR_03 → RG fichier → boucle principale (LPR_04/05/06) → LPR_07 (si décembre) → LPR_08
- [ ] Une erreur bloquante sur un établissement n'interrompt pas le traitement des autres établissements
- [ ] Une erreur bloquante sur un bénéficiaire n'interrompt pas le traitement des autres bénéficiaires
- [ ] Les logs fonctionnels de synthèse sont produits en fin de traitement (cf. §4.2.4 SFD)

---

### IRIS-???? — LPR P2 : Pré-boucle SIREN — Résolution des entités juridiques (LPR_02 préparation)

**Type :** Task  
**Priorité :** Haute

**Description**

Avant toute validation, effectuer une première boucle sur les SIREN distincts présents dans le fichier pour récupérer les `ent_id` (identifiants techniques des entités juridiques) et constituer un cache SIREN → ent_id réutilisé dans toute la suite du traitement.

**Critères d'acceptance**

- [ ] Extraire tous les SIREN distincts du jeu de données chargé
- [ ] Pour chaque SIREN, récupérer l'`ent_id` correspondant (entité juridique)
- [ ] Stocker le résultat dans une structure `Map<SIREN, EntiteJuridiqueDto>` disponible pour les étapes suivantes
- [ ] Les SIREN inconnus sont signalés mais ne font pas échouer cette étape (le rejet est géré à LPR_02)

---

### IRIS-???? — LPR P2 : Rejet des établissements non adhérents (LPR_02)

**Type :** Story  
**Priorité :** Haute

**Description**

Filtrer les lignes dont l'établissement n'est pas adhérent au CGOS sur la période de la liste de présence. Seules les lignes concernant des établissements adhérents et identifiables sont conservées pour la suite du traitement.

**Critères d'acceptance**

- [ ] Un établissement est adhérent si la période de présence est incluse dans sa période d'adhésion CGOS (arrondie au 1er jour du 1er mois et au dernier jour du dernier mois)
- [ ] **Si SIRET établissement renseigné :** vérifier qu'il correspond à un établissement rattaché à une entité juridique adhérente
- [ ] **Si Code Administratif (fichier) renseigné et SIRET absent :** vérifier que le Code Administratif correspond à une entité adhérente
- [ ] **Autres cas :** rejeter la ligne avec ERR_LPR_02_A
- [ ] Le rejet est au niveau établissement : toutes les lignes de l'établissement concerné sont rejetées
- [ ] Les logs fonctionnels incluent le nombre d'établissements rejetés et le motif

**Codes d'erreur**

| Code | Niveau | Motif | Impact |
|------|--------|-------|--------|
| ERR_LPR_02_A | Etablissement / OUT-001 | "Etablissement non adhérent CGOS sur la période concernée." | Fin de traitement pour cet établissement. Continue pour les autres. |

---

### IRIS-???? — LPR P2 : Validation des données de présence par bénéficiaire (LPR_03)

**Type :** Story  
**Priorité :** Haute

**Description**

Valider les champs obligatoires et les formats des données de présence de chaque bénéficiaire/PM. Rejeter individuellement les lignes invalides sans interrompre le traitement des lignes valides.

**Critères d'acceptance**

- [ ] **NIR avec clé :** valider le format (numéro de sécurité sociale avec clé), gérer les numéros corses (2A → 19, 2B → 18) ; rejeter si absent ou invalide (ERR_LPR_03_A)
- [ ] **Identification établissement (niveau agent) :**
  - Si SIRET agent renseigné : vérifier correspondance avec le SIREN du SIRET niveau établissement (si renseigné) et rattachement à une entité adhérente ; sinon ERR_LPR_03_B
  - Si seul Code Administratif ou SIREN renseigné : vérifier que l'entité n'a qu'un seul établissement actif sur la période OU qu'une situation pro du bénéficiaire est en cours sur la période pour un seul établissement de cette entité → utiliser cet établissement pour la suite ; sinon ERR_LPR_03_B
- [ ] **Année :** présente et valide (ERR_LPR_03_C)
- [ ] **Mois :** présent et valide (ERR_LPR_03_D)
- [ ] **% Temps de travail :** entier entre 1 et 100 (ERR_LPR_03_E)
- [ ] **Si_titulaire_stagiaire :** valeur 0 ou 1 (ERR_LPR_03_F)
- [ ] **Si_present :** valeur 0 ou 1 (ERR_LPR_03_G)
- [ ] Les logs fonctionnels incluent le nombre de rejets par motif au niveau agent

**Codes d'erreur**

| Code | Niveau | Motif | Impact |
|------|--------|-------|--------|
| ERR_LPR_03_A | Agent / OUT-002 | "Numéro NIR absent ou invalide" | Rejet de la ligne. Continue pour les autres agents. |
| ERR_LPR_03_B | Agent / OUT-002 | "Etablissement absent ou invalide" | Rejet de la ligne. Continue pour les autres agents. |
| ERR_LPR_03_C | Agent / OUT-002 | "Année absente ou invalide" | Rejet de la ligne. Continue pour les autres agents. |
| ERR_LPR_03_D | Agent / OUT-002 | "Mois absent ou invalide" | Rejet de la ligne. Continue pour les autres agents. |
| ERR_LPR_03_E | Agent / OUT-002 | "%TT absent ou invalide" | Rejet de la ligne. Continue pour les autres agents. |
| ERR_LPR_03_F | Agent / OUT-002 | "Si_titulaire_stagiaire absent ou invalide" | Rejet de la ligne. Continue pour les autres agents. |
| ERR_LPR_03_G | Agent / OUT-002 | "Si_present absent ou invalide" | Rejet de la ligne. Continue pour les autres agents. |

---

### IRIS-???? — LPR P2 : RG à la maille fichier — Détection des doublons email (PRC::LPR_A, cas 5)

**Type :** Story  
**Priorité :** Haute

**Description**

Avant la boucle principale, appliquer les règles de gestion qui s'évaluent sur l'ensemble du fichier. La règle principale concerne la détection d'un même bénéficiaire présent plusieurs fois avec des adresses email différentes.

**Critères d'acceptance**

- [ ] Regrouper les lignes par identifiant bénéficiaire (numéro CGOS si connu, sinon numéro de sécurité sociale)
- [ ] Pour chaque groupe : si plusieurs adresses email distinctes sont présentes, rejeter toutes les lignes correspondantes
- [ ] Le motif de rejet est tracé dans les logs fonctionnels
- [ ] Cela ne concerne que les bénéficiaires sans numéro CGOS (le doublon email est un critère de création CGOS, cf. PRC::LPR_A)

**Codes d'erreur**

| Code procédure | Niveau | Motif | Impact |
|----------------|--------|-------|--------|
| PRC_LPR_A_5 | Agent / OUT-002 | "Agent/PM présent plusieurs fois avec des adresses email différentes" | Rejet de toutes les lignes concernées. Continue pour les autres agents. |

---

### IRIS-???? — LPR P2 : Initialisation des structures en mémoire (indicateurs + effectifs)

**Type :** Task  
**Priorité :** Haute

**Description**

Initialiser avant la boucle principale les structures de données en mémoire qui seront incrémentées au fil du traitement : les indicateurs à destination de PAC et les effectifs à destination de la table EFFECTIF_AGENT_*.

**Critères d'acceptance**

- [ ] **Indicateurs PAC :** initialiser les compteurs à 0 pour chaque niveau (Etablissement, Agent) et chaque catégorie (lignes lues, traitées avec succès, rejetées par motif, avertissements, ignorées)
- [ ] **Effectifs :** initialiser un `Map<SIREN, EffectifsEtablissement>` où `EffectifsEtablissement` contient :
  - `List<EffectifsStatut>` : un enregistrement par valeur de `REF::ACT_51` (catégorie statut agents effectifs), chacun avec `valeurHomme = 0` et `valeurFemme = 0`
  - `List<EffectifsCsp>` : un enregistrement par valeur de `REF::ACT_52` (catégorie socio-professionnelle), chacun avec `valeurHomme = 0` et `valeurFemme = 0`
  - `List<EffectifsTempsTravail>` : un enregistrement par valeur de `REF::ACT_53` (catégorie temps de travail), chacun avec `valeurHomme = 0` et `valeurFemme = 0`
- [ ] Toutes les catégories de chaque enum sont pré-initialisées (pas d'ajout dynamique ensuite)
- [ ] Ces structures sont locales au traitement, sans persistance à ce stade

---

### IRIS-???? — LPR P2 : Traitement des bénéficiaires avec numéro CGOS — Situation professionnelle (LPR_04 + PRC::LPR_B)

**Type :** Story  
**Priorité :** Haute

**Description**

Pour les bénéficiaires de la boucle principale disposant déjà d'un numéro CGOS, créer ou mettre à jour leur situation professionnelle selon la procédure PRC::LPR_B. Gérer le verrouillage de la fiche, les 3 cas de situation pro et la logique de restriction/ouverture des droits.

**Critères d'acceptance**

- [ ] **Verrou :** vérifier la présence d'un verrou sur la fiche bénéficiaire. Si verrou présent → ignorer (non rejet) et passer au suivant. Sinon, poser un verrou pour la durée des opérations.
- [ ] **Cas 1 — Situation pro plus récente que la LPR :** si une situation pro a été mise à jour après la fin de période de l'information de présence → ne rien faire
- [ ] **Cas 2 — Situation identique existante** (même établissement, même catégorie statut, même %TT, même date de début) :
  - Sans date de sortie dans la LPR → ne rien faire
  - Avec date de sortie ou fin d'activité dans la LPR → clôturer la situation à cette date
- [ ] **Cas 3 — Aucune situation identique :** créer une nouvelle situation professionnelle à la date de début de la LPR ; clôturer les situations précédentes incompatibles (ex : %TT cumulé > 100%, changement de statut, changement d'établissement) à `date_début - 1j`
- [ ] **Restriction des droits :** si après traitement le bénéficiaire n'a plus de situation pro active (ou seulement une situation CPA) et était en droits "Ouverts" → créer une situation de droits "Restreints" (sauf si la situation de droit existante est plus récente que l'info de présence)
- [ ] **Fin de restriction des droits :** si le bénéficiaire était en droits "Restreints" et est à nouveau présent → remplacer par une situation de droits "Ouverts" (sauf si la situation de droit existante est plus récente)
- [ ] **PM (Personnel Médical) :** ne pas écraser le statut médical existant ; si aucun statut médical, créer avec statut "Personnel médical"
- [ ] Enlever le verrou après traitement (y compris en cas d'erreur)
- [ ] Rollback en cas d'erreur ERR_LPR_04_A

**Codes d'erreur**

| Code | Niveau | Motif | Impact |
|------|--------|-------|--------|
| ERR_LPR_04_A | Agent / OUT-002 | "Erreur à la création ou à la mise à jour de la situation professionnelle" | Rejet de la ligne. Continue pour les autres agents. |

---

### IRIS-???? — LPR P2 : Traitement des bénéficiaires sans numéro CGOS — Création CGOS (LPR_05 + PRC::LPR_A)

**Type :** Story  
**Priorité :** Haute

**Description**

Pour les bénéficiaires de la boucle principale sans numéro CGOS, contrôler les critères obligatoires (PRC::LPR_A), évaluer l'éligibilité à la création automatique d'un numéro CGOS, puis créer la fiche bénéficiaire, le numéro CGOS et la situation professionnelle si éligible.

**Critères d'acceptance**

- [ ] **Contrôle des champs obligatoires (PRC::LPR_A) :**
  - Nom renseigné (PRC_1)
  - Prénom renseigné (PRC_2)
  - Email renseigné et format valide (PRC_3)
  - Date d'entrée renseignée et valide (PRC_4)
- [ ] **Critères d'éligibilité à la création automatique :**
  - Pas de numéro CGOS
  - ET établissement adhérent (déjà vérifié à LPR_02)
  - ET établissement identifié par SIRET (l'établissement a été déterminé à LPR_03)
  - ET "Accord conjoint de responsabilité signé" = Oui sur l'établissement
  - ET email renseigné et format valide
  - ET `Si_present = 1`
  - ET pas de date de sortie antérieure au 1er du mois concerné (ou date de sortie non renseignée)
- [ ] **Si éligible :** créer la fiche bénéficiaire + numéro CGOS (cf. SFD_06) + situation professionnelle (via PRC::LPR_B). En cas d'erreur, rollback global de ces 3 opérations.
- [ ] **Si non éligible :** ignorer la ligne (pas de rejet, pas de log d'erreur)

**Codes d'erreur**

| Code | Niveau | Motif | Impact |
|------|--------|-------|--------|
| ERR_LPR_05_A_\<ERR_PRC\> | Agent / OUT-002 | Voir PRC::LPR_A (codes 1 à 5) | Rejet + rollback. Continue pour les autres agents. |
| ERR_LPR_05_B | Agent / OUT-002 | "Erreur à l'enregistrement de présence" | Rejet + rollback. Continue pour les autres agents. |
| ERR_LPR_05_C | Agent / OUT-002 | "Erreur à la création ou à la mise à jour de la situation professionnelle" | Rejet + rollback. Continue pour les autres agents. |
| ERR_LPR_05_D | Agent / OUT-002 | "Erreur à la création du numéro CGOS" | Rejet + rollback. Continue pour les autres agents. |

---

### IRIS-???? — LPR P2 : Enregistrement de la présence en base (LPR_06)

**Type :** Story  
**Priorité :** Haute

**Description**

Pour chaque bénéficiaire non rejeté ayant un numéro CGOS, enregistrer sa présence dans la table PRESENCE si les conditions sont réunies.

**Critères d'acceptance**

- [ ] **Condition d'enregistrement :** `Si_present = 1` ET (pas de date de sortie OU date de sortie ≥ 1er du mois concerné) ET présence non déjà enregistrée pour cet établissement/période
- [ ] Si la condition est remplie : insérer un enregistrement dans la table PRESENCE pour l'établissement déterminé à LPR_03
- [ ] Si la condition n'est pas remplie : ne rien faire (ni log d'erreur, ni rejet)
- [ ] Rollback en cas d'erreur technique ERR_LPR_06_A

**Codes d'erreur**

| Code | Niveau | Motif | Impact |
|------|--------|-------|--------|
| ERR_LPR_06_A | Agent / OUT-002 | "Erreur à l'enregistrement de présence" | Rollback. Fin de traitement pour cet agent. Continue pour les autres. |

---

### IRIS-???? — LPR P2 : Incrémentation des indicateurs et effectifs en mémoire

**Type :** Task  
**Priorité :** Haute

**Description**

Après chaque traitement de bénéficiaire dans la boucle principale, mettre à jour les structures en mémoire : incrémenter les compteurs d'indicateurs PAC et les effectifs selon les valeurs du bénéficiaire.

**Critères d'acceptance**

- [ ] **Indicateurs :** incrémenter le bon compteur selon le résultat du traitement (succès, rejet par motif, ignoré, avertissement), pour le niveau Agent
- [ ] **Effectifs (uniquement pour les bénéficiaires présents et non rejetés) :**
  - **Statut (EFFECTIF_AGENT_STATUT) :** `Si_titulaire_stagiaire = 1` → catégorie `ACT51_STAT_TITULAIRE`, sinon → `ACT51_STAT_CONTRACTUEL` ; sexe déduit du 1er chiffre du NIR (1 ou 7 → homme, 2 ou 8 → femme)
  - **CSP (EFFECTIF_AGENT_CSP) :** mapping grade SAE → catégorie CSP via `REF::ACT_62` → `REF::ACT_52` ; sexe déduit du NIR
  - **Temps de travail (EFFECTIF_AGENT_TEMPS_TRAVAIL) :** mapping `%TT` → catégorie temps de travail via `REF::ACT_53` ; sexe déduit du NIR
- [ ] Pas d'accès base de données à cette étape : uniquement manipulation des structures en mémoire initialisées précédemment

---

### IRIS-???? — LPR P2 : Publication du message Avro bénéficiaire vers PAC

**Type :** Task  
**Priorité :** Haute

**Description**

Après chaque traitement individuel réussi d'un bénéficiaire dans la boucle principale, publier immédiatement un message Avro "traitement bénéficiaire" vers PAC (contrat d'interface OUT-002 dans IRIS_Interface_LPR).

**Critères d'acceptance**

- [ ] Construire le message Avro après chaque traitement de bénéficiaire (succès ou rejet)
- [ ] Publier immédiatement sur le topic Kafka dédié (pas d'accumulation pour publication en fin de traitement)
- [ ] Le message inclut : `traitement_id`, identifiant bénéficiaire, résultat du traitement, motif si rejet/erreur
- [ ] En cas d'erreur de publication Kafka, logger l'erreur et continuer le traitement (ne pas bloquer la boucle)

---

### IRIS-???? — LPR P2 : Alimentation des effectifs en base (LPR_07 — décembre uniquement)

**Type :** Story  
**Priorité :** Moyenne

**Description**

Après la boucle principale, si la LPR est celle du mois de décembre et que le paramètre applicatif `OUVERTURE_SAISIE_EFFECTIFS` est à `Oui`, persister les effectifs calculés en mémoire dans les tables `EFFECTIF_AGENT_*`.

**Critères d'acceptance**

- [ ] **Condition d'exécution :** mois de la LPR = décembre ET paramètre `OUVERTURE_SAISIE_EFFECTIFS = Oui`
- [ ] Pour chaque SIREN, pour chaque catégorie et pour l'exercice courant :
  - Enregistrement existant issu de la **LPR** → suppression logique + création du nouvel enregistrement
  - Enregistrement existant issu du **e-recensement ou manuel** → ne rien faire
  - Aucun enregistrement → créer
- [ ] `origine_effectif = 'LPR'` pour tous les enregistrements créés
- [ ] Mappings à respecter (cf. §4.2.6 SFD) :
  - `EFFECTIF_AGENT_STATUT` : entité juridique, exercice, catégorie statut, valeur homme, valeur femme, origine
  - `EFFECTIF_AGENT_CSP` : entité juridique, exercice, CSP (via REF::ACT_62), valeur homme, valeur femme, origine
  - `EFFECTIF_AGENT_TEMPS_TRAVAIL` : entité juridique, exercice, catégorie temps travail (via REF::ACT_53), valeur homme, valeur femme, origine
- [ ] Rollback en cas d'erreur ERR_LPR_07_A

**Codes d'erreur**

| Code | Niveau | Motif | Impact |
|------|--------|-------|--------|
| ERR_LPR_07_A | Etablissement | "Erreur à l'alimentation des effectifs pour l'établissement" | Fin de traitement pour cet établissement. Continue pour les autres. |

---

### IRIS-???? — LPR P2 : Publication des flux d'acquittement et indicateurs vers PAC (LPR_08)

**Type :** Story  
**Priorité :** Haute

**Description**

En fin de traitement du fichier LPR complet, publier les deux flux d'acquittement fonctionnel vers PAC et produire les logs fonctionnels IRIS de synthèse.

**Critères d'acceptance**

- [ ] **Flux OUT-001** (statut à la maille fichier) : publier l'indicateur de statut global de traitement (succès/échec technique) vers PAC, incluant les erreurs techniques rencontrées
- [ ] **Flux OUT-002** (indicateur agrégé) : publier l'indicateur par établissement avec le détail par agent, incluant :
  - Nombre de lignes lues par niveau (Etablissement / Agent)
  - Nombre de lignes traitées avec succès par niveau
  - Nombre de rejets par motif et par niveau
  - Nombre d'avertissements par niveau
  - Nombre d'ignorés par niveau
- [ ] **Logs fonctionnels IRIS** (cf. §4.2.4 SFD) : produire en fin de traitement la synthèse :
  - Lignes lues / traitées / rejetées / avertissements / ignorées par niveau
  - Nombre d'effectifs agrégés par statut, par CSP, par temps de travail

---

## Synthèse des tickets

| # | Ticket | Processus | Etape SFD | Priorité |
|---|--------|-----------|-----------|----------|
| 1 | Consommation Kafka et persistance temporaire | P1 | LPR_01 | Haute |
| 2 | Vérification complétude et déclenchement P2 | P1 | — | Haute |
| 3 | Orchestration du traitement complet | P2 | — | Haute |
| 4 | Pré-boucle SIREN — Résolution entités juridiques | P2 | LPR_02 (prép.) | Haute |
| 5 | Rejet établissements non adhérents | P2 | LPR_02 | Haute |
| 6 | Validation données de présence bénéficiaires | P2 | LPR_03 | Haute |
| 7 | RG fichier — Doublons email | P2 | PRC::LPR_A (cas 5) | Haute |
| 8 | Initialisation structures en mémoire | P2 | — | Haute |
| 9 | Traitement bénéficiaires avec CGOS (LPR_04 + PRC::LPR_B) | P2 | LPR_04 | Haute |
| 10 | Traitement bénéficiaires sans CGOS (LPR_05 + PRC::LPR_A) | P2 | LPR_05 | Haute |
| 11 | Enregistrement de la présence | P2 | LPR_06 | Haute |
| 12 | Incrémentation indicateurs et effectifs en mémoire | P2 | — | Haute |
| 13 | Publication Avro bénéficiaire → PAC | P2 | OUT-002 (unitaire) | Haute |
| 14 | Alimentation effectifs en base (décembre) | P2 | LPR_07 | Moyenne |
| 15 | Publication acquittement et indicateurs → PAC | P2 | LPR_08 | Haute |
