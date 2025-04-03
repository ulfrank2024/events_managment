document.addEventListener("DOMContentLoaded", async function () {
    const category = document
        .querySelector("h1")
        .textContent.replace("Événements de la catégorie : ", "")
        .trim();
    const userId = localStorage.getItem("user_id"); // Récupérer l'ID de l'utilisateur
    const userRole = localStorage.getItem("user_role"); // Récupérer le rôle de l'utilisateur

    try {
        // Récupérer les événements via l'API
        const response = await fetch(`/api/categories/${category}`);
        const data = await response.json();

        // Si des événements sont trouvés, on met à jour l'HTML
        if (data.length > 0) {
            const eventsList = document.querySelector(".events-list"); // Cible la classe 'events-list'
            eventsList.innerHTML = ""; // Réinitialiser la liste d'événements

            data.forEach((event) => {
                // Créer un élément pour chaque événement
                const eventCard = document.createElement("div");
                eventCard.classList.add("event-card"); // Cible la classe 'event-card'
                eventCard.setAttribute("data-event-id", event.id); // Ajout d'un attribut data-event-id

                const eventTitle = document.createElement("h2");
                eventTitle.textContent = event.title;
                eventCard.appendChild(eventTitle);

                const eventDate = document.createElement("p");
                eventDate.innerHTML = `<strong>Date :</strong> ${event.date}`;
                eventCard.appendChild(eventDate);

                const eventLocation = document.createElement("p");
                eventLocation.innerHTML = `<strong>Lieu :</strong> ${event.location}`;
                eventCard.appendChild(eventLocation);

                const eventDescription = document.createElement("p");
                eventDescription.innerHTML = `<strong >Description :</strong> ${event.description}`;
                eventCard.appendChild(eventDescription);

                if (event.image_url) {
                    const eventImage = document.createElement("img");
                    eventImage.src = event.image_url;
                    eventImage.alt = "Image de l'événement";
                    eventCard.appendChild(eventImage);
                }

                // Ajout des boutons "Voir" et "S'inscrire"
                const buttonsDiv = document.createElement("div");
                buttonsDiv.classList.add("blockbutton");

                const voirButton = document.createElement("button");
                voirButton.classList.add("voirevenement");
                voirButton.textContent = "Voir";
                voirButton.setAttribute("data-id", event.id);
                buttonsDiv.appendChild(voirButton);

                // Vérification du rôle avant d'afficher le bouton "S'inscrire"
                if (userId && userRole !== "administrateur") {
                    const inscrireButton = document.createElement("button");
                    inscrireButton.classList.add("inscriptionEvenement");
                    inscrireButton.textContent = "S'inscrire";
                    inscrireButton.setAttribute("data-id", event.id);
                    buttonsDiv.appendChild(inscrireButton);
                } else if (!userId) {
                    const redirectConnexion = document.createElement("button");
                    redirectConnexion.classList.add("redirectConnexion");
                    redirectConnexion.textContent = "S'inscrire";
                    buttonsDiv.appendChild(redirectConnexion);
                }

                eventCard.appendChild(buttonsDiv);
                eventsList.appendChild(eventCard);

                const errorMessage = document.createElement("p");
                errorMessage.classList.add("message-erreur");
                errorMessage.style.color = "red";
                errorMessage.style.display = "none";
                eventCard.appendChild(errorMessage);
            });

            // Gestionnaires d'événements pour les boutons
            document.querySelectorAll(".voirevenement").forEach((button) => {
                button.addEventListener("click", (event) => {
                    const eventId = event.target.getAttribute("data-id");
                    window.location.href = `/evenement/${eventId}`;
                });
            });

            document
                .querySelectorAll(".inscriptionEvenement")
                .forEach((button) => {
                    button.addEventListener("click", async (event) => {
                        const eventId = event.target.getAttribute("data-id");

                        try {
                            const response = await fetch("/inscription", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    user_id: userId,
                                    event_id: eventId,
                                }),
                            });

                            const responseData = await response.json();
                            const eventCard =
                                event.target.closest(".event-card");
                            const errorMessage =
                                eventCard.querySelector(".message-erreur");

                            if (!response.ok) {
                                errorMessage.textContent =
                                    responseData.message ||
                                    "Vous êtes déjà inscrit.";
                                errorMessage.style.display = "block";
                                return;
                            }

                            event.target.disabled = true;
                            event.target.textContent = "Déjà inscrit";
                            errorMessage.style.display = "none";
                        } catch (error) {
                            console.error("Erreur :", error);
                        }
                    });
                });

            document
                .querySelectorAll(".redirectConnexion")
                .forEach((button) => {
                    button.addEventListener("click", () => {
                        window.location.href = "/connexion";
                    });
                });
        } else {
            const message = document.querySelector(".message");
            message.textContent =
                "Aucun événement trouvé pour cette catégorie.";
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
    }
});
