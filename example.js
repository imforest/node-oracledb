const oracledb = require('oracledb');

oracledb.initOracleClient({
	libDir: '/home/opc/util/oracle-instantclient/instantclient_21_6'
});

async function run() {

    let connection;

    try {

        connection = await oracledb.getConnection({
            user: "ADMIN",
            password: "#KviYz*x!F6CUPW",
            connectionString: "db202203162338_medium"
        });

        // Create a table

        await connection.execute(`begin
									execute immediate 'drop table nodetab';
									exception when others then if sqlcode <> -942 then raise; end if;
								end;`);

        await connection.execute(`create table nodetab (id number, data varchar2(20))`);

        // Insert some rows

        const sql = `INSERT INTO nodetab VALUES (:1, :2)`;

        const binds = [
            [1, "First"],
            [2, "Second"],
            [3, "Third"],
            [4, "Fourth"],
            [5, "Fifth"],
            [6, "Sixth"],
            [7, "Seventh"]
        ];

        await connection.executeMany(sql, binds);

        connection.commit();     // uncomment to make data persistent

        // Now query the rows back

        const result = await connection.execute(`SELECT * FROM nodetab`);

        console.dir(result.rows, {
            depth: null
        });

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

run();
