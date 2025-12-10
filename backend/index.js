require('dotenv').config();
const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a Neo4j
const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
    { disableLosslessIntegers: true }
);

// --- ENDPOINTS ---

// GET ALL USERS (para el selector de usuarios)
app.get('/api/users', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (u:User)
            RETURN u.id_user AS id, u.name AS name, u.profile_picture AS profile_picture
            ORDER BY u.name
        `);
        
        const users = result.records.map(record => ({
            id: record.get('id'),
            name: record.get('name'),
            profile_picture: record.get('profile_picture')
        }));
        
        res.json(users);
    } catch (error) {
        console.error("Error en GET /api/users:", error);
        res.status(500).json({ error: error.message });
    } finally { await session.close(); }
});

// GET PINS (Feed Principal)
app.get('/api/pins', async (req, res) => {
    const userId = req.query.userId || "USER-001";
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (p:Pin)
            OPTIONAL MATCH (u:User)-[:CREATES]->(p)
            OPTIONAL MATCH (:User)-[l:LIKES]->(p)
            OPTIONAL MATCH (me:User {id_user: $userId})-[myLike:LIKES]->(p)
            OPTIONAL MATCH (me)-[followRel:FOLLOWS]->(u)
            
            WITH DISTINCT p, u, count(DISTINCT l) AS likesCount, 
                 (myLike IS NOT NULL) AS likedByMe, 
                 (followRel IS NOT NULL) AS isFollowing
            
            RETURN p, u.name AS creator, u.id_user AS creatorId, u.profile_picture AS creatorPic, 
                   likesCount, likedByMe, isFollowing, p.created_at AS createdAt
            ORDER BY p.created_at DESC
            LIMIT 150
        `, { userId });
        
        const pins = result.records.map(record => ({
            ...record.get('p').properties,
            creator: record.get('creator') || "Anónimo",
            creatorId: record.get('creatorId'),
            creatorPic: record.get('creatorPic'),
            likesCount: record.get('likesCount')?.low || record.get('likesCount') || 0,
            likedByMe: record.get('likedByMe'),
            isFollowing: record.get('isFollowing'),
            createdAt: record.get('createdAt')
        }));
        res.json(pins);
    } catch (error) {
        console.error("Error en GET /api/pins:", error);
        res.status(500).json({ error: error.message });
    } finally { await session.close(); }
});

// GET TRENDING PINS (ordenados por likes)
app.get('/api/pins/trending', async (req, res) => {
    const userId = req.query.userId || "USER-001";
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (p:Pin)
            OPTIONAL MATCH (u:User)-[:CREATES]->(p)
            OPTIONAL MATCH (:User)-[l:LIKES]->(p)
            OPTIONAL MATCH (me:User {id_user: $userId})-[myLike:LIKES]->(p)
            
            WITH p, u, count(l) AS likesCount, myLike
            WHERE likesCount > 0
            
            RETURN p, u.name AS creator, u.id_user AS creatorId, 
                   likesCount, (myLike IS NOT NULL) AS likedByMe
            ORDER BY likesCount DESC
            LIMIT 50
        `, { userId });
        
        const pins = result.records.map(record => ({
            ...record.get('p').properties,
            creator: record.get('creator') || "Anónimo",
            creatorId: record.get('creatorId'),
            likesCount: record.get('likesCount')?.low || record.get('likesCount') || 0,
            likedByMe: record.get('likedByMe')
        }));
        
        res.json(pins);
    } catch (error) {
        console.error("Error en GET /api/pins/trending:", error);
        res.status(500).json({ error: error.message });
    } finally { await session.close(); }
});

// GET PIN BY ID (Detalle de un pin)
app.get('/api/pin/:id', async (req, res) => {
    const pinId = req.params.id;
    const userId = req.query.userId || "USER-001";
    const session = driver.session();
    try {
        const mainResult = await session.run(`
            MATCH (p:Pin {id_pin: $pinId})
            OPTIONAL MATCH (u:User)-[:CREATES]->(p)
            OPTIONAL MATCH (b:Board)-[:CONTAINS]->(p)
            OPTIONAL MATCH (:User)-[l:LIKES]->(p)
            OPTIONAL MATCH (me:User {id_user: $userId})-[myLike:LIKES]->(p)
            OPTIONAL MATCH (me)-[followRel:FOLLOWS]->(u)
            OPTIONAL MATCH (c:Comment)-[:ON]->(p)<-[:WROTE]-(author:User)
            
            WITH p, u, b, count(DISTINCT l) AS likesCount, myLike, followRel, c, author
            ORDER BY c.created_at DESC
            
            WITH p, u, b, likesCount, myLike, followRel,
                 collect({id: c.id_comment, text: c.body, author: author.name, date: c.created_at}) AS comments
            
            RETURN p, u.name AS creator, u.id_user AS creatorId, u.profile_picture AS creatorPic,
                   b.title AS board, b.id_board AS boardId, likesCount, 
                   (myLike IS NOT NULL) AS likedByMe, (followRel IS NOT NULL) AS isFollowing, comments
        `, { pinId, userId });

        if (mainResult.records.length === 0) {
            return res.status(404).json({ error: "Pin no encontrado" });
        }

        const record = mainResult.records[0];
        const mainPin = {
            ...record.get('p').properties,
            creator: record.get('creator') || "Anónimo",
            creatorId: record.get('creatorId'),
            creatorPic: record.get('creatorPic'),
            board: record.get('board'),
            boardId: record.get('boardId'),
            likesCount: record.get('likesCount')?.low || record.get('likesCount') || 0,
            likedByMe: record.get('likedByMe'),
            isFollowing: record.get('isFollowing'),
            comments: record.get('comments').filter(c => c.id !== null)
        };

        const suggestedResult = await session.run(`
            MATCH (other:Pin)
            WHERE other.id_pin <> $pinId
            OPTIONAL MATCH (u:User)-[:CREATES]->(other)
            RETURN other, u.name AS creator
            ORDER BY other.created_at DESC
            LIMIT 15
        `, { pinId });

        const suggestedSimilarPins = suggestedResult.records.map(rec => ({
            ...rec.get('other').properties,
            creator: rec.get('creator') || "Anónimo"
        }));

        res.json({ mainPin, suggestedSimilarPins });
    } catch (error) {
        console.error("Error en GET /api/pin/:id:", error);
        res.status(500).json({ error: error.message });
    } finally { await session.close(); }
});

// LIKE PIN (toggle like/unlike)
app.post('/api/pins/:id/like', async (req, res) => {
    const { userId } = req.body;
    const pinId = req.params.id;

    if (!userId) {
        return res.status(400).json({ error: 'userId es requerido' });
    }

    const session = driver.session();

    try {
        const checkResult = await session.run(
            `MATCH (u:User {id_user: $userId})-[r:LIKES]->(p:Pin {id_pin: $pinId})
             RETURN r`,
            { userId, pinId }
        );

        let isLiked;

        if (checkResult.records.length > 0) {
            await session.run(
                `MATCH (u:User {id_user: $userId})-[r:LIKES]->(p:Pin {id_pin: $pinId})
                 DELETE r`,
                { userId, pinId }
            );
            isLiked = false;
        } else {
            await session.run(
                `MATCH (u:User {id_user: $userId}), (p:Pin {id_pin: $pinId})
                 MERGE (u)-[:LIKES {date: datetime()}]->(p)`,
                { userId, pinId }
            );
            isLiked = true;
        }

        const likesResult = await session.run(
            `MATCH (:User)-[l:LIKES]->(p:Pin {id_pin: $pinId})
             RETURN count(l) AS likesCount`,
            { pinId }
        );

        const likesCount = likesResult.records[0].get('likesCount');

        res.json({
            success: true,
            isLiked,
            likesCount
        });
    } catch (e) {
        console.error("Error en Like:", e);
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
    }
});

// POST COMMENT
app.post('/api/pins/:id/comment', async (req, res) => {
    const { userId, text } = req.body;
    const pinId = req.params.id;
    const session = driver.session();
    const commentId = uuidv4();
    try {
        await session.run(`
            MATCH (u:User {id_user: $userId})
            MATCH (p:Pin {id_pin: $pinId})
            CREATE (c:Comment {id_comment: $commentId, body: $text, created_at: datetime()})
            CREATE (u)-[:WROTE]->(c)-[:ON]->(p)
        `, { userId, pinId, commentId, text });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); } finally { await session.close(); }
});

// FOLLOW / UNFOLLOW USER (toggle)
app.post('/api/users/:id/follow', async (req, res) => {
    const { userId } = req.body;
    const targetUserId = req.params.id;

    if (!userId) {
        return res.status(400).json({ error: 'userId es requerido' });
    }

    if (userId === targetUserId) {
        return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
    }

    const session = driver.session();

    try {
        const checkResult = await session.run(
            `MATCH (follower:User {id_user: $userId})-[r:FOLLOWS]->(target:User {id_user: $targetUserId})
             RETURN r`,
            { userId, targetUserId }
        );

        let isFollowing;

        if (checkResult.records.length > 0) {
            await session.run(
                `MATCH (follower:User {id_user: $userId})-[r:FOLLOWS]->(target:User {id_user: $targetUserId})
                 DELETE r`,
                { userId, targetUserId }
            );
            isFollowing = false;
        } else {
            await session.run(
                `MATCH (follower:User {id_user: $userId}), (target:User {id_user: $targetUserId})
                 MERGE (follower)-[:FOLLOWS {since: datetime()}]->(target)`,
                { userId, targetUserId }
            );
            isFollowing = true;
        }

        const followersResult = await session.run(
            `MATCH (target:User {id_user: $targetUserId})<-[:FOLLOWS]-(other:User)
             RETURN count(other) AS followersCount`,
            { targetUserId }
        );

        const followersCount = followersResult.records[0].get('followersCount');

        res.json({
            success: true,
            isFollowing,
            followersCount
        });
    } catch (e) {
        console.error("Error en Follow:", e);
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
    }
});

// LISTA de usuarios que sigue un usuario (following)
app.get('/api/users/:id/following', async (req, res) => {
    const userId = req.params.id;
    const session = driver.session();

    try {
        const result = await session.run(
            `MATCH (u:User {id_user: $userId})-[:FOLLOWS]->(other:User)
             RETURN other
             ORDER BY other.name`,
            { userId }
        );

        const following = result.records.map(record => {
            const u = record.get('other').properties;
            return {
                id: u.id_user,
                name: u.name,
                profile_picture: u.profile_picture
            };
        });

        res.json(following);
    } catch (e) {
        console.error("Error obteniendo following:", e);
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
    }
});

// LISTA de seguidores de un usuario (followers)
app.get('/api/users/:id/followers', async (req, res) => {
    const userId = req.params.id;
    const session = driver.session();

    try {
        const result = await session.run(
            `MATCH (u:User {id_user: $userId})<-[:FOLLOWS]-(other:User)
             RETURN other
             ORDER BY other.name`,
            { userId }
        );

        const followers = result.records.map(record => {
            const u = record.get('other').properties;
            return {
                id: u.id_user,
                name: u.name,
                profile_picture: u.profile_picture
            };
        });

        res.json(followers);
    } catch (e) {
        console.error("Error obteniendo followers:", e);
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
    }
});

// GET BOARDS
app.get('/api/boards', async (req, res) => {
    const session = driver.session();
    try {
        const r = await session.run(`MATCH (b:Board) RETURN b.id_board AS id, b.title AS title ORDER BY b.created_at DESC`);
        res.json(r.records.map(rec => ({id: rec.get('id'), title: rec.get('title')})));
    } catch (e) { res.status(500).json(e); } finally { await session.close(); }
});

// GET BOARDS DE UN USUARIO (con previews de imágenes)
app.get('/api/:user/boards', async (req, res) => {
    const session = driver.session();
    const userId = req.params.user;
    try {
        const r = await session.run(`
            MATCH (u:User {id_user: $userId})-[:CREATES]->(b:Board)
            OPTIONAL MATCH (b)-[:CONTAINS]->(p:Pin)
            WITH b, p ORDER BY p.created_at DESC
            WITH b, collect(p.url_image)[0..3] AS imgs
            RETURN b.id_board AS id, b.title AS title, b.description AS description, imgs AS images
            ORDER BY b.created_at DESC
        `, { userId });
        res.json(r.records.map(rec => ({
            id: rec.get("id"), 
            title: rec.get("title"),
            description: rec.get("description"),
            images: rec.get("images").filter(img => img != null)
        })));
    } catch (e) { 
        console.error("Error en GET /api/:user/boards:", e);
        res.status(500).json({ error: e.message }); 
    } finally { await session.close(); }
});

// GET DETALLE DE UN BOARD (con sus pines)
app.get('/api/boards/:boardId', async (req, res) => {
    const session = driver.session();
    const boardId = req.params.boardId;
    try {
        const r = await session.run(`
            MATCH (b:Board {id_board: $boardId})
            OPTIONAL MATCH (b)-[:CONTAINS]->(p:Pin)
            OPTIONAL MATCH (creator:User)-[:CREATES]->(p)
            RETURN b.title AS title, b.description AS description,
                   collect({
                       id_pin: p.id_pin, 
                       title: p.title, 
                       url_image: p.url_image,
                       creator: creator.name
                   }) AS pins
        `, { boardId });
        
        if (r.records.length === 0) {
            return res.status(404).json({ error: "Board no encontrado" });
        }
        
        const record = r.records[0];
        res.json({
            title: record.get("title"),
            description: record.get("description"),
            pins: record.get("pins").filter(p => p.id_pin != null)
        });
    } catch (e) { 
        console.error("Error en GET /api/boards/:boardId:", e);
        res.status(500).json({ error: e.message }); 
    } finally { await session.close(); }
});

// AGREGAR PIN A UN BOARD
app.post('/api/boards/:boardId/add-pin', async (req, res) => {
    const session = driver.session();
    const { pinId } = req.body;
    const { boardId } = req.params;
    try {
        const result = await session.run(`
            MATCH (b:Board {id_board: $boardId})
            MATCH (p:Pin {id_pin: $pinId})
            MERGE (b)-[:CONTAINS]->(p)
            RETURN p.id_pin AS addedPin
        `, { boardId, pinId });
        res.json({ success: true, pin: result.records[0]?.get("addedPin") });
    } catch (err) {
        console.error("Error en POST /api/boards/:boardId/add-pin:", err);
        res.status(500).json({ error: err.message });
    } finally { await session.close(); }
});

// CREATE BOARD
app.post('/api/boards', async (req, res) => {
    const { title, description, userId } = req.body;
    const session = driver.session();
    const newId = uuidv4();
    try {
        await session.run(`
            MATCH (u:User {id_user: $userId})
            CREATE (b:Board {id_board: $newId, title: $title, description: $description, created_at: datetime()})
            CREATE (u)-[:CREATES]->(b)
        `, { userId, newId, title, description });
        res.json({ success: true, id: newId });
    } catch (e) { res.status(500).json(e); } finally { await session.close(); }
});

// CREATE PIN
app.post('/api/pins', async (req, res) => {
    const { title, description, url_image, boardId, userId } = req.body;
    const session = driver.session();
    const newId = uuidv4();
    try {
        await session.run(`
            MATCH (u:User {id_user: $userId})
            MATCH (b:Board {id_board: $boardId})
            CREATE (p:Pin {
                id_pin: $newId, 
                title: $title, 
                description: $description, 
                url_image: $url_image, 
                created_at: datetime()
            })
            CREATE (u)-[:CREATES]->(p)
            CREATE (b)-[:CONTAINS]->(p)
        `, { userId, boardId, newId, title, description, url_image });
        res.json({ success: true, id: newId });
    } catch (e) { res.status(500).json(e); } finally { await session.close(); }
});

// GET USER PROFILE - Datos del usuario
app.get('/api/user/:id', async (req, res) => {
    const userId = req.params.id;
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (u:User {id_user: $userId})
            OPTIONAL MATCH (u)-[:CREATES]->(b:Board)
            OPTIONAL MATCH (u)-[:CREATES]->(p:Pin)
            OPTIONAL MATCH (u)-[:LIKES]->(liked:Pin)
            RETURN u, count(DISTINCT b) AS boardsCount, count(DISTINCT p) AS pinsCount, count(DISTINCT liked) AS likesCount
        `, { userId });

        if (result.records.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const record = result.records[0];
        const user = {
            ...record.get('u').properties,
            boardsCount: record.get('boardsCount')?.low || record.get('boardsCount') || 0,
            pinsCount: record.get('pinsCount')?.low || record.get('pinsCount') || 0,
            likesCount: record.get('likesCount')?.low || record.get('likesCount') || 0
        };

        res.json(user);
    } catch (e) {
        console.error("Error en GET /api/user/:id:", e);
        res.status(500).json({ error: e.message });
    } finally { await session.close(); }
});

// GET USER SAVED PINS - Pins guardados en los boards del usuario
app.get('/api/user/:id/saved-pins', async (req, res) => {
    const userId = req.params.id;
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (u:User {id_user: $userId})-[:CREATES]->(b:Board)-[:CONTAINS]->(p:Pin)
            OPTIONAL MATCH (creator:User)-[:CREATES]->(p)
            RETURN DISTINCT p, creator.name AS creatorName, b.title AS boardTitle
            ORDER BY p.created_at DESC
        `, { userId });

        const pins = result.records.map(rec => ({
            ...rec.get('p').properties,
            creator: rec.get('creatorName') || "Anónimo",
            board: rec.get('boardTitle')
        }));

        res.json(pins);
    } catch (e) {
        console.error("Error en GET /api/user/:id/saved-pins:", e);
        res.status(500).json({ error: e.message });
    } finally { await session.close(); }
});

// GET USER LIKED PINS - Pins que el usuario ha dado like
app.get('/api/user/:id/liked-pins', async (req, res) => {
    const userId = req.params.id;
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (u:User {id_user: $userId})-[l:LIKES]->(p:Pin)
            OPTIONAL MATCH (creator:User)-[:CREATES]->(p)
            RETURN p, creator.name AS creatorName, l.date AS likedAt
            ORDER BY l.date DESC
        `, { userId });

        const pins = result.records.map(rec => ({
            ...rec.get('p').properties,
            creator: rec.get('creatorName') || "Anónimo",
            likedAt: rec.get('likedAt')
        }));

        res.json(pins);
    } catch (e) {
        console.error("Error en GET /api/user/:id/liked-pins:", e);
        res.status(500).json({ error: e.message });
    } finally { await session.close(); }
});

app.get('/api/pin/:id_pin', async (req, res) => {
    // 1. Obtener parámetros
    const { id_pin } = req.params; // ID del Pin a buscar
    const userId = req.query.userId || "USER-001"; // ID del usuario actual (para saber si le dio Like)
    const session = driver.session();
    
    try {
        // 2. Consulta Cypher para obtener el Pin principal y sus detalles
        const pinQuery = await session.run(`
            // Encuentra el Pin principal por su ID
            MATCH (p:Pin {id_pin: $id_pin})
                    
            // Creador del pin
            OPTIONAL MATCH (u:User)-[:CREATES]->(p)
                    
            // Likes y like del usuario actual
            OPTIONAL MATCH (:User)-[l:LIKES]->(p)
            OPTIONAL MATCH (me:User {id_user: $userId})-[myLike:LIKES]->(p)
                    
            // Comentarios y sus autores
            OPTIONAL MATCH (author:User)-[:WROTE]->(c:Comment)-[:ON]->(p)
                    
            WITH p, u, count(l) AS likesCount, myLike, c, author
            ORDER BY c.created_at DESC
                    
            WITH p, u, likesCount, myLike,
                 collect(
                 CASE
           WHEN c IS NULL THEN null
                       ELSE {
                            id: c.id_comment,
                            text: c.body,
                            author: author.name,
                            authorPic: author.profile_picture,
                            date: c.created_at
                       }
                    END
                 ) AS comments_list
                    
            RETURN p,
                   u.name AS creator,
                   u.profile_picture AS creatorPic,
                   likesCount,
                   (myLike IS NOT NULL) AS likedByMe,
                   comments_list,
                   p.created_at AS createdAt
        `, { id_pin, userId });

        // 3. Procesar el Pin principal
        if (pinQuery.records.length === 0) {
            return res.status(404).json({ error: "Pin no encontrado." });
        }

        const mainPinRecord = pinQuery.records[0];
        const mainPinData = {
            ...mainPinRecord.get('p').properties,
            creator: mainPinRecord.get('creator') || "Anónimo",
            creatorPic: mainPinRecord.get('creatorPic'),
            likesCount: mainPinRecord.get('likesCount').low || mainPinRecord.get('likesCount'),
            likedByMe: mainPinRecord.get('likedByMe'),
            // Solo incluimos los 10 primeros comentarios (si es necesario limitar)
            comments: mainPinRecord.get('comments_list'), 
            createdAt: mainPinRecord.get('createdAt')
        };
        
        // 4. Consulta para Pins Sugeridos (Similaridad por Board, Tags, o Creador)
        // Esta es una consulta de ejemplo; puedes ajustarla para mayor relevancia.
        const suggestedQuery = await session.run(`
            MATCH (main:Pin {id_pin: $id_pin})

            // Pins del mismo board
            OPTIONAL MATCH (b:Board)-[:CONTAINS]->(main)
            OPTIONAL MATCH (b)-[:CONTAINS]->(p_board:Pin)
            WHERE p_board <> main

            // Pins del mismo creador
            OPTIONAL MATCH (u:User)-[:CREATES]->(main)
            OPTIONAL MATCH (u)-[:CREATES]->(p_creator:Pin)
            WHERE p_creator <> main

            WITH collect(DISTINCT p_board) AS boardPins,
                 collect(DISTINCT p_creator) AS creatorPins

            WITH boardPins + creatorPins AS suggestedPins
            UNWIND suggestedPins AS p

            WITH DISTINCT p
            LIMIT 50

            RETURN p.id_pin AS id_pin,
                   p.title AS title,
                   p.url_image AS url_image
        `, { id_pin });
        
        // 5. Procesar los Pins sugeridos
        const suggestedSimilarPins = suggestedQuery.records.map(record => ({
            id_pin: record.get('id_pin'),
            title: record.get('title'),
            url_image: record.get('url_image')
        }));

        // 6. Enviar la respuesta final en el formato solicitado
        res.json({
            mainPin: mainPinData,
            suggestedSimilarPins: suggestedSimilarPins
        });

    } catch (error) {
        console.error("Error al obtener el Pin:", error);
        res.status(500).json({ error: "Error interno del servidor al obtener el Pin." });
    } finally { 
        await session.close(); 
    }
});

app.get('/api/:user/boards', async (req, res) => {
    const session = driver.session();
    const userId = req.params.user;

    try {
        const r = await session.run(`MATCH (u:User {id_user: $userId})-[:CREATES]->(b:Board)
            OPTIONAL MATCH (b)-[:CONTAINS]->(p:Pin)
            WITH b, p
            ORDER BY p.created_at DESC
            WITH b, collect(p.url_image)[0..3] AS imgs
            RETURN b.id_board AS id,
                   b.title AS title,
                   imgs AS images`,
            { userId });
        res.json(r.records.map(rec => ({id: rec.get("id"),
                title: rec.get("title"),
                images: rec.get("images")})));
    } catch (e) { res.status(500).json(e); } finally { await session.close(); }
});

// GET PINS DE UN BOARD (Javi lo hizo con ia)
app.get('/api/boards/:boardId', async (req, res) => {
    const session = driver.session();
    const boardId = req.params.boardId;

    try {
        const r = await session.run(
            `
            MATCH (b:Board {id_board: $boardId})
            OPTIONAL MATCH (b)-[:CONTAINS]->(p:Pin)
            RETURN b.title AS title,
                   b.description AS description,
                   collect({
                       id_pin: p.id_pin,
                       title: p.title,
                       url_image: p.url_image
                   }) AS pins
            `,
            { boardId }
        );

        if (r.records.length === 0) {
            return res.status(404).json({ error: "Board no encontrado" });
        }

        const record = r.records[0];
        res.json({
            title: record.get("title"),
            description: record.get("description"),
            pins: record.get("pins")
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
    }
});

app.post('/api/boards/:boardId/add-pin', async (req, res) => {
    const session = driver.session();
    const { pinId } = req.body;
    const { boardId } = req.params;

    try {
        const query = `
            MATCH (b:Board {id_board: $boardId})
            MATCH (p:Pin {id_pin: $pinId})
            MERGE (b)-[:CONTAINS]->(p)
            RETURN p.id_pin AS addedPin
        `;

        const result = await session.run(query, { boardId, pinId });

        res.json({
            success: true,
            pin: result.records[0]?.get("addedPin")
        });

    } catch (err) {
        res.status(500).json({ error: err });
    } finally {
        await session.close();
    }
});



// 🔍 BARRA DE BÚSQUEDA GENERAL
// GET /api/search?q=texto&type=pins|users|boards|all
app.get('/api/search', async (req, res) => {
    const q = (req.query.q || '').trim();
    const type = (req.query.type || 'all').toLowerCase();
    if (!q) {
        return res.status(400).json({ error: 'El parámetro q (texto a buscar) es requerido' });
    }

    const session = driver.session();
    try {
        const response = {};

        // Buscar PINS
        if (type === 'pins' || type === 'all') {
            const pinsResult = await session.run(`
                MATCH (p:Pin)
                OPTIONAL MATCH (p)-[:HAS_TAG]->(t:Tag)
                WITH p, collect(DISTINCT t.name) AS tags
                OPTIONAL MATCH (u:User)-[:CREATES]->(p)
                WITH p, u, tags
                WHERE
                    (p.title IS NOT NULL AND toLower(p.title) CONTAINS toLower($q))
                    OR
                    (p.description IS NOT NULL AND toLower(p.description) CONTAINS toLower($q))
                    OR
                    any(tag IN tags WHERE tag IS NOT NULL AND toLower(tag) CONTAINS toLower($q))
                RETURN p, u.name AS creator, u.profile_picture AS creatorPic, tags
                ORDER BY p.created_at DESC
                LIMIT 30;
            `, { q });

            response.pins = pinsResult.records.map(rec => {
                const p = rec.get('p').properties;
                return {
                    id_pin: p.id_pin,
                    title: p.title,
                    description: p.description,
                    url_image: p.url_image,
                    created_at: p.created_at,
                    creator: rec.get('creator') || 'Anónimo',
                    creatorPic: rec.get('creatorPic') || null,
                    tags: rec.get('tags') || []
                };
            });
        }

        // Buscar USUARIOS
        if (type === 'users' || type === 'all') {
            const usersResult = await session.run(`
                MATCH (u:User)
                WHERE toLower(u.name) CONTAINS toLower($q)
                   OR (u.username IS NOT NULL AND toLower(u.username) CONTAINS toLower($q))
                RETURN u
                LIMIT 30
            `, { q });

            response.users = usersResult.records.map(rec => {
                const u = rec.get('u').properties;
                return {
                    id: u.id_user,
                    name: u.name,
                    username: u.username || null,
                    profile_picture: u.profile_picture || null
                };
            });
        }

        // Buscar BOARDS
        if (type === 'boards' || type === 'all') {
            const boardsResult = await session.run(`
                MATCH (b:Board)
                WHERE toLower(b.title) CONTAINS toLower($q)
                   OR toLower(b.description) CONTAINS toLower($q)
                RETURN b
                ORDER BY b.created_at DESC
                LIMIT 30
            `, { q });

            response.boards = boardsResult.records.map(rec => {
                const b = rec.get('b').properties;
                return {
                    id: b.id_board,
                    title: b.title,
                    description: b.description,
                    created_at: b.created_at
                };
            });
        }

        res.json(response);
    } catch (e) {
        console.error('Error en /api/search:', e);
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
    }
});

// 👥 USUARIOS SIMILARES (basado en likes en común)
// GET /api/users/:id/similar
app.get('/api/users/:id/similar', async (req, res) => {
    const userId = req.params.id;
    const session = driver.session();

    try {
        const result = await session.run(`
            MATCH (me:User {id_user: $userId})-[:LIKES]->(p:Pin)<-[:LIKES]-(other:User)
            WHERE other <> me
            WITH me, other, count(DISTINCT p) AS commonLikes
            // likes totales de me
            MATCH (me)-[:LIKES]->(pMe:Pin)
            WITH me, other, commonLikes, count(DISTINCT pMe) AS myLikes
            // likes totales del otro
            MATCH (other)-[:LIKES]->(pOther:Pin)
            WITH other, commonLikes, myLikes, count(DISTINCT pOther) AS otherLikes
            WITH other, commonLikes, myLikes, otherLikes,
                 (1.0 * commonLikes) / (myLikes + otherLikes - commonLikes) AS jaccard
            RETURN other, commonLikes, jaccard
            ORDER BY jaccard DESC, commonLikes DESC
            LIMIT 10
        `, { userId });

        const similarUsers = result.records.map(rec => {
            const u = rec.get('other').properties;
            return {
                id: u.id_user,
                name: u.name,
                profile_picture: u.profile_picture || null,
                commonLikes: rec.get('commonLikes'),
                similarity: rec.get('jaccard')
            };
        });

        res.json(similarUsers);
    } catch (e) {
        console.error('Error en /api/users/:id/similar:', e);
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
    }
});

// 🔥 PINS EN TENDENCIA (por número de likes en los últimos 7 días)
// GET /api/trending/pins
app.get('/api/trending/pins', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (p:Pin)
            OPTIONAL MATCH (:User)-[l:LIKES]->(p)
            WHERE l.date >= datetime() - duration('P7D') OR l IS NULL
            WITH p, count(l) AS likesLast7d
            RETURN p, likesLast7d
            ORDER BY likesLast7d DESC, p.created_at DESC
            LIMIT 20
        `);

        const pins = result.records.map(rec => {
            const p = rec.get('p').properties;
            return {
                id: p.id_pin,
                title: p.title,
                description: p.description,
                url_image: p.url_image,
                created_at: p.created_at,
                likesLast7d: rec.get('likesLast7d')
            };
        });

        res.json(pins);
    } catch (e) {
        console.error('Error en /api/trending/pins:', e);
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
    }
});

// 🔥 TAGS EN TENDENCIA (tags más likeados en últimos 7 días)
// GET /api/trending/tags
app.get('/api/trending/tags', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (:User)-[l:LIKES]->(p:Pin)-[:HAS_TAG]->(t:Tag)
            WHERE l.date >= datetime() - duration('P7D')
            RETURN t.name AS tag, count(*) AS likesCount
            ORDER BY likesCount DESC
            LIMIT 20
        `);

        const tags = result.records.map(rec => ({
            tag: rec.get('tag'),
            likesCount: rec.get('likesCount')
        }));

        res.json(tags);
    } catch (e) {
        console.error('Error en /api/trending/tags:', e);
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
    }
});

// 📈 CENTRALIDAD (degree: followers + following)
// GET /api/analytics/centrality/users
app.get('/api/analytics/centrality/users', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (u:User)
            OPTIONAL MATCH (u)<-[:FOLLOWS]-(f:User)
            WITH u, count(f) AS followers
            OPTIONAL MATCH (u)-[:FOLLOWS]->(fo:User)
            WITH u, followers, count(fo) AS following
            RETURN u, followers, following, (followers + following) AS degree
            ORDER BY degree DESC
            LIMIT 50
        `);

        const users = result.records.map(rec => {
            const u = rec.get('u').properties;
            return {
                id: u.id_user,
                name: u.name,
                profile_picture: u.profile_picture || null,
                followers: rec.get('followers'),
                following: rec.get('following'),
                degreeCentrality: rec.get('degree')
            };
        });

        res.json(users);
    } catch (e) {
        console.error('Error en /api/analytics/centrality/users:', e);
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
    }
});

// 🧩 COMUNIDADES POR TAGS (usuarios agrupados por intereses)
// GET /api/analytics/communities/tags
app.get('/api/analytics/communities/tags', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (u:User)-[:LIKES]->(p:Pin)-[:HAS_TAG]->(t:Tag)
            WITH t, collect(DISTINCT u) AS users
            RETURN t.name AS tag,
                   [u IN users | { 
                        id: u.id_user, 
                        name: u.name, 
                        profile_picture: u.profile_picture 
                   }] AS members,
                   size(users) AS size
            ORDER BY size DESC
            LIMIT 10
        `);

        const communities = result.records.map(rec => ({
            tag: rec.get('tag'),
            size: rec.get('size'),
            members: rec.get('members')
        }));

        res.json(communities);
    } catch (e) {
        console.error('Error en /api/analytics/communities/tags:', e);
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
    }
});

// PINS SIMILARES (por tags compartidos)
// GET /api/pins/:id/similar
app.get('/api/pins/:id/similar', async (req, res) => {
    const pinId = req.params.id;
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (p:Pin {id_pin: $pinId})-[:HAS_TAG]->(t:Tag)<-[:HAS_TAG]-(other:Pin)
            WHERE other <> p
            WITH other, count(DISTINCT t) AS commonTags
            RETURN other, commonTags
            ORDER BY commonTags DESC, other.created_at DESC
            LIMIT 10
        `, { pinId });

        const pins = result.records.map(rec => {
            const p = rec.get('other').properties;
            return {
                id: p.id_pin,
                title: p.title,
                description: p.description,
                url_image: p.url_image,
                created_at: p.created_at,
                commonTags: rec.get('commonTags')
            };
        });

        res.json(pins);
    } catch (e) {
        console.error('Error en /api/pins/:id/similar:', e);
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));
