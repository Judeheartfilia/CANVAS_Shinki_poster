Poster Fuji interactif
Un projet Canvas HTML5 qui affiche une affiche "Fuji" avec plusieurs animations :

Branches interactives en haut de l’affiche (3 images), qui réagissent au mouvement de la souris avec rotation, déplacement, et bruit à l’approche.

Pétales de cerisier qui tombent doucement.

Soleil animé avec des rayons tournants.

Banc de carpes koi (5 poissons) qui nagent doucement dans l’affiche.

Affiche redimensionnable et responsive avec gestion du scaling.

Installation
Clone le dépôt ou récupère les fichiers.

Mets les images dans un dossier /assets :

bg-fuji.jpg

sakura.png

branche.png, branche2.png, branche3.png

koi1.png, koi2.png, koi3.png

branch-sound.mp3 (son pour branches)

Ouvre la page HTML qui intègre main.ts compilé en JS, avec un <canvas id="canvas"></canvas>.

Usage
Passe la souris sur les branches en haut pour les voir bouger et entendre un son.

Regarde les pétales tomber doucement.

Observe les rayons animés du soleil.

Admire le banc de carpes koi qui nage dans l’affiche.

Structure du projet
main.ts : code principal de l’animation (canvas, classes, gestion souris, sons).

/assets/ : dossier contenant toutes les images et sons.

Personnalisation
Tu peux modifier la taille des branches en changeant le paramètre scale dans la classe Branch.

Modifier le nombre de pétales via la constante PETAL_COUNT.

Modifier la vitesse et taille des poissons koi dans la classe Fish.

Dépendances
Aucun framework, code vanilla TypeScript / JavaScript.

Utilise l’API Canvas 2D native.

Remarques
Le son des branches peut ne pas se lancer automatiquement sur certains navigateurs sans interaction utilisateur.

Le canvas est automatiquement redimensionné à la taille de la fenêtre.
