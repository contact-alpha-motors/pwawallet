# **App Name**: MyWallet PWA

## Core Features:

- Vue d'ensemble du tableau de bord: Afficher le solde actuel et le total des dépenses mensuelles.
- Formulaire d'ajout de transaction: Formulaire pour saisir les détails de la transaction : montant, description, catégorie et type (dépense/revenu). Les champs Bénéficiaire, Motif et Domaine ne sont pas obligatoires. Le champ Date est par défaut à aujourd'hui.
- Historique des transactions: Liste des transactions triées par date, les plus récentes en premier.
- Persistance hors ligne: Activer la persistance des données hors ligne via LocalStorage pour garantir que les données ne soient pas perdues lorsque l'utilisateur est hors ligne. Cela garantira qu'aucun backend n'est nécessaire initialement.
- Installation PWA: Implémenter un Service Worker pour rendre l'application installable sur les appareils mobiles, se comportant comme une application native.
- Réinitialisation des données: Fournir une option pour réinitialiser/effacer toutes les données stockées localement.

## Style Guidelines:

- Couleur primaire : Un vert désaturé (#90EE90) pour les revenus, reflétant la croissance et la positivité.
- Couleur de fond : Gris neutre clair (#F5F5F5) pour un look propre et moderne.
- Couleur d'accent : Un jaune chaud et analogue (#FFFFE0) pour les éléments interactifs, indiquant l'importance.
- Police : 'PT Sans', une police sans-serif pour maintenir un look moderne et une lisibilité, bon pour les en-têtes et le corps.
- Icônes Lucide-React : Icônes cohérentes et propres pour les catégories et les actions.
- Conception mobile-first et responsive utilisant Tailwind CSS. Disposition basée sur des cartes avec des ombres subtiles.
- Transitions fluides lors de l'ajout/suppression de transactions pour une meilleure UX.