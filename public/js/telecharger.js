function telechargerTableauCSV(tableId, nomFichier) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll("tr");
    let csv = [];

    for (const row of rows) {
        const cols = row.querySelectorAll("td, th");
        const rowData = Array.from(cols).map((col) =>
            col.textContent.replace(",", "")
        ); // Remplacer les virgules dans les données
        csv.push(rowData.join(","));
    }

    const csvString = csv.join("\n");
    const lienTelechargement = document.createElement("a");
    lienTelechargement.href =
        "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
    lienTelechargement.download = nomFichier + ".csv";
    document.body.appendChild(lienTelechargement);
    lienTelechargement.click();
    document.body.removeChild(lienTelechargement);
}

    document
        .getElementById("boutonTelechargerUtilisateurs")
        .addEventListener("click", function () {
            telechargerTableauCSV(
                "utilisateurs-table",
                "liste des utilisateurs"
            );
        });

    document
        .getElementById("boutonTelechargerInscriptions")
        .addEventListener("click", function () {
            telechargerTableauCSV(
                "inscriptions-table",
                "liste des inscriptions"
            );
        });
    
