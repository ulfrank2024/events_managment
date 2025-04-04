document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Empêcher le comportement par défaut du formulaire

            const nom = document.getElementById("nom").value;
            const email = document.getElementById("email").value;
            const message = document.getElementById("message").value;

            console.log("Nom:", nom);
            console.log("Email:", email);
            console.log("Message:", message);

            try {
                const response = await fetch("/contact", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ nom, email, message }),
                });

                if (response.ok) {
                    const data = await response.json();
                    document.getElementById("message").textContent =
                        data.message;
                    // Effacer les valeurs du formulaire
                    document.getElementById("nom").value = "";
                    document.getElementById("email").value = "";
                    document.getElementById("message").value = "";
                     window.location.href = "/";
                } else if (response.status === 401) {
                    // Rediriger vers la page de connexion
                    window.location.href = "/connexion";
                } else {
                    const data = await response.json();
                    document.getElementById("message").textContent =
                        data.message || "Erreur lors de l'envoi du message.";
                }
            } catch (error) {
                console.error("Erreur lors de l'envoi du formulaire :", error);
                document.getElementById("message").textContent =
                    "Erreur lors de l'envoi du message.";
            }
        });
    } else {
        console.error("L'élément avec l'ID 'contactForm' n'a pas été trouvé.");
    }
});
