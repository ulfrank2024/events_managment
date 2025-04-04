document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("formEvenement");
    const errorMessage = document.getElementById("error-message");
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("id");

    // Pré-remplir le formulaire si on est en mode modification
    if (eventId) {
        try {
            const response = await fetch(`/events/${eventId}`);
            if (response.ok) {
                const event = await response.json();
                document.getElementById("title").value = event.title;
                document.getElementById("date").value = event.date;
                document.getElementById("location").value = event.location;
                document.getElementById("description").value =
                    event.description;
                document.getElementById("organizer_id").value =
                    event.organizer_id;

                // Pré-remplir la catégorie
                const categorySelect = document.getElementById("category");
                if (categorySelect) {
                    // Si l'événement a une catégorie, on sélectionne l'option correspondante
                    const category = event.category || "autre"; // Valeur par défaut
                    categorySelect.value = category;
                }

                // Modifier le bouton de soumission
                document.querySelector(".btn").textContent =
                    "Modifier Événement";
                document.querySelector(".btn").dataset.id = eventId;
            }
        } catch (error) {
            console.error("Erreur lors du chargement de l'événement :", error);
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Empêche le rechargement de la page

        errorMessage.textContent = ""; // Efface le message d'erreur précédent

        const formData = new FormData(form); // Récupère les données du formulaire
        const date = formData.get("date");
        const location = formData.get("location");

        // Vérification de la catégorie envoyée
        const category = formData.get("category");
        console.log("Catégorie envoyée:", category); // Ajoute ce log pour vérifier

        // Si la catégorie n'est pas valide, la remplacer par 'autre'
        const validCategories = [
            "conférence",
            "atelier",
            "sport",
            "culture",
            "autre",
        ];
        if (!validCategories.includes(category)) {
            formData.set("category", "autre"); // Remplace par 'autre' si catégorie invalide
        }

        let url = "/create";
        let method = "POST";

        if (eventId) {
            url = `/update/${eventId}`;
            method = "PUT";
        }

        try {
            // Vérifier si un événement existe déjà
            const checkResponse = await fetch(
                `/api/check-event?date=${date}&location=${location}`
            );
            const checkResult = await checkResponse.json();

            if (
                checkResult.exists &&
                (!eventId || checkResult.eventId !== eventId)
            ) {
                errorMessage.textContent =
                    "Un événement existe déjà à cette date, heure et lieu.";
                return; // Empêcher la soumission du formulaire
            }

            const response = await fetch(url, {
                method: method,
                body: formData, // Envoie les données avec l'image
            });

            const result = await response.json();

            if (response.ok) {
                window.location.href = "/profil"; // Redirige après soumission
            } else {
                errorMessage.textContent = result.message; // Affiche le message d'erreur en rouge sous le bouton
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du formulaire :", error);
            errorMessage.textContent =
                "Une erreur est survenue. Veuillez réessayer.";
        }
    });
});
