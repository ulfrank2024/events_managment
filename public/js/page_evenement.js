document.addEventListener("DOMContentLoaded", async () => {
    // Récupérer l'ID de l'événement depuis l'URL
    const eventId = window.location.pathname.split("/").pop();
    const eventDetailsContainer = document.getElementById("event-details");

    if (eventDetailsContainer) {
        try {
            const response = await fetch(`/api/evenement/${eventId}`);
            if (!response.ok)
                throw new Error("Erreur lors du chargement de l'événement");

            const event = await response.json();

            // Générer et insérer le HTML pour l'événement
            eventDetailsContainer.innerHTML = `
                <div class="blockevenement">
                    <img class="imagedescription" src="${
                        event.image_url
                    }" alt="${event.title}" width="400px" height="300px" />
                     <div class="blockevenement1">
                    <h3>${event.title}</h3>
                    <p class="blocdescription">Description : ${
                        event.description || "Aucune description disponible"
                    }</p>
                    <p>Date : ${event.date}</p>
                    <p>Lieu : ${event.location || "Lieu non précisé"}</p>
                    <p class="price">${
                        event.details || "Aucun détail supplémentaire"
                    }</p>
                     </div>
                   
                </div>
                 <div class="blockbutton">
                        <button class="inscriptionEvenement" data-id="${
                            event.id
                        }">S'inscrire</button>
                        <p class="messageErreur" style="color: red; display: none;"></p>
                    </div>
            `;

            // Gérer l'inscription
            document
                .querySelector(".inscriptionEvenement")
                .addEventListener("click", async () => {
                    await inscrireUtilisateur(event.id);
                });
        } catch (error) {
            console.error("Erreur :", error);
            eventDetailsContainer.innerHTML =
                "<p>Impossible de charger les détails de l'événement.</p>";
        }
    }

    // Charger tous les événements
    const eventsContainer = document.getElementById("events-container");
    if (eventsContainer) {
        try {
            const response = await fetch("/events");
            if (!response.ok)
                throw new Error("Erreur lors du chargement des événements");

            const evenements = await response.json();

            eventsContainer.innerHTML = evenements
                .map(
                    (event) => `
                <div class="blockevenement">
                    <img src="${event.image_url}" alt="${event.title}" width="400px" height="300px" />
                    <h3>${event.title}</h3>
                    <p>Description : ${event.description}</p>
                    <p>Date : ${event.date}</p>
                    <p>Lieu : ${event.location}</p>
                    <div class="blockbutton">
                        <button class="inscriptionEvenement" data-id="${event.id}">S'inscrire</button>
                        <button class="voirevenement" data-id="${event.id}">Voir</button>
                        <p class="messageErreur" style="color: red; display: none;"></p>
                    </div>
                </div>
            `
                )
                .join("");

            // Gérer la navigation vers la page de détails
            document.querySelectorAll(".voirevenement").forEach((button) => {
                button.addEventListener("click", (event) => {
                    const eventId = event.target.getAttribute("data-id");
                    window.location.href = `/evenement/${eventId}`;
                });
            });

            // Gérer les inscriptions
            document
                .querySelectorAll(".inscriptionEvenement")
                .forEach((button) => {
                    button.addEventListener("click", async (event) => {
                        const eventId = event.target.getAttribute("data-id");
                        await inscrireUtilisateur(eventId);
                    });
                });
        } catch (error) {
            console.error("Erreur :", error);
            eventsContainer.innerHTML =
                "<p>Impossible de charger les événements.</p>";
        }
    }
});

// Fonction pour gérer l'inscription d'un utilisateur
async function inscrireUtilisateur(eventId) {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("Veuillez vous connecter pour vous inscrire.");
        return;
    }

    try {
        const response = await fetch("/inscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, event_id: eventId }),
        });

        const result = await response.json(); // Récupérer la réponse JSON

        if (!response.ok) {
            // Afficher le message d'erreur du serveur
            document.querySelector(
                `button[data-id="${eventId}"]`
            ).nextElementSibling.textContent =
                result.message ||
                "Échec de l'inscription. Vous êtes peut-être déjà inscrit.";
            document.querySelector(
                `button[data-id="${eventId}"]`
            ).nextElementSibling.style.display = "block";
            return; // Sortir de la fonction pour ne pas afficher l'alerte de succès
        }

        alert("Inscription réussie !");
    } catch (error) {
        console.error("Erreur :", error);
        document.querySelector(
            `button[data-id="${eventId}"]`
        ).nextElementSibling.textContent =
            "Échec de l'inscription. Vous êtes peut-être déjà inscrit.";
        document.querySelector(
            `button[data-id="${eventId}"]`
        ).nextElementSibling.style.display = "block";
    }
}
