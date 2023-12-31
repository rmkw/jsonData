const jsonServer = require("json-server");
const Fuse = require("fuse.js");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080;

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.get("/fuzzy-search", (req, res) => {
    const query = req.query.q;
    if (!query) {
        res.status(400).json({ error: "El parámetro 'q' es requerido" });
        return;
    }

    const productsData = router.db.getState().producto_coll;
    const variablesData = router.db.getState().variable_coll;




    const productOptions = {
        includeScore: true,
        keys: ["nom_producto"],
        threshold: 0.4,
    };

    const productFuse = new Fuse(productsData, productOptions);
    const productResult = productFuse.search(query);

    const productInterviewIds = productResult.map(item => item.item);

    // Búsqueda difusa en la colección de variables (secuencia_var)
    const variableOptions = {
        includeScore: true,
        keys: ["nom_var"],
        threshold: 0.4,
    };

    const variableFuse = new Fuse(variablesData, variableOptions);
    const variableResult = variableFuse.search(query);

    // Obtener los interview__id de los resultados de variables
    const variableInterviewIds = variableResult.map(item => item.item.interview__id);

    // Filtrar los resultados de productos por interview__id
    const matchedProducts = productsData.filter(product => variableInterviewIds.includes(product.interview__id));
    const combinedResults = [...productInterviewIds, ...matchedProducts];

    res.json(combinedResults);
});

server.use(router);

server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});
