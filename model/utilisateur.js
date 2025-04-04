import { connexion } from "../db/db.js";
import bcrypt from "bcryptjs";


// ✅ Récupérer un utilisateur par ID
/**
 * @swagger
 * /users/{id_utilisateur}:
 * get:
 * summary: Récupérer un utilisateur par ID.
 * parameters:
 * - in: path
 * name: id_utilisateur
 * required: true
 * description: ID de l'utilisateur.
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Utilisateur trouvé.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * id:
 * type: integer
 * name:
 * type: string
 * email:
 * type: string
 * role:
 * type: string
 * created_at:
 * type: string
 * format: date-time
 * 404:
 * description: Utilisateur non trouvé.
 * 500:
 * description: Erreur serveur.
 */
export async function getUtilisateurById(id_utilisateur) {
    try {
        return await connexion.get(`SELECT * FROM users WHERE id = ?`, [
            id_utilisateur,
        ]);
    } catch (error) {
        console.error(
            "Erreur lors de la récupération de l'utilisateur :",
            error.message
        );
        return null;
    }
}

// ✅ Récupérer un utilisateur par courriel
/**
 * @swagger
 * /users/email/{courriel}:
 * get:
 * summary: Récupérer un utilisateur par courriel.
 * parameters:
 * - in: path
 * name: courriel
 * required: true
 * description: Courriel de l'utilisateur.
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Utilisateur trouvé.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * id:
 * type: integer
 * name:
 * type: string
 * email:
 * type: string
 * role:
 * type: string
 * created_at:
 * type: string
 * format: date-time
 * 404:
 * description: Utilisateur non trouvé.
 * 500:
 * description: Erreur serveur.
 */
export async function getUtilisateurByCourriel(courriel) {
    try {
        return await connexion.get(`SELECT * FROM users WHERE email = ?`, [
            courriel,
            
        ]);
    } catch (error) {
        console.error(
            "Erreur lors de la récupération de l'utilisateur :",
            error.message
        );
        return null;
    }
}
export async function utilisateurcomplet() {
    try {
        const utilisateur = await connexion.all(
            `SELECT id, name, email, role, created_at FROM users`
        );
        return utilisateur;
    } catch (error) {
        console.error(
            "Erreur lors de la recuperation des utilisateur :",
            error.message
        );
        return null;
    }
}


// ✅ Ajouter un utilisateur avec hashage du mot de passe
/**
 * @swagger
 * /users:
 * get:
 * summary: Récupérer tous les utilisateurs.
 * responses:
 * 200:
 * description: Liste de tous les utilisateurs.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id:
 * type: integer
 * name:
 * type: string
 * email:
 * type: string
 * role:
 * type: string
 * created_at:
 * type: string
 * format: date-time
 * 500:
 * description: Erreur serveur.
 */
export async function addUtilisateur(name, email, password, role) {
    try {
        console.log("Mot de passe reçu avant hashage :", password);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Vérifier si l'utilisateur existe déjà
        const utilisateurExistant = await getUtilisateurByCourriel(email);
        if (utilisateurExistant) {
            throw new Error("Un utilisateur avec ce courriel existe déjà.");
        }

        // Insérer l'utilisateur
        const result = await connexion.run(
            `INSERT INTO users (name, email, password_hash, role) 
             VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, role]
        );

        console.log("Nouvel utilisateur ajouté avec l'ID :", result.lastID);
        return result.lastID;
    } catch (error) {
        console.error(
            "Erreur lors de l'ajout d'un utilisateur :",
            error.message
        );
        return null;
    }
}

// ✅ Afficher le profil d'un utilisateur
/**
 * @swagger
 * /users:
 * post:
 * summary: Ajouter un nouvel utilisateur.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * email:
 * type: string
 * password:
 * type: string
 * role:
 * type: string
 * responses:
 * 201:
 * description: Utilisateur ajouté avec succès.
 * 400:
 * description: Utilisateur avec ce courriel existe déjà.
 * 500:
 * description: Erreur serveur.
 */
export async function GetUserProfile(user_id) {
    try {
        return await connexion.get(
            `SELECT id, name, email, role FROM users WHERE id = ?`,
            [user_id]
        );
    } catch (error) {
        console.error(
            "Erreur lors de la récupération du profil :",
            error.message
        );
        return null;
    }
}
