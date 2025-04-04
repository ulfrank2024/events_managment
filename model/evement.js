import { existsSync, unlinkSync } from "fs";
import { connexion } from "../db/db.js";
import {createNotification} from "../model/notification.js"
// fonction pour creer un evenement
/**
 * @swagger
 * /events:
 * post:
 * summary: Créer un événement
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * title: { type: string }
 * description: { type: string }
 * date: { type: string, format: date-time }
 * location: { type: string }
 * organizer_id: { type: integer }
 * image_url: { type: string }
 * category: { type: string }
 * responses:
 * 200:
 * description: Succès
 * 400:
 * description: Salle réservée
 * 500:
 * description: Erreur serveur
 */
export async function createEvent(
    title,
    description,
    date,
    location,
    organizer_id,
    image_url,
    category // Ajouter la catégorie ici
) {
    // Vérifier si un événement existe déjà à la même date et dans la même salle
    const existingEvent = await connexion.get(
        "SELECT id, title FROM events WHERE date = ? AND location = ?",
        [date, location]
    );

    if (existingEvent) {
        await createNotification(
            organizer_id,
            `La salle est déjà réservée pour l'événement "${existingEvent.title}" à cette date.`
        );
        throw new Error(
            "Impossible de créer l'événement : la salle est déjà réservée à cette date."
        );
    }

    // Insérer le nouvel événement avec la catégorie
    await connexion.run(
        "INSERT INTO events (title, description, date, location, organizer_id, image_url, category) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, description, date, location, organizer_id, image_url, category]
    );

    await createNotification(
        organizer_id,
        `Un nouvel événement a été créé : ${title}`
    );
}
//fonction pour recuperer tous les element par cathegorie
/**
 * @swagger
 * /events/category/{category}:
 * get:
 * summary: Événements par catégorie
 * parameters:
 * - in: path, name: category, required: true, schema: { type: string }
 * responses:
 * 200:
 * description: Liste des événements
 * 500:
 * description: Erreur serveur
 */
export async function GetEventsByCategory(category) {
    try {
        const events = await connexion.all(
            "SELECT * FROM events WHERE category = ?",
            [category]
        );
        return events;
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des événements par catégorie :",
            error
        );
        throw error;
    }
}
//fonction pour compter tous les element par cathegorie
/**
 * @swagger
 * /events/category/count:
 * get:
 * summary: Compter les événements par catégorie
 * responses:
 * 200:
 * description: Nombre d'événements par catégorie
 * 500:
 * description: Erreur serveur
 */
export async function GetEventCountByCategory() {
    try {
        const categories = await connexion.all(`
            SELECT category, COUNT(*) as count
            FROM events
            GROUP BY category
        `);
        return categories;
    } catch (error) {
        console.error(
            "Erreur lors de la récupération du nombre d'événements par catégorie :",
            error
        );
        throw error;
    }
}


//fonction pour recuperer tous les element
/**
 * @swagger
 * /events:
 * get:
 * summary: Tous les événements
 * responses:
 * 200:
 * description: Liste de tous les événements
 * 500:
 * description: Erreur serveur
 */
export async function GetAllEvent() {
    try {
        const events = await connexion.all("SELECT * FROM events");
        return events;
    } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
        throw error;
    }
}

// Fonction pour supprimer un événement
/**
 * @swagger
 * /events/{id}:
 * delete:
 * summary: Supprimer un événement
 * parameters:
 * - in: path, name: id, required: true, schema: { type: integer }
 * responses:
 * 200:
 * description: Succès
 * 404:
 * description: Non trouvé
 * 500:
 * description: Erreur serveur
 */
export async function DeletEvent(id) {
    try {
        console.log(`🔍 Suppression de l'événement ID : ${id}`);

        // Vérifier si l'événement existe
        const event = await connexion.get("SELECT * FROM events WHERE id = ?", [id]);
        if (!event) {
            console.log("⚠️ Événement introuvable.");
            return { success: false, message: "Événement introuvable" };
        }

        console.log("📌 Événement trouvé :", event);

        // Supprimer l'image si elle existe
        if (event.image_url && existsSync(event.image_url)) {
            unlinkSync(event.image_url);
            console.log("🖼️ Image supprimée :", event.image_url);
        }

        // Supprimer l'événement
        await connexion.run("DELETE FROM events WHERE id = ?", [id]);
        console.log("✅ Événement supprimé de la base de données.");

        // Ajouter une notification pour l'organisateur
        await createNotification(event.organizer_id, `L'événement "${event.title}" a été supprimé.`);
        console.log("📩 Notification envoyée.");

        return { success: true, message: "Événement supprimé" };
    } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'événement :", error);
        return { success: false, message: "Erreur serveur" };
    }
}

//*****fonction pour modifier un evenement */
/**
 * @swagger
 * /events/{eventId}:
 * put:
 * summary: Mettre à jour un événement
 * parameters:
 * - in: path, name: eventId, required: true, schema: { type: integer }
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties: { title: { type: string }, description: { type: string }, date: { type: string, format: date-time }, location: { type: string }, organizer_id: { type: integer }, image_url: { type: string }, category: { type: string } }
 * responses:
 * 200:
 * description: Succès
 * 404:
 * description: Non trouvé
 * 500:
 * description: Erreur serveur
 */
export async function updateEvent(
    eventId,
    title,
    description,
    date,
    location,
    organizer_id,
    image_url,
    category
) {
    // Vérification si l'événement existe déjà
    const existingEvent = await connexion.get(
        "SELECT id FROM events WHERE id = ?",
        [eventId]
    );

    if (!existingEvent) {
        throw new Error("Événement non trouvé");
    }

    // Mise à jour de l'événement
    await connexion.run(
        `UPDATE events
         SET title = ?, description = ?, date = ?, location = ?, organizer_id = ?, image_url = ?, category = ?
         WHERE id = ?`,
        [
            title,
            description,
            date,
            location,
            organizer_id,
            image_url,
            category,
            eventId,
        ]
    );

    return {
        eventId,
        title,
        description,
        date,
        location,
        organizer_id,
        image_url,
        category,
    };
}


// Fonction pour récupérer un événement par ID
/**
 * @swagger
 * /events/{id}:
 * get:
 * summary: Récupérer un événement par ID
 * parameters:
 * - in: path, name: id, required: true, schema: { type: integer }
 * responses:
 * 200:
 * description: Événement trouvé
 * 404:
 * description: Non trouvé
 * 500:
 * description: Erreur serveur
 */
export async function GetEventById(id) {
    try {
        const event = await connexion.get("SELECT * FROM events WHERE id = ?", [
            id,
        ]);

        // Vérification si l'événement est trouvé
        if (!event) {
            console.log(`Aucun événement trouvé pour l'ID ${id}`);
            return null;
        }

        return event;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'événement :", error);
        console.error("Détails de l'erreur :", error.stack); // Afficher la stack trace complète
        throw error;
    }
}



// Fonction pour compter le nombre d'événements auxquels un étudiant est inscrit
/**
 * @swagger
 * /students/{user_id}/events/count:
 * get:
 * summary: Compter les événements d'un étudiant
 * parameters:
 * - in: path, name: user_id, required: true, schema: { type: integer }
 * responses:
 * 200:
 * description: Nombre d'événements de l'étudiant
 * 500:
 * description: Erreur serveur
 */
export async function getEventCountForStudent(user_id) {
    try {
        const result = await connexion.get(
            "SELECT COUNT(*) AS event_count FROM participants WHERE user_id = ? AND status = 'inscrit'",
            [user_id]
        );
        return result.event_count;
    } catch (error) {
        console.error(
            "Erreur lors du comptage des événements de l'étudiant :",
            error
        );
        throw error;
    }
}

// Fonction pour compter le nombre total d'étudiants
/**
 * @swagger
 * /students/total:
 * get:
 * summary: Compter tous les étudiants
 * responses:
 * 200:
 * description: Nombre total d'étudiants
 * 500:
 * description: Erreur serveur
 */
export async function getTotalStudents() {
    try {
        const result = await connexion.get(
            "SELECT COUNT(*) AS student_count FROM users WHERE role = 'participant'"
        );
        return result.student_count;
    } catch (error) {
        console.error("Erreur lors du comptage des étudiants :", error);
        throw error;
    }
}

// Fonction pour compter le nombre total d'événements enregistrés
/**
 * @swagger
 * /students/total:
 * get:
 * summary: Compter tous les étudiants
 * responses:
 * 200:
 * description: Nombre total d'étudiants
 * 500:
 * description: Erreur serveur
 */
export async function getTotalEvents() {
    try {
        const result = await connexion.get(
            "SELECT COUNT(*) AS event_count FROM events"
        );
        return result.event_count;
    } catch (error) {
        console.error("Erreur lors du comptage des événements :", error);
        throw error;
    }
}
//fonction qui permet de récupérer un événement par son ID 
/**
 * @swagger
 * /students/total:
 * get:
 * summary: Compter tous les étudiants
 * responses:
 * 200:
 * description: Nombre total d'étudiants
 * 500:
 * description: Erreur serveur
 */
export async function GetEventDetailsById(id) {
    try {
        const event = await connexion.get("SELECT * FROM events WHERE id = ?", [
            id,
        ]);
        return event;
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des détails de l'événement :",
            error
        );
        throw error;
    }
}
/**
 * @swagger
 * /students/total:
 * get:
 * summary: Compter tous les étudiants
 * responses:
 * 200:
 * description: Nombre total d'étudiants
 * 500:
 * description: Erreur serveur
 */
export async function checkIfEventExists(date, location) {
    try {
        const event = await connexion.get(
            "SELECT * FROM events WHERE date = ? AND location = ?",
            [date, location]
        );

        return event
    } catch (error) {
        console.error("Erreur lors de la vérification de l'événement :", error);
        throw error;
    }
}