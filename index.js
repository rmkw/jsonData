const jsonServer = require("json-server"); // importing json-server library
const DoubleMetaphone = require("double-metaphone");

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

    const data = router.db.getState().products; // Reemplaza 'yourData' con el nombre de tu colección de datos
    const doubleMetaphone = new DoubleMetaphone();
    
    // Realiza una búsqueda fonética utilizando Double Metaphone
    const result = data.filter(item => {
        const metaphones = doubleMetaphone.process(item.nom_producto);
        return metaphones.some(metaphone => metaphone === doubleMetaphone.process(query));
    });


    res.json(result);
});
server.use(router);

server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});