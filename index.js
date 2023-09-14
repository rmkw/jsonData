const jsonServer = require("json-server"); // importing json-server library
const Fuse = require("fuse.js"); // Importa la librería fuse.js


const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080; //  chose port from here like 8080, 3001

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.get("/fuzzy-search", (req, res) => {
    const query = req.query.q;
    if (!query) {
        res.status(400).json({ error: "El parámetro 'q' es requerido" });
        return;
    }

    const data = router.db.getState().products;

    // Configura las opciones de fuse.js
    const options = {
        includeScore: true,
        keys: ["nom_producto"], // Especifica el campo en el que deseas buscar
        threshold: 0.4, // Ajusta este umbral según tu preferencia
    };

    // Crea una instancia de fuse.js con los datos y las opciones
    const fuse = new Fuse(data, options);

    // Realiza la búsqueda difusa
    const result = fuse.search(query);

    // Devuelve los resultados
    res.json(result);
});


server.use(router);

server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});