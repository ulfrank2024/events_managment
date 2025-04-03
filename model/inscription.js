import { connexion } from "../db/db.js";
import { createNotification } from "../model/notification.js";
import { sendEmail } from "../service/emailService.js"; // Import du service d'email

// Inscription à un événement
export async function registerForEvent(user_id, event_id) {
    try {
        // Vérifier si l'utilisateur est déjà inscrit
        const existing = await connexion.get(
            "SELECT COUNT(*) as count FROM participants WHERE user_id = ? AND event_id = ? AND status = 'inscrit'",
            [user_id, event_id]
        );

        if (existing.count > 0) {
            throw new Error("Vous êtes déjà inscrit à cet événement.");
        }

        // Récupérer les informations de l'événement
        const event = await connexion.get(
            "SELECT title, description, date, location FROM events WHERE id = ?",
            [event_id]
        );

        if (!event) {
            throw new Error("Événement non trouvé.");
        }

        // Inscription de l'utilisateur dans la table participants
        await connexion.run(
            "INSERT INTO participants (user_id, event_id, status) VALUES (?, ?, 'inscrit')",
            [user_id, event_id]
        );

        // Inscription dans la table inscriptions avec la date
        await connexion.run(
            "INSERT INTO inscriptions (user_id, event_id, date_inscription) VALUES (?, ?, datetime('now', 'localtime'))",
            [user_id, event_id]
        );

        // Récupérer l'email de l'utilisateur
        const user = await connexion.get(
            "SELECT email FROM users WHERE id = ?",
            [user_id]
        );
        if (!user || !user.email) {
            throw new Error(
                "Impossible de récupérer l'adresse e-mail de l'utilisateur."
            );
        }

        // Ajouter une notification pour l'utilisateur
        await createNotification(
            user_id,
            `Vous êtes inscrit à l'événement : ${event.title} (${event.date}) 
            - ${event.location}. Description: ${event.description}`
        );

        // Envoyer un email de confirmation
        await sendEmail(
            user.email,
            "Inscription confirmée",
            `Vous êtes inscrit à l'événement : ${event.title} (${event.date}) - ${event.location}. Description: ${event.description}`
        );

        return {
            success: true,
            message: "Inscription réussie et email envoyé !",
        };
    } catch (error) {
        console.error("Erreur lors de l'inscription à l'événement :", error);
        throw error;
    }

}
// Annulation d'inscription à un événement
export async function cancelEventRegistration(user_id, event_id) {
    try {
        // Récupérer les informations de l'événement
        const event = await connexion.get(
            "SELECT title, description, date, location FROM events WHERE id = ?",
            [event_id]
        );

        if (!event) {
            throw new Error("Événement non trouvé.");
        }

        await connexion.run(
            "UPDATE participants SET status = 'annulé' WHERE user_id = ? AND event_id = ?",
            [user_id, event_id]
        );

        // Récupérer l'email de l'utilisateur
        const user = await connexion.get(
            "SELECT email FROM users WHERE id = ?",
            [user_id]
        );
        if (!user || !user.email) {
            throw new Error(
                "Impossible de récupérer l'adresse e-mail de l'utilisateur."
            );
        }

        // Ajouter une notification pour l'utilisateur
        await createNotification(
            user_id,
            `Vous avez annulé votre inscription à l'événement : ${event.title} (${event.date}) - ${event.location}. Description: ${event.description}`
        );

        // Envoyer un email de confirmation d'annulation
        await sendEmail(
            user.email,
            "Annulation d'inscription",
            `Vous avez annulé votre inscription à l'événement : ${event.title} (${event.date}) - ${event.location}. Description: ${event.description}`
        );

        return {
            success: true,
            message: "Inscription annulée et email envoyé !",
        };
    } catch (error) {
        console.error("Erreur lors de l'annulation de l'inscription :", error);
        throw error;
    }
}

// Récupérer le nombre d'événements auxquels un utilisateur est inscrit
export async function getStudentEventCount(user_id) {
    try {
        const result = await connexion.get(
            "SELECT COUNT(*) as count FROM participants WHERE user_id = ? AND status = 'inscrit'",
            [user_id]
        );
        return result.count;
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre d'événements :", error);
        throw error;
    }
}

// Récupérer les événements auxquels l'utilisateur est inscrit
export async function getStudentEvents(user_id) {
    try {
        const events = await connexion.all(
            "SELECT events.* FROM events INNER JOIN participants ON events.id = participants.event_id WHERE participants.user_id = ? AND participants.status = 'inscrit'",
            [user_id]
        );

        console.log(`📌 Événements trouvés pour user_id=${user_id}:`, events);
        return events;
    } catch (error) {
        console.error("❌ Erreur récupération événements :", error);
        throw error;
    }
}
export async function getnumberInscription() {
    try {
        // Récupérer le nombre d'inscriptions à la plateforme par mois
        const registrations = await connexion.all(
            `SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS count
             FROM users
             GROUP BY strftime('%Y-%m', created_at)
             ORDER BY month ASC`
        );

        return registrations;
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des inscriptions :",
            error
        );
        throw error;
    }
}
export async function getInscription() {
    try {
        const inscriptions = await connexion.all(`
      SELECT 
                users.name AS nom_utilisateur,
                events.title AS titre_evenement,
                events.date AS date_evenement,
                inscriptions.date_inscription AS date_inscription
            FROM participants
            JOIN users ON participants.user_id = users.id
            JOIN events ON participants.event_id = events.id
            JOIN inscriptions ON participants.user_id = inscriptions.user_id AND participants.event_id = inscriptions.event_id;
        `);

        return inscriptions;
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des inscriptions :",
            error
        );
        throw error;
    }
}


