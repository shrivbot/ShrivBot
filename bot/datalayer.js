const { Pool } = require('pg');
const pool;


export default class DataLayer {
    
    constructor(databaseConfig){
        if(!databaseConfig)
        {
            Console.error("No database configuration given. Exiting")
            process.exit(0)
        }
        pool = new Pool(databaseConfig);
        pool.connect((err, client, release) => {
            if (err) {
                Console.error("Error connecting to database", err.stack)
                process.exit(0)
            }
            client.query('SELECT NOW()', (err, result) => {
                release()
                if (err) {
                    console.error("Error executing config query", err.stack)
                    process.exit(0)
                }
                console.log("DataLayer initialized: " + result.rows)
            })
        })
    }

    // Initialize new user
    initUser(username) {
        pool.connect((err, client, release) => 
        {
            if (err) {
                Console.error("SEVERE: Error getting client from pool")
                return
            }
            client.query("INSERT INTO user(username, score) VALUES($1, $2)", [username, 500], (err, result) => {
                release()
                if (err) {
                    Console.error("SEVERE: Error initializing user")
                    return
                }
                return result
            })
        })
    }

    // Get User score
    getUserScore(username) {
        pool.connect((err, client, release) => 
        {
            if (err) {
                Console.error("SEVERE: Error getting client from pool")
                return
            }
            client.query("SELECT * FROM user WHERE username == $1", username, (err, result) => {
                release()
                if(err) {
                    Console.error("SEVERE: Error retrieving user")
                    return err
                }
                if (result.rows.length == 0) {
                    async(initUser(username))
                    return 500
                }
                return result.rows[0].score
            })
        })
    }

    // Get User reports
    getuserReports(username) {
        pool.connect((err, client, release) => 
        {
            if (err) {
                Console.error("SEVERE: Error getting client from pool")
                return
            }
            client.query("SELECT * FROM reports WHERE username == $1", username, (err, result) => {
                release()
                if(err) {
                    Console.error("SEVERE: Error retrieving user")
                    return err
                }
                if (result.rows.length == 0) {
                    async(initUser(username))
                    return 500
                }
                return result.rows[0].score
            })
        })
    }

    // Report user
    reportUser(reportingUsername, reportedUsername, comment) {

    }
    
    // Praise user
    praiseUser(reportingUsername, reportedUsername, comment) {

    }

    // Remove report/praise
    removeReport(reportId) {

    }

    // Get Username ID
    getUserId(username) {
        pool.connect((err, client, release) => 
        {
            if (err) {
                Console.error("SEVERE: Error getting client from pool")
                return
            }
            client.query("SELECT * FROM user WHERE username == $1", username, (err, result) => {
                release()
                if(err) {
                    Console.error("SEVERE: Error retrieving user")
                    return err
                }
                if (result.rows.length == 0) {
                    initUser(username)
                    return 
                }
                return result.rows[0].id
            })
        })
    }

    /*  
    Datatypes:
        User:
            ID:GUID
            Username:string
            Score:int
        Report:
            ReportedUser:(User:GUID)
            ReportingUser:(User:GUID)
            IsPraise:Bool
            Comment:Text
    */
}