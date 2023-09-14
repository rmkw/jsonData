const jsonServer = require("json-server"); // importing json-server library
const Fuse = require("fuse.js");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080; //  chose port from here like 8080, 3001

server.use(middlewares);
server.use(jsonServer.bodyParser); // Agrega el middleware bodyParser para manejar datos POST

// Define una nueva ruta para la búsqueda difusa
server.get("/fuzzy-search", (req, res) => {
    const query = req.query.q; // Obtiene el término de búsqueda desde la URL
    if (!query) {
        res.status(400).json({ error: "El parámetro 'q' es requerido" });
        return;
    }

    const data = router.db.getState().yourData; // Reemplaza 'yourData' con el nombre de tu colección de datos
    const options = {
        // Configura las opciones de búsqueda difusa con Fuse.js
        shouldSort: true,
        threshold: 0.3,
        keys: ["nom_producto"], // Reemplaza 'nombre' con el nombre del campo en tus datos que deseas buscar
    };

    const fuse = new Fuse(data, options);
    const result = fuse.search(query);

    res.json(result);
});
server.use(router);

server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});