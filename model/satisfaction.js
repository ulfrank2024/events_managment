import { connexion } from "../db/db.js";

// Fonction pour récupérer la moyenne des notes et le nombre d'avis
/**
 * @swagger
 * /satisfaction/site:
 * get:
 * summary: Récupérer la moyenne des notes et le nombre d'avis pour le site.
 * responses:
 * 200:
 * description: Tableau des notes moyennes et du nombre d'avis.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * category:
 * type: integer
 * description: La note (rating).
 * count:
 * type: integer
 * description: Le nombre d'avis pour cette note.
 * 500:
 * description: Erreur serveur.
 */
export async function siteSatisfaction() {
    try {
        // Utiliser `connexion.all()` pour récupérer toutes les lignes
        const result = await connexion.all(
            `SELECT rating AS category, COUNT(*) AS count 
             FROM site_satisfaction 
             WHERE event_id IS NULL 
             GROUP BY rating` // Filtrer uniquement les évaluations globales
        );
        return result; // Renvoie un tableau des résultats
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des évaluations",
            error.message
        );
        return null;
    }
}

// Fonction pour enregistrer la satisfaction du site
/**
 * @swagger
 * /satisfaction/site:
 * post:
 * summary: Enregistrer la satisfaction du site.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * user_id:
 * type: integer
 * description: L'ID de l'utilisateur.
 * rating:
 * type: integer
 * description: La note attribuée par l'utilisateur.
 * responses:
 * 200:
 * description: Satisfaction enregistrée avec succès.
 * 500:
 * description: Erreur serveur.
 */
export async function ateSiteSatisfaction(user_id, rating) {
    try {
        const result = await connexion.run(
            `INSERT INTO site_satisfaction (user_id, rating, event_id) 
             VALUES (?, ?, NULL)`, // NULL pour event_id si c'est une évaluation globale
            [user_id, rating]
        );
        return result;
    } catch (error) {
        console.error(
            "Erreur lors de l'enregistrement de la satisfaction",
            error.message
        );
        return null;
    }
}
