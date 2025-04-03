document.addEventListener("DOMContentLoaded", async () => {
    // Gestion du tableau des utilisateurs
    const utilisateursTableBody = document.querySelector(
        "#utilisateurs-table tbody"
    );

    try {
        const utilisateursResponse = await fetch("/utilisateurs");
        if (!utilisateursResponse.ok) {
            throw new Error("Erreur lors de la récupération des utilisateurs");
        }
        const utilisateurs = await utilisateursResponse.json();

        utilisateurs.forEach((utilisateur) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${utilisateur.id}</td>
                <td>${utilisateur.name}</td>
                <td>${utilisateur.email}</td>
                <td>${utilisateur.role}</td>
                <td>${utilisateur.created_at}</td>
            `;
            utilisateursTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erreur (utilisateurs) :", error);
        utilisateursTableBody.innerHTML =
            '<tr><td colspan="5">Impossible de charger les utilisateurs.</td></tr>';
    }

    // Gestion du tableau des inscriptions
    const inscriptionsTableBody = document.querySelector(
        "#inscriptions-table tbody"
    );

    try {
        const inscriptionsResponse = await fetch("/inscriptionsevent");
        if (!inscriptionsResponse.ok) {
            throw new Error("Erreur lors de la récupération des inscriptions");
        }
        const inscriptions = await inscriptionsResponse.json();

        inscriptions.forEach((inscription) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${inscription.nom_utilisateur}</td>
                <td>${inscription.titre_evenement}</td>
                <td>${inscription.date_evenement}</td>
                <td>${inscription.date_inscription}</td>
            `;
            inscriptionsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erreur (inscriptions) :", error);
        inscriptionsTableBody.innerHTML =
            '<tr><td colspan="4">Impossible de charger les inscriptions.</td></tr>';
    }
});
