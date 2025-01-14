const oracledb = require("oracledb")
require("dotenv").config()

var connection

async function getConnection() {
	if (!connection)
		connection = await oracledb.getConnection({
			user: process.env.USR,
			password: process.env.PASSWD,
			connectString: process.env.HOST
		})
}

async function run() {
	await getConnection()
	const res = await connection.execute("select CAST(nazwa AS VARCHAR2(100)) from stan_zatrudnienia")
	console.log(res)
}

run().then(() => {
	connection.close()
})
