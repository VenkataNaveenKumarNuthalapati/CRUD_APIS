let express = require("express");
let app = express();
app.use(express.json());

let { open } = require("sqlite");
let sqlite3 = require("sqlite3");

let path = require("path");
let dbPath = path.join(__dirname, "cricketTeam.db");

let DB;

let initializeDBServer = async () => {
  try {
    DB = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost/3000/");
    });
  } catch (error) {
    console.log(`DBError${error.message}`);
    process.exit(1);
  }
};
initializeDBServer();
// GET API
app.get("/players/", async (request, response) => {
  let getPlayersQuery = `
    SELECT player_id as playerId, player_name as playerName, jersey_number as jerseyNumber, role as role FROM cricket_team;`;
  let allPlayers = await DB.all(getPlayersQuery);
  response.send(allPlayers);
});

// POST API

app.post("/players/", async (request, response) => {
  let playerObject = request.body;
  let { playerName, jerseyNumber, role } = playerObject;

  let postPlayerQuery = `INSERT INTO cricket_team (player_name, jersey_number, role) 
        VALUES (
            '${playerName}',
            ${jerseyNumber},
            '${role}'
            );`;
  let DBResponse = await DB.run(postPlayerQuery);
  let playerId = DBResponse.lastID;
  response.send(`Player Added to Team`);
});

// GET API with ID
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let getPlayerIdQuery = `
    SELECT player_id as playerId, player_name as playerName, jersey_number as jerseyNumber, role as role FROM cricket_team WHERE player_id = ${playerId};`;
  let player = await DB.get(getPlayerIdQuery);
  response.send(player);
});

// PUT API
app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let tableColumns = request.body;

  let { playerName, jerseyNumber, role } = tableColumns;
  let putPlayerQuery = `
                    UPDATE 
                        cricket_team 
                    SET                         
                        player_name = '${playerName}',
                        jersey_number = ${jerseyNumber},
                        role = '${role}'
                    WHERE
                        player_id = ${playerId}`;
  let dbResponse = await DB.run(putPlayerQuery);
  response.send("Player Details Updated");
});

// DELETE API with ID
app.delete("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;

  const deleteBookQuery = `
    DELETE FROM
        cricket_team
    WHERE
        player_id = ${playerId};`;

  await DB.run(deleteBookQuery);
  response.send("Player Removed");
});

module.exports = app;
