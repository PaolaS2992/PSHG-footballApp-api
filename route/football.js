const {Router} = require('express');
const axios = require('axios');
const mongodb = require('mongodb');

const router = Router();

router.get('/competitions', async (req, res) => {
    try{
        const instance = axios.create({
            baseURL: 'http://api.football-data.org/v2/competitions',
            headers: {'x-auth-token': '3eec30c0ebb242a19c4e7543504823cc'}
        });
        const resp = await instance.get();

        if(resp.data !== undefined){
            res.json(resp.data.competitions);
        }else{
            res.status(400).send('Solicitud sin datos')
        }        
    }catch(e){
        res.status(400).send('¡Recurso no encontrado!');
    }
    
});

router.get('/competitions/:id', async (req, res) => {
    try{
        const instance = axios.create({
            baseURL: `http://api.football-data.org/v2/competitions/${req.params.id}/teams`,
            headers: {'x-auth-token': '3eec30c0ebb242a19c4e7543504823cc'}
        });
        const resp = await instance.get();

        console.log(resp.data.teams.length);

        if(resp.data.teams.length === 0){
            res.status(400).send('No existe equipo');
        } else {
            // MongoDB.
            const posts = await connectDB();
            await posts.collection('teams').insertOne({liga: req.params.id, team: resp.data.teams});

            // Imprime en el navegador
            res.json(resp.data);
        }
    } catch(e){
        res.status(400).send('¡Recurso no encontrado!');
    }    
});

router.get('/team', async (req, res) => {
    try{
        const post = await connectDB();
        const respuesta = await post.collection('teams').find().toArray();
        res.send(respuesta);
    }catch(e){
        res.status(400).send('¡Recurso no encontrado!');
    }    
});

router.get('/team/:id', async (req, res) => {
    try{
        const instance = axios.create({
            baseURL: `http://api.football-data.org/v2/teams/${req.params.id}`,
            headers: {'x-auth-token': '3eec30c0ebb242a19c4e7543504823cc'}
        });
        const resp = await instance.get();

        if(resp.data.squad.length === 0){
            res.status(400).send('No existe jugador');
        }else{
            const players = resp.data.squad.map((r) => {       
                const newPlayer = {
                    name: r.name,
                    position: r.position,
                    nroCamiseta: r.shirtNumber
                }
                return newPlayer;
            });
            
            // MongoDB.
            const posts = await connectDB();
            await posts.collection('players').insertOne({ team:req.params.id, players});                
            
            // Imprime en el navegador.
            res.json(resp.data);
        }
    }catch(e){
        res.status(400).send('¡Recurso no encontrado!');
    }    
});

router.get('/players', async (req, res) => {
    try{
        const post = await connectDB();
        const respuesta = await post.collection('players').find().toArray();
        res.send(respuesta);
    }catch(e){
        res.status(400).send('¡Recurso no encontrado!');
    }
});

// Conexion a la bd.
async function connectDB(){
    const client = await mongodb.connect(
        'mongodb+srv://football-api:Diosesamor123$@cluster0.yadc0.mongodb.net/football-api?retryWrites=true&w=majority', 
        { useNewUrlParser: true, useUnifiedTopology:true }
    );
    return client.db('football-api');
}

module.exports = router;