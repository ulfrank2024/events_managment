import { connexion } from "../db/db.js";
import { sendEmail } from "../service/emailService.js";

// fonction pour Créer une notification
/**
 * @swagger
 * /notifications:
 * post:
 * summary: Créer une notification pour un utilisateur.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * user_id:
 * type: integer
 * message:
 * type: string
 * responses:
 * 200:
 * description: Notification créée et email envoyé (si applicable).
 * 500:
 * description: Erreur serveur.
 */
export async function createNotification(user_id, message) {
    try {
        // Insérer la notification dans la base de données
        await connexion.run(
            "INSERT INTO notifications (user_id, message, sent_at) VALUES (?, ?, datetime('now'))",
            [user_id, message]
        );

        console.log("✅ Notification insérée :", { user_id, message });

        // Récupérer l'e-mail de l'utilisateur
        const user = await connexion.get(
            "SELECT email FROM users WHERE id = ?",
            [user_id]
        );

        if (user && user.email) {
            // Envoyer l'e-mail au destinataire
            await sendEmail(user.email, "Nouvelle Notification", message);
            console.log(`📩 E-mail envoyé à ${user.email} avec succès !`);
        } else {
            console.warn(
                `⚠️ Aucun e-mail trouvé pour l'utilisateur ID ${user_id}`
            );
        }
    } catch (error) {
        console.error(
            "❌ Erreur lors de la création de la notification :",
            error
        );
    }
}
// fonction pour Récupérer les notifications d'un utilisateur
/**
 * @swagger
 * /notifications/{user_id}:
 * get:
 * summary: Récupérer les notifications d'un utilisateur.
 * parameters:
 * - in: path
 * name: user_id
 * required: true
 * description: ID de l'utilisateur.
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Liste des notifications de l'utilisateur.
 * 500:
 * description: Erreur serveur.
 */
export async function getNotifications(user_id) {
    console.log("🔍 Vérification user_id:", user_id);
    const notifications = await connexion.all(
        "SELECT id, user_id, message, sent_at FROM notifications WHERE user_id = ? ORDER BY sent_at DESC",
        [user_id]
    );

    return notifications;
}

// ✅ Fonction pour supprimer une notification par ID
/**
 * @swagger
 * /notifications/{notification_id}:
 * delete:
 * summary: Supprimer une notification par ID.
 * parameters:
 * - in: path
 * name: notification_id
 * required: true
 * description: ID de la notification.
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Notification supprimée avec succès.
 * 500:
 * description: Erreur serveur.
 */
export async function deleteNotification(notification_id) {
    try {
        await connexion.run("DELETE FROM notifications WHERE id = ?", [
            notification_id,
        ]);
        console.log("✅ Notification supprimée avec succès !");
    } catch (error) {
        console.error(
            "❌ Erreur lors de la suppression de la notification :",
            error
        );
    }
}
